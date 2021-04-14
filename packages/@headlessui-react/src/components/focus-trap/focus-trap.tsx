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
  let containers = useRef<Set<HTMLElement>>(new Set())
  let { initialFocus, ...passthroughProps } = props

  useFocusTrap(containers, true, { initialFocus })

  let propsWeControl = {
    ref(element: HTMLElement | null) {
      if (!element) return
      containers.current.add(element)
    },
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    defaultTag: DEFAULT_FOCUS_TRAP_TAG,
    name: 'FocusTrap',
  })
}
