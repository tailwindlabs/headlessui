import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
  useContext,
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
  ContextType,
} from 'react'

import { useDisposables } from '../../hooks/use-disposables'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useComputed } from '../../hooks/use-computed'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Props } from '../../types'
import { Features, forwardRefWithAs, PropsForFeatures, render, compact } from '../../utils/render'
import { match } from '../../utils/match'
import { disposables } from '../../utils/disposables'
import { Keys } from '../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { sortByDomNode } from '../../utils/focus-management'
import { VisuallyHidden } from '../../internal/visually-hidden'
import { objectToFormEntries } from '../../utils/form'

enum ComboboxStates {
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

type ComboboxOptionDataRef = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: unknown
  domRef: MutableRefObject<HTMLElement | null>
}>

interface StateDefinition {
  comboboxState: ComboboxStates

  comboboxPropsRef: MutableRefObject<{
    value: unknown
    mode: ValueMode
    onChange(value: unknown): void
    nullable: boolean
    __demoMode: boolean
  }>
  inputPropsRef: MutableRefObject<{
    displayValue?(item: unknown): string
  }>
  optionsPropsRef: MutableRefObject<{
    static: boolean
    hold: boolean
  }>
  labelRef: MutableRefObject<HTMLLabelElement | null>
  inputRef: MutableRefObject<HTMLInputElement | null>
  buttonRef: MutableRefObject<HTMLButtonElement | null>
  optionsRef: MutableRefObject<HTMLUListElement | null>

  disabled: boolean
  options: { id: string; dataRef: ComboboxOptionDataRef }[]
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger
}

enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  SetDisabled,

  GoToOption,

  RegisterOption,
  UnregisterOption,
}

function adjustOrderedState(
  state: StateDefinition,
  adjustment: (options: StateDefinition['options']) => StateDefinition['options'] = (i) => i
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

type Actions =
  | { type: ActionTypes.CloseCombobox }
  | { type: ActionTypes.OpenCombobox }
  | { type: ActionTypes.SetDisabled; disabled: boolean }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.RegisterOption; id: string; dataRef: ComboboxOptionDataRef }
  | { type: ActionTypes.UnregisterOption; id: string }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.CloseCombobox](state) {
    if (state.disabled) return state
    if (state.comboboxState === ComboboxStates.Closed) return state
    return { ...state, activeOptionIndex: null, comboboxState: ComboboxStates.Closed }
  },
  [ActionTypes.OpenCombobox](state) {
    if (state.disabled) return state
    if (state.comboboxState === ComboboxStates.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex
    let { value, mode } = state.comboboxPropsRef.current
    let optionIdx = state.options.findIndex((option) => {
      let optionValue = option.dataRef.current.value
      let selected = match(mode, {
        [ValueMode.Multi]: () => (value as unknown[]).includes(optionValue),
        [ValueMode.Single]: () => value === optionValue,
      })

      return selected
    })

    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx
    }

    return { ...state, comboboxState: ComboboxStates.Open, activeOptionIndex }
  },
  [ActionTypes.SetDisabled](state, action) {
    if (state.disabled === action.disabled) return state
    return { ...state, disabled: action.disabled }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.disabled) return state
    if (
      state.optionsRef.current &&
      !state.optionsPropsRef.current.static &&
      state.comboboxState === ComboboxStates.Closed
    ) {
      return state
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

    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.options,
      resolveActiveIndex: () => adjustedState.activeOptionIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled,
    })

    return {
      ...state,
      ...adjustedState,
      activeOptionIndex,
      activationTrigger: action.trigger ?? ActivationTrigger.Other,
    }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let option = { id: action.id, dataRef: action.dataRef }
    let adjustedState = adjustOrderedState(state, (options) => [...options, option])

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      let { value, mode } = state.comboboxPropsRef.current
      let optionValue = action.dataRef.current.value
      let selected = match(mode, {
        [ValueMode.Multi]: () => (value as unknown[]).includes(optionValue),
        [ValueMode.Single]: () => value === optionValue,
      })
      if (selected) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
      }
    }

    let nextState = {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }

    if (
      state.comboboxPropsRef.current.__demoMode &&
      state.comboboxPropsRef.current.value === undefined
    ) {
      nextState.activeOptionIndex = 0
    }

    return nextState
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
}

let ComboboxContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
ComboboxContext.displayName = 'ComboboxContext'

function useComboboxContext(component: string) {
  let context = useContext(ComboboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxContext)
    throw err
  }
  return context
}

