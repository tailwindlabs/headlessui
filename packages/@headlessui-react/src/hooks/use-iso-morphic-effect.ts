import { useLayoutEffect, useEffect } from 'react'

export let useIsoMorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
