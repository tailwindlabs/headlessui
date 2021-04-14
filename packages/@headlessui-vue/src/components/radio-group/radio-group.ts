import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  toRaw,

  // Types
  InjectionKey,
  Ref,
  UnwrapRef,
} from 'vue'
import { dom } from '../../utils/dom'
import { Keys } from '../../keyboard'
import { focusIn, Focus, FocusResult } from '../../utils/focus-management'
import { useId } from '../../hooks/use-id'
import { render } from '../../utils/render'
import { Label, useLabels } from '../label/label'
import { Description, useDescriptions } from '../description/description'
import { resolvePropValue } from '../../utils/resolve-prop-value'
import { useTreeWalker } from '../../hooks/use-tree-walker'

interface Option {
  id: string
  element: Ref<HTMLElement | null>
  propsRef: Ref<{ value: unknown }>
}

interface StateDefinition {
  // State
  options: Ref<Option[]>
  value: Ref<unknown>

  // State mutators
  change(nextValue: unknown): void
  registerOption(action: Option): void
  unregisterOption(id: Option['id']): void
}

let RadioGroupContext = Symbol('RadioGroupContext') as InjectionKey<StateDefinition>

function useRadioGroupContext(component: string) {
  let context = inject(RadioGroupContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useRadioGroupContext)
    throw err
  }

  return context
}

// ---

export let RadioGroup = defineComponent({
  name: 'RadioGroup',
  emits: ['update:modelValue'],
  props: {
    as: { type: [Object, String], default: 'div' },
    disabled: { type: [Boolean], default: false },
    modelValue: { type: [Object, String, Number, Boolean] },
  },
  render() {
    let { modelValue, disabled, ...passThroughProps } = this.$props

    let propsWeControl = {
      ref: 'el',
      id: this.id,
      role: 'radiogroup',
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      onKeydown: this.handleKeyDown,
    }

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'RadioGroup',
    })
  },
  setup(props, { emit }) {
    let radioGroupRef = ref<HTMLElement | null>(null)
    let options = ref<StateDefinition['options']['value']>([])
    let labelledby = useLabels({ name: 'RadioGroupLabel' })
    let describedby = useDescriptions({ name: 'RadioGroupDescription' })

    let value = computed(() => props.modelValue)

    let api = {
      options,
      value,
      change(nextValue: unknown) {
        if (props.disabled) return
        if (value.value === nextValue) return
        emit('update:modelValue', nextValue)
      },
      registerOption(action: UnwrapRef<Option>) {
        let orderMap = Array.from(
          radioGroupRef.value?.querySelectorAll('[id^="headlessui-radiogroup-option-"]')!
        ).reduce(
          (lookup, element, index) => Object.assign(lookup, { [element.id]: index }),
          {}
        ) as Record<string, number>

        options.value.push(action)
        options.value.sort((a, z) => orderMap[a.id] - orderMap[z.id])
      },
      unregisterOption(id: Option['id']) {
        let idx = options.value.findIndex(radio => radio.id === id)
        if (idx === -1) return
        options.value.splice(idx, 1)
      },
    }

    // @ts-expect-error ...
    provide(RadioGroupContext, api)

    useTreeWalker({
      container: computed(() => dom(radioGroupRef)),
      accept(node) {
        if (node.getAttribute('role') === 'radio') return NodeFilter.FILTER_REJECT
        if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
        return NodeFilter.FILTER_ACCEPT
      },
      walk(node) {
        node.setAttribute('role', 'none')
      },
    })

    function handleKeyDown(event: KeyboardEvent) {
      if (!radioGroupRef.value) return
      if (!radioGroupRef.value.contains(event.target as HTMLElement)) return

      switch (event.key) {
        case Keys.ArrowLeft:
        case Keys.ArrowUp:
          {
            event.preventDefault()
            event.stopPropagation()

            let result = focusIn(
              options.value.map(radio => radio.element) as HTMLElement[],
              Focus.Previous | Focus.WrapAround
            )

            if (result === FocusResult.Success) {
              let activeOption = options.value.find(
                option => option.element === document.activeElement
              )
              if (activeOption) api.change(activeOption.propsRef.value)
            }
          }
          break

        case Keys.ArrowRight:
        case Keys.ArrowDown:
          {
            event.preventDefault()
            event.stopPropagation()

            let result = focusIn(
              options.value.map(option => option.element) as HTMLElement[],
              Focus.Next | Focus.WrapAround
            )

            if (result === FocusResult.Success) {
              let activeOption = options.value.find(
                option => option.element === document.activeElement
              )
              if (activeOption) api.change(activeOption.propsRef.value)
            }
          }
          break

        case Keys.Space:
          {
            event.preventDefault()
            event.stopPropagation()

            let activeOption = options.value.find(
              option => option.element === document.activeElement
            )
            if (activeOption) api.change(activeOption.propsRef.value)
          }
          break
      }
    }

    let id = `headlessui-radiogroup-${useId()}`

    return {
      id,
      labelledby,
      describedby,
      el: radioGroupRef,
      handleKeyDown,
    }
  },
})

// ---

enum OptionState {
  Empty = 1 << 0,
  Active = 1 << 1,
}

export let RadioGroupOption = defineComponent({
  name: 'RadioGroupOption',
  props: {
    as: { type: [Object, String], default: 'div' },
    value: { type: [Object, String] },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  render() {
    let {
      value,
      disabled,
      class: defaultClass,
      className = defaultClass,
      ...passThroughProps
    } = this.$props
    let api = useRadioGroupContext('RadioGroupOption')

    let firstRadio = api.options.value?.[0]?.id === this.id

    let slot = { checked: this.checked, active: Boolean(this.state & OptionState.Active) }
    let propsWeControl = {
      id: this.id,
      ref: 'el',
      role: 'radio',
      class: resolvePropValue(className, slot),
      'aria-checked': this.checked ? 'true' : 'false',
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      tabIndex: this.checked ? 0 : api.value.value === undefined && firstRadio ? 0 : -1,
      onClick: this.handleClick,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
    }

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'RadioGroupOption',
    })
  },
  setup(props) {
    let api = useRadioGroupContext('RadioGroupOption')
    let id = `headlessui-radiogroup-option-${useId()}`
    let labelledby = useLabels({ name: 'RadioGroupLabel' })
    let describedby = useDescriptions({ name: 'RadioGroupDescription' })

    let optionRef = ref<HTMLElement | null>(null)
    let propsRef = computed(() => ({ value: props.value }))
    let state = ref(OptionState.Empty)

    onMounted(() => api.registerOption({ id, element: optionRef, propsRef }))
    onUnmounted(() => api.unregisterOption(id))

    return {
      id,
      el: optionRef,
      labelledby,
      describedby,
      state,
      checked: computed(() => toRaw(api.value.value) === toRaw(props.value)),
      handleClick() {
        let value = props.value
        if (api.value.value === value) return

        state.value |= OptionState.Active

        api.change(value)
        optionRef.value?.focus()
      },
      handleFocus() {
        state.value |= OptionState.Active
      },
      handleBlur() {
        state.value &= ~OptionState.Active
      },
    }
  },
})

// ---

export let RadioGroupLabel = Label
export let RadioGroupDescription = Description
