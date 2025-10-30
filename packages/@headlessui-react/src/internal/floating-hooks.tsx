import * as React from 'react'

type AnyFunction = (...args: any[]) => any

let useInsertionEffect =
  'useInsertionEffect' in React
    ? (React.useInsertionEffect as AnyFunction)
    : (fn: AnyFunction) => fn()

export function useEffectEvent<T extends AnyFunction>(callback?: T) {
  let ref = React.useRef<AnyFunction | undefined>(() => {
    // if (__DEV__) {
    //   throw new Error('Cannot call an event handler while rendering.')
    // }
  })

  useInsertionEffect(() => {
    ref.current = callback
  })

  return React.useCallback<AnyFunction>((...args) => ref.current?.(...args), []) as T
}
