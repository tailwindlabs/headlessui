import { useEffect } from 'react'
import { createTransitionMachine, TransitionActions, TransitionMachine } from '@headlessui/core'
import { useMachine } from '../../../utils/use-machine'

export function useTransitionMachine(
  id: string,
  actions?: () => TransitionActions
): TransitionMachine {
  const machine = useMachine(() => createTransitionMachine(id, actions?.()))

  useEffect(() => {
    return () => machine.send('cancel')
  }, [])

  return machine
}

export type { TransitionMachine }
