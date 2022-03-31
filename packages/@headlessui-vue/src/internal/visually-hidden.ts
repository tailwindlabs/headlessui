import { defineComponent } from 'vue'
import { render } from '../utils/render'

export let VisuallyHidden = defineComponent({
  name: 'VisuallyHidden',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs }) {
    return () => {
      let ourProps = {
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
        props: { ...props, ...ourProps },
        slot: {},
        attrs,
        slots,
        name: 'VisuallyHidden',
      })
    }
  },
})
