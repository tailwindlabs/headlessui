import React, {
  createContext,
  useContext,

  // Types
  MutableRefObject,
  ReactNode,
} from 'react'
import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect'
import { useEvent } from '../hooks/use-event'

type OnUpdate = (
  message: StackMessage,
  type: string,
  element: MutableRefObject<HTMLElement | null>
) => void

let StackContext = createContext<OnUpdate>(() => {})
StackContext.displayName = 'StackContext'

export enum StackMessage {
  Add,
  Remove,
}

export function useStackContext() {
  return useContext(StackContext)
}

export function StackProvider({
  children,
  onUpdate,
  type,
  element,
}: {
  children: ReactNode
  onUpdate?: OnUpdate
  type: string
  element: MutableRefObject<HTMLElement | null>
}) {
  let parentUpdate = useStackContext()

  let notify = useEvent((...args: Parameters<OnUpdate>) => {
    // Notify our layer
    onUpdate?.(...args)

    // Notify the parent
    parentUpdate(...args)
  })

  useIsoMorphicEffect(() => {
    notify(StackMessage.Add, type, element)
    return () => notify(StackMessage.Remove, type, element)
  }, [notify, type, element])

  return <StackContext.Provider value={notify}>{children}</StackContext.Provider>
}
