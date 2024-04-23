import { type MutableRefObject } from 'react'
import { disposables } from '../utils/disposables'
import { getOwnerDocument } from '../utils/owner'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

let originals = new Map<HTMLElement, { 'aria-hidden': string | null; inert: boolean }>()
let counts = new Map<HTMLElement, number>()

function markInert(element: HTMLElement) {
  // Increase count
  let count = counts.get(element) ?? 0
  counts.set(element, count + 1)

  // Already marked as inert, no need to do it again
  if (count !== 0) return () => markNotInert(element)

  // Keep track of previous values, so that we can restore them when we are done
  originals.set(element, {
    'aria-hidden': element.getAttribute('aria-hidden'),
    inert: element.inert,
  })

  // Mark as inert
  element.setAttribute('aria-hidden', 'true')
  element.inert = true

  return () => markNotInert(element)
}

function markNotInert(element: HTMLElement) {
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

export function useInert<TElement extends HTMLElement>(
  node: MutableRefObject<TElement | null> | (() => TElement | null),
  enabled = true
) {
  useIsoMorphicEffect(() => {
    if (!enabled) return

    let element = typeof node === 'function' ? node() : node.current
    if (!element) return

    return markInert(element)
  }, [node, enabled])
}

/**
 * Mark all elements on the page as inert, except for the ones that are allowed.
 *
 * We move up the tree from the allowed elements, and mark all their siblings as
 * inert. If any of the children happens to be a parent of one of the elements,
 * then that child will not be marked as inert.
 *
 * E.g.:
 *
 * ```html
 * <body>                      <!-- Stop at body -->
 *   <header></header>         <!-- Inert, sibling of parent -->
 *   <main>                    <!-- Not inert, parent of allowed element -->
 *     <div>Sidebar</div>      <!-- Inert, sibling of parent -->
 *     <div>                   <!-- Not inert, parent of allowed element -->
 *       <listbox>             <!-- Not inert, parent of allowed element -->
 *         <button></button>   <!-- Not inert, allowed element -->
 *         <options></options> <!-- Not inert, allowed element -->
 *       </listbox>
 *     </div>
 *   </main>
 *   <footer></footer>         <!-- Inert, sibling of parent -->
 * </body>
 * ```
 */
export function useInertOthers(
  resolveAllowedContainers: () => (HTMLElement | null)[],
  enabled = true
) {
  useIsoMorphicEffect(() => {
    if (!enabled) return

    let d = disposables()
    let elements = resolveAllowedContainers()

    for (let element of elements) {
      if (!element) continue

      let ownerDocument = getOwnerDocument(element)
      if (!ownerDocument) continue

      let parent = element.parentElement
      while (parent) {
        // Mark all siblings as inert
        for (let node of parent.childNodes) {
          // If the node contains any of the elements we should not mark it as inert
          // because it would make the elements unreachable.
          if (elements.some((el) => node.contains(el))) continue

          // Mark the node as inert
          d.add(markInert(node as HTMLElement))
        }

        // Stop if we reach the body
        if (parent === ownerDocument.body) break

        // Move up the tree
        parent = parent.parentElement
      }
    }

    return d.dispose
  }, [enabled, resolveAllowedContainers])
}
