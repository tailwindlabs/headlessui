import React, { type MutableRefObject } from 'react';
export declare function useRootContainers({ defaultContainers, portals, mainTreeNode, }?: {
    defaultContainers?: (HTMLElement | null | MutableRefObject<HTMLElement | null>)[];
    portals?: MutableRefObject<HTMLElement[]>;
    mainTreeNode?: HTMLElement | null;
}): {
    resolveContainers: () => HTMLElement[];
    contains: (element: HTMLElement) => boolean;
};
/**
 * A provider for the main tree node.
 *
 * When a component is rendered in a `Portal`, it is no longer part of the main
 * tree. This provider helps to find the main tree node and pass it along to the
 * components that need it.
 *
 * The main tree node is used for features such as outside click behavior, where
 * we allow clicks in 3rd party containers, but not in the parent of the "main
 * tree".
 *
 * In case of a `Popover`, we can use the `PopoverButton` as a marker in the
 * "main tree", the `PopoverPanel` can't be used because it could be rendered in
 * a `Portal` (e.g. when using the `anchor` props).
 *
 * However, we can't use the `PopoverButton` when it's nested inside of another
 * `Popover`'s `PopoverPanel` component if the parent `PopoverPanel` is
 * rendered in a `Portal`.
 *
 * This is where the `MainTreeProvider` comes in. It will find the "main tree"
 * node and pass it on. The top-level `PopoverButton` will be used as a marker
 * in the "main tree" and nested `Popover` will use this button as well.
 */
export declare function MainTreeProvider({ children, node, }: {
    children: React.ReactNode;
    node?: HTMLElement | null;
}): React.JSX.Element;
/**
 * Get the main tree node from context or fallback to the optionally provided node.
 */
export declare function useMainTreeNode(fallbackMainTreeNode?: HTMLElement | null): HTMLElement | null;
