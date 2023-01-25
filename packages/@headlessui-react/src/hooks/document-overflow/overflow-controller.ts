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

      overflows.replace((docs) => {
        let entry = docs.get(doc)

        if (!entry) {
          entry = {
            d: disposables(),
            ctx: {},
            count: 1,
            pipes: new Set(),
          }

          docs.set(doc, entry)
        } else {
          entry.count++
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
