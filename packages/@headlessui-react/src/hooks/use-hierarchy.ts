import { useId } from 'react'
import { DefaultMap } from '../utils/default-map'
import { createStore } from '../utils/store'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { useStore } from './use-store'

/**
 * Map of stable hierarchy stores based on a given scope.
 */
let hierarchyStores = new DefaultMap(() =>
  createStore(() => [] as string[], {
    ADD(id: string) {
      if (this.includes(id)) return this
      return [...this, id]
    },
    REMOVE(id: string) {
      let idx = this.indexOf(id)
      return idx === -1 ? this : this.toSpliced(idx, 1)
    },
  })
)

/**
 * A hook that returns whether the current node in the hierarchy is at the very
 * top for a given scope. The hierarchy is based on the order of the hooks being
 * called.
 *
 * The hierarchy is also shared across multiple components that use the same
 * scope.
 *
 * This is useful to use in components and hooks that mutate the DOM or share
 * some global state.
 *
 * A use case for this is to use this inside of a `useOutsideClick` hook where
 * only the last rendered component should handle the outside click event.
 * <Dialog>
 *   <Menu>
 *     <MenuButton></MenuButton> // Pressing escape on an open `Menu` should close the `Menu` and not the `Dialog`.
 *     // …
 *   </Menu>
 * </Dialog>
 */
export function useHierarchy(enabled: boolean, scope: string) {
  let hierarchyStore = hierarchyStores.get(scope)
  let id = useId()
  let hierarchy = useStore(hierarchyStore)

  useIsoMorphicEffect(() => {
    if (!enabled) return

    hierarchyStore.dispatch('ADD', id)
    return () => hierarchyStore.dispatch('REMOVE', id)
  }, [hierarchyStore, enabled])

  if (!enabled) return false

  let idx = hierarchy.indexOf(id)
  let hierarchyLength = hierarchy.length

  // Not in the hierarchy yet
  if (idx === -1) {
    // Assume that it will be inserted at the end, then it means that the `idx`
    // will be the length of the current hierarchy.
    idx = hierarchyLength

    // Increase the hierarchy length as-if the node is already in the hierarchy.
    hierarchyLength += 1
  }

  return idx === hierarchyLength - 1
}
