import { Machine } from '../../machine'
import type { EnsureArray } from '../../types'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'

interface MutableRefObject<T> {
  current: T
}

enum ComboboxState {
  Open,
  Closed,
}

enum ValueMode {
  Single,
  Multi,
}

enum ActivationTrigger {
  Pointer,
  Focus,
  Other,
}

type ComboboxOptionDataRef<T> = MutableRefObject<{
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
  order: number | null
}>

interface State<T> {
  dataRef: MutableRefObject<
    {
      value: unknown
      defaultValue: unknown
      disabled: boolean
      invalid: boolean
      mode: ValueMode
      activeOptionIndex: number | null
      immediate: boolean

      virtual: { options: T[]; disabled: (value: T) => boolean } | null
      calculateIndex(value: unknown): number
      compare(a: unknown, z: unknown): boolean
      isSelected(value: unknown): boolean
      isActive(value: unknown): boolean

      __demoMode: boolean

      optionsPropsRef: MutableRefObject<{
        static: boolean
        hold: boolean
      }>
    } & Omit<State<T>, 'dataRef'>
  >

  virtual: { options: T[]; disabled: (value: unknown) => boolean } | null

  comboboxState: ComboboxState

  options: { id: string; dataRef: ComboboxOptionDataRef<T> }[]
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger

  isTyping: boolean

  inputElement: HTMLInputElement | null
  buttonElement: HTMLButtonElement | null
  optionsElement: HTMLElement | null

  __demoMode: boolean
}

enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  GoToOption,
  SetTyping,

  RegisterOption,
  UnregisterOption,

  SetActivationTrigger,

  UpdateVirtualConfiguration,

  SetInputElement,
  SetButtonElement,
  SetOptionsElement,
}

