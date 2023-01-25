import { pipeline } from '../../utils/pipeline'
import { Disposables } from '../../utils/disposables'
import { createStore } from '../../utils/store'
import { adjustScrollbarPadding } from './adjust-scrollbar-padding'
import { ScrollLockMiddleware } from './request'
import { lockOverflow } from './lock-overflow'

interface DocEntry {
  d: Disposables
  ctx: Record<string, any>
  count: number
  pipes: Set<ScrollLockMiddleware>
}

export let overflows = createStore(() => new Map<Document, DocEntry>())

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
  for (let [doc, { d, count, pipes, ctx }] of docs) {
    let oldStyle = styles.get(doc)
    let newStyle = count > 0 ? 'hidden' : ''

    if (oldStyle !== newStyle) {
      let updateDocument = pipeline([...pipes, adjustScrollbarPadding, lockOverflow])

      updateDocument({
        d,
        ctx,
        doc,
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
