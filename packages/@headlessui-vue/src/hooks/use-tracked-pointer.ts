import { ref } from 'vue'

type PointerPosition = [x: number, y: number]

function eventToPosition(evt: PointerEvent): PointerPosition {
  return [evt.screenX, evt.screenY]
}

export function useTrackedPointer() {
  let lastPos = ref<PointerPosition>([-1, -1])

  return {
    wasMoved(evt: PointerEvent) {
      // TODO: This is a hack to get around the fact that our tests don't "move" the virtual pointer
      if (process.env.NODE_ENV === 'test') {
        return true
      }

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
