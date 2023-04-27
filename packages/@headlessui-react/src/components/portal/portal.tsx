import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,

  // Types
  ElementType,
  MutableRefObject,
  Ref,
} from 'react'
import { createPortal } from 'react-dom'

import { Props } from '../../types'
import { forwardRefWithAs, RefProp, HasDisplayName, render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { usePortalRoot } from '../../internal/portal-force-root'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { useOnUnmount } from '../../hooks/use-on-unmount'
import { useOwnerDocument } from '../../hooks/use-owner'
import { env } from '../../utils/env'

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
interface PortalRenderPropArg {}

export type PortalProps<TTag extends ElementType> = Props<TTag, PortalRenderPropArg>

function PortalFn<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(
  props: PortalProps<TTag>,
  ref: Ref<HTMLElement>
) {
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
    env.isServer ? null : ownerDocument?.createElement('div') ?? null
  )

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
          defaultTag: DEFAULT_PORTAL_TAG,
          name: 'Portal',
        }),
        element
      )
}

// ---

let DEFAULT_GROUP_TAG = Fragment
interface GroupRenderPropArg {}

let PortalGroupContext = createContext<MutableRefObject<HTMLElement | null> | null>(null)

export type PortalGroupProps<TTag extends ElementType> = Props<TTag, GroupRenderPropArg> & {
  target: MutableRefObject<HTMLElement | null>
}

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

interface ComponentPortal extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(
    props: PortalProps<TTag> & RefProp<typeof PortalFn>
  ): JSX.Element
}

interface ComponentPortalGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
    props: PortalGroupProps<TTag> & RefProp<typeof GroupFn>
  ): JSX.Element
}

let PortalRoot = forwardRefWithAs(PortalFn) as unknown as ComponentPortal
let Group = forwardRefWithAs(GroupFn) as unknown as ComponentPortalGroup

export let Portal = Object.assign(PortalRoot, { Group })
