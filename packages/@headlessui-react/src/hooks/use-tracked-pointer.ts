import { useRef } from 'react'

type PointerPosition = [x: number, y: number]

function eventToPosition(evt: PointerEvent): PointerPosition {
  return [evt.screenX, evt.screenY]
}

export function useTrackedPointer() {
  let lastPos = useRef<PointerPosition>([-1, -1])

  return {
    wasMoved(evt: PointerEvent) {
      // FIXME: Remove this once we use browser testing in all the relevant places.
      // NOTE: This is replaced with a compile-time define during the build process
      // This hack exists to work around a few failing tests caused by our inability to "move" the virtual pointer in JSDOM pointer events.
      if (process.env.TEST_BYPASS_TRACKED_POINTER) {
        return true
      }

      let newPos = eventToPosition(evt)

      if (lastPos.current[0] === newPos[0] && lastPos.current[1] === newPos[1]) {
        return false
      }

      lastPos.current = newPos
      return true
    },

    update(evt: PointerEvent) {
      lastPos.current = eventToPosition(evt)
    },
  }
}
