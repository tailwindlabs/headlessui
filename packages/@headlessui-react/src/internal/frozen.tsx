import React, { useState } from 'react'

export function Frozen({ children, freeze }: { children: React.ReactNode; freeze: boolean }) {
  let contents = useFrozenData(freeze, children)
  return <>{contents}</>
}

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
