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
      // FIXME: This is a side-effect during render. `release` is only called in
      // an effect cleanup so we may never release if we had to render multiple
      // times before commit e.g. when a sibling suspends.
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

  let key = React.useId()
  let [idx, cleanupIdx] = collection.current.get(group, key)
  React.useEffect(() => cleanupIdx, [])
  return idx
}
