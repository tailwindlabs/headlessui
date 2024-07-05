import { onDocumentReady } from './document-ready'
import { focusableSelector } from './focus-management'

export let history: HTMLElement[] = []
onDocumentReady(() => {
  function handle(e: Event) {
    if (!(e.target instanceof HTMLElement)) return
    if (e.target === document.body) return
    if (history[0] === e.target) return

    let focusableElement = e.target as HTMLElement

    // Figure out the closest focusable element, this is needed in a situation
    // where you click on a non-focusable element inside a focusable element.
    //
    // E.g.:
    //
    // ```html
    // <button>
    //   <span>Click me</span>
    // </button>
    // ```
    focusableElement = focusableElement.closest(focusableSelector) as HTMLElement

    history.unshift(focusableElement ?? e.target)

    // Filter out DOM Nodes that don't exist anymore
    history = history.filter((x) => x != null && x.isConnected)
    history.splice(10) // Only keep the 10 most recent items
  }

  window.addEventListener('click', handle, { capture: true })
  window.addEventListener('mousedown', handle, { capture: true })
  window.addEventListener('focus', handle, { capture: true })

  document.body.addEventListener('click', handle, { capture: true })
  document.body.addEventListener('mousedown', handle, { capture: true })
  document.body.addEventListener('focus', handle, { capture: true })
})
