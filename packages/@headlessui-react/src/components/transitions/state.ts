import { match } from '../../utils/match'
import { Machine } from './machine'

type ContainerState = 'idle' | 'entering' | 'leaving' | 'cancelled' | 'done'
type SelfState = 'idle' | 'running' | 'waiting_for_children'
type ChildrenState = 'idle' | 'running' | 'waiting_for_self'

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
  | { type: '#debug'; payload: undefined }

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

  // TODO: Can we get rid of this?
  onChildStop?: () => void
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

let machines: TransitionMachine[] = []

export function createTransitionMachine(
  id: string,
  actions?: TransitionActions
): TransitionMachine {
  let machine = new TransitionMachineImpl(id, actions)
  machines.push(machine)
  return machine
}

if (typeof window !== 'undefined') {
  window.debugMachines = () => {
    machines.forEach((m) => m.send('#debug'))
  }
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

  // Machine interaction
  public add(child: TransitionMachine) {
    this.send('#child.add', child)
  }

  public remove(child: TransitionMachine) {
    this.send('#child.remove', child)
  }

  public send(event: TransitionEvents['type'], payload?: any) {
    this.actions.onEvent?.(event, payload)

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
      '#debug': () => this.#debug(),
    })
  }

  // User events - Overall
  public reset() {
    this.children.forEach((child) => child.send('reset'))
    this.moveTo({ container: 'idle', self: 'idle', children: 'idle' })
  }

  public enter() {
    this.moveTo({ container: 'entering', self: 'idle' })
  }

  public leave() {
    this.moveTo({ container: 'leaving', self: 'idle' })
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
        this.moveTo({ container: 'done' })
      }
    })

    this.when({ children: ['waiting_for_self'] }, () => this.moveTo({ container: 'done' }))
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
    this.when({ children: ['idle'] }, () => this.moveTo({ children: 'running' }))
  }

  #childStop() {
    this.when({ self: ['idle', 'running'], children: ['running'] }, () => {
      if (!this.hasRunningChildren()) {
        this.moveTo({ children: 'waiting_for_self' })
      }
    })

    this.when({ self: ['waiting_for_children'], children: ['running'] }, () => {
      if (!this.hasRunningChildren()) {
        this.moveTo({ container: 'done' })
      }
    })

    this.when({ self: ['waiting_for_children'], children: ['waiting_for_self'] }, () => {
      if (!this.hasRunningChildren()) {
        this.moveTo({ container: 'done', self: 'idle' })
      }
    })

    this.actions.onChildStop?.()
  }

  #debug() {
    console.log(this.debugDescription())
  }

  // Internal Methods
  private onStateChange(before: TransitionState, after: TransitionState) {
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
      this.matches(before, { container: ['idle'] }) &&
      this.matches(after, { container: ['entering', 'leaving'] })
    ) {
      this.parent?.send('#child.start')
    }

    if (
      !this.matches(before, { container: ['done'] }) &&
      this.matches(after, { container: ['done'] })
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
    const before: TransitionState = this.state
    const after: TransitionState = [
      descriptor.container ?? before[0],
      descriptor.self ?? before[1],
      descriptor.children ?? before[2],
    ]

    const isSame = before[0] === after[0] && before[1] === after[1] && before[2] === after[2]

    if (isSame) {
      return
    }

    this.state = after

    this.onStateChange(before, after)
    this.actions.onChange?.(before, after)
  }

  private debugDescription(indent: string = '\t') {
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
