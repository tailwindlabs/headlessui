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

type Container = Ref<HTMLElement | null> | HTMLElement | null
type ContainerCollection = Container[] | Set<Container>
type ContainerInput = Container | ContainerCollection

export enum Features {
  None = 1 << 0,
  IgnoreScrollbars = 1 << 1,
}

export function useOutsideClick(
  containers: ContainerInput | (() => ContainerInput),
  cb: (event: MouseEvent | PointerEvent, target: HTMLElement) => void,
  features: Features = Features.None
) {
  let called = false
  function handle(event: MouseEvent | PointerEvent) {
    if (called) return
    called = true
    microTask(() => {
      called = false
    })

    let target = event.target as HTMLElement

    // Ignore if the target doesn't exist in the DOM anymore
    if (!target.ownerDocument.documentElement.contains(target)) return

    let _containers = (function resolve(containers): ContainerCollection {
      if (typeof containers === 'function') {
        return resolve(containers())
      }

      if (Array.isArray(containers)) {
        return containers
      }

      if (containers instanceof Set) {
        return containers
      }

      return [containers]
    })(containers)

    // Ignore scrollbars:
    // This is a bit hacky, and is only necessary because we are checking for `pointerdown` and
    // `mousedown` events. They _are_ being called if you click on a scrollbar. The `click` event
    // is not called when clicking on a scrollbar, but we can't use that otherwise it won't work
    // on mobile devices where only pointer events are being used.
    if ((features & Features.IgnoreScrollbars) === Features.IgnoreScrollbars) {
      // TODO: We can calculate this dynamically~is. On macOS if you have the "Automatically based
      // on mouse or trackpad" setting enabled, then the scrollbar will float on top and therefore
      // you can't calculate its with by checking the clientWidth and scrollWidth of the element.
      // Therefore we are currently hardcoding this to be 20px.
      let scrollbarWidth = 20

      let viewport = target.ownerDocument.documentElement
      if (event.clientX > viewport.clientWidth - scrollbarWidth) return
      if (event.clientX < scrollbarWidth) return
      if (event.clientY > viewport.clientHeight - scrollbarWidth) return
      if (event.clientY < scrollbarWidth) return
    }

    // Ignore if the target exists in one of the containers
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
