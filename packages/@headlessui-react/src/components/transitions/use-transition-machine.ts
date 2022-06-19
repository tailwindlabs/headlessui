import { useEffect } from 'react'
import { createTransitionMachine, TransitionActions, TransitionMachine } from './state'
import { useMachine } from './use-machine'

export function useTransitionMachine(
  actions?: () => TransitionActions,
  id?: string
): TransitionMachine {
  const machine = useMachine(() => createTransitionMachine(actions?.(), id))

  useEffect(() => {
    return () => machine.send('cancel')
  }, [])

  return machine
}
