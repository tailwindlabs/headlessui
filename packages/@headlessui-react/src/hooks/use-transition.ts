import { useRef, type MutableRefObject } from 'react'
import { transition } from '../components/transition/utils/transition'
import { useDisposables } from './use-disposables'
import { useIsMounted } from './use-is-mounted'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'

interface TransitionArgs {
  container: MutableRefObject<HTMLElement | null>
  classes: MutableRefObject<{
    base: string[]

    enter: string[]
    enterFrom: string[]
    enterTo: string[]

    leave: string[]
    leaveFrom: string[]
    leaveTo: string[]

    entered: string[]
  }>
  direction: 'enter' | 'leave' | 'idle'
  onStart: MutableRefObject<(direction: TransitionArgs['direction']) => void>
  onStop: MutableRefObject<(direction: TransitionArgs['direction']) => void>
}

export function useTransition({ container, direction, classes, onStart, onStop }: TransitionArgs) {
  let mounted = useIsMounted()
  let d = useDisposables()

  // Track whether the transition is in flight or not. This will help us for
  // cancelling mid-transition because in that case we don't have to force
  // clearing existing transitions. See: `prepareTransition` in the `transition`
  // file.
  let inFlight = useRef(false)

  useIsoMorphicEffect(() => {
    if (direction === 'idle') return // We don't need to transition
    if (!mounted.current) return

    onStart.current(direction)

    let node = container.current
    if (!node) {
      // No node, so let's skip the transition and call the `onStop` callback
      // immediately because there is no transition to wait for anyway.
      onStop.current(direction)
    }

    // We do have a node, let's transition it!
    else {
      d.add(
        transition(node, {
          direction,
          classes: classes.current,
          inFlight,
          done() {
            onStop.current(direction)
          },
        })
      )
    }

    return d.dispose
  }, [direction])
}
