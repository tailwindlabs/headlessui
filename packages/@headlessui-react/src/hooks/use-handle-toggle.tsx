import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { MouseButton } from '../components/mouse'
import { isDisabledReactIssue7711 } from '../utils/bugs'
import { useEvent } from './use-event'

export function useHandleToggle(cb: (event: ReactPointerEvent) => void) {
  let pointerTypeRef = useRef<'touch' | 'mouse' | 'pen' | null>(null)

  let handlePointerDown = useEvent((event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerTypeRef.current = event.pointerType

    // Skip disabled elements
    if (isDisabledReactIssue7711(event.currentTarget)) return

    // We only want to handle mouse events here. Touch and pen events should be
    // ignored to prevent accidentally blocking scrolling. They will be
    // handled by the click listener instead.
    if (event.pointerType !== 'mouse') return

    // We are only interested in left clicks, but because this is a pointerdown
    // event we have to check this property manually because this is also
    // fired for right clicks.
    if (event.button !== MouseButton.Left) return

    // We use the `pointerdown` event here since it fires before the focus
    // event, allowing us to cancel the event before focus is moved.
    //
    // If this is used in a button where the currently focused element is an
    // `input` then we keep the focus in the `input` instead of moving it to
    // the button. This preserves the cursor position and any text selection
    // in the input.
    event.preventDefault()

    // Finally we are ready to toggle
    cb(event)
  })

  let handleClick = useEvent((event: ReactPointerEvent<HTMLButtonElement>) => {
    // Skip mouse events, they are already handled in the pointerdown handler above.
    if (pointerTypeRef.current === 'mouse') return

    // Skip disabled elements
    if (isDisabledReactIssue7711(event.currentTarget)) return

    // Finally we are ready to toggle
    cb(event)
  })

  return {
    onPointerDown: handlePointerDown,
    onClick: handleClick,
  }
}
