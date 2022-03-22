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
  ComputedRef,
  UnwrapNestedRefs,
} from 'vue'
import { Features, render } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { dom } from '../../utils/dom'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { match } from '../../utils/match'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { FocusableMode, isFocusableElement, sortByDomNode } from '../../utils/focus-management'
import { useOutsideClick } from '../../hooks/use-outside-click'

enum MenuStates {
  Open,
  Closed,
}

enum ActivationTrigger {
  Pointer,
  Other,
}

function nextFrame(cb: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(cb))
}

type MenuItemData = {
  textValue: string
  disabled: boolean
  domRef: Ref<HTMLElement | null>
}
type StateDefinition = {
  // State
  menuState: Ref<MenuStates>
  buttonRef: Ref<HTMLButtonElement | null>
  itemsRef: Ref<HTMLDivElement | null>
  items: Ref<{ id: string; dataRef: ComputedRef<MenuItemData> }[]>
  searchQuery: Ref<string>
  activeItemIndex: Ref<number | null>
  activationTrigger: Ref<ActivationTrigger>

  // State mutators
  closeMenu(): void
  openMenu(): void
  goToItem(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  search(value: string): void
  clearSearch(): void
  registerItem(id: string, dataRef: ComputedRef<MenuItemData>): void
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
    let activationTrigger = ref<StateDefinition['activationTrigger']['value']>(
      ActivationTrigger.Other
    )

    function adjustOrderedState(
      adjustment: (
        items: UnwrapNestedRefs<StateDefinition['items']['value']>
      ) => UnwrapNestedRefs<StateDefinition['items']['value']> = (i) => i
    ) {
      let currentActiveItem =
        activeItemIndex.value !== null ? items.value[activeItemIndex.value] : null

      let sortedItems = sortByDomNode(adjustment(items.value.slice()), (item) =>
        dom(item.dataRef.domRef)
      )

      // If we inserted an item before the current active item then the active item index
      // would be wrong. To fix this, we will re-lookup the correct index.
      let adjustedActiveItemIndex = currentActiveItem
        ? sortedItems.indexOf(currentActiveItem)
        : null

      // Reset to `null` in case the currentActiveItem was removed.
      if (adjustedActiveItemIndex === -1) {
        adjustedActiveItemIndex = null
      }

      return {
        items: sortedItems,
        activeItemIndex: adjustedActiveItemIndex,
      }
    }

    let api = {
      menuState,
      buttonRef,
      itemsRef,
      items,
      searchQuery,
      activeItemIndex,
      activationTrigger,
      closeMenu: () => {
        menuState.value = MenuStates.Closed
        activeItemIndex.value = null
      },
      openMenu: () => (menuState.value = MenuStates.Open),
      goToItem(focus: Focus, id?: string, trigger?: ActivationTrigger) {
        let adjustedState = adjustOrderedState()
        let nextActiveItemIndex = calculateActiveIndex(
          focus === Focus.Specific
            ? { focus: Focus.Specific, id: id! }
            : { focus: focus as Exclude<Focus, Focus.Specific> },
          {
            resolveItems: () => adjustedState.items,
            resolveActiveIndex: () => adjustedState.activeItemIndex,
            resolveId: (item) => item.id,
            resolveDisabled: (item) => item.dataRef.disabled,
          }
        )

        searchQuery.value = ''
        activeItemIndex.value = nextActiveItemIndex
        activationTrigger.value = trigger ?? ActivationTrigger.Other
        items.value = adjustedState.items
      },
      search(value: string) {
        let wasAlreadySearching = searchQuery.value !== ''
        let offset = wasAlreadySearching ? 0 : 1
        searchQuery.value += value.toLowerCase()

        let reOrderedItems =
          activeItemIndex.value !== null
            ? items.value
                .slice(activeItemIndex.value + offset)
                .concat(items.value.slice(0, activeItemIndex.value + offset))
            : items.value

        let matchingItem = reOrderedItems.find(
          (item) => item.dataRef.textValue.startsWith(searchQuery.value) && !item.dataRef.disabled
        )

        let matchIdx = matchingItem ? items.value.indexOf(matchingItem) : -1
        if (matchIdx === -1 || matchIdx === activeItemIndex.value) return

        activeItemIndex.value = matchIdx
        activationTrigger.value = ActivationTrigger.Other
      },
      clearSearch() {
        searchQuery.value = ''
      },
      registerItem(id: string, dataRef: MenuItemData) {
        let adjustedState = adjustOrderedState((items) => {
          return [...items, { id, dataRef }]
        })

        items.value = adjustedState.items
        activeItemIndex.value = adjustedState.activeItemIndex
        activationTrigger.value = ActivationTrigger.Other
      },
      unregisterItem(id: string) {
        let adjustedState = adjustOrderedState((items) => {
          let idx = items.findIndex((a) => a.id === id)
          if (idx !== -1) items.splice(idx, 1)
          return items
        })

        items.value = adjustedState.items
        activeItemIndex.value = adjustedState.activeItemIndex
        activationTrigger.value = ActivationTrigger.Other
      },
    }

    // Handle outside click
    useOutsideClick([buttonRef, itemsRef], (event, target) => {
      if (menuState.value !== MenuStates.Open) return

      api.closeMenu()

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        dom(buttonRef)?.focus()
      }
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
  setup(props, { attrs, slots, expose }) {
    let api = useMenuContext('MenuButton')
    let id = `headlessui-menu-button-${useId()}`

    expose({ el: api.buttonRef, $el: api.buttonRef })

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

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      api.buttonRef
    )

    return () => {
      let slot = { open: api.menuState.value === MenuStates.Open }
      let ourProps = {
        ref: api.buttonRef,
        id,
        type: type.value,
        'aria-haspopup': true,
        'aria-controls': dom(api.itemsRef)?.id,
        'aria-expanded': props.disabled ? undefined : api.menuState.value === MenuStates.Open,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        onClick: handleClick,
      }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'MenuButton',
      })
    }
  },
})

