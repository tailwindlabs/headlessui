'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { useMemo, type ElementType, type Ref } from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useDisabled } from '../../internal/disabled'
import type { Props } from '../../types'
import {
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'

let DEFAULT_BUTTON_TAG = 'button' as const

type ButtonRenderPropArg = {
  disabled: boolean
  hover: boolean
  focus: boolean
  active: boolean
  autofocus: boolean
}
type ButtonPropsWeControl = never

export type ButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    disabled?: boolean
    autoFocus?: boolean
    type?: 'button' | 'submit' | 'reset'
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: ButtonProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let providedDisabled = useDisabled()
  let { disabled = providedDisabled || false, ...theirProps } = props

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let ourProps = mergeProps(
    {
      ref,
      disabled: disabled || undefined,
      type: theirProps.type ?? 'button',
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let slot = useMemo(
    () =>
      ({
        disabled,
        hover,
        focus,
        active,
        autofocus: props.autoFocus ?? false,
      }) satisfies ButtonRenderPropArg,
    [disabled, hover, focus, active, props.autoFocus]
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Button',
  })
}

export interface _internal_ComponentButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: ButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

export let Button = forwardRefWithAs(ButtonFn) as unknown as _internal_ComponentButton
