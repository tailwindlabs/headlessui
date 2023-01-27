import { shallowRef, watch } from 'vue'
import { pipeline } from '../../utils/pipeline'
import { adjustScrollbarPadding } from './adjust-scrollbar-padding'
import { ScrollLockMiddleware } from './request'
import { lockOverflow } from './lock-overflow'

interface DocEntry {
  ctx: Record<string, any>
  count: number
  pipes: Set<ScrollLockMiddleware>
}

export let overflows = shallowRef(new Map<Document, DocEntry>())

// Update the document overflow state when the store changes
// This MUST happen outside of react for this to work properly.
watch(overflows, (docs) => {
  let styles = new Map<Document, string | undefined>()

  // Read data from all the documents
  for (let [doc] of docs) {
    styles.set(doc, doc.documentElement.style.overflow)
  }

  // Write data to all the documents
  // This is e separate pass for performance reasons
  for (let [doc, { count, pipes, ctx }] of docs) {
    let oldStyle = styles.get(doc)
    let needsChange =
      (count !== 0 && oldStyle !== 'hidden') || (count === 0 && oldStyle === 'hidden')

    if (needsChange) {
      let updateDocument = pipeline([...pipes, adjustScrollbarPadding, lockOverflow])

      console.log(`Updating document style: ${count > 0 ? 'hidden' : 'auto'}; count: ${count}`)
      updateDocument({
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
