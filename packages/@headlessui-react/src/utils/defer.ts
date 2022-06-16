export function defer<T>(resolved: boolean = false) {
  let uid = 0

  let actions: {
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: any) => void
    state: 'pending' | 'resolved' | 'rejected'
    currentUid: number
  } = {
    resolve: () => {},
    reject: () => {},
    state: resolved ? 'resolved' : 'pending',
    currentUid: uid,
  }

  function wrap<
    F extends (...args: any[]) => any,
    P extends any[] = Parameters<F>,
    R = ReturnType<F>
  >(uid: number, cb: (...args: P) => R) {
    return (...args: P) => {
      if (actions.currentUid !== uid) {
        return
      }

      return cb(...args)
    }
  }

  let state = {
    promise: resolved
      ? Promise.resolve()
      : new Promise<T>((resolve, reject) => {
          Object.assign(actions, { resolve: wrap(uid, resolve), reject: wrap(uid, reject) })
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
      if (actions.state === 'pending') {
        return
      }

      actions.currentUid = ++uid

      state.promise = resolved
        ? Promise.resolve()
        : new Promise<T>((resolve, reject) => {
            Object.assign(actions, { resolve: wrap(uid, resolve), reject: wrap(uid, reject) })
          })
    },
  }
}

export class DeferredNode<T = void> {
  static #list = new Set<DeferredNode<any>>()
  static #nextId = 1

  #uid: number
  #parents: Set<DeferredNode<T>>
  #children: Set<DeferredNode<T>>
  #state: 'pending' | 'resolved' | 'settled'
  #value?: T
  #id: string
  #onResolve: (value: T) => void

  private constructor(onResolve: (value: T) => void, id?: string) {
    this.#uid = DeferredNode.#nextId++
    this.#parents = new Set()
    this.#children = new Set()
    this.#id = id ?? '<unknown>'
    this.#state = 'pending'
    this.#onResolve = onResolve
  }

  static create<T>(onResolve: (value: T) => void, id?: string): DeferredNode<T> {
    let node = new DeferredNode<T>(onResolve, id)
    this.#list.add(node)
    return node
  }

  add(child: DeferredNode<T>) {
    if (this.#state === 'settled') {
      this.#state = 'resolved'
    }

    this.#children.add(child)
    child.#parents.add(this)
  }

  remove(child: DeferredNode<T>) {
    this.#children.delete(child)
    child.#parents.delete(this)
  }

  get settled(): boolean {
    if (this.#state === 'settled') {
      return true
    }

    return this.#state === 'resolved' && Array.from(this.#children).every((child) => child.settled)
  }

  resolve(value: T) {
    if (this.#state === 'settled' || this.#state === 'resolved') {
      return
    }

    this.#value = value
    this.#state = 'resolved'
    this.#notifyIfFullySettled()
  }

  reset() {
    this.#state = 'pending'
  }

  #notifyIfFullySettled() {
    if (this.settled) {
      this.#state = 'settled'
      this.#onResolve(this.#value!)
    }

    this.#parents.forEach((parent) => parent.#notifyIfFullySettled())
  }

  static debugAll(indent: string = '\t'): string {
    let roots = new Set<DeferredNode>()

    for (const node of this.#list) {
      if (node.#parents.size === 0) {
        roots.add(node)
      }
    }

    let tmp = ''

    for (const node of roots) {
      tmp += node.debugDescription(indent) + '\n'
    }

    return tmp
  }

  debugDescription(indent: string = '\t') {
    const str = []

    for (const line of this.debugLines(indent)) {
      str.push(line)
    }

    return str.join('\n')
  }

  *debugLines(indent: string, level: number = 0): Iterable<string> {
    let prefix = indent.repeat(level)

    let desc = `${prefix}<Node ${this.#uid}: '${this.#id}'> [${this.#state}]`

    yield desc

    for (const child of this.#children) {
      yield* child.debugLines(indent, level + 1)
    }
  }
}
