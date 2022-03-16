import { h, ref, defineComponent } from 'vue'

import { VisuallyHidden } from './visually-hidden'

export let FocusSentinel = defineComponent({
  props: {
    onFocus: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    let enabled = ref(true)

    return () => {
      if (!enabled.value) return null

      return h(VisuallyHidden, {
        as: 'button',
        type: 'button',
        onFocus(event: FocusEvent) {
          event.preventDefault()
          let frame: ReturnType<typeof requestAnimationFrame>

          let tries = 50
          function forwardFocus() {
            // Prevent infinite loops
            if (tries-- <= 0) {
              if (frame) cancelAnimationFrame(frame)
              return
            }

            // Try to move focus to the correct element. This depends on the implementation
            // of `onFocus` of course since it would be different for each place we use it in.
            if (props.onFocus()) {
              enabled.value = false
              cancelAnimationFrame(frame)
              return
            }

            // Retry
            frame = requestAnimationFrame(forwardFocus)
          }

          frame = requestAnimationFrame(forwardFocus)
        },
      })
    }
  },
})
