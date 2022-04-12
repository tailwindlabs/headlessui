import { useRef } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useIsMounted() {
  let mounted = useRef(false)

  useIsoMorphicEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}
