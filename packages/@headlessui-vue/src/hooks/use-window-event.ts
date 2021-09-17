import { watchEffect } from 'vue'

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  listener: (this: Window, ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  watchEffect(onInvalidate => {
    window.addEventListener(type, listener, options)

    onInvalidate(() => {
      window.removeEventListener(type, listener, options)
    })
  })
}
