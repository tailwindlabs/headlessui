'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useMemo, type ElementType, type Ref } from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useId } from '../../hooks/use-id'
import { useDisabled } from '../../internal/disabled'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import { forwardRefWithAs, mergeProps, render, type HasDisplayName } from '../../utils/render'
import { useDescribedBy } from '../description/description'
import { useLabelledBy } from '../label/label'

let DEFAULT_SELECT_TAG = 'select' as const

type SelectRenderPropArg = {
  disabled: boolean
  hover: boolean
  focus: boolean
  active: boolean
  autofocus: boolean
  invalid: boolean
}
type SelectPropsWeControl = 'aria-labelledby' | 'aria-describedby'

export type SelectProps<TTag extends ElementType = typeof DEFAULT_SELECT_TAG> = Props<
  TTag,
  SelectRenderPropArg,
  SelectPropsWeControl,
  {
    disabled?: boolean
    invalid?: boolean
    autoFocus?: boolean
  }
>

function SelectFn<TTag extends ElementType = typeof DEFAULT_SELECT_TAG>(
  props: SelectProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = providedId || `headlessui-select-${internalId}`,
    disabled = providedDisabled || false,
    invalid = false,
    ...theirProps
  } = props

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: disabled ?? false })

  let ourProps = mergeProps(
    {
      ref,
      id,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      'aria-invalid': invalid ? '' : undefined,
      disabled: disabled || undefined,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let slot = useMemo(
    () =>
      ({
        disabled,
        invalid,
        hover,
        focus,
        active,
        autofocus: props.autoFocus ?? false,
      }) satisfies SelectRenderPropArg,
    [disabled, invalid, hover, focus, active, props.autoFocus]
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_SELECT_TAG,
    name: 'Select',
  })
}

export interface _internal_ComponentSelect extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SELECT_TAG>(props: SelectProps<TTag>): JSX.Element
}

export let Select = forwardRefWithAs(SelectFn) as unknown as _internal_ComponentSelect
