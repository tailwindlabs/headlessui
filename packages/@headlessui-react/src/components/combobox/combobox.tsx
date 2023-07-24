import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
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
import {
  forwardRefWithAs,
  render,
  compact,
  PropsForFeatures,
  Features,
  HasDisplayName,
  RefProp,
} from '../../utils/render'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { match } from '../../utils/match'
import { objectToFormEntries } from '../../utils/form'
import { sortByDomNode } from '../../utils/focus-management'

import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'

import { Keys } from '../keyboard'
import { useControllable } from '../../hooks/use-controllable'
import { useWatch } from '../../hooks/use-watch'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { isMobile } from '../../utils/platform'

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
  dataRef: MutableRefObject<_Data | null>
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
    if (state.dataRef.current?.disabled) return state
    if (state.comboboxState === ComboboxState.Closed) return state
    return { ...state, activeOptionIndex: null, comboboxState: ComboboxState.Closed }
  },
  [ActionTypes.OpenCombobox](state) {
    if (state.dataRef.current?.disabled) return state
    if (state.comboboxState === ComboboxState.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex

    if (state.dataRef.current) {
      let { isSelected } = state.dataRef.current
      let optionIdx = state.options.findIndex((option) => isSelected(option.dataRef.current.value))

      if (optionIdx !== -1) {
        activeOptionIndex = optionIdx
      }
    }

    return { ...state, comboboxState: ComboboxState.Open, activeOptionIndex }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.dataRef.current?.disabled) return state
    if (
      state.dataRef.current?.optionsRef.current &&
      !state.dataRef.current?.optionsPropsRef.current.static &&
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
      if (state.dataRef.current?.isSelected(action.dataRef.current.value)) {
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
      defaultValue: unknown
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
interface ComboboxRenderPropArg<TValue, TActive = TValue> {
  open: boolean
  disabled: boolean
  activeIndex: number | null
  activeOption: TActive | null
  value: TValue
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
    } & Props<TTag, ComboboxRenderPropArg<EnsureArray<TValue>, TValue>, O>)
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
    } & Expand<Props<TTag, ComboboxRenderPropArg<EnsureArray<TValue>, TValue>, O>>)
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

export type ComboboxProps<
  TValue,
  TNullable extends boolean | undefined,
  TMultiple extends boolean | undefined,
  TTag extends ElementType
> = ComboboxValueProps<TValue, TNullable, TMultiple, TTag> & {
  disabled?: boolean
  __demoMode?: boolean
  form?: string
  name?: string
}

function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, true, true, TTag>,
  ref: Ref<HTMLElement>
): JSX.Element
function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, true, false, TTag>,
  ref: Ref<HTMLElement>
): JSX.Element
function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, false, false, TTag>,
  ref: Ref<HTMLElement>
): JSX.Element
function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, false, true, TTag>,
  ref: Ref<HTMLElement>
): JSX.Element

