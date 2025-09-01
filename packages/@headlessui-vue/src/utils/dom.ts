import type { ComponentPublicInstance, Ref } from 'vue'

type AsElement<T extends HTMLElement | ComponentPublicInstance> =
  | (T extends HTMLElement ? T : HTMLElement)
  | null

export function dom<T extends HTMLElement | ComponentPublicInstance>(
  ref?: Ref<T | null>
): AsElement<T> | null {
  if (ref == null) return null
  if (ref.value == null) return null

  let el = (ref.value as { $el?: T }).$el ?? ref.value

  // In this case we check for `Node` because returning `null` from a
  // component renders a `Comment` which is a `Node` but not `Element`
  // The types don't encode this possibility but we handle it here at runtime
  if (el instanceof Node) {
    return el as AsElement<T>
  }

  return null
}

// Source: https://github.com/tailwindlabs/headlessui/blob/2de2779a1e3a5a02c1684e611daf5a68e8002143/packages/%40headlessui-react/src/utils/dom.ts
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

export function isHTMLIframeElement(element: unknown): element is HTMLIFrameElement {
  return isHTMLElement(element) && element.nodeName === 'IFRAME'
}
