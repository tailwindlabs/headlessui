import { useEffect, useRef } from 'react'
import { useEvent } from './use-event'

export function useWatch<T>(cb: (values: T[]) => void | (() => void), dependencies: T[]) {
  let track = useRef<typeof dependencies>([])
  let action = useEvent(cb)

  useEffect(() => {
    for (let [idx, value] of dependencies.entries()) {
      if (track.current[idx] !== value) {
        // At least 1 item changed
        let returnValue = action(dependencies)
        track.current = dependencies
        return returnValue
      }
    }
  }, [action, ...dependencies])
}
