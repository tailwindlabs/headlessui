import { useRef, type MutableRefObject } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useDidElementMove(
  element: MutableRefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  let elementPosition = useRef({ left: 0, top: 0 })
  useIsoMorphicEffect(() => {
    let el = element.current
    if (!el) return

    let DOMRect = el.getBoundingClientRect()
    if (DOMRect) elementPosition.current = DOMRect
  }, [enabled])

  if (element.current == null) return false
  if (!enabled) return false
  if (element.current === document.activeElement) return false

  let buttonRect = element.current.getBoundingClientRect()

  let didElementMove =
    buttonRect.top !== elementPosition.current.top ||
    buttonRect.left !== elementPosition.current.left

  return didElementMove
}
