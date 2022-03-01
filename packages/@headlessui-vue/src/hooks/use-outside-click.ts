import { useWindowEvent } from './use-window-event'
import { Ref } from 'vue'
import { dom } from '../utils/dom'

// Polyfill
function microTask(cb: () => void) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(cb)
  } else {
    Promise.resolve()
      .then(cb)
      .catch((e) =>
        setTimeout(() => {
          throw e
        })
      )
  }
}

export function useOutsideClick(
  containers:
    | HTMLElement
    | Ref<HTMLElement | null>
    | (Ref<HTMLElement | null> | HTMLElement | null)[]
    | Set<HTMLElement>,
  cb: (event: MouseEvent | PointerEvent, target: HTMLElement) => void
) {
  let called = false
  function handle(event: MouseEvent | PointerEvent) {
    if (called) return
    called = true
    microTask(() => {
      called = false
    })

    let target = event.target as HTMLElement
    let _containers = (() => {
      if (Array.isArray(containers)) {
        return containers
      }

      if (containers instanceof Set) {
        return containers
      }

      return [containers]
    })()

    for (let container of _containers) {
      if (container === null) continue
      let domNode = container instanceof HTMLElement ? container : dom(container)
      if (domNode?.contains(target)) {
        return
      }
    }

    cb(event, target)
  }

  useWindowEvent('pointerdown', handle)
  useWindowEvent('mousedown', handle)
}
