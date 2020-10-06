import { computed, defineComponent, inject, InjectionKey, provide, ref, Ref } from 'vue'

import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'

type StateDefinition = {
  // State
  switchRef: Ref<HTMLButtonElement | null>
  labelRef: Ref<HTMLLabelElement | null>
}

const GroupContext = Symbol('GroupContext') as InjectionKey<StateDefinition>

function useGroupContext(component: string) {
  const context = inject(GroupContext, null)

  if (context === null) {
    const err = new Error(`<${component} /> is missing a parent <SwitchGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useGroupContext)
    throw err
  }

  return context
}

// ---

export const SwitchGroup = defineComponent({
  name: 'SwitchGroup',
  props: {
    as: { type: [Object, String], default: 'template' },
  },
  setup(props, { slots, attrs }) {
    const switchRef = ref<StateDefinition['switchRef']['value']>(null)
    const labelRef = ref<StateDefinition['labelRef']['value']>(null)

    const api = { switchRef, labelRef }

    provide(GroupContext, api)

    return () => render({ props, slot: {}, slots, attrs })
  },
})

// ---

export const Switch = defineComponent({
  name: 'Switch',
  props: {
    as: { type: [Object, String], default: 'button' },
    modelValue: { type: [Object, Boolean], default: null },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  render() {
    const api = inject(GroupContext, null)
    const { class: defaultClass, className = defaultClass } = this.$props

    const labelledby = computed(() => api?.labelRef.value?.id)

    const slot = { checked: this.$props.modelValue }
    const propsWeControl = {
      id: this.id,
      ref: api === null ? undefined : api.switchRef,
      role: 'switch',
      tabIndex: 0,
      class: resolvePropValue(className, slot),
      'aria-checked': this.$props.modelValue,
      'aria-labelledby': labelledby.value,
      onClick: this.handleClick,
      onKeyUp: this.handleKeyUp,
      onKeyPress: this.handleKeyPress,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup(props, { emit }) {
    const api = inject(GroupContext, null)
    const id = `headlessui-switch-${useId()}`

    function toggle() {
      emit('update:modelValue', !props.modelValue)
    }

    return {
      id,
      el: api?.switchRef,
      handleClick(event: MouseEvent) {
        event.preventDefault()
        toggle()
      },
      handleKeyUp(event: KeyboardEvent) {
        if (event.key !== Keys.Tab) event.preventDefault()
        if (event.key === Keys.Space) toggle()
      },
      // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
      handleKeyPress(event: KeyboardEvent) {
        event.preventDefault()
      },
    }
  },
})

// ---

export const SwitchLabel = defineComponent({
  name: 'SwitchLabel',
  props: { as: { type: [Object, String], default: 'label' } },
  render() {
    const propsWeControl = {
      id: this.id,
      ref: 'el',
      onPointerUp: this.handlePointerUp,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    const api = useGroupContext('SwitchLabel')
    const id = `headlessui-switch-label-${useId()}`

    return {
      id,
      el: api.labelRef,
      handlePointerUp() {
        api.switchRef.value?.click()
        api.switchRef.value?.focus()
      },
    }
  },
})

// ---

function resolvePropValue<TProperty, TBag>(property: TProperty, bag: TBag) {
  if (property === undefined) return undefined
  if (typeof property === 'function') return property(bag)
  return property
}
