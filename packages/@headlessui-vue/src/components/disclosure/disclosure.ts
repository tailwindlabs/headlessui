// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watchEffect,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useId } from '../../hooks/use-id'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import { match } from '../../utils/match'
import { Features, render } from '../../utils/render'

enum DisclosureStates {
  Open,
  Closed,
}

interface StateDefinition {
  // State
  disclosureState: Ref<DisclosureStates>
  panel: Ref<HTMLElement | null>
  panelId: Ref<string | null>
  button: Ref<HTMLButtonElement | null>
  buttonId: Ref<string | null>

  // State mutators
  toggleDisclosure(): void
  closeDisclosure(): void

  // Exposed functions
  close(focusableElement: HTMLElement | Ref<HTMLElement | null>): void
}

let DisclosureContext = Symbol('DisclosureContext') as InjectionKey<StateDefinition>

function useDisclosureContext(component: string) {
  let context = inject(DisclosureContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext)
    throw err
  }

  return context
}

let DisclosurePanelContext = Symbol('DisclosurePanelContext') as InjectionKey<Ref<string | null>>
function useDisclosurePanelContext() {
  return inject(DisclosurePanelContext, null)
}

// ---

export let Disclosure = defineComponent({
  name: 'Disclosure',
  props: {
    as: { type: [Object, String], default: 'template' },
    defaultOpen: { type: [Boolean], default: false },
  },
  setup(props, { slots, attrs }) {
    let disclosureState = ref<StateDefinition['disclosureState']['value']>(
      props.defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed
    )
    let panelRef = ref<StateDefinition['panel']['value']>(null)
    let buttonRef = ref<StateDefinition['button']['value']>(null)

    let api = {
      buttonId: ref(`headlessui-disclosure-button-${useId()}`),
      panelId: ref(`headlessui-disclosure-panel-${useId()}`),
      disclosureState,
      panel: panelRef,
      button: buttonRef,
      toggleDisclosure() {
        disclosureState.value = match(disclosureState.value, {
          [DisclosureStates.Open]: DisclosureStates.Closed,
          [DisclosureStates.Closed]: DisclosureStates.Open,
        })
      },
      closeDisclosure() {
        if (disclosureState.value === DisclosureStates.Closed) return
        disclosureState.value = DisclosureStates.Closed
      },
      close(focusableElement: HTMLElement | Ref<HTMLElement | null>) {
        api.closeDisclosure()

        let restoreElement = (() => {
          if (!focusableElement) return dom(api.button)
          if (focusableElement instanceof HTMLElement) return focusableElement
          if (focusableElement.value instanceof HTMLElement) return dom(focusableElement)

          return dom(api.button)
        })()

        restoreElement?.focus()
      },
    } as StateDefinition

    provide(DisclosureContext, api)
    useOpenClosedProvider(
      computed(() => {
        return match(disclosureState.value, {
          [DisclosureStates.Open]: State.Open,
          [DisclosureStates.Closed]: State.Closed,
        })
      })
    )

    return () => {
      let { defaultOpen: _, ...theirProps } = props
      let slot = { open: disclosureState.value === DisclosureStates.Open, close: api.close }
      return render({
        theirProps,
        ourProps: {},
        slot,
        slots,
        attrs,
        name: 'Disclosure',
      })
    }
  },
})

// ---

export let DisclosureButton = defineComponent({
  name: 'DisclosureButton',
  props: {
    as: { type: [Object, String], default: 'button' },
    disabled: { type: [Boolean], default: false },
    id: { type: String, default: null },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDisclosureContext('DisclosureButton')

    let panelContext = useDisclosurePanelContext()
    let isWithinPanel = computed(() =>
      panelContext === null ? false : panelContext.value === api.panelId.value
    )

    onMounted(() => {
      if (isWithinPanel.value) return
      if (props.id !== null) {
        api.buttonId.value = props.id
      }
    })
    onUnmounted(() => {
      if (isWithinPanel.value) return
      api.buttonId.value = null
    })

    let internalButtonRef = ref<HTMLButtonElement | null>(null)

    expose({ el: internalButtonRef, $el: internalButtonRef })

    if (!isWithinPanel.value) {
      watchEffect(() => {
        api.button.value = internalButtonRef.value
      })
    }

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      internalButtonRef
    )

    function handleClick() {
      if (props.disabled) return

      if (isWithinPanel.value) {
        api.toggleDisclosure()
        dom(api.button)?.focus()
      } else {
        api.toggleDisclosure()
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (props.disabled) return

      if (isWithinPanel.value) {
        switch (event.key) {
          case Keys.Space:
          case Keys.Enter:
            event.preventDefault()
            event.stopPropagation()
            api.toggleDisclosure()
            dom(api.button)?.focus()
            break
        }
      } else {
        switch (event.key) {
          case Keys.Space:
          case Keys.Enter:
            event.preventDefault()
            event.stopPropagation()
            api.toggleDisclosure()
            break
        }
      }
    }
    function handleKeyUp(event: KeyboardEvent) {
      switch (event.key) {
        case Keys.Space:
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault()
          break
      }
    }

    return () => {
      let slot = { open: api.disclosureState.value === DisclosureStates.Open }
      let { id, ...theirProps } = props
      let ourProps = isWithinPanel.value
        ? {
            ref: internalButtonRef,
            type: type.value,
            onClick: handleClick,
            onKeydown: handleKeyDown,
          }
        : {
            id: api.buttonId.value ?? id,
            ref: internalButtonRef,
            type: type.value,
            'aria-expanded': api.disclosureState.value === DisclosureStates.Open,
            'aria-controls':
              api.disclosureState.value === DisclosureStates.Open || dom(api.panel)
                ? api.panelId.value
                : undefined,
            disabled: props.disabled ? true : undefined,
            onClick: handleClick,
            onKeydown: handleKeyDown,
            onKeyup: handleKeyUp,
          }

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: 'DisclosureButton',
      })
    }
  },
})

// ---

export let DisclosurePanel = defineComponent({
  name: 'DisclosurePanel',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    id: { type: String, default: null },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDisclosureContext('DisclosurePanel')

    onMounted(() => {
      if (props.id !== null) {
        api.panelId.value = props.id
      }
    })
    onUnmounted(() => {
      api.panelId.value = null
    })

    expose({ el: api.panel, $el: api.panel })

    provide(DisclosurePanelContext, api.panelId)

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & State.Open) === State.Open
      }

      return api.disclosureState.value === DisclosureStates.Open
    })

    return () => {
      let slot = { open: api.disclosureState.value === DisclosureStates.Open, close: api.close }
      let { id, ...theirProps } = props
      let ourProps = { id: api.panelId.value ?? id, ref: api.panel }

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: Features.RenderStrategy | Features.Static,
        visible: visible.value,
        name: 'DisclosurePanel',
      })
    }
  },
})
