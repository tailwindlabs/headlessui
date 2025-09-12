import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useEvent } from './use-event'

export function useControllable<T>(
  controlledValue: T | undefined,
  onChange?: (value: T) => void,
  defaultValue?: T
) {
  let [internalValue, setInternalValue] = useState(defaultValue)

  let isControlled = controlledValue !== undefined
  let wasControlled = useRef(isControlled)
  let didWarnOnUncontrolledToControlled = useRef(false)
  let didWarnOnControlledToUncontrolled = useRef(false)

  if (isControlled && !wasControlled.current && !didWarnOnUncontrolledToControlled.current) {
    didWarnOnUncontrolledToControlled.current = true
    wasControlled.current = isControlled
    console.error(
      'A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen.'
    )
  } else if (!isControlled && wasControlled.current && !didWarnOnControlledToUncontrolled.current) {
    didWarnOnControlledToUncontrolled.current = true
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
        // Ensure internal state is up to date with the value, before calling
        // onChange. This allows you to submit forms as part of the `onChange`
        // and gives enough time to update the form field value(s).
        flushSync(() => setInternalValue(value))

        return onChange?.(value)
      }
    }),
  ] as const
}
