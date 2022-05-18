import React, {
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,

  // Types
  ContextType,
  Dispatch,
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  Ref,
} from 'react'

import { Props } from '../../types'
import { match } from '../../utils/match'
import { forwardRefWithAs, render, Features, PropsForFeatures } from '../../utils/render'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import {
  getFocusableElements,
  Focus,
  focusIn,
  isFocusableElement,
  FocusableMode,
} from '../../utils/focus-management'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { getOwnerDocument } from '../../utils/owner'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useEventListener } from '../../hooks/use-event-listener'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { useEvent } from '../../hooks/use-event'
import { useTabDirection, Direction as TabDirection } from '../../hooks/use-tab-direction'
import { microTask } from '../../utils/micro-task'

enum PopoverStates {
  Open,
  Closed,
}

interface StateDefinition {
  popoverState: PopoverStates

  button: HTMLElement | null
  buttonId: string
  panel: HTMLElement | null
  panelId: string

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
  | { type: ActionTypes.SetButtonId; buttonId: string }
  | { type: ActionTypes.SetPanel; panel: HTMLElement | null }
  | { type: ActionTypes.SetPanelId; panelId: string }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.TogglePopover]: (state) => ({
    ...state,
    popoverState: match(state.popoverState, {
      [PopoverStates.Open]: PopoverStates.Closed,
      [PopoverStates.Closed]: PopoverStates.Open,
    }),
  }),
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
  close(focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>): void
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
  buttonId: string
  panelId: string
  close(): void
}
function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_POPOVER_TAG = 'div' as const
interface PopoverRenderPropArg {
  open: boolean
  close(focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>): void
}

let PopoverRoot = forwardRefWithAs(function Popover<
  TTag extends ElementType = typeof DEFAULT_POPOVER_TAG
>(props: Props<TTag, PopoverRenderPropArg>, ref: Ref<HTMLElement>) {
  let buttonId = `headlessui-popover-button-${useId()}`
  let panelId = `headlessui-popover-panel-${useId()}`
  let internalPopoverRef = useRef<HTMLElement | null>(null)
  let popoverRef = useSyncRefs(
    ref,
    optionalRef((ref) => {
      internalPopoverRef.current = ref
    })
  )

  let reducerBag = useReducer(stateReducer, {
    popoverState: PopoverStates.Closed,
    button: null,
    buttonId,
    panel: null,
    panelId,
    beforePanelSentinel: createRef(),
    afterPanelSentinel: createRef(),
  } as StateDefinition)
  let [{ popoverState, button, panel, beforePanelSentinel, afterPanelSentinel }, dispatch] =
    reducerBag

  let ownerDocument = useOwnerDocument(internalPopoverRef.current ?? button)

  useEffect(() => dispatch({ type: ActionTypes.SetButtonId, buttonId }), [buttonId, dispatch])
  useEffect(() => dispatch({ type: ActionTypes.SetPanelId, panelId }), [panelId, dispatch])

  let isPortalled = useMemo(() => {
    if (!button) return false
    if (!panel) return false

    for (let root of document.querySelectorAll('body > *')) {
      if (Number(root?.contains(button)) ^ Number(root?.contains(panel))) {
        return true
      }
    }

    return false
  }, [button, panel])

  let registerBag = useMemo(
    () => ({ buttonId, panelId, close: () => dispatch({ type: ActionTypes.ClosePopover }) }),
    [buttonId, panelId, dispatch]
  )

  let groupContext = usePopoverGroupContext()
  let registerPopover = groupContext?.registerPopover
  let isFocusWithinPopoverGroup = useCallback(() => {
    return (
      groupContext?.isFocusWithinPopoverGroup() ??
      (ownerDocument?.activeElement &&
        (button?.contains(ownerDocument.activeElement) ||
          panel?.contains(ownerDocument.activeElement)))
    )
  }, [groupContext, button, panel])

  useEffect(() => registerPopover?.(registerBag), [registerPopover, registerBag])

  // Handle focus out
  useEventListener(
    ownerDocument?.defaultView,
    'focus',
    (event) => {
      if (popoverState !== PopoverStates.Open) return
      if (isFocusWithinPopoverGroup()) return
      if (!button) return
      if (!panel) return
      if (beforePanelSentinel.current?.contains?.(event.target as HTMLElement)) return
      if (afterPanelSentinel.current?.contains?.(event.target as HTMLElement)) return

      dispatch({ type: ActionTypes.ClosePopover })
    },
    true
  )

  // Handle outside click
  useOutsideClick([button, panel], (event, target) => {
    if (popoverState !== PopoverStates.Open) return

    dispatch({ type: ActionTypes.ClosePopover })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      button?.focus()
    }
  })

  let close = useCallback(
    (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => {
      dispatch({ type: ActionTypes.ClosePopover })

      let restoreElement = (() => {
        if (!focusableElement) return button
        if (focusableElement instanceof HTMLElement) return focusableElement
        if (focusableElement.current instanceof HTMLElement) return focusableElement.current

        return button
      })()

      restoreElement?.focus()
    },
    [dispatch, button]
  )

  let api = useMemo<ContextType<typeof PopoverAPIContext>>(
    () => ({ close, isPortalled }),
    [close, isPortalled]
  )

  let slot = useMemo<PopoverRenderPropArg>(
    () => ({ open: popoverState === PopoverStates.Open, close }),
    [popoverState, close]
  )

  let theirProps = props
  let ourProps = { ref: popoverRef }

  return (
    <PopoverContext.Provider value={reducerBag}>
      <PopoverAPIContext.Provider value={api}>
        <OpenClosedProvider
          value={match(popoverState, {
            [PopoverStates.Open]: State.Open,
            [PopoverStates.Closed]: State.Closed,
          })}
        >
          {render({
            ourProps,
            theirProps,
            slot,
            defaultTag: DEFAULT_POPOVER_TAG,
            name: 'Popover',
          })}
        </OpenClosedProvider>
      </PopoverAPIContext.Provider>
    </PopoverContext.Provider>
  )
})

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
}
type ButtonPropsWeControl =
  | 'id'
  | 'type'
  | 'aria-expanded'
  | 'aria-controls'
  | 'onKeyDown'
  | 'onClick'

