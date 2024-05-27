import { useDocumentOverflowLockedEffect } from './document-overflow/use-document-overflow'

export function useScrollLock(
  enabled: boolean,
  ownerDocument: Document | null,
  resolveAllowedContainers: () => HTMLElement[] = () => [document.body]
) {
  useDocumentOverflowLockedEffect(ownerDocument, enabled, (meta) => ({
    containers: [...(meta.containers ?? []), resolveAllowedContainers],
  }))
}
