import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

import { render, compact } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { Label, useLabels } from '../label/label'
import { Description, useDescriptions } from '../description/description'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { VisuallyHidden } from '../../internal/visually-hidden'
import { attemptSubmit } from '../../utils/form'

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
  props: {
    as: { type: [Object, String], default: 'template' },
  },
  setup(props, { slots, attrs }) {
    let switchRef = ref<StateDefinition['switchRef']['value']>(null)
    let labelledby = useLabels({
      name: 'SwitchLabel',
      props: {
        onClick() {
          if (!switchRef.value) return
          switchRef.value.click()
          switchRef.value.focus({ preventScroll: true })
        },
      },
    })
    let describedby = useDescriptions({ name: 'SwitchDescription' })

    let api = { switchRef, labelledby, describedby }

    provide(GroupContext, api)

    return () => render({ props, slot: {}, slots, attrs, name: 'SwitchGroup' })
  },
})

// ---

export let Switch = defineComponent({
  name: 'Switch',
  emits: { 'update:modelValue': (_value: boolean) => true },
  props: {
    as: { type: [Object, String], default: 'button' },
    modelValue: { type: Boolean, default: false },
    name: { type: String, optional: true },
    value: { type: String, optional: true },
  },
  inheritAttrs: false,
  setup(props, { emit, attrs, slots, expose }) {
    let api = inject(GroupContext, null)
    let id = `headlessui-switch-${useId()}`

    function toggle() {
      emit('update:modelValue', !props.modelValue)
    }

    let internalSwitchRef = ref(null)
    let switchRef = api === null ? internalSwitchRef : api.switchRef
    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      switchRef
    )

    expose({ el: switchRef, $el: switchRef })

    function handleClick(event: MouseEvent) {
      event.preventDefault()
      toggle()
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === Keys.Space) {
        event.preventDefault()
        toggle()
      } else if (event.key === Keys.Enter) {
        attemptSubmit(event.currentTarget as HTMLElement)
      }
    }

    // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
    function handleKeyPress(event: KeyboardEvent) {
      event.preventDefault()
    }

    return () => {
      let { name, value, modelValue, ...incomingProps } = props
      let slot = { checked: modelValue }
      let ourProps = {
        id,
        ref: switchRef,
        role: 'switch',
        type: type.value,
        tabIndex: 0,
        'aria-checked': modelValue,
        'aria-labelledby': api?.labelledby.value,
        'aria-describedby': api?.describedby.value,
        onClick: handleClick,
        onKeyup: handleKeyUp,
        onKeypress: handleKeyPress,
      }

      return h(Fragment, [
        name != null && modelValue != null
          ? h(
              VisuallyHidden,
              compact({
                as: 'input',
                type: 'checkbox',
                hidden: true,
                readOnly: true,
                checked: modelValue,
                name,
                value,
              })
            )
          : null,
        render({
          props: { ...attrs, ...incomingProps, ...ourProps },
          slot,
          attrs,
          slots,
          name: 'Switch',
        }),
      ])
    }
  },
})

// ---

export let SwitchLabel = Label
export let SwitchDescription = Description
