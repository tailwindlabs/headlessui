import { match } from '../utils/match'
import { Machine } from '../utils/machine'

type ContainerState = 'idle' | 'entering' | 'leaving' | 'cancelled' | 'done'
type SelfState = 'idle' | 'pending' | 'ready' | 'running' | 'finished'

type UserEvents =
  | { type: 'reset'; payload: undefined }
  | { type: 'enter'; payload: undefined }
  | { type: 'leave'; payload: undefined }

type ElementEvents =
  | { type: 'start'; payload: undefined }
  | { type: 'stop'; payload: undefined }
  | { type: 'cancel'; payload: undefined }

type InternalEvents =
  | { type: '#descendant.pending'; payload: undefined }
  | { type: '#descendant.start'; payload: undefined }
  | { type: '#descendant.stop'; payload: undefined }
  | { type: '#moveTo'; payload: Partial<TransitionStateDescriptor> }

export type TransitionEvents = UserEvents | ElementEvents | InternalEvents
export type TransitionState = readonly [ContainerState, SelfState]
export type TransitionStateDescriptor = {
  readonly container: ContainerState
  readonly self: SelfState
}

export type TransitionStateMatcher = {
  readonly container: readonly ContainerState[]
  readonly self: readonly SelfState[]
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

  parent: TransitionMachine | undefined
  children: Set<TransitionMachine>

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

  public state: TransitionState = ['idle', 'idle']
  private actions: TransitionActions

  public parent: TransitionMachine | undefined
  public children = new Set<TransitionMachine>()

  constructor(id: string, actions: TransitionActions = {}) {
    this.id = `${id} [${uid++}]`
    this.actions = actions
  }

  // Machine interaction
  public add(child: TransitionMachine) {
    this.children.add(child)
    child.parent = this
  }

  public remove(child: TransitionMachine) {
    this.children.delete(child)
    child.parent = undefined
  }

  public send(event: TransitionEvents['type'], payload?: any) {
    this.actions.onEvent?.(event, payload)

    match(event, {
      // User events - Overall
      reset: () => this.reset(),
      enter: () => this.enter(),
      leave: () => this.leave(),

      // DOM controlled events - Transition
      start: () => this.start(),
      stop: () => this.stop(),
      cancel: () => this.cancel(),

      // Internal Events
      '#descendant.pending': () => this.#descendantPending(),
      '#descendant.start': () => this.#descendantStart(),
      '#descendant.stop': () => this.#descendantStop(),
      '#moveTo': () => this.moveTo(payload),
    })
  }

  // User events - Overall
  public reset() {
    this.children.forEach((child) => child.send('reset'))
    this.moveTo({ container: 'idle', self: 'idle' })
  }

  public enter() {
    this.when({ container: ['idle'] }, () =>
      this.moveTo({ container: 'entering', self: 'pending' })
    )
  }

  public leave() {
    this.when({ container: ['idle'] }, () => this.moveTo({ container: 'leaving', self: 'pending' }))
  }

  public cancel() {
    //
  }

  // User events - Self/Children Transition
  public start() {
    if (!this.isRoot) {
      return
    }

    this.when({ self: ['ready'] }, () => this.moveTo({ self: 'running' }))
  }

  public stop() {
    this.when({ self: ['running'] }, () => this.moveTo({ self: 'finished' }))
  }

  // Internal Events
  #descendantPending() {
    this.parent?.send('#descendant.pending')

    this.moveToReadyIfNeeded()
  }

  #descendantStart() {
    this.parent?.send('#descendant.start')
  }

  #descendantStop() {
    this.parent?.send('#descendant.stop')
    this.moveToDoneIfNeeded()
  }

  private moveToReadyIfNeeded() {
    if (!this.isRoot) {
      return
    }

    if (!this.allDescendantsArePending) {
      return
    }

    this.when({ self: ['pending'] }, () => this.moveTo({ self: 'ready' }))
  }

  moveToDoneIfNeeded() {
    if (!this.isRoot) {
      return
    }

    if (!this.allDescendantsAreFinished) {
      return
    }

    this.when({ self: ['finished'] }, () => this.moveTo({ container: 'done', self: 'idle' }))
  }

  // Internal Methods
  private onStateChange(before: TransitionState, after: TransitionState) {
    this.actions.onChange?.(before, after)

    if (this.matches(before, { self: ['idle'] }) && this.matches(after, { self: ['pending'] })) {
      this.parent?.send('#descendant.pending')
      this.moveToReadyIfNeeded()
    }

    if (this.matches(before, { self: ['pending'] }) && this.matches(after, { self: ['ready'] })) {
      this.actions.onStart?.()
      this.children.forEach((child) => child.send('#moveTo', { self: 'ready' }))
    }

    if (this.matches(before, { self: ['ready'] }) && this.matches(after, { self: ['running'] })) {
      this.children.forEach((child) => child.send('#moveTo', { self: 'running' }))
    }

    if (
      this.matches(before, { self: ['running'] }) &&
      this.matches(after, { self: ['finished'] })
    ) {
      this.parent?.send('#descendant.stop')
      this.moveToDoneIfNeeded()
    }

    if (
      this.matches(before, { container: ['entering', 'leaving'] }) &&
      this.matches(after, { container: ['done'] })
    ) {
      this.children.forEach((child) => child.send('#moveTo', { container: 'done', self: 'idle' }))
      this.actions.onStop?.()
    }
  }

  private get isRoot() {
    return this.parent === undefined
  }

  private get isSelfPending() {
    return (
      (this.state[0] === 'entering' || this.state[0] === 'leaving') && this.state[1] === 'pending'
    )
  }

  private get isSelfFinished() {
    return (
      (this.state[0] === 'entering' || this.state[0] === 'leaving') && this.state[1] === 'finished'
    )
  }

  private get allDescendantsArePending(): boolean {
    for (const child of this.children as Set<TransitionMachineImpl>) {
      if (!(child.isSelfPending && child.allDescendantsArePending)) {
        return false
      }
    }

    return true
  }

  private get allDescendantsAreFinished(): boolean {
    for (const child of this.children as Set<TransitionMachineImpl>) {
      if (!(child.isSelfFinished && child.allDescendantsAreFinished)) {
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

    return containerMatches && selfMatches
  }

  private moveTo(descriptor: Partial<TransitionStateDescriptor>) {
    const before: TransitionState = [...this.state]
    const after: TransitionState = Object.freeze([
      descriptor.container ?? before[0],
      descriptor.self ?? before[1],
    ] as const)

    const isSame = before[0] === after[0] && before[1] === after[1]

    if (isSame) {
      return
    }

    this.state = after

    this.onStateChange(before, after)
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
