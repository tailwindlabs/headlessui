import {
  defineComponent,
  ref,
  provide,
  inject,
  onMounted,
  onUnmounted,
  computed,
  nextTick,
  InjectionKey,
  Ref,
  ComputedRef,
  watchEffect,
  toRaw,
} from 'vue'
import { match } from '../../utils/match'
import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'

enum ListboxStates {
  Open,
  Closed,
}

enum Focus {
  First,
  Previous,
  Next,
  Last,
  Specific,
  Nothing,
}

type ListboxOptionDataRef = Ref<{ textValue: string; disabled: boolean; value: unknown }>
type StateDefinition = {
  // State
  listboxState: Ref<ListboxStates>
  value: ComputedRef<unknown>
  labelRef: Ref<HTMLLabelElement | null>
  buttonRef: Ref<HTMLButtonElement | null>
  optionsRef: Ref<HTMLDivElement | null>
  options: Ref<{ id: string; dataRef: ListboxOptionDataRef }[]>
  searchQuery: Ref<string>
  activeOptionIndex: Ref<number | null>

  // State mutators
  closeListbox(): void
  openListbox(): void
  goToOption(focus: Focus, id?: string): void
  search(value: string): void
  clearSearch(): void
  registerOption(id: string, dataRef: ListboxOptionDataRef): void
  unregisterOption(id: string): void
  select(value: unknown): void
}

const ListboxContext = Symbol('ListboxContext') as InjectionKey<StateDefinition>

function useListboxContext(component: string) {
  const context = inject(ListboxContext)

  if (context === undefined) {
    const err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext)
    throw err
  }

  return context
}

// ---

export const Listbox = defineComponent({
  name: 'Listbox',
  props: {
    as: { type: [Object, String], default: 'template' },
    modelValue: { type: [Object, String], default: null },
  },
  setup(props, { slots, attrs, emit }) {
    const { modelValue, ...passThroughProps } = props
    const listboxState = ref<StateDefinition['listboxState']['value']>(ListboxStates.Closed)
    const labelRef = ref<StateDefinition['labelRef']['value']>(null)
    const buttonRef = ref<StateDefinition['buttonRef']['value']>(null)
    const optionsRef = ref<StateDefinition['optionsRef']['value']>(null)
    const options = ref<StateDefinition['options']['value']>([])
    const searchQuery = ref<StateDefinition['searchQuery']['value']>('')
    const activeOptionIndex = ref<StateDefinition['activeOptionIndex']['value']>(null)

    const value = computed(() => props.modelValue)

    function calculateActiveOptionIndex(focus: Focus, id?: string) {
      if (options.value.length <= 0) return null

      const currentActiveOptionIndex = activeOptionIndex.value ?? -1

      const nextActiveIndex = match(focus, {
        [Focus.First]: () => options.value.findIndex(option => !option.dataRef.disabled),
        [Focus.Previous]: () => {
          const idx = options.value
            .slice()
            .reverse()
            .findIndex((option, idx, all) => {
              if (
                currentActiveOptionIndex !== -1 &&
                all.length - idx - 1 >= currentActiveOptionIndex
              )
                return false
              return !option.dataRef.disabled
            })
          if (idx === -1) return idx
          return options.value.length - 1 - idx
        },
        [Focus.Next]: () => {
          return options.value.findIndex((option, idx) => {
            if (idx <= currentActiveOptionIndex) return false
            return !option.dataRef.disabled
          })
        },
        [Focus.Last]: () => {
          const idx = options.value
            .slice()
            .reverse()
            .findIndex(option => !option.dataRef.disabled)
          if (idx === -1) return idx
          return options.value.length - 1 - idx
        },
        [Focus.Specific]: () => options.value.findIndex(option => option.id === id),
        [Focus.Nothing]: () => null,
      })

      if (nextActiveIndex === -1) return activeOptionIndex.value
      return nextActiveIndex
    }

    const api = {
      listboxState,
      value,
      labelRef,
      buttonRef,
      optionsRef,
      options,
      searchQuery,
      activeOptionIndex,
      closeListbox: () => (listboxState.value = ListboxStates.Closed),
      openListbox: () => (listboxState.value = ListboxStates.Open),
      goToOption(focus: Focus, id?: string) {
        const nextActiveOptionIndex = calculateActiveOptionIndex(focus, id)
        if (searchQuery.value === '' && activeOptionIndex.value === nextActiveOptionIndex) return
        searchQuery.value = ''
        activeOptionIndex.value = nextActiveOptionIndex
      },
      search(value: string) {
        searchQuery.value += value

        const match = options.value.findIndex(
          option =>
            !option.dataRef.disabled && option.dataRef.textValue.startsWith(searchQuery.value)
        )

        if (match === -1 || match === activeOptionIndex.value) {
          return
        }

        activeOptionIndex.value = match
      },
      clearSearch() {
        searchQuery.value = ''
      },
      registerOption(id: string, dataRef: ListboxOptionDataRef) {
        // @ts-expect-error The expected type comes from property 'dataRef' which is declared here on type '{ id: string; dataRef: { textValue: string; disabled: boolean; }; }'
        options.value.push({ id, dataRef })
      },
      unregisterOption(id: string) {
        const nextOptions = options.value.slice()
        const currentActiveOption =
          activeOptionIndex.value !== null ? nextOptions[activeOptionIndex.value] : null
        const idx = nextOptions.findIndex(a => a.id === id)
        if (idx !== -1) nextOptions.splice(idx, 1)
        options.value = nextOptions
        activeOptionIndex.value = (() => {
          if (idx === activeOptionIndex.value) return null
          if (currentActiveOption === null) return null

          // If we removed the option before the actual active index, then it would be out of sync. To
          // fix this, we will find the correct (new) index position.
          return nextOptions.indexOf(currentActiveOption)
        })()
      },
      select(value: unknown) {
        emit('update:modelValue', value)
      },
    }

    onMounted(() => {
      function handler(event: MouseEvent) {
        if (listboxState.value !== ListboxStates.Open) return
        if (buttonRef.value?.contains(event.target as HTMLElement)) return

        if (!optionsRef.value?.contains(event.target as HTMLElement)) {
          api.closeListbox()
        }
        if (!event.defaultPrevented) nextTick(() => buttonRef.value?.focus())
      }

      window.addEventListener('click', handler)
      onUnmounted(() => window.removeEventListener('click', handler))
    })

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(ListboxContext, api)

    return () => {
      const slot = { open: listboxState.value === ListboxStates.Open }
      return render({ props: passThroughProps, slot, slots, attrs })
    }
  },
})