let ComboboxActions = createContext<{
  openCombobox(): void
  closeCombobox(): void
  registerOption(id: string, dataRef: ComboboxOptionDataRef): () => void
  goToOption(focus: Focus.Specific, id: string, trigger?: ActivationTrigger): void
  goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  selectOption(id: string): void
  selectActiveOption(): void
} | null>(null)
ComboboxActions.displayName = 'ComboboxActions'

function useComboboxActions() {
  let context = useContext(ComboboxActions)
  if (context === null) {
    let err = new Error(`ComboboxActions is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxActions)
    throw err
  }
  return context
}

let ComboboxData = createContext<{
  value: unknown
  mode: ValueMode
  activeOptionIndex: number | null
} | null>(null)
ComboboxData.displayName = 'ComboboxData'

function useComboboxData() {
  let context = useContext(ComboboxData)
  if (context === null) {
    let err = new Error(`ComboboxData is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxData)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_COMBOBOX_TAG = Fragment
interface ComboboxRenderPropArg<T> {
  open: boolean
  disabled: boolean
  activeIndex: number | null
  activeOption: T | null
}

let ComboboxRoot = forwardRefWithAs(function Combobox<
  TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG,
  TType = string,
  TActualType = TType extends (infer U)[] ? U : TType
>(
  props: Props<
    TTag,
    ComboboxRenderPropArg<TType>,
    'value' | 'onChange' | 'disabled' | 'name' | 'nullable' | 'multiple'
  > & {
    value: TType
    onChange(value: TType): void
    disabled?: boolean
    __demoMode?: boolean
    name?: string
    nullable?: boolean
    multiple?: boolean
  },
  ref: Ref<TTag>
) {
  let {
    name,
    value,
    onChange,
    disabled = false,
    __demoMode = false,
    nullable = false,
    multiple = false,
    ...theirProps
  } = props
  let defaultToFirstOption = useRef(false)

  let comboboxPropsRef = useRef<StateDefinition['comboboxPropsRef']['current']>({
    value,
    mode: multiple ? ValueMode.Multi : ValueMode.Single,
    onChange,
    nullable,
    __demoMode,
  })

  comboboxPropsRef.current.value = value
  comboboxPropsRef.current.mode = multiple ? ValueMode.Multi : ValueMode.Single
  comboboxPropsRef.current.nullable = nullable

  let optionsPropsRef = useRef<StateDefinition['optionsPropsRef']['current']>({
    static: false,
    hold: false,
  })
  let inputPropsRef = useRef<StateDefinition['inputPropsRef']['current']>({
    displayValue: undefined,
  })

  let reducerBag = useReducer(stateReducer, {
    comboboxState: __demoMode ? ComboboxStates.Open : ComboboxStates.Closed,
    comboboxPropsRef,
    optionsPropsRef,
    inputPropsRef,
    labelRef: createRef(),
    inputRef: createRef(),
    buttonRef: createRef(),
    optionsRef: createRef(),
    disabled,
    options: [],
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition)
  let [
    {
      comboboxState,
      options,
      activeOptionIndex: _activeOptionIndex,
      optionsRef,
      inputRef,
      buttonRef,
    },
    dispatch,
  ] = reducerBag

  let dataBag = useMemo<Exclude<ContextType<typeof ComboboxData>, null>>(
    () => ({
      value,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      get activeOptionIndex() {
        if (defaultToFirstOption.current && _activeOptionIndex === null && options.length > 0) {
          let localActiveOptionIndex = options.findIndex(
            (option) => !option.dataRef.current.disabled
          )

          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex
          }
        }

        return _activeOptionIndex
      },
    }),
    [value, _activeOptionIndex, options]
  )

  let activeOptionIndex = dataBag.activeOptionIndex

  useIsoMorphicEffect(() => {
    comboboxPropsRef.current.onChange = (value: unknown) => {
      return match(dataBag.mode, {
        [ValueMode.Single]() {
          return onChange(value as TType)
        },
        [ValueMode.Multi]() {
          let copy = (dataBag.value as TActualType[]).slice()

          let idx = copy.indexOf(value as TActualType)
          if (idx === -1) {
            copy.push(value as TActualType)
          } else {
            copy.splice(idx, 1)
          }

          return onChange(copy as unknown as TType)
        },
      })
    }
  }, [dataBag, onChange, comboboxPropsRef, dataBag])

  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetDisabled, disabled }), [disabled])

  // Handle outside click
  useOutsideClick([buttonRef, inputRef, optionsRef], () => {
    if (comboboxState !== ComboboxStates.Open) return

    dispatch({ type: ActionTypes.CloseCombobox })
  })

  let activeOption =
    activeOptionIndex === null ? null : (options[activeOptionIndex].dataRef.current.value as TType)

  let slot = useMemo<ComboboxRenderPropArg<TType>>(
    () => ({
      open: comboboxState === ComboboxStates.Open,
      disabled,
      activeIndex: activeOptionIndex,
      activeOption: activeOption,
    }),
    [comboboxState, disabled, options, activeOptionIndex]
  )

  let syncInputValue = useCallback(() => {
    if (!inputRef.current) return
    let displayValue = inputPropsRef.current.displayValue

    if (typeof displayValue === 'function') {
      inputRef.current.value = displayValue(value) ?? ''
    } else if (typeof value === 'string') {
      inputRef.current.value = value
    } else {
      inputRef.current.value = ''
    }
  }, [value, inputRef, inputPropsRef])

  let selectOption = useCallback(
    (id: string) => {
      let option = options.find((item) => item.id === id)
      if (!option) return

      let { dataRef } = option
      comboboxPropsRef.current.onChange(dataRef.current.value)
      syncInputValue()
    },
    [options, comboboxPropsRef, inputRef]
  )

  let selectActiveOption = useCallback(() => {
    if (activeOptionIndex !== null) {
      let { dataRef, id } = options[activeOptionIndex]
      comboboxPropsRef.current.onChange(dataRef.current.value)
      syncInputValue()

      // It could happen that the `activeOptionIndex` stored in state is actually null,
      // but we are getting the fallback active option back instead.
      dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
    }
  }, [activeOptionIndex, options, comboboxPropsRef, inputRef])

  let actionsBag = useMemo<ContextType<typeof ComboboxActions>>(
    () => ({
      selectOption,
      selectActiveOption,
      openCombobox() {
        dispatch({ type: ActionTypes.OpenCombobox })
        defaultToFirstOption.current = true
      },
      closeCombobox() {
        dispatch({ type: ActionTypes.CloseCombobox })
        defaultToFirstOption.current = false
      },
      goToOption(focus, id, trigger) {
        defaultToFirstOption.current = false

        if (focus === Focus.Specific) {
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id: id!, trigger })
        }

        return dispatch({ type: ActionTypes.GoToOption, focus, trigger })
      },
      registerOption(id, dataRef) {
        dispatch({ type: ActionTypes.RegisterOption, id, dataRef })
        return () => dispatch({ type: ActionTypes.UnregisterOption, id })
      },
    }),
    [selectOption, selectActiveOption, dispatch]
  )

  useIsoMorphicEffect(() => {
    if (comboboxState !== ComboboxStates.Closed) return
    syncInputValue()
  }, [syncInputValue, comboboxState])

  // Ensure that we update the inputRef if the value changes
  useIsoMorphicEffect(syncInputValue, [syncInputValue])
  let ourProps = ref === null ? {} : { ref }

  return (
    <ComboboxActions.Provider value={actionsBag}>
      <ComboboxData.Provider value={dataBag}>
        <ComboboxContext.Provider value={reducerBag}>
          <OpenClosedProvider
            value={match(comboboxState, {
              [ComboboxStates.Open]: State.Open,
              [ComboboxStates.Closed]: State.Closed,
            })}
          >
            {name != null &&
              value != null &&
              objectToFormEntries({ [name]: value }).map(([name, value]) => (
                <VisuallyHidden
                  {...compact({
                    key: name,
                    as: 'input',
                    type: 'hidden',
                    hidden: true,
                    readOnly: true,
                    name,
                    value,
                  })}
                />
              ))}
            {render({
              ourProps,
              theirProps,
              slot,
              defaultTag: DEFAULT_COMBOBOX_TAG,
              name: 'Combobox',
            })}
          </OpenClosedProvider>
        </ComboboxContext.Provider>
      </ComboboxData.Provider>
    </ComboboxActions.Provider>
  )
})

