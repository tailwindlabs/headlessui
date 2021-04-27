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
  watch,
} from 'vue'

import { Features, render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { calculateActiveIndex, Focus } from '../../utils/calculate-active-index'
import { resolvePropValue } from '../../utils/resolve-prop-value'
import { dom } from '../../utils/dom'
import { useWindowEvent } from '../../hooks/use-window-event'

enum ListboxStates {
  Open,
  Closed,
}

function nextFrame(cb: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(cb))
}

type ListboxOptionDataRef = Ref<{ textValue: string; disabled: boolean; value: unknown }>
type StateDefinition = {
  // State
  listboxState: Ref<ListboxStates>
  value: ComputedRef<unknown>
  labelRef: Ref<HTMLLabelElement | null>
  buttonRef: Ref<HTMLButtonElement | null>
  optionsRef: Ref<HTMLDivElement | null>
  disabled: Ref<boolean>
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

let ListboxContext = Symbol('ListboxContext') as InjectionKey<StateDefinition>

function useListboxContext(component: string) {
  let context = inject(ListboxContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext)
    throw err
  }

  return context
}

// ---

export let Listbox = defineComponent({
  name: 'Listbox',
  emits: ['update:modelValue'],
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: [Boolean], default: false },
    modelValue: { type: [Object, String, Number, Boolean] },
  },
  setup(props, { slots, attrs, emit }) {
    let { modelValue, disabled, ...passThroughProps } = props
    let listboxState = ref<StateDefinition['listboxState']['value']>(ListboxStates.Closed)
    let labelRef = ref<StateDefinition['labelRef']['value']>(null)
    let buttonRef = ref<StateDefinition['buttonRef']['value']>(null)
    let optionsRef = ref<StateDefinition['optionsRef']['value']>(null)
    let options = ref<StateDefinition['options']['value']>([])
    let searchQuery = ref<StateDefinition['searchQuery']['value']>('')
    let activeOptionIndex = ref<StateDefinition['activeOptionIndex']['value']>(null)

    let value = computed(() => props.modelValue)

    let api = {
      listboxState,
      value,
      labelRef,
      buttonRef,
      optionsRef,
      disabled,
      options,
      searchQuery,
      activeOptionIndex,
      closeListbox() {
        if (disabled) return
        if (listboxState.value === ListboxStates.Closed) return
        listboxState.value = ListboxStates.Closed
        activeOptionIndex.value = null
      },
      openListbox() {
        if (disabled) return
        if (listboxState.value === ListboxStates.Open) return
        listboxState.value = ListboxStates.Open
      },
      goToOption(focus: Focus, id?: string) {
        if (disabled) return
        if (listboxState.value === ListboxStates.Closed) return

        let nextActiveOptionIndex = calculateActiveIndex(
          focus === Focus.Specific
            ? { focus: Focus.Specific, id: id! }
            : { focus: focus as Exclude<Focus, Focus.Specific> },
          {
            resolveItems: () => options.value,
            resolveActiveIndex: () => activeOptionIndex.value,
            resolveId: option => option.id,
            resolveDisabled: option => option.dataRef.disabled,
          }
        )

        if (searchQuery.value === '' && activeOptionIndex.value === nextActiveOptionIndex) return
        searchQuery.value = ''
        activeOptionIndex.value = nextActiveOptionIndex
      },
      search(value: string) {
        if (disabled) return
        if (listboxState.value === ListboxStates.Closed) return

        searchQuery.value += value.toLowerCase()

        let match = options.value.findIndex(
          option =>
            !option.dataRef.disabled && option.dataRef.textValue.startsWith(searchQuery.value)
        )

        if (match === -1 || match === activeOptionIndex.value) return
        activeOptionIndex.value = match
      },
      clearSearch() {
        if (disabled) return
        if (listboxState.value === ListboxStates.Closed) return
        if (searchQuery.value === '') return

        searchQuery.value = ''
      },
      registerOption(id: string, dataRef: ListboxOptionDataRef) {
        // @ts-expect-error The expected type comes from property 'dataRef' which is declared here on type '{ id: string; dataRef: { textValue: string; disabled: boolean; }; }'
        options.value.push({ id, dataRef })
      },
      unregisterOption(id: string) {
        let nextOptions = options.value.slice()
        let currentActiveOption =
          activeOptionIndex.value !== null ? nextOptions[activeOptionIndex.value] : null
        let idx = nextOptions.findIndex(a => a.id === id)
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
        if (disabled) return
        emit('update:modelValue', value)
      },
    }

    useWindowEvent('mousedown', event => {
      let target = event.target as HTMLElement
      let active = document.activeElement

      if (listboxState.value !== ListboxStates.Open) return
      if (dom(buttonRef)?.contains(target)) return

      if (!dom(optionsRef)?.contains(target)) api.closeListbox()
      if (active !== document.body && active?.contains(target)) return // Keep focus on newly clicked/focused element
      if (!event.defaultPrevented) dom(buttonRef)?.focus({ preventScroll: true })
    })

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(ListboxContext, api)

    return () => {
      let slot = { open: listboxState.value === ListboxStates.Open, disabled }
      return render({ props: passThroughProps, slot, slots, attrs, name: 'Listbox' })
    }
  },
})

