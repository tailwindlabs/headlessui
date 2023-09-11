import { defineComponent, inject, provide, type InjectionKey } from 'vue'
import { render } from '../utils/render'

let ForcePortalRootContext = Symbol('ForcePortalRootContext') as InjectionKey<Boolean>

export function usePortalRoot() {
  return inject(ForcePortalRootContext, false)
}

export let ForcePortalRoot = defineComponent({
  name: 'ForcePortalRoot',
  props: {
    as: { type: [Object, String], default: 'template' },
    force: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    provide(ForcePortalRootContext, props.force)

    return () => {
      let { force, ...theirProps } = props
      return render({
        theirProps,
        ourProps: {},
        slot: {},
        slots,
        attrs,
        name: 'ForcePortalRoot',
      })
    }
  },
})
