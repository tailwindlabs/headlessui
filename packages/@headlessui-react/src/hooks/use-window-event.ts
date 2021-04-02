import { useEffect } from 'react'

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  listener: (this: Window, ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    window.addEventListener(type, listener, options)
    return () => window.removeEventListener(type, listener, options)
  }, [type, listener, options])
}
