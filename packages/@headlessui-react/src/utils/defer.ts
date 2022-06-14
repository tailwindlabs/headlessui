export function defer<T>(resolved: boolean = false) {
  let actions: { resolve: (value: T | PromiseLike<T>) => void; reject: (reason?: any) => void } = {
    resolve: () => {},
    reject: () => {},
  }

  let state = {
    promise: resolved
      ? Promise.resolve()
      : new Promise<T>((resolve, reject) => {
          Object.assign(actions, { resolve, reject })
        }),
  }

  return {
    get promise() {
      return state.promise
    },
    resolve(value: T | PromiseLike<T>) {
      return actions.resolve(value)
    },
    reject(reason?: any) {
      return actions.reject(reason)
    },
    reset() {
      state.promise = resolved
        ? Promise.resolve()
        : new Promise<T>((resolve, reject) => {
            Object.assign(actions, { resolve, reject })
          })
    },
  }
}
