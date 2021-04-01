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

let DescriptionContext = Symbol('DescriptionContext') as InjectionKey<{
  register(value: string): () => void
}>

function useDescriptionContext() {
  return inject(DescriptionContext, {
    register() {
      return () => {}
    },
  })
}

export function useDescriptions(): [
  ComputedRef<string | undefined>,
  ReturnType<typeof defineComponent>
] {
  let descriptionIds = ref<string[]>([])

  return [
    // The actual id's as string or undefined.
    computed(() => (descriptionIds.value.length > 0 ? descriptionIds.value.join(' ') : undefined)),

    // The provider component
    defineComponent({
      name: 'DescriptionProvider',
      setup(_props, { slots }) {
        function register(value: string) {
          descriptionIds.value.push(value)

          return () => {
            let idx = descriptionIds.value.indexOf(value)
            if (idx === -1) return
            descriptionIds.value.splice(idx, 1)
          }
        }

        provide(DescriptionContext, { register })

        return () => slots.default!()
      },
    }),
  ]
}

// ---

export let Description = defineComponent({
  name: 'Description',
  props: {
    as: { type: [Object, String], default: 'p' },
  },
  render() {
    let passThroughProps = this.$props
    let propsWeControl = { id: this.id }

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    let { register } = useDescriptionContext()
    let id = `headlessui-description-${useId()}`

    onMounted(() => onUnmounted(register(id)))

    return { id }
  },
})
