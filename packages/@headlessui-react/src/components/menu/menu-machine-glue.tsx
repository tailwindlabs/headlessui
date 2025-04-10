import { createContext, useContext, useMemo } from 'react'
import { MenuMachine } from './menu-machine'

export const MenuContext = createContext<MenuMachine | null>(null)
export function useMenuMachineContext(component: string) {
  let context = useContext(MenuContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Menu /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuMachine)
    throw err
  }
  return context
}

export function useMenuMachine({ __demoMode = false } = {}) {
  return useMemo(() => MenuMachine.new({ __demoMode }), [])
}
