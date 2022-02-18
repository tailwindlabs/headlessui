// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
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
import { forwardRefWithAs, render, Features, PropsForFeatures } from '../../utils/render'
import { disposables } from '../../utils/disposables'
import { useDisposables } from '../../hooks/use-disposables'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { isFocusableElement, FocusableMode } from '../../utils/focus-management'
import { useWindowEvent } from '../../hooks/use-window-event'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'

enum MenuStates {
  Open,
  Closed,
}

type MenuItemDataRef = MutableRefObject<{ textValue?: string; disabled: boolean }>

interface StateDefinition {
  menuState: MenuStates
  buttonRef: MutableRefObject<HTMLButtonElement | null>
  itemsRef: MutableRefObject<HTMLDivElement | null>
  items: { id: string; dataRef: MenuItemDataRef }[]
  searchQuery: string
  activeItemIndex: number | null
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

type Actions =
  | { type: ActionTypes.CloseMenu }
  | { type: ActionTypes.OpenMenu }
  | { type: ActionTypes.GoToItem; focus: Focus.Specific; id: string }
  | { type: ActionTypes.GoToItem; focus: Exclude<Focus, Focus.Specific> }
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
    return { ...state, menuState: MenuStates.Open }
  },
  [ActionTypes.GoToItem]: (state, action) => {
    let activeItemIndex = calculateActiveIndex(action, {
      resolveItems: () => state.items,
      resolveActiveIndex: () => state.activeItemIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled,
    })

    if (state.searchQuery === '' && state.activeItemIndex === activeItemIndex) return state
    return { ...state, searchQuery: '', activeItemIndex }
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
    return { ...state, searchQuery, activeItemIndex: matchIdx }
  },
  [ActionTypes.ClearSearch](state) {
    if (state.searchQuery === '') return state
    return { ...state, searchQuery: '', searchActiveItemIndex: null }
  },
  [ActionTypes.RegisterItem]: (state, action) => {
    let orderMap = Array.from(
      state.itemsRef.current?.querySelectorAll('[id^="headlessui-menu-item-"]')!
    ).reduce(
      (lookup, element, index) => Object.assign(lookup, { [element.id]: index }),
      {}
    ) as Record<string, number>

    let items = [...state.items, { id: action.id, dataRef: action.dataRef }].sort(
      (a, z) => orderMap[a.id] - orderMap[z.id]
    )

    return { ...state, items }
  },
  [ActionTypes.UnregisterItem]: (state, action) => {
    let nextItems = state.items.slice()
    let currentActiveItem = state.activeItemIndex !== null ? nextItems[state.activeItemIndex] : null

    let idx = nextItems.findIndex((a) => a.id === action.id)

    if (idx !== -1) nextItems.splice(idx, 1)

    return {
      ...state,
      items: nextItems,
      activeItemIndex: (() => {
        if (idx === state.activeItemIndex) return null
        if (currentActiveItem === null) return null

        // If we removed the item before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextItems.indexOf(currentActiveItem)
      })(),
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
}

let MenuRoot = forwardRefWithAs(function Menu<TTag extends ElementType = typeof DEFAULT_MENU_TAG>(
  props: Props<TTag, MenuRenderPropArg>,
  ref: Ref<HTMLElement>
) {
  let reducerBag = useReducer(stateReducer, {
    menuState: MenuStates.Closed,
    buttonRef: createRef(),
    itemsRef: createRef(),
    items: [],
    searchQuery: '',
    activeItemIndex: null,
  } as StateDefinition)
  let [{ menuState, itemsRef, buttonRef }, dispatch] = reducerBag
  let menuRef = useSyncRefs(ref)

  // Handle outside click
  useWindowEvent('mousedown', (event) => {
    let target = event.target as HTMLElement

    if (menuState !== MenuStates.Open) return

    if (buttonRef.current?.contains(target)) return
    if (itemsRef.current?.contains(target)) return

    dispatch({ type: ActionTypes.CloseMenu })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      buttonRef.current?.focus()
    }
  })

  let slot = useMemo<MenuRenderPropArg>(
    () => ({ open: menuState === MenuStates.Open }),
    [menuState]
  )

  return (
    <MenuContext.Provider value={reducerBag}>
      <OpenClosedProvider
        value={match(menuState, {
          [MenuStates.Open]: State.Open,
          [MenuStates.Closed]: State.Closed,
        })}
      >
        {render({
          props: { ref: menuRef, ...props },
          slot,
          defaultTag: DEFAULT_MENU_TAG,
          name: 'Menu',
        })}
      </OpenClosedProvider>
    </MenuContext.Provider>
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
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'onKeyDown'
  | 'onClick'

let Button = forwardRefWithAs(function Button<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: Ref<HTMLButtonElement>
) {
  let [state, dispatch] = useMenuContext('Menu.Button')
  let buttonRef = useSyncRefs(state.buttonRef, ref)

  let id = `headlessui-menu-button-${useId()}`
  let d = useDisposables()

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

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
    },
    [dispatch, d]
  )

  let handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }, [])

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      if (props.disabled) return
      if (state.menuState === MenuStates.Open) {
        dispatch({ type: ActionTypes.CloseMenu })
        d.nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
      } else {
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: ActionTypes.OpenMenu })
      }
    },
    [dispatch, d, state, props.disabled]
  )

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.menuState === MenuStates.Open }),
    [state]
  )
  let passthroughProps = props
  let propsWeControl = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, state.buttonRef),
    'aria-haspopup': true,
    'aria-controls': state.itemsRef.current?.id,
    'aria-expanded': props.disabled ? undefined : state.menuState === MenuStates.Open,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Menu.Button',
  })
})

