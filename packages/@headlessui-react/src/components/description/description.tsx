import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,

  // Types
  ElementType,
  ReactNode,
  ContextType,
} from 'react'

import { Props } from '../../types'
import { useId } from '../../hooks/use-id'
import { render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'

// ---

let DescriptionContext = createContext<{
  register(value: string): () => void
  slot: Record<string, any>
}>({
  register() {
    return () => {}
  },
  slot: {},
})

function useDescriptionContext() {
  return useContext(DescriptionContext)
}

export function useDescriptions(): [
  string | undefined,
  (props: { children: ReactNode; slot?: Record<string, any> }) => JSX.Element
] {
  let [descriptionIds, setDescriptionIds] = useState<string[]>([])

  return [
    // The actual id's as string or undefined
    descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function DescriptionProvider(props: {
        children: ReactNode
        slot?: Record<string, any>
      }) {
        let register = useCallback((value: string) => {
          setDescriptionIds(existing => [...existing, value])

          return () =>
            setDescriptionIds(existing => {
              let clone = existing.slice()
              let idx = clone.indexOf(value)
              if (idx !== -1) clone.splice(idx, 1)
              return clone
            })
        }, [])

        let contextBag = useMemo<ContextType<typeof DescriptionContext>>(
          () => ({ register, slot: props.slot ?? {} }),
          [register, props.slot]
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
interface DescriptionRenderPropArg {}
type DescriptionPropsWeControl = 'id'

export function Description<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG>(
  props: Props<TTag, DescriptionRenderPropArg, DescriptionPropsWeControl>
) {
  let { register, slot: slot } = useDescriptionContext()
  let id = `headlessui-description-${useId()}`

  useIsoMorphicEffect(() => register(id), [id, register])

  let passThroughProps = props
  let propsWeControl = { id }

  return render({
    props: { ...passThroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_DESCRIPTION_TAG,
    name: 'Description',
  })
}
