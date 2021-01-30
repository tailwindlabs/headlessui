import { computed, defineComponent, inject, InjectionKey, provide, ref, Ref } from 'vue'

import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { resolvePropValue } from '../../utils/resolve-prop-value'

type StateDefinition = {
  // State
  switchRef: Ref<HTMLButtonElement | null>
  labelRef: Ref<HTMLLabelElement | null>
}

let GroupContext = Symbol('GroupContext') as InjectionKey<StateDefinition>

function useGroupContext(component: string) {
  let context = inject(GroupContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <SwitchGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useGroupContext)
    throw err
  }

  return context
}

// ---

export let SwitchGroup = defineComponent({
  name: 'SwitchGroup',
  props: {
    as: { type: [Object, String], default: 'template' },
  },
  setup(props, { slots, attrs }) {
    let switchRef = ref<StateDefinition['switchRef']['value']>(null)
    let labelRef = ref<StateDefinition['labelRef']['value']>(null)

    let api = { switchRef, labelRef }

    provide(GroupContext, api)

    return () => render({ props, slot: {}, slots, attrs })
  },
})

// ---

export let Switch = defineComponent({
  name: 'Switch',
  emits: ['update:modelValue'],
  props: {
    as: { type: [Object, String], default: 'button' },
    modelValue: { type: [Object, Boolean], default: null },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  render() {
    let api = inject(GroupContext, null)
    let { class: defaultClass, className = defaultClass } = this.$props

    let labelledby = computed(() => api?.labelRef.value?.id)

    let slot = { checked: this.$props.modelValue }
    let propsWeControl = {
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

    if (this.$props.as === 'button') {
      Object.assign(propsWeControl, { type: 'button' })
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup(props, { emit }) {
    let api = inject(GroupContext, null)
    let id = `headlessui-switch-${useId()}`

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

export let SwitchLabel = defineComponent({
  name: 'SwitchLabel',
  props: { as: { type: [Object, String], default: 'label' } },
  render() {
    let propsWeControl = {
      id: this.id,
      ref: 'el',
      onClick: this.handleClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    let api = useGroupContext('SwitchLabel')
    let id = `headlessui-switch-label-${useId()}`

    return {
      id,
      el: api.labelRef,
      handleClick() {
        api.switchRef.value?.click()
        api.switchRef.value?.focus({ preventScroll: true })
      },
    }
  },
})
