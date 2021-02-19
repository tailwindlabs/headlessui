import { Ref } from 'vue'

export function dom<T extends HTMLElement>(ref?: Ref<T | null>): T | null {
  if (ref == null) return null
  if (ref.value == null) return null
  return ((ref as Ref<T & { $el: unknown }>).value.$el ?? ref.value) as T | null
}