let Button = forwardRefWithAs(function Button<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: Ref<HTMLButtonElement>
) {
  let [state, dispatch] = usePopoverContext('Popover.Button')
  let { isPortalled } = usePopoverAPIContext('Popover.Button')
  let internalButtonRef = useRef<HTMLButtonElement | null>(null)

  let sentinelId = `headlessui-focus-sentinel-${useId()}`

  let groupContext = usePopoverGroupContext()
  let closeOthers = groupContext?.closeOthers

  let panelContext = usePopoverPanelContext()
  let isWithinPanel = panelContext === null ? false : panelContext === state.panelId

  let buttonRef = useSyncRefs(
    internalButtonRef,
    ref,
    isWithinPanel ? null : (button) => dispatch({ type: ActionTypes.SetButton, button })
  )
  let withinPanelButtonRef = useSyncRefs(internalButtonRef, ref)
  let ownerDocument = useOwnerDocument(internalButtonRef)

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
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
            if (state.popoverState === PopoverStates.Closed) closeOthers?.(state.buttonId)
            dispatch({ type: ActionTypes.TogglePopover })
            break

          case Keys.Escape:
            if (state.popoverState !== PopoverStates.Open) return closeOthers?.(state.buttonId)
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
    },
    [
      dispatch,
      state.popoverState,
      state.buttonId,
      state.button,
      state.panel,
      internalButtonRef,
      closeOthers,
      isWithinPanel,
    ]
  )

  let handleKeyUp = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (isWithinPanel) return
      if (event.key === Keys.Space) {
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
      }
    },
    [isWithinPanel]
  )

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return
      if (props.disabled) return
      if (isWithinPanel) {
        dispatch({ type: ActionTypes.ClosePopover })
        state.button?.focus() // Re-focus the original opening Button
      } else {
        event.preventDefault()
        event.stopPropagation()
        if (state.popoverState === PopoverStates.Closed) closeOthers?.(state.buttonId)
        state.button?.focus()
        dispatch({ type: ActionTypes.TogglePopover })
      }
    },
    [
      dispatch,
      state.button,
      state.popoverState,
      state.buttonId,
      props.disabled,
      closeOthers,
      isWithinPanel,
    ]
  )

  let visible = state.popoverState === PopoverStates.Open
  let slot = useMemo<ButtonRenderPropArg>(() => ({ open: visible }), [visible])

  let type = useResolveButtonType(props, internalButtonRef)
  let theirProps = props
  let ourProps = isWithinPanel
    ? {
        ref: withinPanelButtonRef,
        type,
        onKeyDown: handleKeyDown,
        onClick: handleClick,
      }
    : {
        ref: buttonRef,
        id: state.buttonId,
        type,
        'aria-expanded': props.disabled ? undefined : state.popoverState === PopoverStates.Open,
        'aria-controls': state.panel ? state.panelId : undefined,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp,
        onClick: handleClick,
      }

  let direction = useTabDirection()
  let handleFocus = useEvent(() => {
    let el = state.panel as HTMLElement
    if (!el) return

    function run() {
      match(direction.current, {
        [TabDirection.Forwards]: () => focusIn(el, Focus.First),
        [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
      })
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
          as="button"
          type="button"
          onFocus={handleFocus}
        />
      )}
    </>
  )
})

