import {
  defineComponent,
  inject,
  provide,

  // Types
  InjectionKey,
} from 'vue'

let ForcePortalRootContext = Symbol('ForcePortalRootContext') as InjectionKey<Boolean>

export function usePortalRoot() {
  return inject(ForcePortalRootContext, false)
}

export let ForcePortalRoot = defineComponent({
  name: 'ForcePortalRoot',
  props: {
    force: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    provide(ForcePortalRootContext, props.force)

    return () => slots.default!()
  },
})
