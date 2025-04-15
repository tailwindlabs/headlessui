import { createContext, useContext, useMemo } from 'react'
import { ComboboxMachine } from './combobox-machine'

export const ComboboxContext = createContext<ComboboxMachine | null>(null)
export function useComboboxMachineContext(component: string) {
  let context = useContext(ComboboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxMachine)
    throw err
  }
  return context
}

export function useComboboxMachine({ __demoMode = false } = {}) {
  return useMemo(() => ComboboxMachine.new({ __demoMode }), [])
}
