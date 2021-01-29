import {
  useRef,

  // Types
  ElementType,
} from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useFocusTrap } from '../../hooks/use-focus-trap'

let DEFAULT_FOCUS_TRAP_TAG = 'div' as const

export function FocusTrap<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(
  props: Props<TTag>
) {
  let containerRef = useRef<HTMLDivElement | null>(null)

  useFocusTrap(containerRef)

  let passthroughProps = props
  let propsWeControl = { ref: containerRef }

  return render({ ...passthroughProps, ...propsWeControl }, {}, DEFAULT_FOCUS_TRAP_TAG)
}
