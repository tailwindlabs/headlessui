import { createContext, useContext } from 'react'
import { useMachine } from '../../hooks/use-machine'
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

export function useMenuMachine({ id, __demoMode = false }: { id: string; __demoMode?: boolean }) {
  return useMachine(() => MenuMachine.new({ id, __demoMode }))
}
