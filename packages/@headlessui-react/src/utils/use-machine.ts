import { useRef, RefObject } from 'react'
import { Machine } from '@headlessui/core'

// https://github.com/statelyai/xstate/blob/02f9beffcccccd470ec924368907094ef7bb432f/packages/xstate-react/src/useConstant.ts
type ResultBox<T> = { v: T }

export function useConstant<T>(initialValue: () => T): T {
  const ref = useRef<ResultBox<T>>()

  if (!ref.current) {
    ref.current = { v: initialValue() }
  }

  return ref.current.v
}

let machines: Set<Machine> = new Set()

export function useMachine<M extends Machine>(factory: () => M): M {
  const machine = useConstant<M>(() => {
    let machine = factory()
    machines.add(machine)
    return machine
  })

  return machine
}

export function useActiveMachines(): RefObject<Machine[]> {
  return {
    get current() {
      return Array.from(machines).filter((m) => {
        if ('parent' in m) {
          // @ts-ignore
          return m.parent === undefined
        }

        return true
      })
    }
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'useActiveMachines', { value: useActiveMachines })
}
