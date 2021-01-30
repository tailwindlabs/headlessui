import { useState, useRef } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useComputed<T>(cb: () => T, dependencies: React.DependencyList) {
  let [value, setValue] = useState(cb)
  let cbRef = useRef(cb)
  useIsoMorphicEffect(() => {
    cbRef.current = cb
  }, [cb])
  useIsoMorphicEffect(() => setValue(cbRef.current), [cbRef, setValue, ...dependencies])
  return value
}
