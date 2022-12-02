// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
import {
  defineComponent,
  ref,
  provide,
  inject,
  InjectionKey,
  Ref,
  computed,
  watchEffect,
  onMounted,
  onUnmounted,
} from 'vue'

import { Keys } from '../../keyboard'
import { match } from '../../utils/match'
import { render, Features } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { dom } from '../../utils/dom'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'

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
      buttonId: ref(null),
      panelId: ref(null),
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
    id: { type: String, default: () => `headlessui-disclosure-button-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDisclosureContext('DisclosureButton')

    onMounted(() => {
      api.buttonId.value = props.id
    })
    onUnmounted(() => {
      api.buttonId.value = null
    })

    let panelContext = useDisclosurePanelContext()
    let isWithinPanel = computed(() =>
      panelContext === null ? false : panelContext.value === api.panelId.value
    )

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
            id,
            ref: internalButtonRef,
            type: type.value,
            'aria-expanded': props.disabled
              ? undefined
              : api.disclosureState.value === DisclosureStates.Open,
            'aria-controls': dom(api.panel) ? api.panelId.value : undefined,
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
    id: { type: String, default: () => `headlessui-disclosure-panel-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDisclosureContext('DisclosurePanel')

    onMounted(() => {
      api.panelId.value = props.id
    })
    onUnmounted(() => {
      api.panelId.value = null
    })

    expose({ el: api.panel, $el: api.panel })

    provide(DisclosurePanelContext, api.panelId)

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.disclosureState.value === DisclosureStates.Open
    })

    return () => {
      let slot = { open: api.disclosureState.value === DisclosureStates.Open, close: api.close }
      let { id, ...theirProps } = props
      let ourProps = { id, ref: api.panel }

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
