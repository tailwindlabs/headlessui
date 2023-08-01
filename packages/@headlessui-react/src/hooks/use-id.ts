import React from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { env } from '../utils/env'

// We used a "simple" approach first which worked for SSR and rehydration on the client. However we
// didn't take care of the Suspense case. To fix this we used the approach the @reach-ui/auto-id
// uses.
//
// Credits: https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx

export let useId =
  // Prefer React's `useId` if it's available.
  // @ts-expect-error - `useId` doesn't exist in React < 18.
  React.useId ??
  function useId() {
    let ready = useServerHandoffComplete()
    let [id, setId] = React.useState(ready ? () => env.nextId() : null)

    useIsoMorphicEffect(() => {
      if (id === null) setId(env.nextId())
    }, [id])

    return id != null ? '' + id : undefined
  }

// NOTE: Do NOT use this outside of the `useId` hook
// It is not compatible with `<Suspense>` (which is in React 18 which has its own `useId` hook)
function useServerHandoffComplete() {
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

  return complete
}
