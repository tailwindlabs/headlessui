'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ElementType,
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useByComparator, type ByComparator } from '../../hooks/use-by-comparator'
import { useControllable } from '../../hooks/use-controllable'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useDisabled } from '../../internal/disabled'
import { FormFields } from '../../internal/form-fields'
import { useProvidedId } from '../../internal/id'
import type { Expand, Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus, FocusResult, focusIn, sortByDomNode } from '../../utils/focus-management'
import { attemptSubmit } from '../../utils/form'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import {
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'
import {
  Description,
  useDescribedBy,
  useDescriptions,
  type _internal_ComponentDescription,
} from '../description/description'
import { Keys } from '../keyboard'
import { Label, useLabelledBy, useLabels, type _internal_ComponentLabel } from '../label/label'

interface Option<T = unknown> {
  id: string
  element: MutableRefObject<HTMLElement | null>
  propsRef: MutableRefObject<{ value: T; disabled: boolean }>
}

interface StateDefinition<T = unknown> {
  options: Option<T>[]
}

enum ActionTypes {
  RegisterOption,
  UnregisterOption,
}

type Actions =
  | Expand<{ type: ActionTypes.RegisterOption } & Option>
  | { type: ActionTypes.UnregisterOption; id: Option['id'] }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.RegisterOption](state, action) {
    let nextOptions = [
      ...state.options,
      { id: action.id, element: action.element, propsRef: action.propsRef },
    ]

    return {
      ...state,
      options: sortByDomNode(nextOptions, (option) => option.element.current),
    }
  },
  [ActionTypes.UnregisterOption](state, action) {
    let options = state.options.slice()
    let idx = state.options.findIndex((radio) => radio.id === action.id)
    if (idx === -1) return state
    options.splice(idx, 1)
    return { ...state, options }
  },
}

let RadioGroupDataContext = createContext<
  | ({
      value: unknown
      firstOption?: Option
      containsCheckedOption: boolean
      disabled: boolean
      compare(a: unknown, z: unknown): boolean
    } & StateDefinition)
  | null
>(null)
RadioGroupDataContext.displayName = 'RadioGroupDataContext'

