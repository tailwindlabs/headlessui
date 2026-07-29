import { createContext, useContext } from 'react'
import { useMachine } from '../../hooks/use-machine'
import { PopoverMachine } from './popover-machine'

export const PopoverContext = createContext<PopoverMachine | null>(null)
export function usePopoverMachineContext(component: string) {
  let context = useContext(PopoverContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Popover /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverMachineContext)
    throw err
  }
  return context
}

export function usePopoverMachine({
  id,
  __demoMode = false,
}: {
  id: string
  __demoMode?: boolean
}) {
  return useMachine(() => PopoverMachine.new({ id, __demoMode }))
}
