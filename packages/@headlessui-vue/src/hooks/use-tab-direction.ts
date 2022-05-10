import { ref } from 'vue'
import { useWindowEvent } from './use-window-event'

export enum Direction {
  Forwards,
  Backwards,
}

export function useTabDirection() {
  let direction = ref(Direction.Forwards)

  useWindowEvent('keydown', (event) => {
    if (event.key === 'Tab') {
      direction.value = event.shiftKey ? Direction.Backwards : Direction.Forwards
    }
  })

  return direction
}
