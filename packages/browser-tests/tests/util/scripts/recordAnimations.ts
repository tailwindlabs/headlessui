import { type TreeNode } from './convertToTreeNode'

export function __record_animations__() {
  const map = new WeakMap<EventTarget, Record<string, number>>()
  const endedIds = new Set<number>()

  let latestAnimationId = 0

  let allocate = () => latestAnimationId++

  function getAnimationId(event: TransitionEvent) {
    if (! event.target) {
      throw new Error("getAnimationId: event has no target")
    }

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

  function handle(event: TransitionEvent, state: AnimationState) {
    const record: AnimationRecord = {
      id: getAnimationId(event),
      state,
      target: (event.target as HTMLElement)?.dataset.testId ?? null,
      properties: [event.propertyName],
      elapsedTime: event.elapsedTime * 1000,
      tree: null as unknown as TreeNode,
    }

    // We must wait one frame to be able to see the updated DOM
    // This is done here instead of on the playwright side to
    // avoid any potential issues with slowness since it'll be a mostly sync operation
    requestAnimationFrame(() =>
      window.__record_animation_record__(
        Object.assign(record, {
          tree: window.__to_tree_node__(document.documentElement),
        })
      )
    )
  }

  document.addEventListener('transitionrun', (e) => handle(e, 'created'), { capture: true })
  document.addEventListener('transitionstart', (e) => handle(e, 'started'), { capture: true })
  document.addEventListener('transitioncancel', (e) => handle(e, 'cancelled'), {
    capture: true,
  })
  document.addEventListener('transitionend', (e) => handle(e, 'ended'), { capture: true })
}

export type AnimationState = 'created' | 'started' | 'ended' | 'cancelled'

export interface AnimationRecord {
  id: number
  state: AnimationState
  target: string | null
  properties: string[]
  elapsedTime: number
  tree: TreeNode
}

declare global {
  interface Window {
    __record_animations__: () => void
    __record_animation_record__: (payload: AnimationRecord) => void
  }
}
