'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  createRef,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ContextType,
  type Dispatch,
  type ElementType,
  type MouseEventHandler,
  type MutableRefObject,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useEvent } from '../../hooks/use-event'
import { useEventListener } from '../../hooks/use-event-listener'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useMainTreeNode, useRootContainers } from '../../hooks/use-root-containers'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { Direction as TabDirection, useTabDirection } from '../../hooks/use-tab-direction'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  type AnchorProps,
} from '../../internal/floating'
import { Hidden, HiddenFeatures } from '../../internal/hidden'
import { Modal, ModalFeatures as ModalRenderFeatures, type ModalProps } from '../../internal/modal'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import {
  Focus,
  FocusResult,
  FocusableMode,
  focusIn,
  getFocusableElements,
  isFocusableElement,
} from '../../utils/focus-management'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { getOwnerDocument } from '../../utils/owner'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  render,
  useMergeRefsFn,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { FocusTrapFeatures } from '../focus-trap/focus-trap'
import { Keys } from '../keyboard'
import { Portal, useNestedPortals } from '../portal/portal'

type MouseEvent<T> = Parameters<MouseEventHandler<T>>[0]

enum PopoverStates {
  Open,
  Closed,
}

interface StateDefinition {
  __demoMode: boolean
  popoverState: PopoverStates

  buttons: MutableRefObject<Symbol[]>

  button: HTMLElement | null
  buttonId: string | null
  panel: HTMLElement | null
  panelId: string | null

  beforePanelSentinel: MutableRefObject<HTMLButtonElement | null>
  afterPanelSentinel: MutableRefObject<HTMLButtonElement | null>
}

enum ActionTypes {
  TogglePopover,
  ClosePopover,

  SetButton,
  SetButtonId,
  SetPanel,
  SetPanelId,
}

type Actions =
  | { type: ActionTypes.TogglePopover }
  | { type: ActionTypes.ClosePopover }
  | { type: ActionTypes.SetButton; button: HTMLElement | null }
  | { type: ActionTypes.SetButtonId; buttonId: string | null }
  | { type: ActionTypes.SetPanel; panel: HTMLElement | null }
  | { type: ActionTypes.SetPanelId; panelId: string | null }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.TogglePopover]: (state) => {
    let nextState = {
      ...state,
      popoverState: match(state.popoverState, {
        [PopoverStates.Open]: PopoverStates.Closed,
        [PopoverStates.Closed]: PopoverStates.Open,
      }),
    }

    /* We can turn off demo mode once we re-open the `Popover` */
    if (nextState.popoverState === PopoverStates.Open) {
      nextState.__demoMode = false
    }

    return nextState
  },
  [ActionTypes.ClosePopover](state) {
    if (state.popoverState === PopoverStates.Closed) return state
    return { ...state, popoverState: PopoverStates.Closed }
  },
  [ActionTypes.SetButton](state, action) {
    if (state.button === action.button) return state
    return { ...state, button: action.button }
  },
  [ActionTypes.SetButtonId](state, action) {
    if (state.buttonId === action.buttonId) return state
    return { ...state, buttonId: action.buttonId }
  },
  [ActionTypes.SetPanel](state, action) {
    if (state.panel === action.panel) return state
    return { ...state, panel: action.panel }
  },
  [ActionTypes.SetPanelId](state, action) {
    if (state.panelId === action.panelId) return state
    return { ...state, panelId: action.panelId }
  },
}

let PopoverContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
PopoverContext.displayName = 'PopoverContext'

function usePopoverContext(component: string) {
  let context = useContext(PopoverContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Popover /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverContext)
    throw err
  }
  return context
}

let PopoverAPIContext = createContext<{
  close(
    focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null> | MouseEvent<HTMLElement>
  ): void
  isPortalled: boolean
} | null>(null)
PopoverAPIContext.displayName = 'PopoverAPIContext'

