import { Disposables } from '../../utils/disposables'

export function adjustScrollbarPadding() {
  let scrollbarWidthBefore: number

  return {
    before(doc: Document) {
      let documentElement = doc.documentElement
      let ownerWindow = doc.defaultView ?? window

      scrollbarWidthBefore = ownerWindow.innerWidth - documentElement.clientWidth
    },

    after(doc: Document, d: Disposables) {
      let documentElement = doc.documentElement

      // Account for the change in scrollbar width
      // NOTE: This is a bit of a hack, but it's the only way to do this
      let scrollbarWidthAfter = documentElement.clientWidth - documentElement.offsetWidth
      let scrollbarWidth = scrollbarWidthBefore - scrollbarWidthAfter

      d.style(documentElement, 'paddingRight', `${scrollbarWidth}px`)
    },
  }
}
