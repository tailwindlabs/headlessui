'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useMemo, type ElementType, type Ref } from 'react'
import { useId } from '../../hooks/use-id'
import { useDisabled } from '../../internal/disabled'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import { forwardRefWithAs, mergeProps, render, type HasDisplayName } from '../../utils/render'
import { useDescribedBy } from '../description/description'
import { useLabelledBy } from '../label/label'

let DEFAULT_TEXTAREA_TAG = 'textarea' as const

type TextareaRenderPropArg = {
  disabled: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
  invalid: boolean
}
type TextareaPropsWeControl = 'aria-labelledby' | 'aria-describedby'

export type TextareaProps<TTag extends ElementType = typeof DEFAULT_TEXTAREA_TAG> = Props<
  TTag,
  TextareaRenderPropArg,
  TextareaPropsWeControl,
  {
    disabled?: boolean
    invalid?: boolean
    autoFocus?: boolean
  }
>

function TextareaFn<TTag extends ElementType = typeof DEFAULT_TEXTAREA_TAG>(
  props: TextareaProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = providedId || `headlessui-textarea-${internalId}`,
    disabled = providedDisabled || false,
    invalid = false,
    ...theirProps
  } = props

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled ?? false })

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
    hoverProps
  )

  let slot = useMemo(
    () =>
      ({
        disabled,
        invalid,
        hover,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies TextareaRenderPropArg,
    [disabled, invalid, hover, focus, props.autoFocus]
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TEXTAREA_TAG,
    name: 'Textarea',
  })
}

export interface _internal_ComponentTextarea extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TEXTAREA_TAG>(props: TextareaProps<TTag>): JSX.Element
}

export let Textarea = forwardRefWithAs(TextareaFn) as unknown as _internal_ComponentTextarea
