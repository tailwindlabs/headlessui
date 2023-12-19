'use client'

import React, { type ElementType, type Ref } from 'react'
import type { Props } from '../../types'
import { forwardRefWithAs, type HasDisplayName } from '../../utils/render'
import { Label } from '../label/label'

let DEFAULT_LEGEND_TAG = Label

type LegendRenderPropArg = {}
type LegendPropsWeControl = never

export type LegendProps<TTag extends ElementType = typeof DEFAULT_LEGEND_TAG> = Props<
  TTag,
  LegendRenderPropArg,
  LegendPropsWeControl,
  {}
>

function LegendFn<TTag extends ElementType = typeof DEFAULT_LEGEND_TAG>(
  props: LegendProps<TTag>,
  ref: Ref<HTMLElement>
) {
  // @ts-expect-error The props can still contain an `as` prop, but we are already passing an as
  // prop as `div` (as a default). Now the ref is inferred as the ref for a `div`, but it can still
  // be anything.
  return <Label as="div" ref={ref} {...props} />
}

export interface _internal_ComponentLegend extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_LEGEND_TAG>(props: LegendProps<TTag>): JSX.Element
}

export let Legend = forwardRefWithAs(LegendFn) as unknown as _internal_ComponentLegend
