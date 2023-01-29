import { Disposables } from 'utils/disposables'

export function lockOverflow() {
  return {
    before(doc: Document, d: Disposables) {
      d.style(doc.documentElement, 'overflow', 'hidden')
    },
  }
}
