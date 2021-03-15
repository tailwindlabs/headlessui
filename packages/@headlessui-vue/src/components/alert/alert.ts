import { defineComponent, PropType } from 'vue'

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

export let Alert = defineComponent({
  name: 'Alert',
  props: {
    as: { type: [Object, String], default: 'div' },
    importance: { type: String as PropType<Importance>, default: 'polite' },
  },
  setup(props, { slots, attrs }) {
    let { importance = 'polite', ...passThroughProps } = props

    let slot = { importance }
    let propsWeControl = match(importance, {
      polite: () => ({ role: 'status' }),
      assertive: () => ({ role: 'alert' }),
    })

    return () => {
      return render({ props: { ...passThroughProps, ...propsWeControl }, slot, slots, attrs })
    }
  },
})
