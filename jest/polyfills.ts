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

import * as timers from "timers"
import { TextEncoder } from "util"
global.TextEncoder = TextEncoder

let state = {
  id: 0,
  tasks: new Map(),
}

// @ts-ignore
global.setImmediate = function setImmediate(cb) {
  let id = state.id++
  let timer = timers.setImmediate(() => cb())
  state.tasks.set(id, timer)
  return id
}

global.clearImmediate = function clearImmediate(id) {
  let timer = state.tasks.get(id)
  timer && timers.clearImmediate(timer)
}
