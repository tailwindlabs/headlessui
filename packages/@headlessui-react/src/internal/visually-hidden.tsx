import { ElementType, Ref } from 'react'
import { Props } from '../types'
import { forwardRefWithAs, render } from '../utils/render'

let DEFAULT_VISUALLY_HIDDEN_TAG = 'div' as const

export let VisuallyHidden = forwardRefWithAs(function VisuallyHidden<
  TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG
>(props: Props<TTag>, ref: Ref<HTMLElement>) {
  let theirProps = props
  let ourProps = {
    ref,
    style: {
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
      display: 'none',
    },
  }

  return render({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_VISUALLY_HIDDEN_TAG,
    name: 'VisuallyHidden',
  })
})
