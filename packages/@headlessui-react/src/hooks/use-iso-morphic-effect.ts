import { DependencyList, EffectCallback, useEffect, useLayoutEffect } from 'react'
import { env } from '../utils/env'

export let useIsoMorphicEffect = (effect: EffectCallback, deps?: DependencyList | undefined) => {
  if (env.isServer) {
    useEffect(effect, deps)
  } else {
    useLayoutEffect(effect, deps)
  }
}
