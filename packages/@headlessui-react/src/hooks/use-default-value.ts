import { useState } from 'react'

/**
 * Returns a stable value that never changes unless the component is re-mounted.
 *
 * This ensures that we can use this value in a dependency array without causing
 * unnecessary re-renders (because while the incoming `value` can change, the
 * returned `defaultValue` won't change).
 */
export function useDefaultValue<T>(value: T) {
  let [defaultValue] = useState(value)
  return defaultValue
}
