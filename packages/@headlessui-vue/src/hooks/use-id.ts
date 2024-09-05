import { inject, InjectionKey, provide, useId as vueUseId } from 'vue'

const GENERATE_ID: InjectionKey<() => string> = Symbol('headlessui.useid')

export function useId() {
  return inject(GENERATE_ID, () => {
    return vueUseId()
  })
}

/**
 * This function allows users to provide a custom ID generator.
 */
export function provideUseId(fn: () => string) {
  provide(GENERATE_ID, fn)
}
