import { useDocumentOverflowLockedEffect } from './document-overflow/use-document-overflow'
import { useHierarchy } from './use-hierarchy'

export function useScrollLock(
  enabled: boolean,
  ownerDocument: Document | null,
  resolveAllowedContainers: () => HTMLElement[] = () => [document.body]
) {
  let isTopLayer = useHierarchy(enabled, 'scroll-lock')

  useDocumentOverflowLockedEffect(ownerDocument, isTopLayer, (meta) => ({
    containers: [...(meta.containers ?? []), resolveAllowedContainers],
  }))
}
