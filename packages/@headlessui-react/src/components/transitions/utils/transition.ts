import { once } from '../../../utils/once'
import { disposables } from '../../../utils/disposables'
import { match } from '../../../utils/match'

function addClasses(node: HTMLElement, ...classes: string[]) {
  node && classes.length > 0 && node.classList.add(...classes)
}

function removeClasses(node: HTMLElement, ...classes: string[]) {
  node && classes.length > 0 && node.classList.remove(...classes)
}

export enum Reason {
  // Transition succesfully ended
  Ended = 'ended',

  // Transition was cancelled
  Cancelled = 'cancelled',
}

function waitForTransition(node: HTMLElement, done: (reason: Reason) => void) {
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
    let listeners: (() => void)[] = []

    if (process.env.NODE_ENV === 'test') {
      listeners.push(
        d.setTimeout(() => {
          done(Reason.Ended)
          listeners.splice(0).forEach((dispose) => dispose())
        }, totalDuration)
      )
    } else {
      listeners.push(
        d.addEventListener(
          node,
          'transitionrun',
          () => {
            // Cleanup "old" listeners
            listeners.splice(0).forEach((dispose) => dispose())

            // Register new listeners
            listeners.push(
              d.addEventListener(
                node,
                'transitionend',
                () => {
                  done(Reason.Ended)
                  listeners.splice(0).forEach((dispose) => dispose())
                },
                { once: true }
              ),
              d.addEventListener(
                node,
                'transitioncancel',
                () => {
                  done(Reason.Cancelled)
                  listeners.splice(0).forEach((dispose) => dispose())
                },
                { once: true }
              )
            )
          },
          { once: true }
        )
      )
    }
  } else {
    // No transition is happening, so we should cleanup already. Otherwise we have to wait until we
    // get disposed.
    done(Reason.Ended)
  }

  // If we get disposed before the transition finishes, we should cleanup anyway.
  d.add(() => done(Reason.Cancelled))

  return d.dispose
}

export function transition(
  node: HTMLElement,
  classes: {
    enter: string[]
    enterFrom: string[]
    enterTo: string[]
    leave: string[]
    leaveFrom: string[]
    leaveTo: string[]
    entered: string[]
  },
  show: boolean,
  done?: (reason: Reason) => void
) {
  let direction = show ? 'enter' : 'leave'
  let d = disposables()
  let _done = done !== undefined ? once(done) : () => {}

  let base = match(direction, {
    enter: () => classes.enter,
    leave: () => classes.leave,
  })
  let to = match(direction, {
    enter: () => classes.enterTo,
    leave: () => classes.leaveTo,
  })
  let from = match(direction, {
    enter: () => classes.enterFrom,
    leave: () => classes.leaveFrom,
  })

  removeClasses(
    node,
    ...classes.enter,
    ...classes.enterTo,
    ...classes.enterFrom,
    ...classes.leave,
    ...classes.leaveFrom,
    ...classes.leaveTo,
    ...classes.entered
  )
  addClasses(node, ...base, ...from)

  d.nextFrame(() => {
    removeClasses(node, ...from)
    addClasses(node, ...to)

    waitForTransition(node, (reason) => {
      if (reason === Reason.Ended) {
        removeClasses(node, ...base)
        addClasses(node, ...classes.entered)
      }

      return _done(reason)
    })
  })

  return d.dispose
}
