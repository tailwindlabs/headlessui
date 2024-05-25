import { useDocumentOverflowLockedEffect } from './document-overflow/use-document-overflow'
import { Position, useHierarchy } from './use-hierarchy'

export function useScrollLock(
  enabled: boolean,
  ownerDocument: Document | null,
  resolveAllowedContainers: () => HTMLElement[] = () => [document.body]
) {
  let position = useHierarchy(enabled, 'scroll-lock')

  useDocumentOverflowLockedEffect(
    ownerDocument,
    (position & Position.Leaf) === Position.Leaf,
    (meta) => ({
      containers: [...(meta.containers ?? []), resolveAllowedContainers],
    })
  )
}
