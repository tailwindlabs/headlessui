import { computed, Ref, ComputedRef, ref } from 'vue'
import { FocusableMode, isFocusableElement } from '../utils/focus-management'
import { dom } from '../utils/dom'
import { useDocumentEvent } from './use-document-event'

type Container = Ref<HTMLElement | null> | HTMLElement | null
type ContainerCollection = Container[] | Set<Container>
type ContainerInput = Container | ContainerCollection

export function useOutsideClick(
  containers: ContainerInput | (() => ContainerInput),
  cb: (event: MouseEvent | PointerEvent | FocusEvent, target: HTMLElement) => void,
  enabled: ComputedRef<boolean> = computed(() => true)
) {
  function handleOutsideClick<E extends MouseEvent | PointerEvent | FocusEvent>(
    event: E,
    resolveTarget: (event: E) => HTMLElement | null
  ) {
    if (!enabled.value) return

    // Check whether the event got prevented already. This can happen if you use the
    // useOutsideClick hook in both a Dialog and a Menu and the inner Menu "cancels" the default
    // behaviour so that only the Menu closes and not the Dialog (yet)
    if (event.defaultPrevented) return

    let target = resolveTarget(event)

    if (target === null) {
      return
    }

    // Ignore if the target doesn't exist in the DOM anymore
    if (!target.ownerDocument.documentElement.contains(target)) return

    let _containers = (function resolve(containers): ContainerCollection {
      if (typeof containers === 'function') {
        return resolve(containers())
      }

      if (Array.isArray(containers)) {
        return containers
      }

      if (containers instanceof Set) {
        return containers
      }

      return [containers]
    })(containers)

    // Ignore if the target exists in one of the containers
    for (let container of _containers) {
      if (container === null) continue
      let domNode = container instanceof HTMLElement ? container : dom(container)
      if (domNode?.contains(target)) {
        return
      }
    }

    // This allows us to check whether the event was defaultPrevented when you are nesting this
    // inside a `<Dialog />` for example.
    if (
      // This check alllows us to know whether or not we clicked on a "focusable" element like a
      // button or an input. This is a backwards compatibility check so that you can open a <Menu
      // /> and click on another <Menu /> which should close Menu A and open Menu B. We might
      // revisit that so that you will require 2 clicks instead.
      !isFocusableElement(target, FocusableMode.Loose) &&
      // This could be improved, but the `Combobox.Button` adds tabIndex={-1} to make it
      // unfocusable via the keyboard so that tabbing to the next item from the input doesn't
      // first go to the button.
      target.tabIndex !== -1
    ) {
      event.preventDefault()
    }

    return cb(event, target)
  }

  let initialClickTarget = ref<EventTarget | null>(null)

  useDocumentEvent(
    'mousedown',
    (event) => {
      if (enabled.value) {
        initialClickTarget.value = event.composedPath?.()?.[0] || event.target
      }
    },
    true
  )

  useDocumentEvent(
    'click',
    (event) => {
      if (!initialClickTarget.value) {
        return
      }

      handleOutsideClick(event, () => {
        return initialClickTarget.value as HTMLElement
      })

      initialClickTarget.value = null
    },

    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  )

  // When content inside an iframe is clicked `window` will receive a blur event
  // This can happen when an iframe _inside_ a window is clicked
  // Or, if headless UI is *in* the iframe, when a content in a window containing that iframe is clicked

  // In this case we care only about the first case so we check to see if the active element is the iframe
  // If so this was because of a click, focus, or other interaction with the child iframe
  // and we can consider it an "outside click"
  useDocumentEvent(
    'blur',
    (event) =>
      handleOutsideClick(event, () =>
        window.document.activeElement instanceof HTMLIFrameElement
          ? window.document.activeElement
          : null
      ),
    true
  )
}
