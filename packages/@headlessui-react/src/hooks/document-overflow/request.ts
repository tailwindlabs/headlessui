import { Middleware } from '../../utils/pipeline'

export interface ScrollLockRequest {
  ctx: Record<string, any>
  doc: Document
  isLocked: boolean
}

export type ScrollLockMiddleware = Middleware<ScrollLockRequest>
