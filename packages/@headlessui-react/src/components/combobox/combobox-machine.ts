import { Machine } from '../../machine'
import { ActionTypes as StackActionTypes, stackMachines } from '../../machines/stack-machine'
import type { EnsureArray } from '../../types'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'

interface MutableRefObject<T> {
  current: T
}

export enum ComboboxState {
  Open,
  Closed,
}

export enum ValueMode {
  Single,
  Multi,
}

export enum ActivationTrigger {
  Pointer,
  Focus,
  Other,
}

export type ComboboxOptionDataRef<T> = MutableRefObject<{
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
  order: number | null
}>

export interface State<T> {
  id: string

  dataRef: MutableRefObject<{
    value: unknown
    defaultValue: unknown
    disabled: boolean
    invalid: boolean
    mode: ValueMode
    immediate: boolean
    onChange: (value: T) => void
    onClose?: () => void
    compare(a: unknown, z: unknown): boolean
    isSelected(value: unknown): boolean

    virtual: { options: T[]; disabled: (value: T) => boolean } | null
    calculateIndex(value: unknown): number

    __demoMode: boolean

    optionsPropsRef: MutableRefObject<{
      static: boolean
      hold: boolean
    }>
  }>

  virtual: { options: T[]; disabled: (value: unknown) => boolean } | null

  comboboxState: ComboboxState

  defaultToFirstOption: boolean

  options: { id: string; dataRef: ComboboxOptionDataRef<T> }[]
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger

  isTyping: boolean

  inputElement: HTMLInputElement | null
  buttonElement: HTMLButtonElement | null
  optionsElement: HTMLElement | null

  __demoMode: boolean
}

export enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  GoToOption,
  SetTyping,

  RegisterOption,
  UnregisterOption,

  DefaultToFirstOption,

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
  | { type: ActionTypes.DefaultToFirstOption; value: boolean }
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
      if (state.dataRef.current.isSelected?.(action.payload.dataRef.current.value)) {
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
  [ActionTypes.DefaultToFirstOption]: (state, action) => {
    if (state.defaultToFirstOption === action.value) return state

    return {
      ...state,
      defaultToFirstOption: action.value,
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
    id,
    virtual = null,
    __demoMode = false,
  }: {
    id: string
    virtual?: {
      options: TMultiple extends true ? EnsureArray<NoInfer<T>> : NoInfer<T>[]
      disabled?: (
        value: TMultiple extends true ? EnsureArray<NoInfer<T>>[number] : NoInfer<T>
      ) => boolean
    } | null
    __demoMode?: boolean
  }) {
    return new ComboboxMachine({
      id,
      // @ts-expect-error TODO: Re-structure such that we don't need to ignore this
      dataRef: { current: {} },
      comboboxState: __demoMode ? ComboboxState.Open : ComboboxState.Closed,
      isTyping: false,
      options: [],
      // @ts-expect-error TODO: Ensure we use the correct type
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

  constructor(initialState: State<T>) {
    super(initialState)

    // When the combobox is open, and it's not on the top of the hierarchy, we
    // should close it again.
    {
      let id = this.state.id
      let stackMachine = stackMachines.get(null)

      this.disposables.add(
        stackMachine.on(StackActionTypes.Push, (state) => {
          if (
            !stackMachine.selectors.isTop(state, id) &&
            this.state.comboboxState === ComboboxState.Open
          ) {
            this.actions.closeCombobox()
          }
        })
      )

      this.on(ActionTypes.OpenCombobox, () => stackMachine.actions.push(id))
      this.on(ActionTypes.CloseCombobox, () => stackMachine.actions.pop(id))
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
    registerOption: (id: string, dataRef: ComboboxOptionDataRef<T>) => {
      this.send({ type: ActionTypes.RegisterOption, payload: { id, dataRef } })
      return () => {
        // When we are unregistering the currently active option, then we also have to make sure to
        // reset the `defaultToFirstOption` flag, so that visually something is selected and the next
        // time you press a key on your keyboard it will go to the proper next or previous option in
        // the list.
        //
        // Since this was the active option and it could have been anywhere in the list, resetting to
        // the very first option seems like a fine default. We _could_ be smarter about this by going
        // to the previous / next item in list if we know the direction of the keyboard navigation,
        // but that might be too complex/confusing from an end users perspective.
        if (
          this.state.activeOptionIndex ===
          this.state.dataRef.current.calculateIndex(dataRef.current.value)
        ) {
          this.send({ type: ActionTypes.DefaultToFirstOption, value: true })
        }

        this.send({ type: ActionTypes.UnregisterOption, id })
      }
    },
    goToOption: (
      focus: { focus: Focus.Specific; idx: number } | { focus: Exclude<Focus, Focus.Specific> },
      trigger?: ActivationTrigger
    ) => {
      this.send({ type: ActionTypes.DefaultToFirstOption, value: false })
      return this.send({ type: ActionTypes.GoToOption, ...focus, trigger })
    },
    setIsTyping: (isTyping: boolean) => {
      this.send({ type: ActionTypes.SetTyping, isTyping })
    },
    closeCombobox: () => {
      this.send({ type: ActionTypes.CloseCombobox })
      this.send({ type: ActionTypes.DefaultToFirstOption, value: false })
      this.state.dataRef.current.onClose?.()
    },
    openCombobox: () => {
      this.send({ type: ActionTypes.OpenCombobox })
      this.send({ type: ActionTypes.DefaultToFirstOption, value: true })
    },
    setActivationTrigger: (trigger: ActivationTrigger) => {
      this.send({ type: ActionTypes.SetActivationTrigger, trigger })
    },
    selectActiveOption: () => {
      let activeOptionIndex = this.selectors.activeOptionIndex(this.state)
      if (activeOptionIndex === null) return

      this.actions.setIsTyping(false)

      if (this.state.virtual) {
        this.actions.onChange(this.state.virtual.options[activeOptionIndex])
      } else {
        let { dataRef } = this.state.options[activeOptionIndex]
        this.actions.onChange(dataRef.current.value)
      }

      // It could happen that the `activeOptionIndex` stored in state is actually null, but we are
      // getting the fallback active option back instead.
      this.actions.goToOption({ focus: Focus.Specific, idx: activeOptionIndex })
    },
    setInputElement: (element: HTMLInputElement | null) => {
      this.send({ type: ActionTypes.SetInputElement, element })
    },
    setButtonElement: (element: HTMLButtonElement | null) => {
      this.send({ type: ActionTypes.SetButtonElement, element })
    },
    setOptionsElement: (element: HTMLElement | null) => {
      this.send({ type: ActionTypes.SetOptionsElement, element })
    },
  }

  selectors = {
    activeDescendantId: (state: State<T>) => {
      let activeOptionIndex = this.selectors.activeOptionIndex(state)
      if (activeOptionIndex === null) {
        return undefined
      }

      if (!state.virtual) {
        return state.options[activeOptionIndex]?.id
      }

      return state.options.find((option) => {
        return (
          !option.dataRef.current.disabled &&
          state.dataRef.current.compare(
            option.dataRef.current.value,
            state.virtual!.options[activeOptionIndex]
          )
        )
      })?.id
    },

    activeOptionIndex: (state: State<T>) => {
      if (
        state.defaultToFirstOption &&
        state.activeOptionIndex === null &&
        (state.virtual ? state.virtual.options.length > 0 : state.options.length > 0)
      ) {
        if (state.virtual) {
          let { options, disabled } = state.virtual
          let activeOptionIndex = options.findIndex((option) => !(disabled?.(option) ?? false))

          if (activeOptionIndex !== -1) {
            return activeOptionIndex
          }
        }

        let activeOptionIndex = state.options.findIndex((option) => {
          return !option.dataRef.current.disabled
        })

        if (activeOptionIndex !== -1) {
          return activeOptionIndex
        }
      }

      return state.activeOptionIndex
    },

    activeOption: (state: State<T>) => {
      let activeOptionIndex = this.selectors.activeOptionIndex(state)
      return activeOptionIndex === null
        ? null
        : state.virtual
          ? state.virtual.options[activeOptionIndex ?? 0]
          : state.options[activeOptionIndex]?.dataRef.current.value ?? null
    },

    isActive: (state: State<T>, value: T, id: string) => {
      let activeOptionIndex = this.selectors.activeOptionIndex(state)
      if (activeOptionIndex === null) return false

      if (state.virtual) {
        return activeOptionIndex === state.dataRef.current.calculateIndex(value)
      }

      return state.options[activeOptionIndex]?.id === id
    },

    shouldScrollIntoView: (state: State<T>, value: T, id: string): boolean => {
      if (state.virtual) return false
      if (state.__demoMode) return false
      if (state.comboboxState !== ComboboxState.Open) return false
      if (state.activationTrigger === ActivationTrigger.Pointer) return false

      let active = this.selectors.isActive(state, value, id)
      if (!active) return false

      return true
    },
  }

  reduce(state: Readonly<State<T>>, action: Actions<T>): State<T> {
    return match(action.type, reducers, state, action) as State<T>
  }
}
