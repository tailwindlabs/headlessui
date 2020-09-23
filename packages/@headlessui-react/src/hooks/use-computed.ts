import * as React from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useComputed<T>(cb: () => T, dependencies: React.DependencyList) {
  const [value, setValue] = React.useState(cb)
  const cbRef = React.useRef(cb)
  useIsoMorphicEffect(() => {
    cbRef.current = cb
  }, [cb])
  useIsoMorphicEffect(() => setValue(cbRef.current), [cbRef, setValue, ...dependencies])
  return value
}
