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
interface LabelRenderPropArg {}
type LabelPropsWeControl = 'id'

export function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl> & {
    passive?: boolean
  }
) {
  let { passive = false, ...passThroughProps } = props
  let context = useLabelContext()
  let id = `headlessui-label-${useId()}`

  useIsoMorphicEffect(() => context.register(id), [id, context.register])

  let propsWeControl = { ...context.props, id }

  let allProps = { ...passThroughProps, ...propsWeControl }
  // @ts-expect-error props are dynamic via context, some components will
  //                  provide an onClick then we can delete it.
  if (passive) delete allProps['onClick']

  return render({
    props: allProps,
    slot: context.slot || {},
    defaultTag: DEFAULT_LABEL_TAG,
    name: context.name || 'Label',
  })
}
