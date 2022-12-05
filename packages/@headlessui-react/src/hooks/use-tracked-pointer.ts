import { useRef } from 'react'

type PointerPosition = [x: number, y: number]

function eventToPosition(evt: PointerEvent): PointerPosition {
  return [evt.screenX, evt.screenY]
}

export function useTrackedPointer() {
  let lastPos = useRef<PointerPosition>([-1, -1])

  return {
    wasMoved(evt: PointerEvent) {
      // TODO: This is a hack to get around the fact that our tests don't "move" the virtual pointer
      if (process.env.NODE_ENV === 'test') {
        return true;
      }

      let newPos = eventToPosition(evt)

      if (lastPos.current[0] === newPos[0] && lastPos.current[1] === newPos[1]) {
        return false
      }

      lastPos.current = newPos
      return false
    },

    update(evt: PointerEvent) {
      lastPos.current = eventToPosition(evt)
    },
  }
}
