import { useRef } from 'react'
import * as DOM from '../utils/dom'
import { useEvent } from './use-event'
import { useEventListener } from './use-event-listener'

/**
 * The `useRefocusableInput` hook exposes a function to re-focus the input element.
 *
 * This hook will also keep the cursor position into account to make sure the
 * cursor is placed at the correct position as-if we didn't loose focus at all.
 */
export function useRefocusableInput(input: HTMLInputElement | null) {
  // Track the cursor position and the value of the input
  let info = useRef({
    value: '',
    selectionStart: null as number | null,
    selectionEnd: null as number | null,
  })

  useEventListener(input, 'blur', (event) => {
    let target = event.target
    if (!DOM.isHTMLInputElement(target)) return

    info.current = {
      value: target.value,
      selectionStart: target.selectionStart,
      selectionEnd: target.selectionEnd,
    }
  })

  return useEvent(() => {
    // If the input is already focused, we don't need to do anything
    if (document.activeElement === input) return

    if (!DOM.isHTMLInputElement(input)) return
    if (!input.isConnected) return

    // Focus the input
    input.focus({ preventScroll: true })

    // Try to restore the cursor position
    //
    // If the value changed since we recorded the cursor position, then we can't
    // restore the cursor position and we'll just leave it at the end.
    if (input.value !== info.current.value) {
      input.setSelectionRange(input.value.length, input.value.length)
    }

    // If the value is the same, we can restore to the previous cursor position.
    else {
      let { selectionStart, selectionEnd } = info.current
      if (selectionStart !== null && selectionEnd !== null) {
        input.setSelectionRange(selectionStart, selectionEnd)
      }
    }

    // Reset the cursor position
    info.current = { value: '', selectionStart: null, selectionEnd: null }
  })
}