function usePopoverAPIContext(component: string) {
  let context = useContext(PopoverAPIContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Popover /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverAPIContext)
    throw err
  }
  return context
}

let PopoverGroupContext = createContext<{
  registerPopover(registerbag: PopoverRegisterBag): void
  unregisterPopover(registerbag: PopoverRegisterBag): void
  isFocusWithinPopoverGroup(): boolean
  closeOthers(buttonId: string): void
  mainTreeNodeRef: MutableRefObject<HTMLElement | null>
} | null>(null)
PopoverGroupContext.displayName = 'PopoverGroupContext'

function usePopoverGroupContext() {
  return useContext(PopoverGroupContext)
}

let PopoverPanelContext = createContext<string | null>(null)
PopoverPanelContext.displayName = 'PopoverPanelContext'

function usePopoverPanelContext() {
  return useContext(PopoverPanelContext)
}

interface PopoverRegisterBag {
  buttonId: MutableRefObject<string | null>
  panelId: MutableRefObject<string | null>
  close(): void
}
function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_POPOVER_TAG = 'div' as const
type PopoverRenderPropArg = {
  open: boolean
  close(
    focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null> | MouseEvent<HTMLElement>
  ): void
}
type PopoverPropsWeControl = never

export type PopoverProps<TTag extends ElementType = typeof DEFAULT_POPOVER_TAG> = Props<
  TTag,
  PopoverRenderPropArg,
  PopoverPropsWeControl,
  {
    __demoMode?: boolean
  }
>