function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, boolean | undefined, boolean | undefined, TTag>,
  ref: Ref<HTMLElement>
) {
  let {
    value: controlledValue,
    defaultValue,
    onChange: controlledOnChange,
    form: formName,
    name,
    by = (a: TValue, z: TValue) => a === z,
    disabled = false,
    __demoMode = false,
    nullable = false,
    multiple = false,
    ...theirProps
  } = props
  let [value = multiple ? [] : undefined, theirOnChange] = useControllable<any>(
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

  type TActualValue = true extends typeof multiple ? EnsureArray<TValue>[number] : TValue
  let compare = useEvent(
    // @ts-expect-error Eventually we'll want to tackle this, but for now this will do.
    typeof by === 'string'
      ? (a: TActualValue, z: TActualValue) => {
          let property = by as unknown as keyof TActualValue
          return a?.[property] === z?.[property]
        }
      : by
  )

  let isSelected: (value: TValue) => boolean = useCallback(
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
      defaultValue,
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
    [value, defaultValue, disabled, multiple, nullable, __demoMode, state]
  )

  let lastActiveOption = useRef(
    data.activeOptionIndex !== null ? data.options[data.activeOptionIndex] : null
  )
  useEffect(() => {
    let currentActiveOption =
      data.activeOptionIndex !== null ? data.options[data.activeOptionIndex] : null
    if (lastActiveOption.current !== currentActiveOption) {
      lastActiveOption.current = currentActiveOption
    }
  })

  useIsoMorphicEffect(() => {
    state.dataRef.current = data
  }, [data])

  // Handle outside click
  useOutsideClick(
    [data.buttonRef, data.inputRef, data.optionsRef],
    () => actions.closeCombobox(),
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
      actions.goToOption(Focus.Specific, id)
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
      if (lastActiveOption.current?.id === id) {
        defaultToFirstOption.current = true
      }

      dispatch({ type: ActionTypes.UnregisterOption, id })
    }
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

  let form = useRef<HTMLFormElement | null>(null)
  let d = useDisposables()
  useEffect(() => {
    if (!form.current) return
    if (defaultValue === undefined) return

    d.addEventListener(form.current, 'reset', () => {
      onChange(defaultValue)
    })
  }, [form, onChange /* Explicitly ignoring `defaultValue` */])

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
            objectToFormEntries({ [name]: value }).map(([name, value], idx) => (
              <Hidden
                features={HiddenFeatures.Hidden}
                ref={
                  idx === 0
                    ? (element: HTMLInputElement | null) => {
                        form.current = element?.closest('form') ?? null
                      }
                    : undefined
                }
                {...compact({
                  key: name,
                  as: 'input',
                  type: 'hidden',
                  hidden: true,
                  readOnly: true,
                  form: formName,
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

// ---

let DEFAULT_INPUT_TAG = 'input' as const
interface InputRenderPropArg {
  open: boolean
  disabled: boolean
}
type InputPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-autocomplete'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'disabled'
  | 'role'

export type ComboboxInputProps<TTag extends ElementType, TType> = Props<
  TTag,
  InputRenderPropArg,
  InputPropsWeControl,
  {
    defaultValue?: TType
    displayValue?(item: TType): string
    onChange?(event: React.ChangeEvent<HTMLInputElement>): void
  }
>

function InputFn<
  TTag extends ElementType = typeof DEFAULT_INPUT_TAG,
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof ComboboxRoot>[0]['value']
>(props: ComboboxInputProps<TTag, TType>, ref: Ref<HTMLInputElement>) {
  let internalId = useId()
  let {
    id = `headlessui-combobox-input-${internalId}`,
    onChange,
    displayValue,
    // @ts-ignore: We know this MAY NOT exist for a given tag but we only care when it _does_ exist.
    type = 'text',
    ...theirProps
  } = props
  let data = useData('Combobox.Input')
  let actions = useActions('Combobox.Input')

  let inputRef = useSyncRefs(data.inputRef, ref)

  let isTyping = useRef(false)

  let d = useDisposables()

  // When a `displayValue` prop is given, we should use it to transform the current selected
  // option(s) so that the format can be chosen by developers implementing this. This is useful if
  // your data is an object and you just want to pick a certain property or want to create a dynamic
  // value like `firstName + ' ' + lastName`.
  //
  // Note: This can also be used with multiple selected options, but this is a very simple transform
  // which should always result in a string (since we are filling in the value of the text input),
  // you don't have to use this at all, a more common UI is a "tag" based UI, which you can render
  // yourself using the selected option(s).
  let currentDisplayValue = (function () {
    if (typeof displayValue === 'function' && data.value !== undefined) {
      return displayValue(data.value as unknown as TType) ?? ''
    } else if (typeof data.value === 'string') {
      return data.value
    } else {
      return ''
    }
  })()

  // Syncing the input value has some rules attached to it to guarantee a smooth and expected user
  // experience:
  //
  // - When a user is not typing in the input field, it is safe to update the input value based on
  //   the selected option(s). See `currentDisplayValue` computation from above.
  // - The value can be updated when:
  //   - The `value` is set from outside of the component
  //   - The `value` is set when the user uses their keyboard (confirm via enter or space)
  //   - The `value` is set when the user clicks on a value to select it
  // - The value will be reset to the current selected option(s), when:
  //   - The user is _not_ typing (otherwise you will loose your current state / query)
  //   - The user cancels the current changes:
  //     - By pressing `escape`
  //     - By clicking `outside` of the Combobox
  useWatch(
    ([currentDisplayValue, state], [oldCurrentDisplayValue, oldState]) => {
      // When the user is typing, we want to not touch the `input` at all. Especially when they are
      // using an IME, we don't want to mess with the input at all.
      if (isTyping.current) return

      let input = data.inputRef.current
      if (!input) return

      if (oldState === ComboboxState.Open && state === ComboboxState.Closed) {
        input.value = currentDisplayValue
      } else if (currentDisplayValue !== oldCurrentDisplayValue) {
        input.value = currentDisplayValue
      }

      // Once we synced the input value, we want to make sure the cursor is at the end of the input
      // field. This makes it easier to continue typing and append to the query. We will bail out if
      // the user is currently typing, because we don't want to mess with the cursor position while
      // typing.
      requestAnimationFrame(() => {
        if (isTyping.current) return
        if (!input) return

        let { selectionStart, selectionEnd } = input

        // A custom selection is used, no need to move the caret
        if (Math.abs((selectionEnd ?? 0) - (selectionStart ?? 0)) !== 0) return

        // A custom caret position is used, no need to move the caret
        if (selectionStart !== 0) return

        // Move the caret to the end
        input.setSelectionRange(input.value.length, input.value.length)
      })
    },
    [currentDisplayValue, data.comboboxState]
  )

  // Trick VoiceOver in behaving a little bit better. Manually "resetting" the input makes VoiceOver
  // a bit more happy and doesn't require some changes manually first before announcing items
  // correctly. This is a bit of a hacks, but it is a workaround for a VoiceOver bug.
  //
  // TODO: VoiceOver is still relatively buggy if you start VoiceOver while the Combobox is already
  // in an open state.
  useWatch(
    ([newState], [oldState]) => {
      if (newState === ComboboxState.Open && oldState === ComboboxState.Closed) {
        // When the user is typing, we want to not touch the `input` at all. Especially when they are
        // using an IME, we don't want to mess with the input at all.
        if (isTyping.current) return

        let input = data.inputRef.current
        if (!input) return

        // Capture current state
        let currentValue = input.value
        let { selectionStart, selectionEnd, selectionDirection } = input

        // Trick VoiceOver into announcing the value
        input.value = ''

        // Rollback to original state
        input.value = currentValue
        if (selectionDirection !== null) {
          input.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
        } else {
          input.setSelectionRange(selectionStart, selectionEnd)
        }
      }
    },
    [data.comboboxState]
  )

  let isComposing = useRef(false)
  let handleCompositionStart = useEvent(() => {
    isComposing.current = true
  })
  let handleCompositionEnd = useEvent(() => {
    d.nextFrame(() => {
      isComposing.current = false
    })
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLInputElement>) => {
    isTyping.current = true
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

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
        isTyping.current = false
        if (data.comboboxState !== ComboboxState.Open) return

        // When the user is still in the middle of composing by using an IME, then we don't want to
        // submit this value and close the Combobox yet. Instead, we will fallback to the default
        // behaviour which is to "end" the composition.
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
        isTyping.current = false
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
        isTyping.current = false
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
        if (event.shiftKey) {
          break
        }

        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.First)

      case Keys.PageUp:
        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.First)

      case Keys.End:
        if (event.shiftKey) {
          break
        }

        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Last)

      case Keys.PageDown:
        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Last)

      case Keys.Escape:
        isTyping.current = false
        if (data.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (data.optionsRef.current && !data.optionsPropsRef.current.static) {
          event.stopPropagation()
        }
        return actions.closeCombobox()

      case Keys.Tab:
        isTyping.current = false
        if (data.comboboxState !== ComboboxState.Open) return
        if (data.mode === ValueMode.Single) actions.selectActiveOption()
        actions.closeCombobox()
        break
    }
  })

  let handleChange = useEvent((event: React.ChangeEvent<HTMLInputElement>) => {
    // Always call the onChange listener even if the user is still typing using an IME (Input Method
    // Editor).
    //
    // The main issue is Android, where typing always uses the IME APIs. Just waiting until the
    // compositionend event is fired to trigger an onChange is not enough, because then filtering
    // options while typing won't work at all because we are still in "composing" mode.
    onChange?.(event)

    // Open the combobox to show the results based on what the user has typed
    actions.openCombobox()
  })

  let handleBlur = useEvent(() => {
    isTyping.current = false
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
    'aria-expanded': data.comboboxState === ComboboxState.Open,
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : data.options[data.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    'aria-autocomplete': 'list',
    defaultValue:
      props.defaultValue ??
      (data.defaultValue !== undefined
        ? displayValue?.(data.defaultValue as unknown as TType)
        : null) ??
      data.defaultValue,
    disabled: data.disabled,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
    onChange: handleChange,
    onBlur: handleBlur,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_INPUT_TAG,
    name: 'Combobox.Input',
  })
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
  disabled: boolean
  value: any
}
type ButtonPropsWeControl =
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-labelledby'
  | 'disabled'
  | 'tabIndex'

export type ComboboxButtonProps<TTag extends ElementType> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: ComboboxButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let data = useData('Combobox.Button')
  let actions = useActions('Combobox.Button')
  let buttonRef = useSyncRefs(data.buttonRef, ref)
  let internalId = useId()
  let { id = `headlessui-combobox-button-${internalId}`, ...theirProps } = props
  let d = useDisposables()

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

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
  let ourProps = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, data.buttonRef),
    tabIndex: -1,
    'aria-haspopup': 'listbox',
    'aria-controls': data.optionsRef.current?.id,
    'aria-expanded': data.comboboxState === ComboboxState.Open,
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
}

// ---

let DEFAULT_LABEL_TAG = 'label' as const
interface LabelRenderPropArg {
  open: boolean
  disabled: boolean
}

export type ComboboxLabelProps<TTag extends ElementType> = Props<TTag, LabelRenderPropArg>

function LabelFn<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: ComboboxLabelProps<TTag>,
  ref: Ref<HTMLLabelElement>
) {
  let internalId = useId()
  let { id = `headlessui-combobox-label-${internalId}`, ...theirProps } = props
  let data = useData('Combobox.Label')
  let actions = useActions('Combobox.Label')
  let labelRef = useSyncRefs(data.labelRef, ref)

  useIsoMorphicEffect(() => actions.registerLabel(id), [id])

  let handleClick = useEvent(() => data.inputRef.current?.focus({ preventScroll: true }))

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: data.comboboxState === ComboboxState.Open, disabled: data.disabled }),
    [data]
  )

  let ourProps = { ref: labelRef, id, onClick: handleClick }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Combobox.Label',
  })
}

