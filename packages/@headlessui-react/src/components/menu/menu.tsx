// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/
import React, {
  Fragment,
  createContext,
  createRef,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,

  // Types
  Dispatch,
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  Ref,
} from 'react'

import { Props } from '../../types'
import { match } from '../../utils/match'
import {
  forwardRefWithAs,
  render,
  Features,
  PropsForFeatures,
  HasDisplayName,
  RefProp,
} from '../../utils/render'
import { disposables } from '../../utils/disposables'
import { useDisposables } from '../../hooks/use-disposables'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import {
  isFocusableElement,
  FocusableMode,
  sortByDomNode,
  Focus as FocusManagementFocus,
  focusFrom,
  restoreFocusIfNecessary,
} from '../../utils/focus-management'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useEvent } from '../../hooks/use-event'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { useTextValue } from '../../hooks/use-text-value'

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
  buttonRef: MutableRefObject<HTMLButtonElement | null>
  itemsRef: MutableRefObject<HTMLDivElement | null>
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
    let adjustedState = adjustOrderedState(state)
    let activeItemIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.items,
      resolveActiveIndex: () => adjustedState.activeItemIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled,
    })

    return {
      ...state,
      ...adjustedState,
      searchQuery: '',
      activeItemIndex,
      activationTrigger: action.trigger ?? ActivationTrigger.Other,
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
interface MenuRenderPropArg {
  open: boolean
  close: () => void
}

export type MenuProps<TTag extends ElementType> = Props<
  TTag,
  MenuRenderPropArg,
  never,
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
    buttonRef: createRef(),
    itemsRef: createRef(),
    items: [],
    searchQuery: '',
    activeItemIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition)
  let [{ menuState, itemsRef, buttonRef }, dispatch] = reducerBag
  let menuRef = useSyncRefs(ref)

  // Handle outside click
  useOutsideClick(
    [buttonRef, itemsRef],
    (event, target) => {
      dispatch({ type: ActionTypes.CloseMenu })

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        buttonRef.current?.focus()
      }
    },
    menuState === MenuStates.Open
  )

  let close = useEvent(() => {
    dispatch({ type: ActionTypes.CloseMenu })
  })

  let slot = useMemo<MenuRenderPropArg>(
    () => ({ open: menuState === MenuStates.Open, close }),
    [menuState, close]
  )

  let ourProps = { ref: menuRef }

  return (
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
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
}
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded' | 'aria-haspopup'

export type MenuButtonProps<TTag extends ElementType> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    disabled?: boolean
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: MenuButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let { id = `headlessui-menu-button-${internalId}`, ...theirProps } = props
  let [state, dispatch] = useMenuContext('Menu.Button')
  let buttonRef = useSyncRefs(state.buttonRef, ref)

  let d = useDisposables()

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: ActionTypes.OpenMenu })
        d.nextFrame(() => dispatch({ type: ActionTypes.GoToItem, focus: Focus.First }))
        break

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: ActionTypes.OpenMenu })
        d.nextFrame(() => dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last }))
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
    if (props.disabled) return
    if (state.menuState === MenuStates.Open) {
      dispatch({ type: ActionTypes.CloseMenu })
      d.nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
    } else {
      event.preventDefault()
      dispatch({ type: ActionTypes.OpenMenu })
    }
  })

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.menuState === MenuStates.Open }),
    [state]
  )
  let ourProps = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, state.buttonRef),
    'aria-haspopup': 'menu',
    'aria-controls': state.itemsRef.current?.id,
    'aria-expanded': state.menuState === MenuStates.Open,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick,
  }

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
interface ItemsRenderPropArg {
  open: boolean
}
type ItemsPropsWeControl = 'aria-activedescendant' | 'aria-labelledby' | 'role' | 'tabIndex'

let ItemsRenderFeatures = Features.RenderStrategy | Features.Static

export type MenuItemsProps<TTag extends ElementType> = Props<
  TTag,
  ItemsRenderPropArg,
  ItemsPropsWeControl
