import { disposables } from 'utils/disposables'
import { useStore } from '../../hooks/use-store'
import { Middleware } from './handler'
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
    lock(pipes?: Array<Middleware>): LockGuard {
      if (!doc) {
        return {
          release: () => {},
        }
      }

      overflows.update((docs) => {
        let entry = docs.get(doc)

        if (!entry) {
          entry = {
            d: disposables(),
            ctx: {},
            count: 1,
            pipes: new Set(pipes ?? []),
          }

          docs.set(doc, entry)
        } else {
          entry.count++
        }
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
