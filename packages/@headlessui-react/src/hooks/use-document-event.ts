import { useEffect } from 'react'
import { useLatestValue } from './use-latest-value'

export function useDocumentEvent<TType extends keyof DocumentEventMap>(
  type: TType,
  listener: (ev: DocumentEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  let listenerRef = useLatestValue(listener)

  useEffect(() => {
    function handler(event: DocumentEventMap[TType]) {
      listenerRef.current(event)
    }

    document.addEventListener(type, handler, options)
    return () => document.removeEventListener(type, handler, options)
  }, [type, options])
}
