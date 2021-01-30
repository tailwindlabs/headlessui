import { useRef, useEffect } from 'react'

export function useIsMounted() {
  let mounted = useRef(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}