// ---

let DEFAULT_INPUT_TAG = 'input' as const
interface InputRenderPropArg {
  open: boolean
  disabled: boolean
}
type InputPropsWeControl =
  | 'id'
  | 'role'
  | 'type'
  | 'aria-labelledby'
  | 'aria-expanded'
  | 'aria-activedescendant'
  | 'onKeyDown'
  | 'onChange'
  | 'displayValue'

let Input = forwardRefWithAs(function Input<
  TTag extends ElementType = typeof DEFAULT_INPUT_TAG,
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof ComboboxRoot>[0]['value']
>(
  props: Props<TTag, InputRenderPropArg, InputPropsWeControl> & {
    displayValue?(item: TType): string
    onChange(event: React.ChangeEvent<HTMLInputElement>): void
  },
  ref: Ref<HTMLInputElement>
) {
  let { value, onChange, displayValue, ...theirProps } = props
  let [state] = useComboboxContext('Combobox.Input')
  let data = useComboboxData()
  let actions = useComboboxActions()

  let inputRef = useSyncRefs(state.inputRef, ref)
  let inputPropsRef = state.inputPropsRef

  let id = `headlessui-combobox-input-${useId()}`
  let d = useDisposables()

  let onChangeRef = useLatestValue(onChange)

  useIsoMorphicEffect(() => {
    inputPropsRef.current.displayValue = displayValue
  }, [displayValue, inputPropsRef])

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Keys.Backspace:
        case Keys.Delete:
          if (data.mode !== ValueMode.Single) return
          if (!state.comboboxPropsRef.current.nullable) return

          let input = event.currentTarget
          d.requestAnimationFrame(() => {
            if (input.value === '') {
              state.comboboxPropsRef.current.onChange(null)
              if (state.optionsRef.current) {
                state.optionsRef.current.scrollTop = 0
              }
              actions.goToOption(Focus.Nothing)
            }
          })
          break

        case Keys.Enter:
          if (state.comboboxState !== ComboboxStates.Open) return

          event.preventDefault()
          event.stopPropagation()

          if (data.activeOptionIndex === null) {
            actions.closeCombobox()
            return
          }

          actions.selectActiveOption()
          if (data.mode === ValueMode.Single) {
            actions.closeCombobox()
          }
          break

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          return match(state.comboboxState, {
            [ComboboxStates.Open]: () => {
              actions.goToOption(Focus.Next)
            },
            [ComboboxStates.Closed]: () => {
              actions.openCombobox()
              // TODO: We can't do this outside next frame because the options aren't rendered yet
              // But doing this in next frame results in a flicker because the dom mutations are async here
              // Basically:
              // Sync -> no option list yet
              // Next frame -> option list already rendered with selection -> dispatch -> next frame -> now we have the focus on the right element

              // TODO: The spec here is underspecified. There's mention of skipping to the next item when autocomplete has suggested something but nothing regarding a non-autocomplete selection/value
              d.nextFrame(() => {
                if (!data.value) {
                  actions.goToOption(Focus.Next)
                }
              })
            },
          })

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          return match(state.comboboxState, {
            [ComboboxStates.Open]: () => {
              actions.goToOption(Focus.Previous)
            },
            [ComboboxStates.Closed]: () => {
              actions.openCombobox()
              d.nextFrame(() => {
                if (!data.value) {
                  actions.goToOption(Focus.Last)
                }
              })
            },
          })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return actions.goToOption(Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return actions.goToOption(Focus.Last)

        case Keys.Escape:
          event.preventDefault()
          if (state.optionsRef.current && !state.optionsPropsRef.current.static) {
            event.stopPropagation()
          }
          return actions.closeCombobox()

        case Keys.Tab:
          actions.selectActiveOption()
          actions.closeCombobox()
          break
      }
    },
    [d, state, actions, data]
  )

  let handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      actions.openCombobox()
      onChangeRef.current?.(event)
    },
    [actions, onChangeRef]
  )

  // TODO: Verify this. The spec says that, for the input/combobox, the lebel is the labelling element when present
  // Otherwise it's the ID of the non-label element
  let labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id].join(' ')
  }, [state.labelRef.current])

  let slot = useMemo<InputRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )

  let ourProps = {
    ref: inputRef,
    id,
    role: 'combobox',
    type: 'text',
    'aria-controls': state.optionsRef.current?.id,
    'aria-expanded': state.disabled ? undefined : state.comboboxState === ComboboxStates.Open,
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : state.options[data.activeOptionIndex]?.id,
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onKeyDown: handleKeyDown,
    onChange: handleChange,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_INPUT_TAG,
    name: 'Combobox.Input',
  })
})

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
  disabled: boolean
}
type ButtonPropsWeControl =
  | 'id'
  | 'type'
  | 'tabIndex'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'disabled'
  | 'onClick'
  | 'onKeyDown'

