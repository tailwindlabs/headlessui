import {
  ref,
  watchEffect,

  // Types
  Ref,
} from 'vue'
import { getOwnerDocument } from '../utils/owner'

// TODO: Figure out a nice way to attachTo document.body in the tests without automagically inserting a div with data-v-app
let CHILDREN_SELECTOR = process.env.NODE_ENV === 'test' ? '[data-v-app=""] > *' : 'body > *'

let interactables = new Set<HTMLElement>()
let originals = new Map<HTMLElement, { 'aria-hidden': string | null; inert: boolean }>()

function inert(element: HTMLElement) {
  element.setAttribute('aria-hidden', 'true')
  // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
  element.inert = true
}

function restore(element: HTMLElement) {
  let original = originals.get(element)
  if (!original) return

  if (original['aria-hidden'] === null) element.removeAttribute('aria-hidden')
  else element.setAttribute('aria-hidden', original['aria-hidden'])
  // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
  element.inert = original.inert
}

export function useInertOthers<TElement extends HTMLElement>(
  container: Ref<TElement | null>,
  enabled: Ref<boolean> = ref(true)
) {
  watchEffect((onInvalidate) => {
    if (!enabled.value) return
    if (!container.value) return

    let element = container.value
    let ownerDocument = getOwnerDocument(element)
    if (!ownerDocument) return

    // Mark myself as an interactable element
    interactables.add(element)

    // Restore elements that now contain an interactable child
    for (let original of originals.keys()) {
      if (original.contains(element)) {
        restore(original)
        originals.delete(original)
      }
    }

    // Collect direct children of the body
    ownerDocument.querySelectorAll(CHILDREN_SELECTOR).forEach((child) => {
      if (!(child instanceof HTMLElement)) return // Skip non-HTMLElements

      // Skip the interactables, and the parents of the interactables
      for (let interactable of interactables) {
        if (child.contains(interactable)) return
      }

      // Keep track of the elements
      if (interactables.size === 1) {
        originals.set(child, {
          'aria-hidden': child.getAttribute('aria-hidden'),
          // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
          inert: child.inert,
        })

        // Mutate the element
        inert(child)
      }
    })

    onInvalidate(() => {
      // Inert is disabled on the current element
      interactables.delete(element)

      // We still have interactable elements, therefore this one and its parent
      // will become inert as well.
      if (interactables.size > 0) {
        // Collect direct children of the body
        ownerDocument!.querySelectorAll(CHILDREN_SELECTOR).forEach((child) => {
          if (!(child instanceof HTMLElement)) return // Skip non-HTMLElements

          // Skip already inert parents
          if (originals.has(child)) return

          // Skip the interactables, and the parents of the interactables
          for (let interactable of interactables) {
            if (child.contains(interactable)) return
          }

          originals.set(child, {
            'aria-hidden': child.getAttribute('aria-hidden'),
            // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
            inert: child.inert,
          })

          // Mutate the element
          inert(child)
        })
      } else {
        for (let element of originals.keys()) {
          // Restore
          restore(element)

          // Cleanup
          originals.delete(element)
        }
      }
    })
  })
}
