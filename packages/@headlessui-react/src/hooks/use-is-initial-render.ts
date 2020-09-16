import * as React from 'react'

export function useIsInitialRender() {
  const initial = React.useRef(true)

  React.useEffect(() => {
    initial.current = false
  }, [])

  return initial.current
}
