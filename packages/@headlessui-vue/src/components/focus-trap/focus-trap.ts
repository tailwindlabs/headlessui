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
  render() {
    let slot = {}
    let propsWeControl = { ref: 'el' }
    let { initialFocus, ...passThroughProps } = this.$props

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'FocusTrap',
    })
  },
  setup(props) {
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

    return { el: container }
  },
})
