import { defineComponent, type PropType } from 'vue'
import { render } from '../utils/render'

export enum Features {
  // The default, no features.
  None = 1 << 0,

  // Whether the element should be focusable or not.
  Focusable = 1 << 1,

  // Whether it should be completely hidden, even to assistive technologies.
  Hidden = 1 << 2,
}

export let Hidden = defineComponent({
  name: 'Hidden',
  props: {
    as: { type: [Object, String], default: 'div' },
    features: { type: Number as PropType<Features>, default: Features.None },
  },
  setup(props, { slots, attrs }) {
    return () => {
      let { features, ...theirProps } = props
      let ourProps = {
        'aria-hidden':
          (features & Features.Focusable) === Features.Focusable
            ? true
            : // @ts-ignore
              theirProps['aria-hidden'] ?? undefined,
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
        attrs,
        slots,
        name: 'Hidden',
      })
    }
  },
})
