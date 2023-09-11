import { createPopper, Options } from '@popperjs/core'
import { RefCallback, useCallback, useMemo, useRef } from 'react'

/**
 * Example implementation to use Popper: https://popper.js.org/
 */
export function usePopper(
  options?: Partial<Options>
): [RefCallback<Element | null>, RefCallback<HTMLElement | null>] {
  let reference = useRef<Element>(null)
  let popper = useRef<HTMLElement>(null)

  let cleanupCallback = useRef(() => {})

  let instantiatePopper = useCallback(() => {
    if (!reference.current) return
    if (!popper.current) return

    if (cleanupCallback.current) cleanupCallback.current()

    cleanupCallback.current = createPopper(reference.current, popper.current, options).destroy
  }, [reference, popper, cleanupCallback, options])

  return useMemo(
    () => [
      (referenceDomNode) => {
        reference.current = referenceDomNode
        instantiatePopper()
      },
      (popperDomNode) => {
        popper.current = popperDomNode
        instantiatePopper()
      },
    ],
    [reference, popper, instantiatePopper]
  )
}
