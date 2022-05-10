import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  watch,

  // Types
  PropType,
  Fragment,
  Ref,
} from 'vue'
import { render } from '../../utils/render'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { dom } from '../../utils/dom'
import { focusIn, Focus, focusElement, FocusResult } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { useTabDirection, Direction as TabDirection } from '../../hooks/use-tab-direction'
import { getOwnerDocument } from '../../utils/owner'
import { useEventListener } from '../../hooks/use-event-listener'
import { microTask } from '../../utils/micro-task'

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
        type: Object as PropType<Ref<Set<Ref<HTMLElement | null>>>>,
        default: ref(new Set()),
      },
    },
    inheritAttrs: false,
    setup(props, { attrs, slots, expose }) {
      let container = ref<HTMLElement | null>(null)

      expose({ el: container, $el: container })

      let ownerDocument = computed(() => getOwnerDocument(container))

      useRestoreFocus(
        { ownerDocument },
        computed(() => Boolean(props.features & Features.RestoreFocus))
      )
      let previousActiveElement = useInitialFocus(
        { ownerDocument, container, initialFocus: computed(() => props.initialFocus) },
        computed(() => Boolean(props.features & Features.InitialFocus))
      )
      useFocusLock(
        {
          ownerDocument,
          container,
          containers: props.containers,
          previousActiveElement,
        },
        computed(() => Boolean(props.features & Features.FocusLock))
      )

      let direction = useTabDirection()
      function handleFocus() {
        let el = dom(container) as HTMLElement
        if (!el) return

        // TODO: Cleanup once we are using real browser tests
        if (process.env.NODE_ENV === 'test') {
          microTask(() => {
            match(direction.value, {
              [TabDirection.Forwards]: () => focusIn(el, Focus.First),
              [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
            })
          })
        } else {
          match(direction.value, {
            [TabDirection.Forwards]: () => focusIn(el, Focus.First),
            [TabDirection.Backwards]: () => focusIn(el, Focus.Last),
          })
        }
      }

      return () => {
        let slot = {}
        let ourProps = { 'data-hi': 'container', ref: container }
        let { features, initialFocus, containers: _containers, ...incomingProps } = props

        return h(Fragment, [
          Boolean(features & Features.TabLock) &&
            h(Hidden, {
              as: 'button',
              type: 'button',
              onFocus: handleFocus,
              features: HiddenFeatures.Focusable,
            }),
          render({
            props: { ...attrs, ...incomingProps, ...ourProps },
            slot,
            attrs,
            slots,
            name: 'FocusTrap',
          }),
          Boolean(features & Features.TabLock) &&
            h(Hidden, {
              as: 'button',
              type: 'button',
              onFocus: handleFocus,
              features: HiddenFeatures.Focusable,
            }),
        ])
      }
    },
  }),
  { features: Features }
)

function useRestoreFocus(
  { ownerDocument }: { ownerDocument: Ref<Document | null> },
  enabled: Ref<boolean>
) {
  let restoreElement = ref<HTMLElement | null>(null)

  // Deliberately not using a ref, we don't want to trigger re-renders.
  let mounted = { value: false }

  onMounted(() => {
    // Capture the currently focused element, before we try to move the focus inside the FocusTrap.
    watch(
      enabled,
      (newValue, prevValue) => {
        if (newValue === prevValue) return
        if (!enabled.value) return

        mounted.value = true

        if (!restoreElement.value) {
          restoreElement.value = ownerDocument.value?.activeElement as HTMLElement
        }
      },
      { immediate: true }
    )

    // Restore the focus when we unmount the component.
    watch(
      enabled,
      (newValue, prevValue, onInvalidate) => {
        if (newValue === prevValue) return
        if (!enabled.value) return

        onInvalidate(() => {
          if (mounted.value === false) return
          mounted.value = false

          focusElement(restoreElement.value)
          restoreElement.value = null
        })
      },
      { immediate: true }
    )
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

  onMounted(() => {
    watch(
      // Handle initial focus
      [container, initialFocus, enabled],
      (newValues, prevValues) => {
        if (newValues.every((value, idx) => prevValues?.[idx] === value)) return
        if (!enabled.value) return

        let containerElement = dom(container)
        if (!containerElement) return

        let initialFocusElement = dom(initialFocus)

        let activeElement = ownerDocument.value?.activeElement as HTMLElement

        if (initialFocusElement) {
          if (initialFocusElement === activeElement) {
            previousActiveElement.value = activeElement
            return // Initial focus ref is already the active element
          }
        } else if (containerElement.contains(activeElement)) {
          previousActiveElement.value = activeElement
          return // Already focused within Dialog
        }

        // Try to focus the initialFocus ref
        if (initialFocusElement) {
          focusElement(initialFocusElement)
        } else {
          if (focusIn(containerElement, Focus.First) === FocusResult.Error) {
            console.warn('There are no focusable elements inside the <FocusTrap />')
          }
        }

        previousActiveElement.value = ownerDocument.value?.activeElement as HTMLElement
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
    containers: Ref<Set<Ref<HTMLElement | null>>>
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

      let allContainers = new Set(containers?.value)
      allContainers.add(container)

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

function contains(containers: Set<Ref<HTMLElement | null>>, element: HTMLElement) {
  for (let container of containers) {
    if (container.value?.contains(element)) return true
  }

  return false
}
