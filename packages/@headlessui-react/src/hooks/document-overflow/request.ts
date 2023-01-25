import { Middleware } from '../../utils/pipeline'
import { Disposables } from '../../utils/disposables'

export interface ScrollLockRequest {
  d: Disposables
  ctx: Record<string, any>
  doc: Document
  isLocked: boolean
}

export type ScrollLockMiddleware = Middleware<ScrollLockRequest>
