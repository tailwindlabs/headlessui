import { MutableRefObject } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

function* getAllSiblings(element: HTMLElement) {
  if (!element.parentElement) return
  let node = element.parentElement.firstChild

  while (node) {
    if (node !== element && node instanceof HTMLElement) yield node
    node = node.nextSibling
  }
}

export function useInertOthers<TElement extends HTMLElement>(
  container: MutableRefObject<TElement | null>,
  enabled: boolean = true
) {
  useIsoMorphicEffect(() => {
    if (!enabled) return
    if (!container.current) return

    let element = container.current
    let elements = new Map<HTMLElement, { 'aria-hidden': string | null; inert: boolean }>()

    // Collect my direct siblings
    for (let sibling of getAllSiblings(element)) {
      elements.set(sibling, {
        'aria-hidden': sibling.getAttribute('aria-hidden'),
        // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
        inert: sibling.inert,
      })
    }

    // Collect direct children of the body
    document.querySelectorAll('body > *').forEach(directChild => {
      if (directChild === element) return // Skip myself
      if (!(directChild instanceof HTMLElement)) return // Skip non-HTMLElements
      if (directChild.contains(element)) return // Skip my parent

      elements.set(directChild, {
        'aria-hidden': directChild.getAttribute('aria-hidden'),
        // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
        inert: directChild.inert,
      })
    })

    // MUTATE ALL THE ELEMENTS
    for (let element of elements.keys()) {
      element.setAttribute('aria-hidden', 'true')
      // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
      element.inert = true
    }

    return () => {
      for (let [element, bag] of elements.entries()) {
        if (element === null) continue
        else if (bag['aria-hidden'] === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', bag['aria-hidden'])
        // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
        element.inert = bag.inert
      }

      elements.clear()
    }
  }, [enabled])
}