function useData(component: string) {
  let context = useContext(RadioGroupDataContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
type _Data = ReturnType<typeof useData>

let RadioGroupActionsContext = createContext<{
  registerOption(option: Option): () => void
  change(value: unknown): boolean
} | null>(null)
RadioGroupActionsContext.displayName = 'RadioGroupActionsContext'

function useActions(component: string) {
  let context = useContext(RadioGroupActionsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}
type _Actions = ReturnType<typeof useActions>

function stateReducer<T>(state: StateDefinition<T>, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_RADIO_GROUP_TAG = 'div' as const
type RadioGroupRenderPropArg<TType> = {
  value: TType
}
type RadioGroupPropsWeControl = 'role' | 'aria-labelledby' | 'aria-describedby'

export type RadioGroupProps<
  TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG,
  TType = string,
> = Props<
  TTag,
  RadioGroupRenderPropArg<TType>,
  RadioGroupPropsWeControl,
  {
    value?: TType
    defaultValue?: TType
    onChange?(value: TType): void
    by?: ByComparator<TType>
    disabled?: boolean
    form?: string
    name?: string
  }
>

function RadioGroupFn<TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG, TType = string>(
  props: RadioGroupProps<TTag, TType>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let providedDisabled = useDisabled()
  let {
    id = `headlessui-radiogroup-${internalId}`,
    value: controlledValue,
    defaultValue,
    form,
    name,
    onChange: controlledOnChange,
    by,
    disabled = providedDisabled || false,
    ...theirProps
  } = props

  let compare = useByComparator(by)
  let [state, dispatch] = useReducer(stateReducer, { options: [] } as StateDefinition<TType>)
  let options = state.options as unknown as Option<TType>[]
  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()
  let internalRadioGroupRef = useRef<HTMLElement | null>(null)
  let radioGroupRef = useSyncRefs(internalRadioGroupRef, ref)

  let [value, onChange] = useControllable(controlledValue, controlledOnChange, defaultValue)

  let firstOption = useMemo(
    () =>
      options.find((option) => {
        if (option.propsRef.current.disabled) return false
        return true
      }),
    [options]
  )
  let containsCheckedOption = useMemo(
    () => options.some((option) => compare(option.propsRef.current.value as TType, value)),
    [options, value]
  )

  let triggerChange = useEvent((nextValue: TType) => {
    if (disabled) return false
    if (compare(nextValue, value)) return false
    let nextOption = options.find((option) =>
      compare(option.propsRef.current.value as TType, nextValue)
    )?.propsRef.current
    if (nextOption?.disabled) return false

    onChange?.(nextValue)

    return true
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let container = internalRadioGroupRef.current
    if (!container) return

    let ownerDocument = getOwnerDocument(container)

    let all = options
      .filter((option) => option.propsRef.current.disabled === false)
      .map((radio) => radio.element.current) as HTMLElement[]

    switch (event.key) {
      case Keys.Enter:
        attemptSubmit(event.currentTarget)
        break
      case Keys.ArrowLeft:
      case Keys.ArrowUp:
        {
          event.preventDefault()
          event.stopPropagation()

          let result = focusIn(all, Focus.Previous | Focus.WrapAround)

          if (result === FocusResult.Success) {
            let activeOption = options.find(
              (option) => option.element.current === ownerDocument?.activeElement
            )
            if (activeOption) triggerChange(activeOption.propsRef.current.value)
          }
        }
        break

      case Keys.ArrowRight:
      case Keys.ArrowDown:
        {
          event.preventDefault()
          event.stopPropagation()

          let result = focusIn(all, Focus.Next | Focus.WrapAround)

          if (result === FocusResult.Success) {
            let activeOption = options.find(
              (option) => option.element.current === ownerDocument?.activeElement
            )
            if (activeOption) triggerChange(activeOption.propsRef.current.value)
          }
        }
        break

      case Keys.Space:
        {
          event.preventDefault()
          event.stopPropagation()

          let activeOption = options.find(
            (option) => option.element.current === ownerDocument?.activeElement
          )
          if (activeOption) triggerChange(activeOption.propsRef.current.value)
        }
        break
    }
  })

  let registerOption = useEvent((option: Option) => {
    dispatch({ type: ActionTypes.RegisterOption, ...option })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id: option.id })
  })

  let radioGroupData = useMemo<_Data>(
    () => ({ value, firstOption, containsCheckedOption, disabled, compare, ...state }),
    [value, firstOption, containsCheckedOption, disabled, compare, state]
  )
  let radioGroupActions = useMemo<_Actions>(
    () => ({ registerOption, change: triggerChange }),
    [registerOption, triggerChange]
  )

  let ourProps = {
    ref: radioGroupRef,
    id,
    role: 'radiogroup',
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    onKeyDown: handleKeyDown,
  }

  let slot = useMemo(() => ({ value }) satisfies RadioGroupRenderPropArg<TType>, [value])

  let reset = useCallback(() => {
    return triggerChange(defaultValue!)
  }, [triggerChange /* Explicitly ignoring `defaultValue` */])

  return (
    <DescriptionProvider name="RadioGroup.Description">
      <LabelProvider name="RadioGroup.Label">
        <RadioGroupActionsContext.Provider value={radioGroupActions}>
          <RadioGroupDataContext.Provider value={radioGroupData}>
            {name != null && (
              <FormFields
                data={value != null ? { [name]: value || 'on' } : {}}
                form={form}
                onReset={reset}
              />
            )}

            {render({
              ourProps,
              theirProps,
              slot,
              defaultTag: DEFAULT_RADIO_GROUP_TAG,
              name: 'RadioGroup',
            })}
          </RadioGroupDataContext.Provider>
        </RadioGroupActionsContext.Provider>
      </LabelProvider>
    </DescriptionProvider>
  )
}

// ---

let DEFAULT_OPTION_TAG = 'div' as const
type OptionRenderPropArg = {
  checked: boolean
  /** @deprecated use `focus` instead */
  active: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
  disabled: boolean
}
type OptionPropsWeControl =
  | 'aria-checked'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'role'
  | 'tabIndex'

export type RadioOptionProps<TTag extends ElementType, TType> = Props<
  TTag,
  OptionRenderPropArg,
  OptionPropsWeControl,
  {
    value: TType
    disabled?: boolean
    autoFocus?: boolean
  }
>

function OptionFn<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in RadioGroup itself.
  // But today is not that day..
  TType = Parameters<typeof RadioGroupRoot>[0]['value'],
>(props: RadioOptionProps<TTag, TType>, ref: Ref<HTMLElement>) {
  let internalId = useId()
  let {
    id = `headlessui-radiogroup-option-${internalId}`,
    value,
    disabled = false,
    ...theirProps
  } = props
  let internalOptionRef = useRef<HTMLElement | null>(null)
  let optionRef = useSyncRefs(internalOptionRef, ref)

  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()

  let propsRef = useLatestValue({ value, disabled })

  let data = useData('RadioGroup.Option')
  let actions = useActions('RadioGroup.Option')

  useIsoMorphicEffect(
    () => actions.registerOption({ id, element: internalOptionRef, propsRef }),
    [id, actions, internalOptionRef, propsRef]
  )

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (!actions.change(value)) return
    internalOptionRef.current?.focus()
  })

  let isFirstOption = data.firstOption?.id === id
  let isDisabled = data.disabled || disabled

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: isDisabled ?? false })

  let checked = data.compare(data.value as TType, value)
  let ourProps = mergeProps(
    {
      ref: optionRef,
      id,
      role: 'radio',
      'aria-checked': checked ? 'true' : 'false',
      'aria-labelledby': labelledby,
      'aria-describedby': describedby,
      'aria-disabled': isDisabled ? true : undefined,
      tabIndex: (() => {
        if (isDisabled) return -1
        if (checked) return 0
        if (!data.containsCheckedOption && isFirstOption) return 0
        return -1
      })(),
      onClick: isDisabled ? undefined : handleClick,
    },
    focusProps,
    hoverProps
  )

  let slot = useMemo(
    () =>
      ({
        checked,
        disabled: isDisabled,
        active: focus,
        hover,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies OptionRenderPropArg,
    [checked, isDisabled, hover, focus, props.autoFocus]
  )

  return (
    <DescriptionProvider name="RadioGroup.Description">
      <LabelProvider name="RadioGroup.Label">
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_OPTION_TAG,
          name: 'RadioGroup.Option',
        })}
      </LabelProvider>
    </DescriptionProvider>
  )
}

