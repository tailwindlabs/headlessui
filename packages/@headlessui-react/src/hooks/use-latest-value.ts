import { useRef, useEffect } from 'react'

export function useLatestValue<T>(value: T) {
  let cache = useRef(value)

  useEffect(() => {
    cache.current = value
  }, [value])

  return cache
}
