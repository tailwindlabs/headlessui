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
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue'
import { FocusTrap } from '../../components/focus-trap/focus-trap'
import { useDocumentOverflowLockedEffect } from '../../hooks/document-overflow/use-document-overflow'
import { useEventListener } from '../../hooks/use-event-listener'
import { useId } from '../../hooks/use-id'
import { useInert } from '../../hooks/use-inert'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useRootContainers } from '../../hooks/use-root-containers'
import { State, useOpenClosed } from '../../internal/open-closed'
import { ForcePortalRoot } from '../../internal/portal-force-root'
import { StackMessage, useStackProvider } from '../../internal/stack-context'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import { Features, render } from '../../utils/render'
import { Description, useDescriptions } from '../description/description'
import { Portal, PortalGroup, useNestedPortals } from '../portal/portal'

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
    role: { type: String as PropType<'dialog' | 'alertdialog'>, default: 'dialog' },
  },
  emits: { close: (_close: boolean) => true },
  setup(props, { emit, attrs, slots, expose }) {
    let ready = ref(false)
    onMounted(() => {
      ready.value = true
    })

    let didWarnOnRole = false
    let role = computed(() => {
      if (props.role === 'dialog' || props.role === 'alertdialog') {
        return props.role
      }

      if (!didWarnOnRole) {
        didWarnOnRole = true
        console.warn(
          `Invalid role [${role}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`
        )
      }

      return 'dialog'
    })

    let nestedDialogCount = ref(0)

    let usesOpenClosedState = useOpenClosed()
    let open = computed(() => {
      if (props.open === Missing && usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & State.Open) === State.Open
      }
      return props.open
    })

    let internalDialogRef = ref<HTMLDivElement | null>(null)

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
    let [portals, PortalWrapper] = useNestedPortals()
    let {
      resolveContainers: resolveRootContainers,
      mainTreeNodeRef,
      MainTreeNode,
    } = useRootContainers({
      portals,
      defaultContainers: [computed(() => api.panelRef.value ?? internalDialogRef.value)],
    })

    // If there are multiple dialogs, then you can be the root, the leaf or one
    // in between. We only care abou whether you are the top most one or not.
    let position = computed(() => (!hasNestedDialogs.value ? 'leaf' : 'parent'))

    // When the `Dialog` is wrapped in a `Transition` (or another Headless UI component that exposes
    // the OpenClosed state) then we get some information via context about its state. When the
    // `Transition` is about to close, then the `State.Closing` state will be exposed. This allows us
    // to enable/disable certain functionality in the `Dialog` upfront instead of waiting until the
    // `Transition` is done transitioning.
    let isClosing = computed(() =>
      usesOpenClosedState !== null
        ? (usesOpenClosedState.value & State.Closing) === State.Closing
        : false
    )

    // Ensure other elements can't be interacted with
    let inertOthersEnabled = computed(() => {
      // Nested dialogs should not modify the `inert` property, only the root one should.
      if (hasParentDialog) return false
      if (isClosing.value) return false
      return enabled.value
    })
    let resolveRootOfMainTreeNode = computed(() => {
      return (Array.from(ownerDocument.value?.querySelectorAll('body > *') ?? []).find((root) => {
        // Skip the portal root, we don't want to make that one inert
        if (root.id === 'headlessui-portal-root') return false

        // Find the root of the main tree node
        return root.contains(dom(mainTreeNodeRef)) && root instanceof HTMLElement
      }) ?? null) as HTMLElement | null
    })
    useInert(resolveRootOfMainTreeNode, inertOthersEnabled)

    // This would mark the parent dialogs as inert
    let inertParentDialogs = computed(() => {
      if (hasNestedDialogs.value) return true
      return enabled.value
    })
    let resolveRootOfParentDialog = computed(() => {
      return (Array.from(
        ownerDocument.value?.querySelectorAll('[data-headlessui-portal]') ?? []
      ).find((root) => root.contains(dom(mainTreeNodeRef)) && root instanceof HTMLElement) ??
        null) as HTMLElement | null
    })
    useInert(resolveRootOfParentDialog, inertParentDialogs)

    useStackProvider({
      type: 'Dialog',
      enabled: computed(() => dialogState.value === DialogStates.Open),
      element: internalDialogRef,
      onUpdate: (message, type) => {
        if (type !== 'Dialog') return

        return match(message, {
          [StackMessage.Add]: () => (nestedDialogCount.value += 1),
          [StackMessage.Remove]: () => (nestedDialogCount.value -= 1),
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

    // Handle outside click
    let outsideClickEnabled = computed(() => {
      if (!enabled.value) return false
      if (hasNestedDialogs.value) return false
      return true
    })
    useOutsideClick(
      resolveRootContainers,
      (_event, target) => {
        api.close()
        nextTick(() => target?.focus())
      },
      outsideClickEnabled
    )

    // Handle `Escape` to close
    let escapeToCloseEnabled = computed(() => {
      if (hasNestedDialogs.value) return false
      if (dialogState.value !== DialogStates.Open) return false
      return true
    })
    useEventListener(ownerDocument.value?.defaultView, 'keydown', (event) => {
      if (!escapeToCloseEnabled.value) return
      if (event.defaultPrevented) return
      if (event.key !== Keys.Escape) return

      event.preventDefault()
      event.stopPropagation()
      api.close()
    })

    // Scroll lock
    let scrollLockEnabled = computed(() => {
      if (isClosing.value) return false
      if (dialogState.value !== DialogStates.Open) return false
      if (hasParentDialog) return false
      return true
    })
    useDocumentOverflowLockedEffect(ownerDocument, scrollLockEnabled, (meta) => ({
      containers: [...(meta.containers ?? []), resolveRootContainers],
    }))

    // Trigger close when the FocusTrap gets hidden
    watchEffect((onInvalidate) => {
      if (dialogState.value !== DialogStates.Open) return
      let container = dom(internalDialogRef)
      if (!container) return

      let observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          let rect = entry.target.getBoundingClientRect()
          if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
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
        role: role.value,
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
                  containers: resolveRootContainers,
                  features: enabled.value
                    ? match(position.value, {
                        parent: FocusTrap.features.RestoreFocus,
                        leaf: FocusTrap.features.All & ~FocusTrap.features.FocusLock,
                      })
                    : FocusTrap.features.None,
                },
                () =>
                  h(PortalWrapper, {}, () =>
                    render({
                      ourProps,
                      theirProps: { ...theirProps, ...attrs },
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
          )
        ),
        h(MainTreeNode),
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
