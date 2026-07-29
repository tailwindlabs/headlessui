import { useRef } from 'react'
import { useOnUnmount } from './use-on-unmount'

interface DisposableMachine {
  readonly disposed: boolean
  dispose(): void
}

export function useMachine<T extends DisposableMachine>(createMachine: () => T) {
  let machine = useRef<T | null>(null)

  // Activity preserves hook state while tearing down effects and their machine subscriptions.
  if (machine.current === null || machine.current.disposed) {
    machine.current = createMachine()
  }

  let current = machine.current
  useOnUnmount(() => current.dispose())
  return current
}
