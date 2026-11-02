import { useEffect, useMemo, useRef } from 'react'
import { createRefMerger, type MaybeRef } from '../utils/merge-refs'

let Optional = Symbol()

export function optionalRef<T>(cb: (ref: T) => void, isOptional = true) {
  return Object.assign(cb, { [Optional]: isOptional })
}

export function useSyncRefs<TType>(...refs: MaybeRef<TType>[]) {
  let cache = useRef(refs)

  useEffect(() => {
    cache.current = refs
  }, [refs])

  let syncRefs = useMemo(() => createRefMerger(() => cache.current), [cache])

  return refs.every(
    (ref) =>
      ref == null ||
      // @ts-expect-error
      ref?.[Optional]
  )
    ? undefined
    : syncRefs
}
