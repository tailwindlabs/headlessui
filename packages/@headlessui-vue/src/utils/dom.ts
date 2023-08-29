import { Ref, ComponentPublicInstance } from 'vue'

type AsElement<T extends Element | ComponentPublicInstance> =
  | (T extends Element ? T : Element)
  | null

export function dom<T extends Element | ComponentPublicInstance>(
  ref?: Ref<T | null>
): AsElement<T> | null {
  if (ref == null) return null
  if (ref.value == null) return null

  let el = (ref.value as { $el?: T }).$el ?? ref.value

  if (el instanceof Element) {
    return el as AsElement<T>
  }

  return null
}
