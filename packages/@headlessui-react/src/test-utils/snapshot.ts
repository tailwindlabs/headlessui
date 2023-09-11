import { useLayoutEffect, useRef, type MutableRefObject } from 'react'

export function createSnapshot() {
  let snapshots: HTMLElement[] = []

  return {
    get latest() {
      return snapshots.at(-1)
    },

    get firstChild() {
      return this.latest?.firstChild ?? null
    },

    use() {
      let ref = useRef<HTMLElement>(null)
      useLayoutEffect(() => this.take(ref), [])
      return ref
    },

    take(ref: MutableRefObject<HTMLElement | null>) {
      snapshots.push(ref.current!.parentElement!.cloneNode(true) as any)
    },
  }
}
