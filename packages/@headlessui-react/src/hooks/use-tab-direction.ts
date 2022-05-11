import { useRef } from 'react'
import { useWindowEvent } from './use-window-event'

export enum Direction {
  Forwards,
  Backwards,
}

export function useTabDirection() {
  let direction = useRef(Direction.Forwards)

  useWindowEvent(
    'keydown',
    (event) => {
      if (event.key === 'Tab') {
        direction.current = event.shiftKey ? Direction.Backwards : Direction.Forwards
      }
    },
    true
  )

  return direction
}
