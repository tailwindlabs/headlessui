import { useRef, useState } from 'react'
import { useEvent } from './use-event'

let didWarnOnUncontrolledToControlled = false
let didWarnOnControlledToUncontrolled = false

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T
) {
  let [internalValue, setInternalValue] = useState(defaultValue)
  let isControlled = controlledValue !== undefined
  let wasControlled = useRef(isControlled)

  if (isControlled && !wasControlled.current && !didWarnOnUncontrolledToControlled) {
    didWarnOnUncontrolledToControlled = true
    wasControlled.current = isControlled
    console.error(
      'A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen.'
    )
  } else if (!isControlled && wasControlled.current && !didWarnOnControlledToUncontrolled) {
    didWarnOnControlledToUncontrolled = true
    wasControlled.current = isControlled
    console.error(
      'A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen.'
    )
  }

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