// ---

export const ListboxLabel = defineComponent({
  name: 'ListboxLabel',
  props: { as: { type: [Object, String], default: 'label' } },
  render() {
    const api = useListboxContext('ListboxLabel')

    const slot = { open: api.listboxState.value === ListboxStates.Open }
    const propsWeControl = {
      id: this.id,
      ref: 'el',
      onPointerUp: this.handlePointerUp,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    const api = useListboxContext('ListboxLabel')
    const id = `headlessui-listbox-label-${useId()}`

    return {
      id,
      el: api.labelRef,
      handlePointerUp() {
        api.buttonRef.value?.focus()
      },
    }
  },
})

// ---

export const ListboxButton = defineComponent({
  name: 'ListboxButton',
  props: { as: { type: [Object, String], default: 'button' } },
  render() {
    const api = useListboxContext('ListboxButton')

    const slot = { open: api.listboxState.value === ListboxStates.Open, focused: this.focused }
    const propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'button',
      'aria-haspopup': true,
      'aria-controls': api.optionsRef.value?.id,
      'aria-expanded': api.listboxState.value === ListboxStates.Open ? true : undefined,
      'aria-labelledby': api.labelRef.value
        ? [api.labelRef.value.id, this.id].join(' ')
        : undefined,
      onKeyDown: this.handleKeyDown,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onPointerUp: this.handlePointerUp,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    const api = useListboxContext('ListboxButton')
    const id = `headlessui-listbox-button-${useId()}`
    const focused = ref(false)

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            api.optionsRef.value?.focus()
            if (!api.value.value) api.goToOption(Focus.First)
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            api.optionsRef.value?.focus()
            if (!api.value.value) api.goToOption(Focus.Last)
          })
          break
      }
    }

    function handlePointerUp(event: MouseEvent) {
      if (api.listboxState.value === ListboxStates.Open) {
        api.closeListbox()
        nextTick(() => api.buttonRef.value?.focus())
      } else {
        event.preventDefault()
        api.openListbox()
        nextTick(() => api.optionsRef.value?.focus())
      }
    }

    function handleFocus() {
      if (api.listboxState.value === ListboxStates.Open) return api.optionsRef.value?.focus()
      focused.value = true
    }

    function handleBlur() {
      focused.value = false
    }

    return {
      id,
      el: api.buttonRef,
      focused,
      handleKeyDown,
      handlePointerUp,
      handleFocus,
      handleBlur,
    }
  },
})

// ---

