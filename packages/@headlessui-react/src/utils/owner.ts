import { MutableRefObject } from 'react'
import { isServer } from './ssr'

export function getOwnerDocument<T extends Element | MutableRefObject<Element | null>>(
  element: T | null | undefined
) {
  if (isServer) return null
  if (element instanceof Node) return element.ownerDocument
  if (element?.hasOwnProperty('current')) {
    if (element.current instanceof Node) return element.current.ownerDocument
  }

  return document
}
