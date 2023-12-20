'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  useCallback,
  useMemo,
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
import { useDisabled } from '../../internal/disabled'
import { FormFields } from '../../internal/form-fields'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import {
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'
import { useDescribedBy } from '../description/description'
import { Keys } from '../keyboard'
import { useLabelledBy } from '../label/label'

let DEFAULT_CHECKBOX_TAG = 'span' as const
type CheckboxRenderPropArg = {
  checked: boolean
  changing: boolean
  focus: boolean
  active: boolean
  hover: boolean
  autofocus: boolean
  disabled: boolean
  indeterminate: boolean
}
type CheckboxPropsWeControl =
  | 'aria-checked'
  | 'aria-describedby'
  | 'aria-disabled'
  | 'aria-labelledby'
  | 'role'
  | 'tabIndex'

export type CheckboxProps<
  TTag extends ElementType = typeof DEFAULT_CHECKBOX_TAG,
  TType = string,
> = Props<
  TTag,
  CheckboxRenderPropArg,
  CheckboxPropsWeControl,
  {
    value?: TType
    disabled?: boolean
    indeterminate?: boolean

    checked?: boolean
    defaultChecked?: boolean
    autoFocus?: boolean
    form?: string
    name?: string
    onChange?: (checked: boolean) => void
  }
>

function CheckboxFn<TTag extends ElementType = typeof DEFAULT_CHECKBOX_TAG, TType = any>(
  props: CheckboxProps<TTag, TType>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = providedId || `headlessui-checkbox-${internalId}`,
    disabled = providedDisabled || false,
    checked: controlledChecked,
    defaultChecked = false,
    onChange: controlledOnChange,
    name,
    value,
    form,
    indeterminate = false,
    ...theirProps
  } = props

  let [checked, onChange] = useControllable(controlledChecked, controlledOnChange, defaultChecked)

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

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
    toggle()
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()

    switch (event.key) {
      case Keys.Space:
        event.preventDefault()
        toggle()
        break
    }
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: disabled ?? false })

  let ourProps = mergeProps(
    {
      ref,
      id,
      role: 'checkbox',
      'aria-checked': indeterminate ? 'mixed' : checked ? 'true' : 'false',
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      'aria-disabled': disabled ? true : undefined,
      indeterminate: indeterminate ? 'true' : undefined,
      tabIndex: 0,
      onKeyDown: disabled ? undefined : handleKeyDown,
      onClick: disabled ? undefined : handleClick,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let slot = useMemo(
    () =>
      ({
        checked,
        disabled,
        hover,
        focus,
        active,
        indeterminate,
        changing,
        autofocus: props.autoFocus ?? false,
      }) satisfies CheckboxRenderPropArg,
    [checked, indeterminate, disabled, hover, focus, active, changing, props.autoFocus]
  )

  let reset = useCallback(() => {
    return onChange?.(defaultChecked)
  }, [onChange /* Explicitly ignoring `defaultChecked` */])

  return (
    <>
      {name != null && (
        <FormFields data={checked ? { [name]: value || 'on' } : {}} form={form} onReset={reset} />
      )}
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_CHECKBOX_TAG,
        name: 'Checkbox',
      })}
    </>
  )
}

// ---

export interface _internal_ComponentCheckbox extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_CHECKBOX_TAG, TType = string>(
    props: CheckboxProps<TTag, TType> & RefProp<typeof CheckboxFn>
  ): JSX.Element
}

export let Checkbox = forwardRefWithAs(CheckboxFn) as unknown as _internal_ComponentCheckbox
