import { TransitionMachine, transition, TransitionDoneReason } from '@headlessui/core'
import { MutableRefObject } from 'react'

import { match } from '../utils/match'

import { useDisposables } from './use-disposables'
import { useIsMounted } from './use-is-mounted'
import { useIsoMorphicEffect } from './use-iso-morphic-effect'
import { useLatestValue } from './use-latest-value'

interface TransitionArgs {
  container: MutableRefObject<HTMLElement | null>
  classes: MutableRefObject<{
    enter: string[]
    enterFrom: string[]
    enterTo: string[]

    leave: string[]
    leaveFrom: string[]
    leaveTo: string[]

    entered: string[]
  }>
  direction: 'enter' | 'leave' | 'idle'
  machine: TransitionMachine
}

export function useTransition({
  container,
  machine,
  classes,
  direction,
}: TransitionArgs) {
  let mounted = useIsMounted()
  let d = useDisposables()
  let latestDirection = useLatestValue(direction)

  function startTransition() {
    let node = container.current
    if (!node) return // We don't have a DOM node (yet)
    if (!mounted.current) return // We've not been mounted yet so we can't transition

    d.add(transition(node, classes.current, machine.state[0] === 'entering', (reason) => {
      match(reason, {
        [TransitionDoneReason.Ended]: () => machine.send('stop'),
        [TransitionDoneReason.Cancelled]: () => machine.send('cancel'),
      })
    }))
  }

  // Start/Cancel the transition process when the direction changes
  useIsoMorphicEffect(() => {
    let node = container.current
    if (!node) return // We don't have a DOM node (yet)
    if (!mounted.current) return // We've not been mounted yet so we can't transition
    if (machine.state[0] !== 'idle') return // We're already transitioning

    d.dispose()

    match(latestDirection.current, {
      idle: () => {
        machine.send('reset')
      },

      enter: () => {
        // d.add(() => machine.send('cancel'))
        machine.send('enter')
      },

      leave: () => {
        // d.add(() => machine.send('cancel'))
        machine.send('leave')
      },
    })

    return d.dispose
  }, [latestDirection.current, container.current, mounted.current, machine.state])

  // Start the transition itself when the entire tree is ready
  useIsoMorphicEffect(() => {
    match(machine.state[0], {
      idle: () => {},

      entering: () => match(machine.state[1], {
        idle: () => {},
        pending: () => {},
        ready: () => machine.send('start'),
        running: () => startTransition(),
        finished: () => {},
      }),

      leaving: () => match(machine.state[1], {
        idle: () => {},
        pending: () => {},
        ready: () => machine.send('start'),
        running: () => startTransition(),
        finished: () => {},
      }),

      done: () => {},
      cancelled: () => {},
    })
  }, [machine.state])
}
