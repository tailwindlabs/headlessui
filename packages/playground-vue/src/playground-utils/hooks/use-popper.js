import { createPopper } from '@popperjs/core'
import { onMounted, ref, watchEffect } from 'vue'

export function usePopper(options) {
  let reference = ref(null)
  let popper = ref(null)

  onMounted(() => {
    watchEffect((onInvalidate) => {
      if (!popper.value) return
      if (!reference.value) return

      let popperEl = popper.value.el || popper.value
      let referenceEl = reference.value.el || reference.value

      if (!(referenceEl instanceof HTMLElement)) return
      if (!(popperEl instanceof HTMLElement)) return

      let { destroy } = createPopper(referenceEl, popperEl, options)

      onInvalidate(destroy)
    })
  })

  return [reference, popper]
}
