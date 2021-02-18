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
  let [element] = useState<HTMLDivElement | null>(() =>
    typeof window === 'undefined' ? null : document.createElement('div')
  )

  useIsoMorphicEffect(() => {
    if (!target) return
    if (!element) return

    target.appendChild(element)

    return () => {
      if (!target) return
      if (!element) return

      target.removeChild(element)
      if (target.childNodes.length <= 0) document.body.removeChild(target)
    }
  }, [target])

  return !target || !element ? null : createPortal(render(props, {}, DEFAULT_PORTAL_TAG), element)
}
