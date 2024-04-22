import { useDocumentOverflowLockedEffect } from './document-overflow/use-document-overflow'

export function useScrollLock(
  ownerDocument: Document | null,
  enabled: boolean,
  resolveAllowedContainers: () => HTMLElement[] = () => [document.body]
) {
  useDocumentOverflowLockedEffect(ownerDocument, enabled, (meta) => ({
    containers: [...(meta.containers ?? []), resolveAllowedContainers],
  }))
}
