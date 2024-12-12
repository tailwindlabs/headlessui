'use client'

// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/
import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ElementType,
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
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
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import {
  Focus as FocusManagementFocus,
  FocusableMode,
  focusFrom,
  isFocusableElement,
  restoreFocusIfNecessary,
  sortByDomNode,
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

enum MenuStates {
  Open,
  Closed,
}

enum ActivationTrigger {
  Pointer,
  Other,
}

type MenuItemDataRef = MutableRefObject<{
  textValue?: string
  disabled: boolean
  domRef: MutableRefObject<HTMLElement | null>
}>

interface StateDefinition {
  __demoMode: boolean
  menuState: MenuStates
  buttonElement: HTMLButtonElement | null
  itemsElement: HTMLElement | null
  items: { id: string; dataRef: MenuItemDataRef }[]
  searchQuery: string
  activeItemIndex: number | null
  activationTrigger: ActivationTrigger
}

enum ActionTypes {
  OpenMenu,
  CloseMenu,

  GoToItem,
  Search,
  ClearSearch,
  RegisterItem,
  UnregisterItem,

  SetButtonElement,
  SetItemsElement,
}

function adjustOrderedState(
  state: StateDefinition,
  adjustment: (items: StateDefinition['items']) => StateDefinition['items'] = (i) => i
) {
  let currentActiveItem = state.activeItemIndex !== null ? state.items[state.activeItemIndex] : null

  let sortedItems = sortByDomNode(
    adjustment(state.items.slice()),
    (item) => item.dataRef.current.domRef.current
  )

  // If we inserted an item before the current active item then the active item index
  // would be wrong. To fix this, we will re-lookup the correct index.
  let adjustedActiveItemIndex = currentActiveItem ? sortedItems.indexOf(currentActiveItem) : null

  // Reset to `null` in case the currentActiveItem was removed.
  if (adjustedActiveItemIndex === -1) {
    adjustedActiveItemIndex = null
  }

  return {
    items: sortedItems,
    activeItemIndex: adjustedActiveItemIndex,
  }
}

type Actions =
  | { type: ActionTypes.CloseMenu }
  | { type: ActionTypes.OpenMenu }
  | { type: ActionTypes.GoToItem; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToItem
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | { type: ActionTypes.RegisterItem; id: string; dataRef: MenuItemDataRef }
  | { type: ActionTypes.UnregisterItem; id: string }
  | { type: ActionTypes.SetButtonElement; element: HTMLButtonElement | null }
  | { type: ActionTypes.SetItemsElement; element: HTMLElement | null }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.CloseMenu](state) {
    if (state.menuState === MenuStates.Closed) return state
    return { ...state, activeItemIndex: null, menuState: MenuStates.Closed }
  },
  [ActionTypes.OpenMenu](state) {
    if (state.menuState === MenuStates.Open) return state
    return {
      ...state,
      /* We can turn off demo mode once we re-open the `Menu` */
      __demoMode: false,
      menuState: MenuStates.Open,
    }
  },
  [ActionTypes.GoToItem]: (state, action) => {
    if (state.menuState === MenuStates.Closed) return state

    let base = {
      ...state,
      searchQuery: '',
      activationTrigger: action.trigger ?? ActivationTrigger.Other,
      __demoMode: false,
    }

    // Optimization:
    //
    // There is no need to sort the DOM nodes if we know that we don't want to focus anything
    if (action.focus === Focus.Nothing) {
      return {
        ...base,
        activeItemIndex: null,
      }
    }

    // Optimization:
    //
    // There is no need to sort the DOM nodes if we know exactly where to go
    if (action.focus === Focus.Specific) {
      return {
        ...base,
        activeItemIndex: state.items.findIndex((o) => o.id === action.id),
      }
    }

    // Optimization:
    //
    // If the current DOM node and the previous DOM node are next to each other,
    // or if the previous DOM node is already the first DOM node, then we don't
    // have to sort all the DOM nodes.
    else if (action.focus === Focus.Previous) {
      let activeItemIdx = state.activeItemIndex
      if (activeItemIdx !== null) {
        let currentDom = state.items[activeItemIdx].dataRef.current.domRef
        let previousItemIndex = calculateActiveIndex(action, {
          resolveItems: () => state.items,
          resolveActiveIndex: () => state.activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.dataRef.current.disabled,
        })
        if (previousItemIndex !== null) {
          let previousDom = state.items[previousItemIndex].dataRef.current.domRef
          if (
            // Next to each other
            currentDom.current?.previousElementSibling === previousDom.current ||
            // Or already the first element
            previousDom.current?.previousElementSibling === null
          ) {
            return {
              ...base,
              activeItemIndex: previousItemIndex,
            }
          }
        }
      }
    }

    // Optimization:
    //
    // If the current DOM node and the next DOM node are next to each other, or
    // if the next DOM node is already the last DOM node, then we don't have to
    // sort all the DOM nodes.
    else if (action.focus === Focus.Next) {
      let activeItemIdx = state.activeItemIndex
      if (activeItemIdx !== null) {
        let currentDom = state.items[activeItemIdx].dataRef.current.domRef
        let nextItemIndex = calculateActiveIndex(action, {
          resolveItems: () => state.items,
          resolveActiveIndex: () => state.activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.dataRef.current.disabled,
        })
        if (nextItemIndex !== null) {
          let nextDom = state.items[nextItemIndex].dataRef.current.domRef
          if (
            // Next to each other
            currentDom.current?.nextElementSibling === nextDom.current ||
            // Or already the last element
            nextDom.current?.nextElementSibling === null
          ) {
            return {
              ...base,
              activeItemIndex: nextItemIndex,
            }
          }
        }
      }
    }

    // Slow path:
    //
    // Ensure all the items are correctly sorted according to DOM position
    let adjustedState = adjustOrderedState(state)
    let activeItemIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.items,
      resolveActiveIndex: () => adjustedState.activeItemIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled,
    })

    return {
      ...base,
      ...adjustedState,
      activeItemIndex,
    }
  },
  [ActionTypes.Search]: (state, action) => {
    let wasAlreadySearching = state.searchQuery !== ''
    let offset = wasAlreadySearching ? 0 : 1
    let searchQuery = state.searchQuery + action.value.toLowerCase()

    let reOrderedItems =
      state.activeItemIndex !== null
        ? state.items
            .slice(state.activeItemIndex + offset)
            .concat(state.items.slice(0, state.activeItemIndex + offset))
        : state.items

    let matchingItem = reOrderedItems.find(
      (item) =>
        item.dataRef.current.textValue?.startsWith(searchQuery) && !item.dataRef.current.disabled
    )

    let matchIdx = matchingItem ? state.items.indexOf(matchingItem) : -1
    if (matchIdx === -1 || matchIdx === state.activeItemIndex) return { ...state, searchQuery }
    return {
      ...state,
      searchQuery,
      activeItemIndex: matchIdx,
      activationTrigger: ActivationTrigger.Other,
    }
  },
  [ActionTypes.ClearSearch](state) {
    if (state.searchQuery === '') return state
    return { ...state, searchQuery: '', searchActiveItemIndex: null }
  },
  [ActionTypes.RegisterItem]: (state, action) => {
    let adjustedState = adjustOrderedState(state, (items) => [
      ...items,
      { id: action.id, dataRef: action.dataRef },
    ])

    return { ...state, ...adjustedState }
  },
  [ActionTypes.UnregisterItem]: (state, action) => {
    let adjustedState = adjustOrderedState(state, (items) => {
      let idx = items.findIndex((a) => a.id === action.id)
      if (idx !== -1) items.splice(idx, 1)
      return items
    })

    return {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }
  },
  [ActionTypes.SetButtonElement]: (state, action) => {
    if (state.buttonElement === action.element) return state
    return { ...state, buttonElement: action.element }
  },
  [ActionTypes.SetItemsElement]: (state, action) => {
    if (state.itemsElement === action.element) return state
    return { ...state, itemsElement: action.element }
  },
}

let MenuContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
MenuContext.displayName = 'MenuContext'

function useMenuContext(component: string) {
  let context = useContext(MenuContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Menu /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

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
  let { __demoMode = false, ...theirProps } = props
  let reducerBag = useReducer(stateReducer, {
    __demoMode,
    menuState: __demoMode ? MenuStates.Open : MenuStates.Closed,
    buttonElement: null,
    itemsElement: null,
    items: [],
    searchQuery: '',
    activeItemIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition)
  let [{ menuState, itemsElement, buttonElement }, dispatch] = reducerBag
  let menuRef = useSyncRefs(ref)

  // Handle outside click
  let outsideClickEnabled = menuState === MenuStates.Open
  useOutsideClick(outsideClickEnabled, [buttonElement, itemsElement], (event, target) => {
    dispatch({ type: ActionTypes.CloseMenu })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      buttonElement?.focus()
    }
  })

  let close = useEvent(() => {
    dispatch({ type: ActionTypes.CloseMenu })
  })

  let slot = useMemo(
    () => ({ open: menuState === MenuStates.Open, close }) satisfies MenuRenderPropArg,
    [menuState, close]
  )

  let ourProps = { ref: menuRef }

  let render = useRender()

  return (
    <FloatingProvider>
      <MenuContext.Provider value={reducerBag}>
        <OpenClosedProvider
          value={match(menuState, {
            [MenuStates.Open]: State.Open,
            [MenuStates.Closed]: State.Closed,
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
  let internalId = useId()
  let {
    id = `headlessui-menu-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props
  let [state, dispatch] = useMenuContext('Menu.Button')
  let getFloatingReferenceProps = useFloatingReferenceProps()
  let buttonRef = useSyncRefs(
    ref,
    useFloatingReference(),
    useEvent((element) => dispatch({ type: ActionTypes.SetButtonElement, element }))
  )

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => dispatch({ type: ActionTypes.OpenMenu }))
        dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })
        break

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => dispatch({ type: ActionTypes.OpenMenu }))
        dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })
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

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (disabled) return
    if (state.menuState === MenuStates.Open) {
      flushSync(() => dispatch({ type: ActionTypes.CloseMenu }))
      state.buttonElement?.focus({ preventScroll: true })
    } else {
      event.preventDefault()
      dispatch({ type: ActionTypes.OpenMenu })
    }
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let slot = useMemo(() => {
    return {
      open: state.menuState === MenuStates.Open,
      active: active || state.menuState === MenuStates.Open,
      disabled,
      hover,
      focus,
      autofocus: autoFocus,
    } satisfies ButtonRenderPropArg
  }, [state, hover, focus, active, disabled, autoFocus])

  let ourProps = mergeProps(
    getFloatingReferenceProps(),
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, state.buttonElement),
      'aria-haspopup': 'menu',
      'aria-controls': state.itemsElement?.id,
      'aria-expanded': state.menuState === MenuStates.Open,
      disabled: disabled || undefined,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick,
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
  let [state, dispatch] = useMenuContext('Menu.Items')
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
    useEvent((element) => dispatch({ type: ActionTypes.SetItemsElement, element })),
    setLocalItemsElement
  )
  let portalOwnerDocument = useOwnerDocument(state.buttonElement)
  let ownerDocument = useOwnerDocument(state.itemsElement)

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
      : state.menuState === MenuStates.Open
  )

  // Ensure we close the menu as soon as the button becomes hidden
  useOnDisappear(visible, state.buttonElement, () => {
    dispatch({ type: ActionTypes.CloseMenu })
  })

  // Enable scroll locking when the menu is visible, and `modal` is enabled
  let scrollLockEnabled = state.__demoMode ? false : modal && state.menuState === MenuStates.Open
  useScrollLock(scrollLockEnabled, ownerDocument)

  // Mark other elements as inert when the menu is visible, and `modal` is enabled
  let inertOthersEnabled = state.__demoMode ? false : modal && state.menuState === MenuStates.Open
  useInertOthers(inertOthersEnabled, {
    allowed: useCallback(
      () => [state.buttonElement, state.itemsElement],
      [state.buttonElement, state.itemsElement]
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
  let didButtonMoveEnabled = state.menuState !== MenuStates.Open
  let didButtonMove = useDidElementMove(didButtonMoveEnabled, state.buttonElement)

  // Now that we know that the button did move or not, we can either disable the panel and all of
  // its transitions, or rely on the `visible` state to hide the panel whenever necessary.
  let panelEnabled = didButtonMove ? false : visible

  useEffect(() => {
    let container = state.itemsElement
    if (!container) return
    if (state.menuState !== MenuStates.Open) return
    if (container === ownerDocument?.activeElement) return

    container.focus({ preventScroll: true })
  }, [state.menuState, state.itemsElement, ownerDocument])

  useTreeWalker(state.menuState === MenuStates.Open, {
    container: state.itemsElement,
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
        if (state.searchQuery !== '') {
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.Search, value: event.key })
        }
      // When in type ahead mode, fallthrough
      case Keys.Enter:
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: ActionTypes.CloseMenu })
        if (state.activeItemIndex !== null) {
          let { dataRef } = state.items[state.activeItemIndex]
          dataRef.current?.domRef.current?.click()
        }
        restoreFocusIfNecessary(state.buttonElement)
        break

      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Next })

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Previous })

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault()
        event.stopPropagation()
        return dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()
        return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })

      case Keys.Escape:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => dispatch({ type: ActionTypes.CloseMenu }))
        state.buttonElement?.focus({ preventScroll: true })
        break

      case Keys.Tab:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => dispatch({ type: ActionTypes.CloseMenu }))
        focusFrom(
          state.buttonElement!,
          event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next
        )
        break

      default:
        if (event.key.length === 1) {
          dispatch({ type: ActionTypes.Search, value: event.key })
          searchDisposables.setTimeout(() => dispatch({ type: ActionTypes.ClearSearch }), 350)
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
      open: state.menuState === MenuStates.Open,
    } satisfies ItemsRenderPropArg
  }, [state.menuState])

  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    'aria-activedescendant':
      state.activeItemIndex === null ? undefined : state.items[state.activeItemIndex]?.id,
    'aria-labelledby': state.buttonElement?.id,
    id,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    role: 'menu',
    // When the `Menu` is closed, it should not be focusable. This allows us
    // to skip focusing the `MenuItems` when pressing the tab key on an
    // open `Menu`, and go to the next focusable element.
    tabIndex: state.menuState === MenuStates.Open ? 0 : undefined,
    ref: itemsRef,
    style: {
      ...theirProps.style,
      ...style,
      '--button-width': useElementSize(state.buttonElement, true).width,
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
  let [state, dispatch] = useMenuContext('Menu.Item')
  let active = state.activeItemIndex !== null ? state.items[state.activeItemIndex].id === id : false
  let internalItemRef = useRef<HTMLElement | null>(null)
  let itemRef = useSyncRefs(ref, internalItemRef)

  useIsoMorphicEffect(() => {
    if (state.__demoMode) return
    if (state.menuState !== MenuStates.Open) return
    if (!active) return
    if (state.activationTrigger === ActivationTrigger.Pointer) return
    return disposables().requestAnimationFrame(() => {
      internalItemRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
  }, [
    state.__demoMode,
    internalItemRef,
    active,
    state.menuState,
    state.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ state.activeItemIndex,
  ])

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
    dispatch({ type: ActionTypes.RegisterItem, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterItem, id })
  }, [bag, id])

  let close = useEvent(() => {
    dispatch({ type: ActionTypes.CloseMenu })
  })

  let handleClick = useEvent((event: MouseEvent) => {
    if (disabled) return event.preventDefault()
    dispatch({ type: ActionTypes.CloseMenu })
    restoreFocusIfNecessary(state.buttonElement)
  })

  let handleFocus = useEvent(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => {
    pointer.update(evt)
    if (disabled) return
    if (active) return
    dispatch({
      type: ActionTypes.GoToItem,
      focus: Focus.Specific,
      id,
      trigger: ActivationTrigger.Pointer,
    })
  })

  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    dispatch({
      type: ActionTypes.GoToItem,
      focus: Focus.Specific,
      id,
      trigger: ActivationTrigger.Pointer,
    })
  })

  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
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