let Button = forwardRefWithAs(function Button<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: Ref<HTMLButtonElement>
) {
  let [state] = useComboboxContext('Combobox.Button')
  let data = useComboboxData()
  let actions = useComboboxActions()
  let buttonRef = useSyncRefs(state.buttonRef, ref)

  let id = `headlessui-combobox-button-${useId()}`
  let d = useDisposables()

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLUListElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          if (state.comboboxState === ComboboxStates.Closed) {
            actions.openCombobox()
            // TODO: We can't do this outside next frame because the options aren't rendered yet
            // But doing this in next frame results in a flicker because the dom mutations are async here
            // Basically:
            // Sync -> no option list yet
            // Next frame -> option list already rendered with selection -> dispatch -> next frame -> now we have the focus on the right element

            // TODO: The spec here is underspecified. There's mention of skipping to the next item when autocomplete has suggested something but nothing regarding a non-autocomplete selection/value
            d.nextFrame(() => {
              if (!data.value) {
                actions.goToOption(Focus.First)
              }
            })
          }
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          if (state.comboboxState === ComboboxStates.Closed) {
            actions.openCombobox()
            d.nextFrame(() => {
              if (!data.value) {
                actions.goToOption(Focus.Last)
              }
            })
          }
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))

        case Keys.Escape:
          event.preventDefault()
          if (state.optionsRef.current && !state.optionsPropsRef.current.static) {
            event.stopPropagation()
          }
          actions.closeCombobox()
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))

        default:
          return
      }
    },
    [d, state, actions, data]
  )

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      if (state.comboboxState === ComboboxStates.Open) {
        actions.closeCombobox()
      } else {
        event.preventDefault()
        actions.openCombobox()
      }

      d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
    },
    [actions, d, state]
  )

  let labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id, id].join(' ')
  }, [state.labelRef.current, id])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let theirProps = props
  let ourProps = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, state.buttonRef),
    tabIndex: -1,
    'aria-haspopup': true,
    'aria-controls': state.optionsRef.current?.id,
    'aria-expanded': state.disabled ? undefined : state.comboboxState === ComboboxStates.Open,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Combobox.Button',
  })
})

