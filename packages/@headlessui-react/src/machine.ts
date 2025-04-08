import { DefaultMap } from './utils/default-map'
import { disposables } from './utils/disposables'

export abstract class Machine<State, Event extends { type: number | string }> {
  #state: State = {} as State
  #eventSubscribers = new DefaultMap<Event['type'], Set<(state: State, event: Event) => void>>(
    () => new Set()
  )
  #subscribers: Set<Subscriber<State, any>> = new Set()

  constructor(initialState: State) {
    this.#state = initialState
  }

  get state(): Readonly<State> {
    return this.#state
  }

  abstract reduce(state: Readonly<State>, event: Event): Readonly<State>

  subscribe<Slice>(
    selector: (state: Readonly<State>) => Slice,
    callback: (state: Slice) => void
  ): () => void {
    let subscriber: Subscriber<State, Slice> = {
      selector,
      callback,
      current: selector(this.#state),
    }
    this.#subscribers.add(subscriber)

    return () => {
      this.#subscribers.delete(subscriber)
    }
  }

  on(type: Event['type'], callback: (state: State, event: Event) => void) {
    this.#eventSubscribers.get(type).add(callback)
    return () => {
      this.#eventSubscribers.get(type).delete(callback)
    }
  }

  send(event: Event) {
    this.#state = this.reduce(this.#state, event)

    for (let subscriber of this.#subscribers) {
      let slice = subscriber.selector(this.#state)
      if (shallowEqual(subscriber.current, slice)) continue

      subscriber.current = slice
      subscriber.callback(slice)
    }

    for (let callback of this.#eventSubscribers.get(event.type)) {
      callback(this.#state, event)
    }
  }
}

interface Subscriber<State, Slice> {
  selector: (state: Readonly<State>) => Slice
  callback: (state: Slice) => void
  current: Slice
}

export function shallowEqual(a: any, b: any): boolean {
  // Exact same reference
  if (Object.is(a, b)) return true

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false
    }

    return true
  }

  // Objects
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false

  let aKeys = Object.keys(a)
  let bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) return false

  for (let key of aKeys) {
    if (!Object.is(a[key], b[key])) return false
  }

  // Assumption: everything else is considered equal
  // TODO: Add more specific checks for other types when needed such as Map,
  // Set, ...
  return true
}

export function batch<F extends (...args: any[]) => void, P extends any[] = Parameters<F>>(
  setup: () => [callback: F, handle: () => void]
) {
  let [callback, handle] = setup()
  let d = disposables()
  return (...args: P) => {
    callback(...args)
    d.dispose()
    d.microTask(handle)
  }
}
