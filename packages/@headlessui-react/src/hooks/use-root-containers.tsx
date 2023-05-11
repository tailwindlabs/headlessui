import React, { useRef, useMemo, Ref } from 'react'
import { Hidden, Features as HiddenFeatures } from '../internal/hidden'
import { useEvent } from './use-event'
import { useOwnerDocument } from './use-owner'

export function useRootContainers(
  defaultContainers: (HTMLElement | null | Ref<HTMLElement | null>)[] = []
) {
  // Reference to a node in the "main" tree, not in the portalled Dialog tree.
  let mainTreeNodeRef = useRef<HTMLDivElement | null>(null)
  let ownerDocument = useOwnerDocument(mainTreeNodeRef)

  return {
    resolveContainers: useEvent(() => {
      let resolvedDefaultContainers: HTMLElement[] = []
      for (let container of defaultContainers) {
        if (container === null) continue
        if (container instanceof HTMLElement) {
          resolvedDefaultContainers.push(container)
        }
        if ('current' in container && container.current instanceof HTMLElement) {
          resolvedDefaultContainers.push(container.current)
        }
      }

      // Third party roots
      let rootContainers = Array.from(
        ownerDocument?.querySelectorAll('html > *, body > *, [data-headlessui-portal]') ?? []
      ).filter((container) => {
        if (container === document.body) return false // Skip `<body>`
        if (container === document.head) return false // Skip `<head>`
        if (!(container instanceof HTMLElement)) return false // Skip non-HTMLElements
        if (container.contains(mainTreeNodeRef.current)) return false // Skip if it is the main app
        if (
          resolvedDefaultContainers.some((defaultContainer) => container.contains(defaultContainer))
        ) {
          return false
        }

        return true // Keep
      })

      return rootContainers.concat(resolvedDefaultContainers) as HTMLElement[]
    }),
    mainTreeNodeRef,
    MainTreeNode: useMemo(() => {
      return function MainTreeNode() {
        return <Hidden features={HiddenFeatures.Hidden} ref={mainTreeNodeRef} />
      }
    }, [mainTreeNodeRef]),
  }
}