export let MenuItems = defineComponent({
  name: 'MenuItems',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useMenuContext('MenuItems')
    let id = `headlessui-menu-items-${useId()}`
    let searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    expose({ el: api.itemsRef, $el: api.itemsRef })

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
            let activeItem = api.items.value[api.activeItemIndex.value]
            let _activeItem = activeItem as unknown as UnwrapNestedRefs<typeof activeItem>
            dom(_activeItem.dataRef.domRef)?.click()
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

    return () => {
      let slot = { open: api.menuState.value === MenuStates.Open }
      let ourProps = {
        'aria-activedescendant':
          api.activeItemIndex.value === null
            ? undefined
            : api.items.value[api.activeItemIndex.value]?.id,
        'aria-labelledby': dom(api.buttonRef)?.id,
        id,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        role: 'menu',
        tabIndex: 0,
        ref: api.itemsRef,
      }

      let incomingProps = props

      return render({
        props: { ...incomingProps, ...ourProps },
        slot,
        attrs,
        slots,
        features: Features.RenderStrategy | Features.Static,
        visible: visible.value,
        name: 'MenuItems',
      })
    }
  },
})

export let MenuItem = defineComponent({
  name: 'MenuItem',
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs, expose }) {
    let api = useMenuContext('MenuItem')
    let id = `headlessui-menu-item-${useId()}`
    let internalItemRef = ref<HTMLElement | null>(null)

    expose({ el: internalItemRef, $el: internalItemRef })

    let active = computed(() => {
      return api.activeItemIndex.value !== null
        ? api.items.value[api.activeItemIndex.value].id === id
        : false
    })

    let dataRef = computed<MenuItemData>(() => ({
      disabled: props.disabled,
      textValue: '',
      domRef: internalItemRef,
    }))
    onMounted(() => {
      let textValue = dom(internalItemRef)?.textContent?.toLowerCase().trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerItem(id, dataRef))
    onUnmounted(() => api.unregisterItem(id))

    watchEffect(() => {
      if (api.menuState.value !== MenuStates.Open) return
      if (!active.value) return
      if (api.activationTrigger.value === ActivationTrigger.Pointer) return
      nextTick(() => dom(internalItemRef)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (props.disabled) return event.preventDefault()
      api.closeMenu()
      nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
    }

    function handleFocus() {
      if (props.disabled) return api.goToItem(Focus.Nothing)
      api.goToItem(Focus.Specific, id)
    }

    function handleMove() {
      if (props.disabled) return
      if (active.value) return
      api.goToItem(Focus.Specific, id, ActivationTrigger.Pointer)
    }

    function handleLeave() {
      if (props.disabled) return
      if (!active.value) return
      api.goToItem(Focus.Nothing)
    }

    return () => {
      let { disabled } = props
      let slot = { active: active.value, disabled }
      let ourProps = {
        id,
        ref: internalItemRef,
        role: 'menuitem',
        tabIndex: disabled === true ? undefined : -1,
        'aria-disabled': disabled === true ? true : undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave,
      }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'MenuItem',
      })
    }
  },
})
