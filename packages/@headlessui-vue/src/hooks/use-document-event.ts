import { watchEffect, type Ref } from 'vue'
import { env } from '../utils/env'

export function useDocumentEvent<TType extends keyof DocumentEventMap>(
  enabled: Ref<boolean>,
  type: TType,
  listener: (this: Document, ev: DocumentEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  if (env.isServer) return

  watchEffect((onInvalidate) => {
    if (!enabled.value) return

    document.addEventListener(type, listener, options)
    onInvalidate(() => document.removeEventListener(type, listener, options))
  })
}
