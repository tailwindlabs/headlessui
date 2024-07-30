import { useRef, type MutableRefObject } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useDidElementMove(
  enabled: boolean,
  ref: MutableRefObject<HTMLElement | null> | HTMLElement | null
) {
  let elementPosition = useRef({ left: 0, top: 0 })

  useIsoMorphicEffect(() => {
    let el = ref === null ? null : ref instanceof HTMLElement ? ref : ref.current
    if (!el) return

    let DOMRect = el.getBoundingClientRect()
    if (DOMRect) elementPosition.current = DOMRect
  }, [enabled])

  let element =
    typeof window === 'undefined'
      ? null
      : ref === null
        ? null
        : ref instanceof HTMLElement
          ? ref
          : ref.current
  if (element == null) return false
  if (!enabled) return false
  if (element === document.activeElement) return false

  let buttonRect = element.getBoundingClientRect()

  let didElementMove =
    buttonRect.top !== elementPosition.current.top ||
    buttonRect.left !== elementPosition.current.left

  return didElementMove
}
