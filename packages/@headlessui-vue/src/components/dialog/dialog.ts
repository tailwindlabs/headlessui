// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
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
import { useFocusTrap, Features as FocusTrapFeatures } from '../../hooks/use-focus-trap'
import { useInertOthers } from '../../hooks/use-inert-others'
import { Portal, PortalGroup } from '../portal/portal'
import { StackMessage, useStackProvider } from '../../internal/stack-context'
import { match } from '../../utils/match'
import { ForcePortalRoot } from '../../internal/portal-force-root'
import { Description, useDescriptions } from '../description/description'
import { dom } from '../../utils/dom'
import { useOpenClosed, State } from '../../internal/open-closed'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { getOwnerDocument } from '../../utils/owner'
import { useEventListener } from '../../hooks/use-event-listener'

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
    open: { type: [Boolean, String], default: Missing },
    initialFocus: { type: Object as PropType<HTMLElement | null>, default: null },
  },
  emits: { close: (_close: boolean) => true },
  setup(props, { emit, attrs, slots }) {
    let nestedDialogCount = ref(0)

    let usesOpenClosedState = useOpenClosed()
    let open = computed(() => {
      if (props.open === Missing && usesOpenClosedState !== null) {
        // Update the `open` prop based on the open closed state
        return match(usesOpenClosedState.value, {
          [State.Open]: true,
          [State.Closed]: false,
        })
      }
      return props.open
    })

    let containers = ref<Set<Ref<HTMLElement | null>>>(new Set())
    let internalDialogRef = ref<HTMLDivElement | null>(null)
    let ownerDocument = computed(() => getOwnerDocument(internalDialogRef))

    // Validations
    let hasOpen = props.open !== Missing || usesOpenClosedState !== null

    if (!hasOpen) {
      throw new Error(`You forgot to provide an \`open\` prop to the \`Dialog\`.`)
    }

    if (typeof open.value !== 'boolean') {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${
          open.value === Missing ? undefined : props.open
        }`
      )
    }

    let dialogState = computed(() => (open.value ? DialogStates.Open : DialogStates.Closed))
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return dialogState.value === DialogStates.Open
    })

    let enabled = computed(() => dialogState.value === DialogStates.Open)

    let hasNestedDialogs = computed(() => nestedDialogCount.value > 1) // 1 is the current dialog
    let hasParentDialog = inject(DialogContext, null) !== null

    // If there are multiple dialogs, then you can be the root, the leaf or one
    // in between. We only care abou whether you are the top most one or not.
    let position = computed(() => (!hasNestedDialogs.value ? 'leaf' : 'parent'))

    useFocusTrap(
      internalDialogRef,
      computed(() => {
        return enabled.value
          ? match(position.value, {
              parent: FocusTrapFeatures.RestoreFocus,
              leaf: FocusTrapFeatures.All & ~FocusTrapFeatures.FocusLock,
            })
          : FocusTrapFeatures.None
      }),
      computed(() => ({
        initialFocus: ref(props.initialFocus),
        containers,
      }))
    )
    useInertOthers(
      internalDialogRef,
      computed(() => (hasNestedDialogs.value ? enabled.value : false))
    )
    useStackProvider({
      type: 'Dialog',
      element: internalDialogRef,
      onUpdate: (message, type, element) => {
        if (type !== 'Dialog') return

        return match(message, {
          [StackMessage.Add]() {
            containers.value.add(element)
            nestedDialogCount.value += 1
          },
          [StackMessage.Remove]() {
            containers.value.delete(element)
            nestedDialogCount.value -= 1
          },
        })
      },
    })

    let describedby = useDescriptions({
      name: 'DialogDescription',
      slot: computed(() => ({ open: open.value })),
    })

    let id = `headlessui-dialog-${useId()}`

    let titleId = ref<StateDefinition['titleId']['value']>(null)

    let api = {
      titleId,
      dialogState,
      setTitleId(id: string | null) {
        if (titleId.value === id) return
        titleId.value = id
      },
      close() {
        emit('close', false)
      },
    }

    provide(DialogContext, api)

    // Handle outside click
    useOutsideClick(internalDialogRef, (_event, target) => {
      if (dialogState.value !== DialogStates.Open) return
      if (hasNestedDialogs.value) return

      api.close()
      nextTick(() => target?.focus())
    })

    // Handle `Escape` to close
    useEventListener(ownerDocument.value?.defaultView, 'keydown', (event) => {
      if (event.key !== Keys.Escape) return
      if (dialogState.value !== DialogStates.Open) return
      if (hasNestedDialogs.value) return
      event.preventDefault()
      event.stopPropagation()
      api.close()
    })

    // Scroll lock
    watchEffect((onInvalidate) => {
      if (dialogState.value !== DialogStates.Open) return
      if (hasParentDialog) return

      let owner = ownerDocument.value
      if (!owner) return

      let documentElement = owner?.documentElement
      let ownerWindow = owner.defaultView ?? window

      let overflow = documentElement.style.overflow
      let paddingRight = documentElement.style.paddingRight

      let scrollbarWidth = ownerWindow.innerWidth - documentElement.clientWidth

      documentElement.style.overflow = 'hidden'
      documentElement.style.paddingRight = `${scrollbarWidth}px`

      onInvalidate(() => {
        documentElement.style.overflow = overflow
        documentElement.style.paddingRight = paddingRight
      })
    })

    // Trigger close when the FocusTrap gets hidden
    watchEffect((onInvalidate) => {
      if (dialogState.value !== DialogStates.Open) return
      let container = dom(internalDialogRef)
      if (!container) return

      let observer = new IntersectionObserver((entries) => {
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

      observer.observe(container)

      onInvalidate(() => observer.disconnect())
    })

    function handleClick(event: MouseEvent) {
      event.stopPropagation()
    }

    return () => {
      let propsWeControl = {
        // Manually passthrough the attributes, because Vue can't automatically pass
        // it to the underlying div because of all the wrapper components below.
        ...attrs,
        ref: internalDialogRef,
        id,
        role: 'dialog',
        'aria-modal': dialogState.value === DialogStates.Open ? true : undefined,
        'aria-labelledby': titleId.value,
        'aria-describedby': describedby.value,
        onClick: handleClick,
      }
      let { open: _, initialFocus, ...passThroughProps } = props

      let slot = { open: dialogState.value === DialogStates.Open }

      return h(ForcePortalRoot, { force: true }, () =>
        h(Portal, () =>
          h(PortalGroup, { target: internalDialogRef.value }, () =>
            h(ForcePortalRoot, { force: false }, () =>
              render({
                props: { ...passThroughProps, ...propsWeControl },
                slot,
                attrs,
                slots,
                visible: visible.value,
                features: Features.RenderStrategy | Features.Static,
                name: 'Dialog',
              })
            )
          )
        )
      )
    }
  },
})

// ---

export let DialogOverlay = defineComponent({
  name: 'DialogOverlay',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots }) {
    let api = useDialogContext('DialogOverlay')
    let id = `headlessui-dialog-overlay-${useId()}`

    function handleClick(event: MouseEvent) {
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      event.stopPropagation()
      api.close()
    }

    return () => {
      let propsWeControl = {
        id,
        'aria-hidden': true,
        onClick: handleClick,
      }
      let passThroughProps = props

      return render({
        props: { ...passThroughProps, ...propsWeControl },
        slot: { open: api.dialogState.value === DialogStates.Open },
        attrs,
        slots,
        name: 'DialogOverlay',
      })
    }
  },
})

// ---

export let DialogTitle = defineComponent({
  name: 'DialogTitle',
  props: {
    as: { type: [Object, String], default: 'h2' },
  },
  setup(props, { attrs, slots }) {
    let api = useDialogContext('DialogTitle')
    let id = `headlessui-dialog-title-${useId()}`

    onMounted(() => {
      api.setTitleId(id)
      onUnmounted(() => api.setTitleId(null))
    })

    return () => {
      let propsWeControl = { id }
      let passThroughProps = props

      return render({
        props: { ...passThroughProps, ...propsWeControl },
        slot: { open: api.dialogState.value === DialogStates.Open },
        attrs,
        slots,
        name: 'DialogTitle',
      })
    }
  },
})

// ---

export let DialogDescription = Description
