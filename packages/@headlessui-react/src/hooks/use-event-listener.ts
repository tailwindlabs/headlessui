import { useEffect } from 'react'
import { useLatestValue } from './use-latest-value'

export function useEventListener<TType extends keyof WindowEventMap>(
  element: HTMLElement | Document | Window | EventTarget | null | undefined,
  type: TType,
  listener: (event: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  let listenerRef = useLatestValue(listener)

  useEffect(() => {
    element = element ?? window

    function handler(event: WindowEventMap[TType]) {
      listenerRef.current(event)
    }

    element.addEventListener(type, handler as any, options)
    return () => element!.removeEventListener(type, handler as any, options)
  }, [element, type, options])
}
