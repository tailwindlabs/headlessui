type ChangeFn = () => void
type UnsubscribeFn = () => void
type ActionFn<T> = (this: T, ...args: any[]) => T | void
type StoreActions<Key extends string, T> = Record<Key, ActionFn<T>>

export interface Store<T, ActionKey extends string> {
  getSnapshot(): T
  subscribe(onChange: ChangeFn): UnsubscribeFn
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

    dispatch(key: ActionKey, ...args: any[]) {
      let newState = actions[key].call(state, ...args)
      if (newState) {
        state = newState
        listeners.forEach((listener) => listener())
      }
    },
  }
}
