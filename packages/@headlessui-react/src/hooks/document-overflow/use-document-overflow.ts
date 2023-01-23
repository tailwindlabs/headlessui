import { disposables } from '../../utils/disposables'
import { createStore } from '../../utils/store'
import { useIsoMorphicEffect } from '../use-iso-morphic-effect'
import { useStore } from '../use-store'
import { adjustScrollbarPadding } from './adjust-scrollbar-padding'
import { ChangeHandler, pipeline, ScrollLockRequest } from './handler'
import { lockOverflow } from './lock-overflow'

interface DocEntry {
  count: number
  pipes: Set<ChangeHandler>
}

let overflows = createStore(() => new Map<Document, DocEntry>())

// Update the document overflow state when the store changes
// This MUST happen outside of react for this to work properly.
overflows.subscribe(() => {
  let docs = overflows.getSnapshot()

  let styles = new Map<Document, string | undefined>()

  // Read data from all the documents
  for (let [doc] of docs) {
    styles.set(doc, doc.documentElement.style.overflow)
  }

  // Write data to all the documents
  // This is e separate pass for performance reasons
  for (let [doc, { count, pipes }] of docs) {
    let oldStyle = styles.get(doc)
    let newStyle = count > 0 ? 'hidden' : ''

    if (oldStyle !== newStyle) {
      let updateDocument = pipeline([...pipes, adjustScrollbarPadding, lockOverflow])

      updateDocument({
        doc: doc,
        isLocked: count > 0,
      })
    }

    // We have to clean up after ourselves so we don't leak memory
    // Using a WeakMap would be ideal, but it's not iterable
    if (count === 0) {
      pipes.clear()
      docs.delete(doc)
    }
  }
})

interface LockGuard {
  release: () => void
}

export function useDocumentOverflowController(doc: Document | null) {
  let store = useStore(overflows)
  let entry = doc ? store.get(doc) : undefined
  let locked = entry ? entry.count > 0 : false

  return {
    locked,
    lock(pipes?: Array<ChangeHandler>): LockGuard {
      if (!doc) {
        return {
          release: () => {},
        }
      }

      overflows.replace((docs) => {
        let entry = docs.get(doc)

        if (entry) {
          entry.count++
        } else {
          entry = { count: 1, pipes: new Set() }
          docs.set(doc, entry)
        }

        for (let pipe of pipes ?? []) {
          entry.pipes.add(pipe)
        }

        return docs
      })

      return {
        release: () => {
          overflows.replace((docs) => {
            let entry = docs.get(doc)

            if (entry) {
              entry.count--

              // NOTE: Change functions are deleted after being called when the count is 0
            }

            return docs
          })
        },
      }
    },
  }
}

export function useIsDocumentOverflowLocked(doc: Document | null) {
  let controller = useDocumentOverflowController(doc)

  return controller.locked
}

export type ScrollLockRequestWithDisposables = ScrollLockRequest & {
  d: ReturnType<typeof disposables>
}

export function useDocumentOverflowLockedEffect(
  doc: Document | null,
  shouldBeLocked: boolean,
  pipes?: Array<ChangeHandler<ScrollLockRequestWithDisposables>>
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
      ...((pipes ?? []) as ChangeHandler<any>[]),
    ])

    return () => {
      guard.release()
      d.dispose()
    }
  }, [shouldBeLocked, doc])

  return controller.locked
}