function adjustOrderedState<T>(
  state: State<T>,
  adjustment: (options: State<T>['options']) => State<T>['options'] = (i) => i
) {
  let currentActiveOption =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null

  let list = adjustment(state.options.slice())
  let sortedOptions =
    list.length > 0 && list[0].dataRef.current.order !== null
      ? // Prefer sorting based on the `order`
        list.sort((a, z) => a.dataRef.current.order! - z.dataRef.current.order!)
      : // Fallback to much slower DOM order
        sortByDomNode(list, (option) => option.dataRef.current.domRef.current)

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
  | { type: ActionTypes.CloseCombobox }
  | { type: ActionTypes.OpenCombobox }
  | {
      type: ActionTypes.GoToOption
      focus: Focus.Specific
      idx: number
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.SetTyping; isTyping: boolean }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | {
      type: ActionTypes.RegisterOption
      payload: { id: string; dataRef: ComboboxOptionDataRef<T> }
    }
  | { type: ActionTypes.UnregisterOption; id: string }
  | { type: ActionTypes.SetActivationTrigger; trigger: ActivationTrigger }
  | {
      type: ActionTypes.UpdateVirtualConfiguration
      options: T[]
      disabled: ((value: any) => boolean) | null
    }
  | { type: ActionTypes.SetInputElement; element: HTMLInputElement | null }
  | { type: ActionTypes.SetButtonElement; element: HTMLButtonElement | null }
  | { type: ActionTypes.SetOptionsElement; element: HTMLElement | null }

let reducers: {
  [P in ActionTypes]: <T>(state: State<T>, action: Extract<Actions<T>, { type: P }>) => State<T>
} = {
  [ActionTypes.CloseCombobox](state) {
    if (state.dataRef.current?.disabled) return state
    if (state.comboboxState === ComboboxState.Closed) return state

    return {
      ...state,
      activeOptionIndex: null,
      comboboxState: ComboboxState.Closed,

      isTyping: false,

      // Clear the last known activation trigger
      // This is because if a user interacts with the combobox using a mouse
      // resulting in it closing we might incorrectly handle the next interaction
      // for example, not scrolling to the active option in a virtual list
      activationTrigger: ActivationTrigger.Other,

      __demoMode: false,
    }
  },
  [ActionTypes.OpenCombobox](state) {
    if (state.dataRef.current?.disabled) return state
    if (state.comboboxState === ComboboxState.Open) return state

    // Check if we have a selected value that we can make active
    if (state.dataRef.current?.value) {
      let idx = state.dataRef.current.calculateIndex(state.dataRef.current.value)
      if (idx !== -1) {
        return {
          ...state,
          activeOptionIndex: idx,
          comboboxState: ComboboxState.Open,
          __demoMode: false,
        }
      }
    }

    return { ...state, comboboxState: ComboboxState.Open, __demoMode: false }
  },
  [ActionTypes.SetTyping](state, action) {
    if (state.isTyping === action.isTyping) return state
    return { ...state, isTyping: action.isTyping }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.dataRef.current?.disabled) return state
    if (
      state.optionsElement &&
      !state.dataRef.current?.optionsPropsRef.current.static &&
      state.comboboxState === ComboboxState.Closed
    ) {
      return state
    }

    if (state.virtual) {
      let { options, disabled } = state.virtual
      let activeOptionIndex =
        action.focus === Focus.Specific
          ? action.idx
          : calculateActiveIndex(action, {
              resolveItems: () => options,
              resolveActiveIndex: () =>
                state.activeOptionIndex ?? options.findIndex((option) => !disabled(option)) ?? null,
              resolveDisabled: disabled,
              resolveId() {
                throw new Error('Function not implemented.')
              },
            })

      let activationTrigger = action.trigger ?? ActivationTrigger.Other

      if (
        state.activeOptionIndex === activeOptionIndex &&
        state.activationTrigger === activationTrigger
      ) {
        return state
      }

      return {
        ...state,
        activeOptionIndex,
        activationTrigger,
        isTyping: false,
        __demoMode: false,
      }
    }

    let adjustedState = adjustOrderedState(state)

    // It's possible that the activeOptionIndex is set to `null` internally, but
    // this means that we will fallback to the first non-disabled option by default.
    // We have to take this into account.
    if (adjustedState.activeOptionIndex === null) {
      let localActiveOptionIndex = adjustedState.options.findIndex(
        (option) => !option.dataRef.current.disabled
      )

      if (localActiveOptionIndex !== -1) {
        adjustedState.activeOptionIndex = localActiveOptionIndex
      }
    }

    let activeOptionIndex =
      action.focus === Focus.Specific
        ? action.idx
        : calculateActiveIndex(action, {
            resolveItems: () => adjustedState.options,
            resolveActiveIndex: () => adjustedState.activeOptionIndex,
            resolveId: (item) => item.id,
            resolveDisabled: (item) => item.dataRef.current.disabled,
          })
    let activationTrigger = action.trigger ?? ActivationTrigger.Other

    if (
      state.activeOptionIndex === activeOptionIndex &&
      state.activationTrigger === activationTrigger
    ) {
      return state
    }

    return {
      ...state,
      ...adjustedState,
      isTyping: false,
      activeOptionIndex,
      activationTrigger,
      __demoMode: false,
    }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    if (state.dataRef.current?.virtual) {
      return {
        ...state,
        options: [...state.options, action.payload],
      }
    }

    let option = action.payload

    let adjustedState = adjustOrderedState(state, (options) => {
      options.push(option)
      return options
    })

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      if (state.dataRef.current?.isSelected(action.payload.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
      }
    }

    let nextState = {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }

    if (state.dataRef.current?.__demoMode && state.dataRef.current.value === undefined) {
      nextState.activeOptionIndex = 0
    }

    return nextState
  },
  [ActionTypes.UnregisterOption]: (state, action) => {
    if (state.dataRef.current?.virtual) {
      return {
        ...state,
        options: state.options.filter((option) => option.id !== action.id),
      }
    }

    let adjustedState = adjustOrderedState(state, (options) => {
      let idx = options.findIndex((option) => option.id === action.id)
      if (idx !== -1) options.splice(idx, 1)
      return options
    })

    return {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }
  },
  [ActionTypes.SetActivationTrigger]: (state, action) => {
    if (state.activationTrigger === action.trigger) {
      return state
    }

    return {
      ...state,
      activationTrigger: action.trigger,
    }
  },
  [ActionTypes.UpdateVirtualConfiguration]: (state, action) => {
    if (state.virtual === null) {
      return {
        ...state,
        virtual: { options: action.options, disabled: action.disabled ?? (() => false) },
      }
    }

    if (state.virtual.options === action.options && state.virtual.disabled === action.disabled) {
      return state
    }

    let adjustedActiveOptionIndex = state.activeOptionIndex
    if (state.activeOptionIndex !== null) {
      let idx = action.options.indexOf(state.virtual.options[state.activeOptionIndex])
      if (idx !== -1) {
        adjustedActiveOptionIndex = idx
      } else {
        adjustedActiveOptionIndex = null
      }
    }

    return {
      ...state,
      activeOptionIndex: adjustedActiveOptionIndex,
      virtual: { options: action.options, disabled: action.disabled ?? (() => false) },
    }
  },
  [ActionTypes.SetInputElement]: (state, action) => {
    if (state.inputElement === action.element) return state
    return { ...state, inputElement: action.element }
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

export class ComboboxMachine<T> extends Machine<State<T>, Actions<T>> {
  static new<T, TMultiple extends boolean | undefined>({
    virtual = null,
    __demoMode = false,
  }: {
    virtual?: {
      options: TMultiple extends true ? EnsureArray<NoInfer<T>> : NoInfer<T>[]
      disabled?: (
        value: TMultiple extends true ? EnsureArray<NoInfer<T>>[number] : NoInfer<T>
      ) => boolean
    } | null
    __demoMode?: boolean
  } = {}) {
    return new ComboboxMachine({
      // @ts-expect-error TODO: Re-structure such that we don't need to ignore this
      dataRef: { current: {} },
      comboboxState: __demoMode ? ComboboxState.Open : ComboboxState.Closed,
      isTyping: false,
      options: [],
      virtual: virtual
        ? { options: virtual.options, disabled: virtual.disabled ?? (() => false) }
        : null,
      activeOptionIndex: null,
      activationTrigger: ActivationTrigger.Other,
      inputElement: null,
      buttonElement: null,
      optionsElement: null,
      __demoMode,
    })
  }

  actions = {
    onChange() {},
    registerOption() {},
    goToOption() {},
    setIsTyping() {},
    closeCombobox() {},
    openCombobox() {},
    setActivationTrigger() {},
    selectActiveOption() {},
    setInputElement() {},
    setButtonElement() {},
    setOptionsElement() {},
  }

  selectors = {}

  reduce(state: Readonly<State<T>>, action: Actions<T>): State<T> {
    return match(action.type, reducers, state, action) as State<T>
  }
}
