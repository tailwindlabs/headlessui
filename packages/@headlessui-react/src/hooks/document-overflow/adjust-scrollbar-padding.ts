import { ScrollLockRequest } from './request'

export function adjustScrollbarPadding(
  req: ScrollLockRequest,
  next: (req: ScrollLockRequest) => void
) {
  let { doc } = req

  if (!req.isLocked) {
    next(req)
    doc.documentElement.style.overflow = req.ctx.oldPaddingRight
    return
  }

  let documentElement = doc.documentElement

  // Record the scrollbar width before we change the style
  let ownerWindow = doc.defaultView ?? window
  let scrollbarWidthBefore = ownerWindow.innerWidth - documentElement.clientWidth

  req.ctx.oldPaddingRight = documentElement.style.paddingRight

  // Update the overflow style of the document itself
  next(req)

  // Account for the change in scrollbar width
  // NOTE: This is a bit of a hack, but it's the only way to do this
  let scrollbarWidthAfter = documentElement.clientWidth - documentElement.offsetWidth
  let scrollbarWidth = scrollbarWidthBefore - scrollbarWidthAfter

  documentElement.style.paddingRight = `${scrollbarWidth}px`
}