// ---

let DEFAULT_RADIO_TAG = 'span' as const
type RadioRenderPropArg = {
  checked: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
  disabled: boolean
}
type RadioPropsWeControl =
  | 'aria-checked'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'role'
  | 'tabIndex'

export type RadioProps<TTag extends ElementType = typeof DEFAULT_RADIO_TAG, TType = string> = Props<
  TTag,
  RadioRenderPropArg,
  RadioPropsWeControl,
  {
    value: TType
    disabled?: boolean
    autoFocus?: boolean
  }
>

function RadioFn<
  TTag extends ElementType = typeof DEFAULT_RADIO_TAG,
  // TODO: One day we will be able to infer this type from the generic in RadioGroup itself.
  // But today is not that day..
  TType = Parameters<typeof RadioGroupRoot>[0]['value'],
>(props: RadioProps<TTag, TType>, ref: Ref<HTMLElement>) {
  let data = useData('Radio')
  let actions = useActions('Radio')

  let internalId = useId()
  let providedId = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = providedId || `headlessui-radio-${internalId}`,
    value,
    disabled = data.disabled || providedDisabled || false,
    ...theirProps
  } = props
  let internalRadioRef = useRef<HTMLElement | null>(null)
  let radioRef = useSyncRefs(internalRadioRef, ref)

  let labelledby = useLabelledBy()
  let describedby = useDescribedBy()

  let propsRef = useLatestValue({ value, disabled })

  useIsoMorphicEffect(
    () => actions.registerOption({ id, element: internalRadioRef, propsRef }),
    [id, actions, internalRadioRef, propsRef]
  )

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (!actions.change(value)) return

    internalRadioRef.current?.focus()
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled ?? false })

  let isFirstOption = data.firstOption?.id === id

  let checked = data.compare(data.value as TType, value)
  let ourProps = mergeProps(
    {
      ref: radioRef,
      id,
      role: 'radio',
      'aria-checked': checked ? 'true' : 'false',
      'aria-labelledby': labelledby,
      'aria-describedby': describedby,
      'aria-disabled': disabled ? true : undefined,
      tabIndex: (() => {
        if (disabled) return -1
        if (checked) return 0
        if (!data.containsCheckedOption && isFirstOption) return 0
        return -1
      })(),
      onClick: disabled ? undefined : handleClick,
    },
    focusProps,
    hoverProps
  )
  let slot = useMemo(
    () =>
      ({
        checked,
        disabled,
        hover,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies RadioRenderPropArg,
    [checked, disabled, hover, focus, props.autoFocus]
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_RADIO_TAG,
    name: 'Radio',
  })
}

// ---

export interface _internal_ComponentRadioGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG, TType = string>(
    props: RadioGroupProps<TTag, TType> & RefProp<typeof RadioGroupFn>
  ): JSX.Element
}

export interface _internal_ComponentRadioOption extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = string>(
    props: RadioOptionProps<TTag, TType> & RefProp<typeof OptionFn>
  ): JSX.Element
}

export interface _internal_ComponentRadio extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_RADIO_TAG, TType = string>(
    props: RadioProps<TTag, TType> & RefProp<typeof RadioFn>
  ): JSX.Element
}

export interface _internal_ComponentRadioLabel extends _internal_ComponentLabel {}
export interface _internal_ComponentRadioDescription extends _internal_ComponentDescription {}

let RadioGroupRoot = forwardRefWithAs(RadioGroupFn) as unknown as _internal_ComponentRadioGroup
export let RadioGroupOption = forwardRefWithAs(
  OptionFn
) as unknown as _internal_ComponentRadioOption
export let Radio = forwardRefWithAs(RadioFn) as unknown as _internal_ComponentRadio
/** @deprecated use `<Label>` instead of `<RadioGroupLabel>` */
export let RadioGroupLabel = Label as _internal_ComponentRadioLabel
/** @deprecated use `<Description>` instead of `<RadioGroupDescription>` */
export let RadioGroupDescription = Description as _internal_ComponentRadioDescription

export let RadioGroup = Object.assign(RadioGroupRoot, {
  Option: RadioGroupOption,
  /** @deprecated use `<Label>` instead of `<RadioGroup.Label>` */
  Label: RadioGroupLabel,
  /** @deprecated use `<Description>` instead of `<RadioGroup.Description>` */
  Description: RadioGroupDescription,
})
