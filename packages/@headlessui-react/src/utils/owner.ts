import type { MutableRefObject } from 'react'
import { env } from './env'

export function getOwnerDocument<T extends Element | MutableRefObject<Element | null>>(
  element: T | null | undefined
): Document | null {
  if (env.isServer) return null
  if (element == null) return document

  let target: Element | null = 'current' in element ? element.current : element
  return target?.ownerDocument ?? document
}

export function getRootNode<T extends Element | MutableRefObject<Element | null>>(
  element: T | null | undefined
): Document | ShadowRoot | null {
  if (env.isServer) return null
  if (element == null) return document

  let target: Element | null = 'current' in element ? element.current : element

  // @ts-expect-error `getRootNode`'s return type is typed as `Node`, but we want to type it a bit better
  return target?.getRootNode?.() ?? document
}

export function getActiveElement(element: Element | null | undefined): Element | null {
  return getRootNode(element)?.activeElement ?? null
}

export function isActiveElement(element: Element | null | undefined): boolean {
  return getActiveElement(element) === element
}
