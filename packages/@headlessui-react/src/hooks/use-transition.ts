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
    let node = container.current
    if (!node) return // We don't have a DOM node (yet)
    if (direction === 'idle') return // We don't need to transition
    if (!mounted.current) return

    onStart.current(direction)

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

    return d.dispose
  }, [direction])
}
