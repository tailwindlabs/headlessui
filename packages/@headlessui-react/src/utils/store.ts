type ChangeFn = () => void
type UnsubscribeFn = () => void

export interface Store<T> {
  getSnapshot(): T
  subscribe(onChange: ChangeFn): UnsubscribeFn
  merge(updater: (state: T) => Partial<T>): void
  replace(updater: (state: T) => T): void
}

export function createLockStore(): Store<number> {
  return createStore(() => 0)
}

export function createStore<T>(initial: () => T): Store<T> {
  let state: T = initial()

  let listeners = new Set<ChangeFn>()

  return {
    getSnapshot() {
      return state
    },

    subscribe(onChange) {
      listeners.add(onChange)

      return () => listeners.delete(onChange)
    },

    replace(updater) {
      state = updater(state)
      listeners.forEach((listener) => listener())
    },

    merge(updater) {
      this.replace((state) => ({ ...state, ...updater(state) }))
    },
  }
}
