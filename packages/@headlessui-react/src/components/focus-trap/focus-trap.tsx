import {
  useRef,

  // Types
  ElementType,
  MutableRefObject,
} from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { useFocusTrap, Features as FocusTrapFeatures } from '../../hooks/use-focus-trap'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'

let DEFAULT_FOCUS_TRAP_TAG = 'div' as const

export function FocusTrap<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(
  props: Props<TTag> & { initialFocus?: MutableRefObject<HTMLElement | null> }
) {
  let container = useRef<HTMLElement | null>(null)
  let { initialFocus, ...passthroughProps } = props

  let ready = useServerHandoffComplete()
  useFocusTrap(container, ready ? FocusTrapFeatures.All : FocusTrapFeatures.None, { initialFocus })

  let propsWeControl = {
    ref: container,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    defaultTag: DEFAULT_FOCUS_TRAP_TAG,
    name: 'FocusTrap',
  })
}
