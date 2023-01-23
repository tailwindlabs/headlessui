import { ScrollLockRequest } from './handler'

export function lockOverflow(req: ScrollLockRequest, next: (req: ScrollLockRequest) => void) {
  let { doc } = req

  // Update the overflow style of the document itself
  doc.documentElement.style.overflow = req.isLocked ? 'hidden' : ''

  // Keep processing the chain
  next(req)
}
