import type { MutableRefObject } from 'react'

export type MaybeRef<T> =
  | MutableRefObject<T | null>
  | ((value: T) => void | (() => void))
  | null
  | undefined

export function createRefMerger<T>(getRefs: () => MaybeRef<T>[]) {
  let cleanups: ((value: T) => void)[] = []

  return (value: T) => {
    if (value === null) {
      let callbacks = cleanups
      cleanups = []
      for (let cleanup of callbacks) cleanup(value)
      return
    }

    // Handle cleanup ourselves so the merged ref also works with React 18.
    cleanups = []
    for (let ref of getRefs()) {
      if (ref == null) continue
      if (typeof ref === 'function') {
        let cleanup = ref(value)
        cleanups.push(typeof cleanup === 'function' ? () => cleanup() : (value) => ref(value))
      } else {
        ref.current = value
        cleanups.push((value) => {
          ref.current = value
        })
      }
    }
  }
}
