import { useState } from 'react'
import { useEvent } from './use-event'

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T
) {
  let [internalValue, setInternalValue] = useState(defaultValue)
  let isControlled = controlledValue !== undefined

  return [
    (isControlled ? controlledValue : internalValue)!,
    useEvent((value) => {
      if (isControlled) {
        return onChange?.(value)
      } else {
        setInternalValue(value)
        return onChange?.(value)
      }
    }),
  ] as const
}
