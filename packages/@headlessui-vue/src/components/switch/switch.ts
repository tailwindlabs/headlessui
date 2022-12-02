import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  watch,

  // Types
  InjectionKey,
  Ref,
  onMounted,
} from 'vue'

import { render, compact, omit } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { Label, useLabels } from '../label/label'
import { Description, useDescriptions } from '../description/description'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { attemptSubmit } from '../../utils/form'
import { useControllable } from '../../hooks/use-controllable'
import { dom } from '../../utils/dom'

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

    return () =>
      render({ theirProps: props, ourProps: {}, slot: {}, slots, attrs, name: 'SwitchGroup' })
  },
})

// ---

export let Switch = defineComponent({
  name: 'Switch',
  emits: { 'update:modelValue': (_value: boolean) => true },
  props: {
    as: { type: [Object, String], default: 'button' },
    modelValue: { type: Boolean, default: undefined },
    defaultChecked: { type: Boolean, optional: true },
    name: { type: String, optional: true },
    value: { type: String, optional: true },
    id: { type: String, default: () => `headlessui-switch-${useId()}` },
  },
  inheritAttrs: false,
  setup(props, { emit, attrs, slots, expose }) {
    let api = inject(GroupContext, null)

    let [checked, theirOnChange] = useControllable(
      computed(() => props.modelValue),
      (value: boolean) => emit('update:modelValue', value),
      computed(() => props.defaultChecked)
    )

    function toggle() {
      theirOnChange(!checked.value)
    }

    let internalSwitchRef = ref<HTMLButtonElement | null>(null)
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

    let form = computed(() => dom(switchRef)?.closest?.('form'))
    onMounted(() => {
      watch(
        [form],
        () => {
          if (!form.value) return
          if (props.defaultChecked === undefined) return

          function handle() {
            theirOnChange(props.defaultChecked)
          }

          form.value.addEventListener('reset', handle)
          return () => {
            form.value?.removeEventListener('reset', handle)
          }
        },
        { immediate: true }
      )
    })

    return () => {
      let { id, name, value, ...theirProps } = props
      let slot = { checked: checked.value }
      let ourProps = {
        id,
        ref: switchRef,
        role: 'switch',
        type: type.value,
        tabIndex: 0,
        'aria-checked': checked.value,
        'aria-labelledby': api?.labelledby.value,
        'aria-describedby': api?.describedby.value,
        onClick: handleClick,
        onKeyup: handleKeyUp,
        onKeypress: handleKeyPress,
      }

      return h(Fragment, [
        name != null && checked.value != null
          ? h(
              Hidden,
              compact({
                features: HiddenFeatures.Hidden,
                as: 'input',
                type: 'checkbox',
                hidden: true,
                readOnly: true,
                checked: checked.value,
                name,
                value,
              })
            )
          : null,
        render({
          ourProps,
          theirProps: { ...attrs, ...omit(theirProps, ['modelValue', 'defaultChecked']) },
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
