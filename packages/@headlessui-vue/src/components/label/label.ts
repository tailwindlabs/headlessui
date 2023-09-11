import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  unref,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import { useId } from '../../hooks/use-id'
import { render } from '../../utils/render'

// ---

let LabelContext = Symbol('LabelContext') as InjectionKey<{
  register(value: string): () => void
  slot: Record<string, unknown>
  name: string
  props: Record<string, unknown>
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

export function useLabels({
  slot = {},
  name = 'Label',
  props = {},
}: {
  slot?: Record<string, unknown>
  name?: string
  props?: Record<string, unknown>
} = {}): ComputedRef<string | undefined> {
  let labelIds = ref<string[]>([])
  function register(value: string) {
    labelIds.value.push(value)

    return () => {
      let idx = labelIds.value.indexOf(value)
      if (idx === -1) return
      labelIds.value.splice(idx, 1)
    }
  }

  provide(LabelContext, { register, slot, name, props })

  // The actual id's as string or undefined.
  return computed(() => (labelIds.value.length > 0 ? labelIds.value.join(' ') : undefined))
}

// ---

export let Label = defineComponent({
  name: 'Label',
  props: {
    as: { type: [Object, String], default: 'label' },
    passive: { type: [Boolean], default: false },
    id: { type: String, default: () => `headlessui-label-${useId()}` },
  },
  setup(myProps, { slots, attrs }) {
    let context = useLabelContext()

    onMounted(() => onUnmounted(context.register(myProps.id)))

    return () => {
      let { name = 'Label', slot = {}, props = {} } = context
      let { id, passive, ...theirProps } = myProps
      let ourProps = {
        ...Object.entries(props).reduce(
          (acc, [key, value]) => Object.assign(acc, { [key]: unref(value) }),
          {}
        ),
        id,
      }

      if (passive) {
        // @ts-expect-error props are dynamic via context, some components will provide an onClick
        // then we can delete it.
        delete ourProps['onClick']

        // @ts-expect-error props are dynamic via context, some components will provide an htmlFor
        // then we can delete it.
        delete ourProps['htmlFor']

        // @ts-expect-error props are dynamic via context, some components will provide an onClick
        // then we can delete it.
        delete theirProps['onClick']
      }

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name,
      })
    }
  },
})
