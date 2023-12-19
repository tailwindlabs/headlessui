import type { ScrollLockStep } from './overflow-store'

export function adjustScrollbarPadding(): ScrollLockStep {
  let scrollbarWidthBefore: number

  return {
    before({ doc }) {
      let documentElement = doc.documentElement
      let ownerWindow = doc.defaultView ?? window

      scrollbarWidthBefore = Math.max(0, ownerWindow.innerWidth - documentElement.clientWidth)
    },

    after({ doc, d }) {
      let documentElement = doc.documentElement

      // Account for the change in scrollbar width
      // NOTE: This is a bit of a hack, but it's the only way to do this
      let scrollbarWidthAfter = Math.max(
        0,
        documentElement.clientWidth - documentElement.offsetWidth
      )
      let scrollbarWidth = Math.max(0, scrollbarWidthBefore - scrollbarWidthAfter)

      d.style(documentElement, 'paddingRight', `${scrollbarWidth}px`)
    },
  }
}
