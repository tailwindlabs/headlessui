import { Disposables, disposables } from '../../utils/disposables'
import { ScrollLockMiddleware } from './request'
import { useDocumentOverflowController } from './overflow-controller'
import { Ref, watch } from 'vue'

export function useIsDocumentOverflowLocked(doc: Ref<Document | null>) {
  let controller = useDocumentOverflowController(doc)

  return controller.locked
}

export function useDocumentOverflowLockedEffect(
  doc: Ref<Document | null>,
  shouldBeLocked: Ref<boolean>,
  pipes?: (d: Disposables) => ScrollLockMiddleware[]
) {
  let controller = useDocumentOverflowController(doc)

  watch([doc, shouldBeLocked], ([doc, shouldBeLocked], _, onInvalidate) => {
    if (!doc || !shouldBeLocked) {
      return
    }

    let d = disposables()

    // Prevent the document from scrolling
    let guard = controller.lock(pipes ? pipes(d) : [])

    onInvalidate(() => {
      guard.release()
      d.dispose()
    })
  })

  return controller.locked
}
