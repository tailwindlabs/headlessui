// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  onUpdated,
  provide,
  ref,
  watchEffect,

  // Types
  InjectionKey,
  PropType,
  Ref,
} from 'vue'

import { render, Features } from '../../utils/render'
import { Keys } from '../../keyboard'
import { useId } from '../../hooks/use-id'
import { useFocusTrap } from '../../hooks/use-focus-trap'
import { useInertOthers } from '../../hooks/use-inert-others'
import { contains } from '../../internal/dom-containers'
import { useWindowEvent } from '../../hooks/use-window-event'
import { Portal, PortalGroup } from '../portal/portal'
import { StackProvider, StackMessage } from '../../internal/stack-context'
import { match } from '../../utils/match'
import { ForcePortalRoot } from '../../internal/portal-force-root'
import { Description, useDescriptions } from '../description/description'

enum DialogStates {
  Open,
  Closed,
}

interface StateDefinition {
  dialogState: Ref<DialogStates>

  titleId: Ref<string | null>

  setTitleId(id: string | null): void

  close(): void
}

let DialogContext = Symbol('DialogContext') as InjectionKey<StateDefinition>

function useDialogContext(component: string) {
  let context = inject(DialogContext, null)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Dialog /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext)
    throw err
  }
  return context
}

// ---

let Missing = 'DC8F892D-2EBD-447C-A4C8-A03058436FF4'

