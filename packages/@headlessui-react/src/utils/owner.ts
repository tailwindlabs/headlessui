import { MutableRefObject } from 'react'

export function getOwnerDocument<T extends Element | MutableRefObject<Element | null>>(
  element: T | null | undefined
) {
  if (typeof window === 'undefined') return null
  if (element instanceof Node) return element.ownerDocument
  if (element?.hasOwnProperty('current')) {
    if (element.current instanceof Node) return element.current.ownerDocument
  }

  return document
}
