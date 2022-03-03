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
    let container = ref<HTMLElement | null>(null)

    let focusTrapOptions = computed(() => ({ initialFocus: ref(props.initialFocus) }))
    useFocusTrap(container, FocusTrap.All, focusTrapOptions)

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