function PopoverFn<TTag extends ElementType = typeof DEFAULT_POPOVER_TAG>(
  props: PopoverProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { __demoMode = false, ...theirProps } = props
  let internalPopoverRef = useRef<HTMLElement | null>(null)
  let popoverRef = useSyncRefs(
    ref,
    optionalRef((ref) => {
      internalPopoverRef.current = ref
    })
  )

  let buttons = useRef([])
  let reducerBag = useReducer(stateReducer, {
    __demoMode,
    popoverState: __demoMode ? PopoverStates.Open : PopoverStates.Closed,
    buttons,
    button: null,
    buttonId: null,
    panel: null,
    panelId: null,
    beforePanelSentinel: createRef(),
    afterPanelSentinel: createRef(),
  } as StateDefinition)
  let [
    { popoverState, button, buttonId, panel, panelId, beforePanelSentinel, afterPanelSentinel },
    dispatch,
  ] = reducerBag

  let ownerDocument = useOwnerDocument(internalPopoverRef.current ?? button)

  let isPortalled = useMemo(() => {
    if (!button) return false
    if (!panel) return false

    // We are part of a different "root" tree, so therefore we can consider it portalled. This is a
    // heuristic because 3rd party tools could use some form of portal, typically rendered at the
    // end of the body but we don't have an actual reference to that.
    for (let root of document.querySelectorAll('body > *')) {
      if (Number(root?.contains(button)) ^ Number(root?.contains(panel))) {
        return true
      }
    }

    // Use another heuristic to try and calculate wether or not the focusable elements are near
    // eachother (aka, following the default focus/tab order from the browser). If they are then it
    // doesn't really matter if they are portalled or not because we can follow the default tab
    // order. But if they are not, then we can consider it being portalled so that we can ensure
    // that tab and shift+tab (hopefully) go to the correct spot.
    let elements = getFocusableElements()
    let buttonIdx = elements.indexOf(button)

    let beforeIdx = (buttonIdx + elements.length - 1) % elements.length
    let afterIdx = (buttonIdx + 1) % elements.length

    let beforeElement = elements[beforeIdx]
    let afterElement = elements[afterIdx]

    if (!panel.contains(beforeElement) && !panel.contains(afterElement)) {
      return true
    }

    // It may or may not be portalled, but we don't really know.
    return false
  }, [button, panel])

  let buttonIdRef = useLatestValue(buttonId)
  let panelIdRef = useLatestValue(panelId)

  let registerBag = useMemo(
    () => ({
      buttonId: buttonIdRef,
      panelId: panelIdRef,
      close: () => dispatch({ type: ActionTypes.ClosePopover }),
    }),
    [buttonIdRef, panelIdRef, dispatch]
  )

  let groupContext = usePopoverGroupContext()
  let registerPopover = groupContext?.registerPopover
  let isFocusWithinPopoverGroup = useEvent(() => {
    return (
      groupContext?.isFocusWithinPopoverGroup() ??
      (ownerDocument?.activeElement &&
        (button?.contains(ownerDocument.activeElement) ||
          panel?.contains(ownerDocument.activeElement)))
    )
  })

  useEffect(() => registerPopover?.(registerBag), [registerPopover, registerBag])

  let [portals, PortalWrapper] = useNestedPortals()
  let root = useRootContainers({
    mainTreeNodeRef: groupContext?.mainTreeNodeRef,
    portals,
    defaultContainers: [button, panel],
  })

  // Handle focus out
  useEventListener(
    ownerDocument?.defaultView,
    'focus',
    (event) => {
      if (event.target === window) return
      if (!(event.target instanceof HTMLElement)) return
      if (popoverState !== PopoverStates.Open) return
      if (isFocusWithinPopoverGroup()) return
      if (!button) return
      if (!panel) return
      if (root.contains(event.target)) return
      if (beforePanelSentinel.current?.contains?.(event.target)) return
      if (afterPanelSentinel.current?.contains?.(event.target)) return

      dispatch({ type: ActionTypes.ClosePopover })
    },
    true
  )

  // Handle outside click
  useOutsideClick(
    root.resolveContainers,
    (event, target) => {
      dispatch({ type: ActionTypes.ClosePopover })

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        button?.focus()
      }
    },
    popoverState === PopoverStates.Open
  )

  let close = useEvent(
    (
      focusableElement?:
        | HTMLElement
        | MutableRefObject<HTMLElement | null>
        | MouseEvent<HTMLElement>
    ) => {
      dispatch({ type: ActionTypes.ClosePopover })

      let restoreElement = (() => {
        if (!focusableElement) return button
        if (focusableElement instanceof HTMLElement) return focusableElement
        if ('current' in focusableElement && focusableElement.current instanceof HTMLElement)
          return focusableElement.current

        return button
      })()

      restoreElement?.focus()
    }
  )

  let api = useMemo<ContextType<typeof PopoverAPIContext>>(
    () => ({ close, isPortalled }),
    [close, isPortalled]
  )

  let slot = useMemo(
    () => ({ open: popoverState === PopoverStates.Open, close }) satisfies PopoverRenderPropArg,
    [popoverState, close]
  )

  let ourProps = { ref: popoverRef }

  return (
    <FloatingProvider>
      <PopoverPanelContext.Provider value={null}>
        <PopoverContext.Provider value={reducerBag}>
          <PopoverAPIContext.Provider value={api}>
            <OpenClosedProvider
              value={match(popoverState, {
                [PopoverStates.Open]: State.Open,
                [PopoverStates.Closed]: State.Closed,
              })}
            >
              <PortalWrapper>
                {render({
                  ourProps,
                  theirProps,
                  slot,
                  defaultTag: DEFAULT_POPOVER_TAG,
                  name: 'Popover',
                })}
                <root.MainTreeNode />
              </PortalWrapper>
            </OpenClosedProvider>
          </PopoverAPIContext.Provider>
        </PopoverContext.Provider>
      </PopoverPanelContext.Provider>
    </FloatingProvider>
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
type ButtonRenderPropArg = {
  open: boolean
  active: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
}
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded'

export type PopoverButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    disabled?: boolean
    autoFocus?: boolean
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: PopoverButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let { id = `headlessui-popover-button-${internalId}`, ...theirProps } = props
  let [state, dispatch] = usePopoverContext('Popover.Button')
  let { isPortalled } = usePopoverAPIContext('Popover.Button')
  let internalButtonRef = useRef<HTMLButtonElement | null>(null)

  let sentinelId = `headlessui-focus-sentinel-${useId()}`

  let groupContext = usePopoverGroupContext()
  let closeOthers = groupContext?.closeOthers

  let panelContext = usePopoverPanelContext()

  // A button inside a panel will just have "close" functionality, no "open" functionality. However,
  // if a `Popover.Button` is rendered inside a `Popover` which in turn is rendered inside a
  // `Popover.Panel` (aka nested popovers), then we need to make sure that the button is able to
  // open the nested popover.
  //
  // The `Popover` itself will also render a `PopoverPanelContext` but with a value of `null`. That
  // way we don't need to keep track of _which_ `Popover.Panel` (if at all) we are in, we can just
  // check if we are in a `Popover.Panel` or not since this will always point to the nearest one and
  // won't pierce through `Popover` components themselves.
  let isWithinPanel = panelContext !== null

  useEffect(() => {
    if (isWithinPanel) return
    dispatch({ type: ActionTypes.SetButtonId, buttonId: id })
    return () => {
      dispatch({ type: ActionTypes.SetButtonId, buttonId: null })
    }
  }, [isWithinPanel, id, dispatch])

  // This is a little bit different compared to the `id` we already have. The goal is to have a very
  // unique identifier for this specific component. This can be achieved with the `id` from above.
  //
  // However, the difference is for React 17 and lower where the `useId` hook doesn't exist yet.
  // There we will generate a unique ID based on a simple counter, but for SSR this will result in
  // `undefined` first, later it is patched to be a unique ID. The problem is that this patching
  // happens after the component is rendered and therefore there is a moment in time where multiple
  // buttons have the exact same ID and the `state.buttons` would result in something like:
  //
  // ```js
  // ['headlessui-popover-button-undefined', 'headlessui-popover-button-1']
  // ```
  //
  // With this approach we guarantee that there is a unique value for each button.
  let [uniqueIdentifier] = useState(() => Symbol())

  let buttonRef = useSyncRefs(
    internalButtonRef,
    ref,
    useFloatingReference(),
    isWithinPanel
      ? null
      : (button) => {
          if (button) {
            state.buttons.current.push(uniqueIdentifier)
          } else {
            let idx = state.buttons.current.indexOf(uniqueIdentifier)
            if (idx !== -1) state.buttons.current.splice(idx, 1)
          }

          if (state.buttons.current.length > 1) {
            console.warn(
              'You are already using a <Popover.Button /> but only 1 <Popover.Button /> is supported.'
            )
          }

          button && dispatch({ type: ActionTypes.SetButton, button })
        }
  )
  let withinPanelButtonRef = useSyncRefs(internalButtonRef, ref)
  let ownerDocument = useOwnerDocument(internalButtonRef)

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isWithinPanel) {
      if (state.popoverState === PopoverStates.Closed) return
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault() // Prevent triggering a *click* event
          // @ts-expect-error
          event.target.click?.()
          dispatch({ type: ActionTypes.ClosePopover })
          state.button?.focus() // Re-focus the original opening Button
          break
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault() // Prevent triggering a *click* event
          event.stopPropagation()
          if (state.popoverState === PopoverStates.Closed) closeOthers?.(state.buttonId!)
          dispatch({ type: ActionTypes.TogglePopover })
          break

        case Keys.Escape:
          if (state.popoverState !== PopoverStates.Open) return closeOthers?.(state.buttonId!)
          if (!internalButtonRef.current) return
          if (
            ownerDocument?.activeElement &&
            !internalButtonRef.current.contains(ownerDocument.activeElement)
          ) {
            return
          }
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.ClosePopover })
          break
      }
    }
  })

  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isWithinPanel) return
    if (event.key === Keys.Space) {
      // Required for firefox, event.preventDefault() in handleKeyDown for
      // the Space key doesn't cancel the handleKeyUp, which in turn
      // triggers a *click*.
      event.preventDefault()
    }
  })

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return
    if (props.disabled) return
    if (isWithinPanel) {
      dispatch({ type: ActionTypes.ClosePopover })
      state.button?.focus() // Re-focus the original opening Button
    } else {
      event.preventDefault()
      event.stopPropagation()
      if (state.popoverState === PopoverStates.Closed) closeOthers?.(state.buttonId!)
      dispatch({ type: ActionTypes.TogglePopover })
      state.button?.focus()
    }
  })

  let handleMouseDown = useEvent((event: ReactMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: props.disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: props.disabled ?? false })

  let visible = state.popoverState === PopoverStates.Open
  let slot = useMemo(
    () =>
      ({
        open: visible,
        active: active || visible,
        hover,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies ButtonRenderPropArg,
    [visible, hover, focus, active, props.autoFocus]
  )

  let type = useResolveButtonType(props, internalButtonRef)
  let ourProps = isWithinPanel
    ? mergeProps(
        {
          ref: withinPanelButtonRef,
          type,
          onKeyDown: handleKeyDown,
          onClick: handleClick,
        },
        focusProps,
        hoverProps,
        pressProps
      )
    : mergeProps(
        {
          ref: buttonRef,
          id: state.buttonId,
          type,
          'aria-expanded': state.popoverState === PopoverStates.Open,
          'aria-controls': state.panel ? state.panelId : undefined,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
          onClick: handleClick,
          onMouseDown: handleMouseDown,
        },
        focusProps,
        hoverProps,
        pressProps
      )

  let direction = useTabDirection()
  let handleFocus = useEvent(() => {
    let el = state.panel as HTMLElement
    if (!el) return

    function run() {
      let result = match(direction.current, {
        [TabDirection.Forwards]: () => focusIn(el, Focus.First),
        [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
      })

      if (result === FocusResult.Error) {
        focusIn(
          getFocusableElements().filter((el) => el.dataset.headlessuiFocusGuard !== 'true'),
          match(direction.current, {
            [TabDirection.Forwards]: Focus.Next,
            [TabDirection.Backwards]: Focus.Previous,
          }),
          { relativeTo: state.button }
        )
      }
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === 'test') {
      microTask(run)
    } else {
      run()
    }
  })

  return (
    <>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_BUTTON_TAG,
        name: 'Popover.Button',
      })}
      {visible && !isWithinPanel && isPortalled && (
        <Hidden
          id={sentinelId}
          features={HiddenFeatures.Focusable}
          data-headlessui-focus-guard
          as="button"
          type="button"
          onFocus={handleFocus}
        />
      )}
    </>
  )
}

