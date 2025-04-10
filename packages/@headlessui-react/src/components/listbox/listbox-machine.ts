import { Machine } from '../../machine'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'

interface MutableRefObject<T> {
  current: T
}

enum ListboxStates {
  Open,
  Closed,
}

enum ValueMode {
  Single,
  Multi,
}

enum ActivationTrigger {
  Pointer,
  Other,
}

type ListboxOptionDataRef<T> = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
}>

interface State<T> {
  dataRef: MutableRefObject<
    {
      value: unknown
      disabled: boolean
      invalid: boolean
      mode: ValueMode
      orientation: 'horizontal' | 'vertical'
      activeOptionIndex: number | null
      compare(a: unknown, z: unknown): boolean
      isSelected(value: unknown): boolean

      optionsPropsRef: MutableRefObject<{
        static: boolean
        hold: boolean
      }>

      listRef: MutableRefObject<Map<string, HTMLElement | null>>
    } & Omit<State<T>, 'dataRef'>
  >

  listboxState: ListboxStates

  options: { id: string; dataRef: ListboxOptionDataRef<T> }[]
  searchQuery: string
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger

  buttonElement: HTMLButtonElement | null
  optionsElement: HTMLElement | null

  __demoMode: boolean
}

enum ActionTypes {
  OpenListbox,
  CloseListbox,

  GoToOption,
  Search,
  ClearSearch,

  RegisterOption,
  UnregisterOption,

  SetButtonElement,
  SetOptionsElement,
}

function adjustOrderedState<T>(
  state: State<T>,
  adjustment: (options: State<T>['options']) => State<T>['options'] = (i) => i
) {
  let currentActiveOption =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null

  let sortedOptions = sortByDomNode(
    adjustment(state.options.slice()),
    (option) => option.dataRef.current.domRef.current
  )

  // If we inserted an option before the current active option then the active option index
  // would be wrong. To fix this, we will re-lookup the correct index.
  let adjustedActiveOptionIndex = currentActiveOption
    ? sortedOptions.indexOf(currentActiveOption)
    : null

  // Reset to `null` in case the currentActiveOption was removed.
  if (adjustedActiveOptionIndex === -1) {
    adjustedActiveOptionIndex = null
  }

  return {
    options: sortedOptions,
    activeOptionIndex: adjustedActiveOptionIndex,
  }
}

type Actions<T> =
  | { type: ActionTypes.CloseListbox }
  | { type: ActionTypes.OpenListbox }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | { type: ActionTypes.RegisterOption; id: string; dataRef: ListboxOptionDataRef<T> }
  | { type: ActionTypes.UnregisterOption; id: string }
  | { type: ActionTypes.SetButtonElement; element: HTMLButtonElement | null }
  | { type: ActionTypes.SetOptionsElement; element: HTMLElement | null }

