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
import { Features, forwardRefWithAs, PropsForFeatures, render } from '../../utils/render'
import { match } from '../../utils/match'
import { disposables } from '../../utils/disposables'
import { Keys } from '../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { useWindowEvent } from '../../hooks/use-window-event'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useTreeWalker } from '../../hooks/use-tree-walker'

enum ComboboxStates {
  Open,
  Closed,
}

type ComboboxOptionDataRef = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: unknown
}>

interface StateDefinition {
  comboboxState: ComboboxStates

  comboboxPropsRef: MutableRefObject<{
    value: unknown
    onChange(value: unknown): void
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
}

enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  SetDisabled,

  GoToOption,

  RegisterOption,
  UnregisterOption,
}

type Actions =
  | { type: ActionTypes.CloseCombobox }
  | { type: ActionTypes.OpenCombobox }
  | { type: ActionTypes.SetDisabled; disabled: boolean }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string }
  | { type: ActionTypes.GoToOption; focus: Exclude<Focus, Focus.Specific> }
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
    return { ...state, comboboxState: ComboboxStates.Open }
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
    )
      return state

    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => state.options,
      resolveActiveIndex: () => state.activeOptionIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled,
    })

    if (state.activeOptionIndex === activeOptionIndex) return state
    return { ...state, activeOptionIndex }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let currentActiveOption =
      state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null

    let orderMap = Array.from(
      state.optionsRef.current?.querySelectorAll('[id^="headlessui-combobox-option-"]')!
    ).reduce(
      (lookup, element, index) => Object.assign(lookup, { [element.id]: index }),
      {}
    ) as Record<string, number>

    let options = [...state.options, { id: action.id, dataRef: action.dataRef }].sort(
      (a, z) => orderMap[a.id] - orderMap[z.id]
    )

    let nextState = {
      ...state,
      options,
      activeOptionIndex: (() => {
        if (currentActiveOption === null) return null

        // If we inserted an option before the current active option then the
        // active option index would be wrong. To fix this, we will re-lookup
        // the correct index.
        return options.indexOf(currentActiveOption)
      })(),
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
    let nextOptions = state.options.slice()
    let currentActiveOption =
      state.activeOptionIndex !== null ? nextOptions[state.activeOptionIndex] : null

    let idx = nextOptions.findIndex((a) => a.id === action.id)

    if (idx !== -1) nextOptions.splice(idx, 1)

    return {
      ...state,
      options: nextOptions,
      activeOptionIndex: (() => {
        if (idx === state.activeOptionIndex) return null
        if (currentActiveOption === null) return null

        // If we removed the option before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextOptions.indexOf(currentActiveOption)
      })(),
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
  TType = string
>(
  props: Props<TTag, ComboboxRenderPropArg<TType>, 'value' | 'onChange' | 'disabled'> & {
    value: TType
    onChange(value: TType): void
    disabled?: boolean
    __demoMode?: boolean
  },
  ref: Ref<TTag>
) {
  let { value, onChange, disabled = false, __demoMode = false, ...passThroughProps } = props

  let comboboxPropsRef = useRef<StateDefinition['comboboxPropsRef']['current']>({
    value,
    onChange,
    __demoMode,
  })
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
  } as StateDefinition)
  let [{ comboboxState, options, activeOptionIndex, optionsRef, inputRef, buttonRef }, dispatch] =
    reducerBag

  useIsoMorphicEffect(() => {
    comboboxPropsRef.current.value = value
  }, [value, comboboxPropsRef])
  useIsoMorphicEffect(() => {
    comboboxPropsRef.current.onChange = onChange
  }, [onChange, comboboxPropsRef])

  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetDisabled, disabled }), [disabled])

  // Handle outside click
  useWindowEvent('mousedown', (event) => {
    let target = event.target as HTMLElement

    if (comboboxState !== ComboboxStates.Open) return

    if (buttonRef.current?.contains(target)) return
    if (inputRef.current?.contains(target)) return
    if (optionsRef.current?.contains(target)) return

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
    if (value === undefined) return
    let displayValue = inputPropsRef.current.displayValue

    if (typeof displayValue === 'function') {
      inputRef.current.value = displayValue(value)
    } else if (typeof value === 'string') {
      inputRef.current.value = value
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
      let { dataRef } = options[activeOptionIndex]
      comboboxPropsRef.current.onChange(dataRef.current.value)
      syncInputValue()
    }
  }, [activeOptionIndex, options, comboboxPropsRef, inputRef])

  let actionsBag = useMemo<ContextType<typeof ComboboxActions>>(
    () => ({ selectOption, selectActiveOption }),
    [selectOption, selectActiveOption]
  )

  useIsoMorphicEffect(() => {
    if (comboboxState !== ComboboxStates.Closed) return
    syncInputValue()
  }, [syncInputValue, comboboxState])

  // Ensure that we update the inputRef if the value changes
  useIsoMorphicEffect(syncInputValue, [syncInputValue])

  return (
    <ComboboxActions.Provider value={actionsBag}>
      <ComboboxContext.Provider value={reducerBag}>
        <OpenClosedProvider
          value={match(comboboxState, {
            [ComboboxStates.Open]: State.Open,
            [ComboboxStates.Closed]: State.Closed,
          })}
        >
          {render({
            props: ref === null ? passThroughProps : { ...passThroughProps, ref },
            slot,
            defaultTag: DEFAULT_COMBOBOX_TAG,
            name: 'Combobox',
          })}
        </OpenClosedProvider>
      </ComboboxContext.Provider>
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
  let { value, onChange, displayValue, ...passThroughProps } = props
  let [state, dispatch] = useComboboxContext('Combobox.Input')
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
    (event: ReactKeyboardEvent<HTMLUListElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()

          actions.selectActiveOption()
          dispatch({ type: ActionTypes.CloseCombobox })
          break

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          return match(state.comboboxState, {
            [ComboboxStates.Open]: () => {
              return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Next })
            },
            [ComboboxStates.Closed]: () => {
              dispatch({ type: ActionTypes.OpenCombobox })
              // TODO: We can't do this outside next frame because the options aren't rendered yet
              // But doing this in next frame results in a flicker because the dom mutations are async here
              // Basically:
              // Sync -> no option list yet
              // Next frame -> option list already rendered with selection -> dispatch -> next frame -> now we have the focus on the right element

              // TODO: The spec here is underspecified. There's mention of skipping to the next item when autocomplete has suggested something but nothing regarding a non-autocomplete selection/value
              d.nextFrame(() => {
                if (!state.comboboxPropsRef.current.value) {
                  dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })
                }
              })
            },
          })

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          return match(state.comboboxState, {
            [ComboboxStates.Open]: () => {
              return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Previous })
            },
            [ComboboxStates.Closed]: () => {
              dispatch({ type: ActionTypes.OpenCombobox })
              d.nextFrame(() => {
                if (!state.comboboxPropsRef.current.value) {
                  dispatch({ type: ActionTypes.GoToOption, focus: Focus.Last })
                }
              })
            },
          })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Last })

        case Keys.Escape:
          event.preventDefault()
          if (state.optionsRef.current && !state.optionsPropsRef.current.static) {
            event.stopPropagation()
          }
          return dispatch({ type: ActionTypes.CloseCombobox })

        case Keys.Tab:
          actions.selectActiveOption()
          dispatch({ type: ActionTypes.CloseCombobox })
          break
      }
    },
    [d, dispatch, state, actions]
  )

  let handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: ActionTypes.OpenCombobox })
      onChangeRef.current?.(event)
    },
    [dispatch, onChangeRef]
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

  let propsWeControl = {
    ref: inputRef,
    id,
    role: 'combobox',
    type: 'text',
    'aria-controls': state.optionsRef.current?.id,
    'aria-expanded': state.disabled ? undefined : state.comboboxState === ComboboxStates.Open,
    'aria-activedescendant':
      state.activeOptionIndex === null ? undefined : state.options[state.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onKeyDown: handleKeyDown,
    onChange: handleChange,
  }

  return render({
    props: { ...passThroughProps, ...propsWeControl },
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
  let [state, dispatch] = useComboboxContext('Combobox.Button')
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
            dispatch({ type: ActionTypes.OpenCombobox })
            // TODO: We can't do this outside next frame because the options aren't rendered yet
            // But doing this in next frame results in a flicker because the dom mutations are async here
            // Basically:
            // Sync -> no option list yet
            // Next frame -> option list already rendered with selection -> dispatch -> next frame -> now we have the focus on the right element

            // TODO: The spec here is underspecified. There's mention of skipping to the next item when autocomplete has suggested something but nothing regarding a non-autocomplete selection/value
            d.nextFrame(() => {
              if (!state.comboboxPropsRef.current.value) {
                dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })
              }
            })
          }
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          if (state.comboboxState === ComboboxStates.Closed) {
            dispatch({ type: ActionTypes.OpenCombobox })
            d.nextFrame(() => {
              if (!state.comboboxPropsRef.current.value) {
                dispatch({ type: ActionTypes.GoToOption, focus: Focus.Last })
              }
            })
          }
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))

        case Keys.Escape:
          event.preventDefault()
          if (state.optionsRef.current && !state.optionsPropsRef.current.static) {
            event.stopPropagation()
          }
          dispatch({ type: ActionTypes.CloseCombobox })
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
      }
    },
    [d, dispatch, state, actions]
  )

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      if (state.comboboxState === ComboboxStates.Open) {
        dispatch({ type: ActionTypes.CloseCombobox })
      } else {
        event.preventDefault()
        dispatch({ type: ActionTypes.OpenCombobox })
      }

      d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
    },
    [dispatch, d, state]
  )

  let labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id, id].join(' ')
  }, [state.labelRef.current, id])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let passthroughProps = props
  let propsWeControl = {
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
    props: { ...passthroughProps, ...propsWeControl },
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
  let propsWeControl = { ref: labelRef, id, onClick: handleClick }
  return render({
    props: { ...props, ...propsWeControl },
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
  let { hold = false, ...passthroughProps } = props
  let [state] = useComboboxContext('Combobox.Options')
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
  let propsWeControl = {
    'aria-activedescendant':
      state.activeOptionIndex === null ? undefined : state.options[state.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    role: 'listbox',
    id,
    ref: optionsRef,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
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
  let { disabled = false, value, ...passthroughProps } = props
  let [state, dispatch] = useComboboxContext('Combobox.Option')
  let actions = useComboboxActions()
  let id = `headlessui-combobox-option-${useId()}`
  let active =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex].id === id : false
  let selected = state.comboboxPropsRef.current.value === value
  let bag = useRef<ComboboxOptionDataRef['current']>({ disabled, value })
  let optionRef = useSyncRefs(ref)

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])
  useIsoMorphicEffect(() => {
    bag.current.value = value
  }, [bag, value])
  useIsoMorphicEffect(() => {
    bag.current.textValue = document.getElementById(id)?.textContent?.toLowerCase()
  }, [bag, id])

  let select = useCallback(() => actions.selectOption(id), [actions, id])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  }, [bag, id])

  useIsoMorphicEffect(() => {
    if (state.comboboxState !== ComboboxStates.Open) return
    if (!selected) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
  }, [state.comboboxState, selected, id])

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
    let d = disposables()
    d.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [id, active, state.comboboxState, /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ state.activeOptionIndex])

  let handleClick = useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      select()
      dispatch({ type: ActionTypes.CloseCombobox })
      disposables().nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
    },
    [dispatch, state.inputRef, disabled, select]
  )

  let handleFocus = useCallback(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
  }, [disabled, id, dispatch])

  let handleMove = useCallback(() => {
    if (disabled) return
    if (active) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
  }, [disabled, active, id, dispatch])

  let handleLeave = useCallback(() => {
    if (disabled) return
    if (!active) return
    if (state.optionsPropsRef.current.hold) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Nothing })
  }, [disabled, active, dispatch, state.comboboxState, state.comboboxPropsRef])

  let slot = useMemo<OptionRenderPropArg>(
    () => ({ active, selected, disabled }),
    [active, selected, disabled]
  )

  let propsWeControl = {
    id,
    ref: optionRef,
    role: 'option',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
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
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Combobox.Option',
  })
})

// ---

export let Combobox = Object.assign(ComboboxRoot, { Input, Button, Label, Options, Option })
