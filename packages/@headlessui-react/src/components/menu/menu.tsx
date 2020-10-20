// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
import * as React from 'react'

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
import { resolvePropValue } from '../../utils/resolve-prop-value'

enum MenuStates {
  Open,
  Closed,
}

type MenuItemDataRef = React.MutableRefObject<{ textValue?: string; disabled: boolean }>

type StateDefinition = {
  menuState: MenuStates
  buttonRef: React.MutableRefObject<HTMLButtonElement | null>
  itemsRef: React.MutableRefObject<HTMLDivElement | null>
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

const reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.CloseMenu]: state => ({
    ...state,
    activeItemIndex: null,
    menuState: MenuStates.Closed,
  }),
  [ActionTypes.OpenMenu]: state => ({ ...state, menuState: MenuStates.Open }),
  [ActionTypes.GoToItem]: (state, action) => {
    const activeItemIndex = calculateActiveIndex(action, {
      resolveItems: () => state.items,
      resolveActiveIndex: () => state.activeItemIndex,
      resolveId: item => item.id,
      resolveDisabled: item => item.dataRef.current.disabled,
    })

    if (state.searchQuery === '' && state.activeItemIndex === activeItemIndex) return state
    return { ...state, searchQuery: '', activeItemIndex }
  },
  [ActionTypes.Search]: (state, action) => {
    const searchQuery = state.searchQuery + action.value
    const match = state.items.findIndex(
      item =>
        item.dataRef.current.textValue?.startsWith(searchQuery) && !item.dataRef.current.disabled
    )

    if (match === -1 || match === state.activeItemIndex) return { ...state, searchQuery }
    return { ...state, searchQuery, activeItemIndex: match }
  },
  [ActionTypes.ClearSearch]: state => ({ ...state, searchQuery: '' }),
  [ActionTypes.RegisterItem]: (state, action) => ({
    ...state,
    items: [...state.items, { id: action.id, dataRef: action.dataRef }],
  }),
  [ActionTypes.UnregisterItem]: (state, action) => {
    const nextItems = state.items.slice()
    const currentActiveItem =
      state.activeItemIndex !== null ? nextItems[state.activeItemIndex] : null

    const idx = nextItems.findIndex(a => a.id === action.id)

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

const MenuContext = React.createContext<[StateDefinition, React.Dispatch<Actions>] | null>(null)

function useMenuContext(component: string) {
  const context = React.useContext(MenuContext)
  if (context === null) {
    const err = new Error(`<${component} /> is missing a parent <${Menu.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

const DEFAULT_MENU_TAG = React.Fragment
type MenuRenderPropArg = { open: boolean }

export function Menu<TTag extends React.ElementType = typeof DEFAULT_MENU_TAG>(
  props: Props<TTag, MenuRenderPropArg>
) {
  const d = useDisposables()
  const reducerBag = React.useReducer(stateReducer, {
    menuState: MenuStates.Closed,
    buttonRef: React.createRef(),
    itemsRef: React.createRef(),
    items: [],
    searchQuery: '',
    activeItemIndex: null,
  } as StateDefinition)
  const [{ menuState, itemsRef, buttonRef }, dispatch] = reducerBag

  React.useEffect(() => {
    function handler(event: MouseEvent) {
      const target = event.target as HTMLElement
      const active = document.activeElement

      if (menuState !== MenuStates.Open) return
      if (buttonRef.current?.contains(target)) return

      if (!itemsRef.current?.contains(target)) dispatch({ type: ActionTypes.CloseMenu })
      if (active !== document.body && active?.contains(target)) return // Keep focus on newly clicked/focused element
      if (!event.defaultPrevented) buttonRef.current?.focus()
    }

    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [menuState, itemsRef, buttonRef, d, dispatch])

  const propsBag = React.useMemo(() => ({ open: menuState === MenuStates.Open }), [menuState])

  return (
    <MenuContext.Provider value={reducerBag}>
      {render(props, propsBag, DEFAULT_MENU_TAG)}
    </MenuContext.Provider>
  )
}

// ---

const DEFAULT_BUTTON_TAG = 'button'
type ButtonRenderPropArg = { open: boolean }
type ButtonPropsWeControl =
  | 'ref'
  | 'id'
  | 'type'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'onKeyDown'
  | 'onPointerUp'

const Button = forwardRefWithAs(function Button<
  TTag extends React.ElementType = typeof DEFAULT_BUTTON_TAG
>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: React.Ref<HTMLButtonElement>
) {
  const [state, dispatch] = useMenuContext([Menu.name, Button.name].join('.'))
  const buttonRef = useSyncRefs(state.buttonRef, ref)

  const id = `headlessui-menu-button-${useId()}`
  const d = useDisposables()

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          dispatch({ type: ActionTypes.OpenMenu })
          d.nextFrame(() => {
            state.itemsRef.current?.focus()
            dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          dispatch({ type: ActionTypes.OpenMenu })
          d.nextFrame(() => {
            state.itemsRef.current?.focus()
            dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })
          })
          break
      }
    },
    [dispatch, state, d]
  )

  const handlePointerUp = React.useCallback(
    (event: MouseEvent) => {
      if (props.disabled) return
      if (state.menuState === MenuStates.Open) {
        dispatch({ type: ActionTypes.CloseMenu })
        d.nextFrame(() => state.buttonRef.current?.focus())
      } else {
        event.preventDefault()
        dispatch({ type: ActionTypes.OpenMenu })
        d.nextFrame(() => state.itemsRef.current?.focus())
      }
    },
    [dispatch, d, state, props.disabled]
  )

  const propsBag = React.useMemo(() => ({ open: state.menuState === MenuStates.Open }), [state])
  const passthroughProps = props
  const propsWeControl = {
    ref: buttonRef,
    id,
    type: 'button',
    'aria-haspopup': true,
    'aria-controls': state.itemsRef.current?.id,
    'aria-expanded': state.menuState === MenuStates.Open ? true : undefined,
    onKeyDown: handleKeyDown,
    onPointerUp: handlePointerUp,
  }

  return render({ ...passthroughProps, ...propsWeControl }, propsBag, DEFAULT_BUTTON_TAG)
})

// ---

const DEFAULT_ITEMS_TAG = 'div'
type ItemsRenderPropArg = { open: boolean }
type ItemsPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-labelledby'
  | 'id'
  | 'onKeyDown'
  | 'ref'
  | 'role'
  | 'tabIndex'

const ItemsRenderFeatures = Features.RenderStrategy | Features.Static

const Items = forwardRefWithAs(function Items<
  TTag extends React.ElementType = typeof DEFAULT_ITEMS_TAG
>(
  props: Props<TTag, ItemsRenderPropArg, ItemsPropsWeControl> &
    PropsForFeatures<typeof ItemsRenderFeatures>,
  ref: React.Ref<HTMLDivElement>
) {
  const [state, dispatch] = useMenuContext([Menu.name, Items.name].join('.'))
  const itemsRef = useSyncRefs(state.itemsRef, ref)

  const id = `headlessui-menu-items-${useId()}`
  const searchDisposables = useDisposables()

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      searchDisposables.dispose()

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (state.searchQuery !== '') {
            event.preventDefault()
            return dispatch({ type: ActionTypes.Search, value: event.key })
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          dispatch({ type: ActionTypes.CloseMenu })
          if (state.activeItemIndex !== null) {
            const { id } = state.items[state.activeItemIndex]
            document.getElementById(id)?.click()
          }
          disposables().nextFrame(() => state.buttonRef.current?.focus())
          break

        case Keys.ArrowDown:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Next })

        case Keys.ArrowUp:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Previous })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })

        case Keys.Escape:
          event.preventDefault()
          dispatch({ type: ActionTypes.CloseMenu })
          disposables().nextFrame(() => state.buttonRef.current?.focus())
          break

        case Keys.Tab:
          return event.preventDefault()

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

  const propsBag = React.useMemo(() => ({ open: state.menuState === MenuStates.Open }), [state])
  const propsWeControl = {
    'aria-activedescendant':
      state.activeItemIndex === null ? undefined : state.items[state.activeItemIndex]?.id,
    'aria-labelledby': state.buttonRef.current?.id,
    id,
    onKeyDown: handleKeyDown,
    role: 'menu',
    tabIndex: 0,
    ref: itemsRef,
  }
  const passthroughProps = props

  return render(
    { ...passthroughProps, ...propsWeControl },
    propsBag,
    DEFAULT_ITEMS_TAG,
    ItemsRenderFeatures,
    state.menuState === MenuStates.Open
  )
})

// ---

const DEFAULT_ITEM_TAG = React.Fragment
type ItemRenderPropArg = { active: boolean; disabled: boolean }
type MenuItemPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-disabled'
  | 'onPointerLeave'
  | 'onFocus'

function Item<TTag extends React.ElementType = typeof DEFAULT_ITEM_TAG>(
  props: Props<TTag, ItemRenderPropArg, MenuItemPropsWeControl | 'className'> & {
    disabled?: boolean
    onClick?: (event: { preventDefault: Function }) => void

    // Special treatment, can either be a string or a function that resolves to a string
    className?: ((bag: ItemRenderPropArg) => string) | string
  }
) {
  const { disabled = false, className, onClick, ...passthroughProps } = props
  const [state, dispatch] = useMenuContext([Menu.name, Item.name].join('.'))
  const d = useDisposables()
  const id = `headlessui-menu-item-${useId()}`
  const active =
    state.activeItemIndex !== null ? state.items[state.activeItemIndex].id === id : false

  const bag = React.useRef<MenuItemDataRef['current']>({ disabled })

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

  const handleClick = React.useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      dispatch({ type: ActionTypes.CloseMenu })
      disposables().nextFrame(() => state.buttonRef.current?.focus())
      if (onClick) return onClick(event)
    },
    [d, dispatch, state.buttonRef, disabled, onClick]
  )

  const handleFocus = React.useCallback(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  }, [disabled, id, dispatch])

  const handlePointerMove = React.useCallback(() => {
    if (disabled) return
    if (active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  }, [disabled, active, id, dispatch])

  const handlePointerLeave = React.useCallback(() => {
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
  }, [disabled, active, dispatch])

  const propsBag = React.useMemo(() => ({ active, disabled }), [active, disabled])
  const propsWeControl = {
    id,
    role: 'menuitem',
    tabIndex: -1,
    className: resolvePropValue(className, propsBag),
    'aria-disabled': disabled === true ? true : undefined,
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  }

  return render({ ...passthroughProps, ...propsWeControl }, propsBag, DEFAULT_ITEM_TAG)
}

// ---

Menu.Button = Button
Menu.Items = Items
Menu.Item = Item