// ---

let DEFAULT_LABEL_TAG = 'label' as const
interface LabelRenderPropArg {
  open: boolean
  disabled: boolean
}
type LabelPropsWeControl = 'id' | 'ref' | 'onClick'

let Label = forwardRefWithAs(function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>,
  ref: Ref<HTMLLabelElement>
) {
  let [state] = useComboboxContext('Combobox.Label')
  let id = `headlessui-combobox-label-${useId()}`
  let labelRef = useSyncRefs(state.labelRef, ref)

  let handleClick = useCallback(
    () => state.inputRef.current?.focus({ preventScroll: true }),
    [state.inputRef]
  )

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )

  let theirProps = props
  let ourProps = { ref: labelRef, id, onClick: handleClick }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Combobox.Label',
  })
})

// ---

let DEFAULT_OPTIONS_TAG = 'ul' as const
interface OptionsRenderPropArg {
  open: boolean
}
type OptionsPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-labelledby'
  | 'hold'
  | 'id'
  | 'onKeyDown'
  | 'role'
  | 'tabIndex'

let OptionsRenderFeatures = Features.RenderStrategy | Features.Static

let Options = forwardRefWithAs(function Options<
  TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG
>(
  props: Props<TTag, OptionsRenderPropArg, OptionsPropsWeControl> &
    PropsForFeatures<typeof OptionsRenderFeatures> & {
      hold?: boolean
    },
  ref: Ref<HTMLUListElement>
) {
  let { hold = false, ...theirProps } = props
  let [state] = useComboboxContext('Combobox.Options')
  let data = useComboboxData()
  let { optionsPropsRef } = state

  let optionsRef = useSyncRefs(state.optionsRef, ref)

  let id = `headlessui-combobox-options-${useId()}`

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return state.comboboxState === ComboboxStates.Open
  })()

  useIsoMorphicEffect(() => {
    optionsPropsRef.current.static = props.static ?? false
  }, [optionsPropsRef, props.static])
  useIsoMorphicEffect(() => {
    optionsPropsRef.current.hold = hold
  }, [hold, optionsPropsRef])

  useTreeWalker({
    container: state.optionsRef.current,
    enabled: state.comboboxState === ComboboxStates.Open,
    accept(node) {
      if (node.getAttribute('role') === 'option') return NodeFilter.FILTER_REJECT
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk(node) {
      node.setAttribute('role', 'none')
    },
  })

  let labelledby = useComputed(
    () => state.labelRef.current?.id ?? state.buttonRef.current?.id,
    [state.labelRef.current, state.buttonRef.current]
  )

  let slot = useMemo<OptionsRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open }),
    [state]
  )
  let ourProps = {
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : state.options[data.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    role: 'listbox',
    id,
    ref: optionsRef,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTIONS_TAG,
    features: OptionsRenderFeatures,
    visible,
    name: 'Combobox.Options',
  })
})

