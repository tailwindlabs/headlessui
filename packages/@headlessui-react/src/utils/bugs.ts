import * as DOM from './dom'

// See: https://github.com/facebook/react/issues/7711
// See: https://github.com/facebook/react/pull/20612
// See: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#concept-fe-disabled (2.)
export function isDisabledReactIssue7711(element: Element): boolean {
  let parent = element.parentElement
  let legend = null

  while (parent && !DOM.isHTMLFieldSetElement(parent)) {
    if (DOM.isHTMLLegendElement(parent)) legend = parent
    parent = parent.parentElement
  }

  let isParentDisabled = parent?.getAttribute('disabled') === '' ?? false
  if (isParentDisabled && isFirstLegend(legend)) return false

  return isParentDisabled
}

function isFirstLegend(element: HTMLLegendElement | null): boolean {
  if (!element) return false

  let previous = element.previousElementSibling

  while (previous !== null) {
    if (DOM.isHTMLLegendElement(previous)) return false
    previous = previous.previousElementSibling
  }

  return true
}
