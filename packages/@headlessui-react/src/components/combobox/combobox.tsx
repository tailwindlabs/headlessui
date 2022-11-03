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
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  Ref,
} from 'react'
import { ByComparator, EnsureArray, Expand, Props } from '../../types'

import { useComputed } from '../../hooks/use-computed'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTreeWalker } from '../../hooks/use-tree-walker'

import { calculateActiveIndex, Focus } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import { forwardRefWithAs, render, compact, PropsForFeatures, Features } from '../../utils/render'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { match } from '../../utils/match'
import { objectToFormEntries } from '../../utils/form'
import { sortByDomNode } from '../../utils/focus-management'

import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'

import { Keys } from '../keyboard'
import { useControllable } from '../../hooks/use-controllable'
import { useWatch } from '../../hooks/use-watch'

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
  Other,
}

type ComboboxOptionDataRef<T> = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
}>

interface StateDefinition<T> {
  dataRef: MutableRefObject<_Data>
  labelId: string | null

  comboboxState: ComboboxState

  options: { id: string; dataRef: ComboboxOptionDataRef<T> }[]
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger
}

enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  GoToOption,

  RegisterOption,
  UnregisterOption,

  RegisterLabel,
}

function adjustOrderedState<T>(
  state: StateDefinition<T>,
  adjustment: (options: StateDefinition<T>['options']) => StateDefinition<T>['options'] = (i) => i
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
  | { type: ActionTypes.CloseCombobox }
  | { type: ActionTypes.OpenCombobox }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.RegisterOption; id: string; dataRef: ComboboxOptionDataRef<T> }
  | { type: ActionTypes.RegisterLabel; id: string | null }
  | { type: ActionTypes.UnregisterOption; id: string }

