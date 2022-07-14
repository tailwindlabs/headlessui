import { useLayoutEffect, useEffect } from 'react'
import { isServer } from '../utils/ssr'

export let useIsoMorphicEffect = isServer ? useEffect : useLayoutEffect
