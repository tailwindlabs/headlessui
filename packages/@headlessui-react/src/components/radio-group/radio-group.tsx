import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,

  // Types
  Dispatch,
  ElementType,
  MutableRefObject,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react'

import { Props, Expand } from '../../types'
import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { match } from '../../utils/match'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { Keys } from '../../components/keyboard'
import { focusIn, Focus, FocusResult } from '../../utils/focus-management'
import { useFlags } from '../../hooks/use-flags'
import { Label, useLabels } from '../../components/label/label'
import { Description, useDescriptions } from '../../components/description/description'

interface Option {
  id: string
  element: MutableRefObject<HTMLElement | null>
  propsRef: MutableRefObject<{ value: unknown }>
}

interface StateDefinition {
  propsRef: MutableRefObject<{ value: unknown; onChange(value: unknown): void }>
  options: Option[]
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
    return {
      ...state,
      options: [
        ...state.options,
        { id: action.id, element: action.element, propsRef: action.propsRef },
      ],
    }
  },
  [ActionTypes.UnregisterOption](state, action) {
    let options = state.options.slice()
    let idx = state.options.findIndex(radio => radio.id === action.id)
    if (idx === -1) return state
    options.splice(idx, 1)
    return { ...state, options }
  },
}

let RadioGroupContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
RadioGroupContext.displayName = 'RadioGroupContext'

function useRadioGroupContext(component: string) {
  let context = useContext(RadioGroupContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${RadioGroup.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useRadioGroupContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_RADIO_GROUP_TAG = 'div' as const
interface RadioGroupRenderPropArg {}
type RadioGroupPropsWeControl = 'role' | 'aria-labelledby' | 'aria-describedby' | 'id'

export function RadioGroup<
  TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG,
  TType = string
>(
  props: Props<
    TTag,
    RadioGroupRenderPropArg,
    RadioGroupPropsWeControl | 'value' | 'onChange' | 'disabled'
  > & {
    value: TType
    onChange(value: TType): void
    disabled?: boolean
  }
) {
  let { value, onChange, ...passThroughProps } = props
  let reducerBag = useReducer(stateReducer, {
    propsRef: { current: { value, onChange } },
    options: [],
  } as StateDefinition)
  let [{ propsRef, options }] = reducerBag
  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()
  let id = `headlessui-radiogroup-${useId()}`
  let radioGroupRef = useRef<HTMLElement | null>(null)

  useIsoMorphicEffect(() => {
    propsRef.current.value = value
  }, [value, propsRef])
  useIsoMorphicEffect(() => {
    propsRef.current.onChange = onChange
  }, [onChange, propsRef])

  let triggerChange = useCallback(
    nextValue => {
      if (nextValue === value) return
      return onChange(nextValue)
    },
    [onChange, value]
  )

  useIsoMorphicEffect(() => {
    let container = radioGroupRef.current
    if (!container) return

    let walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node: HTMLElement) {
        if (node.getAttribute('role') === 'radio') return NodeFilter.FILTER_REJECT
        if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
        return NodeFilter.FILTER_ACCEPT
      },
    })

    while (walker.nextNode()) {
      ;(walker.currentNode as HTMLElement).setAttribute('role', 'none')
    }
  }, [radioGroupRef])

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      let container = radioGroupRef.current
      if (!container) return

      switch (event.key) {
        case Keys.ArrowLeft:
        case Keys.ArrowUp:
          {
            event.preventDefault()
            event.stopPropagation()

            let result = focusIn(
              options.map(radio => radio.element.current) as HTMLElement[],
              Focus.Previous | Focus.WrapAround
            )

            if (result === FocusResult.Success) {
              let activeOption = options.find(
                option => option.element.current === document.activeElement
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

            let result = focusIn(
              options.map(option => option.element.current) as HTMLElement[],
              Focus.Next | Focus.WrapAround
            )

            if (result === FocusResult.Success) {
              let activeOption = options.find(
                option => option.element.current === document.activeElement
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
              option => option.element.current === document.activeElement
            )
            if (activeOption) triggerChange(activeOption.propsRef.current.value)
          }
          break
      }
    },
    [radioGroupRef, options, triggerChange]
  )

  let propsWeControl = {
    ref: radioGroupRef,
    id,
    role: 'radiogroup',
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    onKeyDown: handleKeyDown,
  }

  return (
    <DescriptionProvider>
      <LabelProvider>
        <RadioGroupContext.Provider value={reducerBag}>
          {render({
            props: { ...passThroughProps, ...propsWeControl },
            defaultTag: DEFAULT_RADIO_GROUP_TAG,
            name: 'RadioGroup',
          })}
        </RadioGroupContext.Provider>
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
}
type RadioPropsWeControl =
  | 'aria-checked'
  | 'id'
  | 'onBlur'
  | 'onClick'
  | 'onFocus'
  | 'ref'
  | 'role'
  | 'tabIndex'

function Option<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in RadioGroup itself.
  // But today is not that day..
  TType = Parameters<typeof RadioGroup>[0]['value']
>(
  props: Props<TTag, OptionRenderPropArg, RadioPropsWeControl | 'value'> & {
    value: TType
  }
) {
  let optionRef = useRef<HTMLElement | null>(null)
  let id = `headlessui-radiogroup-option-${useId()}`

  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()
  let { addFlag, removeFlag, hasFlag } = useFlags(OptionState.Empty)

  let { value, ...passThroughProps } = props
  let propsRef = useRef({ value })

  useIsoMorphicEffect(() => {
    propsRef.current.value = value
  }, [value, propsRef])

  let [{ propsRef: radioGroupPropsRef, options }, dispatch] = useRadioGroupContext(
    [RadioGroup.name, Option.name].join('.')
  )

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterOption, id, element: optionRef, propsRef })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  }, [id, dispatch, optionRef, props])

  let handleClick = useCallback(() => {
    if (radioGroupPropsRef.current.value === value) return

    addFlag(OptionState.Active)
    radioGroupPropsRef.current.onChange(value)
    optionRef.current?.focus()
  }, [addFlag, radioGroupPropsRef, value])

  let handleFocus = useCallback(() => addFlag(OptionState.Active), [addFlag])
  let handleBlur = useCallback(() => removeFlag(OptionState.Active), [removeFlag])

  let firstRadio = options?.[0]?.id === id
  let checked = radioGroupPropsRef.current.value === value
  let propsWeControl = {
    ref: optionRef,
    id,
    role: 'radio',
    'aria-checked': checked ? 'true' : 'false',
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    tabIndex: checked ? 0 : radioGroupPropsRef.current.value === undefined && firstRadio ? 0 : -1,
    onClick: handleClick,
    onFocus: handleFocus,
    onBlur: handleBlur,
  }
  let slot = useMemo<OptionRenderPropArg>(
    () => ({ checked, active: hasFlag(OptionState.Active) }),
    [checked, hasFlag]
  )

  return (
    <DescriptionProvider>
      <LabelProvider>
        {render({
          props: { ...passThroughProps, ...propsWeControl },
          slot,
          defaultTag: DEFAULT_OPTION_TAG,
          name: 'RadioGroup.Option',
        })}
      </LabelProvider>
    </DescriptionProvider>
  )
}

// ---

RadioGroup.Option = Option
RadioGroup.Label = Label
RadioGroup.Description = Description
