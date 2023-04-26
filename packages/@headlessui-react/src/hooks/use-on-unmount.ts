import { useRef, useEffect } from 'react'
import { microTask } from '../utils/micro-task'

export function useOnUnmount(cb: () => void) {
  let trulyUnmounted = useRef(false)
  useEffect(() => {
    trulyUnmounted.current = false

    return () => {
      trulyUnmounted.current = true
      microTask(() => {
        if (!trulyUnmounted.current) return

        cb()
      })
    }
  }, [])
}
