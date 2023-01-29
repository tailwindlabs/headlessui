import { Disposables } from '../../utils/disposables'

export function preventScroll() {
  return {
    before(doc: Document, d: Disposables) {
      d.style(doc.documentElement, 'overflow', 'hidden')
    },
  }
}
