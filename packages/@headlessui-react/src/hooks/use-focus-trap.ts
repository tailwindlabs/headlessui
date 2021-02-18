import {
  useRef,
  // Types
  MutableRefObject,
} from 'react'

import { Keys } from '../components/keyboard'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { focusElement, focusIn, Focus, FocusResult } from '../utils/focus-management'

export function useFocusTrap<TElement extends HTMLElement>(
  container: MutableRefObject<TElement | null>,
  enabled: boolean = true,
  options: { initialFocus?: MutableRefObject<HTMLElement | null> } = {}
) {
  let restoreElement = useRef<HTMLElement | null>(
    typeof window !== 'undefined' ? (document.activeElement as HTMLElement) : null
  )
  let previousActiveElement = useRef<HTMLElement | null>(null)
  let mounted = useRef(false)

  // Handle initial focus
  useIsoMorphicEffect(() => {
    if (!enabled) return
    if (!container.current) return

    mounted.current = true

    let activeElement = document.activeElement as HTMLElement

    if (options.initialFocus?.current) {
      if (options.initialFocus?.current === activeElement) {
        return // Initial focus ref is already the active element
      }
    } else if (container.current.contains(activeElement)) {
      return // Already focused within Dialog
    }

    restoreElement.current = activeElement

    // Try to focus the initialFocus ref
    if (options.initialFocus?.current) {
      focusElement(options.initialFocus.current)
    } else {
      let result = focusIn(container.current, Focus.First)
      if (result === FocusResult.Error) {
        throw new Error('There are no focusable elements inside the <FocusTrap />')
      }
    }

    previousActiveElement.current = document.activeElement as HTMLElement

    return () => {
      mounted.current = false
      focusElement(restoreElement.current)
      restoreElement.current = null
      previousActiveElement.current = null
    }
  }, [enabled, container, mounted, options.initialFocus])

  // Handle Tab & Shift+Tab keyboard events
  useIsoMorphicEffect(() => {
    if (!enabled) return

    function handler(event: KeyboardEvent) {
      if (event.key !== Keys.Tab) return
      if (!document.activeElement) return
      if (!container.current) return

      event.preventDefault()

      let result = focusIn(
        container.current,
        (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround
      )

      if (result === FocusResult.Success) {
        previousActiveElement.current = document.activeElement as HTMLElement
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled])

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
          focusElement(previous)
        } else {
          previousActiveElement.current = toElement
          focusElement(toElement)
        }
      } else {
        focusElement(previousActiveElement.current)
      }
    }

    window.addEventListener('focus', handler, true)
    return () => window.removeEventListener('focus', handler, true)
  }, [enabled, mounted, container])
}
