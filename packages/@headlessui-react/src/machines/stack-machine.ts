import { Machine } from '../machine'
import { DefaultMap } from '../utils/default-map'
import { match } from '../utils/match'

type Scope = string | null
type Id = string

interface State {
  stack: Id[]
}

export enum ActionTypes {
  Push,
  Pop,
}

export type Actions = { type: ActionTypes.Push; id: Id } | { type: ActionTypes.Pop; id: Id }

let reducers: {
  [P in ActionTypes]: (state: State, action: Extract<Actions, { type: P }>) => State
} = {
  [ActionTypes.Push](state, action) {
    let id = action.id
    let stack = state.stack
    let idx = state.stack.indexOf(id)

    // Already in the stack, move it to the top
    if (idx !== -1) {
      let copy = state.stack.slice()
      copy.splice(idx, 1)
      copy.push(id)

      stack = copy
      return { ...state, stack }
    }

    // Not in the stack, add it to the top
    return { ...state, stack: [...state.stack, id] }
  },
  [ActionTypes.Pop](state, action) {
    let id = action.id
    let idx = state.stack.indexOf(id)
    if (idx === -1) return state // Not in the stack

    let copy = state.stack.slice()
    copy.splice(idx, 1)

    return { ...state, stack: copy }
  },
}

class StackMachine extends Machine<State, Actions> {
  static new() {
    return new StackMachine({ stack: [] })
  }

  reduce(state: Readonly<State>, action: Actions): State {
    return match(action.type, reducers, state, action)
  }

  actions = {
    push: (id: Id) => this.send({ type: ActionTypes.Push, id }),
    pop: (id: Id) => this.send({ type: ActionTypes.Pop, id }),
  }

  selectors = {
    isTop: (state: State, id: Id) => state.stack[state.stack.length - 1] === id,
    inStack: (state: State, id: Id) => state.stack.includes(id),
  }
}

export const stackMachines = new DefaultMap<Scope, StackMachine>(() => StackMachine.new())
