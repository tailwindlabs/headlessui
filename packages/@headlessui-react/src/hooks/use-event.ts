import React from 'react'
import { useLatestValue } from './use-latest-value'

export let useEvent =
  // TODO: Add React.useEvent ?? once the useEvent hook is available
  function useEvent<
    F extends (...args: any[]) => any,
    P extends any[] = Parameters<F>,
    R = ReturnType<F>,
  >(cb: (...args: P) => R) {
    let cache = useLatestValue(cb)
    return React.useCallback((...args: P) => cache.current(...args), [cache])
  }
