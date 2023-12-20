import type { MutableRefObject } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

let originals = new Map<HTMLElement, { 'aria-hidden': string | null; inert: boolean }>()
let counts = new Map<HTMLElement, number>()

export function useInert<TElement extends HTMLElement>(
  node: MutableRefObject<TElement | null> | (() => TElement | null),
  enabled = true
) {
  useIsoMorphicEffect(() => {
    if (!enabled) return

    let element = typeof node === 'function' ? node() : node.current
    if (!element) return

    function cleanup() {
      if (!element) return // Should never happen

      // Decrease counts
      let count = counts.get(element) ?? 1 // Should always exist
      if (count === 1) counts.delete(element) // We are the last one, so we can delete the count
      else counts.set(element, count - 1) // We are not the last one

      // Not the last one, so we don't restore the original values (yet)
      if (count !== 1) return

      let original = originals.get(element)
      if (!original) return // Should never happen

      // Restore original values
      if (original['aria-hidden'] === null) element.removeAttribute('aria-hidden')
      else element.setAttribute('aria-hidden', original['aria-hidden'])
      element.inert = original.inert

      // Remove tracking of original values
      originals.delete(element)
    }

    // Increase count
    let count = counts.get(element) ?? 0
    counts.set(element, count + 1)

    // Already marked as inert, no need to do it again
    if (count !== 0) return cleanup

    // Keep track of previous values, so that we can restore them when we are done
    originals.set(element, {
      'aria-hidden': element.getAttribute('aria-hidden'),
      inert: element.inert,
    })

    // Mark as inert
    element.setAttribute('aria-hidden', 'true')
    element.inert = true

    return cleanup
  }, [node, enabled])
}
