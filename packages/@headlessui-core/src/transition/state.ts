import { match } from '../utils/match'
import { Machine } from '../utils/machine'

type ContainerState = 'idle' | 'entering' | 'leaving' | 'cancelled' | 'done'
type SelfState = 'idle' | 'running' | 'waiting_for_children'
type ChildrenState = 'idle' | 'some_running' | 'all_running' | 'waiting_for_self'

type UserEvents =
  // Overall
  | { type: 'reset'; payload: undefined }
  | { type: 'enter'; payload: undefined }
  | { type: 'leave'; payload: undefined }
  | { type: 'cancel'; payload: undefined }

  // Transition Controls
  | { type: 'start'; payload: undefined }
  | { type: 'stop'; payload: undefined }

type InternalEvents =
  | { type: '#child.add'; payload: TransitionMachine }
  | { type: '#child.remove'; payload: TransitionMachine }
  | { type: '#child.become'; payload: TransitionMachine }
  | { type: '#child.resign'; payload: TransitionMachine }
  | { type: '#child.start'; payload: undefined }
  | { type: '#child.stop'; payload: undefined }

export type TransitionEvents = UserEvents | InternalEvents
export type TransitionState = readonly [ContainerState, SelfState, ChildrenState]
export type TransitionStateDescriptor = {
  readonly container: ContainerState
  readonly self: SelfState
  readonly children: ChildrenState
}

export type TransitionStateMatcher = {
  readonly container: readonly ContainerState[]
  readonly self: readonly SelfState[]
  readonly children: readonly ChildrenState[]
}

export type TransitionActions = {
  onStart?: () => void
  onStop?: () => void
  onCancel?: () => void
  onEvent?: (event: TransitionEvents['type'], payload?: any) => void
  onChange?: (before: TransitionState, after: TransitionState) => void
}

export interface TransitionMachine extends Machine<TransitionState, TransitionEvents> {
  readonly state: TransitionState

  add(child: TransitionMachine): void
  remove(child: TransitionMachine): void
  send<EventType extends TransitionEvents['type']>(
    event: EventType,
    payload?: Extract<TransitionEvents, { type: EventType }>['payload']
  ): void
}

export function createTransitionMachine(
  id: string,
  actions?: TransitionActions
): TransitionMachine {
  return new TransitionMachineImpl(id, actions)
}

let uid = 1

class TransitionMachineImpl implements TransitionMachine {
  public readonly id: string

  public state: TransitionState = ['idle', 'idle', 'idle']
  private actions: TransitionActions

  private parent: TransitionMachine | undefined
  private children = new Set<TransitionMachine>()

  constructor(id: string, actions: TransitionActions = {}) {
    this.id = `${id} [${uid++}]`
    this.actions = actions
  }

  subscribe(_: () => void): () => void {
    return () => {}
  }

  // Machine interaction
  public add(child: TransitionMachine) {
    this.send('#child.add', child)
  }

  public remove(child: TransitionMachine) {
    this.send('#child.remove', child)
  }

  public send(event: TransitionEvents['type'], payload?: any) {
    this.actions.onEvent?.(event, payload)

    console.log({ id: this.id, event })

    match(event, {
      // User events - Overall
      reset: () => this.reset(),
      enter: () => this.enter(),
      leave: () => this.leave(),
      cancel: () => this.cancel(),

      // User events - Self/Children Transition
      start: () => this.start(),
      stop: () => this.stop(),

      // Internal Events
      '#child.add': () => this.#childAdd(payload),
      '#child.remove': () => this.#childRemove(payload),
      '#child.become': () => this.#childBecome(payload),
      '#child.resign': () => this.#childResign(payload),
      '#child.start': () => this.#childStart(),
      '#child.stop': () => this.#childStop(),
    })
  }

  // User events - Overall
  public reset() {
    this.children.forEach((child) => child.send('reset'))
    this.moveTo({ container: 'idle', self: 'idle', children: 'idle' })
  }

  public enter() {
    this.when({ container: ['idle'] }, () => this.moveTo({ container: 'entering', self: 'idle' }))
  }

  public leave() {
    this.when({ container: ['idle'] }, () => this.moveTo({ container: 'leaving', self: 'idle' }))
  }

  public cancel() {
    this.when({ container: ['entering', 'leaving'] }, () =>
      this.moveTo({ container: 'cancelled', self: 'idle', children: 'idle' })
    )
  }

  // User events - Self/Children Transition
  public start() {
    this.when({ self: ['idle'] }, () => this.moveTo({ self: 'running' }))
  }

  public stop() {
    this.when({ self: ['running'] }, () => {
      if (this.hasRunningChildren()) {
        this.moveTo({ self: 'waiting_for_children' })
      } else {
        this.moveTo({ container: 'done', self: 'idle', children: 'idle' })
      }
    })

    this.when({ children: ['waiting_for_self'] }, () =>
      this.moveTo({ container: 'done', self: 'idle', children: 'idle' })
    )
  }

