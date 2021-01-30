export function disposables() {
  let disposables: Function[] = []

  let api = {
    requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
      let raf = requestAnimationFrame(...args)
      api.add(() => cancelAnimationFrame(raf))
    },

    nextFrame(...args: Parameters<typeof requestAnimationFrame>) {
      api.requestAnimationFrame(() => {
        api.requestAnimationFrame(...args)
      })
    },

    setTimeout(...args: Parameters<typeof setTimeout>) {
      let timer = setTimeout(...args)
      api.add(() => clearTimeout(timer))
    },

    add(cb: () => void) {
      disposables.push(cb)
    },

    dispose() {
      for (let dispose of disposables.splice(0)) {
        dispose()
      }
    },
  }

  return api
}
