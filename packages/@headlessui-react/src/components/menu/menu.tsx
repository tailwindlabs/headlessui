'use client'

// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/
import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react'
import { flushSync } from 'react-dom'
import { useActivePress } from '../../hooks/use-active-press'
import { useDidElementMove } from '../../hooks/use-did-element-move'
import { useDisposables } from '../../hooks/use-disposables'
import { useElementSize } from '../../hooks/use-element-size'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useInertOthers } from '../../hooks/use-inert-others'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useOnDisappear } from '../../hooks/use-on-disappear'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import { Action as QuickReleaseAction, useQuickRelease } from '../../hooks/use-quick-release'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useScrollLock } from '../../hooks/use-scroll-lock'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTextValue } from '../../hooks/use-text-value'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { transitionDataAttributes, useTransition } from '../../hooks/use-transition'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  useFloatingReferenceProps,
  useResolvedAnchor,
  type AnchorProps,
} from '../../internal/floating'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { stackMachines } from '../../machines/stack-machine'
import { useSlice } from '../../react-glue'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import * as DOM from '../../utils/dom'
import {
  Focus as FocusManagementFocus,
  FocusableMode,
  focusFrom,
  isFocusableElement,
  restoreFocusIfNecessary,
} from '../../utils/focus-management'
import { match } from '../../utils/match'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  useRender,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'
import { useDescriptions } from '../description/description'
import { Keys } from '../keyboard'
import { useLabelContext, useLabels } from '../label/label'
import { Portal } from '../portal/portal'
import { ActionTypes, ActivationTrigger, MenuState, type MenuItemDataRef } from './menu-machine'
import { MenuContext, useMenuMachine, useMenuMachineContext } from './menu-machine-glue'

let DEFAULT_MENU_TAG = Fragment
type MenuRenderPropArg = {
  open: boolean
  close: () => void
}
type MenuPropsWeControl = never

export type MenuProps<TTag extends ElementType = typeof DEFAULT_MENU_TAG> = Props<
  TTag,
  MenuRenderPropArg,
  MenuPropsWeControl,
  {
    __demoMode?: boolean
  }
>

function MenuFn<TTag extends ElementType = typeof DEFAULT_MENU_TAG>(
  props: MenuProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let id = useId()

  let { __demoMode = false, ...theirProps } = props
  let machine = useMenuMachine({ id, __demoMode })

  let [menuState, itemsElement, buttonElement] = useSlice(machine, (state) => [
    state.menuState,
    state.itemsElement,
    state.buttonElement,
  ])
  let menuRef = useSyncRefs(ref)

  let stackMachine = stackMachines.get(null)
  let isTopLayer = useSlice(
    stackMachine,
    useCallback((state) => stackMachine.selectors.isTop(state, id), [stackMachine, id])
  )

  useOutsideClick(isTopLayer, [buttonElement, itemsElement], (event, target) => {
    machine.send({ type: ActionTypes.CloseMenu })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      machine.state.buttonElement?.focus()
    }
  })

  let close = useEvent(() => {
    machine.send({ type: ActionTypes.CloseMenu })
  })

  let slot = useMemo(
    () => ({ open: menuState === MenuState.Open, close }) satisfies MenuRenderPropArg,
    [menuState, close]
  )

  let ourProps = { ref: menuRef }

  let render = useRender()

  return (
    <FloatingProvider>
      <MenuContext.Provider value={machine}>
        <OpenClosedProvider
          value={match(menuState, {
            [MenuState.Open]: State.Open,
            [MenuState.Closed]: State.Closed,
          })}
        >
          {render({
            ourProps,
            theirProps,
            slot,
            defaultTag: DEFAULT_MENU_TAG,
            name: 'Menu',
          })}
        </OpenClosedProvider>
      </MenuContext.Provider>
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
  disabled: boolean
  autofocus: boolean
}
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded' | 'aria-haspopup'