// ---

let DEFAULT_OVERLAY_TAG = 'div' as const
type OverlayRenderPropArg = {
  open: boolean
}
type OverlayPropsWeControl = 'aria-hidden'

let OverlayRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type PopoverOverlayProps<TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG> = Props<
  TTag,
  OverlayRenderPropArg,
  OverlayPropsWeControl,
  PropsForFeatures<typeof OverlayRenderFeatures>
>

function OverlayFn<TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG>(
  props: PopoverOverlayProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let { id = `headlessui-popover-overlay-${internalId}`, ...theirProps } = props
  let [{ popoverState }, dispatch] = usePopoverContext('Popover.Overlay')
  let overlayRef = useSyncRefs(ref)

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return popoverState === PopoverStates.Open
  })()

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    dispatch({ type: ActionTypes.ClosePopover })
  })

  let slot = useMemo(
    () => ({ open: popoverState === PopoverStates.Open }) satisfies OverlayRenderPropArg,
    [popoverState]
  )

  let ourProps = {
    ref: overlayRef,
    id,
    'aria-hidden': true,
    onClick: handleClick,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OVERLAY_TAG,
    features: OverlayRenderFeatures,
    visible,
    name: 'Popover.Overlay',
  })
}

// ---

let DEFAULT_PANEL_TAG = 'div' as const
type PanelRenderPropArg = {
  open: boolean
  close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void
}

let PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

type PanelPropsWeControl = 'tabIndex'

export type PopoverPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
  TTag,
  PanelRenderPropArg,
  PanelPropsWeControl,
  {
    focus?: boolean
    anchor?: AnchorProps
    modal?: boolean

    // ItemsRenderFeatures
    static?: boolean
    unmount?: boolean
  }
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: PopoverPanelProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-popover-panel-${internalId}`,
    focus = false,
    anchor,
    modal,
    ...theirProps
  } = props

  let [state, dispatch] = usePopoverContext('Popover.Panel')
  let { close, isPortalled } = usePopoverAPIContext('Popover.Panel')

  let beforePanelSentinelId = `headlessui-focus-sentinel-before-${internalId}`
  let afterPanelSentinelId = `headlessui-focus-sentinel-after-${internalId}`

  let internalPanelRef = useRef<HTMLDivElement | null>(null)
  let [floatingRef, style] = useFloatingPanel(anchor)
  let getFloatingPanelProps = useFloatingPanelProps()

  // Always use `modal` when `anchor` is passed in
  if (anchor != null && modal == null) {
    modal = true
  } else if (modal == null) {
    modal = false
  }

  let panelRef = useSyncRefs(internalPanelRef, ref, anchor ? floatingRef : null, (panel) => {
    dispatch({ type: ActionTypes.SetPanel, panel })
  })
  let ownerDocument = useOwnerDocument(internalPanelRef)
  let mergeRefs = useMergeRefsFn()

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.SetPanelId, panelId: id })
    return () => {
      dispatch({ type: ActionTypes.SetPanelId, panelId: null })
    }
  }, [id, dispatch])

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return state.popoverState === PopoverStates.Open
  })()

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Escape:
        if (state.popoverState !== PopoverStates.Open) return
        if (!internalPanelRef.current) return
        if (
          ownerDocument?.activeElement &&
          !internalPanelRef.current.contains(ownerDocument.activeElement)
        ) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: ActionTypes.ClosePopover })
        state.button?.focus()
        break
    }
  })

  // Unlink on "unmount" children
  useEffect(() => {
    if (props.static) return

    if (state.popoverState === PopoverStates.Closed && (props.unmount ?? true)) {
      dispatch({ type: ActionTypes.SetPanel, panel: null })
    }
  }, [state.popoverState, props.unmount, props.static, dispatch])

  // Move focus within panel
  useEffect(() => {
    if (state.__demoMode) return
    if (!focus) return
    if (state.popoverState !== PopoverStates.Open) return
    if (!internalPanelRef.current) return

    let activeElement = ownerDocument?.activeElement as HTMLElement
    if (internalPanelRef.current.contains(activeElement)) return // Already focused within Dialog

    focusIn(internalPanelRef.current, Focus.First)
  }, [state.__demoMode, focus, internalPanelRef, state.popoverState])

  let slot = useMemo(
    () => ({ open: state.popoverState === PopoverStates.Open, close }) satisfies PanelRenderPropArg,
    [state, close]
  )

  let ourProps: Record<string, any> = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    ref: panelRef,
    id,
    onKeyDown: handleKeyDown,
    onBlur:
      focus && state.popoverState === PopoverStates.Open
        ? (event: ReactFocusEvent) => {
            let el = event.relatedTarget as HTMLElement
            if (!el) return
            if (!internalPanelRef.current) return
            if (internalPanelRef.current?.contains(el)) return

            dispatch({ type: ActionTypes.ClosePopover })

            if (
              state.beforePanelSentinel.current?.contains?.(el) ||
              state.afterPanelSentinel.current?.contains?.(el)
            ) {
              el.focus({ preventScroll: true })
            }
          }
        : undefined,
    tabIndex: -1,
    ...(style ? { style } : {}),
  })

  let direction = useTabDirection()
  let handleBeforeFocus = useEvent(() => {
    let el = internalPanelRef.current as HTMLElement
    if (!el) return

    function run() {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          // Try to focus the first thing in the panel. But if that fails (e.g.: there are no
          // focusable elements, then we can move outside of the panel)
          let result = focusIn(el, Focus.First)
          if (result === FocusResult.Error) {
            state.afterPanelSentinel.current?.focus()
          }
        },
        [TabDirection.Backwards]: () => {
          // Coming from the Popover.Panel (which is portalled to somewhere else). Let's redirect
          // the focus to the Popover.Button again.
          state.button?.focus({ preventScroll: true })
        },
      })
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === 'test') {
      microTask(run)
    } else {
      run()
    }
  })

  let handleAfterFocus = useEvent(() => {
    let el = internalPanelRef.current as HTMLElement
    if (!el) return

    function run() {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          if (!state.button) return

          let elements = getFocusableElements()

          let idx = elements.indexOf(state.button)
          let before = elements.slice(0, idx + 1)
          let after = elements.slice(idx + 1)

          let combined = [...after, ...before]

          // Ignore sentinel buttons and items inside the panel
          for (let element of combined.slice()) {
            if (element.dataset.headlessuiFocusGuard === 'true' || state.panel?.contains(element)) {
              let idx = combined.indexOf(element)
              if (idx !== -1) combined.splice(idx, 1)
            }
          }

          focusIn(combined, Focus.First, { sorted: false })
        },
        [TabDirection.Backwards]: () => {
          // Try to focus the first thing in the panel. But if that fails (e.g.: there are no
          // focusable elements, then we can move outside of the panel)
          let result = focusIn(el, Focus.Previous)
          if (result === FocusResult.Error) {
            state.button?.focus()
          }
        },
      })
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === 'test') {
      microTask(run)
    } else {
      run()
    }
  })

  let Wrapper = modal ? Modal : anchor ? Portal : Fragment
  let wrapperProps = modal
    ? ({
        focusTrapFeatures: FocusTrapFeatures.None,
        features: ModalRenderFeatures.ScrollLock,
        enabled: state.popoverState === PopoverStates.Open,
      } satisfies ModalProps)
    : {}

  if (Wrapper === Portal || Wrapper === Modal) {
    isPortalled = true
  }

  return (
    <PopoverPanelContext.Provider value={id}>
      <PopoverAPIContext.Provider value={{ close, isPortalled }}>
        <Wrapper {...wrapperProps}>
          {visible && isPortalled && (
            <Hidden
              id={beforePanelSentinelId}
              ref={state.beforePanelSentinel}
              features={HiddenFeatures.Focusable}
              data-headlessui-focus-guard
              as="button"
              type="button"
              onFocus={handleBeforeFocus}
            />
          )}
          {render({
            mergeRefs,
            ourProps,
            theirProps,
            slot,
            defaultTag: DEFAULT_PANEL_TAG,
            features: PanelRenderFeatures,
            visible,
            name: 'Popover.Panel',
          })}
          {visible && isPortalled && (
            <Hidden
              id={afterPanelSentinelId}
              ref={state.afterPanelSentinel}
              features={HiddenFeatures.Focusable}
              data-headlessui-focus-guard
              as="button"
              type="button"
              onFocus={handleAfterFocus}
            />
          )}
        </Wrapper>
      </PopoverAPIContext.Provider>
    </PopoverPanelContext.Provider>
  )
}

// ---

let DEFAULT_GROUP_TAG = 'div' as const
type GroupRenderPropArg = {}
type GroupPropsWeControl = never

export type PopoverGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<
  TTag,
  GroupRenderPropArg,
  GroupPropsWeControl
>

function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
  props: PopoverGroupProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalGroupRef = useRef<HTMLElement | null>(null)
  let groupRef = useSyncRefs(internalGroupRef, ref)
  let [popovers, setPopovers] = useState<PopoverRegisterBag[]>([])
  let root = useMainTreeNode()

  let unregisterPopover = useEvent((registerbag: PopoverRegisterBag) => {
    setPopovers((existing) => {
      let idx = existing.indexOf(registerbag)
      if (idx !== -1) {
        let clone = existing.slice()
        clone.splice(idx, 1)
        return clone
      }
      return existing
    })
  })

  let registerPopover = useEvent((registerbag: PopoverRegisterBag) => {
    setPopovers((existing) => [...existing, registerbag])
    return () => unregisterPopover(registerbag)
  })

  let isFocusWithinPopoverGroup = useEvent(() => {
    let ownerDocument = getOwnerDocument(internalGroupRef)
    if (!ownerDocument) return false
    let element = ownerDocument.activeElement

    if (internalGroupRef.current?.contains(element)) return true

    // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.
    return popovers.some((bag) => {
      return (
        ownerDocument!.getElementById(bag.buttonId.current!)?.contains(element) ||
        ownerDocument!.getElementById(bag.panelId.current!)?.contains(element)
      )
    })
  })

  let closeOthers = useEvent((buttonId: string) => {
    for (let popover of popovers) {
      if (popover.buttonId.current !== buttonId) popover.close()
    }
  })

  let contextBag = useMemo<ContextType<typeof PopoverGroupContext>>(
    () => ({
      registerPopover: registerPopover,
      unregisterPopover: unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers,
      mainTreeNodeRef: root.mainTreeNodeRef,
    }),
    [
      registerPopover,
      unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers,
      root.mainTreeNodeRef,
    ]
  )

  let slot = useMemo(() => ({}) satisfies GroupRenderPropArg, [])

  let theirProps = props
  let ourProps = { ref: groupRef }

  return (
    <PopoverGroupContext.Provider value={contextBag}>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_GROUP_TAG,
        name: 'Popover.Group',
      })}
      <root.MainTreeNode />
    </PopoverGroupContext.Provider>
  )
}

// ---

export interface _internal_ComponentPopover extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_POPOVER_TAG>(
    props: PopoverProps<TTag> & RefProp<typeof PopoverFn>
  ): JSX.Element
}

export interface _internal_ComponentPopoverButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: PopoverButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

export interface _internal_ComponentPopoverOverlay extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG>(
    props: PopoverOverlayProps<TTag> & RefProp<typeof OverlayFn>
  ): JSX.Element
}

export interface _internal_ComponentPopoverPanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: PopoverPanelProps<TTag> & RefProp<typeof PanelFn>
  ): JSX.Element
}

export interface _internal_ComponentPopoverGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
    props: PopoverGroupProps<TTag> & RefProp<typeof GroupFn>
  ): JSX.Element
}

let PopoverRoot = forwardRefWithAs(PopoverFn) as unknown as _internal_ComponentPopover
export let PopoverButton = forwardRefWithAs(ButtonFn) as unknown as _internal_ComponentPopoverButton
export let PopoverOverlay = forwardRefWithAs(
  OverlayFn
) as unknown as _internal_ComponentPopoverOverlay
export let PopoverPanel = forwardRefWithAs(PanelFn) as unknown as _internal_ComponentPopoverPanel
export let PopoverGroup = forwardRefWithAs(GroupFn) as unknown as _internal_ComponentPopoverGroup

export let Popover = Object.assign(PopoverRoot, {
  Button: PopoverButton,
  Overlay: PopoverOverlay,
  Panel: PopoverPanel,
  Group: PopoverGroup,
})
