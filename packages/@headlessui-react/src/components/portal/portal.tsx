// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
import {
  Fragment,

  // Types
  ElementType,
  useState,
} from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { createPortal } from 'react-dom'

// ---

let DEFAULT_PORTAL_TAG = Fragment
interface PortalRenderPropArg {}

export function Portal<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(
  props: Props<TTag, PortalRenderPropArg>
) {
  let [target] = useState(() => {
    if (typeof window === 'undefined') return null
    let existingRoot = document.getElementById('headlessui-portal-root')
    if (existingRoot) return existingRoot

    let root = document.createElement('div')
    root.setAttribute('id', 'headlessui-portal-root')
    return document.body.appendChild(root)
  })

  useIsoMorphicEffect(() => {
    return () => {
      // This happens *right* before we actually unmount. So if we have 1 left,
      // it means that we will have 0 left after the actual unmount.
      if (!target) return
      if (target.childNodes.length <= 1) document.body.removeChild(target)
    }
  }, [target])

  return !target ? null : createPortal(render(props, {}, DEFAULT_PORTAL_TAG), target)
}
