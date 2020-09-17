import * as React from 'react'

if (process.env.NODE_ENV === 'test') {
  if (process.env.JEST_WORKER_ID !== undefined) {
    beforeEach(() => {
      id = 0
    })
  }
}

let id = 0
function generateId() {
  return ++id
}

export function useId() {
  const [id] = React.useState(generateId)
  return id
}
