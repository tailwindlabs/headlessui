import { useState } from 'react'
import { useEvent } from './use-event'

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T,
  isControlled?: boolean
) {
  let [internalValue, setInternalValue] = useState(defaultValue)
  isControlled = isControlled ?? controlledValue !== undefined

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
