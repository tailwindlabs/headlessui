import React from 'react'
import { createPopper, Options } from '@popperjs/core'

/**
 * Example implementation to use Popper: https://popper.js.org/
 */
export function usePopper(
  options?: Partial<Options>
): [React.RefCallback<Element | null>, React.RefCallback<HTMLElement | null>] {
  const reference = React.useRef<Element>(null)
  const popper = React.useRef<HTMLElement>(null)

  const cleanupCallback = React.useRef(() => {})

  const instantiatePopper = React.useCallback(() => {
    if (!reference.current) return
    if (!popper.current) return

    if (cleanupCallback.current) cleanupCallback.current()

    cleanupCallback.current = createPopper(reference.current, popper.current, options).destroy
  }, [reference, popper, cleanupCallback, options])

  return React.useMemo(
    () => [
      referenceDomNode => {
        reference.current = referenceDomNode
        instantiatePopper()
      },
      popperDomNode => {
        popper.current = popperDomNode
        instantiatePopper()
      },
    ],
    [reference, popper, instantiatePopper]
  )
}
