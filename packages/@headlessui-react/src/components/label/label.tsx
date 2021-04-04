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

let LabelContext = createContext<{ register(value: string): () => void }>({
  register() {
    return () => {}
  },
})

function useLabelContext() {
  return useContext(LabelContext)
}

export function useLabels(): [string | undefined, (props: { children: ReactNode }) => JSX.Element] {
  let [labelIds, setLabelIds] = useState<string[]>([])

  return [
    // The actual id's as string or undefined.
    labelIds.length > 0 ? labelIds.join(' ') : undefined,

    // The provider component
    useMemo(() => {
      return function LabelProvider(props: { children: ReactNode }) {
        let register = useCallback((value: string) => {
          setLabelIds(existing => [...existing, value])

          return () =>
            setLabelIds(existing => {
              let clone = existing.slice()
              let idx = clone.indexOf(value)
              if (idx !== -1) clone.splice(idx, 1)
              return clone
            })
        }, [])

        let contextBag = useMemo(() => ({ register }), [register])

        return <LabelContext.Provider value={contextBag}>{props.children}</LabelContext.Provider>
      }
    }, [setLabelIds]),
  ]
}

// ---

let DEFAULT_LABEL_TAG = 'label' as const
interface LabelRenderPropArg {}
type LabelPropsWeControl = 'id'

export function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>
) {
  let { register } = useLabelContext()
  let id = `headlessui-label-${useId()}`

  useIsoMorphicEffect(() => register(id), [id, register])

  let passThroughProps = props
  let propsWeControl = { id }

  return render({
    props: { ...passThroughProps, ...propsWeControl },
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Label',
  })
}
