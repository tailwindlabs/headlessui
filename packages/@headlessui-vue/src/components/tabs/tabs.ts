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
  watchEffect,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

import { Features, render, omit } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import { match } from '../../utils/match'
import { focusIn, Focus, FocusResult } from '../../utils/focus-management'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { FocusSentinel } from '../../internal/focus-sentinel'
import { microTask } from '../../utils/micro-task'
import { Hidden } from '../../internal/hidden'
import { getOwnerDocument } from '../../utils/owner'

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
    let selectedIndex = ref<StateDefinition['selectedIndex']['value']>(null)
    let tabs = ref<StateDefinition['tabs']['value']>([])
    let panels = ref<StateDefinition['panels']['value']>([])

    let isControlled = computed(() => props.selectedIndex !== null)
    let realSelectedIndex = computed(() =>
      isControlled.value ? props.selectedIndex : selectedIndex.value
    )

    let api = {
      selectedIndex,
      orientation: computed(() => (props.vertical ? 'vertical' : 'horizontal')),
      activation: computed(() => (props.manual ? 'manual' : 'auto')),
      tabs,
      panels,
      setSelectedIndex(index: number) {
        if (realSelectedIndex.value !== index) {
          emit('change', index)
        }

        if (!isControlled.value) {
          selectedIndex.value = index
        }
      },
      registerTab(tab: typeof tabs['value'][number]) {
        if (!tabs.value.includes(tab)) tabs.value.push(tab)
      },
      unregisterTab(tab: typeof tabs['value'][number]) {
        let idx = tabs.value.indexOf(tab)
        if (idx !== -1) tabs.value.splice(idx, 1)
      },
      registerPanel(panel: typeof panels['value'][number]) {
        if (!panels.value.includes(panel)) panels.value.push(panel)
      },
      unregisterPanel(panel: typeof panels['value'][number]) {
        let idx = panels.value.indexOf(panel)
        if (idx !== -1) panels.value.splice(idx, 1)
      },
    }

    provide(TabsContext, api)

    watchEffect(() => {
      if (api.tabs.value.length <= 0) return
      if (props.selectedIndex === null && selectedIndex.value !== null) return

      let tabs = api.tabs.value.map((tab) => dom(tab)).filter(Boolean) as HTMLElement[]
      let focusableTabs = tabs.filter((tab) => !tab.hasAttribute('disabled'))

      let indexToSet = props.selectedIndex ?? props.defaultIndex

      // Underflow
      if (indexToSet < 0) {
        selectedIndex.value = tabs.indexOf(focusableTabs[0])
      }

      // Overflow
      else if (indexToSet > api.tabs.value.length) {
        selectedIndex.value = tabs.indexOf(focusableTabs[focusableTabs.length - 1])
      }

      // Middle
      else {
        let before = tabs.slice(0, indexToSet)
        let after = tabs.slice(indexToSet)

        let next = [...after, ...before].find((tab) => focusableTabs.includes(tab))
        if (!next) return

        selectedIndex.value = tabs.indexOf(next)
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

    let myIndex = computed(() => api.tabs.value.indexOf(internalTabRef))
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

      dom(internalTabRef)?.focus()
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
  },
  setup(props, { attrs, slots, expose }) {
    let api = useTabsContext('TabPanel')

    let internalPanelRef = ref<HTMLElement | null>(null)

    expose({ el: internalPanelRef, $el: internalPanelRef })

    onMounted(() => api.registerPanel(internalPanelRef))
    onUnmounted(() => api.unregisterPanel(internalPanelRef))

    let myIndex = computed(() => api.panels.value.indexOf(internalPanelRef))
    let selected = computed(() => myIndex.value === api.selectedIndex.value)

    return () => {
      let slot = { selected: selected.value }
      let { id, ...theirProps } = props
      let ourProps = {
        ref: internalPanelRef,
        id,
        role: 'tabpanel',
        'aria-labelledby': dom(api.tabs.value[myIndex.value])?.id,
        tabIndex: selected.value ? 0 : -1,
      }

      if (!selected.value && props.unmount && !props.static) {
        return h(Hidden, { as: 'span', ...ourProps })
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
