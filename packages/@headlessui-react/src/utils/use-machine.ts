import { RefObject, useState } from 'react'
import { Machine } from '@headlessui/core'

export function useConstant<T>(initialValue: () => T): T {
  const [value] = useState<T>(initialValue)

  return value
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
