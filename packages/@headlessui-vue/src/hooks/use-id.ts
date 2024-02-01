import { inject } from 'vue'

let id = 0
function generateId() {
  return `${++id}`
}

export function useId() {
  let makeId = inject<() => string>('headlessui.useid', generateId)

  return makeId()
}
