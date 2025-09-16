import { env } from './env'

export function getOwnerDocument<T extends Element>(
  element: T | null | undefined
): Document | null {
  if (env.isServer) return null
  if (element == null) return document

  return element?.ownerDocument ?? document
}

export function getRootNode<T extends Element>(
  element: T | null | undefined
): Document | ShadowRoot | null {
  if (env.isServer) return null
  if (element == null) return document

  // @ts-expect-error `getRootNode`'s return type is typed as `Node`, but we want to type it a bit better
  return element?.getRootNode?.() ?? document
}

export function getActiveElement(element: Element | null | undefined): Element | null {
  return getRootNode(element)?.activeElement ?? null
}

export function isActiveElement(element: Element | null | undefined): boolean {
  return getActiveElement(element) === element
}
