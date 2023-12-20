import { useStore } from '../../hooks/use-store'
import { useIsoMorphicEffect } from '../use-iso-morphic-effect'
import { overflows } from './overflow-store'

export function useDocumentOverflowLockedEffect(
  doc: Document | null,
  shouldBeLocked: boolean,
  meta: (meta: Record<string, any>) => Record<string, any> = () => ({ containers: [] })
) {
  let store = useStore(overflows)
  let entry = doc ? store.get(doc) : undefined
  let locked = entry ? entry.count > 0 : false

  useIsoMorphicEffect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    // Prevent the document from scrolling
    overflows.dispatch('PUSH', doc, meta)

    // Allow document to scroll
    return () => overflows.dispatch('POP', doc, meta)
  }, [shouldBeLocked, doc])

  return locked
}
