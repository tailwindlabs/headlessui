type ChangeFn = () => void
type UnsubscribeFn = () => void
type ActionFn<T> = (this: T, ...args: any[]) => void
type StoreActions<Key extends string, T> = Record<Key, ActionFn<T>>

export interface Store<T, ActionKey extends string> {
  getSnapshot(): T
  subscribe(onChange: ChangeFn): UnsubscribeFn
  update(updater: (state: T) => void): void
  replace(updater: (state: T) => T): void
  dispatch(action: ActionKey, ...args: any[]): void
}

export function createStore<T, ActionKey extends string>(
  initial: () => T,
  actions: StoreActions<ActionKey, T>
): Store<T, ActionKey> {
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

    update(updater) {
      updater(state)
      listeners.forEach((listener) => listener())
    },

    replace(updater) {
      state = updater(state)
      listeners.forEach((listener) => listener())
    },

    dispatch(key: ActionKey, ...args: any[]) {
      actions[key].call(state, ...args)
    },
  }
}
