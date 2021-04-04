import React, { ReactNode, createContext, useContext, useCallback } from 'react'
import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect'

type OnUpdate = (message: StackMessage, element: HTMLElement) => void

let StackContext = createContext<OnUpdate>(() => {})
StackContext.displayName = 'StackContext'

export enum StackMessage {
  AddElement,
  RemoveElement,
}

export function useStackContext() {
  return useContext(StackContext)
}

export function useElementStack(element: HTMLElement | null) {
  let notify = useStackContext()

  useIsoMorphicEffect(() => {
    if (!element) return

    notify(StackMessage.AddElement, element)
    return () => notify(StackMessage.RemoveElement, element)
  }, [element])
}

export function StackProvider({
  children,
  onUpdate,
}: {
  children: ReactNode
  onUpdate?: OnUpdate
}) {
  let parentUpdate = useStackContext()

  let notify = useCallback(
    (...args: Parameters<OnUpdate>) => {
      // Notify our layer
      onUpdate?.(...args)

      // Notify the parent
      parentUpdate(...args)
    },
    [parentUpdate, onUpdate]
  )

  return <StackContext.Provider value={notify}>{children}</StackContext.Provider>
}
