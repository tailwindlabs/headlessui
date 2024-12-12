'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
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
import { useElementSize } from '../../hooks/use-element-size'
import { useEvent } from '../../hooks/use-event'
import { useEventListener } from '../../hooks/use-event-listener'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useOnDisappear } from '../../hooks/use-on-disappear'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import {
  MainTreeProvider,
  useMainTreeNode,
  useRootContainers,
} from '../../hooks/use-root-containers'
import { useScrollLock } from '../../hooks/use-scroll-lock'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { Direction as TabDirection, useTabDirection } from '../../hooks/use-tab-direction'
import { transitionDataAttributes, useTransition } from '../../hooks/use-transition'
import { CloseProvider } from '../../internal/close-provider'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  useResolvedAnchor,
  type AnchorProps,
} from '../../internal/floating'
import { Hidden, HiddenFeatures } from '../../internal/hidden'
import {
  OpenClosedProvider,
  ResetOpenClosedProvider,
  State,
  useOpenClosed,
} from '../../internal/open-closed'
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
  useRender,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { Keys } from '../keyboard'
import { Portal, useNestedPortals } from '../portal/portal'

type MouseEvent<T> = Parameters<MouseEventHandler<T>>[0]

enum PopoverStates {
  Open,
  Closed,
}

interface StateDefinition {
  popoverState: PopoverStates

  buttons: MutableRefObject<Symbol[]>

  button: HTMLElement | null
  buttonId: string | null
  panel: HTMLElement | null
  panelId: string | null

  beforePanelSentinel: MutableRefObject<HTMLButtonElement | null>
  afterPanelSentinel: MutableRefObject<HTMLButtonElement | null>
  afterButtonSentinel: MutableRefObject<HTMLButtonElement | null>

