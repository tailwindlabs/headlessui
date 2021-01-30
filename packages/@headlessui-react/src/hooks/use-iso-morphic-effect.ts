import { useLayoutEffect, useEffect } from 'react'

export const useIsoMorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
