'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useMemo, type ElementType, type Ref } from 'react'
import { useId } from '../../hooks/use-id'
import { useDisabled } from '../../internal/disabled'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import {
  forwardRefWithAs,
  mergeProps,
  useRender,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'
import { useDescribedBy } from '../description/description'
import { useLabelledBy } from '../label/label'

let DEFAULT_INPUT_TAG = 'input' as const

type InputRenderPropArg = {
  disabled: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
  invalid: boolean
}
type InputPropsWeControl = 'aria-labelledby' | 'aria-describedby'

export type InputProps<TTag extends ElementType = typeof DEFAULT_INPUT_TAG> = Props<
  TTag,
  InputRenderPropArg,
  InputPropsWeControl,
  {
    disabled?: boolean
    invalid?: boolean
    autoFocus?: boolean
  }
>

function InputFn<TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(
  props: InputProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = providedId || `headlessui-input-${internalId}`,
    disabled = providedDisabled || false,
    autoFocus = false,
    invalid = false,
    ...theirProps
  } = props

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

  let { isFocused: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })

  let ourProps = mergeProps(
    {
      ref,
      id,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      'aria-invalid': invalid ? 'true' : undefined,
      disabled: disabled || undefined,
      autoFocus,
    },
    focusProps,
    hoverProps
  )

  let slot = useMemo(() => {
    return { disabled, invalid, hover, focus, autofocus: autoFocus } satisfies InputRenderPropArg
  }, [disabled, invalid, hover, focus, autoFocus])

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_INPUT_TAG,
    name: 'Input',
  })
}

export interface _internal_ComponentInput extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(
    props: InputProps<TTag> & RefProp<typeof InputFn>
  ): React.JSX.Element
}

export let Input = forwardRefWithAs(InputFn) as _internal_ComponentInput