export type MenuButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    disabled?: boolean
    autoFocus?: boolean
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: MenuButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let machine = useMenuMachineContext('Menu.Button')
  let internalId = useId()
  let {
    id = `headlessui-menu-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props
  let internalButtonRef = useRef<HTMLButtonElement | null>(null)
  let getFloatingReferenceProps = useFloatingReferenceProps()
  let buttonRef = useSyncRefs(
    ref,
    internalButtonRef,
    useFloatingReference(),
    useEvent((element) => machine.send({ type: ActionTypes.SetButtonElement, element }))
  )

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        machine.send({ type: ActionTypes.OpenMenu, focus: { focus: Focus.First } })
        break

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        machine.send({ type: ActionTypes.OpenMenu, focus: { focus: Focus.Last } })
        break
    }
  })

  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  })

  let [menuState, buttonElement, itemsElement] = useSlice(machine, (state) => [
    state.menuState,
    state.buttonElement,
    state.itemsElement,
  ])

  let enableQuickRelease = menuState === MenuState.Open
  useQuickRelease(enableQuickRelease, {
    trigger: buttonElement,
    action: useCallback(
      (e) => {
        if (buttonElement?.contains(e.target)) {
          return QuickReleaseAction.Ignore
        }

        let item = e.target.closest('[role="menuitem"]:not([data-disabled])')
        if (DOM.isHTMLElement(item)) {
          return QuickReleaseAction.Select(item)
        }

        if (itemsElement?.contains(e.target)) {
          return QuickReleaseAction.Ignore
        }

        return QuickReleaseAction.Close
      },
      [buttonElement, itemsElement]
    ),
    close: useCallback(() => machine.send({ type: ActionTypes.CloseMenu }), []),
    select: useCallback((target) => target.click(), []),
  })

  let handlePointerDown = useEvent((event: ReactPointerEvent) => {
    if (event.button !== 0) return // Only handle left clicks
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (disabled) return
    if (menuState === MenuState.Open) {
      flushSync(() => machine.send({ type: ActionTypes.CloseMenu }))
      internalButtonRef.current?.focus({ preventScroll: true })
    } else {
      event.preventDefault()
      machine.send({
        type: ActionTypes.OpenMenu,
        focus: { focus: Focus.Nothing },
        trigger: ActivationTrigger.Pointer,
      })
    }
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let slot = useMemo(() => {
    return {
      open: menuState === MenuState.Open,
      active: active || menuState === MenuState.Open,
      disabled,
      hover,
      focus,
      autofocus: autoFocus,
    } satisfies ButtonRenderPropArg
  }, [menuState, hover, focus, active, disabled, autoFocus])

  let ourProps = mergeProps(
    getFloatingReferenceProps(),
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, internalButtonRef.current),
      'aria-haspopup': 'menu',
      'aria-controls': itemsElement?.id,
      'aria-expanded': menuState === MenuState.Open,
      disabled: disabled || undefined,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onPointerDown: handlePointerDown,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Menu.Button',
  })
}

// ---

let DEFAULT_ITEMS_TAG = 'div' as const
type ItemsRenderPropArg = {
  open: boolean
}
type ItemsPropsWeControl = 'aria-activedescendant' | 'aria-labelledby' | 'role' | 'tabIndex'

let ItemsRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type MenuItemsProps<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG> = Props<
  TTag,
  ItemsRenderPropArg,
  ItemsPropsWeControl,
  {
    anchor?: AnchorProps
    portal?: boolean
    modal?: boolean
    transition?: boolean

    // ItemsRenderFeatures
    static?: boolean
    unmount?: boolean
  }
>

function ItemsFn<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(
  props: MenuItemsProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-menu-items-${internalId}`,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition = false,
    ...theirProps
  } = props
  let anchor = useResolvedAnchor(rawAnchor)
  let machine = useMenuMachineContext('Menu.Items')
  let [floatingRef, style] = useFloatingPanel(anchor)
  let getFloatingPanelProps = useFloatingPanelProps()

  // To improve the correctness of transitions (timing related race conditions),
  // we track the element locally to this component, instead of relying on the
  // context value. This way, the component can re-render independently of the
  // parent component when the `useTransition(…)` hook performs a state change.
  let [localItemsElement, setLocalItemsElement] = useState<HTMLElement | null>(null)

  let itemsRef = useSyncRefs(
    ref,
    anchor ? floatingRef : null,
    useEvent((element) => machine.send({ type: ActionTypes.SetItemsElement, element })),
    setLocalItemsElement
  )

  let [menuState, buttonElement] = useSlice(machine, (state) => [
    state.menuState,
    state.buttonElement,
  ])

  let portalOwnerDocument = useOwnerDocument(buttonElement)
  let ownerDocument = useOwnerDocument(localItemsElement)

  // Always enable `portal` functionality, when `anchor` is enabled
  if (anchor) {
    portal = true
  }

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localItemsElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : menuState === MenuState.Open
  )

  // Ensure we close the menu as soon as the button becomes hidden
  useOnDisappear(visible, buttonElement, () => {
    machine.send({ type: ActionTypes.CloseMenu })
  })

  // Enable scroll locking when the menu is visible, and `modal` is enabled
  let __demoMode = useSlice(machine, (state) => state.__demoMode)
  let scrollLockEnabled = __demoMode ? false : modal && menuState === MenuState.Open
  useScrollLock(scrollLockEnabled, ownerDocument)

  // Mark other elements as inert when the menu is visible, and `modal` is enabled
  let inertOthersEnabled = __demoMode ? false : modal && menuState === MenuState.Open
  useInertOthers(inertOthersEnabled, {
    allowed: useCallback(
      () => [buttonElement, localItemsElement],
      [buttonElement, localItemsElement]
    ),
  })

  // We keep track whether the button moved or not, we only check this when the menu state becomes
  // closed. If the button moved, then we want to cancel pending transitions to prevent that the
  // attached `MenuItems` is still transitioning while the button moved away.
  //
  // If we don't cancel these transitions then there will be a period where the `MenuItems` is
  // visible and moving around because it is trying to re-position itself based on the new position.
  //
  // This can be solved by only transitioning the `opacity` instead of everything, but if you _do_
  // want to transition the y-axis for example you will run into the same issue again.
  let didButtonMoveEnabled = menuState !== MenuState.Open
  let didButtonMove = useDidElementMove(didButtonMoveEnabled, buttonElement)

  // Now that we know that the button did move or not, we can either disable the panel and all of
  // its transitions, or rely on the `visible` state to hide the panel whenever necessary.
  let panelEnabled = didButtonMove ? false : visible

  useEffect(() => {
    let container = localItemsElement
    if (!container) return
    if (menuState !== MenuState.Open) return
    if (container === ownerDocument?.activeElement) return

    container.focus({ preventScroll: true })
  }, [menuState, localItemsElement, ownerDocument])

  useTreeWalker(menuState === MenuState.Open, {
    container: localItemsElement,
    accept(node) {
      if (node.getAttribute('role') === 'menuitem') return NodeFilter.FILTER_REJECT
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk(node) {
      node.setAttribute('role', 'none')
    },
  })

  let searchDisposables = useDisposables()
  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLElement>) => {
    searchDisposables.dispose()

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      // @ts-expect-error Fallthrough is expected here
      case Keys.Space:
        if (machine.state.searchQuery !== '') {
          event.preventDefault()
          event.stopPropagation()
          return machine.send({ type: ActionTypes.Search, value: event.key })
        }
      // When in type ahead mode, fallthrough
      case Keys.Enter:
        event.preventDefault()
        event.stopPropagation()
        if (machine.state.activeItemIndex !== null) {
          let { dataRef } = machine.state.items[machine.state.activeItemIndex]
          dataRef.current?.domRef.current?.click()
        }
        machine.send({ type: ActionTypes.CloseMenu })
        restoreFocusIfNecessary(machine.state.buttonElement)
        break

      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        return machine.send({ type: ActionTypes.GoToItem, focus: Focus.Next })

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        return machine.send({ type: ActionTypes.GoToItem, focus: Focus.Previous })

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault()
        event.stopPropagation()
        return machine.send({ type: ActionTypes.GoToItem, focus: Focus.First })

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()
        return machine.send({ type: ActionTypes.GoToItem, focus: Focus.Last })

      case Keys.Escape:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => machine.send({ type: ActionTypes.CloseMenu }))
        machine.state.buttonElement?.focus({ preventScroll: true })
        break

      case Keys.Tab:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => machine.send({ type: ActionTypes.CloseMenu }))
        focusFrom(
          machine.state.buttonElement!,
          event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next
        )
        break

      default:
        if (event.key.length === 1) {
          machine.send({ type: ActionTypes.Search, value: event.key })
          searchDisposables.setTimeout(() => machine.send({ type: ActionTypes.ClearSearch }), 350)
        }
        break
    }
  })

  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  })

  let slot = useMemo(() => {
    return {
      open: menuState === MenuState.Open,
    } satisfies ItemsRenderPropArg
  }, [menuState])

  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    'aria-activedescendant': useSlice(machine, machine.selectors.activeDescendantId),
    'aria-labelledby': useSlice(machine, (state) => state.buttonElement?.id),
    id,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    role: 'menu',
    // When the `Menu` is closed, it should not be focusable. This allows us
    // to skip focusing the `MenuItems` when pressing the tab key on an
    // open `Menu`, and go to the next focusable element.
    tabIndex: menuState === MenuState.Open ? 0 : undefined,
    ref: itemsRef,
    style: {
      ...theirProps.style,
      ...style,
      '--button-width': useElementSize(buttonElement, true).width,
    } as CSSProperties,
    ...transitionDataAttributes(transitionData),
  })

  let render = useRender()

  return (
    <Portal enabled={portal ? props.static || visible : false} ownerDocument={portalOwnerDocument}>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_ITEMS_TAG,
        features: ItemsRenderFeatures,
        visible: panelEnabled,
        name: 'Menu.Items',
      })}
    </Portal>
  )
}

