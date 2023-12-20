'use client'

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useDisabled } from '../../internal/disabled'
import type { Props } from '../../types'
import { forwardRefWithAs, render, type HasDisplayName, type RefProp } from '../../utils/render'

// ---

interface SharedData {
  slot?: {}
  name?: string
  props?: {}
}

let DescriptionContext = createContext<
  ({ value: string | undefined; register(value: string): () => void } & SharedData) | null
>(null)
DescriptionContext.displayName = 'DescriptionContext'

function useDescriptionContext() {
  let context = useContext(DescriptionContext)
  if (context === null) {
    let err = new Error(
      'You used a <Description /> component, but it is not inside a relevant parent.'
    )
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDescriptionContext)
    throw err
  }
  return context
}

export function useDescribedBy() {
  return useContext(DescriptionContext)?.value ?? undefined
}

interface DescriptionProviderProps extends SharedData {
  children: ReactNode
  value?: string | undefined
}

export function useDescriptions(): [
  string | undefined,
  (props: DescriptionProviderProps) => JSX.Element,
] {
  let [descriptionIds, setDescriptionIds] = useState<string[]>([])

  return [
    // The actual id's as string or undefined
    descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function DescriptionProvider(props: DescriptionProviderProps) {
        let register = useEvent((value: string) => {
          setDescriptionIds((existing) => [...existing, value])

          return () => {
            return setDescriptionIds((existing) => {
              let clone = existing.slice()
              let idx = clone.indexOf(value)
              if (idx !== -1) clone.splice(idx, 1)
              return clone
            })
          }
        })

        let contextBag = useMemo(
          () => ({
            register,
            slot: props.slot,
            name: props.name,
            props: props.props,
            value: props.value,
          }),
          [register, props.slot, props.name, props.props, props.value]
        )

        return (
          <DescriptionContext.Provider value={contextBag}>
            {props.children}
          </DescriptionContext.Provider>
        )
      }
    }, [setDescriptionIds]),
  ]
}

// ---

let DEFAULT_DESCRIPTION_TAG = 'p' as const

export type DescriptionProps<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG> =
  Props<TTag>

function DescriptionFn<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG>(
  props: DescriptionProps<TTag>,
  ref: Ref<HTMLParagraphElement>
) {
  let internalId = useId()
  let providedDisabled = useDisabled()
  let { id = `headlessui-description-${internalId}`, ...theirProps } = props
  let context = useDescriptionContext()
  let descriptionRef = useSyncRefs(ref)

  useIsoMorphicEffect(() => context.register(id), [id, context.register])

  let disabled = providedDisabled || false
  let slot = useMemo(() => ({ ...context.slot, disabled }), [context.slot, disabled])
  let ourProps = { ref: descriptionRef, ...context.props, id }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_DESCRIPTION_TAG,
    name: context.name || 'Description',
  })
}

// ---
export interface _internal_ComponentDescription extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG>(
    props: DescriptionProps<TTag> & RefProp<typeof DescriptionFn>
  ): JSX.Element
}

let DescriptionRoot = forwardRefWithAs(DescriptionFn) as unknown as _internal_ComponentDescription

export let Description = Object.assign(DescriptionRoot, {
  //
})
