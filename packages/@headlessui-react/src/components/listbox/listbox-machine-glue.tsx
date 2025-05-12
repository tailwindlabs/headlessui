import { createContext, useContext, useMemo } from 'react'
import { useOnUnmount } from '../../hooks/use-on-unmount'
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

export function useListboxMachine({
  __demoMode = false,
  id = globalThis.crypto.randomUUID() as string,
} = {}) {
  let machine = useMemo(() => ListboxMachine.new({ __demoMode, id }), [])
  useOnUnmount(() => machine.dispose())
  return machine
}
