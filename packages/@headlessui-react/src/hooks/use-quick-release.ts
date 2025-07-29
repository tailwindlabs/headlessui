import { useRef } from 'react'
import * as DOM from '../utils/dom'
import { useDocumentEvent } from './use-document-event'

enum ActionKind {
  Ignore,
  Select,
  Close,
}

export const Action = {
  /** Do nothing */
  Ignore: { kind: ActionKind.Ignore } as const,

  /** Select the current item */
  Select: (target: HTMLElement) => ({ kind: ActionKind.Select, target }) as const,

  /** Close the dropdown */
  Close: { kind: ActionKind.Close } as const,
}

// If the time difference between pointerdown and pointerup is less than this,
// it is very likely a normal click, and nothing special should happen.
//
// Once we reach this threshold, we assume the user is trying to select an item
// in the dropdown, and we should close the dropdown after the click.
//
// Pointerdown -> drag over an item -> pointer up -> "click" on the item
const POINTER_HOLD_THRESHOLD = 200

// We should at least move this amount of pixels before we consider it a quick
// release. Otherwise it's just a normal click.
const POINTER_MOVEMENT_THRESHOLD = 5

type PointerEventWithTarget = Exclude<PointerEvent, 'target'> & {
  target: HTMLElement
}

export function useQuickRelease(
  enabled: boolean,
  {
    trigger,
    action,
    close,
    select,
  }: {
    trigger: HTMLElement | null
    action: (
      e: PointerEventWithTarget
    ) =>
      | { kind: ActionKind.Ignore }
      | { kind: ActionKind.Select; target: HTMLElement }
      | { kind: ActionKind.Close }
    close: () => void
    select: (target: HTMLElement) => void
  }
) {
  // Capture the timestamp of when the `pointerdown` event happened on the
  // trigger.
  let triggeredAtRef = useRef<number | null>(null)
  let startXRef = useRef<number | null>(null)
  let startYRef = useRef<number | null>(null)
  useDocumentEvent(enabled && trigger !== null, 'pointerdown', (e) => {
    if (!DOM.isNode(e?.target)) return
    if (!trigger?.contains(e.target)) return

    startXRef.current = e.x
    startYRef.current = e.y

    triggeredAtRef.current = e.timeStamp
  })

  useDocumentEvent(
    enabled && trigger !== null,
    'pointerup',
    (e) => {
      let triggeredAt = triggeredAtRef.current
      if (triggeredAt === null) return
      triggeredAtRef.current = null

      if (!DOM.isHTMLorSVGElement(e.target)) return

      // Ensure we moved the pointer a bit before considering it a quick
      // release.
      if (
        Math.abs(e.x - (startXRef.current ?? e.x)) < POINTER_MOVEMENT_THRESHOLD &&
        Math.abs(e.y - (startYRef.current ?? e.y)) < POINTER_MOVEMENT_THRESHOLD
      ) {
        return
      }

      let result = action(e as PointerEventWithTarget)

      switch (result.kind) {
        case ActionKind.Ignore:
          return

        case ActionKind.Select: {
          if (e.timeStamp - triggeredAt > POINTER_HOLD_THRESHOLD) {
            select(result.target)
            close()
          }
          break
        }

        case ActionKind.Close: {
          close()
          break
        }
      }
    },
    { capture: true }
  )
}
