import { useCallback, useState } from 'react'
import { useIsMounted } from './use-is-mounted'

export function useFlags(initialFlags = 0) {
  let [flags, setFlags] = useState(initialFlags)
  let mounted = useIsMounted()

  let addFlag = useCallback(
    (flag: number) => {
      if (!mounted.current) return
      setFlags((flags) => flags | flag)
    },
    [flags, mounted]
  )
  let hasFlag = useCallback((flag: number) => Boolean(flags & flag), [flags])
  let removeFlag = useCallback(
    (flag: number) => {
      if (!mounted.current) return
      setFlags((flags) => flags & ~flag)
    },
    [setFlags, mounted]
  )
  let toggleFlag = useCallback(
    (flag: number) => {
      if (!mounted.current) return
      setFlags((flags) => flags ^ flag)
    },
    [setFlags]
  )

  return { flags, addFlag, hasFlag, removeFlag, toggleFlag }
}
