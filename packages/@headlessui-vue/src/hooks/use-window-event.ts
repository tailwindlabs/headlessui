import { watchEffect } from 'vue'

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  listener: (this: Window, ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  if (typeof window === 'undefined') return

  watchEffect((onInvalidate) => {
    window.addEventListener(type, listener, options)
    onInvalidate(() => window.removeEventListener(type, listener, options))
  })
}