// ---

export let ListboxLabel = defineComponent({
  name: 'ListboxLabel',
  props: { as: { type: [Object, String], default: 'label' } },
  render() {
    let api = useListboxContext('ListboxLabel')

    let slot = { open: api.listboxState.value === ListboxStates.Open, disabled: api.disabled }
    let propsWeControl = { id: this.id, ref: 'el', onClick: this.handleClick }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'ListboxLabel',
    })
  },
  setup() {
    let api = useListboxContext('ListboxLabel')
    let id = `headlessui-listbox-label-${useId()}`

    return {
      id,
      el: api.labelRef,
      handleClick() {
        dom(api.buttonRef)?.focus({ preventScroll: true })
      },
    }
  },
})

// ---

export let ListboxButton = defineComponent({
  name: 'ListboxButton',
  props: {
    as: { type: [Object, String], default: 'button' },
  },
  render() {
    let api = useListboxContext('ListboxButton')

    let slot = { open: api.listboxState.value === ListboxStates.Open, disabled: api.disabled }
    let propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'button',
      'aria-haspopup': true,
      'aria-controls': dom(api.optionsRef)?.id,
      'aria-expanded': api.listboxState.value === ListboxStates.Open ? true : undefined,
      'aria-labelledby': api.labelRef.value
        ? [dom(api.labelRef)?.id, this.id].join(' ')
        : undefined,
      disabled: api.disabled,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      onClick: this.handleClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'ListboxButton',
    })
  },
  setup() {
    let api = useListboxContext('ListboxButton')
    let id = `headlessui-listbox-button-${useId()}`

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            dom(api.optionsRef)?.focus({ preventScroll: true })
            if (!api.value.value) api.goToOption(Focus.First)
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            dom(api.optionsRef)?.focus({ preventScroll: true })
            if (!api.value.value) api.goToOption(Focus.Last)
          })
          break
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      switch (event.key) {
        case Keys.Space:
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault()
          break
      }
    }

    function handleClick(event: MouseEvent) {
      if (api.disabled) return
      if (api.listboxState.value === ListboxStates.Open) {
        api.closeListbox()
        nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
      } else {
        event.preventDefault()
        api.openListbox()
        nextFrame(() => dom(api.optionsRef)?.focus({ preventScroll: true }))
      }
    }

    return { id, el: api.buttonRef, handleKeyDown, handleKeyUp, handleClick }
  },
})

// ---

