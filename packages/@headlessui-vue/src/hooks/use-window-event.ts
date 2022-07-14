import { watchEffect } from 'vue'
import { isServer } from '../utils/ssr'

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  listener: (this: Window, ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  if (isServer) return

  watchEffect((onInvalidate) => {
    window.addEventListener(type, listener, options)
    onInvalidate(() => window.removeEventListener(type, listener, options))
  })
}