// ---

let DEFAULT_OVERLAY_TAG = 'div' as const
interface OverlayRenderPropArg {
  open: boolean
}
type OverlayPropsWeControl = 'id' | 'aria-hidden' | 'onClick'

let OverlayRenderFeatures = Features.RenderStrategy | Features.Static

let Overlay = forwardRefWithAs(function Overlay<
  TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG
>(
  props: Props<TTag, OverlayRenderPropArg, OverlayPropsWeControl> &
    PropsForFeatures<typeof OverlayRenderFeatures>,
  ref: Ref<HTMLDivElement>
) {
  let [{ popoverState }, dispatch] = usePopoverContext('Popover.Overlay')
  let overlayRef = useSyncRefs(ref)

  let id = `headlessui-popover-overlay-${useId()}`

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return popoverState === PopoverStates.Open
  })()

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      dispatch({ type: ActionTypes.ClosePopover })
    },
    [dispatch]
  )

  let slot = useMemo<OverlayRenderPropArg>(
    () => ({ open: popoverState === PopoverStates.Open }),
    [popoverState]
  )

  let theirProps = props
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
})

// ---

let DEFAULT_PANEL_TAG = 'div' as const
interface PanelRenderPropArg {
  open: boolean
  close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void
}
type PanelPropsWeControl = 'id' | 'onKeyDown'

let PanelRenderFeatures = Features.RenderStrategy | Features.Static

let Panel = forwardRefWithAs(function Panel<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: Props<TTag, PanelRenderPropArg, PanelPropsWeControl> &
    PropsForFeatures<typeof PanelRenderFeatures> & {
      focus?: boolean
    },
  ref: Ref<HTMLDivElement>
) {
  let { focus = false, ...theirProps } = props

  let [state, dispatch] = usePopoverContext('Popover.Panel')
  let { close, isPortalled } = usePopoverAPIContext('Popover.Panel')

  let beforePanelSentinelId = `headlessui-focus-sentinel-before-${useId()}`
  let afterPanelSentinelId = `headlessui-focus-sentinel-after-${useId()}`

  let internalPanelRef = useRef<HTMLDivElement | null>(null)
  let panelRef = useSyncRefs(internalPanelRef, ref, (panel) => {
    dispatch({ type: ActionTypes.SetPanel, panel })
  })
  let ownerDocument = useOwnerDocument(internalPanelRef)

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return state.popoverState === PopoverStates.Open
  })()

  let handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [state, internalPanelRef, dispatch]
  )

  // Unlink on "unmount" children
  useEffect(() => {
    if (props.static) return

    if (state.popoverState === PopoverStates.Closed && (props.unmount ?? true)) {
      dispatch({ type: ActionTypes.SetPanel, panel: null })
    }
  }, [state.popoverState, props.unmount, props.static, dispatch])

  // Move focus within panel
  useEffect(() => {
    if (!focus) return
    if (state.popoverState !== PopoverStates.Open) return
    if (!internalPanelRef.current) return

    let activeElement = ownerDocument?.activeElement as HTMLElement
    if (internalPanelRef.current.contains(activeElement)) return // Already focused within Dialog

    focusIn(internalPanelRef.current, Focus.First)
  }, [focus, internalPanelRef, state.popoverState])

  // Handle focus out when we are in special "focus" mode
  useEventListener(
    ownerDocument?.defaultView,
    'focus',
    () => {
      if (!focus) return
      if (state.popoverState !== PopoverStates.Open) return
      if (!internalPanelRef.current) return

      let activeElement = ownerDocument?.activeElement as HTMLElement

      if (
        activeElement &&
        (internalPanelRef.current?.contains(activeElement) ||
          state.beforePanelSentinel.current?.contains?.(activeElement) ||
          state.afterPanelSentinel.current?.contains?.(activeElement))
      ) {
        return
      }

      dispatch({ type: ActionTypes.ClosePopover })
    },
    true
  )

  let slot = useMemo<PanelRenderPropArg>(
    () => ({ open: state.popoverState === PopoverStates.Open, close }),
    [state, close]
  )
  let ourProps = {
    ref: panelRef,
    id: state.panelId,
    onKeyDown: handleKeyDown,
    tabIndex: -1,
  }

  let direction = useTabDirection()
  let handleBeforeFocus = useEvent(() => {
    let el = internalPanelRef.current as HTMLElement
    if (!el) return

    function run() {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          focusIn(el, Focus.First)
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
              element?.id?.startsWith?.('headlessui-focus-sentinel-') ||
              state.panel?.contains(element)
            ) {
              let idx = combined.indexOf(element)
              if (idx !== -1) combined.splice(idx, 1)
            }
          }

          focusIn(combined, Focus.First, false)
        },
        [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
      })
    }

    // TODO: Cleanup once we are using real browser tests
    if (process.env.NODE_ENV === 'test') {
      microTask(run)
    } else {
      run()
    }
  })

  return (
    <PopoverPanelContext.Provider value={state.panelId}>
      {visible && isPortalled && (
        <Hidden
          id={beforePanelSentinelId}
          ref={state.beforePanelSentinel}
          features={HiddenFeatures.Focusable}
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
          as="button"
          type="button"
          onFocus={handleAfterFocus}
        />
      )}
    </PopoverPanelContext.Provider>
  )
})

