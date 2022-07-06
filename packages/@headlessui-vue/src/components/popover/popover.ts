import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  watchEffect,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

import { match } from '../../utils/match'
import { render, Features } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import {
  getFocusableElements,
  Focus,
  focusIn,
  isFocusableElement,
  FocusableMode,
} from '../../utils/focus-management'
import { dom } from '../../utils/dom'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { getOwnerDocument } from '../../utils/owner'
import { useEventListener } from '../../hooks/use-event-listener'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { useTabDirection, Direction as TabDirection } from '../../hooks/use-tab-direction'
import { microTask } from '../../utils/micro-task'

enum PopoverStates {
  Open,
  Closed,
}

interface StateDefinition {
  // State
  popoverState: Ref<PopoverStates>
  button: Ref<HTMLElement | null>
  buttonId: string
  panel: Ref<HTMLElement | null>
  panelId: string

  isPortalled: Ref<boolean>

  beforePanelSentinel: Ref<HTMLElement | null>
  afterPanelSentinel: Ref<HTMLElement | null>

  // State mutators
  togglePopover(): void
  closePopover(): void

  // Exposed functions
  close(focusableElement: HTMLElement | Ref<HTMLElement | null>): void
}

let PopoverContext = Symbol('PopoverContext') as InjectionKey<StateDefinition>
function usePopoverContext(component: string) {
  let context = inject(PopoverContext, null)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Popover.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverContext)
    throw err
  }
  return context
}

let PopoverGroupContext = Symbol('PopoverGroupContext') as InjectionKey<{
  registerPopover(registerbag: PopoverRegisterBag): void
  unregisterPopover(registerbag: PopoverRegisterBag): void
  isFocusWithinPopoverGroup(): boolean
  closeOthers(buttonId: string): void
} | null>

function usePopoverGroupContext() {
  return inject(PopoverGroupContext, null)
}

let PopoverPanelContext = Symbol('PopoverPanelContext') as InjectionKey<string | null>
function usePopoverPanelContext() {
  return inject(PopoverPanelContext, null)
}

interface PopoverRegisterBag {
  buttonId: string
  panelId: string
  close(): void
}

// ---

export let Popover = defineComponent({
  name: 'Popover',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs, expose }) {
    let buttonId = `headlessui-popover-button-${useId()}`
    let panelId = `headlessui-popover-panel-${useId()}`

    let internalPopoverRef = ref<HTMLElement | null>(null)

    expose({ el: internalPopoverRef, $el: internalPopoverRef })

    let popoverState = ref<StateDefinition['popoverState']['value']>(PopoverStates.Closed)
    let button = ref<StateDefinition['button']['value']>(null)
    let beforePanelSentinel = ref<StateDefinition['beforePanelSentinel']['value']>(null)
    let afterPanelSentinel = ref<StateDefinition['afterPanelSentinel']['value']>(null)
    let panel = ref<StateDefinition['panel']['value']>(null)
    let ownerDocument = computed(() => getOwnerDocument(internalPopoverRef))
    let isPortalled = computed(() => {
      if (!dom(button)) return false
      if (!dom(panel)) return false

      for (let root of document.querySelectorAll('body > *')) {
        if (Number(root?.contains(dom(button))) ^ Number(root?.contains(dom(panel)))) {
          return true
        }
      }

      return false
    })

    let api = {
      popoverState,
      buttonId,
      panelId,
      panel,
      button,
      isPortalled,
      beforePanelSentinel,
      afterPanelSentinel,
      togglePopover() {
        popoverState.value = match(popoverState.value, {
          [PopoverStates.Open]: PopoverStates.Closed,
          [PopoverStates.Closed]: PopoverStates.Open,
        })
      },
      closePopover() {
        if (popoverState.value === PopoverStates.Closed) return
        popoverState.value = PopoverStates.Closed
      },
      close(focusableElement: HTMLElement | Ref<HTMLElement | null>) {
        api.closePopover()

        let restoreElement = (() => {
          if (!focusableElement) return dom(api.button)
          if (focusableElement instanceof HTMLElement) return focusableElement
          if (focusableElement.value instanceof HTMLElement) return dom(focusableElement)

          return dom(api.button)
        })()

        restoreElement?.focus()
      },
    } as StateDefinition

    provide(PopoverContext, api)
    useOpenClosedProvider(
      computed(() =>
        match(popoverState.value, {
          [PopoverStates.Open]: State.Open,
          [PopoverStates.Closed]: State.Closed,
        })
      )
    )

    let registerBag = {
      buttonId,
      panelId,
      close() {
        api.closePopover()
      },
    }

    let groupContext = usePopoverGroupContext()
    let registerPopover = groupContext?.registerPopover

    function isFocusWithinPopoverGroup() {
      return (
        groupContext?.isFocusWithinPopoverGroup() ??
        (ownerDocument.value?.activeElement &&
          (dom(button)?.contains(ownerDocument.value.activeElement) ||
            dom(panel)?.contains(ownerDocument.value.activeElement)))
      )
    }

    watchEffect(() => registerPopover?.(registerBag))

    // Handle focus out
    useEventListener(
      ownerDocument.value?.defaultView,
      'focus',
      (event) => {
        if (popoverState.value !== PopoverStates.Open) return
        if (isFocusWithinPopoverGroup()) return
        if (!button) return
        if (!panel) return
        if (dom(api.beforePanelSentinel)?.contains(event.target as HTMLElement)) return
        if (dom(api.afterPanelSentinel)?.contains(event.target as HTMLElement)) return

        api.closePopover()
      },
      true
    )

    // Handle outside click
    useOutsideClick(
      [button, panel],
      (event, target) => {
        api.closePopover()

        if (!isFocusableElement(target, FocusableMode.Loose)) {
          event.preventDefault()
          dom(button)?.focus()
        }
      },
      computed(() => popoverState.value === PopoverStates.Open)
    )

    return () => {
      let slot = { open: popoverState.value === PopoverStates.Open, close: api.close }
      return render({
        theirProps: props,
        ourProps: { ref: internalPopoverRef },
        slot,
        slots,
        attrs,
        name: 'Popover',
      })
    }
  },
})

