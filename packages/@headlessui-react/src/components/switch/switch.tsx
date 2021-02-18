import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  Fragment,

  // Types
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { resolvePropValue } from '../../utils/resolve-prop-value'
import { isDisabledReactIssue7711 } from '../../utils/bugs'

interface StateDefinition {
  switch: HTMLButtonElement | null
  label: HTMLLabelElement | null
  description: HTMLParagraphElement | null

  setSwitch(element: HTMLButtonElement): void
  setLabel(element: HTMLLabelElement): void
  setDescription(element: HTMLParagraphElement): void
}

let GroupContext = createContext<StateDefinition | null>(null)
GroupContext.displayName = 'GroupContext'

function useGroupContext(component: string) {
  let context = useContext(GroupContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Switch.Group /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useGroupContext)
    throw err
  }
  return context
}

// ---

let DEFAULT_GROUP_TAG = Fragment

function Group<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: Props<TTag>) {
  let [switchElement, setSwitchElement] = useState<HTMLButtonElement | null>(null)
  let [labelElement, setLabelElement] = useState<HTMLLabelElement | null>(null)
  let [descriptionElement, setDescriptionElement] = useState<HTMLParagraphElement | null>(null)

  let context = useMemo<StateDefinition>(
    () => ({
      switch: switchElement,
      setSwitch: setSwitchElement,
      label: labelElement,
      setLabel: setLabelElement,
      description: descriptionElement,
      setDescription: setDescriptionElement,
    }),
    [
      switchElement,
      setSwitchElement,
      labelElement,
      setLabelElement,
      descriptionElement,
      setDescriptionElement,
    ]
  )

  return (
    <GroupContext.Provider value={context}>
      {render(props, {}, DEFAULT_GROUP_TAG)}
    </GroupContext.Provider>
  )
}

// ---

let DEFAULT_SWITCH_TAG = 'button' as const
interface SwitchRenderPropArg {
  checked: boolean
}
type SwitchPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-checked'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'onClick'
  | 'onKeyUp'
  | 'onKeyPress'

export function Switch<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(
  props: Props<
    TTag,
    SwitchRenderPropArg,
    SwitchPropsWeControl | 'checked' | 'onChange' | 'className'
  > & {
    checked: boolean
    onChange(checked: boolean): void

    // Special treatment, can either be a string or a function that resolves to a string
    className?: ((bag: SwitchRenderPropArg) => string) | string
  }
) {
  let { checked, onChange, className, ...passThroughProps } = props
  let id = `headlessui-switch-${useId()}`
  let groupContext = useContext(GroupContext)

  let toggle = useCallback(() => onChange(!checked), [onChange, checked])
  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      event.preventDefault()
      toggle()
    },
    [toggle]
  )
  let handleKeyUp = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key !== Keys.Tab) event.preventDefault()
      if (event.key === Keys.Space) toggle()
    },
    [toggle]
  )

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  let handleKeyPress = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault(),
    []
  )

  let propsBag = useMemo<SwitchRenderPropArg>(() => ({ checked }), [checked])
  let propsWeControl = {
    id,
    ref: groupContext === null ? undefined : groupContext.setSwitch,
    role: 'switch',
    tabIndex: 0,
    className: resolvePropValue(className, propsBag),
    'aria-checked': checked,
    'aria-labelledby': groupContext?.label?.id,
    'aria-describedby': groupContext?.description?.id,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    onKeyPress: handleKeyPress,
  }

  if (passThroughProps.as === 'button') {
    Object.assign(propsWeControl, { type: 'button' })
  }

  return render({ ...passThroughProps, ...propsWeControl }, propsBag, DEFAULT_SWITCH_TAG)
}

// ---

let DEFAULT_LABEL_TAG = 'label' as const
interface LabelRenderPropArg {}
type LabelPropsWeControl = 'id' | 'ref' | 'onClick'

function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>
) {
  let state = useGroupContext([Switch.name, Label.name].join('.'))
  let id = `headlessui-switch-label-${useId()}`

  let handleClick = useCallback(() => {
    if (!state.switch) return
    state.switch.click()
    state.switch.focus({ preventScroll: true })
  }, [state.switch])

  let propsWeControl = { ref: state.setLabel, id, onClick: handleClick }
  return render({ ...props, ...propsWeControl }, {}, DEFAULT_LABEL_TAG)
}

// ---

let DEFAULT_DESCRIPTIONL_TAG = 'p' as const
interface DescriptionRenderPropArg {}
type DescriptionPropsWeControl = 'id' | 'ref'

function Description<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, DescriptionRenderPropArg, DescriptionPropsWeControl>
) {
  let state = useGroupContext([Switch.name, Description.name].join('.'))
  let id = `headlessui-switch-description-${useId()}`

  let propsWeControl = { ref: state.setDescription, id }
  return render({ ...props, ...propsWeControl }, {}, DEFAULT_DESCRIPTIONL_TAG)
}

// ---

Switch.Group = Group
Switch.Label = Label
Switch.Description = Description
