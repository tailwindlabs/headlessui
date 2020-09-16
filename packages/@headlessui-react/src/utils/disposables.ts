export function disposables() {
  const disposables: Function[] = []

  const api = {
    requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
      const raf = requestAnimationFrame(...args)
      api.add(() => cancelAnimationFrame(raf))
    },

    nextFrame(...args: Parameters<typeof requestAnimationFrame>) {
      api.requestAnimationFrame(() => {
        api.requestAnimationFrame(...args)
      })
    },

    setTimeout(...args: Parameters<typeof setTimeout>) {
      const timer = setTimeout(...args)
      api.add(() => clearTimeout(timer))
    },

    add(cb: () => void) {
      disposables.push(cb)
    },

    dispose() {
      disposables.splice(0).forEach(dispose => dispose())
    },
  }

  return api
}
