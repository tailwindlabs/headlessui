import { ScrollLockStep } from './overflow-store'

export function preventScroll(): ScrollLockStep {
  return {
    behavior: 'once',
    before({ doc, d }) {
      d.style(doc.documentElement, 'overflow', 'hidden')
    },
  }
}
