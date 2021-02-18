import {
  useRef,

  // Types
  ElementType,
  MutableRefObject,
} from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useFocusTrap } from '../../hooks/use-focus-trap'

let DEFAULT_FOCUS_TRAP_TAG = 'div' as const

export function FocusTrap<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(
  props: Props<TTag> & { initialFocus?: MutableRefObject<HTMLElement | null> }
) {
  let containerRef = useRef<HTMLDivElement | null>(null)
  let { initialFocus, ...passthroughProps } = props

  useFocusTrap(containerRef, true, { initialFocus })

  let propsWeControl = { ref: containerRef }

  return render({ ...passthroughProps, ...propsWeControl }, {}, DEFAULT_FOCUS_TRAP_TAG)
}
