import { ElementType, Ref } from 'react'
import { Props } from '../types'
import { forwardRefWithAs, render, HasDisplayName, RefProp } from '../utils/render'

let DEFAULT_VISUALLY_HIDDEN_TAG = 'div' as const

export enum Features {
  // The default, no features.
  None = 1 << 0,

  // Whether the element should be focusable or not.
  Focusable = 1 << 1,

  // Whether it should be completely hidden, even to assistive technologies.
  Hidden = 1 << 2,
}

export type HiddenProps<TTag extends ElementType> = Props<TTag, {}, never, { features?: Features }>

function VisuallyHidden<TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG>(
  props: HiddenProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { features = Features.None, ...theirProps } = props
  let ourProps = {
    ref,
    'aria-hidden': (features & Features.Focusable) === Features.Focusable ? true : undefined,
    style: {
      position: 'fixed',
      top: 1,
      left: 1,
      width: 1,
      height: 0,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
      ...((features & Features.Hidden) === Features.Hidden &&
        !((features & Features.Focusable) === Features.Focusable) && { display: 'none' }),
    },
  }

  return render({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_VISUALLY_HIDDEN_TAG,
    name: 'Hidden',
  })
}

interface ComponentHidden extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG>(
    props: HiddenProps<TTag> & RefProp<typeof VisuallyHidden>
  ): JSX.Element
}

export let Hidden = forwardRefWithAs(VisuallyHidden) as unknown as ComponentHidden
