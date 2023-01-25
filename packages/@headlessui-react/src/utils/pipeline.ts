export interface Middleware<ReqType> {
  (request: ReqType, next: (req: ReqType) => void): void
}

export function pipeline<ReqType>(handlers: Middleware<ReqType>[]) {
  return (request: ReqType, andThen?: (req: ReqType) => void) => {
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
