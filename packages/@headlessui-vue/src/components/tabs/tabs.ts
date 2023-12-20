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
  watch,
  watchEffect,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useId } from '../../hooks/use-id'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { FocusSentinel } from '../../internal/focus-sentinel'
import { Hidden } from '../../internal/hidden'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import { Focus, FocusResult, focusIn, sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { getOwnerDocument } from '../../utils/owner'
import { Features, omit, render } from '../../utils/render'

enum Direction {
  Forwards,
  Backwards,
}

enum Ordering {
  Less = -1,
  Equal = 0,
  Greater = 1,
}

type StateDefinition = {
  // State
  selectedIndex: Ref<number | null>
  orientation: Ref<'vertical' | 'horizontal'>
  activation: Ref<'auto' | 'manual'>

  tabs: Ref<Ref<HTMLElement | null>[]>
  panels: Ref<Ref<HTMLElement | null>[]>

  // State mutators
  setSelectedIndex(index: number): void
  registerTab(tab: Ref<HTMLElement | null>): void
  unregisterTab(tab: Ref<HTMLElement | null>): void
  registerPanel(panel: Ref<HTMLElement | null>): void
  unregisterPanel(panel: Ref<HTMLElement | null>): void
}

let TabsContext = Symbol('TabsContext') as InjectionKey<StateDefinition>

function useTabsContext(component: string) {
  let context = inject(TabsContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <TabGroup /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabsContext)
    throw err
  }

  return context
}

let TabsSSRContext = Symbol('TabsSSRContext') as InjectionKey<
  Ref<{ tabs: string[]; panels: string[] } | null>
>

// ---

export let TabGroup = defineComponent({
  name: 'TabGroup',
  emits: {
    change: (_index: number) => true,
  },
  props: {
    as: { type: [Object, String], default: 'template' },
    selectedIndex: { type: [Number], default: null },
    defaultIndex: { type: [Number], default: 0 },
    vertical: { type: [Boolean], default: false },
    manual: { type: [Boolean], default: false },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, emit }) {
    let selectedIndex = ref<StateDefinition['selectedIndex']['value']>(
      props.selectedIndex ?? props.defaultIndex
    )
    let tabs = ref<StateDefinition['tabs']['value']>([])
    let panels = ref<StateDefinition['panels']['value']>([])

    let isControlled = computed(() => props.selectedIndex !== null)
    let realSelectedIndex = computed(() =>
      isControlled.value ? props.selectedIndex : selectedIndex.value
    )

    function setSelectedIndex(indexToSet: number) {
      let tabs = sortByDomNode(api.tabs.value, dom)
      let panels = sortByDomNode(api.panels.value, dom)

      let focusableTabs = tabs.filter((tab) => !dom(tab)?.hasAttribute('disabled'))

      if (
        // Underflow
        indexToSet < 0 ||
        // Overflow
        indexToSet > tabs.length - 1
      ) {
        let direction = match(
          selectedIndex.value === null // Not set yet
            ? Ordering.Equal
            : Math.sign(indexToSet - selectedIndex.value!),
          {
            [Ordering.Less]: () => Direction.Backwards,
            [Ordering.Equal]: () => {
              return match(Math.sign(indexToSet), {
                [Ordering.Less]: () => Direction.Forwards,
                [Ordering.Equal]: () => Direction.Forwards,
                [Ordering.Greater]: () => Direction.Backwards,
              })
            },
            [Ordering.Greater]: () => Direction.Forwards,
          }
        )

        let nextSelectedIndex = match(direction, {
          [Direction.Forwards]: () => tabs.indexOf(focusableTabs[0]),
          [Direction.Backwards]: () => tabs.indexOf(focusableTabs[focusableTabs.length - 1]),
        })
        if (nextSelectedIndex !== -1) {
          selectedIndex.value = nextSelectedIndex
        }
        api.tabs.value = tabs
        api.panels.value = panels
      }

      // Middle
      else {
        let before = tabs.slice(0, indexToSet)
        let after = tabs.slice(indexToSet)

        let next = [...after, ...before].find((tab) => focusableTabs.includes(tab))
        if (!next) return

        let localSelectedIndex = tabs.indexOf(next) ?? api.selectedIndex.value
        if (localSelectedIndex === -1) localSelectedIndex = api.selectedIndex.value

        selectedIndex.value = localSelectedIndex
        api.tabs.value = tabs
        api.panels.value = panels
      }
    }

    let api = {
      selectedIndex: computed(() => selectedIndex.value ?? props.defaultIndex ?? null),
      orientation: computed(() => (props.vertical ? 'vertical' : 'horizontal')),
      activation: computed(() => (props.manual ? 'manual' : 'auto')),
      tabs,
      panels,
      setSelectedIndex(index: number) {
        if (realSelectedIndex.value !== index) {
          emit('change', index)
        }

        if (!isControlled.value) {
          setSelectedIndex(index)
        }
      },
      registerTab(tab: (typeof tabs)['value'][number]) {
        if (tabs.value.includes(tab)) return
        let activeTab = tabs.value[selectedIndex.value!]

        tabs.value.push(tab)
        tabs.value = sortByDomNode(tabs.value, dom)

        let localSelectedIndex = tabs.value.indexOf(activeTab) ?? selectedIndex.value
        if (localSelectedIndex !== -1) {
          selectedIndex.value = localSelectedIndex
        }
      },
      unregisterTab(tab: (typeof tabs)['value'][number]) {
        let idx = tabs.value.indexOf(tab)
        if (idx !== -1) tabs.value.splice(idx, 1)
      },
      registerPanel(panel: (typeof panels)['value'][number]) {
        if (panels.value.includes(panel)) return
        panels.value.push(panel)
        panels.value = sortByDomNode(panels.value, dom)
      },
      unregisterPanel(panel: (typeof panels)['value'][number]) {
        let idx = panels.value.indexOf(panel)
        if (idx !== -1) panels.value.splice(idx, 1)
      },
    }

    provide(TabsContext, api)

    let SSRCounter = ref({ tabs: [], panels: [] })
    let mounted = ref(false)
    onMounted(() => {
      mounted.value = true
    })
    provide(
      TabsSSRContext,
      computed(() => (mounted.value ? null : SSRCounter.value))
    )

    let incomingSelectedIndex = computed(() => props.selectedIndex)

    onMounted(() => {
      watch(
        [incomingSelectedIndex /* Deliberately skipping defaultIndex */],
        () => setSelectedIndex(props.selectedIndex ?? props.defaultIndex),
        { immediate: true }
      )
    })

    watchEffect(() => {
      if (!isControlled.value) return
      if (realSelectedIndex.value == null) return
      if (api.tabs.value.length <= 0) return

      let sorted = sortByDomNode(api.tabs.value, dom)
      let didOrderChange = sorted.some((tab, i) => dom(api.tabs.value[i]) !== dom(tab))

      if (didOrderChange) {
        api.setSelectedIndex(
          sorted.findIndex((x) => dom(x) === dom(api.tabs.value[realSelectedIndex.value!]))
        )
      }
    })

    return () => {
      let slot = { selectedIndex: selectedIndex.value }

      return h(Fragment, [
        tabs.value.length <= 0 &&
          h(FocusSentinel, {
            onFocus: () => {
              for (let tab of tabs.value) {
                let el = dom(tab)
                if (el?.tabIndex === 0) {
                  el.focus()
                  return true
                }
              }

              return false
            },
          }),
        render({
          theirProps: {
            ...attrs,
            ...omit(props, ['selectedIndex', 'defaultIndex', 'manual', 'vertical', 'onChange']),
          },
          ourProps: {},
          slot,
          slots,
          attrs,
          name: 'TabGroup',
        }),
      ])
    }
  },
})

