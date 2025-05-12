import { createContext, useContext, useMemo } from 'react'
import { useOnUnmount } from '../../hooks/use-on-unmount'
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
  let machine = useMemo(() => PopoverMachine.new({ id, __demoMode }), [])
  useOnUnmount(() => machine.dispose())
  return machine
}
