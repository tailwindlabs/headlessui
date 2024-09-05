import { inject, InjectionKey, provide, useId as vueUseId } from 'vue'

const GENERATE_ID: InjectionKey<() => string> = Symbol('headlessui.useid')

export function useId() {
  const generateId = inject(GENERATE_ID, vueUseId)
  return generateId()
}

/**
 * This function allows users to provide a custom ID generator.
 */
export function provideUseId(fn: () => string) {
  provide(GENERATE_ID, fn)
}
