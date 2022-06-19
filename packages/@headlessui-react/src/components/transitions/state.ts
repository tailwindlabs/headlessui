type TransitionEvents =
  | { type: 'enter'; payload: undefined }
  | { type: 'leave'; payload: undefined }
  | { type: 'start'; payload: undefined }
  | { type: 'stop'; payload: undefined }
  | { type: 'cancel'; payload: undefined }
  | { type: 'reset'; payload: undefined }

type InternalEvents =
  | { type: '#child.add'; payload: TransitionMachine }
  | { type: '#child.remove'; payload: TransitionMachine }
  | { type: '#child.become'; payload: TransitionMachine }
  | { type: '#child.resign'; payload: TransitionMachine }
  | { type: '#child.start'; payload: undefined }
  | { type: '#child.stop'; payload: undefined }

type ChildrenState = 'none' | 'some_active' | 'all_idle'

type MachineEvent = TransitionEvents['type'] | InternalEvents['type']
type MachineEventPayload<Event extends MachineEvent> = Extract<
  TransitionEvents | InternalEvents,
  { type: Event }
>['payload']

export type TransitionDirection = 'idle' | 'entering' | 'leaving'
export type TransitionState =
  | 'idle'
  | 'pending'
  | 'running'
  | 'waiting_for_children'
  | 'done'
  | 'cancelled'

export type TransitionActions = {
  onStart?: (direction: TransitionDirection) => void
  onStop?: (direction: TransitionDirection) => void
  onCancel?: (direction: TransitionDirection) => void
  onEvent?: (event: MachineEvent, payload?: any) => void
  onChange?: (
    prev: readonly [TransitionDirection, TransitionState],
    current: readonly [TransitionDirection, TransitionState]
  ) => void
}

export interface Machine<State = any> {
  readonly id: string
  readonly state: State

  add(child: Machine): void
  remove(child: Machine): void

  send<EventType extends MachineEvent>(
    event: EventType,
    payload?: MachineEventPayload<EventType>
  ): void
}

export interface TransitionMachine extends Machine<TransitionState> {
  readonly direction: TransitionDirection

  add(child: TransitionMachine): void
  remove(child: TransitionMachine): void
  send<EventType extends MachineEvent>(
    event: EventType,
    payload?: MachineEventPayload<EventType>
  ): void
}

export function createTransitionMachine(
  actions?: TransitionActions,
  id?: string
): TransitionMachine {
  return new TransitionMachineImpl(actions, id)
}

let uid = 1

class TransitionMachineImpl implements TransitionMachine {
  public readonly id: string

  public direction: TransitionDirection = 'idle'
  public state: TransitionState = 'idle'

  private parent: TransitionMachine | undefined
  private actions: TransitionActions
  private children = new Set<TransitionMachine>()

  constructor(actions: TransitionActions = {}, id?: string) {
    this.id = id ?? `${uid++}`
    this.actions = actions
  }

  // Machine interaction
  public add(child: TransitionMachine) {
    this.send('#child.add', child)
  }

  public remove(child: TransitionMachine) {
    this.send('#child.remove', child)
  }

  public send(event: MachineEvent, payload?: any) {
    this.actions.onEvent?.(event, payload)

    match(event, {
      // User initiated events
      enter: () => this.enter(),
      leave: () => this.leave(),
      start: () => this.start(),
      stop: () => this.stop(),
      cancel: () => this.cancel(),
      reset: () => this.reset(),

      // Internal Events
      '#child.add': () => this.#childAdd(payload),
      '#child.remove': () => this.#childRemove(payload),
      '#child.become': () => this.#childBecome(payload),
      '#child.resign': () => this.#childResign(payload),
      '#child.start': () => this.#childStart(),
      '#child.stop': () => this.#childStop(),
    })
  }

  // Events
  reset() {
    this.toIdle()
  }

  enter() {
    this.when('idle', 'idle', () => this.toEntering())
  }

  leave() {
    this.when('idle', 'idle', () => this.toLeaving())
  }

  start() {
    this.when('entering', 'pending', () => this.toRunning())
    this.when('leaving', 'pending', () =>
      match(this.childrenState, {
        all_idle: () => this.toWaitingForChildren(),
        none: () => this.toRunning(),

        // Should not happen…
        some_active: () => this.toWaitingForChildren(),
      })
    )
  }