// ---

export let PopoverButton = defineComponent({
  name: 'PopoverButton',
  props: {
    as: { type: [Object, String], default: 'button' },
    disabled: { type: [Boolean], default: false },
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let api = usePopoverContext('PopoverButton')
    let ownerDocument = computed(() => getOwnerDocument(api.button))

    expose({ el: api.button, $el: api.button })

    let groupContext = usePopoverGroupContext()
    let closeOthers = groupContext?.closeOthers

    let panelContext = usePopoverPanelContext()
    let isWithinPanel = panelContext === null ? false : panelContext === api.panelId

    let elementRef = ref(null)
    let sentinelId = `headlessui-focus-sentinel-${useId()}`

    if (!isWithinPanel) {
      watchEffect(() => {
        api.button.value = elementRef.value
      })
    }

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      elementRef
    )

    function handleKeyDown(event: KeyboardEvent) {
      if (isWithinPanel) {
        if (api.popoverState.value === PopoverStates.Closed) return
        switch (event.key) {
          case Keys.Space:
          case Keys.Enter:
            event.preventDefault() // Prevent triggering a *click* event
            // @ts-expect-error
            event.target.click?.()
            api.closePopover()
            dom(api.button)?.focus() // Re-focus the original opening Button
            break
        }
      } else {
        switch (event.key) {
          case Keys.Space:
          case Keys.Enter:
            event.preventDefault() // Prevent triggering a *click* event
            event.stopPropagation()
            if (api.popoverState.value === PopoverStates.Closed) closeOthers?.(api.buttonId)
            api.togglePopover()
            break

          case Keys.Escape:
            if (api.popoverState.value !== PopoverStates.Open) return closeOthers?.(api.buttonId)
            if (!dom(api.button)) return
            if (
              ownerDocument.value?.activeElement &&
              !dom(api.button)?.contains(ownerDocument.value.activeElement)
            )
              return
            event.preventDefault()
            event.stopPropagation()
            api.closePopover()
            break
        }
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (isWithinPanel) return
      if (event.key === Keys.Space) {
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
      }
    }

    function handleClick(event: MouseEvent) {
      if (props.disabled) return
      if (isWithinPanel) {
        api.closePopover()
        dom(api.button)?.focus() // Re-focus the original opening Button
      } else {
        event.preventDefault()
        event.stopPropagation()
        if (api.popoverState.value === PopoverStates.Closed) closeOthers?.(api.buttonId)
        api.togglePopover()
        dom(api.button)?.focus()
      }
    }

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()
    }

    return () => {
      let visible = api.popoverState.value === PopoverStates.Open
      let slot = { open: visible }
      let ourProps = isWithinPanel
        ? {
            ref: elementRef,
            type: type.value,
            onKeydown: handleKeyDown,
            onClick: handleClick,
          }
        : {
            ref: elementRef,
            id: api.buttonId,
            type: type.value,
            'aria-expanded': props.disabled
              ? undefined
              : api.popoverState.value === PopoverStates.Open,
            'aria-controls': dom(api.panel) ? api.panelId : undefined,
            disabled: props.disabled ? true : undefined,
            onKeydown: handleKeyDown,
            onKeyup: handleKeyUp,
            onClick: handleClick,
            onMousedown: handleMouseDown,
          }

      let direction = useTabDirection()
      function handleFocus() {
        let el = dom(api.panel) as HTMLElement
        if (!el) return

        function run() {
          match(direction.value, {
            [TabDirection.Forwards]: () => focusIn(el, Focus.First),
            [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
          })
        }

        // TODO: Cleanup once we are using real browser tests
        if (process.env.NODE_ENV === 'test') {
          microTask(run)
        } else {
          run()
        }
      }

      return h(Fragment, [
        render({
          ourProps,
          theirProps: { ...attrs, ...props },
          slot,
          attrs: attrs,
          slots: slots,
          name: 'PopoverButton',
        }),
        visible &&
          !isWithinPanel &&
          api.isPortalled.value &&
          h(Hidden, {
            id: sentinelId,
            features: HiddenFeatures.Focusable,
            as: 'button',
            type: 'button',
            onFocus: handleFocus,
          }),
      ])
    }
  },
})

