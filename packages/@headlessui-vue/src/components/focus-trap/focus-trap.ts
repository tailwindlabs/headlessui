import {
  Fragment,
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect,
  type PropType,
  type Ref,
} from 'vue'
import { useEventListener } from '../../hooks/use-event-listener'
import { Direction as TabDirection, useTabDirection } from '../../hooks/use-tab-direction'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { history } from '../../utils/active-element-history'
import { dom } from '../../utils/dom'
import { Focus, FocusResult, focusElement, focusIn } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { getOwnerDocument } from '../../utils/owner'
import { render } from '../../utils/render'

type Containers =
  // Lazy resolved containers
  | (() => Iterable<HTMLElement>)

  // List of containers
  | Ref<Set<Ref<HTMLElement | null>>>

function resolveContainers(containers?: Containers): Set<HTMLElement> {
  if (!containers) return new Set<HTMLElement>()
  if (typeof containers === 'function') return new Set(containers())

  let all = new Set<HTMLElement>()
  for (let container of containers.value) {
    let el = dom(container)
    if (el instanceof HTMLElement) {
      all.add(el)
    }
  }
  return all
}

enum Features {
  /** No features enabled for the focus trap. */
  None = 1 << 0,

  /** Ensure that we move focus initially into the container. */
  InitialFocus = 1 << 1,

  /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
  TabLock = 1 << 2,

  /** Ensure that programmatically moving focus outside of the container is disallowed. */
  FocusLock = 1 << 3,

  /** Ensure that we restore the focus when unmounting the focus trap. */
  RestoreFocus = 1 << 4,

  /** Enable all features. */
  All = InitialFocus | TabLock | FocusLock | RestoreFocus,
}

export let FocusTrap = Object.assign(
  defineComponent({
    name: 'FocusTrap',
    props: {
      as: { type: [Object, String], default: 'div' },
      initialFocus: { type: Object as PropType<HTMLElement | null>, default: null },
      features: { type: Number as PropType<Features>, default: Features.All },
      containers: {
        type: [Object, Function] as PropType<Containers>,
        default: ref(new Set()),
      },
    },
    inheritAttrs: false,
    setup(props, { attrs, slots, expose }) {
      let container = ref<HTMLElement | null>(null)

      expose({ el: container, $el: container })

      let ownerDocument = computed(() => getOwnerDocument(container))

      let mounted = ref(false)
      onMounted(() => (mounted.value = true))
      onUnmounted(() => (mounted.value = false))

      useRestoreFocus(
        { ownerDocument },
        computed(() => mounted.value && Boolean(props.features & Features.RestoreFocus))
      )
      let previousActiveElement = useInitialFocus(
        { ownerDocument, container, initialFocus: computed(() => props.initialFocus) },
        computed(() => mounted.value && Boolean(props.features & Features.InitialFocus))
      )
      useFocusLock(
        {
          ownerDocument,
          container,
          containers: props.containers,
          previousActiveElement,
        },
        computed(() => mounted.value && Boolean(props.features & Features.FocusLock))
      )

      let direction = useTabDirection()
      function handleFocus(e: FocusEvent) {
        let el = dom(container) as HTMLElement
        if (!el) return

        // TODO: Cleanup once we are using real browser tests
        let wrapper = process.env.NODE_ENV === 'test' ? microTask : (cb: Function) => cb()
        wrapper(() => {
          match(direction.value, {
            [TabDirection.Forwards]: () => {
              focusIn(el, Focus.First, { skipElements: [e.relatedTarget as HTMLElement] })
            },
            [TabDirection.Backwards]: () => {
              focusIn(el, Focus.Last, { skipElements: [e.relatedTarget as HTMLElement] })
            },
          })
        })
      }

      let recentlyUsedTabKey = ref(false)
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Tab') {
          recentlyUsedTabKey.value = true
          requestAnimationFrame(() => {
            recentlyUsedTabKey.value = false
          })
        }
      }

      function handleBlur(e: FocusEvent) {
        if (!mounted.value) return
        let allContainers = resolveContainers(props.containers)
        if (dom(container) instanceof HTMLElement) allContainers.add(dom(container)!)

        let relatedTarget = e.relatedTarget
        if (!(relatedTarget instanceof HTMLElement)) return

        // Known guards, leave them alone!
        if (relatedTarget.dataset.headlessuiFocusGuard === 'true') {
          return
        }

        // Blur is triggered due to focus on relatedTarget, and the relatedTarget is not inside any
        // of the dialog containers. In other words, let's move focus back in!
        if (!contains(allContainers, relatedTarget)) {
          // Was the blur invoked via the keyboard? Redirect to the next in line.
          if (recentlyUsedTabKey.value) {
            focusIn(
              dom(container) as HTMLElement,
              match(direction.value, {
                [TabDirection.Forwards]: () => Focus.Next,
                [TabDirection.Backwards]: () => Focus.Previous,
              }) | Focus.WrapAround,
              { relativeTo: e.target as HTMLElement }
            )
          }

          // It was invoked via something else (e.g.: click, programmatically, ...). Redirect to the
          // previous active item in the FocusTrap
          else if (e.target instanceof HTMLElement) {
            focusElement(e.target)
          }
        }
      }

      return () => {
        let slot = {}
        let ourProps = { ref: container, onKeydown: handleKeyDown, onFocusout: handleBlur }
        let { features, initialFocus, containers: _containers, ...theirProps } = props

        return h(Fragment, [
          Boolean(features & Features.TabLock) &&
            h(Hidden, {
              as: 'button',
              type: 'button',
              'data-headlessui-focus-guard': true,
              onFocus: handleFocus,
              features: HiddenFeatures.Focusable,
            }),
          render({
            ourProps,
            theirProps: { ...attrs, ...theirProps },
            slot,
            attrs,
            slots,
            name: 'FocusTrap',
          }),
          Boolean(features & Features.TabLock) &&
            h(Hidden, {
              as: 'button',
              type: 'button',
              'data-headlessui-focus-guard': true,
              onFocus: handleFocus,
              features: HiddenFeatures.Focusable,
            }),
        ])
      }
    },
  }),
  { features: Features }
)