export let Dialog = defineComponent({
  name: 'Dialog',
  inheritAttrs: false, // Manually handling this
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    open: { type: Boolean, default: Missing },
    onClose: { type: Function, default: Missing },
    initialFocus: { type: Object as PropType<HTMLElement | null>, default: null },
  },
  render() {
    let propsWeControl = {
      // Manually passthrough the attributes, because Vue can't automatically pass
      // it to the underlying div because of all the wrapper components below.
      ...this.$attrs,
      ref: 'el',
      id: this.id,
      role: 'dialog',
      'aria-modal': this.dialogState === DialogStates.Open ? true : undefined,
      'aria-labelledby': this.titleId,
      'aria-describedby': this.describedby,
    }
    let { open, onClose, initialFocus, ...passThroughProps } = this.$props
    let containers = this.containers

    let slot = { open: this.dialogState === DialogStates.Open }

    return h(
      StackProvider,
      {
        onUpdate(message, element) {
          return match(message, {
            [StackMessage.AddElement]() {
              containers.add(element)
            },
            [StackMessage.RemoveElement]() {
              containers.delete(element)
            },
          })
        },
      },
      () => [
        h(ForcePortalRoot, { force: true }, () => [
          h(Portal, {}, () => [
            h(PortalGroup, { target: this.dialogRef }, () => [
              h(ForcePortalRoot, { force: false }, () => [
                h(this.DescriptionProvider, { slot }, () => [
                  render({
                    props: { ...passThroughProps, ...propsWeControl },
                    slot,
                    attrs: this.$attrs,
                    slots: this.$slots,
                    visible: open,
                    features: Features.RenderStrategy | Features.Static,
                    name: 'Dialog',
                  }),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]
    )
  },
  setup(props) {
    let containers = ref<Set<HTMLElement>>(new Set())

    // Validations
    // @ts-expect-error We are comparing to a uuid stirng at runtime
    let hasOpen = props.open !== Missing
    // @ts-expect-error We are comparing to a uuid string at runtime
    let hasOnClose = props.onClose !== Missing
    if (!hasOpen && !hasOnClose) {
      throw new Error(
        `You have to provide an \`open\` and an \`onClose\` prop to the \`Dialog\` component.`
      )
    }

    if (!hasOpen) {
      throw new Error(
        `You provided an \`onClose\` prop to the \`Dialog\`, but forgot an \`open\` prop.`
      )
    }

    if (!hasOnClose) {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onClose\` prop.`
      )
    }

    if (typeof props.open !== 'boolean') {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${
          props.open === Missing ? undefined : props.open
        }`
      )
    }

    if (typeof props.onClose !== 'function') {
      throw new Error(
        `You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${
          props.onClose === Missing ? undefined : props.onClose
        }`
      )
    }

    let dialogState = computed(() => (props.open ? DialogStates.Open : DialogStates.Closed))
    let internalDialogRef = ref<HTMLDivElement | null>(null)
    let enabled = ref(dialogState.value === DialogStates.Open)

    onUpdated(() => {
      enabled.value = dialogState.value === DialogStates.Open
    })

    let id = `headlessui-dialog-${useId()}`
    let focusTrapOptions = computed(() => ({ initialFocus: props.initialFocus }))

    useFocusTrap(containers, enabled, focusTrapOptions)
    useInertOthers(internalDialogRef, enabled)
    let [describedby, DescriptionProvider] = useDescriptions()

    let titleId = ref<StateDefinition['titleId']['value']>(null)

    let api = {
      titleId,
      dialogState,
      setTitleId(id: string | null) {
        if (titleId.value === id) return
        titleId.value = id
      },
      close() {
        props.onClose!(false)
      },
    }

    provide(DialogContext, api)

    // Handle outside click
    useWindowEvent('mousedown', event => {
      let target = event.target as HTMLElement

      if (dialogState.value !== DialogStates.Open) return
      if (containers.value.size !== 1) return
      if (contains(containers.value, target)) return

      api.close()
      nextTick(() => {
        target?.focus()
      })
    })

    // Handle `Escape` to close
    useWindowEvent('keydown', event => {
      if (event.key !== Keys.Escape) return
      if (dialogState.value !== DialogStates.Open) return
      if (containers.value.size > 1) return // 1 is myself, otherwise other elements in the Stack
      api.close()
    })

    // Scroll lock
    watchEffect(onInvalidate => {
      if (dialogState.value !== DialogStates.Open) return

      let overflow = document.documentElement.style.overflow
      let paddingRight = document.documentElement.style.paddingRight

      let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      document.documentElement.style.overflow = 'hidden'
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`

      onInvalidate(() => {
        document.documentElement.style.overflow = overflow
        document.documentElement.style.paddingRight = paddingRight
      })
    })

    // Trigger close when the FocusTrap gets hidden
    watchEffect(onInvalidate => {
      if (dialogState.value !== DialogStates.Open) return
      if (!internalDialogRef.value) return

      let observer = new IntersectionObserver(entries => {
        for (let entry of entries) {
          if (
            entry.boundingClientRect.x === 0 &&
            entry.boundingClientRect.y === 0 &&
            entry.boundingClientRect.width === 0 &&
            entry.boundingClientRect.height === 0
          ) {
            api.close()
          }
        }
      })

      observer.observe(internalDialogRef.value)

      onInvalidate(() => observer.disconnect())
    })

    return {
      id,
      el: internalDialogRef,
      dialogRef: internalDialogRef,
      containers,
      dialogState,
      titleId,
      describedby,
      DescriptionProvider,
    }
  },
})

// ---

export let DialogOverlay = defineComponent({
  name: 'DialogOverlay',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  render() {
    let api = useDialogContext('DialogOverlay')
    let propsWeControl = {
      ref: 'el',
      id: this.id,
      'aria-hidden': true,
      onClick: this.handleClick,
    }
    let passThroughProps = this.$props

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot: { open: api.dialogState.value === DialogStates.Open },
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'DialogOverlay',
    })
  },
  setup() {
    let api = useDialogContext('DialogOverlay')
    let id = `headlessui-dialog-overlay-${useId()}`

    return {
      id,
      handleClick() {
        api.close()
      },
    }
  },
})

// ---

export let DialogTitle = defineComponent({
  name: 'DialogTitle',
  props: {
    as: { type: [Object, String], default: 'h2' },
  },
  render() {
    let api = useDialogContext('DialogTitle')
    let propsWeControl = { id: this.id }
    let passThroughProps = this.$props

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot: { open: api.dialogState.value === DialogStates.Open },
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'DialogTitle',
    })
  },
  setup() {
    let api = useDialogContext('DialogTitle')
    let id = `headlessui-dialog-title-${useId()}`

    onMounted(() => {
      api.setTitleId(id)
      onUnmounted(() => api.setTitleId(null))
    })

    return { id }
  },
})

// ---

export let DialogDescription = Description
