import { useState } from 'react'
import { useEvent } from './use-event'

export function useFlags(initialFlags = 0) {
  let [flags, setFlags] = useState(initialFlags)

  let addFlag = useEvent((flag: number) => setFlags((flags) => flags | flag))
  let hasFlag = useEvent((flag: number) => Boolean(flags & flag))
  let removeFlag = useEvent((flag: number) => setFlags((flags) => flags & ~flag))
  let toggleFlag = useEvent((flag: number) => setFlags((flags) => flags ^ flag))

  return { addFlag, hasFlag, removeFlag, toggleFlag }
}
