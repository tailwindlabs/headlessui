'use client'

import React, { type ElementType, type Ref } from 'react'
import { useId } from '../../hooks/use-id'
import { useSlot } from '../../hooks/use-slot'
import { DisabledProvider, useDisabled } from '../../internal/disabled'
import { FormFieldsProvider } from '../../internal/form-fields'
import { IdProvider } from '../../internal/id'
import type { Props } from '../../types'
import { forwardRefWithAs, useRender, type HasDisplayName } from '../../utils/render'
import { useDescriptions } from '../description/description'
import { useLabels } from '../label/label'

let DEFAULT_FIELD_TAG = 'div' as const

type FieldRenderPropArg = {}
type FieldPropsWeControl = never

export type FieldProps<TTag extends ElementType = typeof DEFAULT_FIELD_TAG> = Props<
  TTag,
  FieldRenderPropArg,
  FieldPropsWeControl,
  {
    disabled?: boolean
  }
>

function FieldFn<TTag extends ElementType = typeof DEFAULT_FIELD_TAG>(
  props: FieldProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let inputId = `headlessui-control-${useId()}`

  let [labelledby, LabelProvider] = useLabels()
  let [describedBy, DescriptionProvider] = useDescriptions()

  let providedDisabled = useDisabled()
  let { disabled = providedDisabled || false, ...theirProps } = props

  let slot = useSlot<FieldRenderPropArg>({ disabled })

  let ourProps = {
    ref,
    disabled: disabled || undefined,
    'aria-disabled': disabled || undefined,
  }

  let render = useRender()

  return (
    <DisabledProvider value={disabled}>
      <LabelProvider value={labelledby}>
        <DescriptionProvider value={describedBy}>
          <IdProvider id={inputId}>
            {render({
              ourProps,
              theirProps: {
                ...theirProps,
                children: (
                  <FormFieldsProvider>
                    {typeof theirProps.children === 'function'
                      ? theirProps.children(slot)
                      : theirProps.children}
                  </FormFieldsProvider>
                ),
              },
              slot,
              defaultTag: DEFAULT_FIELD_TAG,
              name: 'Field',
            })}
          </IdProvider>
        </DescriptionProvider>
      </LabelProvider>
    </DisabledProvider>
  )
}

export interface _internal_ComponentField extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_FIELD_TAG>(props: FieldProps<TTag>): React.JSX.Element
}

export let Field = forwardRefWithAs(FieldFn) as _internal_ComponentField
