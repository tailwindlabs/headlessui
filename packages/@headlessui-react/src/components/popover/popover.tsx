'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ContextType,
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
import { useSlice } from '../../react-glue'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import * as DOM from '../../utils/dom'
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
import { PopoverStates } from './popover-machine'
import { PopoverContext, usePopoverMachine, usePopoverMachineContext } from './popover-machine-glue'

type MouseEvent<T> = Parameters<MouseEventHandler<T>>[0]

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
  let id = useId()

  let { __demoMode = false, ...theirProps } = props
  let machine = usePopoverMachine({ id, __demoMode })

  let internalPopoverRef = useRef<HTMLElement | null>(null)
  let popoverRef = useSyncRefs(
    ref,
    optionalRef((ref) => {
      internalPopoverRef.current = ref
    })
  )

  let [popoverState, button, panel, buttonId, panelId] = useSlice(
    machine,
    useCallback((state) => {
      return [state.popoverState, state.button, state.panel, state.buttonId, state.panelId] as const
    }, [])
  )

  let ownerDocument = useOwnerDocument(internalPopoverRef.current ?? button)

  let buttonIdRef = useLatestValue(buttonId)
  let panelIdRef = useLatestValue(panelId)

  let registerBag = useMemo(
    () => ({
      buttonId: buttonIdRef,
      panelId: panelIdRef,
      close: machine.actions.close,
    }),
    [buttonIdRef, panelIdRef, machine]
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
    defaultContainers: [
      {
        get current() {
          return machine.state.button
        },
      },
      {
        get current() {
          return machine.state.panel
        },
      },
    ],
  })

  // Handle focus out
  useEventListener(
    ownerDocument?.defaultView,
    'focus',
    (event) => {
      if (event.target === window) return
      if (!DOM.isHTMLorSVGElement(event.target)) return
      if (machine.state.popoverState !== PopoverStates.Open) return
      if (isFocusWithinPopoverGroup()) return
      if (!machine.state.button) return
      if (!machine.state.panel) return
      if (root.contains(event.target)) return
      if (machine.state.beforePanelSentinel.current?.contains?.(event.target)) return
      if (machine.state.afterPanelSentinel.current?.contains?.(event.target)) return
      if (machine.state.afterButtonSentinel.current?.contains?.(event.target)) return

      machine.actions.close()
    },
    true
  )

  // Handle outside click
  let outsideClickEnabled = popoverState === PopoverStates.Open
  useOutsideClick(outsideClickEnabled, root.resolveContainers, (event, target) => {
    machine.actions.close()

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      button?.focus()
    }
  })

  let slot = useMemo(() => {
    return {
      open: popoverState === PopoverStates.Open,
      close: machine.actions.refocusableClose,
    } satisfies PopoverRenderPropArg
  }, [popoverState, machine])

  let openClosedState = useSlice(
    machine,
    useCallback((state) => {
      return match(state.popoverState, {
        [PopoverStates.Open]: State.Open,
        [PopoverStates.Closed]: State.Closed,
      })
    }, [])
  )

  let ourProps = { ref: popoverRef }

  let render = useRender()

  return (
    <MainTreeProvider node={mainTreeNode}>
      <FloatingProvider>
        <PopoverPanelContext.Provider value={null}>
          <PopoverContext.Provider value={machine}>
            <CloseProvider value={machine.actions.refocusableClose}>
              <OpenClosedProvider value={openClosedState}>
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
  let machine = usePopoverMachineContext('Popover.Button')
  let [popoverState, isPortalled, button, buttonId, panel, panelId, afterButtonSentinel] = useSlice(
    machine,
    useCallback((state) => {
      return [
        state.popoverState,
        machine.selectors.isPortalled(state),
        state.button,
        state.buttonId,
        state.panel,
        state.panelId,
        state.afterButtonSentinel,
      ] as const
    }, [])
  )
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
    machine.actions.setButtonId(id)
    return () => machine.actions.setButtonId(null)
  }, [isWithinPanel, id, machine])

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
        machine.state.buttons.current.push(uniqueIdentifier)
      } else {
        let idx = machine.state.buttons.current.indexOf(uniqueIdentifier)
        if (idx !== -1) machine.state.buttons.current.splice(idx, 1)
      }

      if (machine.state.buttons.current.length > 1) {
        console.warn(
          'You are already using a <Popover.Button /> but only 1 <Popover.Button /> is supported.'
        )
      }

      button && machine.actions.setButton(button)
    })
  )
  let withinPanelButtonRef = useSyncRefs(internalButtonRef, ref)
  let ownerDocument = useOwnerDocument(internalButtonRef)

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isWithinPanel) {
      if (machine.state.popoverState === PopoverStates.Closed) return
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault() // Prevent triggering a *click* event
          // @ts-expect-error
          event.target.click?.()
          machine.actions.close()
          machine.state.button?.focus() // Re-focus the original opening Button
          break
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault() // Prevent triggering a *click* event
          event.stopPropagation()
          if (machine.state.popoverState === PopoverStates.Closed) {
            closeOthers?.(machine.state.buttonId!)
            machine.actions.open()
          } else {
            machine.actions.close()
          }
          break

        case Keys.Escape:
          if (machine.state.popoverState !== PopoverStates.Open) {
            return closeOthers?.(machine.state.buttonId!)
          }
          if (!internalButtonRef.current) return
          if (
            ownerDocument?.activeElement &&
            !internalButtonRef.current.contains(ownerDocument.activeElement)
          ) {
            return
          }
          event.preventDefault()
          event.stopPropagation()
          machine.actions.close()
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
      machine.actions.close()
      machine.state.button?.focus() // Re-focus the original opening Button
    } else {
      event.preventDefault()
      event.stopPropagation()
      if (machine.state.popoverState === PopoverStates.Closed) {
        closeOthers?.(machine.state.buttonId!)
        machine.actions.open()
      } else {
        machine.actions.close()
      }
      machine.state.button?.focus()
    }
  })

  let handleMouseDown = useEvent((event: ReactMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let visible = popoverState === PopoverStates.Open
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

  let type = useResolveButtonType(props, button)
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
          id: buttonId,
          type,
          'aria-expanded': popoverState === PopoverStates.Open,
          'aria-controls': panel ? panelId : undefined,
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
    if (!DOM.isHTMLElement(machine.state.panel)) return
    let el = machine.state.panel

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
          { relativeTo: machine.state.button }
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
          ref={afterButtonSentinel}
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
  let machine = usePopoverMachineContext('Popover.Backdrop')
  let popoverState = useSlice(
    machine,
    useCallback((state) => state.popoverState, [])
  )

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
    machine.actions.close()
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

  let machine = usePopoverMachineContext('Popover.Panel')
  let isPortalled = useSlice(machine, machine.selectors.isPortalled)

  let [popoverState, button, __demoMode, beforePanelSentinel, afterPanelSentinel] = useSlice(
    machine,
    useCallback((state) => {
      return [
        state.popoverState,
        state.button,
        state.__demoMode,
        state.beforePanelSentinel,
        state.afterPanelSentinel,
      ] as const
    }, [])
  )

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
    machine.actions.setPanel,
    setLocalPanelElement
  )
  let portalOwnerDocument = useOwnerDocument(button)
  let ownerDocument = useOwnerDocument(internalPanelRef)

  useIsoMorphicEffect(() => {
    machine.actions.setPanelId(id)
    return () => machine.actions.setPanelId(null)
  }, [id, machine])

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localPanelElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : popoverState === PopoverStates.Open
  )

  // Ensure we close the popover as soon as the button becomes hidden
  useOnDisappear(visible, button, machine.actions.close)

  // Enable scroll locking when the popover is visible, and `modal` is enabled
  let scrollLockEnabled = __demoMode ? false : modal && visible
  useScrollLock(scrollLockEnabled, ownerDocument)

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Escape:
        if (machine.state.popoverState !== PopoverStates.Open) return
        if (!internalPanelRef.current) return
        if (
          ownerDocument?.activeElement &&
          !internalPanelRef.current.contains(ownerDocument.activeElement)
        ) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        machine.actions.close()
        machine.state.button?.focus()
        break
    }
  })

  // Unlink on "unmount" children
  useEffect(() => {
    if (props.static) return

    if (popoverState === PopoverStates.Closed && (props.unmount ?? true)) {
      machine.actions.setPanel(null)
    }
  }, [popoverState, props.unmount, props.static, machine])

  // Move focus within panel
  useEffect(() => {
    if (__demoMode) return
    if (!focus) return
    if (popoverState !== PopoverStates.Open) return
    if (!internalPanelRef.current) return

    let activeElement = ownerDocument?.activeElement as HTMLElement
    if (internalPanelRef.current.contains(activeElement)) return // Already focused within Dialog

    focusIn(internalPanelRef.current, Focus.First)
  }, [__demoMode, focus, internalPanelRef.current, popoverState])

  let slot = useMemo(() => {
    return {
      open: popoverState === PopoverStates.Open,
      close: machine.actions.refocusableClose,
    } satisfies PanelRenderPropArg
  }, [popoverState, machine])

  let ourProps: Record<string, any> = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    ref: panelRef,
    id,
    onKeyDown: handleKeyDown,
    onBlur:
      focus && popoverState === PopoverStates.Open
        ? (event: ReactFocusEvent) => {
            let el = event.relatedTarget as HTMLElement
            if (!el) return
            if (!internalPanelRef.current) return
            if (internalPanelRef.current?.contains(el)) return

            machine.actions.close()

            if (
              beforePanelSentinel.current?.contains?.(el) ||
              afterPanelSentinel.current?.contains?.(el)
            ) {
              el.focus({ preventScroll: true })
            }
          }
        : undefined,
    tabIndex: -1,
    style: {
      ...theirProps.style,
      ...style,
      '--button-width': useElementSize(button, true).width,
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
            machine.state.afterPanelSentinel.current?.focus()
          }
        },
        [TabDirection.Backwards]: () => {
          // Coming from the Popover.Panel (which is portalled to somewhere else). Let's redirect
          // the focus to the Popover.Button again.
          machine.state.button?.focus({ preventScroll: true })
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
          if (!machine.state.button) return

          let elements = getFocusableElements()

          let idx = elements.indexOf(machine.state.button)
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
            machine.state.button?.focus()
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
        <CloseProvider value={machine.actions.refocusableClose}>
          <Portal
            enabled={portal ? props.static || visible : false}
            ownerDocument={portalOwnerDocument}
          >
            {visible && isPortalled && (
              <Hidden
                id={beforePanelSentinelId}
                ref={beforePanelSentinel}
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
                ref={afterPanelSentinel}
                features={HiddenFeatures.Focusable}
                data-headlessui-focus-guard
                as="button"
                type="button"
                onFocus={handleAfterFocus}
              />
            )}
          </Portal>
        </CloseProvider>
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
