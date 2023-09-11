import React, { createContext, useContext, type MutableRefObject, type ReactNode } from 'react'
import { useEvent } from '../hooks/use-event'
import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect'

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
  enabled,
}: {
  children: ReactNode
  onUpdate?: OnUpdate
  type: string
  element: MutableRefObject<HTMLElement | null>
  enabled?: boolean
}) {
  let parentUpdate = useStackContext()

  let notify = useEvent((...args: Parameters<OnUpdate>) => {
    // Notify our layer
    onUpdate?.(...args)

    // Notify the parent
    parentUpdate(...args)
  })

  useIsoMorphicEffect(() => {
    let shouldNotify = enabled === undefined || enabled === true

    shouldNotify && notify(StackMessage.Add, type, element)

    return () => {
      shouldNotify && notify(StackMessage.Remove, type, element)
    }
  }, [notify, type, element, enabled])

  return <StackContext.Provider value={notify}>{children}</StackContext.Provider>
}
