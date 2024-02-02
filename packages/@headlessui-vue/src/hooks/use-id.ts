import { inject, InjectionKey, provide } from 'vue'

let GENERATE_ID: InjectionKey<() => string> = Symbol('headlessui.useid')

let globalId = 0

export function useId() {
  let generateId = inject(GENERATE_ID, () => {
    return `${++globalId}`
  })

  return generateId()
}

/**
 * This function allows users to provide a custom ID generator
 * as a workaround for the lack of stable SSR IDs in Vue 3.x.
 *
 * This Nuxt users use the Nuxt provided `useId` function
 * which is stable across SSR and client.
 */
export function provideUseId(fn: () => string) {
  provide(GENERATE_ID, fn)
}
