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
} from 'vue'
import { render } from '../../utils/render'
import { usePortalRoot } from '../../internal/portal-force-root'

// ---

function getPortalRoot() {
  let existingRoot = document.getElementById('headlessui-portal-root')
  if (existingRoot) return existingRoot

  let root = document.createElement('div')
  root.setAttribute('id', 'headlessui-portal-root')
  return document.body.appendChild(root)
}

export let Portal = defineComponent({
  name: 'Portal',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs }) {
    let forcePortalRoot = usePortalRoot()
    let groupContext = inject(PortalGroupContext, null)
    let myTarget = ref(
      forcePortalRoot === true
        ? getPortalRoot()
        : groupContext === null
        ? getPortalRoot()
        : groupContext.resolveTarget()
    )

    watchEffect(() => {
      if (forcePortalRoot) return
      if (groupContext === null) return
      myTarget.value = groupContext.resolveTarget()
    })

    let element = ref(null)

    onUnmounted(() => {
      let root = document.getElementById('headlessui-portal-root')
      if (!root) return
      if (myTarget.value !== root) return

      if (myTarget.value.children.length <= 0) {
        myTarget.value.parentElement?.removeChild(myTarget.value)
      }
    })

    return () => {
      if (myTarget.value === null) return null

      let propsWeControl = {
        ref: element,
      }

      return h(
        // @ts-expect-error Children can be an object, but TypeScript is not happy
        // with it. Once this is fixed upstream we can remove this assertion.
        Teleport,
        { to: myTarget.value },
        render({
          props: { ...props, ...propsWeControl },
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
      let { target: _, ...passThroughProps } = props

      return render({ props: passThroughProps, slot: {}, attrs, slots, name: 'PortalGroup' })
    }
  },
})
