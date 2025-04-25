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

// https://html.spec.whatwg.org/#interactive-content-2
// - a (if the href attribute is present)
// - audio (if the controls attribute is present)
// - button
// - details
// - embed
// - iframe
// - img (if the usemap attribute is present)
// - input (if the type attribute is not in the Hidden state)
// - label
// - select
// - textarea
// - video (if the controls attribute is present)
export function isInteractiveElement(element: unknown): element is Element {
  if (!isHTMLElement(element)) return false

  return element.matches(
    'a[href],audio[controls],button,details,embed,iframe,img[usemap],input:not([type="hidden"]),label,select,textarea,video[controls]'
  )
}