let reducers: {
  [P in ActionTypes]: <T>(state: State<T>, action: Extract<Actions<T>, { type: P }>) => State<T>
} = {
  [ActionTypes.CloseListbox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    return {
      ...state,
      activeOptionIndex: null,
      listboxState: ListboxStates.Closed,
      __demoMode: false,
    }
  },
  [ActionTypes.OpenListbox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex
    let { isSelected } = state.dataRef.current
    let optionIdx = state.options.findIndex((option) => isSelected(option.dataRef.current.value))

    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx
    }

    return { ...state, listboxState: ListboxStates.Open, activeOptionIndex, __demoMode: false }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state

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
        activeOptionIndex: null,
      }
    }

    // Optimization:
    //
    // There is no need to sort the DOM nodes if we know exactly where to go
    if (action.focus === Focus.Specific) {
      return {
        ...base,
        activeOptionIndex: state.options.findIndex((o) => o.id === action.id),
      }
    }

    // Optimization:
    //
    // If the current DOM node and the previous DOM node are next to each other,
    // or if the previous DOM node is already the first DOM node, then we don't
    // have to sort all the DOM nodes.
    else if (action.focus === Focus.Previous) {
      let activeOptionIdx = state.activeOptionIndex
      if (activeOptionIdx !== null) {
        let currentDom = state.options[activeOptionIdx].dataRef.current.domRef
        let previousOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => state.options,
          resolveActiveIndex: () => state.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled,
        })
        if (previousOptionIndex !== null) {
          let previousDom = state.options[previousOptionIndex].dataRef.current.domRef
          if (
            // Next to each other
            currentDom.current?.previousElementSibling === previousDom.current ||
            // Or already the first element
            previousDom.current?.previousElementSibling === null
          ) {
            return {
              ...base,
              activeOptionIndex: previousOptionIndex,
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
      let activeOptionIdx = state.activeOptionIndex
      if (activeOptionIdx !== null) {
        let currentDom = state.options[activeOptionIdx].dataRef.current.domRef
        let nextOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => state.options,
          resolveActiveIndex: () => state.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled,
        })
        if (nextOptionIndex !== null) {
          let nextDom = state.options[nextOptionIndex].dataRef.current.domRef
          if (
            // Next to each other
            currentDom.current?.nextElementSibling === nextDom.current ||
            // Or already the last element
            nextDom.current?.nextElementSibling === null
          ) {
            return {
              ...base,
              activeOptionIndex: nextOptionIndex,
            }
          }
        }
      }
    }

    // Slow path:
    //
    // Ensure all the options are correctly sorted according to DOM position
    let adjustedState = adjustOrderedState(state)
    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.options,
      resolveActiveIndex: () => adjustedState.activeOptionIndex,
      resolveId: (option) => option.id,
      resolveDisabled: (option) => option.dataRef.current.disabled,
    })

    return {
      ...base,
      ...adjustedState,
      activeOptionIndex,
    }
  },
  [ActionTypes.Search]: (state, action) => {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state

    let wasAlreadySearching = state.searchQuery !== ''
    let offset = wasAlreadySearching ? 0 : 1

    let searchQuery = state.searchQuery + action.value.toLowerCase()

    let reOrderedOptions =
      state.activeOptionIndex !== null
        ? state.options
            .slice(state.activeOptionIndex + offset)
            .concat(state.options.slice(0, state.activeOptionIndex + offset))
        : state.options

    let matchingOption = reOrderedOptions.find(
      (option) =>
        !option.dataRef.current.disabled &&
        option.dataRef.current.textValue?.startsWith(searchQuery)
    )

    let matchIdx = matchingOption ? state.options.indexOf(matchingOption) : -1

    if (matchIdx === -1 || matchIdx === state.activeOptionIndex) return { ...state, searchQuery }
    return {
      ...state,
      searchQuery,
      activeOptionIndex: matchIdx,
      activationTrigger: ActivationTrigger.Other,
    }
  },
  [ActionTypes.ClearSearch](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    if (state.searchQuery === '') return state
    return { ...state, searchQuery: '' }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let option = { id: action.id, dataRef: action.dataRef }
    let adjustedState = adjustOrderedState(state, (options) => [...options, option])

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      if (state.dataRef.current.isSelected(action.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
      }
    }

    return { ...state, ...adjustedState }
  },
  [ActionTypes.UnregisterOption]: (state, action) => {
    let adjustedState = adjustOrderedState(state, (options) => {
      let idx = options.findIndex((a) => a.id === action.id)
      if (idx !== -1) options.splice(idx, 1)
      return options
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
  [ActionTypes.SetOptionsElement]: (state, action) => {
    if (state.optionsElement === action.element) return state
    return { ...state, optionsElement: action.element }
  },
}

export class ListboxMachine<T> extends Machine<State<T>, Actions<T>> {
  static new({ __demoMode = false } = {}) {
    return new ListboxMachine({
      // @ts-expect-error TODO: Re-structure such that we don't need to ignore this
      dataRef: { current: {} },
      listboxState: __demoMode ? ListboxStates.Open : ListboxStates.Closed,
      options: [],
      searchQuery: '',
      activeOptionIndex: null,
      activationTrigger: ActivationTrigger.Other,
      buttonElement: null,
      optionsElement: null,
      __demoMode,
    })
  }

  actions = {
    onChange() {},
    registerOption() {},
    goToOption() {},
    closeListbox() {},
    openListbox() {},
    selectActiveOption() {},
    selectOption() {},
    search() {},
    clearSearch() {},
    setButtonElement() {},
    setOptionsElement() {},
  }

  selectors = {}

  reduce(state: Readonly<State<T>>, action: Actions<T>): State<T> {
    return match(action.type, reducers, state, action) as State<T>
  }
}
