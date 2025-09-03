import { useCallback, useState } from 'react'

export function useFlags(initialFlags = 0) {
  let [flags, setFlags] = useState(initialFlags)

  let setFlag = useCallback((flag: number) => setFlags(flag), [])

  let addFlag = useCallback((flag: number) => setFlags((flags) => flags | flag), [])
  let hasFlag = useCallback((flag: number) => (flags & flag) === flag, [flags])
  let removeFlag = useCallback((flag: number) => setFlags((flags) => flags & ~flag), [])
  let toggleFlag = useCallback((flag: number) => setFlags((flags) => flags ^ flag), [])

  return { flags, setFlag, addFlag, hasFlag, removeFlag, toggleFlag }
}
