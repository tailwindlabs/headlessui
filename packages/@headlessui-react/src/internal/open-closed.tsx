import React, {
  createContext,
  useContext,

  // Types
  ReactNode,
  ReactElement,
} from 'react'

let Context = createContext<State | null>(null)
Context.displayName = 'OpenClosedContext'

export enum State {
  Open,
  Closed,
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
