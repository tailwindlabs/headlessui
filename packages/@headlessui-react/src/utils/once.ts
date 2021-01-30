export function once<T>(cb: (...args: T[]) => void) {
  let state = { called: false }

  return (...args: T[]) => {
    if (state.called) return
    state.called = true
    return cb(...args)
  }
}
