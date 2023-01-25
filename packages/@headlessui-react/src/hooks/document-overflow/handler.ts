import { Disposables } from "../../utils/disposables"

export interface ScrollLockRequest {
  d: Disposables
  ctx: Record<string, any>
  doc: Document
  isLocked: boolean
}

export interface Middleware<R = ScrollLockRequest> {
  (request: R, next: (req: R) => void): void
}

export function pipeline<R = ScrollLockRequest>(handlers: Middleware<R>[]) {
  return (request: R, andThen?: (req: R) => void) => {
    let index = 0

    function next() {
      let handler = handlers[index++]
      if (handler) {
        handler(request, next)
      } else if (andThen) {
        andThen(request)
      }
    }

    next()
  }
}
