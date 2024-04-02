import { useEffect, type MutableRefObject } from 'react'
import { disposables } from '../utils/disposables'
import { useLatestValue } from './use-latest-value'

export function useOnDisappear(
  ref: MutableRefObject<HTMLElement | null> | HTMLElement | null,
  cb: () => void,
  enabled = true
) {
  let listenerRef = useLatestValue((element: HTMLElement) => {
    let rect = element.getBoundingClientRect()
    if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
      cb()
    }
  })

  useEffect(() => {
    if (!enabled) return

    let element = ref === null ? null : ref instanceof HTMLElement ? ref : ref.current
    if (!element) return

    let d = disposables()

    // Try using ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      let observer = new ResizeObserver(() => listenerRef.current(element))
      observer.observe(element)
      d.add(() => observer.disconnect())
    }

    // Try using IntersectionObserver
    if (typeof IntersectionObserver !== 'undefined') {
      let observer = new IntersectionObserver(() => listenerRef.current(element))
      observer.observe(element)
      d.add(() => observer.disconnect())
    }

    return () => d.dispose()
  }, [ref, listenerRef, enabled])
}
