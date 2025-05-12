import { useDocumentOverflowLockedEffect } from './document-overflow/use-document-overflow'
import { useIsTopLayer } from './use-is-top-layer'

export function useScrollLock(
  enabled: boolean,
  ownerDocument: Document | null,
  resolveAllowedContainers: () => Element[] = () => [document.body]
) {
  let isTopLayer = useIsTopLayer(enabled, 'scroll-lock')

  useDocumentOverflowLockedEffect(isTopLayer, ownerDocument, (meta) => ({
    containers: [...(meta.containers ?? []), resolveAllowedContainers],
  }))
}
