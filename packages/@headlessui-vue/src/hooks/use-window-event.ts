import { onUnmounted } from 'vue'

export function useWindowEvent<TType extends keyof WindowEventMap>(
  type: TType,
  listener: (this: Window, ev: WindowEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) {
  try {
      window.addEventListener(type, listener, options)
  } catch(e) {}
  onUnmounted(() => window.removeEventListener(type, listener, options))
}
