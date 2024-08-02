import { useRef, useState, type MutableRefObject } from 'react'
import { disposables } from '../utils/disposables'
import { once } from '../utils/once'
import { useDisposables } from './use-disposables'
import { useFlags } from './use-flags'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

/**
 * ```
 * ┌──────┐                │        ┌──────────────┐
 * │Closed│                │        │Closed        │
 * └──────┘                │        └──────────────┘
 * ┌──────┐┌──────┐┌──────┐│┌──────┐┌──────┐┌──────┐
 * │Frame ││Frame ││Frame │││Frame ││Frame ││Frame │
 * └──────┘└──────┘└──────┘│└──────┘└──────┘└──────┘
 * ┌──────────────────────┐│┌──────────────────────┐
 * │Enter                 │││Leave                 │
 * └──────────────────────┘│└──────────────────────┘
 * ┌──────────────────────┐│┌──────────────────────┐
 * │Transition            │││Transition            │
 * ├──────────────────────┘│└──────────────────────┘
 * │
 * └─ Applied when `Enter` or `Leave` is applied.
 * ```
 */
enum TransitionState {
  None = 0,

  Closed = 1 << 0,

  Enter = 1 << 1,
  Leave = 1 << 2,
}

type TransitionData = {
  closed?: boolean
  enter?: boolean
  leave?: boolean
  transition?: boolean
}

export function transitionDataAttributes(data: TransitionData) {
  let attributes: Record<string, string> = {}
  for (let key in data) {
    if (data[key as keyof TransitionData] === true) {
      attributes[`data-${key}`] = ''
    }
  }
  return attributes
}

export function useTransition(
  enabled: boolean,
  element: HTMLElement | null,
  show: boolean,
  events?: {
    start?(show: boolean): void
    end?(show: boolean): void
  }
): [visible: boolean, data: TransitionData] {
  let [visible, setVisible] = useState(show)

  let { hasFlag, addFlag, removeFlag } = useFlags(
    enabled && visible ? TransitionState.Enter | TransitionState.Closed : TransitionState.None
  )
  let inFlight = useRef(false)
  let cancelledRef = useRef(false)

  let d = useDisposables()

  useIsoMorphicEffect(() => {
    if (!enabled) return

    if (show) {
      setVisible(true)
    }

    if (!element) {
      if (show) {
        addFlag(TransitionState.Enter | TransitionState.Closed)
      }
      return
    }

    events?.start?.(show)

    return transition(element, {
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
          addFlag(TransitionState.Enter | TransitionState.Closed)
          removeFlag(TransitionState.Leave)
        } else {
          addFlag(TransitionState.Leave)
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
          // stable state where an `Enter` transitions to, and a `Leave`
          // transitions from.)
          //
          // Because of this, it might look like we are swapping the flags in
          // the following branches, but that's not the case.
          if (show) {
            removeFlag(TransitionState.Enter | TransitionState.Closed)
            addFlag(TransitionState.Leave)
          } else {
            removeFlag(TransitionState.Leave)
            addFlag(TransitionState.Enter | TransitionState.Closed)
          }
        } else {
          if (show) {
            removeFlag(TransitionState.Closed)
          } else {
            addFlag(TransitionState.Closed)
          }
        }
      },
      done() {
        if (cancelledRef.current) {
          if (typeof element.getAnimations === 'function' && element.getAnimations().length > 0) {
            return
          }
        }

        inFlight.current = false

        removeFlag(TransitionState.Enter | TransitionState.Leave | TransitionState.Closed)

        if (!show) {
          setVisible(false)
        }

        events?.end?.(show)
      },
    })
  }, [enabled, show, element, d])

  if (!enabled) {
    return [
      show,
      {
        closed: undefined,
        enter: undefined,
        leave: undefined,
        transition: undefined,
      },
    ] as const
  }

  return [
    visible,
    {
      closed: hasFlag(TransitionState.Closed),
      enter: hasFlag(TransitionState.Enter),
      leave: hasFlag(TransitionState.Leave),
      transition: hasFlag(TransitionState.Enter) || hasFlag(TransitionState.Leave),
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

function waitForTransition(node: HTMLElement, _done: () => void) {
  let done = once(_done)
  let d = disposables()

  if (!node) return d.dispose

  // Safari returns a comma separated list of values, so let's sort them and take the highest value.
  let { transitionDuration, transitionDelay } = getComputedStyle(node)

  let [durationMs, delayMs] = [transitionDuration, transitionDelay].map((value) => {
    let [resolvedValue = 0] = value
      .split(',')
      // Remove falsy we can't work with
      .filter(Boolean)
      // Values are returned as `0.3s` or `75ms`
      .map((v) => (v.includes('ms') ? parseFloat(v) : parseFloat(v) * 1000))
      .sort((a, z) => z - a)

    return resolvedValue
  })

  let totalDuration = durationMs + delayMs

  if (totalDuration !== 0) {
    if (process.env.NODE_ENV === 'test') {
      let dispose = d.setTimeout(() => {
        done()
        dispose()
      }, totalDuration)
    } else {
      let disposeGroup = d.group((d) => {
        // Mark the transition as done when the timeout is reached. This is a fallback in case the
        // transitionrun event is not fired.
        let cancelTimeout = d.setTimeout(() => {
          done()
          d.dispose()
        }, totalDuration)

        // The moment the transitionrun event fires, we should cleanup the timeout fallback, because
        // then we know that we can use the native transition events because something is
        // transitioning.
        d.addEventListener(node, 'transitionrun', (event) => {
          if (event.target !== event.currentTarget) return
          cancelTimeout()

          d.addEventListener(node, 'transitioncancel', (event) => {
            if (event.target !== event.currentTarget) return
            done()
            disposeGroup()
          })
        })
      })

      d.addEventListener(node, 'transitionend', (event) => {
        if (event.target !== event.currentTarget) return
        done()
        d.dispose()
      })
    }
  } else {
    // No transition is happening, so we should cleanup already. Otherwise we have to wait until we
    // get disposed.
    done()
  }

  return d.dispose
}

function prepareTransition(
  node: HTMLElement,
  { inFlight, prepare }: { inFlight?: MutableRefObject<boolean>; prepare: () => void }
) {
  // If we are already transitioning, then we don't need to force cancel the
  // current transition (by triggering a reflow).
  if (inFlight?.current) {
    prepare()
    return
  }

  let previous = node.style.transition

  // Force cancel current transition
  node.style.transition = 'none'

  prepare()

  // Trigger a reflow, flushing the CSS changes
  node.offsetHeight

  // Reset the transition to what it was before
  node.style.transition = previous
}
