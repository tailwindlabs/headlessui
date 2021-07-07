import {
  defineComponent,
  ref,
  provide,
  inject,
  onMounted,
  onUnmounted,
  computed,
  InjectionKey,
  Ref,
} from 'vue'

import { Features, render, omit } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import { match } from '../../utils/match'
import { focusIn, Focus } from '../../utils/focus-management'

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
    let err = new Error(`<${component} /> is missing a parent <Tabs /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabsContext)
    throw err
  }

  return context
}

// ---

export let Tabs = defineComponent({
  name: 'Tabs',
  emits: ['change'],
  props: {
    as: { type: [Object, String], default: 'template' },
    defaultIndex: { type: [Number], default: 0 },
    vertical: { type: [Boolean], default: false },
    manual: { type: [Boolean], default: false },
  },
  setup(props, { slots, attrs, emit }) {
    let selectedIndex = ref<StateDefinition['selectedIndex']['value']>(null)
    let tabs = ref<StateDefinition['tabs']['value']>([])
    let panels = ref<StateDefinition['panels']['value']>([])

    let api = {
      selectedIndex,
      orientation: computed(() => (props.vertical ? 'vertical' : 'horizontal')),
      activation: computed(() => (props.manual ? 'manual' : 'auto')),
      tabs,
      panels,
      setSelectedIndex(index: number) {
        if (selectedIndex.value === index) return
        selectedIndex.value = index
        emit('change', index)
      },
      registerTab(tab: typeof tabs['value'][number]) {
        if (!tabs.value.includes(tab)) tabs.value.push(tab)
      },
      unregisterTab(tab: typeof tabs['value'][number]) {
        let idx = tabs.value.indexOf(tab)
        if (idx !== -1) tabs.value.slice(idx, 1)
      },
      registerPanel(panel: typeof panels['value'][number]) {
        if (!panels.value.includes(panel)) panels.value.push(panel)
      },
      unregisterPanel(panel: typeof panels['value'][number]) {
        let idx = panels.value.indexOf(panel)
        if (idx !== -1) panels.value.slice(idx, 1)
      },
    }

    provide(TabsContext, api)

    onMounted(() => {
      if (api.tabs.value.length <= 0) return console.log('bail')
      if (selectedIndex.value !== null) return console.log('bail 2')

      let tabs = api.tabs.value.map(tab => dom(tab)).filter(Boolean) as HTMLElement[]
      let focusableTabs = tabs.filter(tab => !tab.hasAttribute('disabled'))

      // Underflow
      if (props.defaultIndex < 0) {
        selectedIndex.value = tabs.indexOf(focusableTabs[0])
      }

      // Overflow
      else if (props.defaultIndex > api.tabs.value.length) {
        selectedIndex.value = tabs.indexOf(focusableTabs[focusableTabs.length - 1])
      }

      // Middle
      else {
        let before = tabs.slice(0, props.defaultIndex)
        let after = tabs.slice(props.defaultIndex)

        let next = [...after, ...before].find(tab => focusableTabs.includes(tab))
        if (!next) return

        selectedIndex.value = tabs.indexOf(next)
      }
    })

    return () => {
      let slot = { selectedIndex: selectedIndex.value }

      return render({
        props: omit(props, ['defaultIndex', 'manual', 'vertical']),
        slot,
        slots,
        attrs,
        name: 'Tabs',
      })
    }
  },
})

// ---

export let TabsList = defineComponent({
  name: 'TabsList',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots }) {
    let api = useTabsContext('TabsList')

    return () => {
      let slot = { selectedIndex: api.selectedIndex.value }

      let propsWeControl = {
        role: 'tablist',
        'aria-orientation': api.orientation.value,
      }
      let passThroughProps = props

      return render({
        props: { ...passThroughProps, ...propsWeControl },
        slot,
        attrs,
        slots,
        name: 'TabsList',
      })
    }
  },
})

// ---

export let TabsTab = defineComponent({
  name: 'TabsTab',
  props: {
    as: { type: [Object, String], default: 'button' },
    disabled: { type: [Boolean], default: false },
  },
  render() {
    let api = useTabsContext('TabsTab')

    let slot = { selected: this.selected }
    let propsWeControl = {
      ref: 'el',
      onKeydown: this.handleKeyDown,
      onFocus: api.activation.value === 'manual' ? this.handleFocus : this.handleSelection,
      onClick: this.handleSelection,
      id: this.id,
      role: 'tab',
      type: this.type,
      'aria-controls': api.panels.value[this.myIndex]?.value?.id,
      'aria-selected': this.selected,
      tabIndex: this.selected ? 0 : -1,
      disabled: this.$props.disabled ? true : undefined,
    }

    if (process.env.NODE_ENV === 'test') {
      Object.assign(propsWeControl, { ['data-headlessui-index']: this.myIndex })
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'TabsTab',
    })
  },
  setup(props, { attrs }) {
    let api = useTabsContext('TabsTab')
    let id = `headlessui-tabs-tab-${useId()}`

    let tabRef = ref()

    onMounted(() => api.registerTab(tabRef))
    onUnmounted(() => api.unregisterTab(tabRef))

    let myIndex = computed(() => api.tabs.value.indexOf(tabRef))
    let selected = computed(() => myIndex.value === api.selectedIndex.value)
    let type = computed(() => attrs.type ?? (props.as === 'button' ? 'button' : undefined))

    function handleKeyDown(event: KeyboardEvent) {
      let list = api.tabs.value.map(tab => dom(tab)).filter(Boolean) as HTMLElement[]

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

          return focusIn(list, Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()

          return focusIn(list, Focus.Last)
      }

      return match(api.orientation.value, {
        vertical() {
          if (event.key === Keys.ArrowUp) return focusIn(list, Focus.Previous | Focus.WrapAround)
          if (event.key === Keys.ArrowDown) return focusIn(list, Focus.Next | Focus.WrapAround)
          return
        },
        horizontal() {
          if (event.key === Keys.ArrowLeft) return focusIn(list, Focus.Previous | Focus.WrapAround)
          if (event.key === Keys.ArrowRight) return focusIn(list, Focus.Next | Focus.WrapAround)
          return
        },
      })
    }

    function handleFocus() {
      dom(tabRef)?.focus()
    }

    function handleSelection() {
      if (props.disabled) return

      dom(tabRef)?.focus()
      api.setSelectedIndex(myIndex.value)
    }

    return {
      el: tabRef,
      id,
      selected,
      myIndex,
      type,
      handleKeyDown,
      handleFocus,
      handleSelection,
    }
  },
})

// ---

export let TabsPanels = defineComponent({
  name: 'TabsPanels',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs }) {
    let api = useTabsContext('TabsPanels')

    return () => {
      let slot = { selectedIndex: api.selectedIndex.value }

      return render({
        props,
        slot,
        attrs,
        slots,
        name: 'TabsPanels',
      })
    }
  },
})

export let TabsPanel = defineComponent({
  name: 'TabsPanel',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
  },
  render() {
    let api = useTabsContext('TabsPanel')

    let slot = { selected: this.selected }
    let propsWeControl = {
      ref: 'el',
      id: this.id,
      role: 'tabpanel',
      'aria-labelledby': api.tabs.value[this.myIndex]?.value?.id,
      tabIndex: this.selected ? 0 : -1,
    }

    if (process.env.NODE_ENV === 'test') {
      Object.assign(propsWeControl, { ['data-headlessui-index']: this.myIndex })
    }

    return render({
      props: { ...this.$props, ...propsWeControl },
      slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.Static | Features.RenderStrategy,
      visible: this.selected,
      name: 'TabsPanel',
    })
  },
  setup() {
    let api = useTabsContext('TabsPanel')
    let id = `headlessui-tabs-panel-${useId()}`

    let panelRef = ref()

    onMounted(() => api.registerPanel(panelRef))
    onUnmounted(() => api.unregisterPanel(panelRef))

    let myIndex = computed(() => api.panels.value.indexOf(panelRef))
    let selected = computed(() => myIndex.value === api.selectedIndex.value)

    return { id, el: panelRef, selected, myIndex }
  },
})
