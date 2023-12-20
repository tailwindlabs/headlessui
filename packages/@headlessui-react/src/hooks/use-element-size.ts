import { useState } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

function computeSize(element: HTMLElement | null) {
  if (element === null) return { width: 0, height: 0 }
  let { width, height } = element.getBoundingClientRect()
  return { width, height }
}

export function useElementSize(ref: React.MutableRefObject<HTMLElement | null>, unit = false) {
  let [size, setSize] = useState(() => computeSize(ref.current))

  useIsoMorphicEffect(() => {
    let element = ref.current
    if (!element) return

    let observer = new ResizeObserver(() => {
      setSize(computeSize(element))
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref])

  if (unit) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    }
  }

  return size
}
