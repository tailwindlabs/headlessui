import React, { createContext, useContext } from 'react'

let DisabledContext = createContext<boolean | undefined>(undefined)

export function useDisabled() {
  return useContext(DisabledContext)
}

export function DisabledProvider({
  value,
  children,
}: React.PropsWithChildren<{ value?: boolean }>) {
  return <DisabledContext.Provider value={value}>{children}</DisabledContext.Provider>
}
