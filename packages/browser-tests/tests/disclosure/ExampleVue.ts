import { h, defineComponent } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

export default defineComponent({
  props: {
    buttonDisabled: {
      type: Boolean,
      default: false,
    },

    buttonInside: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    return () =>
      h('div', [
        h(Disclosure, [
          h(DisclosureButton, { disabled: props.buttonDisabled }, 'Trigger'),
          h(DisclosurePanel, [props.buttonInside ? h(DisclosureButton, 'Close') : 'Content']),
        ]),
      ])
  },
})