// ---

let DEFAULT_OPTIONS_TAG = 'ul' as const
interface OptionsRenderPropArg {
  open: boolean
}
type OptionsPropsWeControl = 'aria-labelledby' | 'aria-multiselectable' | 'role' | 'tabIndex'

let OptionsRenderFeatures = Features.RenderStrategy | Features.Static

export type ComboboxOptionsProps<TTag extends ElementType> = Props<
  TTag,
  OptionsRenderPropArg,
  OptionsPropsWeControl,
  PropsForFeatures<typeof OptionsRenderFeatures> & {
    hold?: boolean
  }
>

function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
  props: ComboboxOptionsProps<TTag>,
  ref: Ref<HTMLUListElement>
) {
  let internalId = useId()
  let { id = `headlessui-combobox-options-${internalId}`, hold = false, ...theirProps } = props
  let data = useData('Combobox.Options')

  let optionsRef = useSyncRefs(data.optionsRef, ref)

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
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
    'aria-labelledby': labelledby,
    role: 'listbox',
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
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
}

// ---

let DEFAULT_OPTION_TAG = 'li' as const
interface OptionRenderPropArg {
  active: boolean
  selected: boolean
  disabled: boolean
}
type OptionPropsWeControl = 'role' | 'tabIndex' | 'aria-disabled' | 'aria-selected'

