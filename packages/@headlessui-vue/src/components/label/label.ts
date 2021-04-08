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

let LabelContext = Symbol('LabelContext') as InjectionKey<{
  register(value: string): () => void
  slot: Ref<Record<string, unknown>>
  name: Ref<string>
  props: Ref<Record<string, unknown>>
}>

function useLabelContext() {
  let context = inject(LabelContext, null)
  if (context === null) {
    let err = new Error('You used a <Label /> component, but it is not inside a parent.')
    if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext)
    throw err
  }
  return context
}

export function useLabels(): [ComputedRef<string | undefined>, ReturnType<typeof defineComponent>] {
  let labelIds = ref<string[]>([])

  return [
    // The actual id's as string or undefined.
    computed(() => (labelIds.value.length > 0 ? labelIds.value.join(' ') : undefined)),

    // The provider component
    // @ts-expect-error The DefineComponent of Vue is just too confusing
    defineComponent({
      name: 'LabelProvider',
      props: {
        slot: { type: Object, default: undefined },
        name: { type: String, default: undefined },
        props: { type: Object, default: undefined },
      },
      setup(props, { slots }) {
        function register(value: string) {
          labelIds.value.push(value)

          return () => {
            let idx = labelIds.value.indexOf(value)
            if (idx === -1) return
            labelIds.value.splice(idx, 1)
          }
        }

        provide(LabelContext, {
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

export let Label = defineComponent({
  name: 'Label',
  props: {
    as: { type: [Object, String], default: 'label' },
    clickable: { type: [Boolean], default: false },
  },
  render() {
    let { clickable, ...passThroughProps } = this.$props
    let propsWeControl = { ...this.props, id: this.id }
    let allProps = { ...passThroughProps, ...propsWeControl }

    // @ts-expect-error props are dynamic via context, some components will
    //                  provide an onClick then we can delete it.
    if (!clickable) delete allProps['onClick']

    return render({
      props: allProps,
      slot: this.slot || {},
      attrs: this.$attrs,
      slots: this.$slots,
      name: this.name || 'Label',
    })
  },
  setup() {
    let { register, slot, name, props } = useLabelContext()
    let id = `headlessui-label-${useId()}`

    onMounted(() => onUnmounted(register(id)))

    return { id, slot, name, props }
  },
})
