import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useState,

  // Types
  ElementType,
  MutableRefObject,
} from 'react'
import { createPortal } from 'react-dom'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { usePortalRoot } from '../../internal/portal-force-root'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'

function usePortalTarget(): HTMLElement | null {
  let forceInRoot = usePortalRoot()
  let groupTarget = useContext(PortalGroupContext)
  let [target, setTarget] = useState(() => {
    // Group context is used, but still null
    if (!forceInRoot && groupTarget !== null) return null

    // No group context is used, let's create a default portal root
    if (typeof window === 'undefined') return null
    let existingRoot = document.getElementById('headlessui-portal-root')
    if (existingRoot) return existingRoot

    let root = document.createElement('div')
    root.setAttribute('id', 'headlessui-portal-root')
    return document.body.appendChild(root)
  })

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

export function Portal<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(
  props: Props<TTag, PortalRenderPropArg>
) {
  let passthroughProps = props
  let target = usePortalTarget()
  let [element] = useState<HTMLDivElement | null>(() =>
    typeof window === 'undefined' ? null : document.createElement('div')
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

  return !target || !element
    ? null
    : createPortal(
        render({ props: passthroughProps, defaultTag: DEFAULT_PORTAL_TAG, name: 'Portal' }),
        element
      )
}

// ---

let DEFAULT_GROUP_TAG = Fragment
interface GroupRenderPropArg {}

let PortalGroupContext = createContext<MutableRefObject<HTMLElement | null> | null>(null)

function Group<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(
  props: Props<TTag, GroupRenderPropArg> & {
    target: MutableRefObject<HTMLElement | null>
  }
) {
  let { target, ...passthroughProps } = props

  return (
    <PortalGroupContext.Provider value={target}>
      {render({
        props: passthroughProps,
        defaultTag: DEFAULT_GROUP_TAG,
        name: 'Popover.Group',
      })}
    </PortalGroupContext.Provider>
  )
}

// ---

Portal.Group = Group
