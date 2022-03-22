import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useState,

  // Types
  ElementType,
  MutableRefObject,
  Ref,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'

import { Props } from '../../types'
import { forwardRefWithAs, render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { usePortalRoot } from '../../internal/portal-force-root'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { useOwnerDocument } from '../../hooks/use-owner'

function usePortalTarget(ref: MutableRefObject<HTMLElement | null>): HTMLElement | null {
  let forceInRoot = usePortalRoot()
  let groupTarget = useContext(PortalGroupContext)

  let ownerDocument = useOwnerDocument(ref)

  let [target, setTarget] = useState(() => {
    // Group context is used, but still null
    if (!forceInRoot && groupTarget !== null) return null

    // No group context is used, let's create a default portal root
    if (typeof window === 'undefined') return null
    let existingRoot = ownerDocument?.getElementById('headlessui-portal-root')
    if (existingRoot) return existingRoot

    if (ownerDocument === null) return null

    let root = ownerDocument.createElement('div')
    root.setAttribute('id', 'headlessui-portal-root')
    return ownerDocument.body.appendChild(root)
  })

  // Ensure the portal root is always in the DOM
  useEffect(() => {
    if (target === null) return

    if (!ownerDocument?.body.contains(target)) {
      ownerDocument?.body.appendChild(target)
    }
  }, [target, ownerDocument])

  useEffect(() => {
    if (forceInRoot) return
    if (groupTarget === null) return
    setTarget(groupTarget.current)
  }, [groupTarget, setTarget, forceInRoot])

  return target
}

// ---

let DEFAULT_PORTAL_TAG = Fragment
interface PortalRenderPropArg {}

let PortalRoot = forwardRefWithAs(function Portal<
  TTag extends ElementType = typeof DEFAULT_PORTAL_TAG
>(props: Props<TTag, PortalRenderPropArg>, ref: Ref<HTMLElement>) {
  let theirProps = props
  let internalPortalRootRef = useRef<HTMLElement | null>(null)
  let portalRef = useSyncRefs(
    optionalRef<typeof internalPortalRootRef['current']>((ref) => {
      internalPortalRootRef.current = ref
    }),
    ref
  )
  let ownerDocument = useOwnerDocument(internalPortalRootRef)
  let target = usePortalTarget(internalPortalRootRef)
  let [element] = useState<HTMLDivElement | null>(() =>
    typeof window === 'undefined' ? null : ownerDocument?.createElement('div') ?? null
  )

  let ready = useServerHandoffComplete()

  useIsoMorphicEffect(() => {
    if (!target) return
    if (!element) return

    target.appendChild(element)

    return () => {
      if (!target) return
      if (!element) return

      target.removeChild(element)

      if (target.childNodes.length <= 0) {
        target.parentElement?.removeChild(target)
      }
    }
  }, [target, element])

  if (!ready) return null

  let ourProps = { ref: portalRef }

  return !target || !element
    ? null
    : createPortal(
        render({
          ourProps,
          theirProps,
          defaultTag: DEFAULT_PORTAL_TAG,
          name: 'Portal',
        }),
        element
      )
})

// ---

let DEFAULT_GROUP_TAG = Fragment
interface GroupRenderPropArg {}

let PortalGroupContext = createContext<MutableRefObject<HTMLElement | null> | null>(null)

let Group = forwardRefWithAs(function Group<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
  props: Props<TTag, GroupRenderPropArg> & {
    target: MutableRefObject<HTMLElement | null>
  },
  ref: Ref<HTMLElement>
) {
  let { target, ...theirProps } = props
  let groupRef = useSyncRefs(ref)

  let ourProps = { ref: groupRef }

  return (
    <PortalGroupContext.Provider value={target}>
      {render({
        ourProps,
        theirProps,
        defaultTag: DEFAULT_GROUP_TAG,
        name: 'Popover.Group',
      })}
    </PortalGroupContext.Provider>
  )
})

// ---

export let Portal = Object.assign(PortalRoot, { Group })
