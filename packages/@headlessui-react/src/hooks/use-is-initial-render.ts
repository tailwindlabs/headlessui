import { useEffect, useRef } from 'react'

export function useIsInitialRender() {
  let initial = useRef(true)

  useEffect(() => {
    initial.current = false

    return () => {
      initial.current = true
    }
  }, [])

  return initial.current
}