export type ComboboxOptionProps<TTag extends ElementType, TType> = Props<
  TTag,
  OptionRenderPropArg,
  OptionPropsWeControl,
  {
    disabled?: boolean
    value: TType
  }
>

function OptionFn<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof ComboboxRoot>[0]['value']
>(props: ComboboxOptionProps<TTag, TType>, ref: Ref<HTMLLIElement>) {
  let internalId = useId()
  let {
    id = `headlessui-combobox-option-${internalId}`,
    disabled = false,
    value,
    ...theirProps
  } = props
  let data = useData('Combobox.Option')
  let actions = useActions('Combobox.Option')

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
  }, [
    internalOptionRef,
    active,
    data.comboboxState,
    data.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ data.activeOptionIndex,
  ])

  let handleClick = useEvent((event: { preventDefault: Function }) => {
    if (disabled) return event.preventDefault()
    select()
    if (data.mode === ValueMode.Single) {
      actions.closeCombobox()
    }

    // We want to make sure that we don't accidentally trigger the virtual keyboard.
    //
    // This would happen if the input is focused, the options are open, you select an option (which
    // would blur the input, and focus the option (button), then we re-focus the input).
    //
    // This would be annoying on mobile (or on devices with a virtual keyboard). Right now we are
    // assuming that the virtual keyboard would open on mobile devices (iOS / Android). This
    // assumption is not perfect, but will work in the majority of the cases.
    //
    // Ideally we can have a better check where we can explicitly check for the virtual keyboard.
    // But right now this is still an experimental feature:
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/virtualKeyboard
    if (!isMobile()) {
      requestAnimationFrame(() => data.inputRef.current?.focus())
    }
  })

  let handleFocus = useEvent(() => {
    if (disabled) return actions.goToOption(Focus.Nothing)
    actions.goToOption(Focus.Specific, id)
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => pointer.update(evt))

  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
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
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
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
}

