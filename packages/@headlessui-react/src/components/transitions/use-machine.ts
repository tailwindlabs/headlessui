import { useRef } from 'react'
import { Machine } from './machine'

// https://github.com/statelyai/xstate/blob/02f9beffcccccd470ec924368907094ef7bb432f/packages/xstate-react/src/useConstant.ts
type ResultBox<T> = { v: T }

export function useConstant<T>(initialValue: () => T): T {
  const ref = useRef<ResultBox<T>>()

  if (!ref.current) {
    ref.current = { v: initialValue() }
  }

  return ref.current.v
}

export function useMachine<M extends Machine>(factory: () => M): M {
  const machine = useConstant<M>(factory)

  return machine
}
