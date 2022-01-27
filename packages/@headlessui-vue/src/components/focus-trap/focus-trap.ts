import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,

  // Types
  PropType,
} from 'vue'
import { render } from '../../utils/render'
import { useFocusTrap } from '../../hooks/use-focus-trap'

export let FocusTrap = defineComponent({
  name: 'FocusTrap',
  props: {
    as: { type: [Object, String], default: 'div' },
    initialFocus: { type: Object as PropType<HTMLElement | null>, default: null },
  },
  setup(props, { attrs, slots }) {
    let containers = ref(new Set<HTMLElement>())
    let container = ref<HTMLElement | null>(null)
    let enabled = ref(true)
    let focusTrapOptions = computed(() => ({ initialFocus: props.initialFocus }))

    onMounted(() => {
      if (!container.value) return
      containers.value.add(container.value)

      useFocusTrap(containers, enabled, focusTrapOptions)
    })

    onUnmounted(() => {
      enabled.value = false
    })

    return () => {
      let slot = {}
      let propsWeControl = { ref: container }
      let { initialFocus, ...passThroughProps } = props

      return render({
        props: { ...passThroughProps, ...propsWeControl },
        slot,
        attrs,
        slots,
        name: 'FocusTrap',
      })
    }
  },
})
