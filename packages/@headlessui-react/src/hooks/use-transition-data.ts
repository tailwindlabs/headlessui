import { useRef, useState, type MutableRefObject } from 'react'
import { prepareTransition, waitForTransition } from '../components/transition/utils/transition'
import { disposables } from '../utils/disposables'
import { useDisposables } from './use-disposables'
import { useFlags } from './use-flags'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

/**
 * ```
 * ┌─────┐              │       ┌────────────┐
 * │From │              │       │From        │
 * └─────┘              │       └────────────┘
 * ┌─────┐┌─────┐┌─────┐│┌─────┐┌─────┐┌─────┐
 * │Frame││Frame││Frame│││Frame││Frame││Frame│
 * └─────┘└─────┘└─────┘│└─────┘└─────┘└─────┘
 * ┌───────────────────┐│┌───────────────────┐
 * │Enter              │││Exit               │
 * └───────────────────┘│└───────────────────┘
 * ┌───────────────────┐│┌───────────────────┐
 * │Transition         │││Transition         │
 * ├───────────────────┘│└───────────────────┘
 * │
 * └─ Applied when `Enter` or `Exit` is applied.
 * ```
 */
enum TransitionState {
  None = 0,

  From = 1 << 0,

  Enter = 1 << 1,
  Exit = 1 << 2,
}

export type TransitionData = {
  from?: boolean
  enter?: boolean
  exit?: boolean
  transition?: boolean
}

export function useTransitionData(
  enabled: boolean,
  elementRef: MutableRefObject<HTMLElement | null>,
  show: boolean
): [visible: boolean, data: TransitionData] {
  let [visible, setVisible] = useState(show)

  let { hasFlag, addFlag, removeFlag } = useFlags(
    visible ? TransitionState.From : TransitionState.None
  )
  let inFlight = useRef(false)
  let cancelledRef = useRef(false)

  let d = useDisposables()

  useIsoMorphicEffect(
    function retry() {
      if (!enabled) return

      if (show) {
        setVisible(true)
      }

      let node = elementRef.current
      if (!node) {
        // Retry if the DOM node isn't available yet
        if (show) {
          addFlag(TransitionState.Enter | TransitionState.From)
          return d.nextFrame(() => retry())
        }
        return
      }

      return transition(node, {
        inFlight,
        prepare() {
          if (cancelledRef.current) {
            // Cancelled a cancellation, we're back to the original state.
            cancelledRef.current = false
          } else {
            // If we were already in-flight, then we want to cancel the current
            // transition.
            cancelledRef.current = inFlight.current
          }

          inFlight.current = true

          if (cancelledRef.current) return

          if (show) {
            addFlag(TransitionState.Enter | TransitionState.From)
            removeFlag(TransitionState.Exit)
          } else {
            addFlag(TransitionState.Exit)
            removeFlag(TransitionState.Enter)
          }
        },
        run() {
          if (cancelledRef.current) {
            // If we cancelled a transition, then the `show` state is going to
            // be inverted already, but that doesn't mean we have to go to that
            // new state.
            //
            // What we actually want is to revert to the "idle" state (the
            // stable state where an `Enter` transitions to, and an `Exit`
            // transitions from.)
            //
            // Because of this, it might look like we are swapping the flags in
            // the following branches, but that's not the case.
            if (show) {
              removeFlag(TransitionState.Enter | TransitionState.From)
              addFlag(TransitionState.Exit)
            } else {
              removeFlag(TransitionState.Exit)
              addFlag(TransitionState.Enter | TransitionState.From)
            }
          } else {
            if (show) {
              removeFlag(TransitionState.From)
            } else {
              addFlag(TransitionState.From)
            }
          }
        },
        done() {
          if (cancelledRef.current) {
            if (typeof node.getAnimations === 'function' && node.getAnimations().length > 0) {
              return
            }
          }

          inFlight.current = false

          removeFlag(TransitionState.Enter | TransitionState.Exit | TransitionState.From)

          if (!show) {
            setVisible(false)
          }
        },
      })
    },
    [enabled, show, elementRef, d]
  )

  if (!enabled) {
    return [
      show,
      {
        from: undefined,
        enter: undefined,
        exit: undefined,
        transition: undefined,
      },
    ] as const
  }

  return [
    visible,
    {
      from: hasFlag(TransitionState.From),
      enter: hasFlag(TransitionState.Enter),
      exit: hasFlag(TransitionState.Exit),
      transition: hasFlag(TransitionState.Enter) || hasFlag(TransitionState.Exit),
    },
  ] as const
}

function transition(
  node: HTMLElement,
  {
    prepare,
    run,
    done,
    inFlight,
  }: {
    prepare: () => void
    run: () => void
    done: () => void
    inFlight: MutableRefObject<boolean>
  }
) {
  let d = disposables()

  // Prepare the transitions by ensuring that all the "before" classes are
  // applied and flushed to the DOM.
  prepareTransition(node, {
    prepare,
    inFlight,
  })

  // This is a workaround for a bug in all major browsers.
  //
  // 1. When an element is just mounted
  // 2. And you apply a transition to it (e.g.: via a class)
  // 3. And you're using `getComputedStyle` and read any returned value
  // 4. Then the `transition` immediately jumps to the end state
  //
  // This means that no transition happens at all. To fix this, we delay the
  // actual transition by one frame.
  d.nextFrame(() => {
    // Wait for the transition, once the transition is complete we can cleanup.
    // This is registered first to prevent race conditions, otherwise it could
    // happen that the transition is already done before we start waiting for
    // the actual event.
    d.add(waitForTransition(node, done))

    // Initiate the transition by applying the new classes.
    run()
  })

  return d.dispose
}
