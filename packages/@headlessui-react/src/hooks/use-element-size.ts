import { useState } from 'react'
import { disposables } from '../utils/disposables'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

function computeSize(element: HTMLElement | null) {
  if (element === null) return { width: 0, height: 0 }
  let { width, height } = element.getBoundingClientRect()
  return { width, height }
}

export function useElementSize(enabled: boolean, element: HTMLElement | null, unit = false) {
  let [size, setSize] = useState(() => computeSize(element))

  useIsoMorphicEffect(() => {
    if (!element) return
    if (!enabled) return

    let d = disposables()

    // requestAnimationFrame loop to catch any visual changes such as a
    // `transform: scale` which wouldn't trigger a ResizeObserver
    d.requestAnimationFrame(function run() {
      d.requestAnimationFrame(run)

      setSize((current) => {
        let newSize = computeSize(element)

        if (newSize.width === current.width && newSize.height === current.height) {
          // Return the old object to avoid re-renders
          return current
        }

        return newSize
      })
    })

    return () => {
      d.dispose()
    }
  }, [element, enabled])

  if (unit) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    }
  }

  return size
}
