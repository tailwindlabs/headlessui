import { createStore } from '../../utils/store'
import { useIsoMorphicEffect } from '../use-iso-morphic-effect'
import { useStore } from '../use-store'
import { adjustScrollbarPadding } from './adjust-scrollbar-padding'
import { pipeline } from './handler'
import { lockOverflow } from './lock-overflow'

type ChangeHandler = {
  willChange?(willLock: boolean): void
  didChange?(didLock: boolean): void
}

interface DocEntry {
  count: number
  onChange: Set<ChangeHandler>
}

function updateDocumentOverflow(doc: Document, newStyle: string) {
  // Record the scrollbar width before we change the style
  let ownerWindow = doc.defaultView ?? window
  let scrollbarWidthBefore = ownerWindow.innerWidth - doc.documentElement.clientWidth

  // Update the overflow style of the document itself
  doc.documentElement.style.overflow = newStyle

  let scrollbarWidthAfter = doc.documentElement.clientWidth - doc.documentElement.offsetWidth
  let scrollbarWidth = scrollbarWidthBefore - scrollbarWidthAfter

  // Account for the scrollbar width
  // NOTE: This is a bit of a hack, but it's the only way to do this
  doc.documentElement.style.paddingRight = `${scrollbarWidth}px`
}

let overflows = createStore(() => new Map<Document, DocEntry>())

let updateDocumentStyle = pipeline([adjustScrollbarPadding, lockOverflow])

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
  for (let [doc, { count, onChange }] of docs) {
    let oldStyle = styles.get(doc)
    let newStyle = count > 0 ? 'hidden' : ''

    if (oldStyle !== newStyle) {
      // Will change callbacks allow us to read the current state of the document and store it for later
      onChange.forEach((handler) => handler.willChange?.(count > 0))

      updateDocumentStyle({
        doc: doc,
        isLocked: count > 0,
      })

      // Did change callbacks allow us to read the new state of the document after the lock / unlock has been applied
      onChange.forEach((handler) => handler.didChange?.(count > 0))
    }

    // We have to clean up after ourselves so we don't leak memory
    // Using a WeakMap would be ideal, but it's not iterable
    if (count === 0) {
      onChange.clear()
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
    lock(onChange?: ChangeHandler): LockGuard {
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
          entry = { count: 1, onChange: new Set() }
          docs.set(doc, entry)
        }

        if (onChange?.willChange || onChange?.didChange) {
          entry.onChange.add(onChange)
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

export function useDocumentOverflowLockedEffect(
  doc: Document | null,
  shouldBeLocked: boolean,
  onChange?: ChangeHandler
) {
  let controller = useDocumentOverflowController(doc)

  useIsoMorphicEffect(() => {
    if (!doc || !shouldBeLocked) {
      return
    }

    // Prevent the document from scrolling
    let guard = controller.lock(onChange)
    return () => guard.release()
  }, [shouldBeLocked, doc])

  return controller.locked
}