let reducers: {
  [P in ActionTypes]: <T>(
    state: StateDefinition<T>,
    action: Extract<Actions<T>, { type: P }>
  ) => StateDefinition<T>
} = {
  [ActionTypes.CloseCombobox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.comboboxState === ComboboxState.Closed) return state
    return { ...state, activeOptionIndex: null, comboboxState: ComboboxState.Closed }
  },
  [ActionTypes.OpenCombobox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.comboboxState === ComboboxState.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex
    let { isSelected } = state.dataRef.current
    let optionIdx = state.options.findIndex((option) => isSelected(option.dataRef.current.value))

    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx
    }

    return { ...state, comboboxState: ComboboxState.Open, activeOptionIndex }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.dataRef.current.disabled) return state
    if (
      state.dataRef.current.optionsRef.current &&
      !state.dataRef.current.optionsPropsRef.current.static &&
      state.comboboxState === ComboboxState.Closed
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
      if (state.dataRef.current.isSelected(action.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
      }
    }

    let nextState = {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }

    if (state.dataRef.current.__demoMode && state.dataRef.current.value === undefined) {
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
  [ActionTypes.RegisterLabel]: (state, action) => {
    return {
      ...state,
      labelId: action.id,
    }
  },
}

let ComboboxActionsContext = createContext<{
  openCombobox(): void
  closeCombobox(): void
  registerOption(id: string, dataRef: ComboboxOptionDataRef<unknown>): () => void
  registerLabel(id: string): () => void
  goToOption(focus: Focus.Specific, id: string, trigger?: ActivationTrigger): void
  goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  selectOption(id: string): void
  selectActiveOption(): void
  onChange(value: unknown): void
} | null>(null)
ComboboxActionsContext.displayName = 'ComboboxActionsContext'

function useActions(component: string) {
  let context = useContext(ComboboxActionsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}
type _Actions = ReturnType<typeof useActions>

let ComboboxDataContext = createContext<
  | ({
      value: unknown
      disabled: boolean
      mode: ValueMode
      activeOptionIndex: number | null
      nullable: boolean
      compare(a: unknown, z: unknown): boolean
      isSelected(value: unknown): boolean
      __demoMode: boolean

      optionsPropsRef: MutableRefObject<{
        static: boolean
        hold: boolean
      }>

      labelRef: MutableRefObject<HTMLLabelElement | null>
      inputRef: MutableRefObject<HTMLInputElement | null>
      buttonRef: MutableRefObject<HTMLButtonElement | null>
      optionsRef: MutableRefObject<HTMLUListElement | null>
    } & Omit<StateDefinition<unknown>, 'dataRef'>)
  | null
>(null)
ComboboxDataContext.displayName = 'ComboboxDataContext'

function useData(component: string) {
  let context = useContext(ComboboxDataContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
type _Data = ReturnType<typeof useData>

function stateReducer<T>(state: StateDefinition<T>, action: Actions<T>) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_COMBOBOX_TAG = Fragment
interface ComboboxRenderPropArg<T> {
  open: boolean
  disabled: boolean
  activeIndex: number | null
  activeOption: T | null
  value: T
}

type O = 'value' | 'defaultValue' | 'nullable' | 'multiple' | 'onChange' | 'by'

type ComboboxValueProps<
  TValue,
  TNullable extends boolean | undefined,
  TMultiple extends boolean | undefined,
  TTag extends ElementType
> = Extract<
  | ({
      value?: EnsureArray<TValue>
      defaultValue?: EnsureArray<TValue>
      nullable: true // We ignore `nullable` in multiple mode
      multiple: true
      onChange?(value: EnsureArray<TValue>): void
      by?: ByComparator<TValue>
    } & Props<TTag, ComboboxRenderPropArg<EnsureArray<TValue>>, O>)
  | ({
      value?: TValue | null
      defaultValue?: TValue | null
      nullable: true
      multiple?: false
      onChange?(value: TValue | null): void
      by?: ByComparator<TValue | null>
    } & Expand<Props<TTag, ComboboxRenderPropArg<TValue | null>, O>>)
  | ({
      value?: EnsureArray<TValue>
      defaultValue?: EnsureArray<TValue>
      nullable?: false
      multiple: true
      onChange?(value: EnsureArray<TValue>): void
      by?: ByComparator<TValue extends Array<infer U> ? U : TValue>
    } & Expand<Props<TTag, ComboboxRenderPropArg<EnsureArray<TValue>>, O>>)
  | ({
      value?: TValue
      nullable?: false
      multiple?: false
      defaultValue?: TValue
      onChange?(value: TValue): void
      by?: ByComparator<TValue>
    } & Props<TTag, ComboboxRenderPropArg<TValue>, O>),
  { nullable?: TNullable; multiple?: TMultiple }
>

type ComboboxProps<
  TValue,
  TNullable extends boolean | undefined,
  TMultiple extends boolean | undefined,
  TTag extends ElementType
> = ComboboxValueProps<TValue, TNullable, TMultiple, TTag> & {
  disabled?: boolean
  __demoMode?: boolean
  name?: string
}

function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, true, true, TTag>,
  ref: Ref<TTag>
): JSX.Element
function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, true, false, TTag>,
  ref: Ref<TTag>
): JSX.Element
function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, false, false, TTag>,
  ref: Ref<TTag>
): JSX.Element
function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, false, true, TTag>,
  ref: Ref<TTag>
): JSX.Element