> &
  PropsForFeatures<typeof ItemsRenderFeatures>

function ItemsFn<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(
  props: MenuItemsProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let { id = `headlessui-menu-items-${internalId}`, ...theirProps } = props
  let [state, dispatch] = useMenuContext('Menu.Items')
  let itemsRef = useSyncRefs(state.itemsRef, ref)
  let ownerDocument = useOwnerDocument(state.itemsRef)

  let searchDisposables = useDisposables()

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return state.menuState === MenuStates.Open
  })()

  useEffect(() => {
    let container = state.itemsRef.current
    if (!container) return
    if (state.menuState !== MenuStates.Open) return
    if (container === ownerDocument?.activeElement) return

    container.focus({ preventScroll: true })
  }, [state.menuState, state.itemsRef, ownerDocument])

  useTreeWalker({
    container: state.itemsRef.current,
    enabled: state.menuState === MenuStates.Open,
    accept(node) {
      if (node.getAttribute('role') === 'menuitem') return NodeFilter.FILTER_REJECT
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk(node) {
      node.setAttribute('role', 'none')
    },
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLDivElement>) => {
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
        restoreFocusIfNecessary(state.buttonRef.current)
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
        dispatch({ type: ActionTypes.CloseMenu })
        disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
        break

      case Keys.Tab:
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: ActionTypes.CloseMenu })
        disposables().nextFrame(() => {
          focusFrom(
            state.buttonRef.current!,
            event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next
          )
        })
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

  let slot = useMemo<ItemsRenderPropArg>(
    () => ({ open: state.menuState === MenuStates.Open }),
    [state]
  )

  let ourProps = {
    'aria-activedescendant':
      state.activeItemIndex === null ? undefined : state.items[state.activeItemIndex]?.id,
    'aria-labelledby': state.buttonRef.current?.id,
    id,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    role: 'menu',
    tabIndex: 0,
    ref: itemsRef,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_ITEMS_TAG,
    features: ItemsRenderFeatures,
    visible,
    name: 'Menu.Items',
  })
}

// ---

let DEFAULT_ITEM_TAG = Fragment
interface ItemRenderPropArg {
  active: boolean
  disabled: boolean
  close: () => void
}
type ItemPropsWeControl = 'aria-disabled' | 'role' | 'tabIndex'

export type MenuItemProps<TTag extends ElementType> = Props<
  TTag,
  ItemRenderPropArg,
  ItemPropsWeControl
> & {
  disabled?: boolean
}

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
    let d = disposables()
    d.requestAnimationFrame(() => {
      internalItemRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
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
    restoreFocusIfNecessary(state.buttonRef.current)
  })

  let handleFocus = useEvent(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => pointer.update(evt))

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

  let slot = useMemo<ItemRenderPropArg>(
    () => ({ active, disabled, close }),
    [active, disabled, close]
  )
  let ourProps = {
    id,
    ref: itemRef,
    role: 'menuitem',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
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

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_ITEM_TAG,
    name: 'Menu.Item',
  })
}

// ---

interface ComponentMenu extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_MENU_TAG>(
    props: MenuProps<TTag> & RefProp<typeof MenuFn>
  ): JSX.Element
}

interface ComponentMenuButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: MenuButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

interface ComponentMenuItems extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(
    props: MenuItemsProps<TTag> & RefProp<typeof ItemsFn>
  ): JSX.Element
}

interface ComponentMenuItem extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_ITEM_TAG>(
    props: MenuItemProps<TTag> & RefProp<typeof ItemFn>
  ): JSX.Element
}

let MenuRoot = forwardRefWithAs(MenuFn) as unknown as ComponentMenu
let Button = forwardRefWithAs(ButtonFn) as unknown as ComponentMenuButton
let Items = forwardRefWithAs(ItemsFn) as unknown as ComponentMenuItems
let Item = forwardRefWithAs(ItemFn) as unknown as ComponentMenuItem

export let Menu = Object.assign(MenuRoot, { Button, Items, Item })
