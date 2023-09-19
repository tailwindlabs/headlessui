import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type Ref,
} from 'react'

import {
  Description,
  useDescriptions,
  _internal_ComponentDescription,
} from '../../components/description/description'
import { Keys } from '../../components/keyboard'
import { Label, useLabels, _internal_ComponentLabel } from '../../components/label/label'
import { useControllable } from '../../hooks/use-controllable'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useFlags } from '../../hooks/use-flags'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { Features as HiddenFeatures, Hidden } from '../../internal/hidden'
import type { Expand, Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus, focusIn, FocusResult, sortByDomNode } from '../../utils/focus-management'
import { attemptSubmit, objectToFormEntries } from '../../utils/form'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import {
  compact,
  forwardRefWithAs,
  render,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'

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
interface RadioGroupRenderPropArg<TType> {
  value: TType
}
type RadioGroupPropsWeControl = 'role' | 'aria-labelledby' | 'aria-describedby'

export type RadioGroupProps<TTag extends ElementType, TType> = Props<
  TTag,
  RadioGroupRenderPropArg<TType>,
  RadioGroupPropsWeControl,
  {
    value?: TType
    defaultValue?: TType
    onChange?(value: TType): void
    by?: (keyof TType & string) | ((a: TType, z: TType) => boolean)
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
  let {
    id = `headlessui-radiogroup-${internalId}`,
    value: controlledValue,
    defaultValue,
    form: formName,
    name,
    onChange: controlledOnChange,
    by = (a: TType, z: TType) => a === z,
    disabled = false,
    ...theirProps
  } = props
  let compare = useEvent(
    typeof by === 'string'
      ? (a: TType, z: TType) => {
          let property = by as unknown as keyof TType
          return a?.[property] === z?.[property]
        }
      : by
  )
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

  useTreeWalker({
    container: internalRadioGroupRef.current,
    accept(node) {
      if (node.getAttribute('role') === 'radio') return NodeFilter.FILTER_REJECT
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk(node) {
      node.setAttribute('role', 'none')
    },
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

  let slot = useMemo<RadioGroupRenderPropArg<TType>>(() => ({ value }), [value])

  let form = useRef<HTMLFormElement | null>(null)
  let d = useDisposables()
  useEffect(() => {
    if (!form.current) return
    if (defaultValue === undefined) return

    d.addEventListener(form.current, 'reset', () => {
      triggerChange(defaultValue!)
    })
  }, [form, triggerChange /* Explicitly ignoring `defaultValue` */])

  return (
    <DescriptionProvider name="RadioGroup.Description">
      <LabelProvider name="RadioGroup.Label">
        <RadioGroupActionsContext.Provider value={radioGroupActions}>
          <RadioGroupDataContext.Provider value={radioGroupData}>
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
                    type: 'radio',
                    checked: value != null,
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

enum OptionState {
  Empty = 1 << 0,
  Active = 1 << 1,
}

let DEFAULT_OPTION_TAG = 'div' as const
interface OptionRenderPropArg {
  checked: boolean
  active: boolean
  disabled: boolean
}
type OptionPropsWeControl =
  | 'aria-checked'
  | 'aria-describedby'
  | 'aria-lablledby'
  | 'role'
  | 'tabIndex'

export type RadioOptionProps<TTag extends ElementType, TType> = Props<
  TTag,
  OptionRenderPropArg,
  OptionPropsWeControl,
  {
    value: TType
    disabled?: boolean
  }
>

function OptionFn<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in RadioGroup itself.
  // But today is not that day..
  TType = Parameters<typeof RadioGroupRoot>[0]['value']
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
  let { addFlag, removeFlag, hasFlag } = useFlags(OptionState.Empty)

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

    addFlag(OptionState.Active)
    internalOptionRef.current?.focus()
  })

  let handleFocus = useEvent((event: ReactFocusEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    addFlag(OptionState.Active)
  })

  let handleBlur = useEvent(() => removeFlag(OptionState.Active))

  let isFirstOption = data.firstOption?.id === id
  let isDisabled = data.disabled || disabled

  let checked = data.compare(data.value as TType, value)
  let ourProps = {
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
    onFocus: isDisabled ? undefined : handleFocus,
    onBlur: isDisabled ? undefined : handleBlur,
  }
  let slot = useMemo<OptionRenderPropArg>(
    () => ({ checked, disabled: isDisabled, active: hasFlag(OptionState.Active) }),
    [checked, isDisabled, hasFlag]
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

export interface _internal_ComponentRadioLabel extends _internal_ComponentLabel {}
export interface _internal_ComponentRadioDescription extends _internal_ComponentDescription {}

let RadioGroupRoot = forwardRefWithAs(RadioGroupFn) as unknown as _internal_ComponentRadioGroup
let Option = forwardRefWithAs(OptionFn) as unknown as _internal_ComponentRadioOption

export let RadioGroup = Object.assign(RadioGroupRoot, {
  Option,
  Label: Label as _internal_ComponentRadioLabel,
  Description: Description as _internal_ComponentRadioDescription,
})
