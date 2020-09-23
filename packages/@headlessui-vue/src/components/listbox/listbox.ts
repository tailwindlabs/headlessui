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
  FirstItem,
  PreviousItem,
  NextItem,
  LastItem,
  SpecificItem,
  Nothing,
}

type ListboxItemDataRef = Ref<{ textValue: string; disabled: boolean; value: unknown }>
type StateDefinition = {
  // State
  listboxState: Ref<ListboxStates>
  value: ComputedRef<unknown>
  labelRef: Ref<HTMLLabelElement | null>
  buttonRef: Ref<HTMLButtonElement | null>
  itemsRef: Ref<HTMLDivElement | null>
  items: Ref<{ id: string; dataRef: ListboxItemDataRef }[]>
  searchQuery: Ref<string>
  activeItemIndex: Ref<number | null>

  // State mutators
  closeListbox(): void
  openListbox(): void
  goToItem(focus: Focus, id?: string): void
  search(value: string): void
  clearSearch(): void
  registerItem(id: string, dataRef: ListboxItemDataRef): void
  unregisterItem(id: string): void
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
    const itemsRef = ref<StateDefinition['itemsRef']['value']>(null)
    const items = ref<StateDefinition['items']['value']>([])
    const searchQuery = ref<StateDefinition['searchQuery']['value']>('')
    const activeItemIndex = ref<StateDefinition['activeItemIndex']['value']>(null)

    const value = computed(() => props.modelValue)

    function calculateActiveItemIndex(focus: Focus, id?: string) {
      if (items.value.length <= 0) return null

      const currentActiveItemIndex = activeItemIndex.value ?? -1

      const nextActiveIndex = match(focus, {
        [Focus.FirstItem]: () => items.value.findIndex(item => !item.dataRef.disabled),
        [Focus.PreviousItem]: () => {
          const idx = items.value
            .slice()
            .reverse()
            .findIndex((item, idx, all) => {
              if (currentActiveItemIndex !== -1 && all.length - idx - 1 >= currentActiveItemIndex)
                return false
              return !item.dataRef.disabled
            })
          if (idx === -1) return idx
          return items.value.length - 1 - idx
        },
        [Focus.NextItem]: () => {
          return items.value.findIndex((item, idx) => {
            if (idx <= currentActiveItemIndex) return false
            return !item.dataRef.disabled
          })
        },
        [Focus.LastItem]: () => {
          const idx = items.value
            .slice()
            .reverse()
            .findIndex(item => !item.dataRef.disabled)
          if (idx === -1) return idx
          return items.value.length - 1 - idx
        },
        [Focus.SpecificItem]: () => items.value.findIndex(item => item.id === id),
        [Focus.Nothing]: () => null,
      })

      if (nextActiveIndex === -1) return activeItemIndex.value
      return nextActiveIndex
    }

    const api = {
      listboxState,
      value,
      labelRef,
      buttonRef,
      itemsRef,
      items,
      searchQuery,
      activeItemIndex,
      closeListbox: () => (listboxState.value = ListboxStates.Closed),
      openListbox: () => (listboxState.value = ListboxStates.Open),
      goToItem(focus: Focus, id?: string) {
        const nextActiveItemIndex = calculateActiveItemIndex(focus, id)
        if (searchQuery.value === '' && activeItemIndex.value === nextActiveItemIndex) return
        searchQuery.value = ''
        activeItemIndex.value = nextActiveItemIndex
      },
      search(value: string) {
        searchQuery.value += value

        const match = items.value.findIndex(
          item => !item.dataRef.disabled && item.dataRef.textValue.startsWith(searchQuery.value)
        )

        if (match === -1 || match === activeItemIndex.value) {
          return
        }

        activeItemIndex.value = match
      },
      clearSearch() {
        searchQuery.value = ''
      },
      registerItem(id: string, dataRef: ListboxItemDataRef) {
        // @ts-expect-error The expected type comes from property 'dataRef' which is declared here on type '{ id: string; dataRef: { textValue: string; disabled: boolean; }; }'
        items.value.push({ id, dataRef })
      },
      unregisterItem(id: string) {
        const nextItems = items.value.slice()
        const currentActiveItem =
          activeItemIndex.value !== null ? nextItems[activeItemIndex.value] : null
        const idx = nextItems.findIndex(a => a.id === id)
        if (idx !== -1) nextItems.splice(idx, 1)
        items.value = nextItems
        activeItemIndex.value = (() => {
          if (idx === activeItemIndex.value) return null
          if (currentActiveItem === null) return null

          // If we removed the item before the actual active index, then it would be out of sync. To
          // fix this, we will find the correct (new) index position.
          return nextItems.indexOf(currentActiveItem)
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

        if (!itemsRef.value?.contains(event.target as HTMLElement)) {
          api.closeListbox()
          if (!event.defaultPrevented) buttonRef.value?.focus()
        }
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
      'aria-controls': api.itemsRef.value?.id,
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
            api.itemsRef.value?.focus()
            if (!api.value.value) api.goToItem(Focus.FirstItem)
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            api.itemsRef.value?.focus()
            if (!api.value.value) api.goToItem(Focus.LastItem)
          })
          break
      }
    }

    function handlePointerUp(event: MouseEvent) {
      if (api.listboxState.value === ListboxStates.Open) {
        api.closeListbox()
      } else {
        event.preventDefault()
        api.openListbox()
        nextTick(() => api.itemsRef.value?.focus())
      }
    }

    function handleFocus() {
      if (api.listboxState.value === ListboxStates.Open) return api.itemsRef.value?.focus()
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

export const ListboxItems = defineComponent({
  name: 'ListboxItems',
  props: {
    as: { type: [Object, String], default: 'ul' },
    static: { type: Boolean, default: false },
  },
  render() {
    const api = useListboxContext('ListboxItems')

    // `static` is a reserved keyword, therefore aliasing it...
    const { static: isStatic, ...passThroughProps } = this.$props

    if (!isStatic && api.listboxState.value === ListboxStates.Closed) return null

    const slot = { open: api.listboxState.value === ListboxStates.Open }
    const propsWeControl = {
      'aria-activedescendant':
        api.activeItemIndex.value === null
          ? undefined
          : api.items.value[api.activeItemIndex.value]?.id,
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
    const api = useListboxContext('ListboxItems')
    const id = `headlessui-listbox-items-${useId()}`
    const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    function handleKeyDown(event: KeyboardEvent) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value)

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Falthrough is expected here
        case Keys.Space:
          if (api.searchQuery.value !== '') return api.search(event.key)
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          api.closeListbox()
          if (api.activeItemIndex.value !== null) {
            const { dataRef } = api.items.value[api.activeItemIndex.value]
            api.select(dataRef.value)
            nextTick(() => api.buttonRef.value?.focus())
          }
          break

        case Keys.ArrowDown:
          event.preventDefault()
          return api.goToItem(Focus.NextItem)

        case Keys.ArrowUp:
          event.preventDefault()
          return api.goToItem(Focus.PreviousItem)

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          return api.goToItem(Focus.FirstItem)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          return api.goToItem(Focus.LastItem)

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
      el: api.itemsRef,
      handleKeyDown,
    }
  },
})

export const ListboxItem = defineComponent({
  name: 'ListboxItem',
  props: {
    as: { type: [Object, String], default: 'li' },
    value: { type: [Object, String], default: null },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  setup(props, { slots, attrs }) {
    const api = useListboxContext('ListboxItem')
    const id = `headlessui-listbox-item-${useId()}`
    const { disabled, class: defaultClass, className = defaultClass, value } = props

    const active = computed(() => {
      return api.activeItemIndex.value !== null
        ? api.items.value[api.activeItemIndex.value].id === id
        : false
    })

    const selected = computed(() => api.value.value === value)

    const dataRef = ref<ListboxItemDataRef['value']>({ disabled, value, textValue: '' })
    onMounted(() => {
      const textValue = document
        .getElementById(id)
        ?.textContent?.toLowerCase()
        .trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerItem(id, dataRef))
    onUnmounted(() => api.unregisterItem(id))

    onMounted(() => {
      if (!selected.value) return
      api.goToItem(Focus.SpecificItem, id)
      document.getElementById(id)?.focus?.()
    })

    function handleClick(event: MouseEvent) {
      if (disabled) return event.preventDefault()
      api.select(value)
      api.closeListbox()
      nextTick(() => api.buttonRef.value?.focus())
    }

    function handleFocus() {
      if (disabled) return api.goToItem(Focus.Nothing)
      api.goToItem(Focus.SpecificItem, id)
    }

    function handlePointerMove() {
      if (disabled) return
      if (active.value) return
      api.goToItem(Focus.SpecificItem, id)
    }

    function handlePointerLeave() {
      if (disabled) return
      api.goToItem(Focus.Nothing)
    }

    return () => {
      const slot = { active: active.value, selected: selected.value, disabled }
      const propsWeControl = {
        id,
        role: 'option',
        tabIndex: -1,
        class: resolvePropValue(className, slot),
        disabled: disabled === true ? disabled : undefined,
        'aria-disabled': disabled === true ? disabled : undefined,
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
