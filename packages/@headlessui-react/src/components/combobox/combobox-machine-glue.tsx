import { createContext, useContext, useMemo } from 'react'
import { useOnUnmount } from '../../hooks/use-on-unmount'
import { ComboboxMachine } from './combobox-machine'

export const ComboboxContext = createContext<ComboboxMachine<unknown> | null>(null)
export function useComboboxMachineContext<T>(component: string) {
  let context = useContext(ComboboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxMachine)
    throw err
  }
  return context as ComboboxMachine<T>
}

export function useComboboxMachine({
  id,
  virtual = null,
  __demoMode = false,
}: Parameters<typeof ComboboxMachine.new>[0]) {
  let machine = useMemo(() => ComboboxMachine.new({ id, virtual, __demoMode }), [])
  useOnUnmount(() => machine.dispose())
  return machine
}
