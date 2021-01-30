import { useCallback } from 'react'

export function useSyncRefs<TType>(
  ...refs: (React.MutableRefObject<TType> | ((instance: TType) => void) | null)[]
) {
  return useCallback(
    (value: TType) => {
      refs.forEach(ref => {
        if (ref === null) return
        if (typeof ref === 'function') return ref(value)
        ref.current = value
      })
    },
    [refs]
  )
}
