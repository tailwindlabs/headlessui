import { useLayoutEffect, useEffect } from 'react'

export let useIsoMorphicEffect = (typeof window !== 'undefined' && typeof document !== 'undefined') ? useLayoutEffect : useEffect
