'use client'

import React, { useMemo, type ElementType, type Ref } from 'react'
import { useResolvedTag } from '../../hooks/use-resolved-tag'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { DisabledProvider, useDisabled } from '../../internal/disabled'
import type { Props } from '../../types'
import { forwardRefWithAs, useRender, type HasDisplayName } from '../../utils/render'
import { useLabels } from '../label/label'

let DEFAULT_FIELDSET_TAG = 'fieldset' as const

type FieldsetRenderPropArg = {}
type FieldsetPropsWeControl = 'aria-labelledby' | 'aria-disabled' | 'role'

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

  let [tag, resolveTag] = useResolvedTag(props.as ?? DEFAULT_FIELDSET_TAG)
  let fieldsetRef = useSyncRefs(ref, resolveTag)

  let [labelledBy, LabelProvider] = useLabels()

  let slot = useMemo(() => ({ disabled }) satisfies FieldsetRenderPropArg, [disabled])

  let ourProps =
    tag === 'fieldset'
      ? {
          ref: fieldsetRef,
          'aria-labelledby': labelledBy,
          disabled: disabled || undefined,
        }
      : {
          ref: fieldsetRef,
          role: 'group',
          'aria-labelledby': labelledBy,
          'aria-disabled': disabled || undefined,
        }

  let render = useRender()

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
  <TTag extends ElementType = typeof DEFAULT_FIELDSET_TAG>(
    props: FieldsetProps<TTag>
  ): React.JSX.Element
}

export let Fieldset = forwardRefWithAs(FieldsetFn) as _internal_ComponentFieldset
