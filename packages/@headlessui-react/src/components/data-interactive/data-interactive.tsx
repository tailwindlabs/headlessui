'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { Fragment, type ElementType, type Ref } from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useSlot } from '../../hooks/use-slot'
import type { Props } from '../../types'
import {
  forwardRefWithAs,
  mergeProps,
  useRender,
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

  let slot = useSlot<DataInteractiveRenderPropArg>({ hover, focus, active })

  let render = useRender()

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
  ): React.JSX.Element
}

export let DataInteractive = forwardRefWithAs(
  DataInteractiveFn
) as _internal_ComponentDataInteractive
