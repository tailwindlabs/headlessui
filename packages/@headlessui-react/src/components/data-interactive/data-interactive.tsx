'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { Fragment, useMemo, type ElementType, type Ref } from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import type { Props } from '../../types'
import {
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type RefProp,
} from '../../utils/render'

let DEFAULT_DATA_INTERACTIVE_TAG = Fragment

type DataInteractiveRenderPropArg = {
  hover: boolean
  focus: boolean
  active: boolean
}
type DataInteractivePropsWeControl = never

export type DataInteractiveProps<TTag extends ElementType = typeof DEFAULT_DATA_INTERACTIVE_TAG> =
  Props<TTag, DataInteractiveRenderPropArg, DataInteractivePropsWeControl, {}>

function DataInteractiveFn<TTag extends ElementType = typeof DEFAULT_DATA_INTERACTIVE_TAG>(
  props: DataInteractiveProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { ...theirProps } = props

  // Ideally we can use a `disabled` prop, but that would depend on the props of the child element
  // and we don't have access to that in this component.

  let disabled = false

  let { isFocusVisible: focus, focusProps } = useFocusRing()
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let ourProps = mergeProps({ ref }, focusProps, hoverProps, pressProps)

  let slot = useMemo(
    () => ({ hover, focus, active }) satisfies DataInteractiveRenderPropArg,
    [hover, focus, active]
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_DATA_INTERACTIVE_TAG,
    name: 'DataInteractive',
  })
}

export interface _internal_ComponentDataInteractive extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_DATA_INTERACTIVE_TAG>(
    props: DataInteractiveProps<TTag> & RefProp<typeof DataInteractiveFn>
  ): JSX.Element
}

export let DataInteractive = forwardRefWithAs(
  DataInteractiveFn
) as unknown as _internal_ComponentDataInteractive
