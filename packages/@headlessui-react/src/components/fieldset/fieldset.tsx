'use client'

import React, { useMemo, type ElementType, type Ref } from 'react'
import { DisabledProvider, useDisabled } from '../../internal/disabled'
import type { Props } from '../../types'
import { forwardRefWithAs, render, type HasDisplayName } from '../../utils/render'
import { useLabels } from '../label/label'

let DEFAULT_FIELDSET_TAG = 'div' as const

type FieldsetRenderPropArg = {}
type FieldsetPropsWeControl = 'aria-controls'

export type FieldsetProps<TTag extends ElementType = typeof DEFAULT_FIELDSET_TAG> = Props<
  TTag,
  FieldsetRenderPropArg,
  FieldsetPropsWeControl,
  {
    disabled?: boolean
  }
>

function FieldsetFn<TTag extends ElementType = typeof DEFAULT_FIELDSET_TAG>(
  props: FieldsetProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let providedDisabled = useDisabled()
  let { disabled = providedDisabled || false, ...theirProps } = props

  let [labelledBy, LabelProvider] = useLabels()

  let slot = useMemo(() => ({ disabled }) satisfies FieldsetRenderPropArg, [disabled])

  let ourProps = {
    ref,
    role: 'group',

    'aria-labelledby': labelledBy,
    'aria-disabled': disabled || undefined,
  }

  return (
    <DisabledProvider value={disabled}>
      <LabelProvider>
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_FIELDSET_TAG,
          name: 'Fieldset',
        })}
      </LabelProvider>
    </DisabledProvider>
  )
}

export interface _internal_ComponentFieldset extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_FIELDSET_TAG>(props: FieldsetProps<TTag>): JSX.Element
}

export let Fieldset = forwardRefWithAs(FieldsetFn) as unknown as _internal_ComponentFieldset
