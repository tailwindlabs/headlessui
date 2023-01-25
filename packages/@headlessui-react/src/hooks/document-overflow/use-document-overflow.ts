import { Disposables, disposables } from '../../utils/disposables'
import { useIsoMorphicEffect } from '../use-iso-morphic-effect'
import { ScrollLockMiddleware } from './request'
import { useDocumentOverflowController } from './overflow-controller'

export function useIsDocumentOverflowLocked(doc: Document | null) {
  let controller = useDocumentOverflowController(doc)

  return controller.locked
}

export function useDocumentOverflowLockedEffect(
  doc: Document | null,
  shouldBeLocked: boolean,
  pipes?: (d: Disposables) => ScrollLockMiddleware[]
) {
  let controller = useDocumentOverflowController(doc)

  useIsoMorphicEffect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    let d = disposables()

    // Prevent the document from scrolling
    let guard = controller.lock(pipes ? pipes(d) : [])

    return () => {
      guard.release()
      d.dispose()
    }
  }, [shouldBeLocked, doc])

  return controller.locked
}
