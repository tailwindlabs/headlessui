import { MutableRefObject, useEffect, useRef } from 'react'
import { useWindowEvent } from './use-window-event'

type Container = MutableRefObject<HTMLElement | null> | HTMLElement | null
type ContainerCollection = Container[] | Set<Container>
type ContainerInput = Container | ContainerCollection

export function useOutsideClick(
  containers: ContainerInput | (() => ContainerInput),
  cb: (event: MouseEvent | PointerEvent, target: HTMLElement) => void,
  enabled: boolean = true
) {
  // TODO: remove this once the React bug has been fixed: https://github.com/facebook/react/issues/24657
  let enabledRef = useRef(false)
  useEffect(
    process.env.NODE_ENV === 'test'
      ? () => {
          enabledRef.current = enabled
        }
      : () => {
          requestAnimationFrame(() => {
            enabledRef.current = enabled
          })
        },
    [enabled]
  )

  useWindowEvent(
    'click',
    (event) => {
      if (!enabledRef.current) return

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
    },
    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  )
}