// ---

export let PopoverOverlay = defineComponent({
  name: 'PopoverOverlay',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    let api = usePopoverContext('PopoverOverlay')
    let id = `headlessui-popover-overlay-${useId()}`

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.popoverState.value === PopoverStates.Open
    })

    function handleClick() {
      api.closePopover()
    }

    return () => {
      let slot = { open: api.popoverState.value === PopoverStates.Open }
      let ourProps = {
        id,
        'aria-hidden': true,
        onClick: handleClick,
      }

      return render({
        ourProps,
        theirProps: props,
        slot,
        attrs,
        slots,
        features: Features.RenderStrategy | Features.Static,
        visible: visible.value,
        name: 'PopoverOverlay',
      })
    }
  },
})

// ---

export let PopoverPanel = defineComponent({
  name: 'PopoverPanel',
  props: {
    as: { type: [Object, String], default: 'div' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    focus: { type: Boolean, default: false },
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let { focus } = props
    let api = usePopoverContext('PopoverPanel')
    let ownerDocument = computed(() => getOwnerDocument(api.panel))

    let beforePanelSentinelId = `headlessui-focus-sentinel-before-${useId()}`
    let afterPanelSentinelId = `headlessui-focus-sentinel-after-${useId()}`

    expose({ el: api.panel, $el: api.panel })

    provide(PopoverPanelContext, api.panelId)

    // Move focus within panel
    watchEffect(() => {
      if (!focus) return
      if (api.popoverState.value !== PopoverStates.Open) return
      if (!api.panel) return

      let activeElement = ownerDocument.value?.activeElement as HTMLElement
      if (dom(api.panel)?.contains(activeElement)) return // Already focused within Dialog

      focusIn(dom(api.panel)!, Focus.First)
    })

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.popoverState.value === PopoverStates.Open
    })

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case Keys.Escape:
          if (api.popoverState.value !== PopoverStates.Open) return
          if (!dom(api.panel)) return
          if (ownerDocument.value && !dom(api.panel)?.contains(ownerDocument.value.activeElement)) {
            return
          }
          event.preventDefault()
          event.stopPropagation()
          api.closePopover()
          dom(api.button)?.focus()
          break
      }
    }

    function handleBlur(event: MouseEvent) {
      let el = event.relatedTarget as HTMLElement
      if (!el) return
      if (!dom(api.panel)) return
      if (dom(api.panel)?.contains(el)) return

      api.closePopover()

      if (
        dom(api.beforePanelSentinel)?.contains?.(el) ||
        dom(api.afterPanelSentinel)?.contains?.(el)
      ) {
        el.focus({ preventScroll: true })
      }
    }

    let direction = useTabDirection()
    function handleBeforeFocus() {
      let el = dom(api.panel) as HTMLElement
      if (!el) return

      function run() {
        match(direction.value, {
          [TabDirection.Forwards]: () => {
            focusIn(el, Focus.First)
          },
          [TabDirection.Backwards]: () => {
            // Coming from the Popover.Panel (which is portalled to somewhere else). Let's redirect
            // the focus to the Popover.Button again.
            dom(api.button)?.focus({ preventScroll: true })
          },
        })
      }

      // TODO: Cleanup once we are using real browser tests
      if (process.env.NODE_ENV === 'test') {
        microTask(run)
      } else {
        run()
      }
    }

    function handleAfterFocus() {
      let el = dom(api.panel) as HTMLElement
      if (!el) return

      function run() {
        match(direction.value, {
          [TabDirection.Forwards]: () => {
            let button = dom(api.button)
            let panel = dom(api.panel)
            if (!button) return

            let elements = getFocusableElements()

            let idx = elements.indexOf(button)
            let before = elements.slice(0, idx + 1)
            let after = elements.slice(idx + 1)

            let combined = [...after, ...before]

            // Ignore sentinel buttons and items inside the panel
            for (let element of combined.slice()) {
              if (
                element?.id?.startsWith?.('headlessui-focus-sentinel-') ||
                panel?.contains(element)
              ) {
                let idx = combined.indexOf(element)
                if (idx !== -1) combined.splice(idx, 1)
              }
            }

            focusIn(combined, Focus.First, false)
          },
          [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
        })
      }

      // TODO: Cleanup once we are using real browser tests
      if (process.env.NODE_ENV === 'test') {
        microTask(run)
      } else {
        run()
      }
    }

    return () => {
      let slot = {
        open: api.popoverState.value === PopoverStates.Open,
        close: api.close,
      }

      let ourProps = {
        ref: api.panel,
        id: api.panelId,
        onKeydown: handleKeyDown,
        onFocusout: focus && api.popoverState.value === PopoverStates.Open ? handleBlur : undefined,
        tabIndex: -1,
      }

      return h(Fragment, [
        visible.value &&
          api.isPortalled.value &&
          h(Hidden, {
            id: beforePanelSentinelId,
            ref: api.beforePanelSentinel,
            features: HiddenFeatures.Focusable,
            as: 'button',
            type: 'button',
            onFocus: handleBeforeFocus,
          }),
        render({
          ourProps,
          theirProps: { ...attrs, ...props },
          slot,
          attrs,
          slots,
          features: Features.RenderStrategy | Features.Static,
          visible: visible.value,
          name: 'PopoverPanel',
        }),
        visible.value &&
          api.isPortalled.value &&
          h(Hidden, {
            id: afterPanelSentinelId,
            ref: api.afterPanelSentinel,
            features: HiddenFeatures.Focusable,
            as: 'button',
            type: 'button',
            onFocus: handleAfterFocus,
          }),
      ])
    }
  },
})

