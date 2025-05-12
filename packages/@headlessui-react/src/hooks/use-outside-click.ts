import { useCallback, useRef } from 'react'
import * as DOM from '../utils/dom'
import { FocusableMode, isFocusableElement } from '../utils/focus-management'
import { isMobile } from '../utils/platform'
import { useDocumentEvent } from './use-document-event'
import { useLatestValue } from './use-latest-value'
import { useWindowEvent } from './use-window-event'

type Container = Element | null
type ContainerCollection = Container[] | Set<Container>
type ContainerInput = Container | ContainerCollection

// If the user moves their finger by ${MOVE_THRESHOLD_PX} pixels or more, we'll
// assume that they are scrolling and not clicking. This will prevent the click
// from being triggered when the user is scrolling.
//
// This also allows you to "cancel" the click by moving your finger more than
// the threshold in pixels in any direction.
const MOVE_THRESHOLD_PX = 30

export function useOutsideClick(
  enabled: boolean,
  containers: ContainerInput | (() => ContainerInput),
  cb: (
    event: MouseEvent | PointerEvent | FocusEvent | TouchEvent,
    target: HTMLOrSVGElement & Element
  ) => void
) {
  let cbRef = useLatestValue(cb)

  let handleOutsideClick = useCallback(
    function handleOutsideClick<E extends MouseEvent | PointerEvent | FocusEvent | TouchEvent>(
      event: E,
      resolveTarget: (event: E) => (HTMLOrSVGElement & Element) | null
    ) {
      // Check whether the event got prevented already. This can happen if you
      // use the useOutsideClick hook in both a Dialog and a Menu and the inner
      // Menu "cancels" the default behavior so that only the Menu closes and
      // not the Dialog (yet)
      if (event.defaultPrevented) return

      // Resolve the new target
      let target = resolveTarget(event)
      if (target === null) return

      // Ignore if the target doesn't exist in the DOM anymore
      if (!target.getRootNode().contains(target)) return

      // Ignore if the target was removed from the DOM by the time the handler
      // was called
      if (!target.isConnected) return

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

      // Ignore if the target exists in one of the containers
      for (let container of _containers) {
        if (container === null) continue
        if (container.contains(target)) {
          return
        }

        // If the click crossed a shadow boundary, we need to check if the
        // container is inside the tree by using `composedPath` to "pierce" the
        // shadow boundary
        if (event.composed && event.composedPath().includes(container as EventTarget)) {
          return
        }
      }

      // This allows us to check whether the event was defaultPrevented when you
      // are nesting this inside a `<Dialog />` for example.
      if (
        // This check allows us to know whether or not we clicked on a
        // "focusable" element like a button or an input. This is a backwards
        // compatibility check so that you can open a <Menu /> and click on
        // another <Menu /> which should close Menu A and open Menu B. We might
        // revisit that so that you will require 2 clicks instead.
        !isFocusableElement(target, FocusableMode.Loose) &&
        // This could be improved, but the `Combobox.Button` adds tabIndex={-1}
        // to make it unfocusable via the keyboard so that tabbing to the next
        // item from the input doesn't first go to the button.
        target.tabIndex !== -1
      ) {
        event.preventDefault()
      }

      return cbRef.current(event, target)
    },
    [cbRef, containers]
  )

  let initialClickTarget = useRef<HTMLElement | null>(null)

  useDocumentEvent(
    enabled,
    'pointerdown',
    (event) => {
      if (isMobile()) return

      initialClickTarget.current = (event.composedPath?.()?.[0] || event.target) as HTMLElement
    },
    true
  )

  useDocumentEvent(
    enabled,
    'pointerup',
    (event) => {
      if (isMobile()) return
      if (!initialClickTarget.current) return

      let target = initialClickTarget.current
      initialClickTarget.current = null

      return handleOutsideClick(event, () => target)
    },

    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  )

  let startPosition = useRef({ x: 0, y: 0 })
  useDocumentEvent(
    enabled,
    'touchstart',
    (event) => {
      startPosition.current.x = event.touches[0].clientX
      startPosition.current.y = event.touches[0].clientY
    },
    true
  )

  useDocumentEvent(
    enabled,
    'touchend',
    (event) => {
      // If the user moves their finger by ${MOVE_THRESHOLD_PX} pixels or more,
      // we'll assume that they are scrolling and not clicking.
      let endPosition = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
      if (
        Math.abs(endPosition.x - startPosition.current.x) >= MOVE_THRESHOLD_PX ||
        Math.abs(endPosition.y - startPosition.current.y) >= MOVE_THRESHOLD_PX
      ) {
        return
      }

      return handleOutsideClick(event, () => {
        if (DOM.isHTMLorSVGElement(event.target)) {
          return event.target
        }
        return null
      })
    },

    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  )

  // When content inside an iframe is clicked `window` will receive a blur event
  // This can happen when an iframe _inside_ a window is clicked
  // Or, if headless UI is *in* the iframe, when a content in a window containing that iframe is clicked

  // In this case we care only about the first case so we check to see if the active element is the iframe
  // If so this was because of a click, focus, or other interaction with the child iframe
  // and we can consider it an "outside click"
  useWindowEvent(
    enabled,
    'blur',
    (event) => {
      return handleOutsideClick(event, () => {
        return DOM.isHTMLIframeElement(window.document.activeElement)
          ? window.document.activeElement
          : null
      })
    },
    true
  )
}
