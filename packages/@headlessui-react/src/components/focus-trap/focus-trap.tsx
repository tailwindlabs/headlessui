import {
  useRef,
  useMemo,

  // Types
  ElementType,
  Ref,
} from 'react'

import { Props } from '../../types'
import { render, forwardRefWithAs } from '../../utils/render'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useFocusTrap } from '../../hooks/use-focus-trap'

let DEFAULT_FOCUS_TRAP_TAG = 'div' as const
interface FocusTrapRenderPropArg {}
type FocusTrapPropsWeControl = 'onKeyDown'

export let FocusTrap = forwardRefWithAs(function FocusTrap<
  TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG
>(props: Props<TTag, FocusTrapRenderPropArg, FocusTrapPropsWeControl>, ref: Ref<HTMLDivElement>) {
  let internalContainerRef = useRef<HTMLDivElement | null>(null)
  let containerRef = useSyncRefs(internalContainerRef, ref)

  let { handleKeyDown } = useFocusTrap(internalContainerRef)

  let propsBag = useMemo(() => ({}), [])
  let passthroughProps = props
  let propsWeControl = { ref: containerRef, onKeyDown: handleKeyDown }

  return render({ ...passthroughProps, ...propsWeControl }, propsBag, DEFAULT_FOCUS_TRAP_TAG)
})
