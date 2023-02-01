import * as React from 'react'

export let startTransition =
  // Prefer React's `startTransition` if it's available.
  // @ts-expect-error - `startTransition` doesn't exist in React < 18.
  React.startTransition ??
  function startTransition(cb: () => void) {
    cb()
  }
