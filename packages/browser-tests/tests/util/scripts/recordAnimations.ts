export function recordAnimations() {
  const map = new WeakMap<EventTarget, Record<string, number>>()
  const endedIds = new Set<number>()

  let latestAnimationId = 0

  let allocate = () => latestAnimationId++

  function getAnimationId(event: TransitionEvent) {
    let records = map.get(event.target) ?? {}
    map.set(event.target, records)

    let key = `${event.propertyName}::${event.pseudoElement}`
    records[key] ??= allocate()

    let hasEnded = event.type === 'transitionend' || event.type === 'transitioncancel'

    if (endedIds.has(records[key])) {
      records[key] = allocate()
    } else if (hasEnded) {
      endedIds.add(records[key])
    }

    return records[key]
  }

  function update(event: TransitionEvent, state: AnimationState) {
    window.__update__({
      id: getAnimationId(event),
      state,
      target: (event.target as HTMLElement)?.dataset.testId ?? null,
      properties: [event.propertyName],
      elapsedTime: event.elapsedTime * 1000,
    })
  }

  document.addEventListener('transitionrun', (e) => update(e, 'created'), { capture: true })
  document.addEventListener('transitionstart', (e) => update(e, 'started'), { capture: true })
  document.addEventListener('transitioncancel', (e) => update(e, 'cancelled'), {
    capture: true,
  })
  document.addEventListener('transitionend', (e) => update(e, 'ended'), { capture: true })
}

export type AnimationState = 'created' | 'started' | 'ended' | 'cancelled'

export interface AnimationRecord {
  id: number
  state: AnimationState
  target: string | null
  properties: string[]
  elapsedTime: number
}

declare global {
  interface Window {
    __update__: (payload: AnimationRecord) => void
  }
}
