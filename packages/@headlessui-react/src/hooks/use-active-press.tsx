import { useRef, useState } from 'react'
import { getOwnerDocument } from '../utils/owner'
import { isIOS } from '../utils/platform'
import { useDocumentOverflowLockedEffect } from './document-overflow/use-document-overflow'
import { useDisposables } from './use-disposables'
import { useEvent } from './use-event'
import { useIsTouchDevice } from './use-is-touch-device'
import { useOwnerDocument } from './use-owner'

// Only the necessary props from a DOMRect
type Rect = { left: number; right: number; top: number; bottom: number }

function pointerRectFromPointerEvent(event: PointerEvent): Rect {
  // Center of the pointer geometry
  let offsetX = event.width / 2
  let offsetY = event.height / 2

  return {
    top: event.clientY - offsetY,
    right: event.clientX + offsetX,
    bottom: event.clientY + offsetY,
    left: event.clientX - offsetX,
  }
}

function areRectsOverlapping(a: Rect | null, b: Rect | null) {
  if (!a || !b) {
    return false
  }

  if (a.right < b.left || a.left > b.right) {
    return false
  }

  if (a.bottom < b.top || a.top > b.bottom) {
    return false
  }

  return true
}

export function useActivePress() {
  let target = useRef<HTMLElement | null>(null)
  let [pressed, setPressed] = useState(false)
  let [shouldScrollLock, setShouldScrollLock] = useState(false)

  let d = useDisposables()

  let reset = useEvent(() => {
    target.current = null
    setPressed(false)
    setShouldScrollLock(false)
    d.dispose()
  })

  let handlePointerDown = useEvent((event: PointerEvent) => {
    d.dispose() // Cancel any scheduled tasks

    if (target.current !== null) return

    // Keep track of the current element
    target.current = event.currentTarget as HTMLElement

    // We are definitely pressing the element now
    setPressed(true)

    // Setup global handlers to catch events on elements that are not the current element
    {
      let owner = getOwnerDocument(event.currentTarget as Element)!

      // `pointerup` on any element means that we are no longer pressing the current element
      d.addEventListener(owner, 'pointerup', reset, false)

      // `pointerleave` isn't called consistently (if at all) on iOS Safari, so we use `pointermove` instead
      // to determine if we are still "pressing". We also compare the pointer position to the target element
      // so that we can tell if the pointer is still over the element or not.
      d.addEventListener(
        owner,
        'pointermove',
        (event: PointerEvent) => {
          if (target.current) {
            let pointerRect = pointerRectFromPointerEvent(event)
            setPressed(areRectsOverlapping(pointerRect, target.current.getBoundingClientRect()))
          }
        },
        false
      )

      // Whenever the browser decides to fire a `pointercancel` event, we should abort
      d.addEventListener(owner, 'pointercancel', reset, false)
    }
  })

  let handleTouchStart = useEvent(() => {
    if (!pressed) return
    if (target.current === null) return

    // Prevent text selection on mobile when holding down the button to prevent the visual
    // selection styles + little popup with copy/lookup/...
    {
      d.style(target.current, 'user-select', 'none')
      if (isIOS()) {
        d.style(target.current, '-webkit-user-select', 'none')
      }
    }
  })

  let handleTouchMove = useEvent(() => {
    if (shouldScrollLock) return

    // Schedule the scroll locking, if we do it immediately and you are just tapping/clicking on the
    // button then we would very briefly prevent scrolling which looks janky. By delaying it slighly
    // we avoid this.
    d.setTimeout(() => setShouldScrollLock(true), 100)
  })

  // Prevent scrolling the page when pressing the button on mobile (touch devices) otherwise moving
  // your finger around on mobile would start scrolling the page.
  let owner = useOwnerDocument(target)
  let isTouchDevice = useIsTouchDevice()
  let scrollLockingEnabled = shouldScrollLock && isTouchDevice
  useDocumentOverflowLockedEffect(owner, scrollLockingEnabled)

  return {
    pressed,
    pressProps: {
      onPointerDown: handlePointerDown,
      onPointerUp: reset,
      onTouchStart: handleTouchStart,
      onTouchMove: isTouchDevice ? handleTouchMove : undefined,
      onClick: reset,
    },
  }
}
