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
  shallowRef,
  watchEffect,
  type ComponentPublicInstance,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useNestedPortals } from '../../components/portal/portal'
import { useEventListener } from '../../hooks/use-event-listener'
import { useId } from '../../hooks/use-id'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useMainTreeNode, useRootContainers } from '../../hooks/use-root-containers'
import { Direction as TabDirection, useTabDirection } from '../../hooks/use-tab-direction'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import { Keys } from '../../keyboard'
import { dom } from '../../utils/dom'
import {
  Focus,
  FocusResult,
  FocusableMode,
  focusIn,
  getFocusableElements,
  isFocusableElement,
} from '../../utils/focus-management'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { getOwnerDocument } from '../../utils/owner'
import { Features, render } from '../../utils/render'

enum PopoverStates {
  Open,
  Closed,
}

interface StateDefinition {
  // State
  popoverState: Ref<PopoverStates>
  button: Ref<HTMLElement | null>
  buttonId: Ref<string | null>
  panel: Ref<HTMLElement | null>
  panelId: Ref<string | null>

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
  mainTreeNodeRef: Ref<HTMLElement | null>
} | null>

function usePopoverGroupContext() {
  return inject(PopoverGroupContext, null)
}

let PopoverPanelContext = Symbol('PopoverPanelContext') as InjectionKey<Ref<string | null>>
function usePopoverPanelContext() {
  return inject(PopoverPanelContext, null)
}

interface PopoverRegisterBag {
  buttonId: Ref<string | null>
  panelId: Ref<string | null>
  close(): void
}

// ---

export let Popover = defineComponent({
  name: 'Popover',
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { slots, attrs, expose }) {
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

      // We are part of a different "root" tree, so therefore we can consider it portalled. This is a
      // heuristic because 3rd party tools could use some form of portal, typically rendered at the
      // end of the body but we don't have an actual reference to that.
      for (let root of document.querySelectorAll('body > *')) {
        if (Number(root?.contains(dom(button))) ^ Number(root?.contains(dom(panel)))) {
          return true
        }
      }

      // Use another heuristic to try and calculate wether or not the focusable elements are near
      // eachother (aka, following the default focus/tab order from the browser). If they are then it
      // doesn't really matter if they are portalled or not because we can follow the default tab
      // order. But if they are not, then we can consider it being portalled so that we can ensure
      // that tab and shift+tab (hopefully) go to the correct spot.
      let elements = getFocusableElements()
      let buttonIdx = elements.indexOf(dom(button)!)

      let beforeIdx = (buttonIdx + elements.length - 1) % elements.length
      let afterIdx = (buttonIdx + 1) % elements.length

      let beforeElement = elements[beforeIdx]
      let afterElement = elements[afterIdx]

      if (!dom(panel)?.contains(beforeElement) && !dom(panel)?.contains(afterElement)) {
        return true
      }

      return false
    })

    let api = {
      popoverState,
      buttonId: ref(null),
      panelId: ref(null),
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
      buttonId: api.buttonId,
      panelId: api.panelId,
      close() {
        api.closePopover()
      },
    }

    let groupContext = usePopoverGroupContext()
    let registerPopover = groupContext?.registerPopover

    let [portals, PortalWrapper] = useNestedPortals()
    let root = useRootContainers({
      mainTreeNodeRef: groupContext?.mainTreeNodeRef,
      portals,
      defaultContainers: [button, panel],
    })

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
        if (event.target === window) return
        if (!(event.target instanceof HTMLElement)) return
        if (popoverState.value !== PopoverStates.Open) return
        if (isFocusWithinPopoverGroup()) return
        if (!button) return
        if (!panel) return
        if (root.contains(event.target)) return
        if (dom(api.beforePanelSentinel)?.contains(event.target)) return
        if (dom(api.afterPanelSentinel)?.contains(event.target)) return

        api.closePopover()
      },
      true
    )

    // Handle outside click
    useOutsideClick(
      root.resolveContainers,
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
      return h(Fragment, [
        h(PortalWrapper, {}, () =>
          render({
            theirProps: { ...props, ...attrs },
            ourProps: { ref: internalPopoverRef },
            slot,
            slots,
            attrs,
            name: 'Popover',
          })
        ),
        h(root.MainTreeNode),
      ])
    }
  },
})

// ---

