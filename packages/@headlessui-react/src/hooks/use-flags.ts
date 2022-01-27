import { useState, useCallback } from 'react'

export function useFlags(initialFlags = 0) {
  let [flags, setFlags] = useState(initialFlags)

  let addFlag = useCallback((flag: number) => setFlags((flags) => flags | flag), [setFlags])
  let hasFlag = useCallback((flag: number) => Boolean(flags & flag), [flags])
  let removeFlag = useCallback((flag: number) => setFlags((flags) => flags & ~flag), [setFlags])
  let toggleFlag = useCallback((flag: number) => setFlags((flags) => flags ^ flag), [setFlags])

  return { addFlag, hasFlag, removeFlag, toggleFlag }
}
