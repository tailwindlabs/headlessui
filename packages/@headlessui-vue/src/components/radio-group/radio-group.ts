import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  toRaw,
  watch,
  type InjectionKey,
  type Ref,
  type UnwrapRef,
} from 'vue'
import { useControllable } from '../../hooks/use-controllable'
import { useId } from '../../hooks/use-id'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import { Focus, FocusResult, focusIn, sortByDomNode } from '../../utils/focus-management'
import { attemptSubmit, objectToFormEntries } from '../../utils/form'
import { getOwnerDocument } from '../../utils/owner'
import { compact, omit, render } from '../../utils/render'
import { Description, useDescriptions } from '../description/description'
import { Label, useLabels } from '../label/label'

function defaultComparator<T>(a: T, z: T): boolean {
  return a === z
}

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

  compare(a: unknown, z: unknown): boolean

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
    by: { type: [String, Function], default: () => defaultComparator },
    modelValue: { type: [Object, String, Number, Boolean], default: undefined },
    defaultValue: { type: [Object, String, Number, Boolean], default: undefined },
    form: { type: String, optional: true },
    name: { type: String, optional: true },
    id: { type: String, default: () => `headlessui-radiogroup-${useId()}` },
  },
  inheritAttrs: false,
  setup(props, { emit, attrs, slots, expose }) {
    let radioGroupRef = ref<HTMLElement | null>(null)
    let options = ref<StateDefinition['options']['value']>([])
    let labelledby = useLabels({ name: 'RadioGroupLabel' })
    let describedby = useDescriptions({ name: 'RadioGroupDescription' })

    expose({ el: radioGroupRef, $el: radioGroupRef })

    let [value, theirOnChange] = useControllable(
      computed(() => props.modelValue),
      (value: unknown) => emit('update:modelValue', value),
      computed(() => props.defaultValue)
    )

    // TODO: Fix type
    let api: any = {
      options,
      value,
      disabled: computed(() => props.disabled),
      firstOption: computed(() =>
        options.value.find((option) => {
          if (option.propsRef.disabled) return false
          return true
        })
      ),
      containsCheckedOption: computed(() =>
        options.value.some((option) =>
          api.compare(toRaw(option.propsRef.value), toRaw(props.modelValue))
        )
      ),
      compare(a: any, z: any) {
        if (typeof props.by === 'string') {
          let property = props.by as unknown as any
          return a?.[property] === z?.[property]
        }
        return props.by(a, z)
      },
      change(nextValue: unknown) {
        if (props.disabled) return false
        if (api.compare(toRaw(value.value), toRaw(nextValue))) return false
        let nextOption = options.value.find((option) =>
          api.compare(toRaw(option.propsRef.value), toRaw(nextValue))
        )?.propsRef
        if (nextOption?.disabled) return false
        theirOnChange(nextValue)
        return true
      },
      registerOption(action: UnwrapRef<Option>) {
        options.value.push(action)
        options.value = sortByDomNode(options.value, (option) => option.element)
      },
      unregisterOption(id: Option['id']) {
        let idx = options.value.findIndex((radio) => radio.id === id)
        if (idx === -1) return
        options.value.splice(idx, 1)
      },
    }

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
        .filter((option) => option.propsRef.disabled === false)
        .map((radio) => radio.element) as HTMLElement[]

      switch (event.key) {
        case Keys.Enter:
          attemptSubmit(event.currentTarget as unknown as EventTarget & HTMLButtonElement)
          break
        case Keys.ArrowLeft:
        case Keys.ArrowUp:
          {
            event.preventDefault()
            event.stopPropagation()

            let result = focusIn(all, Focus.Previous | Focus.WrapAround)

            if (result === FocusResult.Success) {
              let activeOption = options.value.find(
                (option) => option.element === getOwnerDocument(radioGroupRef)?.activeElement
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
                (option) => option.element === getOwnerDocument(option.element)?.activeElement
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
              (option) => option.element === getOwnerDocument(option.element)?.activeElement
            )
            if (activeOption) api.change(activeOption.propsRef.value)
          }
          break
      }
    }

    let form = computed(() => dom(radioGroupRef)?.closest('form'))
    onMounted(() => {
      watch(
        [form],
        () => {
          if (!form.value) return
          if (props.defaultValue === undefined) return

          function handle() {
            api.change(props.defaultValue)
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
      let { disabled, name, id, form, ...theirProps } = props

      let ourProps = {
        ref: radioGroupRef,
        id,
        role: 'radiogroup',
        'aria-labelledby': labelledby.value,
        'aria-describedby': describedby.value,
        onKeydown: handleKeyDown,
      }

      return h(Fragment, [
        ...(name != null && value.value != null
          ? objectToFormEntries({ [name]: value.value }).map(([name, value]) =>
              h(
                Hidden,
                compact({
                  features: HiddenFeatures.Hidden,
                  key: name,
                  as: 'input',
                  type: 'hidden',
                  hidden: true,
                  readOnly: true,
                  form,
                  name,
                  value,
                })
              )
            )
          : []),
        render({
          ourProps,
          theirProps: { ...attrs, ...omit(theirProps, ['modelValue', 'defaultValue', 'by']) },
          slot: {},
          attrs,
          slots,
          name: 'RadioGroup',
        }),
      ])
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
    id: { type: String, default: () => `headlessui-radiogroup-option-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useRadioGroupContext('RadioGroupOption')
    let labelledby = useLabels({ name: 'RadioGroupLabel' })
    let describedby = useDescriptions({ name: 'RadioGroupDescription' })

    let optionRef = ref<HTMLElement | null>(null)
    let propsRef = computed(() => ({ value: props.value, disabled: props.disabled }))
    let state = ref(OptionState.Empty)

    expose({ el: optionRef, $el: optionRef })

    let element = computed(() => dom(optionRef))
    onMounted(() => api.registerOption({ id: props.id, element, propsRef }))
    onUnmounted(() => api.unregisterOption(props.id))

    let isFirstOption = computed(() => api.firstOption.value?.id === props.id)
    let disabled = computed(() => api.disabled.value || props.disabled)
    let checked = computed(() => api.compare(toRaw(api.value.value), toRaw(props.value)))
    let tabIndex = computed(() => {
      if (disabled.value) return -1
      if (checked.value) return 0
      if (!api.containsCheckedOption.value && isFirstOption.value) return 0
      return -1
    })

    function handleClick() {
      if (!api.change(props.value)) return

      state.value |= OptionState.Active
      dom(optionRef)?.focus()
    }

    function handleFocus() {
      state.value |= OptionState.Active
    }

    function handleBlur() {
      state.value &= ~OptionState.Active
    }

    return () => {
      let { id, value: _value, disabled: _disabled, ...theirProps } = props

      let slot = {
        checked: checked.value,
        disabled: disabled.value,
        active: Boolean(state.value & OptionState.Active),
      }

      let ourProps = {
        id,
        ref: optionRef,
        role: 'radio',
        'aria-checked': checked.value ? 'true' : 'false',
        'aria-labelledby': labelledby.value,
        'aria-describedby': describedby.value,
        'aria-disabled': disabled.value ? true : undefined,
        tabIndex: tabIndex.value,
        onClick: disabled.value ? undefined : handleClick,
        onFocus: disabled.value ? undefined : handleFocus,
        onBlur: disabled.value ? undefined : handleBlur,
      }

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: 'RadioGroupOption',
      })
    }
  },
})

// ---

export let RadioGroupLabel = Label
export let RadioGroupDescription = Description
