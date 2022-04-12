import { MutableRefObject, useMemo, useRef } from 'react'
import { microTask } from '../utils/micro-task'
import { useLatestValue } from './use-latest-value'
import { useWindowEvent } from './use-window-event'

type Container = MutableRefObject<HTMLElement | null> | HTMLElement | null
type ContainerCollection = Container[] | Set<Container>
type ContainerInput = Container | ContainerCollection

export function useOutsideClick(
  containers: ContainerInput | (() => ContainerInput),
  cb: (event: MouseEvent | PointerEvent, target: HTMLElement) => void
) {
  let called = useRef(false)
  let handler = useLatestValue((event: MouseEvent | PointerEvent) => {
    if (called.current) return
    called.current = true
    microTask(() => {
      called.current = false
    })

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

    let target = event.target as HTMLElement

    // Ignore if the target doesn't exist in the DOM anymore
    if (!target.ownerDocument.documentElement.contains(target)) return

    // Ignore if the target exists in one of the containers
    for (let container of _containers) {
      if (container === null) continue
      let domNode = container instanceof HTMLElement ? container : container.current
      if (domNode?.contains(target)) {
        return
      }
    }

    return cb(event, target)
  })

  useWindowEvent('pointerdown', (...args) => handler.current(...args))
  useWindowEvent('mousedown', (...args) => handler.current(...args))
}