  __demoMode: boolean
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
    return {
      ...state,
      popoverState: match(state.popoverState, {
        [PopoverStates.Open]: PopoverStates.Closed,
        [PopoverStates.Closed]: PopoverStates.Open,
      }),
      __demoMode: false,
    }
  },
  [ActionTypes.ClosePopover](state) {
    if (state.popoverState === PopoverStates.Closed) return state
    return { ...state, popoverState: PopoverStates.Closed, __demoMode: false }
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
  close: (
    focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null> | MouseEvent<HTMLElement>
  ) => void
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
  registerPopover: (registerBag: PopoverRegisterBag) => void
  unregisterPopover: (registerBag: PopoverRegisterBag) => void
  isFocusWithinPopoverGroup: () => boolean
  closeOthers: (buttonId: string) => void
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
  close: () => void
}
function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_POPOVER_TAG = 'div' as const
type PopoverRenderPropArg = {
  open: boolean
  close: (
    focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null> | MouseEvent<HTMLElement>
  ) => void
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
    afterButtonSentinel: createRef(),
  } as StateDefinition)
  let [
    {
      popoverState,
      button,
      buttonId,
      panel,
      panelId,
      beforePanelSentinel,
      afterPanelSentinel,
      afterButtonSentinel,
    },
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

    // Use another heuristic to try and calculate whether or not the focusable
    // elements are near each other (aka, following the default focus/tab order
    // from the browser). If they are then it doesn't really matter if they are
    // portalled or not because we can follow the default tab order. But if they
    // are not, then we can consider it being portalled so that we can ensure
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
  let mainTreeNode = useMainTreeNode(button)
  let root = useRootContainers({
    mainTreeNode,
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
      if (afterButtonSentinel.current?.contains?.(event.target)) return

      dispatch({ type: ActionTypes.ClosePopover })
    },
    true
  )

  // Handle outside click
  let outsideClickEnabled = popoverState === PopoverStates.Open
  useOutsideClick(outsideClickEnabled, root.resolveContainers, (event, target) => {
    dispatch({ type: ActionTypes.ClosePopover })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      button?.focus()
    }
  })

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

  let render = useRender()

  return (
    <MainTreeProvider node={mainTreeNode}>
      <FloatingProvider>
        <PopoverPanelContext.Provider value={null}>
          <PopoverContext.Provider value={reducerBag}>
            <PopoverAPIContext.Provider value={api}>
              <CloseProvider value={close}>
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
                  </PortalWrapper>
                </OpenClosedProvider>
              </CloseProvider>
            </PopoverAPIContext.Provider>
          </PopoverContext.Provider>
        </PopoverPanelContext.Provider>
      </FloatingProvider>
    </MainTreeProvider>
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
type ButtonRenderPropArg = {
  open: boolean
  active: boolean
  hover: boolean
  focus: boolean
  disabled: boolean
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
  let {
    id = `headlessui-popover-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props
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
    useEvent((button) => {
      if (isWithinPanel) return
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
    })
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
    if (disabled) return
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

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let visible = state.popoverState === PopoverStates.Open
  let slot = useMemo(() => {
    return {
      open: visible,
      active: active || visible,
      disabled,
      hover,
      focus,
      autofocus: autoFocus,
    } satisfies ButtonRenderPropArg
  }, [visible, hover, focus, active, disabled, autoFocus])

  let type = useResolveButtonType(props, state.button)
  let ourProps = isWithinPanel
    ? mergeProps(
        {
          ref: withinPanelButtonRef,
          type,
          onKeyDown: handleKeyDown,
          onClick: handleClick,
          disabled: disabled || undefined,
          autoFocus,
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
          disabled: disabled || undefined,
          autoFocus,
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

  let render = useRender()

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
          ref={state.afterButtonSentinel}
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

let DEFAULT_BACKDROP_TAG = 'div' as const
type BackdropRenderPropArg = {
  open: boolean
}
type BackdropPropsWeControl = 'aria-hidden'

let BackdropRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type PopoverBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<
  TTag,
  BackdropRenderPropArg,
  BackdropPropsWeControl,
  { transition?: boolean } & PropsForFeatures<typeof BackdropRenderFeatures>
>

export type PopoverOverlayProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> =
  PopoverBackdropProps<TTag>

function BackdropFn<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(
  props: PopoverBackdropProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-popover-backdrop-${internalId}`,
    transition = false,
    ...theirProps
  } = props
  let [{ popoverState }, dispatch] = usePopoverContext('Popover.Backdrop')

  // To improve the correctness of transitions (timing related race conditions),
  // we track the element locally to this component, instead of relying on the
  // context value. This way, the component can re-render independently of the
  // parent component when the `useTransition(…)` hook performs a state change.
  let [localBackdropElement, setLocalBackdropElement] = useState<HTMLElement | null>(null)

  let backdropRef = useSyncRefs(ref, setLocalBackdropElement)

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localBackdropElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : popoverState === PopoverStates.Open
  )

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    dispatch({ type: ActionTypes.ClosePopover })
  })

  let slot = useMemo(() => {
    return {
      open: popoverState === PopoverStates.Open,
    } satisfies BackdropRenderPropArg
  }, [popoverState])

  let ourProps = {
    ref: backdropRef,
    id,
    'aria-hidden': true,
    onClick: handleClick,
    ...transitionDataAttributes(transitionData),
  }

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BACKDROP_TAG,
    features: BackdropRenderFeatures,
    visible,
    name: 'Popover.Backdrop',
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
    portal?: boolean
    modal?: boolean
    transition?: boolean

    // ItemsRenderFeatures
    static?: boolean
    unmount?: boolean
  }
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: PopoverPanelProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-popover-panel-${internalId}`,
    focus = false,
    anchor: rawAnchor,
    portal = false,
    modal = false,
    transition = false,
    ...theirProps
  } = props

  let [state, dispatch] = usePopoverContext('Popover.Panel')
  let { close, isPortalled } = usePopoverAPIContext('Popover.Panel')

  let beforePanelSentinelId = `headlessui-focus-sentinel-before-${internalId}`
  let afterPanelSentinelId = `headlessui-focus-sentinel-after-${internalId}`

  let internalPanelRef = useRef<HTMLElement | null>(null)
  let anchor = useResolvedAnchor(rawAnchor)
  let [floatingRef, style] = useFloatingPanel(anchor)
  let getFloatingPanelProps = useFloatingPanelProps()

  // Always enable `portal` functionality, when `anchor` is enabled
  if (anchor) {
    portal = true
  }

  // To improve the correctness of transitions (timing related race conditions),
  // we track the element locally to this component, instead of relying on the
  // context value. This way, the component can re-render independently of the
  // parent component when the `useTransition(…)` hook performs a state change.
  let [localPanelElement, setLocalPanelElement] = useState<HTMLElement | null>(null)

  let panelRef = useSyncRefs(
    internalPanelRef,
    ref,
    anchor ? floatingRef : null,
    useEvent((panel) => dispatch({ type: ActionTypes.SetPanel, panel })),
    setLocalPanelElement
  )
  let portalOwnerDocument = useOwnerDocument(state.button)
  let ownerDocument = useOwnerDocument(internalPanelRef)

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.SetPanelId, panelId: id })
    return () => {
      dispatch({ type: ActionTypes.SetPanelId, panelId: null })
    }
  }, [id, dispatch])

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localPanelElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : state.popoverState === PopoverStates.Open
  )

  // Ensure we close the popover as soon as the button becomes hidden
  useOnDisappear(visible, state.button, () => {
    dispatch({ type: ActionTypes.ClosePopover })
  })

  // Enable scroll locking when the popover is visible, and `modal` is enabled
  let scrollLockEnabled = state.__demoMode ? false : modal && visible
  useScrollLock(scrollLockEnabled, ownerDocument)

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
  }, [state.__demoMode, focus, internalPanelRef.current, state.popoverState])

  let slot = useMemo(() => {
    return {
      open: state.popoverState === PopoverStates.Open,
      close,
    } satisfies PanelRenderPropArg
  }, [state.popoverState, close])

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
    style: {
      ...theirProps.style,
      ...style,
      '--button-width': useElementSize(state.button, true).width,
    } as React.CSSProperties,
    ...transitionDataAttributes(transitionData),
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
            if (
              element.dataset.headlessuiFocusGuard === 'true' ||
              localPanelElement?.contains(element)
            ) {
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

  let render = useRender()

  return (
    <ResetOpenClosedProvider>
      <PopoverPanelContext.Provider value={id}>
        <PopoverAPIContext.Provider value={{ close, isPortalled }}>
          <Portal
            enabled={portal ? props.static || visible : false}
            ownerDocument={portalOwnerDocument}
          >
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
          </Portal>
        </PopoverAPIContext.Provider>
      </PopoverPanelContext.Provider>
    </ResetOpenClosedProvider>
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

  let unregisterPopover = useEvent((registerBag: PopoverRegisterBag) => {
    setPopovers((existing) => {
      let idx = existing.indexOf(registerBag)
      if (idx !== -1) {
        let clone = existing.slice()
        clone.splice(idx, 1)
        return clone
      }
      return existing
    })
  })

  let registerPopover = useEvent((registerBag: PopoverRegisterBag) => {
    setPopovers((existing) => [...existing, registerBag])
    return () => unregisterPopover(registerBag)
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
    }),
    [registerPopover, unregisterPopover, isFocusWithinPopoverGroup, closeOthers]
  )

  let slot = useMemo(() => ({}) satisfies GroupRenderPropArg, [])

  let theirProps = props
  let ourProps = { ref: groupRef }

  let render = useRender()

  return (
    <MainTreeProvider>
      <PopoverGroupContext.Provider value={contextBag}>
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_GROUP_TAG,
          name: 'Popover.Group',
        })}
      </PopoverGroupContext.Provider>
    </MainTreeProvider>
  )
}

// ---

export interface _internal_ComponentPopover extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_POPOVER_TAG>(
    props: PopoverProps<TTag> & RefProp<typeof PopoverFn>
  ): React.JSX.Element
}

export interface _internal_ComponentPopoverButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: PopoverButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): React.JSX.Element
}

export interface _internal_ComponentPopoverBackdrop extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(
    props: PopoverBackdropProps<TTag> & RefProp<typeof BackdropFn>
  ): React.JSX.Element
}

export interface _internal_ComponentPopoverPanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: PopoverPanelProps<TTag> & RefProp<typeof PanelFn>
  ): React.JSX.Element
}

export interface _internal_ComponentPopoverGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
    props: PopoverGroupProps<TTag> & RefProp<typeof GroupFn>
  ): React.JSX.Element
}

let PopoverRoot = forwardRefWithAs(PopoverFn) as _internal_ComponentPopover
export let PopoverButton = forwardRefWithAs(ButtonFn) as _internal_ComponentPopoverButton
/** @deprecated use `<PopoverBackdrop>` instead of `<PopoverOverlay>` */
export let PopoverOverlay = forwardRefWithAs(BackdropFn) as _internal_ComponentPopoverBackdrop
export let PopoverBackdrop = forwardRefWithAs(BackdropFn) as _internal_ComponentPopoverBackdrop
export let PopoverPanel = forwardRefWithAs(PanelFn) as _internal_ComponentPopoverPanel
export let PopoverGroup = forwardRefWithAs(GroupFn) as _internal_ComponentPopoverGroup

export let Popover = Object.assign(PopoverRoot, {
  /** @deprecated use `<PopoverButton>` instead of `<Popover.Button>` */
  Button: PopoverButton,
  /** @deprecated use `<PopoverBackdrop>` instead of `<Popover.Backdrop>` */
  Backdrop: PopoverBackdrop,
  /** @deprecated use `<PopoverOverlay>` instead of `<Popover.Overlay>` */
  Overlay: PopoverOverlay,
  /** @deprecated use `<PopoverPanel>` instead of `<Popover.Panel>` */
  Panel: PopoverPanel,
  /** @deprecated use `<PopoverGroup>` instead of `<Popover.Group>` */
  Group: PopoverGroup,
})
