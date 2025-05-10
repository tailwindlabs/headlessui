import { useCallback, useId } from 'react'
import { stackMachines } from '../machines/stack-machine'
import { useSlice } from '../react-glue'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

/**
 * A hook that returns whether the current node is on the top of the hierarchy,
 * aka "top layer". Note: this does not use the native DOM "top-layer" but
 * conceptually it's the same thing.
 *
 * The hierarchy is also shared across multiple components that use the same
 * scope.
 *
 * This is useful to use in components and hooks that mutate the DOM or share
 * some global state.
 *
 * A use case for this is to use this inside of a `useOutsideClick` hook where
 * only the last rendered component should handle the outside click event.
 *
 * ```ts
 * <Dialog>
 *   <Menu>
 *     <MenuButton></MenuButton> // Pressing escape on an open `Menu` should close the `Menu` and not the `Dialog`.
 *     // …
 *   </Menu>
 * </Dialog>
 * ```
 */
export function useIsTopLayer(enabled: boolean, scope: string | null) {
  let id = useId()
  let stackMachine = stackMachines.get(scope)

  let [isTop, onStack] = useSlice(
    stackMachine,
    useCallback(
      (state) => [
        stackMachine.selectors.isTop(state, id),
        stackMachine.selectors.inStack(state, id),
      ],
      [stackMachine, id]
    )
  )

  // Depending on the enable state, push/pop the current `id` to/from the
  // hierarchy.
  useIsoMorphicEffect(() => {
    if (!enabled) return
    stackMachine.actions.push(id)
    return () => stackMachine.actions.pop(id)
  }, [stackMachine, enabled, id])

  // If the hook is not enabled, we know for sure it is not going to be the
  // top-most item.
  if (!enabled) return false

  // If the hook is enabled, and it's on the stack, we can rely on the `isTop`
  // derived state to determine if it's the top-most item.
  if (onStack) return isTop

  // In this scenario, the hook is enabled, but we are not on the stack yet. In
  // this case we assume that we will be the top-most item, so we return
  // `true`. However, if that's not the case, and once we are on the stack (or
  // other items are pushed) this hook will be re-evaluated and the `isTop`
  // derived state will be used instead.
  return true
}
