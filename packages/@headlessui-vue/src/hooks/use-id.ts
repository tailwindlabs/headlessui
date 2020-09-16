if (process.env.JEST_WORKER_ID !== undefined) {
  beforeEach(() => {
    id = 0
  })
}

let id = 0
function generateId() {
  return ++id
}

export function useId() {
  return generateId()
}
