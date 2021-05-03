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
  watchEffect,
} from 'vue'
import { Features, render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { resolvePropValue } from '../../utils/resolve-prop-value'
import { dom } from '../../utils/dom'
import { useWindowEvent } from '../../hooks/use-window-event'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { match } from '../../utils/match'

enum MenuStates {
  Open,
  Closed,
}

function nextFrame(cb: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(cb))
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
  closeMenu(): void
  openMenu(): void
  goToItem(focus: Focus, id?: string): void
  search(value: string): void
  clearSearch(): void
  registerItem(id: string, dataRef: MenuItemDataRef): void
  unregisterItem(id: string): void
}

let MenuContext = Symbol('MenuContext') as InjectionKey<StateDefinition>

function useMenuContext(component: string) {
  let context = inject(MenuContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Menu /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext)
    throw err
  }

  return context
}

export let Menu = defineComponent({
  name: 'Menu',
  props: { as: { type: [Object, String], default: 'template' } },
  setup(props, { slots, attrs }) {
    let menuState = ref<StateDefinition['menuState']['value']>(MenuStates.Closed)
    let buttonRef = ref<StateDefinition['buttonRef']['value']>(null)
    let itemsRef = ref<StateDefinition['itemsRef']['value']>(null)
    let items = ref<StateDefinition['items']['value']>([])
    let searchQuery = ref<StateDefinition['searchQuery']['value']>('')
    let activeItemIndex = ref<StateDefinition['activeItemIndex']['value']>(null)

    let api = {
      menuState,
      buttonRef,
      itemsRef,
      items,
      searchQuery,
      activeItemIndex,
      closeMenu: () => {
        menuState.value = MenuStates.Closed
        activeItemIndex.value = null
      },
      openMenu: () => (menuState.value = MenuStates.Open),
      goToItem(focus: Focus, id?: string) {
        let nextActiveItemIndex = calculateActiveIndex(
          focus === Focus.Specific
            ? { focus: Focus.Specific, id: id! }
            : { focus: focus as Exclude<Focus, Focus.Specific> },
          {
            resolveItems: () => items.value,
            resolveActiveIndex: () => activeItemIndex.value,
            resolveId: item => item.id,
            resolveDisabled: item => item.dataRef.disabled,
          }
        )

        if (searchQuery.value === '' && activeItemIndex.value === nextActiveItemIndex) return
        searchQuery.value = ''
        activeItemIndex.value = nextActiveItemIndex
      },
      search(value: string) {
        searchQuery.value += value.toLowerCase()

        let match = items.value.findIndex(
          item => item.dataRef.textValue.startsWith(searchQuery.value) && !item.dataRef.disabled
        )

        if (match === -1 || match === activeItemIndex.value) return

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
        let nextItems = items.value.slice()
        let currentActiveItem =
          activeItemIndex.value !== null ? nextItems[activeItemIndex.value] : null
        let idx = nextItems.findIndex(a => a.id === id)
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

    useWindowEvent('mousedown', event => {
      let target = event.target as HTMLElement
      let active = document.activeElement

      if (menuState.value !== MenuStates.Open) return
      if (dom(buttonRef)?.contains(target)) return

      if (!dom(itemsRef)?.contains(target)) api.closeMenu()
      if (active !== document.body && active?.contains(target)) return // Keep focus on newly clicked/focused element
      if (!event.defaultPrevented) dom(buttonRef)?.focus({ preventScroll: true })
    })

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(MenuContext, api)
    useOpenClosedProvider(
      computed(() =>
        match(menuState.value, {
          [MenuStates.Open]: State.Open,
          [MenuStates.Closed]: State.Closed,
        })
      )
    )

    return () => {
      let slot = { open: menuState.value === MenuStates.Open }
      return render({ props, slot, slots, attrs, name: 'Menu' })
    }
  },
})

export let MenuButton = defineComponent({
  name: 'MenuButton',
  props: {
    disabled: { type: Boolean, default: false },
    as: { type: [Object, String], default: 'button' },
  },
  render() {
    let api = useMenuContext('MenuButton')

    let slot = { open: api.menuState.value === MenuStates.Open }
    let propsWeControl = {
      ref: 'el',
      id: this.id,
      type: 'button',
      'aria-haspopup': true,
      'aria-controls': dom(api.itemsRef)?.id,
      'aria-expanded': api.menuState.value === MenuStates.Open ? true : undefined,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      onClick: this.handleClick,
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'MenuButton',
    })
  },
  setup(props) {
    let api = useMenuContext('MenuButton')
    let id = `headlessui-menu-button-${useId()}`

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          api.openMenu()
          nextTick(() => {
            dom(api.itemsRef)?.focus({ preventScroll: true })
            api.goToItem(Focus.First)
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          api.openMenu()
          nextTick(() => {
            dom(api.itemsRef)?.focus({ preventScroll: true })
            api.goToItem(Focus.Last)
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
      if (props.disabled) return
      if (api.menuState.value === MenuStates.Open) {
        api.closeMenu()
        nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
      } else {
        event.preventDefault()
        event.stopPropagation()
        api.openMenu()
        nextFrame(() => dom(api.itemsRef)?.focus({ preventScroll: true }))
      }
    }

    return { id, el: api.buttonRef, handleKeyDown, handleKeyUp, handleClick }
  },
})

export let MenuItems = defineComponent({
  name: 'MenuItems',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
  },
  render() {
    let api = useMenuContext('MenuItems')

    let slot = { open: api.menuState.value === MenuStates.Open }
    let propsWeControl = {
      'aria-activedescendant':
        api.activeItemIndex.value === null
          ? undefined
          : api.items.value[api.activeItemIndex.value]?.id,
      'aria-labelledby': dom(api.buttonRef)?.id,
      id: this.id,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      role: 'menu',
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
      visible: this.visible,
      name: 'MenuItems',
    })
  },
  setup() {
    let api = useMenuContext('MenuItems')
    let id = `headlessui-menu-items-${useId()}`
    let searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    useTreeWalker({
      container: computed(() => dom(api.itemsRef)),
      enabled: computed(() => api.menuState.value === MenuStates.Open),
      accept(node) {
        if (node.getAttribute('role') === 'menuitem') return NodeFilter.FILTER_REJECT
        if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
        return NodeFilter.FILTER_ACCEPT
      },
      walk(node) {
        node.setAttribute('role', 'none')
      },
    })

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
          if (api.activeItemIndex.value !== null) {
            let { id } = api.items.value[api.activeItemIndex.value]
            document.getElementById(id)?.click()
          }
          api.closeMenu()
          nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
          break

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          return api.goToItem(Focus.Next)

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          return api.goToItem(Focus.Previous)

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return api.goToItem(Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return api.goToItem(Focus.Last)

        case Keys.Escape:
          event.preventDefault()
          event.stopPropagation()
          api.closeMenu()
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

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.menuState.value === MenuStates.Open
    })

    return { id, el: api.itemsRef, handleKeyDown, handleKeyUp, visible }
  },
})

export let MenuItem = defineComponent({
  name: 'MenuItem',
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: Boolean, default: false },
    class: { type: [String, Function], required: false },
    className: { type: [String, Function], required: false },
  },
  setup(props, { slots, attrs }) {
    let api = useMenuContext('MenuItem')
    let id = `headlessui-menu-item-${useId()}`
    let { disabled, class: defaultClass, className = defaultClass } = props

    let active = computed(() => {
      return api.activeItemIndex.value !== null
        ? api.items.value[api.activeItemIndex.value].id === id
        : false
    })

    let dataRef = ref<MenuItemDataRef['value']>({ disabled, textValue: '' })
    onMounted(() => {
      let textValue = document
        .getElementById(id)
        ?.textContent?.toLowerCase()
        .trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerItem(id, dataRef))
    onUnmounted(() => api.unregisterItem(id))

    watchEffect(() => {
      if (api.menuState.value !== MenuStates.Open) return
      if (!active.value) return
      nextTick(() => document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (disabled) return event.preventDefault()
      api.closeMenu()
      nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
    }

    function handleFocus() {
      if (disabled) return api.goToItem(Focus.Nothing)
      api.goToItem(Focus.Specific, id)
    }

    function handleMove() {
      if (disabled) return
      if (active.value) return
      api.goToItem(Focus.Specific, id)
    }

    function handleLeave() {
      if (disabled) return
      if (!active.value) return
      api.goToItem(Focus.Nothing)
    }

    return () => {
      let slot = { active: active.value, disabled }
      let propsWeControl = {
        id,
        role: 'menuitem',
        tabIndex: -1,
        class: resolvePropValue(className, slot),
        'aria-disabled': disabled === true ? true : undefined,
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
        name: 'MenuItem',
      })
    }
  },
})
