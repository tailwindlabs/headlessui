import * as React from 'react'

type CollectionKey = string | symbol
type CollectionItem = [number, () => void]
type CollectionRef = React.MutableRefObject<ReturnType<typeof createCollection>>
const StableCollectionContext = React.createContext<CollectionRef | null>(null)

function createCollection() {
  return {
    /** @type {Map<string, Map<string, number>>} */
    groups: new Map(),

    get(group: string, key: CollectionKey): CollectionItem {
      let list = this.groups.get(group)
      if (!list) {
        list = new Map()
        this.groups.set(group, list)
      }

      let renders = list.get(key) ?? 0
      list.set(key, renders + 1)

      let index = Array.from(list.keys()).indexOf(key)
      function release() {
        let renders = list.get(key)
        if (renders > 1) {
          list.set(key, renders - 1)
        } else {
          list.delete(key)
        }
      }

      return [index, release]
    },
  }
}

export function StableCollection({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  let collection = React.useRef(createCollection())

  return (
    <StableCollectionContext.Provider value={collection}>
      {children}
    </StableCollectionContext.Provider>
  )
}

export function useStableCollectionIndex(group: string) {
  let collection = React.useContext(StableCollectionContext)
  if (!collection) throw new Error('You must wrap your component in a <StableCollection>')

  let key = useStableCollectionKey()
  let [idx, cleanupIdx] = collection.current.get(group, key)
  React.useEffect(() => cleanupIdx, [])
  return idx
}

/**
 * Return a stable key based on the position of this node.
 *
 * @returns {symbol | string}
 */
function useStableCollectionKey() {
  let owner =
    // @ts-ignore
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current ?? null

  // ssr: dev/prod
  // client: prod
  if (!owner) return Symbol()

  // client: dev
  let indexes = []
  let fiber = owner
  while (fiber) {
    indexes.push(fiber.index)
    fiber = fiber.return
  }

  return '$.' + indexes.join('.')
}
