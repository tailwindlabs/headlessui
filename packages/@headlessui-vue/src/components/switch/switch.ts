import {
  defineComponent,
  h,
  inject,
  provide,
  ref,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { resolvePropValue } from '../../utils/resolve-prop-value'
import { Label, useLabels } from '../label/label'
import { Description, useDescriptions } from '../description/description'

type StateDefinition = {
  // State
  switchRef: Ref<HTMLButtonElement | null>
  labelledby: Ref<string | undefined>
  describedby: Ref<string | undefined>
}

let GroupContext = Symbol('GroupContext') as InjectionKey<StateDefinition>

// ---

export let SwitchGroup = defineComponent({
  name: 'SwitchGroup',
  inheritAttrs: false, // Manually handling this
  props: {
    as: { type: [Object, String], default: 'template' },
  },
  setup(props, { slots, attrs }) {
    let switchRef = ref<StateDefinition['switchRef']['value']>(null)
    let [labelledby, LabelProvider] = useLabels()
    let [describedby, DescriptionProvider] = useDescriptions()

    let api = { switchRef, labelledby, describedby }

    provide(GroupContext, api)

    return () =>
      h(DescriptionProvider, { name: 'SwitchDescription' }, () => [
        h(
          LabelProvider,
          {
            name: 'SwitchLabel',
            props: {
              onClick() {
                if (!switchRef.value) return
                switchRef.value.click()
                switchRef.value.focus({ preventScroll: true })
              },
            },
          },
          () => [
            render({
              props: {
                // Manually passthrough the attributes, because Vue can't automatically pass
                // it to the underlying div because of all the wrapper components below.
                ...attrs,
                ...props,
              },
              slot: {},
              slots,
              attrs,
              name: 'SwitchGroup',
            }),
          ]
        ),
      ])
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

    let slot = { checked: this.$props.modelValue }
    let propsWeControl = {
      id: this.id,
      ref: api === null ? undefined : api.switchRef,
      role: 'switch',
      tabIndex: 0,
      class: resolvePropValue(className, slot),
      'aria-checked': this.$props.modelValue,
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      onClick: this.handleClick,
      onKeyup: this.handleKeyUp,
      onKeypress: this.handleKeyPress,
    }

    if (this.$props.as === 'button') {
      Object.assign(propsWeControl, { type: 'button' })
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'Switch',
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
      labelledby: api?.labelledby,
      describedby: api?.describedby,
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

export let SwitchLabel = Label
export let SwitchDescription = Description
