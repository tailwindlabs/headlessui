import { ref, Ref } from 'vue'
import { getTextValue } from '../utils/get-text-value'
import { dom } from '../utils/dom'

export function useTextValue(element: Ref<HTMLElement | null>) {
  let cacheKey = ref<string>('')
  let cacheValue = ref<string>('')

  return () => {
    let el = dom(element)
    if (!el) return ''

    // Check for a cached version
    let currentKey = el.innerText
    if (cacheKey.value === currentKey) {
      return cacheValue.value
    }

    // Calculate the value
    let value = getTextValue(el).trim().toLowerCase()
    cacheKey.value = currentKey
    cacheValue.value = value
    return value
  }
}
