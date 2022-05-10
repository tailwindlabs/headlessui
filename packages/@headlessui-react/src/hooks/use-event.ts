import React from 'react'

export let useEvent =
  // TODO: Add React.useEvent ?? once the useEvent hook is available
  function useEvent<T, R>(cb: (...args: T[]) => R) {
    let cache = React.useRef(cb)
    cache.current = cb
    return React.useCallback((...args: T[]) => cache.current(...args), [cache])
  }