// ---

export let PopoverGroup = defineComponent({
  name: 'PopoverGroup',
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots, expose }) {
    let groupRef = ref<HTMLElement | null>(null)
    let popovers = ref<PopoverRegisterBag[]>([])
    let ownerDocument = computed(() => getOwnerDocument(groupRef))

    expose({ el: groupRef, $el: groupRef })

    function unregisterPopover(registerBag: PopoverRegisterBag) {
      let idx = popovers.value.indexOf(registerBag)
      if (idx !== -1) popovers.value.splice(idx, 1)
    }

    function registerPopover(registerBag: PopoverRegisterBag) {
      popovers.value.push(registerBag)
      return () => {
        unregisterPopover(registerBag)
      }
    }

    function isFocusWithinPopoverGroup() {
      let owner = ownerDocument.value
      if (!owner) return false
      let element = owner.activeElement as HTMLElement

      if (dom(groupRef)?.contains(element)) return true

      // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.
      return popovers.value.some((bag) => {
        return (
          owner!.getElementById(bag.buttonId)?.contains(element) ||
          owner!.getElementById(bag.panelId)?.contains(element)
        )
      })
    }

    function closeOthers(buttonId: string) {
      for (let popover of popovers.value) {
        if (popover.buttonId !== buttonId) popover.close()
      }
    }

    provide(PopoverGroupContext, {
      registerPopover,
      unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers,
    })

    return () => {
      let ourProps = { ref: groupRef }

      return render({
        ourProps,
        theirProps: props,
        slot: {},
        attrs,
        slots,
        name: 'PopoverGroup',
      })
    }
  },
})