// ---

let DEFAULT_OPTION_TAG = 'li' as const
interface OptionRenderPropArg {
  active: boolean
  selected: boolean
  disabled: boolean
}
type ComboboxOptionPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-disabled'
  | 'aria-selected'
  | 'onPointerLeave'
  | 'onMouseLeave'
  | 'onPointerMove'
  | 'onMouseMove'

let Option = forwardRefWithAs(function Option<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof ComboboxRoot>[0]['value']
>(
  props: Props<TTag, OptionRenderPropArg, ComboboxOptionPropsWeControl | 'value'> & {
    disabled?: boolean
    value: TType
  },
  ref: Ref<HTMLLIElement>
) {
  let { disabled = false, value, ...theirProps } = props
  let [state] = useComboboxContext('Combobox.Option')
  let data = useComboboxData()
  let actions = useComboboxActions()
  let id = `headlessui-combobox-option-${useId()}`
  let active =
    data.activeOptionIndex !== null ? state.options[data.activeOptionIndex].id === id : false
  let selected = match(data.mode, {
    [ValueMode.Multi]: () => (data.value as TType[]).includes(value),
    [ValueMode.Single]: () => data.value === value,
  })
  let internalOptionRef = useRef<HTMLLIElement | null>(null)
  let bag = useRef<ComboboxOptionDataRef['current']>({ disabled, value, domRef: internalOptionRef })
  let optionRef = useSyncRefs(ref, internalOptionRef)

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])
  useIsoMorphicEffect(() => {
    bag.current.value = value
  }, [bag, value])
  useIsoMorphicEffect(() => {
    bag.current.textValue = internalOptionRef.current?.textContent?.toLowerCase()
  }, [bag, internalOptionRef])

  let select = useCallback(() => actions.selectOption(id), [actions, id])
  useIsoMorphicEffect(() => actions.registerOption(id, bag), [bag, id])

  let enableScrollIntoView = useRef(state.comboboxPropsRef.current.__demoMode ? false : true)
  useIsoMorphicEffect(() => {
    if (!state.comboboxPropsRef.current.__demoMode) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      enableScrollIntoView.current = true
    })
    return d.dispose
  }, [])

  useIsoMorphicEffect(() => {
    if (state.comboboxState !== ComboboxStates.Open) return
    if (!active) return
    if (!enableScrollIntoView.current) return
    if (state.activationTrigger === ActivationTrigger.Pointer) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [internalOptionRef, active, state.comboboxState, state.activationTrigger, /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ data.activeOptionIndex])

  let handleClick = useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      select()
      if (data.mode === ValueMode.Single) {
        actions.closeCombobox()
        disposables().nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
      }
    },
    [actions, state.inputRef, disabled, select]
  )

  let handleFocus = useCallback(() => {
    if (disabled) return actions.goToOption(Focus.Nothing)
    actions.goToOption(Focus.Specific, id)
  }, [disabled, id, actions])

  let handleMove = useCallback(() => {
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  }, [disabled, active, id, actions])

  let handleLeave = useCallback(() => {
    if (disabled) return
    if (!active) return
    if (state.optionsPropsRef.current.hold) return
    actions.goToOption(Focus.Nothing)
  }, [disabled, active, actions, state.comboboxState, state.comboboxPropsRef])

  let slot = useMemo<OptionRenderPropArg>(
    () => ({ active, selected, disabled }),
    [active, selected, disabled]
  )

  let ourProps = {
    id,
    ref: optionRef,
    role: 'option',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
    // According to the WAI-ARIA best practices, we should use aria-checked for
    // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
    // both single and multi-select.
    'aria-selected': selected === true ? true : undefined,
    disabled: undefined, // Never forward the `disabled` prop
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Combobox.Option',
  })
})

// ---

export let Combobox = Object.assign(ComboboxRoot, { Input, Button, Label, Options, Option })
