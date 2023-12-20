import type { ScrollLockStep } from './overflow-store'

export function preventScroll(): ScrollLockStep {
  return {
    before({ doc, d }) {
      d.style(doc.documentElement, 'overflow', 'hidden')
    },
  }
}
