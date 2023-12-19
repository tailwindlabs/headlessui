'use client'

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useDisabled } from '../../internal/disabled'
import { useProvidedId } from '../../internal/id'
import type { Props } from '../../types'
import { forwardRefWithAs, render, type HasDisplayName, type RefProp } from '../../utils/render'

// ---

interface SharedData {
  slot?: {}
  name?: string
  props?: Record<string, any>
}

let LabelContext = createContext<
  ({ value: string | undefined; register(value: string): () => void } & SharedData) | null
>(null)
LabelContext.displayName = 'LabelContext'

export function useLabelContext() {
  let context = useContext(LabelContext)
  if (context === null) {
    let err = new Error('You used a <Label /> component, but it is not inside a relevant parent.')
    if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext)
    throw err
  }
  return context
}

export function useLabelledBy(alwaysAvailableIds?: (string | undefined | null)[]) {
  let labelIds = useContext(LabelContext)?.value ?? undefined
  if ((alwaysAvailableIds?.length ?? 0) > 0) {
    return [labelIds, ...alwaysAvailableIds!].filter(Boolean).join(' ')
  }
  return labelIds
}

interface LabelProviderProps extends SharedData {
  children: ReactNode
  value?: string | undefined
}

export function useLabels({ inherit = false } = {}): [
  string | undefined,
  (props: LabelProviderProps & { inherit?: boolean }) => JSX.Element,
] {
  let parentLabelledBy = useLabelledBy()
  let [labelIds, setLabelIds] = useState<string[]>([])

  let allLabelIds = inherit ? [parentLabelledBy, ...labelIds].filter(Boolean) : labelIds

  return [
    // The actual id's as string or undefined.
    allLabelIds.length > 0 ? allLabelIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function LabelProvider(props: LabelProviderProps) {
        let register = useEvent((value: string) => {
          setLabelIds((existing) => [...existing, value])

          return () => {
            return setLabelIds((existing) => {
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

        return <LabelContext.Provider value={contextBag}>{props.children}</LabelContext.Provider>
      }
    }, [setLabelIds]),
  ]
}

// ---

let DEFAULT_LABEL_TAG = 'label' as const

export type LabelProps<TTag extends ElementType = typeof DEFAULT_LABEL_TAG> = Props<TTag> & {
  passive?: boolean
  htmlFor?: string
}

function LabelFn<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: LabelProps<TTag>,
  ref: Ref<HTMLLabelElement>
) {
  let internalId = useId()
  let context = useLabelContext()
  let providedHtmlFor = useProvidedId()
  let providedDisabled = useDisabled()
  let {
    id = `headlessui-label-${internalId}`,
    htmlFor = providedHtmlFor ?? context.props?.htmlFor,
    passive = false,
    ...theirProps
  } = props
  let labelRef = useSyncRefs(ref)

  useIsoMorphicEffect(() => context.register(id), [id, context.register])

  let handleClick = useEvent((e: ReactMouseEvent) => {
    let current = e.currentTarget

    // Labels connected to 'real' controls will already click the element. But we don't know that
    // ahead of time. This will prevent the default click, such that only a single click happens
    // instead of two. Otherwise this results in a visual no-op.
    if (current instanceof HTMLLabelElement) {
      e.preventDefault()
    }

    // Ensure `onClick` from context is called
    if (
      context.props &&
      'onClick' in context.props &&
      typeof context.props.onClick === 'function'
    ) {
      context.props.onClick(e)
    }

    if (current instanceof HTMLLabelElement) {
      let target = document.getElementById(current.htmlFor)
      if (target) {
        // Bail if the target element is disabled
        let actuallyDisabled = target.getAttribute('disabled')
        if (actuallyDisabled === 'true' || actuallyDisabled === '') {
          return
        }

        let ariaDisabled = target.getAttribute('aria-disabled')
        if (ariaDisabled === 'true' || ariaDisabled === '') {
          return
        }

        // Ensure we click the element this label is bound to. This is necessary for elements that
        // immediately require state changes, e.g.: Radio & Checkbox inputs need to be checked (or
        // unchecked).
        if (
          (target instanceof HTMLInputElement &&
            (target.type === 'radio' || target.type === 'checkbox')) ||
          target.role === 'radio' ||
          target.role === 'checkbox' ||
          target.role === 'switch'
        ) {
          target.click()
        }

        // Move focus to the element, this allows you to start using keyboard shortcuts since the
        // bound element is now focused.
        target.focus({ preventScroll: true })
      }
    }
  })

  let disabled = providedDisabled || false
  let slot = useMemo(() => ({ ...context.slot, disabled }), [context.slot, disabled])

  let ourProps = {
    ref: labelRef,
    ...context.props,
    id,
    htmlFor,
    onClick: handleClick,
  }

  if (passive) {
    if ('onClick' in ourProps) {
      delete (ourProps as any)['htmlFor']
      delete (ourProps as any)['onClick']
    }

    if ('onClick' in theirProps) {
      delete (theirProps as any)['onClick']
    }
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: htmlFor ? DEFAULT_LABEL_TAG : 'div',
    name: context.name || 'Label',
  })
}

// ---

export interface _internal_ComponentLabel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
    props: LabelProps<TTag> & RefProp<typeof LabelFn>
  ): JSX.Element
}

let LabelRoot = forwardRefWithAs(LabelFn) as unknown as _internal_ComponentLabel

export let Label = Object.assign(LabelRoot, {
  //
})