function useRestoreElement(enabled: Ref<boolean>) {
  let localHistory = ref<HTMLElement[]>(history.slice())

  watch(
    [enabled],
    ([newEnabled], [oldEnabled]) => {
      // We are disabling the restore element, so we need to clear it.
      if (oldEnabled === true && newEnabled === false) {
        // However, let's schedule it in a microTask, so that we can still read the value in the
        // places where we are restoring the focus.
        microTask(() => {
          localHistory.value.splice(0)
        })
      }

      // We are enabling the restore element, so we need to set it to the last "focused" element.
      else if (oldEnabled === false && newEnabled === true) {
        localHistory.value = history.slice()
      }
    },
    { flush: 'post' }
  )

  // We want to return the last element that is still connected to the DOM, so we can restore the
  // focus to it.
  return () => {
    return localHistory.value.find((x) => x != null && x.isConnected) ?? null
  }
}

function useRestoreFocus(
  { ownerDocument }: { ownerDocument: Ref<Document | null> },
  enabled: Ref<boolean>
) {
  let getRestoreElement = useRestoreElement(enabled)

  // Restore the focus to the previous element
  onMounted(() => {
    watchEffect(
      () => {
        if (enabled.value) return

        if (ownerDocument.value?.activeElement === ownerDocument.value?.body) {
          focusElement(getRestoreElement())
        }
      },
      { flush: 'post' }
    )
  })

  // Restore the focus when we unmount the component
  onUnmounted(() => {
    if (!enabled.value) return

    focusElement(getRestoreElement())
  })
}

function useInitialFocus(
  {
    ownerDocument,
    container,
    initialFocus,
  }: {
    ownerDocument: Ref<Document | null>
    container: Ref<HTMLElement | null>
    initialFocus?: Ref<HTMLElement | null>
  },
  enabled: Ref<boolean>
) {
  let previousActiveElement = ref<HTMLElement | null>(null)

  let mounted = ref(false)
  onMounted(() => (mounted.value = true))
  onUnmounted(() => (mounted.value = false))

  onMounted(() => {
    watch(
      // Handle initial focus
      [container, initialFocus, enabled],
      (newValues, prevValues) => {
        if (newValues.every((value, idx) => prevValues?.[idx] === value)) return
        if (!enabled.value) return

        let containerElement = dom(container)
        if (!containerElement) return

        // Delaying the focus to the next microtask ensures that a few conditions are true:
        // - The container is rendered
        // - Transitions could be started
        // If we don't do this, then focusing an element will immediately cancel any transitions. This
        // is not ideal because transitions will look broken.
        // There is an additional issue with doing this immediately. The FocusTrap is used inside a
        // Dialog, the Dialog is rendered inside of a Portal and the Portal is rendered at the end of
        // the `document.body`. This means that the moment we call focus, the browser immediately
        // tries to focus the element, which will still be at the bodem resulting in the page to
        // scroll down. Delaying this will prevent the page to scroll down entirely.
        microTask(() => {
          if (!mounted.value) {
            return
          }

          let initialFocusElement = dom(initialFocus)

          let activeElement = ownerDocument.value?.activeElement as HTMLElement

          if (initialFocusElement) {
            if (initialFocusElement === activeElement) {
              previousActiveElement.value = activeElement
              return // Initial focus ref is already the active element
            }
          } else if (containerElement!.contains(activeElement)) {
            previousActiveElement.value = activeElement
            return // Already focused within Dialog
          }

          // Try to focus the initialFocus ref
          if (initialFocusElement) {
            focusElement(initialFocusElement)
          } else {
            if (focusIn(containerElement!, Focus.First | Focus.NoScroll) === FocusResult.Error) {
              console.warn('There are no focusable elements inside the <FocusTrap />')
            }
          }

          previousActiveElement.value = ownerDocument.value?.activeElement as HTMLElement
        })
      },
      { immediate: true, flush: 'post' }
    )
  })

  return previousActiveElement
}

function useFocusLock(
  {
    ownerDocument,
    container,
    containers,
    previousActiveElement,
  }: {
    ownerDocument: Ref<Document | null>
    container: Ref<HTMLElement | null>
    containers: Containers
    previousActiveElement: Ref<HTMLElement | null>
  },
  enabled: Ref<boolean>
) {
  // Prevent programmatically escaping
  useEventListener(
    ownerDocument.value?.defaultView,
    'focus',
    (event) => {
      if (!enabled.value) return

      let allContainers = resolveContainers(containers)
      if (dom(container) instanceof HTMLElement) allContainers.add(dom(container)!)

      let previous = previousActiveElement.value
      if (!previous) return

      let toElement = event.target as HTMLElement | null

      if (toElement && toElement instanceof HTMLElement) {
        if (!contains(allContainers, toElement)) {
          event.preventDefault()
          event.stopPropagation()
          focusElement(previous)
        } else {
          previousActiveElement.value = toElement
          focusElement(toElement)
        }
      } else {
        focusElement(previousActiveElement.value)
      }
    },
    true
  )
}

function contains(containers: Set<HTMLElement>, element: HTMLElement) {
  for (let container of containers) {
    if (container.contains(element)) return true
  }

  return false
}
