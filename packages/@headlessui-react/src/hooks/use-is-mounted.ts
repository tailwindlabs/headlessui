import { useRef, useEffect } from 'react'

export function useIsMounted() {
  let mounted = useRef(false)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}
