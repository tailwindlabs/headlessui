'use client'

import React, { type ElementType, type Ref } from 'react'
import { useClose } from '../../internal/close-provider'
import { forwardRefWithAs, mergeProps } from '../../utils/render'
import { Button, type ButtonProps, type _internal_ComponentButton } from '../button/button'

let DEFAULT_BUTTON_TAG = 'button' as const

export type CloseButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> =
  ButtonProps<TTag>

function CloseButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: ButtonProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let close = useClose()
  return <Button ref={ref} {...mergeProps({ onClick: close }, props)} />
}

export let CloseButton = forwardRefWithAs(CloseButtonFn) as _internal_ComponentButton
