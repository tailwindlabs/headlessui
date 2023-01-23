export interface ScrollLockRequest {
  doc: Document
  isLocked: boolean
}

export interface Handler {
  (request: ScrollLockRequest, next: () => void): void
}

export function pipeline(handlers: Handler[]) {
  return (request: ScrollLockRequest) => {
    let index = 0

    function next() {
      let handler = handlers[index++]
      if (handler) handler(request, next)
    }

    next()
  }
}
