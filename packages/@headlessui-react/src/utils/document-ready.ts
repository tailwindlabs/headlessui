function defer<T = unknown>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return { promise, resolve, reject }
}

export function onDocumentReady() {
  const ready = defer<void>()
  const check = () => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      ready.resolve()
      document.removeEventListener('readystatechange', check)
    }
  }

  document.addEventListener('readystatechange', check)

  check()

  return ready.promise
}
