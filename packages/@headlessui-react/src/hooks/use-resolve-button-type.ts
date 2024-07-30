import { useState, type MutableRefObject } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

function resolveType<TTag>(props: { type?: string; as?: TTag }) {
  if (props.type) return props.type

  let tag = props.as ?? 'button'
  if (typeof tag === 'string' && tag.toLowerCase() === 'button') return 'button'

  return undefined
}

export function useResolveButtonType<TTag>(
  props: { type?: string; as?: TTag },
  ref: MutableRefObject<HTMLElement | null> | HTMLElement | null
) {
  let [type, setType] = useState(() => resolveType(props))

  useIsoMorphicEffect(() => {
    setType(resolveType(props))
  }, [props.type, props.as])

  useIsoMorphicEffect(() => {
    if (type) return

    let node = ref === null ? null : ref instanceof HTMLElement ? ref : ref.current
    if (!node) return

    if (node instanceof HTMLButtonElement && !node.hasAttribute('type')) {
      setType('button')
    }
  }, [type, ref])

  return type
}
