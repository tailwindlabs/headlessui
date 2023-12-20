import { useCallback } from 'react'

export type ByComparator<T> =
  | (T extends null ? string : keyof T & string)
  | ((a: T, z: T) => boolean)

function defaultBy<T>(a: T, z: T) {
  if (
    a !== null &&
    z !== null &&
    typeof a === 'object' &&
    typeof z === 'object' &&
    'id' in a &&
    'id' in z
  ) {
    return a.id === z.id
  }

  return a === z
}

export function useByComparator<T>(by: ByComparator<T> = defaultBy) {
  return useCallback(
    (a: T, z: T) => {
      if (typeof by === 'string') {
        let property = by as unknown as keyof T
        return a?.[property] === z?.[property]
      }

      return by(a, z)
    },
    [by]
  )
}