  stop() {
    // When entering we run parent and child transitions concurrently
    // This means that either stop or child.done can transition to done

    this.when('entering', 'running', () =>
      match(this.childrenState, {
        all_idle: () => this.toWaitingForChildren(),
        none: () => this.toDone(),

        // Should not happen…
        some_active: () => this.toWaitingForChildren(),
      })
    )
    this.when('leaving', 'running', () => this.toDone())
  }

  cancel() {
    this.when('entering', 'pending', () => this.toCancelled())
    this.when('entering', 'running', () => this.toCancelled())
    this.when('entering', 'waiting_for_children', () => this.toCancelled())

    this.when('leaving', 'pending', () => this.toCancelled())
    this.when('leaving', 'running', () => this.toCancelled())
    this.when('leaving', 'waiting_for_children', () => this.toCancelled())

    this.parent?.send('#child.stop')
  }

  #childAdd(child: TransitionMachine) {
    this.children.add(child)
    child.send('#child.become', this)
  }

  #childRemove(child: TransitionMachine) {
    child.send('cancel')
    this.children.delete(child)
    child.send('#child.resign', this)
  }

  #childBecome(parent: TransitionMachine) {
    this.parent = parent

    if (parent.state === 'waiting_for_children') {
      this.send('#child.start')
    }
  }

  #childResign(_: TransitionMachine) {
    this.parent = undefined
  }

  #childStart() {
    if (this.parent?.state !== 'waiting_for_children') {
      return
    }

    match(this.parent!.direction, {
      entering: () => this.enter(),
      leaving: () => this.leave(),
      idle: () => {},
    })
  }

  #childStop() {
    if (this.childrenState === 'some_active') {
      return this.toWaitingForChildren()
    }

    match(this.direction, {
      entering: () => this.toDone(),
      leaving: () => this.toRunning(),
      idle: () => {},
    })
  }

  // Direction Transitions
  toIdle() {
    this.moveTo('idle', 'idle')
  }

  toEntering() {
    this.moveTo('pending', 'entering')
  }

  toLeaving() {
    this.moveTo('pending', 'leaving')
  }

  // State transitions — fires appropriate before/after events
  toRunning() {
    this.actions.onStart?.(this.direction)
    this.moveTo('running')

    // Entering transitions are run concurrently
    if (this.direction === 'entering') {
      this.children.forEach((child) => child.send('#child.start'))
    }
  }

  toWaitingForChildren() {
    if (this.state === 'waiting_for_children') {
      return
    }

    this.moveTo('waiting_for_children')
    this.children.forEach((child) => child.send('#child.start'))
  }

  toDone() {
    this.moveTo('done')
    this.actions.onStop?.(this.direction)
    this.parent?.send('#child.stop')
  }

  toCancelled() {
    this.moveTo('cancelled')
    this.actions.onCancel?.(this.direction)
    this.parent?.send('#child.stop')
  }

  // Helpers
  moveTo(state: TransitionState, direction?: TransitionDirection) {
    let previous = [this.direction, this.state] as const

    this.state = state
    this.direction = direction !== undefined ? direction : this.direction

    let current = [this.direction, this.state] as const

    this.actions.onChange?.(previous, current)
  }

  when(direction: TransitionDirection, state: TransitionState, callback: () => void) {
    if (this.direction === direction && this.state === state) {
      callback()
    }
  }

  protected get childrenState(): ChildrenState {
    if (this.children.size === 0) {
      return 'none'
    }

    for (const child of this.children) {
      if (child.direction !== 'idle' && child.state !== 'done') {
        return 'some_active'
      }
    }

    return 'all_idle'
  }
}

export function match<TValue extends string | number = string, TReturnValue = unknown>(
  value: TValue,
  lookup: Record<TValue, TReturnValue | ((...args: any[]) => TReturnValue)>,
  ...args: any[]
): TReturnValue {
  if (value in lookup) {
    let returnValue = lookup[value]
    return typeof returnValue === 'function' ? returnValue(...args) : returnValue
  }

  let error = new Error(
    `Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(
      lookup
    )
      .map((key) => `"${key}"`)
      .join(', ')}.`
  )
  // if (Error.captureStackTrace) Error.captureStackTrace(error, match)
  throw error
}
