import {
  useRef,
  useCallback,
  useMemo,

  // Types
  KeyboardEvent as ReactKeyboardEvent,
  MutableRefObject,
} from 'react'

import { Keys } from '../components/keyboard'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

// Credit:
//  - https://stackoverflow.com/a/30753870
let focusableSelector = [
  '[contentEditable=true]',
  '[tabindex]',
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
]
  .map(
    process.env.NODE_ENV === 'test'
      ? // TODO: Remove this once JSDOM fixes the issue where an element that is
        // "hidden" can be the document.activeElement, because this is not possible
        // in real browsers.
        selector => `${selector}:not([tabindex='-1']):not([style*='display: none'])`
      : selector => `${selector}:not([tabindex='-1'])`
  )
  .join(',')

function focus(element: HTMLElement | null) {
  if (element) element.focus({ preventScroll: true })
}

export function useFocusTrap<TElement extends HTMLElement>(
  container: MutableRefObject<TElement | null>,
  enabled: boolean = true
) {
  let previousActiveElement = useRef<HTMLElement | null>(null)

  let getFocusableElements = useCallback(() => {
    if (!container.current) return []
    return Array.from(container.current.querySelectorAll<HTMLElement>(focusableSelector))
  }, [container])

  useIsoMorphicEffect(() => {
    if (!enabled) return

    previousActiveElement.current = document.activeElement as HTMLElement
    let focusableElements = getFocusableElements()

    if (focusableElements.length <= 0) {
      throw new Error('There are no focusable elements inside the <FocusTrap />')
    }

    let [element] = focusableElements
    focus(element)

    return () => focus(previousActiveElement.current)
  }, [enabled])

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!enabled) return
      if (event.key !== Keys.Tab) return
      if (!document.activeElement) return

      event.preventDefault()

      let direction = event.shiftKey ? -1 : +1

      let focusableElements = getFocusableElements()
      let total = focusableElements.length

      function focusNext(offset = 0) {
        let currentIdx = focusableElements.indexOf(document.activeElement as HTMLElement)
        let next = focusableElements[(currentIdx + total + direction + offset) % total]

        focus(next)

        // Focusing an element in the DOM that is { display: 'none' } to the user will silently fail.
        if (next !== document.activeElement) focusNext(offset + direction)
      }

      focusNext()
    },
    [getFocusableElements, enabled]
  )

  return useMemo(() => ({ handleKeyDown }), [handleKeyDown])
}
