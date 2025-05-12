import { Machine, batch } from '../../machine'
import { ActionTypes as StackActionTypes, stackMachines } from '../../machines/stack-machine'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'

interface MutableRefObject<T> {
  current: T
}

export enum ListboxStates {
  Open,
  Closed,
}

export enum ValueMode {
  Single,
  Multi,
}

export enum ActivationTrigger {
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
  id: string

  __demoMode: boolean

  dataRef: MutableRefObject<{
    value: unknown
    disabled: boolean
    invalid: boolean
    mode: ValueMode
    orientation: 'horizontal' | 'vertical'
    onChange: (value: T) => void
    compare(a: unknown, z: unknown): boolean
    isSelected(value: unknown): boolean

    optionsPropsRef: MutableRefObject<{
      static: boolean
      hold: boolean
    }>

    listRef: MutableRefObject<Map<string, HTMLElement | null>>
  }>

  listboxState: ListboxStates

  options: { id: string; dataRef: ListboxOptionDataRef<T> }[]
  searchQuery: string
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger

  buttonElement: HTMLButtonElement | null
  optionsElement: HTMLElement | null

  pendingShouldSort: boolean
  pendingFocus: { focus: Exclude<Focus, Focus.Specific> } | { focus: Focus.Specific; id: string }
}

export enum ActionTypes {
  OpenListbox,
  CloseListbox,

  GoToOption,
  Search,
  ClearSearch,

  RegisterOptions,
  UnregisterOptions,

  SetButtonElement,
  SetOptionsElement,

  SortOptions,
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
  | {
      type: ActionTypes.OpenListbox
      focus: { focus: Exclude<Focus, Focus.Specific> } | { focus: Focus.Specific; id: string }
    }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | {
      type: ActionTypes.RegisterOptions
      options: { id: string; dataRef: ListboxOptionDataRef<T> }[]
    }
  | { type: ActionTypes.UnregisterOptions; options: string[] }
  | { type: ActionTypes.SetButtonElement; element: HTMLButtonElement | null }
  | { type: ActionTypes.SetOptionsElement; element: HTMLElement | null }
  | { type: ActionTypes.SortOptions }

let reducers: {
  [P in ActionTypes]: <T>(state: State<T>, action: Extract<Actions<T>, { type: P }>) => State<T>
} = {
  [ActionTypes.CloseListbox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    return {
      ...state,
      activeOptionIndex: null,
      pendingFocus: { focus: Focus.Nothing },
      listboxState: ListboxStates.Closed,
      __demoMode: false,
    }
  },
  [ActionTypes.OpenListbox](state, action) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex
    let { isSelected } = state.dataRef.current
    let optionIdx = state.options.findIndex((option) => isSelected(option.dataRef.current.value))

    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx
    }

    return {
      ...state,
      pendingFocus: action.focus,
      listboxState: ListboxStates.Open,
      activeOptionIndex,
      __demoMode: false,
    }
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
  [ActionTypes.RegisterOptions]: (state, action) => {
    let options = state.options.concat(action.options)

    let activeOptionIndex = state.activeOptionIndex
    if (state.pendingFocus.focus !== Focus.Nothing) {
      activeOptionIndex = calculateActiveIndex(state.pendingFocus, {
        resolveItems: () => options,
        resolveActiveIndex: () => state.activeOptionIndex,
        resolveId: (item) => item.id,
        resolveDisabled: (item) => item.dataRef.current.disabled,
      })
    }

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      let { isSelected } = state.dataRef.current
      if (isSelected) {
        let idx = options.findIndex((option) => isSelected?.(option.dataRef.current.value))
        if (idx !== -1) activeOptionIndex = idx
      }
    }

