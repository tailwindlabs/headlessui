import { useMemo, useReducer } from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

function computeSize(element: HTMLElement | null) {
  if (element === null) return { width: 0, height: 0 }
  let { width, height } = element.getBoundingClientRect()
  return { width, height }
}

export function useElementSize(element: HTMLElement | null, unit = false) {
  let [identity, forceRerender] = useReducer(() => ({}), {})

  // When the element changes during a re-render, we want to make sure we
  // compute the correct size as soon as possible. However, once the element is
  // stable, we also want to watch for changes to the element. The `identity`
  // state can be used to recompute the size.
  let size = useMemo(() => computeSize(element), [element, identity])

  useIsoMorphicEffect(() => {
    if (!element) return

    // Trigger a re-render whenever the element resizes
    let observer = new ResizeObserver(forceRerender)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element])

  if (unit) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    }
  }

  return size
}
