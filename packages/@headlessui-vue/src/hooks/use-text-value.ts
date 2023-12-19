import { ref, type Ref } from 'vue'
import { dom } from '../utils/dom'
import { getTextValue } from '../utils/get-text-value'

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
