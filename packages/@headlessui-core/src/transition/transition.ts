import { createDisposables, match, once } from '../utils/index'

interface TransitionClasses {
  enter: string[]
  enterFrom: string[]
  enterTo: string[]
  leave: string[]
  leaveFrom: string[]
  leaveTo: string[]

  // TODO: Remove in v2.0: exists for legacy backwards compatibility
  entered: string[]
}

export enum TransitionDoneReason {
  // Transition successfully ended
  Ended = 'ended',

  // Transition was cancelled
  Cancelled = 'cancelled',
}

function addClasses(node: HTMLElement, ...classes: string[]) {
  node && classes.length > 0 && node.classList.add(...classes)
}

function removeClasses(node: HTMLElement, ...classes: string[]) {
  node && classes.length > 0 && node.classList.remove(...classes)
}

export function transition(
  node: HTMLElement,
  classes: TransitionClasses,
  show: boolean,
  done?: (reason: TransitionDoneReason) => void
) {
  let direction = show ? 'enter' : 'leave'

  let d = createDisposables()

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

  console.log("transition.start", node.getAttribute('data-debug'), node.classList.toString())

  d.nextFrame(() => {
    removeClasses(node, ...from)
    addClasses(node, ...to)

    console.log("transition.nextFrame", node.getAttribute('data-debug'), node.classList.toString())

    d.add(
      waitForTransition(node, (reason) => {
        console.log("transition.wait.done", node.getAttribute('data-debug'), node.classList.toString())

        if (reason === TransitionDoneReason.Ended) {
          removeClasses(node, ...base)
          addClasses(node, ...classes.entered)
        }

        return done?.(reason)
      })
    )
  })

  return d.dispose
}

function waitForTransition(node: HTMLElement, done: (reason: TransitionDoneReason) => void) {
  let d = createDisposables()

  if (!node) {
    return d.dispose
  }

  let totalDuration = calculateTransitionDuration(node)

  if (totalDuration === 0) {
    // No transition is happening, so we should cleanup already.
    // Otherwise we have to wait until we get disposed.
    done(TransitionDoneReason.Ended)

    return d.dispose
  }

  done = once(done)

  // If we get disposed before the transition finishes, we should cleanup anyway.
  d.add(() => done(TransitionDoneReason.Cancelled))

  let group = d.group()

  group.addEventListener(node, 'transitionrun', (event) => {
    if (event.target !== event.currentTarget) return

    // Cleanup "old" listeners
    group.dispose()

    // Register new listeners
    group.addEventListener(node, 'transitionend', (event) => {
      if (event.target !== event.currentTarget) return

      done(TransitionDoneReason.Ended)
      group.dispose()
    })

    group.addEventListener(node, 'transitioncancel', (event) => {
      if (event.target !== event.currentTarget) return

      done(TransitionDoneReason.Cancelled)
      group.dispose()
    })
  })

  return d.dispose
}

function calculateTransitionDuration(node: HTMLElement) {
  let { transitionDuration, transitionDelay } = getComputedStyle(node)

  // Safari returns a comma separated list of values, so let's sort them and take the highest value.
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

  return durationMs + delayMs
}
