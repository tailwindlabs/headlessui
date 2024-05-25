import { useId } from 'react'
import { DefaultMap } from '../utils/default-map'
import { createStore } from '../utils/store'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { useStore } from './use-store'

/**
 * Stack positions:
 *
 * 0. A (Root)
 *    |
 * 1. B (Child)
 *    |
 * 2. D (Leaf)
 */
export enum Position {
  /** No position available */
  None = 0,

  /** Top most node of the tree */
  Root = 1 << 0,

  /** Node that has a parent node and child nodes */
  Child = 1 << 1,

  /** Node that has a parent node, but no child nodes */
  Leaf = 1 << 2,

  /** Node that has a parent node */
  HasParent = 1 << 3,

  /** Node that has a child node */
  HasChild = 1 << 4,
}

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
 * A hook that returns the position of the current node in the hierarchy for a
 * given scope. The hierarchy is based on the order of the hooks being called.
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

  if (!enabled) return Position.None

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

  let position = Position.None

  // Root
  if (idx === 0) position |= Position.Root

  // Leaf
  if (idx === hierarchyLength - 1) position |= Position.Leaf

  // Child (in between Root and Leaf)
  if (position === 0) position |= Position.Child

  // Has parent
  if (idx > 0) position |= Position.HasParent

  // Has child
  if (idx < hierarchyLength - 1) position |= Position.HasChild

  // Debug
  if (false) {
    let str: string[] = []
    if (position & Position.Root) str.push('Root')
    if (position & Position.Child) str.push('Child')
    if (position & Position.Leaf) str.push('Leaf')
    if (position & Position.HasParent) str.push('Has Parent')
    if (position & Position.HasChild) str.push('Has Child')
    console.log(id, str.join(', '))
  }

  return position
}
