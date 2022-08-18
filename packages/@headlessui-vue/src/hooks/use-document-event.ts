import { watchEffect } from 'vue'
import { isServer } from '../utils/ssr'

export function useDocumentEvent<TType extends keyof DocumentEventMap>(
  type: TType,
  listener: (this: Document, ev: DocumentEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  if (isServer) return

  watchEffect((onInvalidate) => {
    document.addEventListener(type, listener, options)
    onInvalidate(() => document.removeEventListener(type, listener, options))
  })
}
