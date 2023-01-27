import { ScrollLockMiddleware } from './request'
import { overflows } from './overflow-store'
import { computed, Ref, triggerRef } from 'vue'

export interface LockGuard {
  release: () => void
}

export function useDocumentOverflowController(docRef: Ref<Document | null>) {
  let store = overflows.value

  return {
    locked: computed(() => {
      let doc = docRef.value
      let entry = doc ? store.get(doc) : undefined

      return entry ? entry.count > 0 : false
    }),

    lock(pipes?: Array<ScrollLockMiddleware>): LockGuard {
      let doc = docRef.value
      if (!doc) {
        return {
          release: () => {},
        }
      }

      let lockId = Math.random().toString(36).substr(2, 9)

      console.log(`Lock Scrolling: ${lockId}`)

      let docs = overflows.value
      let entry = docs.get(doc) ?? {
        d: undefined,
        ctx: {},
        count: 0,
        pipes: new Set(pipes ?? []),
      }
      entry.count++
      overflows.value.set(doc, entry)
      triggerRef(overflows)

      let released = false
      return {
        release: () => {
          if (!doc) return
          if (released) return
          released = true

          let entry = overflows.value.get(doc)
          if (entry) {
            console.log(`Unlock Scrolling: ${lockId} ${entry.count}`)
            entry.count--
            triggerRef(overflows)
          }
        },
      }
    },
  }
}
