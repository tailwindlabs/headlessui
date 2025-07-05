import React, { cloneElement, isValidElement, useState } from 'react'

function FrozenFn(
  { children, freeze }: { children: React.ReactNode; freeze: boolean },
  ref: React.ForwardedRef<HTMLElement>
) {
  let contents = useFrozenData(freeze, children)

  if (isValidElement(contents)) {
    return cloneElement(contents as React.ReactElement, { ref })
  }

  return <>{contents}</>
}

export const Frozen = React.forwardRef(FrozenFn)

export function useFrozenData<T>(freeze: boolean, data: T) {
  let [frozenValue, setFrozenValue] = useState(data)

  // We should keep updating the frozen value, as long as we shouldn't freeze
  // the value yet. The moment we should freeze the value we stop updating it
  // which allows us to reference the "previous" (thus frozen) value.
  if (!freeze && frozenValue !== data) {
    setFrozenValue(data)
  }

  return freeze ? frozenValue : data
}
