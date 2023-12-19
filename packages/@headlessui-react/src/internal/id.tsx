import React, { createContext, useContext } from 'react'

let IdContext = createContext<string | undefined>(undefined)

export function useProvidedId() {
  return useContext(IdContext)
}

export function IdProvider({ id, children }: React.PropsWithChildren<{ id: string | undefined }>) {
  return <IdContext.Provider value={id}>{children}</IdContext.Provider>
}
