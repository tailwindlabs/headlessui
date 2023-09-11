import { watchEffect, type ComputedRef } from 'vue'
import { getOwnerDocument } from '../utils/owner'

type AcceptNode = (
  node: HTMLElement
) =>
  | typeof NodeFilter.FILTER_ACCEPT
  | typeof NodeFilter.FILTER_SKIP
  | typeof NodeFilter.FILTER_REJECT

export function useTreeWalker({
  container,
  accept,
  walk,
  enabled,
}: {
  container: ComputedRef<HTMLElement | null>
  accept: AcceptNode
  walk(node: HTMLElement): void
  enabled?: ComputedRef<boolean>
}) {
  watchEffect(() => {
    let root = container.value
    if (!root) return
    if (enabled !== undefined && !enabled.value) return
    let ownerDocument = getOwnerDocument(container)
    if (!ownerDocument) return

    let acceptNode = Object.assign((node: HTMLElement) => accept(node), { acceptNode: accept })
    let walker = ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      acceptNode,
      // @ts-expect-error This `false` is a simple small fix for older browsers
      false
    )

    while (walker.nextNode()) walk(walker.currentNode as HTMLElement)
  })
}