// ---

interface ComponentCombobox extends HasDisplayName {
  <TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
    props: ComboboxProps<TValue, true, true, TTag> & RefProp<typeof ComboboxFn>
  ): JSX.Element
  <TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
    props: ComboboxProps<TValue, true, false, TTag> & RefProp<typeof ComboboxFn>
  ): JSX.Element
  <TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
    props: ComboboxProps<TValue, false, true, TTag> & RefProp<typeof ComboboxFn>
  ): JSX.Element
  <TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
    props: ComboboxProps<TValue, false, false, TTag> & RefProp<typeof ComboboxFn>
  ): JSX.Element
}

interface ComponentComboboxButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: ComboboxButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

interface ComponentComboboxInput extends HasDisplayName {
  <TType, TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(
    props: ComboboxInputProps<TTag, TType> & RefProp<typeof InputFn>
  ): JSX.Element
}

interface ComponentComboboxLabel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
    props: ComboboxLabelProps<TTag> & RefProp<typeof LabelFn>
  ): JSX.Element
}

interface ComponentComboboxOptions extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
    props: ComboboxOptionsProps<TTag> & RefProp<typeof OptionsFn>
  ): JSX.Element
}

interface ComponentComboboxOption extends HasDisplayName {
  <
    TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
    TType = Parameters<typeof ComboboxRoot>[0]['value']
  >(
    props: ComboboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>
  ): JSX.Element
}

let ComboboxRoot = forwardRefWithAs(ComboboxFn) as unknown as ComponentCombobox
let Button = forwardRefWithAs(ButtonFn) as unknown as ComponentComboboxButton
let Input = forwardRefWithAs(InputFn) as unknown as ComponentComboboxInput
let Label = forwardRefWithAs(LabelFn) as unknown as ComponentComboboxLabel
let Options = forwardRefWithAs(OptionsFn) as unknown as ComponentComboboxOptions
let Option = forwardRefWithAs(OptionFn) as unknown as ComponentComboboxOption

export let Combobox = Object.assign(ComboboxRoot, { Input, Button, Label, Options, Option })
