import { useStore } from '../../hooks/use-store'
import { ScrollLockMiddleware } from './request'
import { overflows } from './overflow-store'

export interface LockGuard {
  release: () => void
}

export function useDocumentOverflowController(doc: Document | null) {
  let store = useStore(overflows)
  let entry = doc ? store.get(doc) : undefined
  let locked = entry ? entry.count > 0 : false

  return {
    locked,
    lock(pipes?: Array<ScrollLockMiddleware>): LockGuard {
      if (!doc) {
        return {
          release: () => {},
        }
      }

      overflows.update((docs) => {
        let entry = docs.get(doc) ?? {
          d: undefined,
          ctx: {},
          count: 0,
          pipes: new Set(pipes ?? []),
        }

        entry.count++
        docs.set(doc, entry)
      })

      return {
        release: () => {
          overflows.update((docs) => {
            let entry = docs.get(doc)

            if (entry) {
              entry.count--
            }
          })
        },
      }
    },
  }
}
