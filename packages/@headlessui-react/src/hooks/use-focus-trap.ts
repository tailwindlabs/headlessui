import {
  useRef,
  useCallback,

  // Types
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
  let restoreElement = useRef<HTMLElement | null>(
    typeof window !== 'undefined' ? (document.activeElement as HTMLElement) : null
  )
  let previousActiveElement = useRef<HTMLElement | null>(null)
  let mounted = useRef(false)

  let getFocusableElements = useCallback(() => {
    if (!container.current) return []
    return Array.from(container.current.querySelectorAll<HTMLElement>(focusableSelector))
  }, [container])

  // Handle initial focus
  useIsoMorphicEffect(() => {
    if (!enabled) return
    mounted.current = true

    let activeElement = document.activeElement as HTMLElement

    if (container.current?.contains(activeElement)) return // Already focused within Dialog

    restoreElement.current = activeElement
    let focusableElements = getFocusableElements()

    if (focusableElements.length <= 0) {
      throw new Error('There are no focusable elements inside the <FocusTrap />')
    }

    function tryFocus(element: HTMLElement | undefined) {
      if (element === undefined) return

      focus(element)

      if (document.activeElement !== element) {
        tryFocus(focusableElements[focusableElements.indexOf(element) + 1])
      } else {
        previousActiveElement.current = element
      }
    }

    tryFocus(focusableElements[0])

    return () => {
      mounted.current = false
      focus(restoreElement.current)
      restoreElement.current = null
      previousActiveElement.current = null
    }
  }, [enabled, mounted])

  // Handle Tab & Shift+Tab keyboard events
  useIsoMorphicEffect(() => {
    if (!enabled) return

    function handler(event: KeyboardEvent) {
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
        else previousActiveElement.current = next
      }

      focusNext()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, getFocusableElements])

  // Prevent programmatically escaping
  useIsoMorphicEffect(() => {
    if (!enabled) return
    if (!container.current) return

    let element = container.current

    function handler(event: FocusEvent) {
      let previous = previousActiveElement.current
      if (!previous) return
      if (!mounted.current) return

      let toElement = event.target as HTMLElement | null

      if (toElement && toElement instanceof HTMLElement) {
        if (!element.contains(toElement)) {
          event.preventDefault()
          event.stopPropagation()
          focus(previous)
        } else {
          previousActiveElement.current = toElement
          focus(toElement)
        }
      } else {
        focus(previousActiveElement.current)
      }
    }

    window.addEventListener('focus', handler, true)
    return () => window.removeEventListener('focus', handler, true)
  }, [enabled, mounted, container])
}
