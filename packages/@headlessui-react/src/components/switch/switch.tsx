'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useControllable } from '../../hooks/use-controllable'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useDisabled } from '../../internal/disabled'
import { FormFields } from '../../internal/form-fields'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { attemptSubmit } from '../../utils/form'
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

interface StateDefinition {
  switch: HTMLButtonElement | null
  setSwitch(element: HTMLButtonElement): void
}

let GroupContext = createContext<StateDefinition | null>(null)
GroupContext.displayName = 'GroupContext'

// ---

let DEFAULT_GROUP_TAG = Fragment

export type SwitchGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<TTag>

function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
  props: SwitchGroupProps<TTag>
) {
  let [switchElement, setSwitchElement] = useState<HTMLButtonElement | null>(null)
  let [labelledby, LabelProvider] = useLabels()
  let [describedby, DescriptionProvider] = useDescriptions()

  let context = useMemo<StateDefinition>(
    () => ({ switch: switchElement, setSwitch: setSwitchElement }),
    [switchElement, setSwitchElement]
  )

  let ourProps = {}
  let theirProps = props

  return (
    <DescriptionProvider name="Switch.Description" value={describedby}>
      <LabelProvider
        name="Switch.Label"
        value={labelledby}
        props={{
          htmlFor: context.switch?.id,
          onClick(event: React.MouseEvent<HTMLLabelElement>) {
            if (!switchElement) return
            if (event.currentTarget instanceof HTMLLabelElement) {
              event.preventDefault()
            }
            switchElement.click()
            switchElement.focus({ preventScroll: true })
          },
        }}
      >
        <GroupContext.Provider value={context}>
          {render({
            ourProps,
            theirProps,
            slot: {},
            defaultTag: DEFAULT_GROUP_TAG,
            name: 'Switch.Group',
          })}
        </GroupContext.Provider>
      </LabelProvider>
    </DescriptionProvider>
  )
}

// ---

let DEFAULT_SWITCH_TAG = 'button' as const
type SwitchRenderPropArg = {
  checked: boolean
  hover: boolean
  focus: boolean
  active: boolean
  autofocus: boolean
  changing: boolean
  disabled: boolean
}
type SwitchPropsWeControl =
  | 'aria-checked'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'role'
  | 'tabIndex'

export type SwitchProps<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG> = Props<
  TTag,
  SwitchRenderPropArg,
  SwitchPropsWeControl,
  {
    checked?: boolean
    defaultChecked?: boolean
    onChange?(checked: boolean): void
    name?: string
    value?: string
    form?: string
    autoFocus?: boolean
    disabled?: boolean
  }
>

function SwitchFn<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(
  props: SwitchProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = providedId || `headlessui-switch-${internalId}`,
    disabled = providedDisabled || false,
    checked: controlledChecked,
    defaultChecked = false,
    onChange: controlledOnChange,
    name,
    value,
    form,
    ...theirProps
  } = props
  let groupContext = useContext(GroupContext)
  let internalSwitchRef = useRef<HTMLButtonElement | null>(null)
  let switchRef = useSyncRefs(
    internalSwitchRef,
    ref,
    groupContext === null ? null : groupContext.setSwitch
  )

  let [checked, onChange] = useControllable(controlledChecked, controlledOnChange, defaultChecked)

  let d = useDisposables()
  let [changing, setChanging] = useState(false)
  let toggle = useEvent(() => {
    setChanging(true)
    onChange?.(!checked)

    d.nextFrame(() => {
      setChanging(false)
    })
  })
  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    event.preventDefault()
    toggle()
  })
  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === Keys.Space) {
      event.preventDefault()
      toggle()
    } else if (event.key === Keys.Enter) {
      attemptSubmit(event.currentTarget)
    }
  })

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  let handleKeyPress = useEvent((event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault())

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()
  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: disabled ?? false })

  let slot = useMemo(
    () =>
      ({
        checked,
        disabled,
        hover,
        focus,
        active,
        autofocus: props.autoFocus ?? false,
        changing,
      }) satisfies SwitchRenderPropArg,
    [checked, hover, focus, active, disabled, changing, props.autoFocus]
  )

  let ourProps = mergeProps(
    {
      id,
      ref: switchRef,
      role: 'switch',
      type: useResolveButtonType(props, internalSwitchRef),
      tabIndex: 0,
      'aria-checked': checked,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      disabled,
      onClick: handleClick,
      onKeyUp: handleKeyUp,
      onKeyPress: handleKeyPress,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let reset = useCallback(() => {
    return onChange?.(defaultChecked)
  }, [onChange /* Explicitly ignoring `defaultChecked` */])

  return (
    <>
      {name != null && (
        <FormFields data={checked ? { [name]: value || 'on' } : {}} form={form} onReset={reset} />
      )}
      {render({ ourProps, theirProps, slot, defaultTag: DEFAULT_SWITCH_TAG, name: 'Switch' })}
    </>
  )
}

// ---

export interface _internal_ComponentSwitch extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(
    props: SwitchProps<TTag> & RefProp<typeof SwitchFn>
  ): JSX.Element
}

export interface _internal_ComponentSwitchGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
    props: SwitchGroupProps<TTag> & RefProp<typeof GroupFn>
  ): JSX.Element
}

export interface _internal_ComponentSwitchLabel extends _internal_ComponentLabel {}
export interface _internal_ComponentSwitchDescription extends _internal_ComponentDescription {}

let SwitchRoot = forwardRefWithAs(SwitchFn) as unknown as _internal_ComponentSwitch
export let SwitchGroup = GroupFn as unknown as _internal_ComponentSwitchGroup
/** @deprecated use `<Label>` instead of `<SwitchLabel>` */
export let SwitchLabel = Label as _internal_ComponentSwitchLabel
/** @deprecated use `<Description>` instead of `<SwitchDescription>` */
export let SwitchDescription = Description as _internal_ComponentSwitchDescription

export let Switch = Object.assign(SwitchRoot, {
  Group: SwitchGroup,
  /** @deprecated use `<Label>` instead of `<Switch.Label>` */
  Label: SwitchLabel,
  /** @deprecated use `<Description>` instead of `<Switch.Description>` */
  Description: SwitchDescription,
})
