'use client'

import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ContextType,
  type ElementType,
  type MutableRefObject,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { useEvent } from '../../hooks/use-event'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useOnUnmount } from '../../hooks/use-on-unmount'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { usePortalRoot } from '../../internal/portal-force-root'
import type { Props } from '../../types'
import { env } from '../../utils/env'
import { forwardRefWithAs, render, type HasDisplayName, type RefProp } from '../../utils/render'

function usePortalTarget(ref: MutableRefObject<HTMLElement | null>): HTMLElement | null {
  let forceInRoot = usePortalRoot()
  let groupTarget = useContext(PortalGroupContext)

  let ownerDocument = useOwnerDocument(ref)

  let [target, setTarget] = useState(() => {
    // Group context is used, but still null
    if (!forceInRoot && groupTarget !== null) return null

    // No group context is used, let's create a default portal root
    if (env.isServer) return null
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
type PortalRenderPropArg = {}
type PortalPropsWeControl = never

export type PortalProps<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG> = Props<
  TTag,
  PortalRenderPropArg,
  PortalPropsWeControl
>

function PortalFn<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(
  props: PortalProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let theirProps = props
  let internalPortalRootRef = useRef<HTMLElement | null>(null)
  let portalRef = useSyncRefs(
    optionalRef<(typeof internalPortalRootRef)['current']>((ref) => {
      internalPortalRootRef.current = ref
    }),
    ref
  )
  let ownerDocument = useOwnerDocument(internalPortalRootRef)
  let target = usePortalTarget(internalPortalRootRef)
  let [element] = useState<HTMLDivElement | null>(() =>
    env.isServer ? null : ownerDocument?.createElement('div') ?? null
  )
  let parent = useContext(PortalParentContext)
  let ready = useServerHandoffComplete()

  useIsoMorphicEffect(() => {
    if (!target || !element) return

    // Element already exists in target, always calling target.appendChild(element) will cause a
    // brief unmount/remount.
    if (!target.contains(element)) {
      element.setAttribute('data-headlessui-portal', '')
      target.appendChild(element)
    }
  }, [target, element])

  useIsoMorphicEffect(() => {
    if (!element) return
    if (!parent) return

    return parent.register(element)
  }, [parent, element])

  useOnUnmount(() => {
    if (!target || !element) return

    if (element instanceof Node && target.contains(element)) {
      target.removeChild(element)
    }

    if (target.childNodes.length <= 0) {
      target.parentElement?.removeChild(target)
    }
  })

  if (!ready) return null

  let ourProps = { ref: portalRef }

  return !target || !element
    ? null
    : createPortal(
        render({
          ourProps,
          theirProps,
          slot: {},
          defaultTag: DEFAULT_PORTAL_TAG,
          name: 'Portal',
        }),
        element
      )
}

// ---

let DEFAULT_GROUP_TAG = Fragment
type GroupRenderPropArg = {}
type GroupPropsWeControl = never

let PortalGroupContext = createContext<MutableRefObject<HTMLElement | null> | null>(null)

export type PortalGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<
  TTag,
  GroupRenderPropArg,
  GroupPropsWeControl,
  {
    target: MutableRefObject<HTMLElement | null>
  }
>

function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
  props: PortalGroupProps<TTag>,
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
}

// ---

let PortalParentContext = createContext<{
  register: (portal: HTMLElement) => () => void
  unregister: (portal: HTMLElement) => void
  portals: MutableRefObject<HTMLElement[]>
} | null>(null)

export function useNestedPortals() {
  let parent = useContext(PortalParentContext)
  let portals = useRef<HTMLElement[]>([])

  let register = useEvent((portal: HTMLElement) => {
    portals.current.push(portal)
    if (parent) parent.register(portal)
    return () => unregister(portal)
  })

  let unregister = useEvent((portal: HTMLElement) => {
    let idx = portals.current.indexOf(portal)
    if (idx !== -1) portals.current.splice(idx, 1)
    if (parent) parent.unregister(portal)
  })

  let api = useMemo<ContextType<typeof PortalParentContext>>(
    () => ({ register, unregister, portals }),
    [register, unregister, portals]
  )

  return [
    portals,
    useMemo(() => {
      return function PortalWrapper({ children }: { children: React.ReactNode }) {
        return <PortalParentContext.Provider value={api}>{children}</PortalParentContext.Provider>
      }
    }, [api]),
  ] as const
}

// ---

export interface _internal_ComponentPortal extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(
    props: PortalProps<TTag> & RefProp<typeof PortalFn>
  ): JSX.Element
}

export interface _internal_ComponentPortalGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
    props: PortalGroupProps<TTag> & RefProp<typeof GroupFn>
  ): JSX.Element
}

let PortalRoot = forwardRefWithAs(PortalFn) as unknown as _internal_ComponentPortal
export let PortalGroup = forwardRefWithAs(GroupFn) as unknown as _internal_ComponentPortalGroup

export let Portal = Object.assign(PortalRoot, { Group: PortalGroup })