export const ListboxOptions = defineComponent({
  name: 'ListboxOptions',
  props: {
    as: { type: [Object, String], default: 'ul' },
    static: { type: Boolean, default: false },
  },
  render() {
    const api = useListboxContext('ListboxOptions')

    // `static` is a reserved keyword, therefore aliasing it...
    const { static: isStatic, ...passThroughProps } = this.$props

    if (!isStatic && api.listboxState.value === ListboxStates.Closed) return null

    const slot = { open: api.listboxState.value === ListboxStates.Open }
    const propsWeControl = {
      'aria-activedescendant':
        api.activeOptionIndex.value === null
          ? undefined
          : api.options.value[api.activeOptionIndex.value]?.id,
      'aria-labelledby': api.labelRef.value?.id ?? api.buttonRef.value?.id,
      id: this.id,
      onKeyDown: this.handleKeyDown,
      role: 'listbox',
      tabIndex: 0,
      ref: 'el',
    }

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    const api = useListboxContext('ListboxOptions')
    const id = `headlessui-listbox-options-${useId()}`
    const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    function handleKeyDown(event: KeyboardEvent) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value)

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (api.searchQuery.value !== '') {
            event.preventDefault()
            return api.search(event.key)
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          api.closeListbox()
          if (api.activeOptionIndex.value !== null) {
            const { dataRef } = api.options.value[api.activeOptionIndex.value]
            api.select(dataRef.value)
          }
          nextTick(() => api.buttonRef.value?.focus())
          break

        case Keys.ArrowDown:
          event.preventDefault()
          return api.goToOption(Focus.Next)

        case Keys.ArrowUp:
          event.preventDefault()
          return api.goToOption(Focus.Previous)

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          return api.goToOption(Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          return api.goToOption(Focus.Last)

        case Keys.Escape:
          event.preventDefault()
          api.closeListbox()
          nextTick(() => api.buttonRef.value?.focus())
          break

        case Keys.Tab:
          return event.preventDefault()

        default:
          if (event.key.length === 1) {
            api.search(event.key)
            searchDebounce.value = setTimeout(() => api.clearSearch(), 350)
          }
          break
      }
    }

    return {
      id,
      el: api.optionsRef,
      handleKeyDown,
    }
  },
})

export const ListboxOption = defineComponent({
  name: 'ListboxOption',
  props: {
    as: { type: [Object, String], default: 'li' },
    value: { type: [Object, String], default: null },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  setup(props, { slots, attrs }) {
    const api = useListboxContext('ListboxOption')
    const id = `headlessui-listbox-option-${useId()}`
    const { disabled, class: defaultClass, className = defaultClass, value } = props

    const active = computed(() => {
      return api.activeOptionIndex.value !== null
        ? api.options.value[api.activeOptionIndex.value].id === id
        : false
    })

    const selected = computed(() => toRaw(api.value.value) === toRaw(value))

    const dataRef = ref<ListboxOptionDataRef['value']>({ disabled, value, textValue: '' })
    onMounted(() => {
      const textValue = document
        .getElementById(id)
        ?.textContent?.toLowerCase()
        .trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerOption(id, dataRef))
    onUnmounted(() => api.unregisterOption(id))

    onMounted(() => {
      if (!selected.value) return
      api.goToOption(Focus.Specific, id)
      document.getElementById(id)?.focus?.()
    })

    watchEffect(() => {
      if (!active.value) return
      nextTick(() => document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (disabled) return event.preventDefault()
      api.select(value)
      api.closeListbox()
      nextTick(() => api.buttonRef.value?.focus())
    }

    function handleFocus() {
      if (disabled) return api.goToOption(Focus.Nothing)
      api.goToOption(Focus.Specific, id)
    }

    function handlePointerMove() {
      if (disabled) return
      if (active.value) return
      api.goToOption(Focus.Specific, id)
    }

    function handlePointerLeave() {
      if (disabled) return
      if (!active.value) return
      api.goToOption(Focus.Nothing)
    }

    return () => {
      const slot = { active: active.value, selected: selected.value, disabled }
      const propsWeControl = {
        id,
        role: 'option',
        tabIndex: -1,
        class: resolvePropValue(className, slot),
        'aria-disabled': disabled === true ? true : undefined,
        'aria-selected': selected.value === true ? selected.value : undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerMove: handlePointerMove,
        onPointerLeave: handlePointerLeave,
      }

      return render({
        props: { ...props, ...propsWeControl },
        slot,
        attrs,
        slots,
      })
    }
  },
})

// ---

function resolvePropValue<TProperty, TBag>(property: TProperty, bag: TBag) {
  if (property === undefined) return undefined
  if (typeof property === 'function') return property(bag)
  return property
}