function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, boolean | undefined, boolean | undefined, TTag>,
  ref: Ref<TTag>
) {
  let {
    value: controlledValue,
    defaultValue,
    onChange: controlledOnChange,
    name,
    by = (a: any, z: any) => a === z,
    disabled = false,
    __demoMode = false,
    nullable = false,
    multiple = false,
    ...theirProps
  } = props
  let [value, theirOnChange] = useControllable<any>(
    controlledValue,
    controlledOnChange,
    defaultValue
  )

  let [state, dispatch] = useReducer(stateReducer, {
    dataRef: createRef(),
    comboboxState: __demoMode ? ComboboxState.Open : ComboboxState.Closed,
    options: [],
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
    labelId: null,
  } as StateDefinition<TValue>)

  let defaultToFirstOption = useRef(false)

  let optionsPropsRef = useRef<_Data['optionsPropsRef']['current']>({ static: false, hold: false })

  let labelRef = useRef<_Data['labelRef']['current']>(null)
  let inputRef = useRef<_Data['inputRef']['current']>(null)
  let buttonRef = useRef<_Data['buttonRef']['current']>(null)
  let optionsRef = useRef<_Data['optionsRef']['current']>(null)

  let compare = useEvent(
    typeof by === 'string'
      ? (a, z) => {
          let property = by as unknown as keyof TValue
          return a?.[property] === z?.[property]
        }
      : by
  )

  let isSelected: (value: unknown) => boolean = useCallback(
    (compareValue) =>
      match(data.mode, {
        [ValueMode.Multi]: () =>
          (value as EnsureArray<TValue>).some((option) => compare(option, compareValue)),
        [ValueMode.Single]: () => compare(value as TValue, compareValue),
      }),
    [value]
  )

  let data = useMemo<_Data>(
    () => ({
      ...state,
      optionsPropsRef,
      labelRef,
      inputRef,
      buttonRef,
      optionsRef,
      value,
      disabled,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      get activeOptionIndex() {
        if (
          defaultToFirstOption.current &&
          state.activeOptionIndex === null &&
          state.options.length > 0
        ) {
          let localActiveOptionIndex = state.options.findIndex(
            (option) => !option.dataRef.current.disabled
          )

          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex
          }
        }

        return state.activeOptionIndex
      },
      compare,
      isSelected,
      nullable,
      __demoMode,
    }),
    [value, disabled, multiple, nullable, __demoMode, state]
  )

  useIsoMorphicEffect(() => {
    state.dataRef.current = data
  }, [data])

  // Handle outside click
  useOutsideClick(
    [data.buttonRef, data.inputRef, data.optionsRef],
    () => dispatch({ type: ActionTypes.CloseCombobox }),
    data.comboboxState === ComboboxState.Open
  )

  let slot = useMemo<ComboboxRenderPropArg<unknown>>(
    () => ({
      open: data.comboboxState === ComboboxState.Open,
      disabled,
      activeIndex: data.activeOptionIndex,
      activeOption:
        data.activeOptionIndex === null
          ? null
          : (data.options[data.activeOptionIndex].dataRef.current.value as TValue),
      value,
    }),
    [data, disabled, value]
  )

  let selectOption = useEvent((id: string) => {
    let option = data.options.find((item) => item.id === id)
    if (!option) return

    onChange(option.dataRef.current.value)
  })

  let selectActiveOption = useEvent(() => {
    if (data.activeOptionIndex !== null) {
      let { dataRef, id } = data.options[data.activeOptionIndex]
      onChange(dataRef.current.value)

      // It could happen that the `activeOptionIndex` stored in state is actually null,
      // but we are getting the fallback active option back instead.
      dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
    }
  })

  let openCombobox = useEvent(() => {
    dispatch({ type: ActionTypes.OpenCombobox })
    defaultToFirstOption.current = true
  })

  let closeCombobox = useEvent(() => {
    dispatch({ type: ActionTypes.CloseCombobox })
    defaultToFirstOption.current = false
  })

  let goToOption = useEvent((focus, id, trigger) => {
    defaultToFirstOption.current = false

    if (focus === Focus.Specific) {
      return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id: id!, trigger })
    }

    return dispatch({ type: ActionTypes.GoToOption, focus, trigger })
  })

  let registerOption = useEvent((id, dataRef) => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  })

  let registerLabel = useEvent((id) => {
    dispatch({ type: ActionTypes.RegisterLabel, id })
    return () => dispatch({ type: ActionTypes.RegisterLabel, id: null })
  })

  let onChange = useEvent((value: unknown) => {
    return match(data.mode, {
      [ValueMode.Single]() {
        return theirOnChange?.(value as TValue)
      },
      [ValueMode.Multi]() {
        let copy = (data.value as TValue[]).slice()

        let idx = copy.findIndex((item) => compare(item, value as TValue))
        if (idx === -1) {
          copy.push(value as TValue)
        } else {
          copy.splice(idx, 1)
        }

        return theirOnChange?.(copy as unknown as TValue[])
      },
    })
  })

  let actions = useMemo<_Actions>(
    () => ({
      onChange,
      registerOption,
      registerLabel,
      goToOption,
      closeCombobox,
      openCombobox,
      selectActiveOption,
      selectOption,
    }),
    []
  )

  let ourProps = ref === null ? {} : { ref }

  return (
    <ComboboxActionsContext.Provider value={actions}>
      <ComboboxDataContext.Provider value={data}>
        <OpenClosedProvider
          value={match(data.comboboxState, {
            [ComboboxState.Open]: State.Open,
            [ComboboxState.Closed]: State.Closed,
          })}
        >
          {name != null &&
            value != null &&
            objectToFormEntries({ [name]: value }).map(([name, value]) => (
              <Hidden
                features={HiddenFeatures.Hidden}
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
      </ComboboxDataContext.Provider>
    </ComboboxActionsContext.Provider>
  )
}
let ComboboxRoot = forwardRefWithAs(ComboboxFn)

// ---

let DEFAULT_INPUT_TAG = 'input' as const
interface InputRenderPropArg {
  open: boolean
  disabled: boolean
}
type InputPropsWeControl =
  | 'id'
  | 'role'
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
  let { value, onChange, displayValue, type = 'text', ...theirProps } = props
  let data = useData('Combobox.Input')
  let actions = useActions('Combobox.Input')

  let inputRef = useSyncRefs(data.inputRef, ref)

  let id = `headlessui-combobox-input-${useId()}`
  let d = useDisposables()

  let shouldIgnoreOpenOnChange = false
  function updateInputAndNotify(newValue: string) {
    let input = data.inputRef.current
    if (!input) {
      return
    }

    // The value is already the same, so we can bail out early
    if (input.value === newValue) {
      return
    }

    // Skip React's value setting which causes the input event to not be fired because it de-dupes input/change events
    let descriptor = Object.getOwnPropertyDescriptor(input.constructor.prototype, 'value')
    descriptor?.set?.call(input, newValue)

    // Fire an input event which causes the browser to trigger the user's `onChange` handler.
    // We have to prevent the combobox from opening when this happens. Since these events
    // fire synchronously `shouldIgnoreOpenOnChange` will be correct during `handleChange`
    shouldIgnoreOpenOnChange = true
    input.dispatchEvent(new Event('input', { bubbles: true }))

    // Now we can inform react that the input value has changed
    input.value = newValue
    shouldIgnoreOpenOnChange = false
  }

  let currentValue = useMemo(() => {
    if (typeof displayValue === 'function') {
      return displayValue(data.value as unknown as TType) ?? ''
    } else if (typeof data.value === 'string') {
      return data.value
    } else {
      return ''
    }

    // displayValue is intentionally left out
  }, [data.value])

  useWatch(
    ([currentValue, state], [oldCurrentValue, oldState]) => {
      if (!data.inputRef.current) return
      if (oldState === ComboboxState.Open && state === ComboboxState.Closed) {
        updateInputAndNotify(currentValue)
      } else if (currentValue !== oldCurrentValue) {
        data.inputRef.current.value = currentValue
      }
    },
    [currentValue, data.comboboxState]
  )

  let isComposing = useRef(false)
  let handleCompositionStart = useEvent(() => {
    isComposing.current = true
  })
  let handleCompositionEnd = useEvent(() => {
    setTimeout(() => {
      isComposing.current = false
    })
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

      case Keys.Backspace:
      case Keys.Delete:
        if (data.mode !== ValueMode.Single) return
        if (!data.nullable) return

        let input = event.currentTarget
        d.requestAnimationFrame(() => {
          if (input.value === '') {
            actions.onChange(null)
            if (data.optionsRef.current) {
              data.optionsRef.current.scrollTop = 0
            }
            actions.goToOption(Focus.Nothing)
          }
        })
        break

      case Keys.Enter:
        if (data.comboboxState !== ComboboxState.Open) return
        if (isComposing.current) return

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
        return match(data.comboboxState, {
          [ComboboxState.Open]: () => {
            actions.goToOption(Focus.Next)
          },
          [ComboboxState.Closed]: () => {
            actions.openCombobox()
          },
        })

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        return match(data.comboboxState, {
          [ComboboxState.Open]: () => {
            actions.goToOption(Focus.Previous)
          },
          [ComboboxState.Closed]: () => {
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
        if (data.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (data.optionsRef.current && !data.optionsPropsRef.current.static) {
          event.stopPropagation()
        }
        return actions.closeCombobox()

      case Keys.Tab:
        if (data.comboboxState !== ComboboxState.Open) return
        if (data.mode === ValueMode.Single) actions.selectActiveOption()
        actions.closeCombobox()
        break
    }
  })

  let handleChange = useEvent((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!shouldIgnoreOpenOnChange) {
      actions.openCombobox()
    }
    onChange?.(event)
  })

  // TODO: Verify this. The spec says that, for the input/combobox, the label is the labelling element when present
  // Otherwise it's the ID of the non-label element
  let labelledby = useComputed(() => {
    if (!data.labelId) return undefined
    return [data.labelId].join(' ')
  }, [data.labelId])

  let slot = useMemo<InputRenderPropArg>(
    () => ({ open: data.comboboxState === ComboboxState.Open, disabled: data.disabled }),
    [data]
  )

  let ourProps = {
    ref: inputRef,
    id,
    role: 'combobox',
    type,
    'aria-controls': data.optionsRef.current?.id,
    'aria-expanded': data.disabled ? undefined : data.comboboxState === ComboboxState.Open,
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : data.options[data.activeOptionIndex]?.id,
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    'aria-labelledby': labelledby,
    disabled: data.disabled,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
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
  value: any
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
  let data = useData('Combobox.Button')
  let actions = useActions('Combobox.Button')
  let buttonRef = useSyncRefs(data.buttonRef, ref)

  let id = `headlessui-combobox-button-${useId()}`
  let d = useDisposables()

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        if (data.comboboxState === ComboboxState.Closed) {
          actions.openCombobox()
        }
        return d.nextFrame(() => data.inputRef.current?.focus({ preventScroll: true }))

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        if (data.comboboxState === ComboboxState.Closed) {
          actions.openCombobox()
          d.nextFrame(() => {
            if (!data.value) {
              actions.goToOption(Focus.Last)
            }
          })
        }
        return d.nextFrame(() => data.inputRef.current?.focus({ preventScroll: true }))

      case Keys.Escape:
        if (data.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (data.optionsRef.current && !data.optionsPropsRef.current.static) {
          event.stopPropagation()
        }
        actions.closeCombobox()
        return d.nextFrame(() => data.inputRef.current?.focus({ preventScroll: true }))

      default:
        return
    }
  })

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (data.comboboxState === ComboboxState.Open) {
      actions.closeCombobox()
    } else {
      event.preventDefault()
      actions.openCombobox()
    }

    d.nextFrame(() => data.inputRef.current?.focus({ preventScroll: true }))
  })

  let labelledby = useComputed(() => {
    if (!data.labelId) return undefined
    return [data.labelId, id].join(' ')
  }, [data.labelId, id])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({
      open: data.comboboxState === ComboboxState.Open,
      disabled: data.disabled,
      value: data.value,
    }),
    [data]
  )
  let theirProps = props
  let ourProps = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, data.buttonRef),
    tabIndex: -1,
    'aria-haspopup': true,
    'aria-controls': data.optionsRef.current?.id,
    'aria-expanded': data.disabled ? undefined : data.comboboxState === ComboboxState.Open,
    'aria-labelledby': labelledby,
    disabled: data.disabled,
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
  let data = useData('Combobox.Label')
  let id = `headlessui-combobox-label-${useId()}`
  let actions = useActions('Combobox.Label')
  let labelRef = useSyncRefs(data.labelRef, ref)

  useIsoMorphicEffect(() => actions.registerLabel(id), [id])

  let handleClick = useEvent(() => data.inputRef.current?.focus({ preventScroll: true }))

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: data.comboboxState === ComboboxState.Open, disabled: data.disabled }),
    [data]
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
  let data = useData('Combobox.Options')

  let optionsRef = useSyncRefs(data.optionsRef, ref)

  let id = `headlessui-combobox-options-${useId()}`

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return data.comboboxState === ComboboxState.Open
  })()

  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.static = props.static ?? false
  }, [data.optionsPropsRef, props.static])
  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.hold = hold
  }, [data.optionsPropsRef, hold])

  useTreeWalker({
    container: data.optionsRef.current,
    enabled: data.comboboxState === ComboboxState.Open,
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
    () => data.labelId ?? data.buttonRef.current?.id,
    [data.labelId, data.buttonRef.current]
  )

  let slot = useMemo<OptionsRenderPropArg>(
    () => ({ open: data.comboboxState === ComboboxState.Open }),
    [data]
  )
  let ourProps = {
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : data.options[data.activeOptionIndex]?.id,
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
type ComboboxOptionPropsWeControl = 'id' | 'role' | 'tabIndex' | 'aria-disabled' | 'aria-selected'

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
  let data = useData('Combobox.Option')
  let actions = useActions('Combobox.Option')

  let id = `headlessui-combobox-option-${useId()}`
  let active =
    data.activeOptionIndex !== null ? data.options[data.activeOptionIndex].id === id : false

  let selected = data.isSelected(value)
  let internalOptionRef = useRef<HTMLLIElement | null>(null)
  let bag = useLatestValue<ComboboxOptionDataRef<TType>['current']>({
    disabled,
    value,
    domRef: internalOptionRef,
    textValue: internalOptionRef.current?.textContent?.toLowerCase(),
  })
  let optionRef = useSyncRefs(ref, internalOptionRef)

  let select = useEvent(() => actions.selectOption(id))
  useIsoMorphicEffect(() => actions.registerOption(id, bag), [bag, id])

  let enableScrollIntoView = useRef(data.__demoMode ? false : true)
  useIsoMorphicEffect(() => {
    if (!data.__demoMode) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      enableScrollIntoView.current = true
    })
    return d.dispose
  }, [])

  useIsoMorphicEffect(() => {
    if (data.comboboxState !== ComboboxState.Open) return
    if (!active) return
    if (!enableScrollIntoView.current) return
    if (data.activationTrigger === ActivationTrigger.Pointer) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [internalOptionRef, active, data.comboboxState, data.activationTrigger, /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ data.activeOptionIndex])

  let handleClick = useEvent((event: { preventDefault: Function }) => {
    if (disabled) return event.preventDefault()
    select()
    if (data.mode === ValueMode.Single) {
      actions.closeCombobox()
    }
  })

  let handleFocus = useEvent(() => {
    if (disabled) return actions.goToOption(Focus.Nothing)
    actions.goToOption(Focus.Specific, id)
  })

  let handleMove = useEvent(() => {
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent(() => {
    if (disabled) return
    if (!active) return
    if (data.optionsPropsRef.current.hold) return
    actions.goToOption(Focus.Nothing)
  })

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
    'aria-selected': selected,
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
