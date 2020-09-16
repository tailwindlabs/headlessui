import * as React from 'react'

export const useIsoMorphicEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect
