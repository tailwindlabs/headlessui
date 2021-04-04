import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,

  // Types
  ComputedRef,
  InjectionKey,
} from 'vue'

import { useId } from '../../hooks/use-id'
import { render } from '../../utils/render'

// ---

let LabelContext = Symbol('LabelContext') as InjectionKey<{
  register(value: string): () => void
}>

function useLabelContext() {
  return inject(LabelContext, {
    register() {
      return () => {}
    },
  })
}

export function useLabels(): [ComputedRef<string | undefined>, ReturnType<typeof defineComponent>] {
  let labelIds = ref<string[]>([])

  return [
    // The actual id's as string or undefined.
    computed(() => (labelIds.value.length > 0 ? labelIds.value.join(' ') : undefined)),

    // The provider component
    defineComponent({
      name: 'LabelProvider',
      setup(_props, { slots }) {
        function register(value: string) {
          labelIds.value.push(value)

          return () => {
            let idx = labelIds.value.indexOf(value)
            if (idx === -1) return
            labelIds.value.splice(idx, 1)
          }
        }

        provide(LabelContext, { register })

        return () => slots.default!()
      },
    }),
  ]
}

// ---

export let Label = defineComponent({
  name: 'Label',
  props: {
    as: { type: [Object, String], default: 'label' },
  },
  render() {
    let passThroughProps = this.$props
    let propsWeControl = { id: this.id }

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'Label',
    })
  },
  setup() {
    let { register } = useLabelContext()
    let id = `headlessui-label-${useId()}`

    onMounted(() => onUnmounted(register(id)))

    return { id }
  },
})
