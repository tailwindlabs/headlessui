import * as React from 'react'

export function useIsMounted() {
  const mounted = React.useRef(true)

  React.useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  return mounted
}
