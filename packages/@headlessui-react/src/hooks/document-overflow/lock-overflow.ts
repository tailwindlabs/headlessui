import { ScrollLockRequest } from './handler'

export function lockOverflow(request: ScrollLockRequest, next: () => void) {
  let { doc } = request

  // Update the overflow style of the document itself
  doc.documentElement.style.overflow = request.isLocked ? 'hidden' : ''

  // Keep processing the chain
  next()
}
