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
} from 'vue'
import { match } from '../../utils/match'
import { render } from '../../utils/render'
import { useId } from '../../hooks/use-id'

enum MenuStates {
  Open,
  Closed,
}

// TODO: This must already exist somewhere, right? 🤔
// Ref: https://www.w3.org/TR/uievents-key/#named-key-attribute-values
enum Key {
  Space = ' ',
  Enter = 'Enter',
  Escape = 'Escape',
  Backspace = 'Backspace',

  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',

  Home = 'Home',
  End = 'End',

  PageUp = 'PageUp',
  PageDown = 'PageDown',

  Tab = 'Tab',
}

enum Focus {
  FirstItem,
  PreviousItem,
  NextItem,
  LastItem,
  SpecificItem,
  Nothing,
}

type MenuItemDataRef = Ref<{ textValue: string; disabled: boolean }>
type StateDefinition = {
  // State
  menuState: Ref<MenuStates>
  buttonRef: Ref<HTMLButtonElement | null>
  itemsRef: Ref<HTMLDivElement | null>
  items: Ref<{ id: string; dataRef: MenuItemDataRef }[]>
  searchQuery: Ref<string>
  activeItemIndex: Ref<number | null>

  // State mutators
  toggleMenu(): void
  closeMenu(): void
  openMenu(): void
  goToItem(focus: Focus, id?: string): void
  search(value: string): void
  clearSearch(): void
  registerItem(id: string, dataRef: MenuItemDataRef): void
  unregisterItem(id: string): void
}

const MenuContext = Symbol('MenuContext') as InjectionKey<StateDefinition>

