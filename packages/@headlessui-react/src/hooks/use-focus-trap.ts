import {
  useRef,
  // Types
  MutableRefObject,
  useEffect,
} from 'react'

import { Keys } from '../components/keyboard'
import { focusElement, focusIn, Focus, FocusResult } from '../utils/focus-management'
import { contains } from '../internal/dom-containers'
import { useWindowEvent } from './use-window-event'

export function useFocusTrap(
  containers: MutableRefObject<Set<HTMLElement>>,
  enabled: boolean = true,
  options: { initialFocus?: MutableRefObject<HTMLElement | null> } = {}
) {
  let restoreElement = useRef<HTMLElement | null>(
    typeof window !== 'undefined' ? (document.activeElement as HTMLElement) : null
  )
  let previousActiveElement = useRef<HTMLElement | null>(null)
  let mounted = useRef(false)

  // Handle initial focus
  useEffect(() => {
    if (!enabled) return
    if (containers.current.size !== 1) return

    mounted.current = true

    let activeElement = document.activeElement as HTMLElement

    if (options.initialFocus?.current) {
      if (options.initialFocus?.current === activeElement) {
        return // Initial focus ref is already the active element
      }
    } else if (contains(containers.current, activeElement)) {
      return // Already focused within Dialog
    }

    restoreElement.current = activeElement

    // Try to focus the initialFocus ref
    if (options.initialFocus?.current) {
      focusElement(options.initialFocus.current)
    } else {
      let couldFocus = false
      for (let container of containers.current) {
        let result = focusIn(container, Focus.First)
        if (result === FocusResult.Success) {
          couldFocus = true
          break
        }
      }

      if (!couldFocus) throw new Error('There are no focusable elements inside the <FocusTrap />')
    }

    previousActiveElement.current = document.activeElement as HTMLElement

    return () => {
      mounted.current = false
      focusElement(restoreElement.current)
      restoreElement.current = null
      previousActiveElement.current = null
    }
  }, [enabled, containers, mounted, options.initialFocus])

  // Handle Tab & Shift+Tab keyboard events
  useWindowEvent('keydown', event => {
    if (!enabled) return
    if (event.key !== Keys.Tab) return
    if (!document.activeElement) return
    if (containers.current.size !== 1) return

    event.preventDefault()

    for (let element of containers.current) {
      let result = focusIn(
        element,
        (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround
      )

      if (result === FocusResult.Success) {
        previousActiveElement.current = document.activeElement as HTMLElement
        break
      }
    }
  })

  // Prevent programmatically escaping
  useWindowEvent(
    'focus',
    event => {
      if (!enabled) return
      if (containers.current.size !== 1) return

      let previous = previousActiveElement.current
      if (!previous) return
      if (!mounted.current) return

      let toElement = event.target as HTMLElement | null

      if (toElement && toElement instanceof HTMLElement) {
        if (!contains(containers.current, toElement)) {
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
    },
    true
  )
}
