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

  // Must be some type of object
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return compareEntries(a[Symbol.iterator](), b[Symbol.iterator]())
  }

  // Map and Set
  if ((a instanceof Map && b instanceof Map) || (a instanceof Set && b instanceof Set)) {
    if (a.size !== b.size) return false
    return compareEntries(a.entries(), b.entries())
  }

  // Plain objects
  if (isPlainObject(a) && isPlainObject(b)) {
    return compareEntries(
      Object.entries(a)[Symbol.iterator](),
      Object.entries(b)[Symbol.iterator]()
    )
  }

  // TODO: Not sure how to compare other types of objects
  return false
}

function compareEntries(a: IterableIterator<any>, b: IterableIterator<any>): boolean {
  do {
    let aResult = a.next()
    let bResult = b.next()

    if (aResult.done && bResult.done) return true
    if (aResult.done || bResult.done) return false

    if (!Object.is(aResult.value, bResult.value)) return false
  } while (true)
}

function isPlainObject<T>(value: T): value is T & Record<keyof T, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  let prototype = Object.getPrototypeOf(value)
  return prototype === null || Object.getPrototypeOf(prototype) === null
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
