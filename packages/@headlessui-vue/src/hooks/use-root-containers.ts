import { h, ref, type Ref } from 'vue'
import { Hidden, Features as HiddenFeatures } from '../internal/hidden'
import { dom } from '../utils/dom'
import { getOwnerDocument } from '../utils/owner'

export function useRootContainers({
  defaultContainers = [],
  portals,
  mainTreeNodeRef: _mainTreeNodeRef,
}: {
  defaultContainers?: (HTMLElement | null | Ref<HTMLElement | null>)[]
  portals?: Ref<HTMLElement[]>
  mainTreeNodeRef?: Ref<HTMLElement | null>
} = {}) {
  // Reference to a node in the "main" tree, not in the portalled Dialog tree.
  let mainTreeNodeRef = ref<HTMLElement | null>(null)
  let ownerDocument = getOwnerDocument(mainTreeNodeRef)

  function resolveContainers() {
    let containers: HTMLElement[] = []

    // Resolve default containers
    for (let container of defaultContainers) {
      if (container === null) continue
      if (container instanceof HTMLElement) {
        containers.push(container)
      } else if ('value' in container && container.value instanceof HTMLElement) {
        containers.push(container.value)
      }
    }

    // Resolve portal containers
    if (portals?.value) {
      for (let portal of portals.value) {
        containers.push(portal)
      }
    }

    // Resolve third party (root) containers
    for (let container of ownerDocument?.querySelectorAll('html > *, body > *') ?? []) {
      if (container === document.body) continue // Skip `<body>`
      if (container === document.head) continue // Skip `<head>`
      if (!(container instanceof HTMLElement)) continue // Skip non-HTMLElements
      if (container.id === 'headlessui-portal-root') continue // Skip the Headless UI portal root
      if (container.contains(dom(mainTreeNodeRef))) continue // Skip if it is the main app
      if (container.contains((dom(mainTreeNodeRef)?.getRootNode() as ShadowRoot)?.host)) continue // Skip if it is the main app (and the component is inside a shadow root)
      if (containers.some((defaultContainer) => container.contains(defaultContainer))) continue // Skip if the current container is part of a container we've already seen (e.g.: default container / portal)

      containers.push(container)
    }

    return containers
  }

  return {
    resolveContainers,
    contains(element: HTMLElement) {
      return resolveContainers().some((container) => container.contains(element))
    },
    mainTreeNodeRef,
    MainTreeNode() {
      if (_mainTreeNodeRef != null) return null
      return h(Hidden, { features: HiddenFeatures.Hidden, ref: mainTreeNodeRef })
    },
  }
}

export function useMainTreeNode() {
  let mainTreeNodeRef = ref<HTMLElement | null>(null)

  return {
    mainTreeNodeRef,
    MainTreeNode() {
      return h(Hidden, { features: HiddenFeatures.Hidden, ref: mainTreeNodeRef })
    },
  }
}