    return {
      ...state,
      options,
      activeOptionIndex,
      pendingFocus: { focus: Focus.Nothing },
      pendingShouldSort: true,
    }
  },
  [ActionTypes.UnregisterOptions]: (state, action) => {
    let options = state.options

    let idxs = []
    let ids = new Set(action.options)
    for (let [idx, option] of options.entries()) {
      if (ids.has(option.id)) {
        idxs.push(idx)
        ids.delete(option.id)
        if (ids.size === 0) break
      }
    }

    if (idxs.length > 0) {
      options = options.slice()
      for (let idx of idxs.reverse()) {
        options.splice(idx, 1)
      }
    }

    return {
      ...state,
      options,
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
  [ActionTypes.SortOptions]: (state) => {
    if (!state.pendingShouldSort) return state

    return {
      ...state,
      ...adjustOrderedState(state),
      pendingShouldSort: false,
    }
  },
}

export class ListboxMachine<T> extends Machine<State<T>, Actions<T>> {
  static new({ id, __demoMode = false }: { id: string; __demoMode?: boolean }) {
    return new ListboxMachine({
      id,
      // @ts-expect-error TODO: Re-structure such that we don't need to ignore this
      dataRef: { current: {} },
      listboxState: __demoMode ? ListboxStates.Open : ListboxStates.Closed,
      options: [],
      searchQuery: '',
      activeOptionIndex: null,
      activationTrigger: ActivationTrigger.Other,
      buttonElement: null,
      optionsElement: null,
      pendingShouldSort: false,
      pendingFocus: { focus: Focus.Nothing },
      __demoMode,
    })
  }

  constructor(initialState: State<T>) {
    super(initialState)

    this.on(ActionTypes.RegisterOptions, () => {
      // Schedule a sort of the options when the DOM is ready. This doesn't
      // change anything rendering wise, but the sorted options are used when
      // using arrow keys so we can jump to previous / next options.
      requestAnimationFrame(() => {
        this.send({ type: ActionTypes.SortOptions })
      })
    })

    // When the listbox is open, and it's not on the top of the hierarchy, we
    // should close it again.
    {
      let id = this.state.id
      let stackMachine = stackMachines.get(null)

      this.disposables.add(
        stackMachine.on(StackActionTypes.Push, (state) => {
          if (
            !stackMachine.selectors.isTop(state, id) &&
            this.state.listboxState === ListboxStates.Open
          ) {
            this.actions.closeListbox()
          }
        })
      )

      this.on(ActionTypes.OpenListbox, () => stackMachine.actions.push(id))
      this.on(ActionTypes.CloseListbox, () => stackMachine.actions.pop(id))
    }
  }

  actions = {
    onChange: (newValue: T) => {
      let { onChange, compare, mode, value } = this.state.dataRef.current

      return match(mode, {
        [ValueMode.Single]: () => {
          return onChange?.(newValue)
        },
        [ValueMode.Multi]: () => {
          let copy = (value as T[]).slice()

          let idx = copy.findIndex((item) => compare(item, newValue))
          if (idx === -1) {
            copy.push(newValue)
          } else {
            copy.splice(idx, 1)
          }

          return onChange?.(copy as T)
        },
      })
    },
    registerOption: batch(() => {
      let options: { id: string; dataRef: ListboxOptionDataRef<T> }[] = []
      let seen = new Set<ListboxOptionDataRef<T>>()

      return [
        (id: string, dataRef: ListboxOptionDataRef<T>) => {
          if (seen.has(dataRef)) return
          seen.add(dataRef)
          options.push({ id, dataRef })
        },
        () => {
          seen.clear()
          return this.send({ type: ActionTypes.RegisterOptions, options: options.splice(0) })
        },
      ]
    }),
    unregisterOption: batch(() => {
      let options: string[] = []
      return [
        (id: string) => options.push(id),
        () => {
          this.send({ type: ActionTypes.UnregisterOptions, options: options.splice(0) })
        },
      ]
    }),
    goToOption: batch(() => {
      let last: Extract<Actions<unknown>, { type: ActionTypes.GoToOption }> | null = null
      return [
        (
          focus: { focus: Focus.Specific; id: string } | { focus: Exclude<Focus, Focus.Specific> },
          trigger?: ActivationTrigger
        ) => {
          last = { type: ActionTypes.GoToOption, ...focus, trigger }
        },
        () => last && this.send(last),
      ]
    }),
    closeListbox: () => {
      this.send({ type: ActionTypes.CloseListbox })
    },
    openListbox: (
      focus: { focus: Exclude<Focus, Focus.Specific> } | { focus: Focus.Specific; id: string }
    ) => {
      this.send({ type: ActionTypes.OpenListbox, focus })
    },
    selectActiveOption: () => {
      if (this.state.activeOptionIndex !== null) {
        let { dataRef, id } = this.state.options[this.state.activeOptionIndex]
        this.actions.onChange(dataRef.current.value)

        // It could happen that the `activeOptionIndex` stored in state is actually null,
        // but we are getting the fallback active option back instead.
        this.send({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
      }
    },
    selectOption: (id: string) => {
      let option = this.state.options.find((item) => item.id === id)
      if (!option) return

      this.actions.onChange(option.dataRef.current.value)
    },
    search: (value: string) => {
      this.send({ type: ActionTypes.Search, value })
    },
    clearSearch: () => {
      this.send({ type: ActionTypes.ClearSearch })
    },
    setButtonElement: (element: HTMLButtonElement | null) => {
      this.send({ type: ActionTypes.SetButtonElement, element })
    },
    setOptionsElement: (element: HTMLElement | null) => {
      this.send({ type: ActionTypes.SetOptionsElement, element })
    },
  }

  selectors = {
    activeDescendantId(state: State<T>) {
      let activeOptionIndex = state.activeOptionIndex
      let options = state.options
      return activeOptionIndex === null ? undefined : options[activeOptionIndex]?.id
    },

    isActive(state: State<T>, id: string) {
      let activeOptionIndex = state.activeOptionIndex
      let options = state.options

      return activeOptionIndex !== null ? options[activeOptionIndex]?.id === id : false
    },

    shouldScrollIntoView(state: State<T>, id: string) {
      if (state.__demoMode) return false
      if (state.listboxState !== ListboxStates.Open) return false
      if (state.activationTrigger === ActivationTrigger.Pointer) return false
      return this.isActive(state, id)
    },
  }

  reduce(state: Readonly<State<T>>, action: Actions<T>): State<T> {
    return match(action.type, reducers, state, action) as State<T>
  }
}
