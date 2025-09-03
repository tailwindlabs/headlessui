import { disposables } from './disposables'

export const ElementPositionState = {
  Idle: { kind: 'Idle' as const },
  Tracked: (position: string) => ({ kind: 'Tracked' as const, position }),
  Moved: { kind: 'Moved' as const },
}

type ResolvedStates<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : T[K]
}[keyof T]

export type ElementPositionState = ResolvedStates<typeof ElementPositionState>

export function computeVisualPosition(element: HTMLElement): string {
  let rect = element.getBoundingClientRect()
  return `${rect.x},${rect.y}`
}

export function detectMovement(
  target: HTMLElement,
  state: ResolvedStates<typeof ElementPositionState>,
  onMove: () => void
) {
  let d = disposables()

  if (state.kind === 'Tracked') {
    let { position } = state

    function check() {
      if (position !== computeVisualPosition(target)) {
        d.dispose()
        onMove()
      }
    }

    let observer = new ResizeObserver(check)
    observer.observe(target)
    d.add(() => observer.disconnect())

    d.addEventListener(window, 'scroll', check, { passive: true })
    d.addEventListener(window, 'resize', check)
  }

  return () => d.dispose()
}