// ---

let DEFAULT_ITEMS_TAG = 'div' as const
interface ItemsRenderPropArg {
  open: boolean
}
type ItemsPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-labelledby'
  | 'id'
  | 'onKeyDown'
  | 'role'
  | 'tabIndex'

let ItemsRenderFeatures = Features.RenderStrategy | Features.Static

let Items = forwardRefWithAs(function Items<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(
  props: Props<TTag, ItemsRenderPropArg, ItemsPropsWeControl> &
    PropsForFeatures<typeof ItemsRenderFeatures>,
  ref: Ref<HTMLDivElement>
) {
  let [state, dispatch] = useMenuContext('Menu.Items')
  let itemsRef = useSyncRefs(state.itemsRef, ref)

  let id = `headlessui-menu-items-${useId()}`
  let searchDisposables = useDisposables()

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return state.menuState === MenuStates.Open
  })()

  useEffect(() => {
    let container = state.itemsRef.current
    if (!container) return
    if (state.menuState !== MenuStates.Open) return
    if (container === document.activeElement) return

    container.focus({ preventScroll: true })
  }, [state.menuState, state.itemsRef])

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

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      searchDisposables.dispose()

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

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
            let { id } = state.items[state.activeItemIndex]
            document.getElementById(id)?.click()
          }
          disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
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
          break

        default:
          if (event.key.length === 1) {
            dispatch({ type: ActionTypes.Search, value: event.key })
            searchDisposables.setTimeout(() => dispatch({ type: ActionTypes.ClearSearch }), 350)
          }
          break
      }
    },
    [dispatch, searchDisposables, state]
  )

  let handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }, [])

  let slot = useMemo<ItemsRenderPropArg>(
    () => ({ open: state.menuState === MenuStates.Open }),
    [state]
  )
  let propsWeControl = {
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
  let passthroughProps = props

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_ITEMS_TAG,
    features: ItemsRenderFeatures,
    visible,
    name: 'Menu.Items',
  })
})

// ---

let DEFAULT_ITEM_TAG = Fragment
interface ItemRenderPropArg {
  active: boolean
  disabled: boolean
}
type MenuItemPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-disabled'
  | 'onPointerLeave'
  | 'onPointerMove'
  | 'onMouseLeave'
  | 'onMouseMove'
  | 'onFocus'

let Item = forwardRefWithAs(function Item<TTag extends ElementType = typeof DEFAULT_ITEM_TAG>(
  props: Props<TTag, ItemRenderPropArg, MenuItemPropsWeControl> & {
    disabled?: boolean
    onClick?: (event: { preventDefault: Function }) => void
  },
  ref: Ref<HTMLElement>
) {
  let { disabled = false, onClick, ...passthroughProps } = props
  let [state, dispatch] = useMenuContext('Menu.Item')
  let id = `headlessui-menu-item-${useId()}`
  let active = state.activeItemIndex !== null ? state.items[state.activeItemIndex].id === id : false
  let itemRef = useSyncRefs(ref)

  useIsoMorphicEffect(() => {
    if (state.menuState !== MenuStates.Open) return
    if (!active) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [id, active, state.menuState, /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ state.activeItemIndex])

  let bag = useRef<MenuItemDataRef['current']>({ disabled })

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])

  useIsoMorphicEffect(() => {
    bag.current.textValue = document.getElementById(id)?.textContent?.toLowerCase()
  }, [bag, id])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterItem, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterItem, id })
  }, [bag, id])

  let handleClick = useCallback(
    (event: MouseEvent) => {
      if (disabled) return event.preventDefault()
      dispatch({ type: ActionTypes.CloseMenu })
      disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
      if (onClick) return onClick(event)
    },
    [dispatch, state.buttonRef, disabled, onClick]
  )

  let handleFocus = useCallback(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  }, [disabled, id, dispatch])

  let handleMove = useCallback(() => {
    if (disabled) return
    if (active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  }, [disabled, active, id, dispatch])

  let handleLeave = useCallback(() => {
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
  }, [disabled, active, dispatch])

  let slot = useMemo<ItemRenderPropArg>(() => ({ active, disabled }), [active, disabled])
  let propsWeControl = {
    id,
    ref: itemRef,
    role: 'menuitem',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
    disabled: undefined, // Never forward the `disabled` prop
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_ITEM_TAG,
    name: 'Menu.Item',
  })
})

// ---

export let Menu = Object.assign(MenuRoot, { Button, Items, Item })
