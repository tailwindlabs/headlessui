import * as React from 'react'
import { env } from '../utils/env'

export function useServerHandoffComplete() {
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
