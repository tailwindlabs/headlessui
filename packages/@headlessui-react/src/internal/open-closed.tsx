import React, { createContext, useContext, type ReactElement, type ReactNode } from 'react'

let Context = createContext<State | null>(null)
Context.displayName = 'OpenClosedContext'

export enum State {
  Open = 1 << 0,
  Closed = 1 << 1,
  Closing = 1 << 2,
  Opening = 1 << 3,
}

export function useOpenClosed() {
  return useContext(Context)
}

interface Props {
  value: State
  children: ReactNode
}

export function OpenClosedProvider({ value, children }: Props): ReactElement {
  return <Context.Provider value={value}>{children}</Context.Provider>
}
