import { Machine, batch } from '../../machine'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'

export enum MenuState {
  Open,
  Closed,
}

export enum ActivationTrigger {
  Pointer,
  Other,
}

export type MenuItemDataRef = {
  current: {
    textValue?: string
    disabled: boolean
    domRef: { current: HTMLElement | null }
  }
}

export interface State {
  __demoMode: boolean
  menuState: MenuState

  buttonElement: HTMLButtonElement | null
  itemsElement: HTMLElement | null

  items: { id: string; dataRef: MenuItemDataRef }[]
  searchQuery: string
  activeItemIndex: number | null
  activationTrigger: ActivationTrigger

  pendingFocus: { focus: Exclude<Focus, Focus.Specific> } | { focus: Focus.Specific; id: string }
}

export enum ActionTypes {
  OpenMenu,
  CloseMenu,

  GoToItem,
  Search,
  ClearSearch,
  RegisterItems,
  UnregisterItem,

  SetButtonElement,
  SetItemsElement,
}

function adjustOrderedState(
  state: State,
  adjustment: (items: State['items']) => State['items'] = (i) => i
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

export type Actions =
  | { type: ActionTypes.CloseMenu }
  | {
      type: ActionTypes.OpenMenu
      focus: { focus: Exclude<Focus, Focus.Specific> } | { focus: Focus.Specific; id: string }
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.GoToItem; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToItem
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | { type: ActionTypes.RegisterItems; items: { id: string; dataRef: MenuItemDataRef }[] }
  | { type: ActionTypes.UnregisterItem; id: string }
  | { type: ActionTypes.SetButtonElement; element: HTMLButtonElement | null }
  | { type: ActionTypes.SetItemsElement; element: HTMLElement | null }

let reducers: {
  [P in ActionTypes]: (state: State, action: Extract<Actions, { type: P }>) => State
} = {
  [ActionTypes.CloseMenu](state) {
    if (state.menuState === MenuState.Closed) return state
    return {
      ...state,
      activeItemIndex: null,
      pendingFocus: { focus: Focus.Nothing },
      menuState: MenuState.Closed,
    }
  },
  [ActionTypes.OpenMenu](state, action) {
    if (state.menuState === MenuState.Open) return state
    return {
      ...state,
      /* We can turn off demo mode once we re-open the `Menu` */
      __demoMode: false,
      pendingFocus: action.focus,
      menuState: MenuState.Open,
    }
  },
  [ActionTypes.GoToItem]: (state, action) => {
    if (state.menuState === MenuState.Closed) return state

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
  [ActionTypes.RegisterItems]: (state, action) => {
    let items = state.items.concat(action.items.map((item) => item))

    let activeItemIndex = state.activeItemIndex
    if (state.pendingFocus.focus !== Focus.Nothing) {
      activeItemIndex = calculateActiveIndex(state.pendingFocus, {
        resolveItems: () => items,
        resolveActiveIndex: () => state.activeItemIndex,
        resolveId: (item) => item.id,
        resolveDisabled: (item) => item.dataRef.current.disabled,
      })
    }
    return {
      ...state,
      items,
      activeItemIndex,
      pendingFocus: { focus: Focus.Nothing },
      pendingShouldSort: true,
    }
  },
  [ActionTypes.UnregisterItem]: (state, action) => {
    let items = state.items
      let idx = items.findIndex((a) => a.id === action.id)
    if (idx !== -1) {
      items = items.slice()
      items.splice(idx, 1)
    }

    return {
      ...state,
      items,
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

export class MenuMachine extends Machine<State, Actions> {
  static new({ __demoMode = false } = {}) {
    return new MenuMachine({
      __demoMode,
      menuState: __demoMode ? MenuState.Open : MenuState.Closed,
      buttonElement: null,
      itemsElement: null,
      items: [],
      searchQuery: '',
      activeItemIndex: null,
      activationTrigger: ActivationTrigger.Other,
      pendingFocus: { focus: Focus.Nothing },
    })
  }

  reduce(state: Readonly<State>, action: Actions): State {
    return match(action.type, reducers, state, action)
  }

  actions = {
    // Batched version to register multiple items at the same time
    registerItem: batch(() => {
      let items: { id: string; dataRef: MenuItemDataRef }[] = []

      return [
        (id: string, dataRef: MenuItemDataRef) => items.push({ id, dataRef }),
        () => this.send({ type: ActionTypes.RegisterItems, items: items.splice(0) }),
      ]
    }),
  }
}
