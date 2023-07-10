import React, { useState, FocusEvent as ReactFocusEvent } from 'react'

import { useIsMounted } from '../hooks/use-is-mounted'
import { Hidden, Features } from './hidden'

interface FocusSentinelProps {
  onFocus(): boolean
}

export function FocusSentinel({ onFocus }: FocusSentinelProps) {
  let [enabled, setEnabled] = useState(true)
  let mounted = useIsMounted()

  if (!enabled) return null

  return (
    <Hidden
      as="button"
      type="button"
      features={Features.Focusable}
      onFocus={(event: ReactFocusEvent) => {
        event.preventDefault()
        let frame: ReturnType<typeof requestAnimationFrame>

        let tries = 50
        function forwardFocus() {
          // Prevent infinite loops
          if (tries-- <= 0) {
            if (frame) cancelAnimationFrame(frame)
            return
          }

          // Try to move focus to the correct element. This depends on the implementation
          // of `onFocus` of course since it would be different for each place we use it in.
          if (onFocus()) {
            cancelAnimationFrame(frame)
            if (!mounted.current) return

            setEnabled(false)
            return
          }

          // Retry
          frame = requestAnimationFrame(forwardFocus)
        }

        frame = requestAnimationFrame(forwardFocus)
      }}
    />
  )
}
