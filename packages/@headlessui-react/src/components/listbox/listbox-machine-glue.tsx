import { createContext, useContext, useMemo } from 'react'
import { ListboxMachine } from './listbox-machine'

export const ListboxContext = createContext<ListboxMachine<unknown> | null>(null)
export function useListboxMachineContext<T>(component: string) {
  let context = useContext(ListboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxMachine)
    throw err
  }
  return context as ListboxMachine<T>
}

export function useListboxMachine({ __demoMode = false } = {}) {
  return useMemo(() => ListboxMachine.new({ __demoMode }), [])
}
