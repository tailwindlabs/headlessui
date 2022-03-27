import {
  computed,
  onMounted,
  ref,
  watch,

  // Types
  Ref,
} from 'vue'

import { Keys } from '../keyboard'
import { focusElement, focusIn, Focus, FocusResult } from '../utils/focus-management'
import { getOwnerDocument } from '../utils/owner'
import { useEventListener } from './use-event-listener'
import { dom } from '../utils/dom'

export enum Features {
  /** No features enabled for the `useFocusTrap` hook. */
  None = 1 << 0,

  /** Ensure that we move focus initially into the container. */
  InitialFocus = 1 << 1,

  /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
  TabLock = 1 << 2,

  /** Ensure that programmatically moving focus outside of the container is disallowed. */
  FocusLock = 1 << 3,

  /** Ensure that we restore the focus when unmounting the component that uses this `useFocusTrap` hook. */
  RestoreFocus = 1 << 4,

  /** Enable all features. */
  All = InitialFocus | TabLock | FocusLock | RestoreFocus,
}

export function useFocusTrap(
  container: Ref<HTMLElement | null>,
  features: Ref<Features> = ref(Features.All),
  options: Ref<{
    initialFocus?: Ref<HTMLElement | null>
    containers?: Ref<Set<Ref<HTMLElement | null>>>
  }> = ref({})
) {
  let restoreElement = ref<HTMLElement | null>(null)
  let previousActiveElement = ref<HTMLElement | null>(null)
  // Deliberately not using a ref, we don't want to trigger re-renders.
  let mounted = { value: false }

  let featuresRestoreFocus = computed(() => Boolean(features.value & Features.RestoreFocus))
  let featuresInitialFocus = computed(() => Boolean(features.value & Features.InitialFocus))

  let ownerDocument = computed(() => getOwnerDocument(container))

  onMounted(() => {
    // Capture the currently focused element, before we enable the focus trap.
    watch(
      featuresRestoreFocus,
      (newValue, prevValue) => {
        if (newValue === prevValue) return
        if (!featuresRestoreFocus.value) return

        mounted.value = true

        if (!restoreElement.value) {
          restoreElement.value = ownerDocument.value?.activeElement as HTMLElement
        }
      },
      { immediate: true }
    )

    // Restore the focus when we unmount the component.
    watch(
      featuresRestoreFocus,
      (newValue, prevValue, onInvalidate) => {
        if (newValue === prevValue) return
        if (!featuresRestoreFocus.value) return

        onInvalidate(() => {
          if (mounted.value === false) return
          mounted.value = false

          focusElement(restoreElement.value)
          restoreElement.value = null
        })
      },
      { immediate: true }
    )

    // Handle initial focus
    watch(
      [container, options, options.value.initialFocus, featuresInitialFocus],
      (newValues, prevValues) => {
        if (newValues.every((value, idx) => prevValues?.[idx] === value)) return
        if (!featuresInitialFocus.value) return

        let containerElement = container.value
        if (!containerElement) return

        let initialFocusElement = dom(options.value.initialFocus)

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
      { immediate: true }
    )
  })

  // Handle Tab & Shift+Tab keyboard events
  useEventListener(ownerDocument.value?.defaultView, 'keydown', (event) => {
    if (!(features.value & Features.TabLock)) return

    if (!container.value) return
    if (event.key !== Keys.Tab) return

    event.preventDefault()

    if (
      focusIn(
        container.value,
        (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround
      ) === FocusResult.Success
    ) {
      previousActiveElement.value = ownerDocument.value?.activeElement as HTMLElement
    }
  })

  // Prevent programmatically escaping
  useEventListener(
    ownerDocument.value?.defaultView,
    'focus',
    (event) => {
      if (!(features.value & Features.FocusLock)) return

      let allContainers = new Set(options.value.containers?.value)
      allContainers.add(container)

      if (!allContainers.size) return

      let previous = previousActiveElement.value
      if (!previous) return
      if (!mounted.value) return

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

  return restoreElement
}

function contains(containers: Set<Ref<HTMLElement | null>>, element: HTMLElement) {
  for (let container of containers) {
    if (container.value?.contains(element)) return true
  }

  return false
}