  // Internal Events
  #childAdd(child: TransitionMachine) {
    this.children.add(child)
    child.send('#child.become', this)
  }

  #childRemove(child: TransitionMachine) {
    this.children.delete(child)
    child.send('#child.resign', this)
  }

  #childBecome(parent: TransitionMachine) {
    this.parent = parent
  }

  #childResign(_: TransitionMachine) {
    this.parent = undefined
  }

  #childStart() {
    this.when({ children: ['idle'] }, () => {
      if (this.allChildrenHaveStarted()) {
        this.moveTo({ children: 'all_running' })
      } else {
        this.moveTo({ children: 'some_running' })
      }
    })

    this.when({ children: ['some_running'] }, () => {
      if (this.allChildrenHaveStarted()) {
        this.moveTo({ children: 'all_running' })
      }
    })
  }

  #childStop() {
    this.when({ self: ['idle', 'running'], children: ['all_running'] }, () => {
      if (!this.hasRunningChildren()) {
        this.moveTo({ children: 'waiting_for_self' })
      }
    })

    this.when({ self: ['waiting_for_children'], children: ['all_running'] }, () => {
      if (!this.hasRunningChildren()) {
        this.moveTo({ container: 'done', self: 'idle', children: 'idle' })
      }
    })

    this.when({ self: ['waiting_for_children'], children: ['waiting_for_self'] }, () => {
      if (!this.hasRunningChildren()) {
        this.moveTo({ container: 'done', self: 'idle', children: 'idle' })
      }
    })

    // TODO: Can this be simplified or removed?
    if (!this.hasRunningChildren() && this.children.size === 1) {
      this.actions.onStop?.()
    }
  }

  // Internal Methods
  private onStateChange(before: TransitionState, after: TransitionState) {
    console.log('State Change:', {
      id: this.id,
      before: before.join(', '),
      after: after.join(', '),
    })

    if (
      this.matches(before, { container: ['idle'] }) &&
      this.matches(after, { container: ['entering', 'leaving'] })
    ) {
      this.actions.onStart?.()
    }

    if (
      this.matches(before, { container: ['entering', 'leaving'] }) &&
      this.matches(after, { container: ['done'] })
    ) {
      this.actions.onStop?.()
    }

    if (this.matches(after, { container: ['cancelled'] })) {
      this.actions.onCancel?.()
    }

    if (
      this.matches(before, { container: ['entering', 'leaving'], self: ['idle'] }) &&
      this.matches(after, { container: ['entering', 'leaving'], self: ['running'] })
    ) {
      this.parent?.send('#child.start')
    }

    if (
      !this.matches(before, { container: ['done'] }) &&
      this.matches(after, { container: ['done'] })
    ) {
      this.parent?.send('#child.stop')
    }

    if (
      !this.matches(before, { container: ['cancelled'] }) &&
      this.matches(after, { container: ['cancelled'] })
    ) {
      this.parent?.send('#child.stop')
    }
  }

  private hasRunningChildren() {
    for (const child of this.children) {
      if (child.state[0] === 'entering' || child.state[0] === 'leaving') {
        return true
      }
    }

    return false
  }

  private allChildrenHaveStarted() {
    for (const child of this.children) {
      if (child.state[0] === 'idle') {
        return false
      }

      if (child.state[0] !== 'done' && child.state[1] === 'idle') {
        return false
      }
    }

    return true
  }

  private when(matcher: Partial<TransitionStateMatcher>, callback?: () => void) {
    if (this.matches(this.state, matcher)) {
      callback?.()
    }
  }

  private matches(state: TransitionState, matcher: Partial<TransitionStateMatcher>): boolean {
    let containerMatches = matcher.container?.includes(state[0]) ?? true
    let selfMatches = matcher.self?.includes(state[1]) ?? true
    let childrenMatches = matcher.children?.includes(state[2]) ?? true

    return containerMatches && selfMatches && childrenMatches
  }

  private moveTo(descriptor: Partial<TransitionStateDescriptor>) {
    console.log('Move to', { id: this.id, descriptor })

    const before: TransitionState = [...this.state]
    const after: TransitionState = Object.freeze([
      descriptor.container ?? before[0],
      descriptor.self ?? before[1],
      descriptor.children ?? before[2],
    ] as const)

    const isSame = before[0] === after[0] && before[1] === after[1] && before[2] === after[2]

    if (isSame) {
      return
    }

    this.state = after

    this.onStateChange(before, after)
    this.actions.onChange?.(before, after)
  }

  public debugDescription(indent: string = '\t') {
    const str = []

    for (const line of this.debugLines(this, indent)) {
      str.push(line)
    }

    return str.join('\n')
  }

  private *debugLines(machine: Machine, indent: string, level: number = 0): Iterable<string> {
    let prefix = indent.repeat(level)

    let desc = `${prefix}<Machine ${machine.id}> [${machine.state.join(', ')}]`

    yield desc

    if (!(machine instanceof TransitionMachineImpl)) {
      return
    }

    for (const child of machine.children) {
      yield* this.debugLines(child, indent, level + 1)
    }
  }
}
