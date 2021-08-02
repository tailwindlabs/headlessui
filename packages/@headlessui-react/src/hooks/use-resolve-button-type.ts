import { useState, MutableRefObject } from 'react'

import { useIsoMorphicEffect } from './use-iso-morphic-effect'

function resolveType<TTag>(props: { type?: string; as?: TTag }) {
  if (props.type) return props.type

  let tag = props.as ?? 'button'
  if (typeof tag === 'string' && tag.toLowerCase() === 'button') return 'button'

  return undefined
}

export function useResolveButtonType<TTag>(
  props: { type?: string; as?: TTag },
  ref: MutableRefObject<HTMLElement | null>
) {
  let [type, setType] = useState(() => resolveType(props))

  useIsoMorphicEffect(() => {
    setType(resolveType(props))
  }, [props.type, props.as])

  useIsoMorphicEffect(() => {
    if (type) return
    if (!ref.current) return

    if (ref.current instanceof HTMLButtonElement && !ref.current.hasAttribute('type')) {
      setType('button')
    }
  }, [type, ref])

  return type
}
