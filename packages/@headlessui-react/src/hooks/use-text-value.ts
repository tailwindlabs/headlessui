import { useRef, type MutableRefObject } from 'react'
import { getTextValue } from '../utils/get-text-value'
import { useEvent } from './use-event'

export function useTextValue(element: MutableRefObject<HTMLElement | null>) {
  let cacheKey = useRef<string>('')
  let cacheValue = useRef<string>('')

  return useEvent(() => {
    let el = element.current
    if (!el) return ''

    // Check for a cached version
    let currentKey = el.innerText
    if (cacheKey.current === currentKey) {
      return cacheValue.current
    }

    // Calculate the value
    let value = getTextValue(el).trim().toLowerCase()
    cacheKey.current = currentKey
    cacheValue.current = value
    return value
  })
}
