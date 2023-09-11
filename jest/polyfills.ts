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

function microTask(cb: Parameters<typeof queueMicrotask>[0]) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(cb)
  } else {
    Promise.resolve()
      .then(cb)
      .catch((e) =>
        setTimeout(() => {
          throw e
        })
      )
  }
}

let state = {
  id: 0,
  tasks: new Map(),
}

global.setImmediate = function setImmediate(cb) {
  let id = state.id++
  state.tasks.set(id, cb)
  microTask(() => {
    if (state.tasks.has(id)) {
      state.tasks.get(id)()
      state.tasks.delete(id)
    }
  })
  return id
}

global.clearImmediate = function clearImmediate(id) {
  state.tasks.delete(id)
}
