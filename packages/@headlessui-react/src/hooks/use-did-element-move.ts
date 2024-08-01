import { useRef } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

export function useDidElementMove(enabled: boolean, element: HTMLElement | null) {
  let elementPosition = useRef({ left: 0, top: 0 })

  useIsoMorphicEffect(() => {
    if (!element) return

    let DOMRect = element.getBoundingClientRect()
    if (DOMRect) elementPosition.current = DOMRect
  }, [enabled, element])

  if (element == null) return false
  if (!enabled) return false
  if (element === document.activeElement) return false

  let buttonRect = element.getBoundingClientRect()

  let didElementMove =
    buttonRect.top !== elementPosition.current.top ||
    buttonRect.left !== elementPosition.current.left

  return didElementMove
}
