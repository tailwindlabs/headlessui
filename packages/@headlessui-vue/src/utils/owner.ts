import type { Ref } from 'vue'
import { dom } from './dom'
import { env } from './env'

export function getOwnerDocument<T extends Element | Ref<Element | null>>(
  element: T | null | undefined
): Document | null {
  if (env.isServer) return null
  if (!element) return document
  if ('ownerDocument' in element) return element.ownerDocument
  if ('value' in element) return dom(element as any)?.ownerDocument ?? document

  return null
}
