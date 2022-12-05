import { ref } from 'vue'

type PointerPosition = [x: number, y: number]

function eventToPosition(evt: PointerEvent): PointerPosition {
  return [evt.screenX, evt.screenY]
}

export function useTrackedPointer() {
  let lastPos = ref<PointerPosition>([-1, -1])

  return {
    wasMoved(evt: PointerEvent) {
      let newPos = eventToPosition(evt)

      if (lastPos.value[0] === newPos[0] && lastPos.value[1] === newPos[1]) {
        return false
      }

      lastPos.value = newPos
      return false
    },

    update(evt: PointerEvent) {
      lastPos.value = eventToPosition(evt)
    },
  }
}
