import { disposables } from '../../utils/disposables'
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
  pipes?: Array<ScrollLockMiddleware>
) {
  let controller = useDocumentOverflowController(doc)

  useIsoMorphicEffect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    let d = disposables()

    // Prevent the document from scrolling
    let guard = controller.lock([
      // Make sure the disposables are passed through the pipeline
      (req, next) => next(Object.assign({}, req, { d })),

      // Run component-defined pipes when the document is locked or unlocked
      // Also… tell typescript we know what we're doing lol
      ...(pipes ?? []),
    ])

    return () => {
      guard.release()
      d.dispose()
    }
  }, [shouldBeLocked, doc])

  return controller.locked
}
