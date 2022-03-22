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

let LabelContext = createContext<({ register(value: string): () => void } & SharedData) | null>(
  null
)

function useLabelContext() {
  let context = useContext(LabelContext)
  if (context === null) {
    let err = new Error('You used a <Label /> component, but it is not inside a relevant parent.')
    if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext)
    throw err
  }
  return context
}

interface LabelProviderProps extends SharedData {
  children: ReactNode
}

export function useLabels(): [string | undefined, (props: LabelProviderProps) => JSX.Element] {
  let [labelIds, setLabelIds] = useState<string[]>([])

  return [
    // The actual id's as string or undefined.
    labelIds.length > 0 ? labelIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function LabelProvider(props: LabelProviderProps) {
        let register = useCallback((value: string) => {
          setLabelIds((existing) => [...existing, value])

          return () =>
            setLabelIds((existing) => {
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

        return <LabelContext.Provider value={contextBag}>{props.children}</LabelContext.Provider>
      }
    }, [setLabelIds]),
  ]
}

// ---

let DEFAULT_LABEL_TAG = 'label' as const

export let Label = forwardRefWithAs(function Label<
  TTag extends ElementType = typeof DEFAULT_LABEL_TAG
>(
  props: Props<TTag, {}, 'id'> & {
    passive?: boolean
  },
  ref: Ref<HTMLLabelElement>
) {
  let { passive = false, ...theirProps } = props
  let context = useLabelContext()
  let id = `headlessui-label-${useId()}`
  let labelRef = useSyncRefs(ref)

  useIsoMorphicEffect(() => context.register(id), [id, context.register])

  let ourProps = { ref: labelRef, ...context.props, id }

  if (passive) {
    if ('onClick' in ourProps) {
      delete (ourProps as any)['onClick']
    }

    if ('onClick' in theirProps) {
      delete (theirProps as any)['onClick']
    }
  }

  return render({
    ourProps,
    theirProps,
    slot: context.slot || {},
    defaultTag: DEFAULT_LABEL_TAG,
    name: context.name || 'Label',
  })
})
