import {
  useMemo,

  // Types
  ElementType,
} from 'react'

import { Props } from '../../types'
import { render } from '../../utils/render'
import { match } from '../../utils/match'

type Importance =
  /**
   * Indicates that updates to the region should be presented at the next
   * graceful opportunity, such as at the end of speaking the current sentence
   * or when the user pauses typing.
   */
  | 'polite'

  /**
   * Indicates that updates to the region have the highest priority and should
   * be presented the user immediately.
   */
  | 'assertive'

// ---

let DEFAULT_ALERT_TAG = 'div' as const
interface AlertRenderPropArg {
  importance: Importance
}
type AlertPropsWeControl = 'role'

export function Alert<TTag extends ElementType = typeof DEFAULT_ALERT_TAG>(
  props: Props<TTag, AlertRenderPropArg, AlertPropsWeControl> & {
    importance?: Importance
  }
) {
  let { importance = 'polite', ...passThroughProps } = props
  let propsWeControl = match(importance, {
    polite: () => ({ role: 'status' }),
    assertive: () => ({ role: 'alert' }),
  })

  let bag = useMemo<AlertRenderPropArg>(() => ({ importance }), [importance])

  return render({ ...passThroughProps, ...propsWeControl }, bag, DEFAULT_ALERT_TAG)
}
