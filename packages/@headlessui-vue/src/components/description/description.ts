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
  slot: Record<string, any>
}>

function useDescriptionContext() {
  return inject(DescriptionContext, {
    register() {
      return () => {}
    },
    slot: {},
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
      props: ['slot'],
      setup(props, { slots }) {
        function register(value: string) {
          descriptionIds.value.push(value)

          return () => {
            let idx = descriptionIds.value.indexOf(value)
            if (idx === -1) return
            descriptionIds.value.splice(idx, 1)
          }
        }

        let slot = computed(() => props.slot)

        provide(DescriptionContext, { register, slot })

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
      slot: this.slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'Description',
    })
  },
  setup() {
    let { register, slot } = useDescriptionContext()
    let id = `headlessui-description-${useId()}`

    onMounted(() => onUnmounted(register(id)))

    return { id, slot }
  },
})
