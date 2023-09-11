import { onMounted, ref, watchEffect, type ComponentPublicInstance, type Ref } from 'vue'
import { dom } from '../utils/dom'

function resolveType(type: unknown, as: string | object) {
  if (type) return type

  let tag = as ?? 'button'
  if (typeof tag === 'string' && tag.toLowerCase() === 'button') return 'button'

  return undefined
}

export function useResolveButtonType(
  data: Ref<{ as: string | object; type?: unknown }>,
  refElement: Ref<HTMLElement | ComponentPublicInstance | null>
) {
  let type = ref(resolveType(data.value.type, data.value.as))

  onMounted(() => {
    type.value = resolveType(data.value.type, data.value.as)
  })

  watchEffect(() => {
    if (type.value) return
    if (!dom(refElement)) return

    if (dom(refElement) instanceof HTMLButtonElement && !dom(refElement)?.hasAttribute('type')) {
      type.value = 'button'
    }
  })

  return type
}
