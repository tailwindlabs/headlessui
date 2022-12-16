import { watchEffect } from 'vue'
import { env } from '../utils/env'

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  listener: (this: Window, ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  if (env.isServer) return

  watchEffect((onInvalidate) => {
    window.addEventListener(type, listener, options)
    onInvalidate(() => window.removeEventListener(type, listener, options))
  })
}
