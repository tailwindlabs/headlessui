import { Disposables, disposables } from '../../utils/disposables'
import { useIsoMorphicEffect } from '../use-iso-morphic-effect'
import { useStore } from '../../hooks/use-store'
import { overflows, ScrollLockStep } from './overflow-store'

export function useDocumentOverflowLockedEffect(
  doc: Document | null,
  shouldBeLocked: boolean,
  steps: (d: Disposables) => ScrollLockStep[]
) {
  let store = useStore(overflows)
  let entry = doc ? store.get(doc) : undefined
  let locked = entry ? entry.count > 0 : false

  useIsoMorphicEffect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    // Prevent the document from scrolling
    let d = disposables()
    overflows.dispatch('PUSH', doc, steps(d))

    return () => {
      // Allow document to scroll
      overflows.dispatch('POP', doc)
      d.dispose()
    }
  }, [shouldBeLocked, doc])

  return locked
}
