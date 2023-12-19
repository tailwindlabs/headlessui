import React from 'react'
import { env } from '../utils/env'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { useServerHandoffComplete } from './use-server-handoff-complete'

// We used a "simple" approach first which worked for SSR and rehydration on the client. However we
// didn't take care of the Suspense case. To fix this we used the approach the @reach-ui/auto-id
// uses.
//
// Credits: https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx

export let useId =
  // Prefer React's `useId` if it's available.
  React.useId ??
  function useId() {
    let ready = useServerHandoffComplete()
    let [id, setId] = React.useState(ready ? () => env.nextId() : null)

    useIsoMorphicEffect(() => {
      if (id === null) setId(env.nextId())
    }, [id])

    return id != null ? '' + id : undefined
  }
