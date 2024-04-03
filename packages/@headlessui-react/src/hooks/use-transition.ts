import { useRef, type MutableRefObject } from 'react'
import { transition } from '../components/transition/utils/transition'
import { useDisposables } from './use-disposables'
import { useIsMounted } from './use-is-mounted'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { useLatestValue } from './use-latest-value'

interface TransitionArgs {
  immediate: boolean
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

export function useTransition({
  immediate,
  container,
  direction,
  classes,
  onStart,
  onStop,
}: TransitionArgs) {
  let mounted = useIsMounted()
  let d = useDisposables()

  let latestDirection = useLatestValue(direction)

  // Track whether the transition is in flight or not. This will help us for
  // cancelling mid-transition because in that case we don't have to force
  // clearing existing transitions. See: `prepareTransition` in the `transition`
  // file.
  let inFlight = useRef(false)

  useIsoMorphicEffect(() => {
    if (!immediate) return

    latestDirection.current = 'enter'
  }, [immediate])

  useIsoMorphicEffect(() => {
    let node = container.current
    if (!node) return // We don't have a DOM node (yet)
    if (latestDirection.current === 'idle') return // We don't need to transition
    if (!mounted.current) return

    onStart.current(latestDirection.current)

    d.add(
      transition(node, {
        direction: latestDirection.current,
        classes: classes.current,
        inFlight,
        done() {
          d.dispose()
          onStop.current(latestDirection.current)
        },
      })
    )

    return d.dispose
  }, [direction])
}
