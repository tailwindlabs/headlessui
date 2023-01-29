import { disposables, Disposables } from '../../utils/disposables'
import { createStore } from '../../utils/store'

interface DocEntry {
  doc: Document
  count: number
  steps: Set<ScrollLockStep>
  d: Disposables
}

export interface Context {
  doc: Document
  d: Disposables
}

export interface ScrollLockStep {
  before?(ctx: Context): void
  after?(ctx: Context): void
}

export let overflows = createStore(() => new Map<Document, DocEntry>(), {
  PUSH(doc: Document, steps: ScrollLockStep[]) {
    let entry = this.get(doc) ?? {
      doc,
      count: 0,
      steps: new Set(steps ?? []),
      d: disposables(),
    }

    entry.count++
    this.set(doc, entry)

    return this
  },

  POP(doc: Document) {
    let entry = this.get(doc)
    if (entry) {
      entry.count--
    }

    return this
  },

  SCROLL_PREVENT({ doc, steps, d }: DocEntry) {
    let ctx = { doc, d }

    // Run all `before` actions together
    steps.forEach(({ before }) => before?.(ctx))

    // Run all `after` actions together
    steps.forEach(({ after }) => after?.(ctx))
  },

  SCROLL_ALLOW({ d }: DocEntry) {
    d.dispose()
  },

  TEARDOWN({ doc, steps }: DocEntry) {
    steps.clear()
    this.delete(doc)
  },
})

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
  for (let entry of docs.values()) {
    let isHidden = styles.get(entry.doc) === 'hidden'
    let isLocked = entry.count !== 0
    let willChange = (isLocked && !isHidden) || (!isLocked && isHidden)

    if (willChange) {
      overflows.dispatch(entry.count > 0 ? 'SCROLL_PREVENT' : 'SCROLL_ALLOW', entry)
    }

    // We have to clean up after ourselves so we don't leak memory
    // Using a WeakMap would be ideal, but it's not iterable
    if (entry.count === 0) {
      overflows.dispatch('TEARDOWN', entry)
    }
  }
})
