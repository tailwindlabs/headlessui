// This file contains a bunch of utilities to verify that an element is of a
// specific type.
//
// Normally you can use `elemenent instanceof HTMLElement`, but if you are in
// different JS Context (e.g.: inside an iframe) then the `HTMLElement` will be
// a different class and the check will fail.
//
// Instead, we will check for certain properties to determine if the element
// is of a specific type.

export function isNode(element: unknown): element is Node {
  if (typeof element !== 'object') return false
  if (element === null) return false
  return 'nodeType' in element && 'nodeName' in element
}

export function isHTMLElement(element: unknown): element is HTMLElement {
  if (typeof element !== 'object') return false
  if (element === null) return false
  return 'nodeName' in element
}
