import { watchEffect } from 'vue'

export function useEventListener<TType extends keyof WindowEventMap>(
  element: HTMLElement | Document | Window | EventTarget | null | undefined,
  type: TType,
  listener: (event: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  if (typeof window === 'undefined') return

  watchEffect((onInvalidate) => {
    element = element ?? window

    element.addEventListener(type, listener as any, options)
    onInvalidate(() => element!.removeEventListener(type, listener as any, options))
  })
}
