globalThis.IS_REACT_ACT_ENVIRONMENT = true

// These are not 1:1 perfect polyfills, but they implement the parts we need for
// testing. The implementation of the `getAnimations` uses the `setTimeout`
// approach we used in the past.
//
// This is only necessary because JSDOM does not implement `getAnimations` or
// `CSSTransition` yet. This is a temporary solution until JSDOM implements
// these features. Or, until we use proper browser tests using Puppeteer or
// Playwright.
{
  if (typeof CSSTransition === 'undefined') {
    globalThis.CSSTransition = class CSSTransition {
      constructor(duration) {
        this.duration = duration
      }

      finished = new Promise((resolve) => {
        setTimeout(resolve, this.duration)
      })
    }
  }

  if (typeof Element.prototype.getAnimations !== 'function') {
    Element.prototype.getAnimations = function () {
      let { transitionDuration, transitionDelay } = getComputedStyle(this)

      let [durationMs, delayMs] = [transitionDuration, transitionDelay].map((value) => {
        let [resolvedValue = 0] = value
          .split(',')
          // Remove falsy we can't work with
          .filter(Boolean)
          // Values are returned as `0.3s` or `75ms`
          .map((v) => (v.includes('ms') ? parseFloat(v) : parseFloat(v) * 1000))
          .sort((a, z) => z - a)

        return resolvedValue
      })

      let totalDuration = durationMs + delayMs
      if (totalDuration === 0) return []

      return [new CSSTransition(totalDuration)]
    }
  }
}
