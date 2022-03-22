import {
  Teleport,
  defineComponent,
  h,
  inject,
  onUnmounted,
  provide,
  reactive,
  ref,
  watchEffect,

  // Types
  InjectionKey,
  PropType,
  computed,
} from 'vue'
import { render } from '../../utils/render'
import { usePortalRoot } from '../../internal/portal-force-root'
import { getOwnerDocument } from '../../utils/owner'

// ---

function getPortalRoot(contextElement?: Element | null) {
  let ownerDocument = getOwnerDocument(contextElement)
  if (!ownerDocument) {
    throw new Error(
      `[Headless UI]: Cannot find ownerDocument for contextElement: ${contextElement}`
    )
  }
  let existingRoot = ownerDocument.getElementById('headlessui-portal-root')
  if (existingRoot) return existingRoot

  let root = ownerDocument.createElement('div')
  root.setAttribute('id', 'headlessui-portal-root')
  return ownerDocument.body.appendChild(root)
}

export let Portal = defineComponent({
  name: 'Portal',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs }) {
    let element = ref<HTMLElement | null>(null)
    let ownerDocument = computed(() => getOwnerDocument(element))

    let forcePortalRoot = usePortalRoot()
    let groupContext = inject(PortalGroupContext, null)
    let myTarget = ref(
      forcePortalRoot === true
        ? getPortalRoot(element.value)
        : groupContext == null
        ? getPortalRoot(element.value)
        : groupContext.resolveTarget()
    )

    watchEffect(() => {
      if (forcePortalRoot) return
      if (groupContext == null) return
      myTarget.value = groupContext.resolveTarget()
    })

    onUnmounted(() => {
      let root = ownerDocument.value?.getElementById('headlessui-portal-root')
      if (!root) return
      if (myTarget.value !== root) return

      if (myTarget.value.children.length <= 0) {
        myTarget.value.parentElement?.removeChild(myTarget.value)
      }
    })

    return () => {
      if (myTarget.value === null) return null

      let ourProps = {
        ref: element,
      }

      return h(
        // @ts-expect-error Children can be an object, but TypeScript is not happy
        // with it. Once this is fixed upstream we can remove this assertion.
        Teleport,
        { to: myTarget.value },
        render({
          props: { ...props, ...ourProps },
          slot: {},
          attrs,
          slots,
          name: 'Portal',
        })
      )
    }
  },
})

// ---

let PortalGroupContext = Symbol('PortalGroupContext') as InjectionKey<{
  resolveTarget(): HTMLElement | null
}>

export let PortalGroup = defineComponent({
  name: 'PortalGroup',
  props: {
    as: { type: [Object, String], default: 'template' },
    target: { type: Object as PropType<HTMLElement | null>, default: null },
  },
  setup(props, { attrs, slots }) {
    let api = reactive({
      resolveTarget() {
        return props.target
      },
    })

    provide(PortalGroupContext, api)

    return () => {
      let { target: _, ...incomingProps } = props

      return render({ props: incomingProps, slot: {}, attrs, slots, name: 'PortalGroup' })
    }
  },
})
