import { useEffect, useRef } from 'react'
import { microTask } from '../utils/micro-task'
import { useEvent } from './use-event'

export function useOnUnmount(cb: () => void) {
  let stableCb = useEvent(cb)

  let trulyUnmounted = useRef(false)
  useEffect(() => {
    trulyUnmounted.current = false

    return () => {
      trulyUnmounted.current = true
      microTask(() => {
        if (!trulyUnmounted.current) return

        stableCb()
      })
    }
  }, [stableCb])
}
