import * as React from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

// We used a "simple" approach first which worked for SSR and rehydration on the client. However we
// didn't take care of the Suspense case. To fix this we used the approach the @reach-ui/auto-id
// uses.
//
// Credits: https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx

let state = { serverHandoffComplete: false }
let id = 0
function generateId() {
  return ++id
}

export function useId() {
  const [id, setId] = React.useState(state.serverHandoffComplete ? generateId : null)

  useIsoMorphicEffect(() => {
    if (id === null) setId(generateId())
  }, [id])

  React.useEffect(() => {
    if (state.serverHandoffComplete === false) state.serverHandoffComplete = true
  }, [])

  return id != null ? '' + id : undefined
}
