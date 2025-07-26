import * as Vue from 'vue'

let GENERATE_ID: Vue.InjectionKey<() => string> = Symbol('headlessui.useid')
let globalId = 0

export const useId =
  // Prefer Vue's `useId` if it's available.
  // @ts-expect-error - `useId` doesn't exist in Vue < 3.5.
  Vue.useId ??
  function useId() {
    let generateId = Vue.inject(GENERATE_ID, () => {
      return `${++globalId}`
    })

    return generateId()
  }
/**
 * This function allows users to provide a custom ID generator.
 */
export function provideUseId(fn: () => string) {
  Vue.provide(GENERATE_ID, fn)
}