// ---

let DEFAULT_ITEM_TAG = Fragment
type ItemRenderPropArg = {
  /** @deprecated use `focus` instead */
  active: boolean
  focus: boolean
  disabled: boolean
  close: () => void
}
type ItemPropsWeControl =
  | 'aria-describedby'
  | 'aria-disabled'
  | 'aria-labelledby'
  | 'role'
  | 'tabIndex'

export type MenuItemProps<TTag extends ElementType = typeof DEFAULT_ITEM_TAG> = Props<
  TTag,
  ItemRenderPropArg,
  ItemPropsWeControl,
  {
    disabled?: boolean
  }
>

function ItemFn<TTag extends ElementType = typeof DEFAULT_ITEM_TAG>(
  props: MenuItemProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let { id = `headlessui-menu-item-${internalId}`, disabled = false, ...theirProps } = props
  let machine = useMenuMachineContext('Menu.Item')

  let active = useSlice(machine, (state) => machine.selectors.isActive(state, id))

  let internalItemRef = useRef<HTMLElement | null>(null)
  let itemRef = useSyncRefs(ref, internalItemRef)

  let shouldScrollIntoView = useSlice(machine, (state) =>
    machine.selectors.shouldScrollIntoView(state, id)
  )
  useIsoMorphicEffect(() => {
    if (!shouldScrollIntoView) return
    return disposables().requestAnimationFrame(() => {
      internalItemRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
  }, [shouldScrollIntoView, internalItemRef])

  let getTextValue = useTextValue(internalItemRef)

  let bag = useRef<MenuItemDataRef['current']>({
    disabled,
    domRef: internalItemRef,
    get textValue() {
      return getTextValue()
    },
  })

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])

  useIsoMorphicEffect(() => {
    machine.actions.registerItem(id, bag)
    return () => machine.actions.unregisterItem(id)
  }, [bag, id])

  let close = useEvent(() => {
    machine.send({ type: ActionTypes.CloseMenu })
  })

  let handleClick = useEvent((event: MouseEvent) => {
    if (disabled) return event.preventDefault()
    machine.send({ type: ActionTypes.CloseMenu })
    restoreFocusIfNecessary(machine.state.buttonElement)
  })

  let handleFocus = useEvent(() => {
    if (disabled) return machine.send({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    machine.send({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((event) => {
    pointer.update(event)
    if (disabled) return
    if (active) return
    machine.send({
      type: ActionTypes.GoToItem,
      focus: Focus.Specific,
      id,
      trigger: ActivationTrigger.Pointer,
    })
  })

  let handleMove = useEvent((event) => {
    if (!pointer.wasMoved(event)) return
    if (disabled) return
    if (active) return
    machine.send({
      type: ActionTypes.GoToItem,
      focus: Focus.Specific,
      id,
      trigger: ActivationTrigger.Pointer,
    })
  })

  let handleLeave = useEvent((event) => {
    if (!pointer.wasMoved(event)) return
    if (disabled) return
    if (!active) return
    machine.send({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
  })

  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()

  let slot = useMemo(
    () => ({ active, focus: active, disabled, close }) satisfies ItemRenderPropArg,
    [active, disabled, close]
  )
  let ourProps = {
    id,
    ref: itemRef,
    role: 'menuitem',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    disabled: undefined, // Never forward the `disabled` prop
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave,
  }

  let render = useRender()

  return (
    <LabelProvider>
      <DescriptionProvider>
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_ITEM_TAG,
          name: 'Menu.Item',
        })}
      </DescriptionProvider>
    </LabelProvider>
  )
}

// ---

let DEFAULT_SECTION_TAG = 'div' as const
type SectionRenderPropArg = {}
type SectionPropsWeControl = 'role' | 'aria-labelledby'

export type MenuSectionProps<TTag extends ElementType = typeof DEFAULT_SECTION_TAG> = Props<
  TTag,
  SectionRenderPropArg,
  SectionPropsWeControl
>

function SectionFn<TTag extends ElementType = typeof DEFAULT_SECTION_TAG>(
  props: MenuSectionProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let [labelledby, LabelProvider] = useLabels()

  let theirProps = props
  let ourProps = { ref, 'aria-labelledby': labelledby, role: 'group' }

  let render = useRender()

  return (
    <LabelProvider>
      {render({
        ourProps,
        theirProps,
        slot: {},
        defaultTag: DEFAULT_SECTION_TAG,
        name: 'Menu.Section',
      })}
    </LabelProvider>
  )
}

// --

let DEFAULT_HEADING_TAG = 'header' as const
type HeadingRenderPropArg = {}
type HeadingPropsWeControl = 'role'

export type MenuHeadingProps<TTag extends ElementType = typeof DEFAULT_HEADING_TAG> = Props<
  TTag,
  HeadingRenderPropArg,
  HeadingPropsWeControl
>

function HeadingFn<TTag extends ElementType = typeof DEFAULT_HEADING_TAG>(
  props: MenuHeadingProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let { id = `headlessui-menu-heading-${internalId}`, ...theirProps } = props

  let context = useLabelContext()
  useIsoMorphicEffect(() => context.register(id), [id, context.register])

  let ourProps = { id, ref, role: 'presentation', ...context.props }

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_HEADING_TAG,
    name: 'Menu.Heading',
  })
}

// ---

let DEFAULT_SEPARATOR_TAG = 'div' as const
type SeparatorRenderPropArg = {}
type SeparatorPropsWeControl = 'role'

export type MenuSeparatorProps<TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG> = Props<
  TTag,
  SeparatorRenderPropArg,
  SeparatorPropsWeControl
>

function SeparatorFn<TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG>(
  props: MenuSeparatorProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let theirProps = props
  let ourProps = { ref, role: 'separator' }

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_SEPARATOR_TAG,
    name: 'Menu.Separator',
  })
}

// ---

export interface _internal_ComponentMenu extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_MENU_TAG>(
    props: MenuProps<TTag> & RefProp<typeof MenuFn>
  ): React.JSX.Element
}