export let ListboxOptions = defineComponent({
  name: 'ListboxOptions',
  props: {
    as: { type: [Object, String], default: 'ul' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
  },
  render() {
    let api = useListboxContext('ListboxOptions')

    let slot = { open: api.listboxState.value === ListboxStates.Open }
    let propsWeControl = {
      'aria-activedescendant':
        api.activeOptionIndex.value === null
          ? undefined
          : api.options.value[api.activeOptionIndex.value]?.id,
      'aria-labelledby': dom(api.labelRef)?.id ?? dom(api.buttonRef)?.id,
      id: this.id,
      onKeydown: this.handleKeyDown,
      role: 'listbox',
      tabIndex: 0,
      ref: 'el',
    }
    let passThroughProps = this.$props

    return render({
      props: { ...passThroughProps, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: slot.open,
      name: 'ListboxOptions',
    })
  },
  setup() {
    let api = useListboxContext('ListboxOptions')
    let id = `headlessui-listbox-options-${useId()}`
    let searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    function handleKeyDown(event: KeyboardEvent) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value)

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (api.searchQuery.value !== '') {
            event.preventDefault()
            event.stopPropagation()
            return api.search(event.key)
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          if (api.activeOptionIndex.value !== null) {
            let { dataRef } = api.options.value[api.activeOptionIndex.value]
            api.select(dataRef.value)
          }
          api.closeListbox()
          nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
          break

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Next)

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Previous)

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Last)

        case Keys.Escape:
          event.preventDefault()
          event.stopPropagation()
          api.closeListbox()
          nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
          break

        case Keys.Tab:
          event.preventDefault()
          event.stopPropagation()
          break

        default:
          if (event.key.length === 1) {
            api.search(event.key)
            searchDebounce.value = setTimeout(() => api.clearSearch(), 350)
          }
          break
      }
    }

    return { id, el: api.optionsRef, handleKeyDown }
  },
})

export let ListboxOption = defineComponent({
  name: 'ListboxOption',
  props: {
    as: { type: [Object, String], default: 'li' },
    value: { type: [Object, String] },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  setup(props, { slots, attrs }) {
    let api = useListboxContext('ListboxOption')
    let id = `headlessui-listbox-option-${useId()}`
    let { disabled, class: defaultClass, className = defaultClass, value } = props

    let active = computed(() => {
      return api.activeOptionIndex.value !== null
        ? api.options.value[api.activeOptionIndex.value].id === id
        : false
    })

    let selected = computed(() => toRaw(api.value.value) === toRaw(value))

    let dataRef = ref<ListboxOptionDataRef['value']>({ disabled, value, textValue: '' })
    onMounted(() => {
      let textValue = document
        .getElementById(id)
        ?.textContent?.toLowerCase()
        .trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerOption(id, dataRef))
    onUnmounted(() => api.unregisterOption(id))

    onMounted(() => {
      watch(
        [api.listboxState, selected],
        () => {
          if (api.listboxState.value !== ListboxStates.Open) return
          if (!selected.value) return
          api.goToOption(Focus.Specific, id)
          document.getElementById(id)?.focus?.()
        },
        { immediate: true }
      )
    })

    watchEffect(() => {
      if (api.listboxState.value !== ListboxStates.Open) return
      if (!active.value) return
      nextTick(() => document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (disabled) return event.preventDefault()
      api.select(value)
      api.closeListbox()
      nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
    }

    function handleFocus() {
      if (disabled) return api.goToOption(Focus.Nothing)
      api.goToOption(Focus.Specific, id)
    }

    function handleMove() {
      if (disabled) return
      if (active.value) return
      api.goToOption(Focus.Specific, id)
    }

    function handleLeave() {
      if (disabled) return
      if (!active.value) return
      api.goToOption(Focus.Nothing)
    }

    return () => {
      let slot = { active: active.value, selected: selected.value, disabled }
      let propsWeControl = {
        id,
        role: 'option',
        tabIndex: -1,
        class: resolvePropValue(className, slot),
        'aria-disabled': disabled === true ? true : undefined,
        'aria-selected': selected.value === true ? selected.value : undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave,
      }

      return render({
        props: { ...props, ...propsWeControl },
        slot,
        attrs,
        slots,
        name: 'ListboxOption',
      })
    }
  },
})
