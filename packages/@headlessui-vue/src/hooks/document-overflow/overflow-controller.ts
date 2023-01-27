import { ScrollLockMiddleware } from './request'
import { overflows } from './overflow-store'
import { computed, Ref, triggerRef } from 'vue'

export interface LockGuard {
  release: () => void
}

export function useDocumentOverflowController(doc: Ref<Document | null>) {
  let store = overflows.value

  return {
    locked: computed(() => {
      let entry = doc.value ? store.get(doc.value) : undefined

      return entry ? entry.count > 0 : false
    }),

    lock(pipes?: Array<ScrollLockMiddleware>): LockGuard {
      if (!doc.value) {
        return {
          release: () => {},
        }
      }

      let docs = overflows.value
      let entry = docs.get(doc.value) ?? {
        d: undefined,
        ctx: {},
        count: 0,
        pipes: new Set(pipes ?? []),
      }
      entry.count++
      overflows.value.set(doc.value, entry)
      triggerRef(overflows)

      return {
        release: () => {
          if (!doc.value) return
          let entry = overflows.value.get(doc.value)
          if (entry) {
            entry.count--
          }
          triggerRef(overflows)
        },
      }
    },
  }
}
