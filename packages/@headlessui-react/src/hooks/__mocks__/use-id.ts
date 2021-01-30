import { useState } from 'react'

beforeEach(() => {
  id = 0
})

let id = 0
function generateId() {
  return ++id
}

export function useId() {
  const [id] = useState(generateId)
  return id
}
