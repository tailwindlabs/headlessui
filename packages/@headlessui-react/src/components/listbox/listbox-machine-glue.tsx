import { createContext, useContext, useMemo } from 'react'
import { ListboxMachine } from './listbox-machine'

export const ListboxContext = createContext<ListboxMachine | null>(null)
export function useListboxMachineContext(component: string) {
  let context = useContext(ListboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxMachine)
    throw err
  }
  return context
}

export function useListboxMachine({ __demoMode = false } = {}) {
  return useMemo(() => ListboxMachine.new({ __demoMode }), [])
}