// ---

export let TabList = defineComponent({
  name: 'TabList',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots }) {
    let api = useTabsContext('TabList')

    return () => {
      let slot = { selectedIndex: api.selectedIndex.value }

      let ourProps = {
        role: 'tablist',
        'aria-orientation': api.orientation.value,
      }
      let theirProps = props

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: 'TabList',
      })
    }
  },
})

// ---

export let Tab = defineComponent({
  name: 'Tab',
  props: {
    as: { type: [Object, String], default: 'button' },
    disabled: { type: [Boolean], default: false },
    id: { type: String, default: () => `headlessui-tabs-tab-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useTabsContext('Tab')

    let internalTabRef = ref<HTMLElement | null>(null)

    expose({ el: internalTabRef, $el: internalTabRef })

    onMounted(() => api.registerTab(internalTabRef))
    onUnmounted(() => api.unregisterTab(internalTabRef))

    let SSRContext = inject(TabsSSRContext)!
    // Note: there's a divergence here between React and Vue. Vue can work with `indexOf` implementation while React on the server can't.
    let mySSRIndex = computed(() => {
      if (SSRContext.value) {
        let mySSRIndex = SSRContext.value.tabs.indexOf(props.id)
        if (mySSRIndex === -1) return SSRContext.value.tabs.push(props.id) - 1
        return mySSRIndex
      }

      return -1
    })

    let myIndex = computed(() => {
      let myIndex = api.tabs.value.indexOf(internalTabRef)
      if (myIndex === -1) return mySSRIndex.value
      return myIndex
    })
    let selected = computed(() => myIndex.value === api.selectedIndex.value)

    function activateUsing(cb: () => FocusResult) {
      let result = cb()
      if (result === FocusResult.Success && api.activation.value === 'auto') {
        let newTab = getOwnerDocument(internalTabRef)?.activeElement
        let idx = api.tabs.value.findIndex((tab) => dom(tab) === newTab)
        if (idx !== -1) api.setSelectedIndex(idx)
      }
      return result
    }

    function handleKeyDown(event: KeyboardEvent) {
      let list = api.tabs.value.map((tab) => dom(tab)).filter(Boolean) as HTMLElement[]

      if (event.key === Keys.Space || event.key === Keys.Enter) {
        event.preventDefault()
        event.stopPropagation()

        api.setSelectedIndex(myIndex.value)
        return
      }

      switch (event.key) {
        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()

          return activateUsing(() => focusIn(list, Focus.First))

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()

          return activateUsing(() => focusIn(list, Focus.Last))
      }

      let result = activateUsing(() =>
        match(api.orientation.value, {
          vertical() {
            if (event.key === Keys.ArrowUp) return focusIn(list, Focus.Previous | Focus.WrapAround)
            if (event.key === Keys.ArrowDown) return focusIn(list, Focus.Next | Focus.WrapAround)
            return FocusResult.Error
          },
          horizontal() {
            if (event.key === Keys.ArrowLeft)
              return focusIn(list, Focus.Previous | Focus.WrapAround)
            if (event.key === Keys.ArrowRight) return focusIn(list, Focus.Next | Focus.WrapAround)
            return FocusResult.Error
          },
        })
      )

      if (result === FocusResult.Success) {
        return event.preventDefault()
      }
    }

    let ready = ref(false)
    function handleSelection() {
      if (ready.value) return
      ready.value = true

      if (props.disabled) return

      dom(internalTabRef)?.focus({ preventScroll: true })
      api.setSelectedIndex(myIndex.value)

      microTask(() => {
        ready.value = false
      })
    }

    // This is important because we want to only focus the tab when it gets focus
    // OR it finished the click event (mouseup). However, if you perform a `click`,
    // then you will first get the `focus` and then get the `click` event.
    function handleMouseDown(event: MouseEvent) {
      event.preventDefault()
    }

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      internalTabRef
    )

    return () => {
      let slot = { selected: selected.value }
      let { id, ...theirProps } = props
      let ourProps = {
        ref: internalTabRef,
        onKeydown: handleKeyDown,
        onMousedown: handleMouseDown,
        onClick: handleSelection,
        id,
        role: 'tab',
        type: type.value,
        'aria-controls': dom(api.panels.value[myIndex.value])?.id,
        'aria-selected': selected.value,
        tabIndex: selected.value ? 0 : -1,
        disabled: props.disabled ? true : undefined,
      }

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: 'Tab',
      })
    }
  },
})

// ---

export let TabPanels = defineComponent({
  name: 'TabPanels',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs }) {
    let api = useTabsContext('TabPanels')

    return () => {
      let slot = { selectedIndex: api.selectedIndex.value }

      return render({
        theirProps: props,
        ourProps: {},
        slot,
        attrs,
        slots,
        name: 'TabPanels',
      })
    }
  },
})

export let TabPanel = defineComponent({
  name: 'TabPanel',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    id: { type: String, default: () => `headlessui-tabs-panel-${useId()}` },
    tabIndex: { type: Number, default: 0 },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useTabsContext('TabPanel')

    let internalPanelRef = ref<HTMLElement | null>(null)

    expose({ el: internalPanelRef, $el: internalPanelRef })

    onMounted(() => api.registerPanel(internalPanelRef))
    onUnmounted(() => api.unregisterPanel(internalPanelRef))

    let SSRContext = inject(TabsSSRContext)!
    let mySSRIndex = computed(() => {
      if (SSRContext.value) {
        let mySSRIndex = SSRContext.value.panels.indexOf(props.id)
        if (mySSRIndex === -1) return SSRContext.value.panels.push(props.id) - 1
        return mySSRIndex
      }

      return -1
    })

    let myIndex = computed(() => {
      let myIndex = api.panels.value.indexOf(internalPanelRef)
      if (myIndex === -1) return mySSRIndex.value
      return myIndex
    })
    let selected = computed(() => myIndex.value === api.selectedIndex.value)

    return () => {
      let slot = { selected: selected.value }
      let { id, tabIndex, ...theirProps } = props
      let ourProps = {
        ref: internalPanelRef,
        id,
        role: 'tabpanel',
        'aria-labelledby': dom(api.tabs.value[myIndex.value])?.id,
        tabIndex: selected.value ? tabIndex : -1,
      }

      if (!selected.value && props.unmount && !props.static) {
        return h(Hidden, { as: 'span', 'aria-hidden': true, ...ourProps })
      }

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: Features.Static | Features.RenderStrategy,
        visible: selected.value,
        name: 'TabPanel',
      })
    }
  },
})
