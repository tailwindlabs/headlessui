import { ScrollLockRequest } from './handler'

export function lockOverflow(req: ScrollLockRequest, next: (req: ScrollLockRequest) => void) {
  let { doc } = req

  if (req.isLocked) {
    req.ctx.oldOverflow = doc.documentElement.style.overflow
    doc.documentElement.style.overflow = 'hidden'
  } else {
    doc.documentElement.style.overflow = req.ctx.oldOverflow
  }

  // Keep processing the chain
  next(req)
}
