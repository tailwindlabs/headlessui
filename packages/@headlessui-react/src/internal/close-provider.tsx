'use client'

import React, { createContext, useContext } from 'react'

let CloseContext = createContext(() => {})

export function useClose() {
  return useContext(CloseContext)
}

export function CloseProvider({ value, children }: React.PropsWithChildren<{ value: () => void }>) {
  return <CloseContext.Provider value={value}>{children}</CloseContext.Provider>
}
