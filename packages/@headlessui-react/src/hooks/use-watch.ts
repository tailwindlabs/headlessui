import { useEffect, useRef } from 'react'
import { useEvent } from './use-event'

export function useWatch<T extends any[]>(
  cb: (newValues: [...T], oldValues: [...T]) => void | (() => void),
  dependencies: [...T]
) {
  let track = useRef<typeof dependencies>([] as unknown as [...T])
  let action = useEvent(cb)

  useEffect(() => {
    let oldValues = [...track.current] as unknown as [...T]

    for (let [idx, value] of dependencies.entries()) {
      if (track.current[idx] !== value) {
        // At least 1 item changed
        let returnValue = action(dependencies, oldValues)
        track.current = dependencies
        return returnValue
      }
    }
  }, [action, ...dependencies])
}
