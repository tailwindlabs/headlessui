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
export declare function useIsTopLayer(enabled: boolean, scope: string): boolean;
