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
import { useTreeWalker } from '../../hooks/use-tree-walker'

interface Option {
  id: string
  element: Ref<HTMLElement | null>
  propsRef: Ref<{ value: unknown; disabled: boolean }>
}

interface StateDefinition {
  // State
  options: Ref<Option[]>
  value: Ref<unknown>
  disabled: Ref<boolean>
  firstOption: Ref<Option | undefined>
  containsCheckedOption: Ref<boolean>

  // State mutators
  change(nextValue: unknown): boolean
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
  emits: { 'update:modelValue': (_value: any) => true },
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
      disabled: computed(() => props.disabled),
      firstOption: computed(() =>
        options.value.find(option => {
          if (option.propsRef.disabled) return false
          return true
        })
      ),
      containsCheckedOption: computed(() =>
        options.value.some(option => toRaw(option.propsRef.value) === toRaw(props.modelValue))
      ),
      change(nextValue: unknown) {
        if (props.disabled) return false
        if (value.value === nextValue) return false
        let nextOption = options.value.find(
          option => toRaw(option.propsRef.value) === toRaw(nextValue)
        )?.propsRef
        if (nextOption?.disabled) return false
        emit('update:modelValue', nextValue)
        return true
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

      let all = options.value
        .filter(option => option.propsRef.disabled === false)
        .map(radio => radio.element) as HTMLElement[]

      switch (event.key) {
        case Keys.ArrowLeft:
        case Keys.ArrowUp:
          {
            event.preventDefault()
            event.stopPropagation()

            let result = focusIn(all, Focus.Previous | Focus.WrapAround)

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

            let result = focusIn(all, Focus.Next | Focus.WrapAround)

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
    value: { type: [Object, String, Number, Boolean] },
    disabled: { type: Boolean, default: false },
  },
  render() {
    let { value, disabled, ...passThroughProps } = this.$props

    let slot = {
      checked: this.checked,
      disabled: this.disabled,
      active: Boolean(this.state & OptionState.Active),
    }

    let propsWeControl = {
      id: this.id,
      ref: 'el',
      role: 'radio',
      'aria-checked': this.checked ? 'true' : 'false',
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      'aria-disabled': this.disabled ? true : undefined,
      tabIndex: this.tabIndex,
      onClick: this.disabled ? undefined : this.handleClick,
      onFocus: this.disabled ? undefined : this.handleFocus,
      onBlur: this.disabled ? undefined : this.handleBlur,
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
    let propsRef = computed(() => ({ value: props.value, disabled: props.disabled }))
    let state = ref(OptionState.Empty)

    onMounted(() => api.registerOption({ id, element: optionRef, propsRef }))
    onUnmounted(() => api.unregisterOption(id))

    let isFirstOption = computed(() => api.firstOption.value?.id === id)
    let disabled = computed(() => api.disabled.value || props.disabled)
    let checked = computed(() => toRaw(api.value.value) === toRaw(props.value))

    return {
      id,
      el: optionRef,
      labelledby,
      describedby,
      state,
      disabled,
      checked,
      tabIndex: computed(() => {
        if (disabled.value) return -1
        if (checked.value) return 0
        if (!api.containsCheckedOption.value && isFirstOption.value) return 0
        return -1
      }),
      handleClick() {
        if (!api.change(props.value)) return

        state.value |= OptionState.Active
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