export interface _internal_ComponentMenuButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: MenuButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): React.JSX.Element
}

export interface _internal_ComponentMenuItems extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(
    props: MenuItemsProps<TTag> & RefProp<typeof ItemsFn>
  ): React.JSX.Element
}

export interface _internal_ComponentMenuItem extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_ITEM_TAG>(
    props: MenuItemProps<TTag> & RefProp<typeof ItemFn>
  ): React.JSX.Element
}

export interface _internal_ComponentMenuSection extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SECTION_TAG>(
    props: MenuSectionProps<TTag> & RefProp<typeof SectionFn>
  ): React.JSX.Element
}

export interface _internal_ComponentMenuHeading extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_HEADING_TAG>(
    props: MenuHeadingProps<TTag> & RefProp<typeof HeadingFn>
  ): React.JSX.Element
}

export interface _internal_ComponentMenuSeparator extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG>(
    props: MenuSeparatorProps<TTag> & RefProp<typeof SeparatorFn>
  ): React.JSX.Element
}

let MenuRoot = forwardRefWithAs(MenuFn) as _internal_ComponentMenu
export let MenuButton = forwardRefWithAs(ButtonFn) as _internal_ComponentMenuButton
export let MenuItems = forwardRefWithAs(ItemsFn) as _internal_ComponentMenuItems
export let MenuItem = forwardRefWithAs(ItemFn) as _internal_ComponentMenuItem
export let MenuSection = forwardRefWithAs(SectionFn) as _internal_ComponentMenuSection
export let MenuHeading = forwardRefWithAs(HeadingFn) as _internal_ComponentMenuHeading
export let MenuSeparator = forwardRefWithAs(SeparatorFn) as _internal_ComponentMenuSeparator

export let Menu = Object.assign(MenuRoot, {
  /** @deprecated use `<MenuButton>` instead of `<Menu.Button>` */
  Button: MenuButton,
  /** @deprecated use `<MenuItems>` instead of `<Menu.Items>` */
  Items: MenuItems,
  /** @deprecated use `<MenuItem>` instead of `<Menu.Item>` */
  Item: MenuItem,
  /** @deprecated use `<MenuSection>` instead of `<Menu.Section>` */
  Section: MenuSection,
  /** @deprecated use `<MenuHeading>` instead of `<Menu.Heading>` */
  Heading: MenuHeading,
  /** @deprecated use `<MenuSeparator>` instead of `<Menu.Separator>` */
  Separator: MenuSeparator,
})
