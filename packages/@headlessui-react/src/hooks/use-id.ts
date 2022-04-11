import React from 'react'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { useServerHandoffComplete } from './use-server-handoff-complete'

// We used a "simple" approach first which worked for SSR and rehydration on the client. However we
// didn't take care of the Suspense case. To fix this we used the approach the @reach-ui/auto-id
// uses.
//
// Credits: https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx

let id = 0
function generateId() {
  return ++id
}

export let useId =
  // Prefer React's `useId` if it's available.
  // @ts-expect-error - `useId` doesn't exist in React < 18.
  React.useId ??
  function useId() {
    let ready = useServerHandoffComplete()
    let [id, setId] = React.useState(ready ? generateId : null)

    useIsoMorphicEffect(() => {
      if (id === null) setId(generateId())
    }, [id])

    return id != null ? '' + id : undefined
  }