// ---

let DEFAULT_GROUP_TAG = 'div' as const
interface GroupRenderPropArg {}
type GroupPropsWeControl = 'id'

let Group = forwardRefWithAs(function Group<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: Props<TTag, GroupRenderPropArg, GroupPropsWeControl>,
  ref: Ref<HTMLElement>
) {
  let internalGroupRef = useRef<HTMLElement | null>(null)
  let groupRef = useSyncRefs(internalGroupRef, ref)
  let [popovers, setPopovers] = useState<PopoverRegisterBag[]>([])

  let unregisterPopover = useCallback(
    (registerbag: PopoverRegisterBag) => {
      setPopovers((existing) => {
        let idx = existing.indexOf(registerbag)
        if (idx !== -1) {
          let clone = existing.slice()
          clone.splice(idx, 1)
          return clone
        }
        return existing
      })
    },
    [setPopovers]
  )

  let registerPopover = useCallback(
    (registerbag: PopoverRegisterBag) => {
      setPopovers((existing) => [...existing, registerbag])
      return () => unregisterPopover(registerbag)
    },
    [setPopovers, unregisterPopover]
  )

  let isFocusWithinPopoverGroup = useCallback(() => {
    let ownerDocument = getOwnerDocument(internalGroupRef)
    if (!ownerDocument) return false
    let element = ownerDocument.activeElement

    if (internalGroupRef.current?.contains(element)) return true

    // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.
    return popovers.some((bag) => {
      return (
        ownerDocument!.getElementById(bag.buttonId)?.contains(element) ||
        ownerDocument!.getElementById(bag.panelId)?.contains(element)
      )
    })
  }, [internalGroupRef, popovers])

  let closeOthers = useCallback(
    (buttonId: string) => {
      for (let popover of popovers) {
        if (popover.buttonId !== buttonId) popover.close()
      }
    },
    [popovers]
  )

  let contextBag = useMemo<ContextType<typeof PopoverGroupContext>>(
    () => ({
      registerPopover: registerPopover,
      unregisterPopover: unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers,
    }),
    [registerPopover, unregisterPopover, isFocusWithinPopoverGroup, closeOthers]
  )

  let slot = useMemo<GroupRenderPropArg>(() => ({}), [])

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
    </PopoverGroupContext.Provider>
  )
})

// ---

export let Popover = Object.assign(PopoverRoot, { Button, Overlay, Panel, Group })
