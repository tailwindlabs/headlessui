import * as React from 'react'
import { env } from '../utils/env'

/**
 * This is used to determine if we're hydrating in React 18.
 *
 * The `useServerHandoffComplete` hook doesn't work with `<Suspense>`
 * because it assumes all hydration happens at one time during page load.
 *
 * Given that the problem only exists in React 18 we can rely
 * on newer APIs to determine if hydration is happening.
 */
function useIsHydratingInReact18(): boolean {
  let isServer = typeof document === 'undefined'

  // React < 18 doesn't have any way to figure this out afaik
  if (!('useSyncExternalStore' in React)) {
    return false
  }

  // This weird pattern makes sure bundlers don't throw at build time
  // because `useSyncExternalStore` isn't defined in React < 18
  const useSyncExternalStore = ((r) => r.useSyncExternalStore)(React)

  // @ts-ignore
  let result = useSyncExternalStore(
    () => () => {},
    () => false,
    () => (isServer ? false : true)
  )

  return result
}

// TODO: We want to get rid of this hook eventually
export function useServerHandoffComplete() {
  let isHydrating = useIsHydratingInReact18()
  let [complete, setComplete] = React.useState(env.isHandoffComplete)

  if (complete && env.isHandoffComplete === false) {
    // This means we are in a test environment and we need to reset the handoff state
    // This kinda breaks the rules of React but this is only used for testing purposes
    // And should theoretically be fine
    setComplete(false)
  }

  React.useEffect(() => {
    if (complete === true) return
    setComplete(true)
  }, [complete])

  // Transition from pending to complete (forcing a re-render when server rendering)
  React.useEffect(() => env.handoff(), [])

  if (isHydrating) {
    return false
  }

  return complete
}
