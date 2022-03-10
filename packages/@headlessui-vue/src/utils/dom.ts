import { Ref, ComponentPublicInstance } from 'vue'

export function dom<T extends Element | ComponentPublicInstance>(ref?: Ref<T | null>): T | null {
  if (ref == null) return null
  if (ref.value == null) return null

  return '$el' in ref.value ? (ref.value.$el as T | null) : ref.value
}
