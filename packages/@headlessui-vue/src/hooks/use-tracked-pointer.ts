import { ref } from 'vue'

type PointerPosition = [x: number, y: number]

function eventToPosition(evt: PointerEvent): PointerPosition {
  return [evt.screenX, evt.screenY]
}

export function useTrackedPointer() {
  let lastPos = ref<PointerPosition>([-1, -1])

  return {
    wasMoved(evt: PointerEvent) {
      // FIXME: Remove this once we use browser testing in all the relevant places.
      // NOTE: This is replaced with a compile-time define during the build process
      // This hack exists to work around a few failing tests caused by our inability to "move" the virtual pointer in JSDOM pointer events.
      if (typeof process !== 'undefined' && process.env.TEST_BYPASS_TRACKED_POINTER) {
        return true
      }

      let newPos = eventToPosition(evt)

      if (lastPos.value[0] === newPos[0] && lastPos.value[1] === newPos[1]) {
        return false
      }

      lastPos.value = newPos
      return true
    },

    update(evt: PointerEvent) {
      lastPos.value = eventToPosition(evt)
    },
  }
}
