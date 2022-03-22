import {
  useRef,

  // Types
  ElementType,
  MutableRefObject,
  Ref,
} from 'react'

import { Props } from '../../types'
import { forwardRefWithAs, render } from '../../utils/render'
import { useFocusTrap, Features as FocusTrapFeatures } from '../../hooks/use-focus-trap'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'

let DEFAULT_FOCUS_TRAP_TAG = 'div' as const

export let FocusTrap = forwardRefWithAs(function FocusTrap<
  TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG
>(
  props: Props<TTag> & { initialFocus?: MutableRefObject<HTMLElement | null> },
  ref: Ref<HTMLElement>
) {
  let container = useRef<HTMLElement | null>(null)
  let focusTrapRef = useSyncRefs(container, ref)
  let { initialFocus, ...theirProps } = props

  let ready = useServerHandoffComplete()
  useFocusTrap(container, ready ? FocusTrapFeatures.All : FocusTrapFeatures.None, { initialFocus })

  let ourProps = {
    ref: focusTrapRef,
  }

  return render({
    ourProps,
    theirProps,
    defaultTag: DEFAULT_FOCUS_TRAP_TAG,
    name: 'FocusTrap',
  })
})
