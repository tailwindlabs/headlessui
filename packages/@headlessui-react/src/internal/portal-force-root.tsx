import React, { createContext, useContext, type ReactNode } from 'react'

let ForcePortalRootContext = createContext(false)

export function usePortalRoot() {
  return useContext(ForcePortalRootContext)
}

interface ForcePortalRootProps {
  force: boolean
  children: ReactNode
}

export function ForcePortalRoot(props: ForcePortalRootProps) {
  return (
    <ForcePortalRootContext.Provider value={props.force}>
      {props.children}
    </ForcePortalRootContext.Provider>
  )
}
