import { useEffect, useRef } from 'react'
import { useEvent } from './use-event'

let Optional = Symbol()

export function optionalRef<T>(cb: (ref: T) => void, isOptional = true) {
  return Object.assign(cb, { [Optional]: isOptional })
}

export function useSyncRefs<TType>(
  ...refs: (React.MutableRefObject<TType | null> | ((instance: TType) => void) | null)[]
) {
  let cache = useRef(refs)

  useEffect(() => {
    cache.current = refs
  }, [refs])

  let syncRefs = useEvent((value: TType) => {
    for (let ref of cache.current) {
      if (ref == null) continue
      if (typeof ref === 'function') ref(value)
      else ref.current = value
    }
  })

  return refs.every(
    (ref) =>
      ref == null ||
      // @ts-expect-error
      ref?.[Optional]
  )
    ? undefined
    : syncRefs
}
