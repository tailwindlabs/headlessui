import React, { createContext, useContext, useState, type MutableRefObject } from 'react'
import { Hidden, HiddenFeatures } from '../internal/hidden'
import * as DOM from '../utils/dom'
import { getOwnerDocument } from '../utils/owner'
import { useEvent } from './use-event'
import { useOwnerDocument } from './use-owner'

export function useRootContainers({
  defaultContainers = [],
  portals,

  // Reference to a node in the "main" tree, not in the portalled Dialog tree.
  mainTreeNode,
}: {
  defaultContainers?: (Element | null | MutableRefObject<Element | null>)[]
  portals?: MutableRefObject<Element[]>
  mainTreeNode?: Element | null
} = {}) {
  let ownerDocument = useOwnerDocument(mainTreeNode)

  let resolveContainers = useEvent(() => {
    let containers: Element[] = []

    // Resolve default containers
    for (let container of defaultContainers) {
      if (container === null) continue
      if (DOM.isElement(container)) {
        containers.push(container)
      } else if ('current' in container && DOM.isElement(container.current)) {
        containers.push(container.current)
      }
    }

    // Resolve portal containers
    if (portals?.current) {
      for (let portal of portals.current) {
        containers.push(portal)
      }
    }

    // Resolve third party (root) containers
    for (let container of ownerDocument?.querySelectorAll('html > *, body > *') ?? []) {
      if (container === document.body) continue // Skip `<body>`
      if (container === document.head) continue // Skip `<head>`
      if (!DOM.isElement(container)) continue // Skip non-HTMLElements
      if (container.id === 'headlessui-portal-root') continue // Skip the Headless UI portal root
      if (mainTreeNode) {
        if (container.contains(mainTreeNode)) continue // Skip if it is the main app
        if (container.contains((mainTreeNode?.getRootNode() as ShadowRoot)?.host)) continue // Skip if it is the main app (and the component is inside a shadow root)
      }
      if (containers.some((defaultContainer) => container.contains(defaultContainer))) continue // Skip if the current container is part of a container we've already seen (e.g.: default container / portal)

      containers.push(container)
    }

    return containers
  })

  return {
    resolveContainers,
    contains: useEvent((element: Element) =>
      resolveContainers().some((container) => container.contains(element))
    ),
  }
}

let MainTreeContext = createContext<Element | null>(null)

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
export function MainTreeProvider({
  children,
  node,
}: {
  children: React.ReactNode
  node?: Element | null
}) {
  let [mainTreeNode, setMainTreeNode] = useState<Element | null>(null)

  // 1. Prefer the main tree node from context
  // 2. Prefer the provided node
  // 3. Create a new node at this point, and find the main tree node
  let resolvedMainTreeNode = useMainTreeNode(node ?? mainTreeNode)

  return (
    <MainTreeContext.Provider value={resolvedMainTreeNode}>
      {children}

      {/**
       * If no main tree node is found at this point, then we briefly render an
       * element to find the main tree node and pass it along.
       */}
      {resolvedMainTreeNode === null && (
        <Hidden
          features={HiddenFeatures.Hidden}
          ref={(el) => {
            if (!el) return

            // We will only render this when no `mainTreeNode` is found. This
            // means that if we render this element and use it as the
            // `mainTreeNode` that we will be unmounting it later.
            //
            // However, we can resolve the actual root container of the main
            // tree node and use that instead.
            for (let container of getOwnerDocument(el)?.querySelectorAll('html > *, body > *') ??
              []) {
              if (container === document.body) continue // Skip `<body>`
              if (container === document.head) continue // Skip `<head>`
              if (!DOM.isElement(container)) continue // Skip non-HTMLElements
              if (container?.contains(el)) {
                setMainTreeNode(container)
                break
              }
            }
          }}
        />
      )}
    </MainTreeContext.Provider>
  )
}

/**
 * Get the main tree node from context or fallback to the optionally provided node.
 */
export function useMainTreeNode(fallbackMainTreeNode: Element | null = null) {
  // Prefer the main tree node from context, but fallback to the provided node.
  return useContext(MainTreeContext) ?? fallbackMainTreeNode
}