function useMenuContext(component: string) {
  const context = inject(MenuContext)

  if (context === undefined) {
    const err = new Error(`<${component} /> is missing a parent <Menu /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext)
    throw err
  }

  return context
}

export const Menu = defineComponent({
  props: { as: { type: [Object, String], default: 'template' } },
  setup(props, { slots, attrs }) {
    const menuState = ref<StateDefinition['menuState']['value']>(MenuStates.Closed)
    const buttonRef = ref<StateDefinition['buttonRef']['value']>(null)
    const itemsRef = ref<StateDefinition['itemsRef']['value']>(null)
    const items = ref<StateDefinition['items']['value']>([])
    const searchQuery = ref<StateDefinition['searchQuery']['value']>('')
    const activeItemIndex = ref<StateDefinition['activeItemIndex']['value']>(null)

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
      menuState,
      buttonRef,
      itemsRef,
      items,
      searchQuery,
      activeItemIndex,
      toggleMenu() {
        menuState.value = match(menuState.value, {
          [MenuStates.Closed]: MenuStates.Open,
          [MenuStates.Open]: MenuStates.Closed,
        })
      },
      closeMenu: () => (menuState.value = MenuStates.Closed),
      openMenu: () => (menuState.value = MenuStates.Open),
      goToItem(focus: Focus, id?: string) {
        const nextActiveItemIndex = calculateActiveItemIndex(focus, id)
        if (searchQuery.value === '' && activeItemIndex.value === nextActiveItemIndex) return
        searchQuery.value = ''
        activeItemIndex.value = nextActiveItemIndex
      },
      search(value: string) {
        searchQuery.value += value

        const match = items.value.findIndex(
          item => item.dataRef.textValue.startsWith(searchQuery.value) && !item.dataRef.disabled
        )

        if (match === -1 || match === activeItemIndex.value) {
          return
        }

        activeItemIndex.value = match
      },
      clearSearch() {
        searchQuery.value = ''
      },
      registerItem(id: string, dataRef: MenuItemDataRef) {
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
    }

    onMounted(() => {
      function handler(event: PointerEvent) {
        if (event.defaultPrevented) return
        if (menuState.value !== MenuStates.Open) return

        if (!itemsRef.value?.contains(event.target as HTMLElement)) {
          api.closeMenu()
          nextTick(() => buttonRef.value?.focus())
        }
      }

      window.addEventListener('pointerdown', handler)
      onUnmounted(() => window.removeEventListener('pointerdown', handler))
    })

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(MenuContext, api)

    return () => {
      const slot = { open: menuState.value === MenuStates.Open }
      return render({ props, slot, slots, attrs })
    }
  },
})

export const MenuButton = defineComponent({
  props: { as: { type: [Object, String], default: 'button' } },
  render() {
    const api = useMenuContext('MenuButton')

    const slot = { open: api.menuState.value === MenuStates.Open }
    const propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'button',
      'aria-haspopup': true,
      'aria-controls': api.itemsRef.value?.id,
      'aria-expanded': api.menuState.value === MenuStates.Open ? true : undefined,
      onKeyDown: this.handleKeyDown,
      onFocus: this.handleFocus,
      onPointerUp: this.handlePointerUp,
      onPointerDown: this.handlePointerDown,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
    })
  },
  setup() {
    const api = useMenuContext('MenuButton')
    const id = `headlessui-menu-button-${useId()}`

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Key.Space:
        case Key.Enter:
        case Key.ArrowDown:
          event.preventDefault()
          api.openMenu()
          nextTick(() => {
            api.itemsRef.value?.focus()
            api.goToItem(Focus.FirstItem)
          })
          break

        case Key.ArrowUp:
          event.preventDefault()
          api.openMenu()
          nextTick(() => {
            api.itemsRef.value?.focus()
            api.goToItem(Focus.LastItem)
          })
          break
      }
    }

    function handlePointerDown(event: PointerEvent) {
      // We have a `pointerdown` event listener in the menu for the 'outside click', so we just want
      // to prevent going there if we happen to click this button.
      event.preventDefault()
    }

    function handlePointerUp() {
      api.toggleMenu()
      nextTick(() => api.itemsRef.value?.focus())
    }

    function handleFocus() {
      if (api.menuState.value === MenuStates.Open) api.itemsRef.value?.focus()
    }

    return {
      id,
      el: api.buttonRef,
      handleKeyDown,
      handlePointerDown,
      handlePointerUp,
      handleFocus,
    }
  },
})

export const MenuItems = defineComponent({
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
  },
  render() {
    const api = useMenuContext('MenuItems')

    // `static` is a reserved keyword, therefore aliasing it...
    const { static: isStatic, ...passThroughProps } = this.$props

    if (!isStatic && api.menuState.value === MenuStates.Closed) return null

    const slot = { open: api.menuState.value === MenuStates.Open }
    const propsWeControl = {
      'aria-activedescendant':
        api.activeItemIndex.value === null
          ? undefined
          : api.items.value[api.activeItemIndex.value]?.id,
      'aria-labelledby': api.buttonRef.value?.id,
      id: this.id,
      onKeyDown: this.handleKeyDown,
      role: 'menu',
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
    const api = useMenuContext('MenuItems')
    const id = `headlessui-menu-items-${useId()}`
    const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    function handleKeyDown(event: KeyboardEvent) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value)

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Key.Enter:
          api.closeMenu()
          if (api.activeItemIndex.value !== null) {
            const { id } = api.items.value[api.activeItemIndex.value]
            document.getElementById(id)?.click()
            nextTick(() => api.buttonRef.value?.focus())
          }
          break

        case Key.ArrowDown:
          return api.goToItem(Focus.NextItem)

        case Key.ArrowUp:
          return api.goToItem(Focus.PreviousItem)

        case Key.Home:
        case Key.PageUp:
          return api.goToItem(Focus.FirstItem)

        case Key.End:
        case Key.PageDown:
          return api.goToItem(Focus.LastItem)

        case Key.Escape:
          api.closeMenu()
          nextTick(() => api.buttonRef.value?.focus())
          break

        case Key.Tab:
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

export const MenuItem = defineComponent({
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  setup(props, { slots, attrs }) {
    const api = useMenuContext('MenuItem')
    const id = `headlessui-menu-item-${useId()}`
    const { disabled, class: defaultClass, className = defaultClass } = props

    const active = computed(() => {
      return api.activeItemIndex.value !== null
        ? api.items.value[api.activeItemIndex.value].id === id
        : false
    })

    const dataRef = ref<MenuItemDataRef['value']>({ disabled: disabled, textValue: '' })
    onMounted(() => {
      const textValue = document
        .getElementById(id)
        ?.textContent?.toLowerCase()
        .trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerItem(id, dataRef))
    onUnmounted(() => api.unregisterItem(id))

    function handlePointerEnter() {
      if (disabled) return
      api.goToItem(Focus.SpecificItem, id)
    }

    function handleFocus() {
      if (disabled) return api.goToItem(Focus.Nothing)
      api.goToItem(Focus.SpecificItem, id)
    }

    function handlePointerLeave() {
      if (disabled) return
      api.goToItem(Focus.Nothing)
    }

    function handleMouseMove() {
      if (disabled) return
      if (active.value) return
      api.goToItem(Focus.SpecificItem, id)
    }

    function handlePointerUp(event: PointerEvent) {
      if (disabled) return
      event.preventDefault()
      api.closeMenu()
      nextTick(() => api.buttonRef.value?.focus())
    }

    function handleClick(event: MouseEvent) {
      if (disabled) return event.preventDefault()
    }

    return () => {
      const slot = { active: active.value, disabled }
      const propsWeControl = {
        id,
        role: 'menuitem',
        tabIndex: -1,
        class: resolvePropValue(className, slot),
        disabled: disabled === true ? disabled : undefined,
        'aria-disabled': disabled === true ? disabled : undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onMouseMove: handleMouseMove,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        onPointerUp: handlePointerUp,
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

function resolvePropValue<TProperty, TBag>(property: TProperty, bag: TBag) {
  if (property === undefined) return undefined
  if (typeof property === 'function') return property(bag)
  return property
}