export let PopoverButton = defineComponent({
  name: 'PopoverButton',
  props: {
    as: { type: [Object, String], default: 'button' },
    disabled: { type: [Boolean], default: false },
    id: { type: String, default: () => `headlessui-popover-button-${useId()}` },
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let api = usePopoverContext('PopoverButton')
    let ownerDocument = computed(() => getOwnerDocument(api.button))

    expose({ el: api.button, $el: api.button })

    onMounted(() => {
      api.buttonId.value = props.id
    })
    onUnmounted(() => {
      api.buttonId.value = null
    })

    let groupContext = usePopoverGroupContext()
    let closeOthers = groupContext?.closeOthers

    let panelContext = usePopoverPanelContext()

    // A button inside a panel will just have "close" functionality, no "open" functionality.
    // However, if a `Popover.Button` is rendered inside a `Popover` which in turn is rendered
    // inside a `Popover.Panel` (aka nested popovers), then we need to make sure that the button is
    // able to open the nested popover.
    let isWithinPanel = computed(() =>
      panelContext === null ? false : panelContext.value === api.panelId.value
    )

    let elementRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
    let sentinelId = `headlessui-focus-sentinel-${useId()}`

    if (!isWithinPanel.value) {
      watchEffect(() => {
        // `elementRef` could be a Vue component in which case we want to grab the DOM element from it
        api.button.value = dom(elementRef)
      })
    }

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      elementRef
    )

    function handleKeyDown(event: KeyboardEvent) {
      if (isWithinPanel.value) {
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
            if (api.popoverState.value === PopoverStates.Closed) closeOthers?.(api.buttonId.value!)
            api.togglePopover()
            break

          case Keys.Escape:
            if (api.popoverState.value !== PopoverStates.Open)
              return closeOthers?.(api.buttonId.value!)
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
      if (isWithinPanel.value) return
      if (event.key === Keys.Space) {
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
      }
    }

    function handleClick(event: MouseEvent) {
      if (props.disabled) return
      if (isWithinPanel.value) {
        api.closePopover()
        dom(api.button)?.focus() // Re-focus the original opening Button
      } else {
        event.preventDefault()
        event.stopPropagation()
        if (api.popoverState.value === PopoverStates.Closed) closeOthers?.(api.buttonId.value!)
        api.togglePopover()
        dom(api.button)?.focus()
      }
    }

    function handleMouseDown(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()
    }

    let direction = useTabDirection()
    function handleFocus() {
      let el = dom(api.panel) as HTMLElement
      if (!el) return

      function run() {
        let result = match(direction.value, {
          [TabDirection.Forwards]: () => focusIn(el, Focus.First),
          [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
        })

        if (result === FocusResult.Error) {
          focusIn(
            getFocusableElements().filter((el) => el.dataset.headlessuiFocusGuard !== 'true'),
            match(direction.value, {
              [TabDirection.Forwards]: Focus.Next,
              [TabDirection.Backwards]: Focus.Previous,
            }),
            { relativeTo: dom(api.button) }
          )
        }
      }

      // TODO: Cleanup once we are using real browser tests
      if (process.env.NODE_ENV === 'test') {
        microTask(run)
      } else {
        run()
      }
    }

    return () => {
      let visible = api.popoverState.value === PopoverStates.Open
      let slot = { open: visible }
      let { id, ...theirProps } = props
      let ourProps = isWithinPanel.value
        ? {
            ref: elementRef,
            type: type.value,
            onKeydown: handleKeyDown,
            onClick: handleClick,
          }
        : {
            ref: elementRef,
            id,
            type: type.value,
            'aria-expanded': api.popoverState.value === PopoverStates.Open,
            'aria-controls': dom(api.panel) ? api.panelId.value : undefined,
            disabled: props.disabled ? true : undefined,
            onKeydown: handleKeyDown,
            onKeyup: handleKeyUp,
            onClick: handleClick,
            onMousedown: handleMouseDown,
          }

      return h(Fragment, [
        render({
          ourProps,
          theirProps: { ...attrs, ...theirProps },
          slot,
          attrs: attrs,
          slots: slots,
          name: 'PopoverButton',
        }),
        visible &&
          !isWithinPanel.value &&
          api.isPortalled.value &&
          h(Hidden, {
            id: sentinelId,
            features: HiddenFeatures.Focusable,
            'data-headlessui-focus-guard': true,
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
        return (usesOpenClosedState.value & State.Open) === State.Open
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
    id: { type: String, default: () => `headlessui-popover-panel-${useId()}` },
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let { focus } = props
    let api = usePopoverContext('PopoverPanel')
    let ownerDocument = computed(() => getOwnerDocument(api.panel))

    let beforePanelSentinelId = `headlessui-focus-sentinel-before-${useId()}`
    let afterPanelSentinelId = `headlessui-focus-sentinel-after-${useId()}`

    expose({ el: api.panel, $el: api.panel })

    onMounted(() => {
      api.panelId.value = props.id
    })
    onUnmounted(() => {
      api.panelId.value = null
    })

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
        return (usesOpenClosedState.value & State.Open) === State.Open
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
            // Try to focus the first thing in the panel. But if that fails (e.g.: there are no
            // focusable elements, then we can move outside of the panel)
            let result = focusIn(el, Focus.First)
            if (result === FocusResult.Error) {
              dom(api.afterPanelSentinel)?.focus()
            }
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
              if (element.dataset.headlessuiFocusGuard === 'true' || panel?.contains(element)) {
                let idx = combined.indexOf(element)
                if (idx !== -1) combined.splice(idx, 1)
              }
            }

            focusIn(combined, Focus.First, { sorted: false })
          },
          [TabDirection.Backwards]: () => {
            // Try to focus the first thing in the panel. But if that fails (e.g.: there are no
            // focusable elements, then we can move outside of the panel)
            let result = focusIn(el, Focus.Previous)
            if (result === FocusResult.Error) {
              dom(api.button)?.focus()
            }
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

    return () => {
      let slot = {
        open: api.popoverState.value === PopoverStates.Open,
        close: api.close,
      }

      let { id, focus: _focus, ...theirProps } = props
      let ourProps = {
        ref: api.panel,
        id,
        onKeydown: handleKeyDown,
        onFocusout: focus && api.popoverState.value === PopoverStates.Open ? handleBlur : undefined,
        tabIndex: -1,
      }

      return render({
        ourProps,
        theirProps: { ...attrs, ...theirProps },
        attrs,
        slot,
        slots: {
          ...slots,
          default: (...args) => [
            h(Fragment, [
              visible.value &&
                api.isPortalled.value &&
                h(Hidden, {
                  id: beforePanelSentinelId,
                  ref: api.beforePanelSentinel,
                  features: HiddenFeatures.Focusable,
                  'data-headlessui-focus-guard': true,
                  as: 'button',
                  type: 'button',
                  onFocus: handleBeforeFocus,
                }),
              slots.default?.(...args),
              visible.value &&
                api.isPortalled.value &&
                h(Hidden, {
                  id: afterPanelSentinelId,
                  ref: api.afterPanelSentinel,
                  features: HiddenFeatures.Focusable,
                  'data-headlessui-focus-guard': true,
                  as: 'button',
                  type: 'button',
                  onFocus: handleAfterFocus,
                }),
            ]),
          ],
        },
        features: Features.RenderStrategy | Features.Static,
        visible: visible.value,
        name: 'PopoverPanel',
      })
    }
  },
})

// ---

export let PopoverGroup = defineComponent({
  name: 'PopoverGroup',
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots, expose }) {
    let groupRef = ref<HTMLElement | null>(null)
    let popovers = shallowRef<PopoverRegisterBag[]>([])
    let ownerDocument = computed(() => getOwnerDocument(groupRef))
    let root = useMainTreeNode()

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
          owner!.getElementById(bag.buttonId.value!)?.contains(element) ||
          owner!.getElementById(bag.panelId.value!)?.contains(element)
        )
      })
    }

    function closeOthers(buttonId: string) {
      for (let popover of popovers.value) {
        if (popover.buttonId.value !== buttonId) popover.close()
      }
    }

    provide(PopoverGroupContext, {
      registerPopover,
      unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers,
      mainTreeNodeRef: root.mainTreeNodeRef,
    })

    return () => {
      let ourProps = { ref: groupRef }

      return h(Fragment, [
        render({
          ourProps,
          theirProps: { ...props, ...attrs },
          slot: {},
          attrs,
          slots,
          name: 'PopoverGroup',
        }),
        h(root.MainTreeNode),
      ])
    }
  },
})
