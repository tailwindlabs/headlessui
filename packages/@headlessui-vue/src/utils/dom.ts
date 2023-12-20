import type { ComponentPublicInstance, Ref } from 'vue'

type AsElement<T extends HTMLElement | ComponentPublicInstance> =
  | (T extends HTMLElement ? T : HTMLElement)
  | null

export function dom<T extends HTMLElement | ComponentPublicInstance>(
  ref?: Ref<T | null>
): AsElement<T> | null {
  if (ref == null) return null
  if (ref.value == null) return null

  let el = (ref.value as { $el?: T }).$el ?? ref.value

  // In this case we check for `Node` because returning `null` from a
  // component renders a `Comment` which is a `Node` but not `Element`
  // The types don't encode this possibility but we handle it here at runtime
  if (el instanceof Node) {
    return el as AsElement<T>
  }

  return null
}
