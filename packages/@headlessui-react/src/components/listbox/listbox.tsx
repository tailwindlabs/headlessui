import * as React from 'react'

import { useDisposables } from '../../hooks/use-disposables'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useComputed } from '../../hooks/use-computed'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Props } from '../../types'
import { forwardRefWithAs, render } from '../../utils/render'
import { match } from '../../utils/match'
import { disposables } from '../../utils/disposables'
import { Keys } from '../keyboard'
import { Transition, TransitionClasses } from '../transitions/transition'

enum ListboxStates {
  Open,
  Closed,
}

type ListboxItemDataRef = React.MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: unknown
}>

type StateDefinition = {
  listboxState: ListboxStates
  propsRef: React.MutableRefObject<{ value: unknown; onChange(value: unknown): void }>
  labelRef: React.MutableRefObject<HTMLLabelElement | null>
  buttonRef: React.MutableRefObject<HTMLButtonElement | null>
  itemsRef: React.MutableRefObject<HTMLUListElement | null>
  items: { id: string; dataRef: ListboxItemDataRef }[]
  searchQuery: string
  activeItemIndex: number | null
}

enum ActionTypes {
  OpenListbox,
  CloseListbox,

  GoToItem,
  Search,
  ClearSearch,

  RegisterItem,
  UnregisterItem,
}

enum Focus {
  FirstItem,
  PreviousItem,
  NextItem,
  LastItem,
  SpecificItem,
  Nothing,
}

function calculateActiveItemIndex(
  state: StateDefinition,
  focus: Focus,
  id?: string
): StateDefinition['activeItemIndex'] {
  if (state.items.length <= 0) return null

  const items = state.items
  const activeItemIndex = state.activeItemIndex ?? -1

  const nextActiveIndex = match(focus, {
    [Focus.FirstItem]: () => items.findIndex(item => !item.dataRef.current.disabled),
    [Focus.PreviousItem]: () => {
      const idx = items
        .slice()
        .reverse()
        .findIndex((item, idx, all) => {
          if (activeItemIndex !== -1 && all.length - idx - 1 >= activeItemIndex) return false
          return !item.dataRef.current.disabled
        })
      if (idx === -1) return idx
      return items.length - 1 - idx
    },
    [Focus.NextItem]: () => {
      return items.findIndex((item, idx) => {
        if (idx <= activeItemIndex) return false
        return !item.dataRef.current.disabled
      })
    },
    [Focus.LastItem]: () => {
      const idx = items
        .slice()
        .reverse()
        .findIndex(item => !item.dataRef.current.disabled)
      if (idx === -1) return idx
      return items.length - 1 - idx
    },
    [Focus.SpecificItem]: () => items.findIndex(item => item.id === id),
    [Focus.Nothing]: () => null,
  })

  if (nextActiveIndex === -1) return state.activeItemIndex
  return nextActiveIndex
}

type Actions =
  | { type: ActionTypes.CloseListbox }
  | { type: ActionTypes.OpenListbox }
  | { type: ActionTypes.GoToItem; focus: Focus; id?: string }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | { type: ActionTypes.RegisterItem; id: string; dataRef: ListboxItemDataRef }
  | { type: ActionTypes.UnregisterItem; id: string }

const reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.CloseListbox]: state => ({ ...state, listboxState: ListboxStates.Closed }),
  [ActionTypes.OpenListbox]: state => ({ ...state, listboxState: ListboxStates.Open }),
  [ActionTypes.GoToItem]: (state, action) => {
    const activeItemIndex = calculateActiveItemIndex(state, action.focus, action.id)

    if (state.searchQuery === '' && state.activeItemIndex === activeItemIndex) {
      return state
    }

    return { ...state, searchQuery: '', activeItemIndex }
  },
  [ActionTypes.Search]: (state, action) => {
    const searchQuery = state.searchQuery + action.value
    const match = state.items.findIndex(
      item =>
        !item.dataRef.current.disabled && item.dataRef.current.textValue?.startsWith(searchQuery)
    )

    if (match === -1 || match === state.activeItemIndex) {
      return { ...state, searchQuery }
    }

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

const ListboxContext = React.createContext<[StateDefinition, React.Dispatch<Actions>] | null>(null)

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

function useListboxContext(component: string) {
  const context = React.useContext(ListboxContext)
  if (context === null) {
    const err = new Error(`<${component} /> is missing a parent <${Listbox.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext)
    throw err
  }
  return context
}

// ---

const DEFAULT_LISTBOX_TAG = React.Fragment

type ListboxRenderPropArg = { open: boolean }

export function Listbox<
  TTag extends React.ElementType = typeof DEFAULT_LISTBOX_TAG,
  TType = string
>(props: Props<TTag, ListboxRenderPropArg> & { value: TType; onChange(value: TType): void }) {
  const { value, onChange, ...passThroughProps } = props
  const d = useDisposables()
  const reducerBag = React.useReducer(stateReducer, {
    listboxState: ListboxStates.Closed,
    propsRef: { current: { value, onChange } },
    labelRef: React.createRef(),
    buttonRef: React.createRef(),
    itemsRef: React.createRef(),
    items: [],
    searchQuery: '',
    activeItemIndex: null,
  } as StateDefinition)
  const [{ listboxState, propsRef, itemsRef, buttonRef }, dispatch] = reducerBag

  useIsoMorphicEffect(() => {
    propsRef.current.value = value
  }, [value, propsRef])
  useIsoMorphicEffect(() => {
    propsRef.current.onChange = onChange
  }, [onChange, propsRef])

  React.useEffect(() => {
    function handler(event: MouseEvent) {
      if (listboxState !== ListboxStates.Open) return
      if (buttonRef.current?.contains(event.target as HTMLElement)) return

      if (!itemsRef.current?.contains(event.target as HTMLElement)) {
        dispatch({ type: ActionTypes.CloseListbox })
        if (!event.defaultPrevented) buttonRef.current?.focus()
      }
    }

    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [listboxState, itemsRef, buttonRef, d, dispatch])

  const propsBag = React.useMemo<ListboxRenderPropArg>(
    () => ({ open: listboxState === ListboxStates.Open }),
    [listboxState]
  )

  return (
    <ListboxContext.Provider value={reducerBag}>
      {render(passThroughProps, propsBag, DEFAULT_LISTBOX_TAG)}
    </ListboxContext.Provider>
  )
}

// ---

type ButtonPropsWeControl =
  | 'ref'
  | 'id'
  | 'type'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'onKeyDown'
  | 'onFocus'
  | 'onBlur'
  | 'onPointerUp'

const DEFAULT_BUTTON_TAG = 'button'

type ButtonRenderPropArg = { open: boolean; focused: boolean }

const Button = forwardRefWithAs(function Button<
  TTag extends React.ElementType = typeof DEFAULT_BUTTON_TAG
>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: React.Ref<HTMLButtonElement>
) {
  const [state, dispatch] = useListboxContext([Listbox.name, Button.name].join('.'))
  const buttonRef = useSyncRefs(state.buttonRef, ref)
  const [focused, setFocused] = React.useState(false)

  const id = `headlessui-listbox-button-${useId()}`
  const d = useDisposables()

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          dispatch({ type: ActionTypes.OpenListbox })
          d.nextFrame(() => {
            state.itemsRef.current?.focus()
            if (!state.propsRef.current.value)
              dispatch({ type: ActionTypes.GoToItem, focus: Focus.FirstItem })
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          dispatch({ type: ActionTypes.OpenListbox })
          d.nextFrame(() => {
            state.itemsRef.current?.focus()
            if (!state.propsRef.current.value)
              dispatch({ type: ActionTypes.GoToItem, focus: Focus.LastItem })
          })
          break
      }
    },
    [dispatch, state, d]
  )

  const handlePointerUp = React.useCallback(
    (event: MouseEvent) => {
      if (state.listboxState === ListboxStates.Open) {
        dispatch({ type: ActionTypes.CloseListbox })
      } else {
        event.preventDefault()
        dispatch({ type: ActionTypes.OpenListbox })
        d.nextFrame(() => state.itemsRef.current?.focus())
      }
    },
    [dispatch, d, state]
  )

  const handleFocus = React.useCallback(() => {
    if (state.listboxState === ListboxStates.Open) return state.itemsRef.current?.focus()
    setFocused(true)
  }, [state, setFocused])

  const handleBlur = React.useCallback(() => setFocused(false), [setFocused])
  const labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id, id].join(' ')
  }, [state.labelRef.current, id])

  const propsBag = React.useMemo<ButtonRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open, focused }),
    [state, focused]
  )
  const passthroughProps = props
  const propsWeControl = {
    ref: buttonRef,
    id,
    type: 'button',
    'aria-haspopup': true,
    'aria-controls': state.itemsRef.current?.id,
    'aria-expanded': state.listboxState === ListboxStates.Open ? true : undefined,
    'aria-labelledby': labelledby,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onPointerUp: handlePointerUp,
  }

  return render({ ...passthroughProps, ...propsWeControl }, propsBag, DEFAULT_BUTTON_TAG)
})

// ---

type LabelPropsWeControl = 'id' | 'ref' | 'onPointerUp'

const DEFAULT_LABEL_TAG = 'label'

type LabelRenderPropArg = { open: boolean }

function Label<TTag extends React.ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>
) {
  const [state] = useListboxContext([Listbox.name, Label.name].join('.'))
  const id = `headlessui-listbox-label-${useId()}`

  const handlePointerUp = React.useCallback(() => state.buttonRef.current?.focus(), [
    state.buttonRef,
  ])

  const propsBag = React.useMemo<ItemsRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open }),
    [state]
  )
  const propsWeControl = {
    ref: state.labelRef,
    id,
    onPointerUp: handlePointerUp,
  }
  return render({ ...props, ...propsWeControl }, propsBag, DEFAULT_LABEL_TAG)
}

// ---

type ItemsPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-labelledby'
  | 'id'
  | 'onKeyDown'
  | 'ref'
  | 'role'
  | 'tabIndex'

const DEFAULT_ITEMS_TAG = 'ul'

type ItemsRenderPropArg = { open: boolean }

type ListboxItemsProp<TTag> = Props<TTag, ItemsRenderPropArg, ItemsPropsWeControl> &
  TransitionClasses & { static?: boolean }

const Items = forwardRefWithAs(function Items<
  TTag extends React.ElementType = typeof DEFAULT_ITEMS_TAG
>(props: ListboxItemsProp<TTag>, ref: React.Ref<HTMLUListElement>) {
  const {
    enter,
    enterFrom,
    enterTo,
    leave,
    leaveFrom,
    leaveTo,
    static: isStatic = false,
    ...passthroughProps
  } = props
  const [state, dispatch] = useListboxContext([Listbox.name, Items.name].join('.'))
  const itemsRef = useSyncRefs(state.itemsRef, ref)

  const id = `headlessui-listbox-items-${useId()}`
  const d = useDisposables()
  const searchDisposables = useDisposables()

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      searchDisposables.dispose()

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Falthrough is expected here
        case Keys.Space:
          if (state.searchQuery !== '') {
            event.preventDefault()
            return dispatch({ type: ActionTypes.Search, value: event.key })
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          dispatch({ type: ActionTypes.CloseListbox })
          if (state.activeItemIndex !== null) {
            const { dataRef } = state.items[state.activeItemIndex]
            state.propsRef.current.onChange(dataRef.current.value)
          }
          d.nextFrame(() => state.buttonRef.current?.focus())
          break

        case Keys.ArrowDown:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.NextItem })

        case Keys.ArrowUp:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.PreviousItem })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.FirstItem })

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.LastItem })

        case Keys.Escape:
          event.preventDefault()
          dispatch({ type: ActionTypes.CloseListbox })
          return d.nextFrame(() => state.buttonRef.current?.focus())

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
    [d, dispatch, searchDisposables, state]
  )

  const labelledby = useComputed(() => state.labelRef.current?.id ?? state.buttonRef.current?.id, [
    state.labelRef.current,
    state.buttonRef.current,
  ])

  const propsBag = React.useMemo<ItemsRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open }),
    [state]
  )
  const propsWeControl = {
    'aria-activedescendant':
      state.activeItemIndex === null ? undefined : state.items[state.activeItemIndex]?.id,
    'aria-labelledby': labelledby,
    id,
    onKeyDown: handleKeyDown,
    role: 'listbox',
    tabIndex: 0,
  }

  if (isStatic) {
    return render(
      { ...passthroughProps, ...propsWeControl, ...{ ref: itemsRef } },
      propsBag,
      DEFAULT_ITEMS_TAG
    )
  }

  return (
    <Transition
      show={state.listboxState === ListboxStates.Open}
      {...{ enter, enterFrom, enterTo, leave, leaveFrom, leaveTo }}
    >
      {ref =>
        render(
          {
            ...passthroughProps,
            ...propsWeControl,
            ...{
              ref(elementRef: HTMLUListElement) {
                ref.current = elementRef
                itemsRef(elementRef)
              },
            },
          },
          propsBag,
          DEFAULT_ITEMS_TAG
        )
      }
    </Transition>
  )
})

// ---

type ListboxItemPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-disabled'
  | 'aria-selected'
  | 'onPointerLeave'
  | 'onFocus'

const DEFAULT_ITEM_TAG = 'li'

type ItemRenderPropArg = { active: boolean; selected: boolean; disabled: boolean }

function Item<TTag extends React.ElementType = typeof DEFAULT_ITEM_TAG, TType = string>(
  props: Props<TTag, ItemRenderPropArg, ListboxItemPropsWeControl | 'className'> & {
    disabled?: boolean
    value: TType

    // Special treatment, can either be a string or a function that resolves to a string
    className?: ((bag: ItemRenderPropArg) => string) | string
  }
) {
  const { disabled = false, value, className, ...passthroughProps } = props
  const [state, dispatch] = useListboxContext([Listbox.name, Item.name].join('.'))
  const d = useDisposables()
  const id = `headlessui-listbox-item-${useId()}`
  const active =
    state.activeItemIndex !== null ? state.items[state.activeItemIndex].id === id : false
  const selected = state.propsRef.current.value === value

  const bag = React.useRef<ListboxItemDataRef['current']>({ disabled, value })

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])
  useIsoMorphicEffect(() => {
    bag.current.value = value
  }, [bag, value])
  useIsoMorphicEffect(() => {
    bag.current.textValue = document.getElementById(id)?.textContent?.toLowerCase()
  }, [bag, id])

  const select = React.useCallback(() => state.propsRef.current.onChange(value), [
    state.propsRef,
    value,
  ])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterItem, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterItem, id })
  }, [bag, id])

  useIsoMorphicEffect(() => {
    if (!selected) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.SpecificItem, id })
    document.getElementById(id)?.focus?.()
  }, [])

  useIsoMorphicEffect(() => {
    if (!active) return
    const d = disposables()
    d.nextFrame(() => document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }))
    return d.dispose
  }, [active])

  const handleClick = React.useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      select()
      dispatch({ type: ActionTypes.CloseListbox })
      d.nextFrame(() => state.buttonRef.current?.focus())
    },
    [d, dispatch, state.buttonRef, disabled, select]
  )

  const handleFocus = React.useCallback(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.SpecificItem, id })
  }, [disabled, id, dispatch])

  const handlePointerMove = React.useCallback(() => {
    if (disabled) return
    if (active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.SpecificItem, id })
  }, [disabled, active, id, dispatch])

  const handlePointerLeave = React.useCallback(() => {
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
  }, [disabled, active, dispatch])

  const propsBag = React.useMemo(() => ({ active, selected, disabled }), [
    active,
    selected,
    disabled,
  ])
  const propsWeControl = {
    id,
    role: 'option',
    tabIndex: -1,
    className: resolvePropValue(className, propsBag),
    disabled: disabled === true ? true : undefined,
    'aria-disabled': disabled === true ? true : undefined,
    'aria-selected': selected === true ? true : undefined,
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  }

  return render<TTag, ItemRenderPropArg>(
    { ...passthroughProps, ...propsWeControl },
    propsBag,
    DEFAULT_ITEM_TAG
  )
}

function resolvePropValue<TProperty, TBag>(property: TProperty, bag: TBag) {
  if (property === undefined) return undefined
  if (typeof property === 'function') return property(bag)
  return property
}

// ---

Listbox.Button = Button
Listbox.Label = Label
Listbox.Items = Items
Listbox.Item = Item
