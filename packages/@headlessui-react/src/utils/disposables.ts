export function disposables() {
  let disposables: Function[] = []
  let queue: Function[] = []

  let api = {
    enqueue(fn: Function) {
      queue.push(fn)
    },

    addEventListener<TEventName extends keyof WindowEventMap>(
      element: HTMLElement,
      name: TEventName,
      listener: (event: WindowEventMap[TEventName]) => any,
      options?: boolean | AddEventListenerOptions
    ) {
      element.addEventListener(name, listener as any, options)
      return api.add(() => element.removeEventListener(name, listener as any, options))
    },

    requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
      let raf = requestAnimationFrame(...args)
      return api.add(() => cancelAnimationFrame(raf))
    },

    nextFrame(...args: Parameters<typeof requestAnimationFrame>) {
      return api.requestAnimationFrame(() => {
        return api.requestAnimationFrame(...args)
      })
    },

    setTimeout(...args: Parameters<typeof setTimeout>) {
      let timer = setTimeout(...args)
      return api.add(() => clearTimeout(timer))
    },

    add(cb: () => void) {
      disposables.push(cb)
      return () => {
        let idx = disposables.indexOf(cb)
        if (idx >= 0) {
          let [dispose] = disposables.splice(idx, 1)
          dispose()
        }
      }
    },

    dispose() {
      for (let dispose of disposables.splice(0)) {
        dispose()
      }
    },

    async workQueue() {
      for (let handle of queue.splice(0)) {
        await handle()
      }
    },
  }

  return api
}
