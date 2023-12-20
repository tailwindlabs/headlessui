import type { ElementType, Ref } from 'react'
import type { Props } from '../types'
import { forwardRefWithAs, render, type HasDisplayName, type RefProp } from '../utils/render'

let DEFAULT_VISUALLY_HIDDEN_TAG = 'div' as const

export enum HiddenFeatures {
  // The default, no features.
  None = 1 << 0,

  // Whether the element should be focusable or not.
  Focusable = 1 << 1,

  // Whether it should be completely hidden, even to assistive technologies.
  Hidden = 1 << 2,
}

type HiddenRenderPropArg = {}
type HiddenPropsWeControl = never
export type HiddenProps<TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG> = Props<
  TTag,
  HiddenRenderPropArg,
  HiddenPropsWeControl,
  { features?: HiddenFeatures }
>

function VisuallyHidden<TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG>(
  props: HiddenProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { features = HiddenFeatures.None, ...theirProps } = props
  let ourProps = {
    ref,
    'aria-hidden':
      (features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable
        ? true
        : theirProps['aria-hidden'] ?? undefined,
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
      ...((features & HiddenFeatures.Hidden) === HiddenFeatures.Hidden &&
        !((features & HiddenFeatures.Focusable) === HiddenFeatures.Focusable) && {
          display: 'none',
        }),
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
