import { Disposables } from '../../utils/disposables'

export interface ScrollLockStep {
  before?(doc: Document, d: Disposables): void
  after?(doc: Document, d: Disposables): void
}
