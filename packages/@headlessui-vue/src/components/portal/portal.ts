import {
  Teleport,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  watch,
  watchEffect,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue'
import { usePortalRoot } from '../../internal/portal-force-root'
import { dom } from '../../utils/dom'
import { getOwnerDocument } from '../../utils/owner'
import { render } from '../../utils/render'

type ContextType<T> = T extends InjectionKey<infer V> ? V : never

// ---

function getPortalRoot(contextElement?: HTMLElement | null) {
  let ownerDocument = getOwnerDocument(contextElement)
  if (!ownerDocument) {
    if (contextElement === null) {
      return null
    }

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

    let ready = ref(false)
    onMounted(() => {
      ready.value = true
    })

    watchEffect(() => {
      if (forcePortalRoot) return
      if (groupContext == null) return
      myTarget.value = groupContext.resolveTarget()
    })

    let parent = inject(PortalParentContext, null)

    // Since the element is mounted lazily (because of SSR hydration)
    // We use `watch` on `element` + a local var rather than
    // `onMounted` to ensure registration only happens once
    let didRegister = false
    let instance = getCurrentInstance()
    watch(element, () => {
      if (didRegister) return
      if (!parent) return
      let domElement = dom(element)
      if (!domElement) return
      onUnmounted(parent.register(domElement), instance)
      didRegister = true
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
      if (!ready.value) return null
      if (myTarget.value === null) return null

      let ourProps = {
        ref: element,
        'data-headlessui-portal': '',
      }

      return h(
        // @ts-expect-error Children can be an object, but TypeScript is not happy
        // with it. Once this is fixed upstream we can remove this assertion.
        Teleport,
        { to: myTarget.value },
        render({
          ourProps,
          theirProps: props,
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

let PortalParentContext = Symbol('PortalParentContext') as InjectionKey<{
  register: (portal: HTMLElement) => () => void
  unregister: (portal: HTMLElement) => void
  portals: Ref<HTMLElement[]>
}>

export function useNestedPortals() {
  let parent = inject(PortalParentContext, null)
  let portals = ref<HTMLElement[]>([])

  function register(portal: HTMLElement) {
    portals.value.push(portal)
    if (parent) parent.register(portal)
    return () => unregister(portal)
  }

  function unregister(portal: HTMLElement) {
    let idx = portals.value.indexOf(portal)
    if (idx !== -1) portals.value.splice(idx, 1)
    if (parent) parent.unregister(portal)
  }

  let api = {
    register,
    unregister,
    portals,
  } as ContextType<typeof PortalParentContext>

  return [
    portals,
    defineComponent({
      name: 'PortalWrapper',
      setup(_, { slots }) {
        provide(PortalParentContext, api)
        return () => slots.default?.()
      },
    }),
  ] as const
}

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
      let { target: _, ...theirProps } = props

      return render({
        theirProps,
        ourProps: {},
        slot: {},
        attrs,
        slots,
        name: 'PortalGroup',
      })
    }
  },
})
