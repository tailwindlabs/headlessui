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
  Ref,
} from 'vue'

import { useId } from '../../hooks/use-id'
import { render } from '../../utils/render'

// ---

let DescriptionContext = Symbol('DescriptionContext') as InjectionKey<{
  register(value: string): () => void
  slot: Ref<Record<string, any>>
  name: Ref<string>
  props: Ref<Record<string, any>>
}>

function useDescriptionContext() {
  let context = inject(DescriptionContext, null)
  if (context === null) {
    throw new Error('Missing parent')
  }
  return context
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
      props: ['slot', 'name', 'props'],
      setup(props, { slots }) {
        function register(value: string) {
          descriptionIds.value.push(value)

          return () => {
            let idx = descriptionIds.value.indexOf(value)
            if (idx === -1) return
            descriptionIds.value.splice(idx, 1)
          }
        }

        provide(DescriptionContext, {
          register,
          slot: computed(() => props.slot),
          name: computed(() => props.name),
          props: computed(() => props.props),
        })

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
    let propsWeControl = { ...this.props, id: this.id }

    return render({
      props: { ...this.props, ...passThroughProps, ...propsWeControl },
      slot: this.slot || {},
      attrs: this.$attrs,
      slots: this.$slots,
      name: this.name || 'Description',
    })
  },
  setup() {
    let { register, slot, name, props } = useDescriptionContext()
    let id = `headlessui-description-${useId()}`

    onMounted(() => onUnmounted(register(id)))

    return { id, slot, name, props }
  },
})
