// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
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
import { FocusTrap } from '../../components/focus-trap/focus-trap'
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
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { useDocumentOverflowLockedEffect } from '../../hooks/document-overflow/use-document-overflow'
import { handleIOSLocking } from '../../hooks/document-overflow/handle-ios-locking'

enum DialogStates {
  Open,
  Closed,
}

interface StateDefinition {
  dialogState: Ref<DialogStates>

  titleId: Ref<string | null>
  panelRef: Ref<HTMLDivElement | null>

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
    id: { type: String, default: () => `headlessui-dialog-${useId()}` },
  },
  emits: { close: (_close: boolean) => true },
  setup(props, { emit, attrs, slots, expose }) {
    let ready = ref(false)
    onMounted(() => {
      ready.value = true
    })

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

    // Reference to a node in the "main" tree, not in the portalled Dialog tree.
    let mainTreeNode = ref<HTMLDivElement | null>(null)

    let ownerDocument = computed(() => getOwnerDocument(internalDialogRef))

    expose({ el: internalDialogRef, $el: internalDialogRef })

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

    let dialogState = computed(() =>
      !ready.value ? DialogStates.Closed : open.value ? DialogStates.Open : DialogStates.Closed
    )
    let enabled = computed(() => dialogState.value === DialogStates.Open)

    let hasNestedDialogs = computed(() => nestedDialogCount.value > 1) // 1 is the current dialog
    let hasParentDialog = inject(DialogContext, null) !== null

    // If there are multiple dialogs, then you can be the root, the leaf or one
    // in between. We only care abou whether you are the top most one or not.
    let position = computed(() => (!hasNestedDialogs.value ? 'leaf' : 'parent'))

    useInertOthers(
      internalDialogRef,
      computed(() => (hasNestedDialogs.value ? enabled.value : false))
    )
    useStackProvider({
      type: 'Dialog',
      enabled: computed(() => dialogState.value === DialogStates.Open),
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

    let titleId = ref<StateDefinition['titleId']['value']>(null)

    let api = {
      titleId,
      panelRef: ref(null),
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

    function resolveAllowedContainers() {
      // Third party roots
      let rootContainers = Array.from(
        ownerDocument.value?.querySelectorAll('html > *, body > *, [data-headlessui-portal]') ?? []
      ).filter((container) => {
        if (container === document.body) return false // Skip `<body>`
        if (container === document.head) return false // Skip `<head>`
        if (!(container instanceof HTMLElement)) return false // Skip non-HTMLElements
        if (container.contains(dom(mainTreeNode))) return false // Skip if it is the main app
        if (api.panelRef.value && container.contains(api.panelRef.value)) return false
        return true // Keep
      })

      return [...rootContainers, api.panelRef.value ?? internalDialogRef.value] as HTMLElement[]
    }

    // Handle outside click
    useOutsideClick(
      () => resolveAllowedContainers(),
      (_event, target) => {
        api.close()
        nextTick(() => target?.focus())
      },
      computed(() => dialogState.value === DialogStates.Open && !hasNestedDialogs.value)
    )

    // Handle `Escape` to close
    useEventListener(ownerDocument.value?.defaultView, 'keydown', (event) => {
      if (event.defaultPrevented) return
      if (event.key !== Keys.Escape) return
      if (dialogState.value !== DialogStates.Open) return
      if (hasNestedDialogs.value) return
      event.preventDefault()
      event.stopPropagation()
      api.close()
    })

    // Scroll lock
    useDocumentOverflowLockedEffect(ownerDocument, enabled, (d) => [
      handleIOSLocking(d, resolveAllowedContainers),
    ])

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

    return () => {
      let { id, open: _, initialFocus, ...theirProps } = props
      let ourProps = {
        // Manually passthrough the attributes, because Vue can't automatically pass
        // it to the underlying div because of all the wrapper components below.
        ...attrs,
        ref: internalDialogRef,
        id,
        role: 'dialog',
        'aria-modal': dialogState.value === DialogStates.Open ? true : undefined,
        'aria-labelledby': titleId.value,
        'aria-describedby': describedby.value,
      }

      let slot = { open: dialogState.value === DialogStates.Open }

      return h(ForcePortalRoot, { force: true }, () => [
        h(Portal, () =>
          h(PortalGroup, { target: internalDialogRef.value }, () =>
            h(ForcePortalRoot, { force: false }, () =>
              h(
                FocusTrap,
                {
                  initialFocus,
                  containers,
                  features: enabled.value
                    ? match(position.value, {
                        parent: FocusTrap.features.RestoreFocus,
                        leaf: FocusTrap.features.All & ~FocusTrap.features.FocusLock,
                      })
                    : FocusTrap.features.None,
                },
                () =>
                  render({
                    ourProps,
                    theirProps,
                    slot,
                    attrs,
                    slots,
                    visible: dialogState.value === DialogStates.Open,
                    features: Features.RenderStrategy | Features.Static,
                    name: 'Dialog',
                  })
              )
            )
          )
        ),
        h(Hidden, { features: HiddenFeatures.Hidden, ref: mainTreeNode }),
      ])
    }
  },
})

// ---

export let DialogOverlay = defineComponent({
  name: 'DialogOverlay',
  props: {
    as: { type: [Object, String], default: 'div' },
    id: { type: String, default: () => `headlessui-dialog-overlay-${useId()}` },
  },
  setup(props, { attrs, slots }) {
    let api = useDialogContext('DialogOverlay')

    function handleClick(event: MouseEvent) {
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      event.stopPropagation()
      api.close()
    }

    return () => {
      let { id, ...theirProps } = props
      let ourProps = {
        id,
        'aria-hidden': true,
        onClick: handleClick,
      }

      return render({
        ourProps,
        theirProps,
        slot: { open: api.dialogState.value === DialogStates.Open },
        attrs,
        slots,
        name: 'DialogOverlay',
      })
    }
  },
})

// ---

export let DialogBackdrop = defineComponent({
  name: 'DialogBackdrop',
  props: {
    as: { type: [Object, String], default: 'div' },
    id: { type: String, default: () => `headlessui-dialog-backdrop-${useId()}` },
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let api = useDialogContext('DialogBackdrop')
    let internalBackdropRef = ref(null)

    expose({ el: internalBackdropRef, $el: internalBackdropRef })

    onMounted(() => {
      if (api.panelRef.value === null) {
        throw new Error(
          `A <DialogBackdrop /> component is being used, but a <DialogPanel /> component is missing.`
        )
      }
    })

    return () => {
      let { id, ...theirProps } = props
      let ourProps = {
        id,
        ref: internalBackdropRef,
        'aria-hidden': true,
      }

      return h(ForcePortalRoot, { force: true }, () =>
        h(Portal, () =>
          render({
            ourProps,
            theirProps: { ...attrs, ...theirProps },
            slot: { open: api.dialogState.value === DialogStates.Open },
            attrs,
            slots,
            name: 'DialogBackdrop',
          })
        )
      )
    }
  },
})

// ---

export let DialogPanel = defineComponent({
  name: 'DialogPanel',
  props: {
    as: { type: [Object, String], default: 'div' },
    id: { type: String, default: () => `headlessui-dialog-panel-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDialogContext('DialogPanel')

    expose({ el: api.panelRef, $el: api.panelRef })

    function handleClick(event: MouseEvent) {
      event.stopPropagation()
    }

    return () => {
      let { id, ...theirProps } = props
      let ourProps = {
        id,
        ref: api.panelRef,
        onClick: handleClick,
      }

      return render({
        ourProps,
        theirProps,
        slot: { open: api.dialogState.value === DialogStates.Open },
        attrs,
        slots,
        name: 'DialogPanel',
      })
    }
  },
})

// ---

export let DialogTitle = defineComponent({
  name: 'DialogTitle',
  props: {
    as: { type: [Object, String], default: 'h2' },
    id: { type: String, default: () => `headlessui-dialog-title-${useId()}` },
  },
  setup(props, { attrs, slots }) {
    let api = useDialogContext('DialogTitle')

    onMounted(() => {
      api.setTitleId(props.id)
      onUnmounted(() => api.setTitleId(null))
    })

    return () => {
      let { id, ...theirProps } = props
      let ourProps = { id }

      return render({
        ourProps,
        theirProps,
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
