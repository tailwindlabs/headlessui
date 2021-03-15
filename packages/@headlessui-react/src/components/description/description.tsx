import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,

  // Types
  ElementType,
  ReactNode,
} from 'react'

import { Props } from '../../types'
import { useId } from '../../hooks/use-id'
import { render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'

// ---

let DescriptionContext = createContext<{ register(value: string): () => void }>({
  register() {
    return () => {}
  },
})

function useDescriptionContext() {
  return useContext(DescriptionContext)
}

export function useDescriptions(): [
  string | undefined,
  (props: { children: ReactNode }) => JSX.Element
] {
  let [descriptionIds, setDescriptionIds] = useState<string[]>([])

  return [
    // The actual id's as string or undefined
    descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function DescriptionProvider(props: { children: ReactNode }) {
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

        let contextBag = useMemo(() => ({ register }), [register])

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
  let { register } = useDescriptionContext()
  let id = `headlessui-description-${useId()}`

  useIsoMorphicEffect(() => register(id), [id, register])

  let passThroughProps = props
  let propsWeControl = { id }
  let bag = useMemo<DescriptionRenderPropArg>(() => ({}), [])

  return render({ ...passThroughProps, ...propsWeControl }, bag, DEFAULT_DESCRIPTION_TAG)
}
