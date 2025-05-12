import { mockAnimationsApi, mockResizeObserver } from 'jsdom-testing-mocks'

mockAnimationsApi() // `Element.prototype.getAnimations` and `CSSTransition` polyfill
mockResizeObserver() // `ResizeObserver` polyfill

// JSDOM Doesn't implement innerText yet: https://github.com/jsdom/jsdom/issues/1245
// So this is a hacky way of implementing it using `textContent`.
// Real implementation doesn't use textContent because:
// > textContent gets the content of all elements, including <script> and <style> elements. In
// > contrast, innerText only shows "human-readable" elements.
// >
// > — https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext
Object.defineProperty(HTMLElement.prototype, 'innerText', {
  get() {
    return this.textContent
  },
  set(value) {
    this.textContent = value
  },
})

// Source: https://github.com/testing-library/react-testing-library/issues/838#issuecomment-735259406
//
// Polyfill the PointerEvent class for JSDOM
class PointerEvent extends Event {
  constructor(type, props) {
    super(type, props)
    if (props.button != null) {
      // @ts-expect-error JSDOM doesn't support `button` yet...
      this.button = props.button
    }
  }
}
// @ts-expect-error JSDOM doesn't support `PointerEvent` yet...
window.PointerEvent = PointerEvent
