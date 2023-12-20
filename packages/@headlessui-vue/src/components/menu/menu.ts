import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watchEffect,
  type ComputedRef,
  type InjectionKey,
  type Ref,
  type UnwrapNestedRefs,
} from 'vue'
import { useId } from '../../hooks/use-id'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useTextValue } from '../../hooks/use-text-value'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import { Keys } from '../../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { dom } from '../../utils/dom'
import {
  Focus as FocusManagementFocus,
  FocusableMode,
  focusFrom,
  isFocusableElement,
  restoreFocusIfNecessary,
  sortByDomNode,
} from '../../utils/focus-management'
import { match } from '../../utils/match'
import { Features, render } from '../../utils/render'

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
    useOutsideClick(
      [buttonRef, itemsRef],
      (event, target) => {
        api.closeMenu()

        if (!isFocusableElement(target, FocusableMode.Loose)) {
          event.preventDefault()
          dom(buttonRef)?.focus()
        }
      },
      computed(() => menuState.value === MenuStates.Open)
    )

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
      let slot = { open: menuState.value === MenuStates.Open, close: api.closeMenu }
      return render({ ourProps: {}, theirProps: props, slot, slots, attrs, name: 'Menu' })
    }
  },
})

export let MenuButton = defineComponent({
  name: 'MenuButton',
  props: {
    disabled: { type: Boolean, default: false },
    as: { type: [Object, String], default: 'button' },
    id: { type: String, default: () => `headlessui-menu-button-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useMenuContext('MenuButton')

    expose({ el: api.buttonRef, $el: api.buttonRef })

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

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

      let { id, ...theirProps } = props
      let ourProps = {
        ref: api.buttonRef,
        id,
        type: type.value,
        'aria-haspopup': 'menu',
        'aria-controls': dom(api.itemsRef)?.id,
        'aria-expanded': api.menuState.value === MenuStates.Open,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        onClick: handleClick,
      }

      return render({
        ourProps,
        theirProps,
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
    id: { type: String, default: () => `headlessui-menu-items-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useMenuContext('MenuItems')
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
        // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

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
          restoreFocusIfNecessary(dom(api.buttonRef))
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
          api.closeMenu()
          nextTick(() =>
            focusFrom(
              dom(api.buttonRef),
              event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next
            )
          )
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
        return (usesOpenClosedState.value & State.Open) === State.Open
      }

      return api.menuState.value === MenuStates.Open
    })

    return () => {
      let slot = { open: api.menuState.value === MenuStates.Open }
      let { id, ...theirProps } = props
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

      return render({
        ourProps,
        theirProps,
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
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: Boolean, default: false },
    id: { type: String, default: () => `headlessui-menu-item-${useId()}` },
  },
  setup(props, { slots, attrs, expose }) {
    let api = useMenuContext('MenuItem')
    let internalItemRef = ref<HTMLElement | null>(null)

    expose({ el: internalItemRef, $el: internalItemRef })

    let active = computed(() => {
      return api.activeItemIndex.value !== null
        ? api.items.value[api.activeItemIndex.value].id === props.id
        : false
    })

    let getTextValue = useTextValue(internalItemRef)
    let dataRef = computed<MenuItemData>(() => ({
      disabled: props.disabled,
      get textValue() {
        return getTextValue()
      },
      domRef: internalItemRef,
    }))

    onMounted(() => api.registerItem(props.id, dataRef))
    onUnmounted(() => api.unregisterItem(props.id))

    watchEffect(() => {
      if (api.menuState.value !== MenuStates.Open) return
      if (!active.value) return
      if (api.activationTrigger.value === ActivationTrigger.Pointer) return
      nextTick(() => dom(internalItemRef)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (props.disabled) return event.preventDefault()
      api.closeMenu()
      restoreFocusIfNecessary(dom(api.buttonRef))
    }

    function handleFocus() {
      if (props.disabled) return api.goToItem(Focus.Nothing)
      api.goToItem(Focus.Specific, props.id)
    }

    let pointer = useTrackedPointer()

    function handleEnter(evt: PointerEvent) {
      pointer.update(evt)
    }

    function handleMove(evt: PointerEvent) {
      if (!pointer.wasMoved(evt)) return
      if (props.disabled) return
      if (active.value) return
      api.goToItem(Focus.Specific, props.id, ActivationTrigger.Pointer)
    }

    function handleLeave(evt: PointerEvent) {
      if (!pointer.wasMoved(evt)) return
      if (props.disabled) return
      if (!active.value) return
      api.goToItem(Focus.Nothing)
    }

    return () => {
      let { disabled } = props
      let slot = { active: active.value, disabled, close: api.closeMenu }
      let { id, ...theirProps } = props
      let ourProps = {
        id,
        ref: internalItemRef,
        role: 'menuitem',
        tabIndex: disabled === true ? undefined : -1,
        'aria-disabled': disabled === true ? true : undefined,
        disabled: undefined, // Never forward the `disabled` prop
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerenter: handleEnter,
        onMouseenter: handleEnter,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave,
      }

      return render({
        ourProps,
        theirProps: { ...attrs, ...theirProps },
        slot,
        attrs,
        slots,
        name: 'MenuItem',
      })
    }
  },
})
