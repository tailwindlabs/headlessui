// This file contains a bunch of utilities to verify that an element is of a
// specific type.
//
// Normally you can use `element instanceof HTMLElement`, but if you are in
// different JS Context (e.g.: inside an iframe) then the `HTMLElement` will be
// a different class and the check will fail.
//
// Instead, we will check for certain properties to determine if the element
// is of a specific type.

export function isNode(element: unknown): element is Node {
  if (typeof element !== 'object') return false
  if (element === null) return false
  return 'nodeType' in element
}

export function isElement(element: unknown): element is Element {
  return isNode(element) && 'tagName' in element
}

export function isHTMLElement(element: unknown): element is HTMLElement {
  return isElement(element) && 'accessKey' in element
}

// HTMLOrSVGElement doesn't inherit from HTMLElement or from Element. But this
// is the type that contains the `tabIndex` property.
//
// Once we know that this is an `HTMLOrSVGElement` we also know that it is an
// `Element` (that contains more information)
export function isHTMLorSVGElement(element: unknown): element is HTMLOrSVGElement & Element {
  return isElement(element) && 'tabIndex' in element
}

export function hasInlineStyle(element: unknown): element is ElementCSSInlineStyle {
  return isElement(element) && 'style' in element
}

export function isHTMLIframeElement(element: unknown): element is HTMLIFrameElement {
  return isHTMLElement(element) && element.nodeName === 'IFRAME'
}

export function isHTMLInputElement(element: unknown): element is HTMLInputElement {
  return isHTMLElement(element) && element.nodeName === 'INPUT'
}

export function isHTMLTextAreaElement(element: unknown): element is HTMLTextAreaElement {
  return isHTMLElement(element) && element.nodeName === 'TEXTAREA'
}

export function isHTMLLabelElement(element: unknown): element is HTMLLabelElement {
  return isHTMLElement(element) && element.nodeName === 'LABEL'
}

export function isHTMLFieldSetElement(element: unknown): element is HTMLFieldSetElement {
  return isHTMLElement(element) && element.nodeName === 'FIELDSET'
}

export function isHTMLLegendElement(element: unknown): element is HTMLLegendElement {
  return isHTMLElement(element) && element.nodeName === 'LEGEND'
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
  if (!isElement(element)) return false

  return element.matches(
    'a[href],audio[controls],button,details,embed,iframe,img[usemap],input:not([type="hidden"]),label,select,textarea,video[controls]'
  )
}
