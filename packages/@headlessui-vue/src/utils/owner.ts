import { Ref } from 'vue'
import { dom } from './dom'
import { env } from './env'

export function getOwnerDocument<T extends Element | Ref<Element | null>>(
  element: T | null | undefined
) {
  if (env.isServer) return null
  if (element instanceof Node) return element.ownerDocument
  if (element?.hasOwnProperty('value')) {
    let domElement = dom(element)
    if (domElement) return domElement.ownerDocument
  }

  return document
}
