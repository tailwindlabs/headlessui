import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,

  // Types
  ElementType,
  ReactNode,
  Ref,
} from 'react'

import { Props } from '../../types'
import { useId } from '../../hooks/use-id'
import { forwardRefWithAs, render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'

// ---

interface SharedData {
  slot?: {}
  name?: string
  props?: {}
}

let DescriptionContext = createContext<
  ({ register(value: string): () => void } & SharedData) | null
>(null)

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

interface DescriptionProviderProps extends SharedData {
  children: ReactNode
}

export function useDescriptions(): [
  string | undefined,
  (props: DescriptionProviderProps) => JSX.Element
] {
  let [descriptionIds, setDescriptionIds] = useState<string[]>([])

  return [
    // The actual id's as string or undefined
    descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function DescriptionProvider(props: DescriptionProviderProps) {
        let register = useCallback((value: string) => {
          setDescriptionIds((existing) => [...existing, value])

          return () =>
            setDescriptionIds((existing) => {
              let clone = existing.slice()
              let idx = clone.indexOf(value)
              if (idx !== -1) clone.splice(idx, 1)
              return clone
            })
        }, [])

        let contextBag = useMemo(
          () => ({ register, slot: props.slot, name: props.name, props: props.props }),
          [register, props.slot, props.name, props.props]
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

export let Description = forwardRefWithAs(function Description<
  TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG
>(props: Props<TTag, {}, 'id'>, ref: Ref<HTMLParagraphElement>) {
  let context = useDescriptionContext()
  let id = `headlessui-description-${useId()}`
  let descriptionRef = useSyncRefs(ref)

  useIsoMorphicEffect(() => context.register(id), [id, context.register])

  let theirProps = props
  let ourProps = { ref: descriptionRef, ...context.props, id }

  return render({
    ourProps,
    theirProps,
    slot: context.slot || {},
    defaultTag: DEFAULT_DESCRIPTION_TAG,
    name: context.name || 'Description',
  })
})
