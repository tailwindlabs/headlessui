// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
import { defineComponent, ref, provide, inject, InjectionKey, Ref, computed } from 'vue'

import { Keys } from '../../keyboard'
import { match } from '../../utils/match'
import { render, Features } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { dom } from '../../utils/dom'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'

enum DisclosureStates {
  Open,
  Closed,
}

interface StateDefinition {
  // State
  disclosureState: Ref<DisclosureStates>
  panel: Ref<HTMLElement | null>
  panelId: string
  button: Ref<HTMLButtonElement | null>
  buttonId: string

  // State mutators
  toggleDisclosure(): void
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

let DisclosurePanelContext = Symbol('DisclosurePanelContext') as InjectionKey<string | null>
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
    let buttonId = `headlessui-disclosure-button-${useId()}`
    let panelId = `headlessui-disclosure-panel-${useId()}`

    let disclosureState = ref<StateDefinition['disclosureState']['value']>(
      props.defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed
    )
    let panelRef = ref<StateDefinition['panel']['value']>(null)
    let buttonRef = ref<StateDefinition['button']['value']>(null)

    let api = {
      buttonId,
      panelId,
      disclosureState,
      panel: panelRef,
      button: buttonRef,
      toggleDisclosure() {
        disclosureState.value = match(disclosureState.value, {
          [DisclosureStates.Open]: DisclosureStates.Closed,
          [DisclosureStates.Closed]: DisclosureStates.Open,
        })
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
      let { defaultOpen: _, ...passThroughProps } = props
      let slot = { open: disclosureState.value === DisclosureStates.Open }
      return render({ props: passThroughProps, slot, slots, attrs, name: 'Disclosure' })
    }
  },
})

// ---

export let DisclosureButton = defineComponent({
  name: 'DisclosureButton',
  props: {
    as: { type: [Object, String], default: 'button' },
    disabled: { type: [Boolean], default: false },
  },
  render() {
    let api = useDisclosureContext('DisclosureButton')

    let slot = { open: api.disclosureState.value === DisclosureStates.Open }
    let propsWeControl = this.isWithinPanel
      ? {
          type: 'button',
          onClick: this.handleClick,
          onKeydown: this.handleKeyDown,
        }
      : {
          id: this.id,
          ref: 'el',
          type: 'button',
          'aria-expanded': this.$props.disabled
            ? undefined
            : api.disclosureState.value === DisclosureStates.Open,
          'aria-controls': dom(api.panel) ? api.panelId : undefined,
          disabled: this.$props.disabled ? true : undefined,
          onClick: this.handleClick,
          onKeydown: this.handleKeyDown,
          onKeyup: this.handleKeyUp,
        }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'DisclosureButton',
    })
  },
  setup(props) {
    let api = useDisclosureContext('DisclosureButton')

    let panelContext = useDisclosurePanelContext()
    let isWithinPanel = panelContext === null ? false : panelContext === api.panelId

    return {
      isWithinPanel,
      id: api.buttonId,
      el: isWithinPanel ? undefined : api.button,
      handleClick() {
        if (props.disabled) return

        if (isWithinPanel) {
          api.toggleDisclosure()
          dom(api.button)?.focus()
        } else {
          api.toggleDisclosure()
        }
      },
      handleKeyDown(event: KeyboardEvent) {
        if (props.disabled) return

        if (isWithinPanel) {
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
      },
      handleKeyUp(event: KeyboardEvent) {
        switch (event.key) {
          case Keys.Space:
            // Required for firefox, event.preventDefault() in handleKeyDown for
            // the Space key doesn't cancel the handleKeyUp, which in turn
            // triggers a *click*.
            event.preventDefault()
            break
        }
      },
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
  },
  render() {
    let api = useDisclosureContext('DisclosurePanel')

    let slot = { open: api.disclosureState.value === DisclosureStates.Open }
    let propsWeControl = { id: this.id, ref: 'el' }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: this.visible,
      name: 'DisclosurePanel',
    })
  },
  setup() {
    let api = useDisclosureContext('DisclosurePanel')

    provide(DisclosurePanelContext, api.panelId)

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.disclosureState.value === DisclosureStates.Open
    })

    return { id: api.panelId, el: api.panel, visible }
  },
})
