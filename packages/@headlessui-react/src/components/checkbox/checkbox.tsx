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
import { useDefaultValue } from '../../hooks/use-default-value'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useDisabled } from '../../internal/disabled'
import { FormFields } from '../../internal/form-fields'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { attemptSubmit } from '../../utils/form'
import {
  forwardRefWithAs,
  mergeProps,
  useRender,
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
    tabIndex?: number
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
    autoFocus = false,
    checked: controlledChecked,
    defaultChecked: _defaultChecked,
    onChange: controlledOnChange,
    name,
    value,
    form,
    indeterminate = false,
    tabIndex = 0,
    ...theirProps
  } = props

  let defaultChecked = useDefaultValue(_defaultChecked)
  let [checked, onChange] = useControllable(
    controlledChecked,
    controlledOnChange,
    defaultChecked ?? false
  )

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

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

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
      tabIndex: disabled ? undefined : tabIndex,
      onKeyUp: disabled ? undefined : handleKeyUp,
      onKeyPress: disabled ? undefined : handleKeyPress,
      onClick: disabled ? undefined : handleClick,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let slot = useMemo(() => {
    return {
      checked,
      disabled,
      hover,
      focus,
      active,
      indeterminate,
      changing,
      autofocus: autoFocus,
    } satisfies CheckboxRenderPropArg
  }, [checked, indeterminate, disabled, hover, focus, active, changing, autoFocus])

  let reset = useCallback(() => {
    if (defaultChecked === undefined) return
    return onChange?.(defaultChecked)
  }, [onChange, defaultChecked])

  let render = useRender()

  return (
    <>
      {name != null && (
        <FormFields
          disabled={disabled}
          data={{ [name]: value || 'on' }}
          overrides={{ type: 'checkbox', checked }}
          form={form}
          onReset={reset}
        />
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
  ): React.JSX.Element
}

export let Checkbox = forwardRefWithAs(CheckboxFn) as _internal_ComponentCheckbox
