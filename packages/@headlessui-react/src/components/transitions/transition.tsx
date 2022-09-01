import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,

  // Types
  ElementType,
  MutableRefObject,
  Ref,
} from 'react'
import { Props, ReactTag } from '../../types'
import {
  Features,
  forwardRefWithAs,
  PropsForFeatures,
  render,
  RenderStrategy,
} from '../../utils/render'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { useIsMounted } from '../../hooks/use-is-mounted'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTransition } from '../../hooks/use-transition'
import { useEvent } from '../../hooks/use-event'

type ContainerElement = MutableRefObject<HTMLElement | null>

type TransitionDirection = 'enter' | 'leave' | 'idle'

function splitClasses(classes: string = '') {
  return classes.split(' ').filter((className) => className.trim().length > 1)
}

interface TransitionContextValues {
  show: boolean
  appear: boolean
  initial: boolean
}
let TransitionContext = createContext<TransitionContextValues | null>(null)
TransitionContext.displayName = 'TransitionContext'

enum TreeStates {
  Visible = 'visible',
  Hidden = 'hidden',
}

export interface TransitionClasses {
  enter?: string
  enterFrom?: string
  enterTo?: string
  entered?: string
  leave?: string
  leaveFrom?: string
  leaveTo?: string
}

export interface TransitionEvents {
  beforeEnter?: () => void
  afterEnter?: () => void
  beforeLeave?: () => void
  afterLeave?: () => void
}

type TransitionChildProps<TTag extends ReactTag> = Props<TTag, TransitionChildRenderPropArg> &
  PropsForFeatures<typeof TransitionChildRenderFeatures> &
  TransitionClasses &
  TransitionEvents & { appear?: boolean }

function useTransitionContext() {
  let context = useContext(TransitionContext)

  if (context === null) {
    throw new Error(
      'A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.'
    )
  }

  return context
}

function useParentNesting() {
  let context = useContext(NestingContext)

  if (context === null) {
    throw new Error(
      'A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.'
    )
  }

  return context
}

interface NestingContextValues {
  children: MutableRefObject<{ el: ContainerElement; state: TreeStates }[]>
  register: (el: ContainerElement) => () => void
  unregister: (el: ContainerElement, strategy?: RenderStrategy) => void
  onStart: (el: ContainerElement, direction: TransitionDirection, cb: () => void) => void
  onStop: (el: ContainerElement, direction: TransitionDirection, cb: () => void) => void
  chains: MutableRefObject<
    Record<TransitionDirection, [container: ContainerElement, promise: Promise<void>][]>
  >
  wait: MutableRefObject<Promise<void>>
}

let NestingContext = createContext<NestingContextValues | null>(null)
NestingContext.displayName = 'NestingContext'

function hasChildren(
  bag: NestingContextValues['children'] | { children: NestingContextValues['children'] }
): boolean {
  if ('children' in bag) return hasChildren(bag.children)
  return (
    bag.current
      .filter(({ el }) => el.current !== null)
      .filter(({ state }) => state === TreeStates.Visible).length > 0
  )
}

function useNesting(done?: () => void, parent?: NestingContextValues) {
  let doneRef = useLatestValue(done)
  let transitionableChildren = useRef<NestingContextValues['children']['current']>([])
  let mounted = useIsMounted()

  let unregister = useEvent((container: ContainerElement, strategy = RenderStrategy.Hidden) => {
    let idx = transitionableChildren.current.findIndex(({ el }) => el === container)
    if (idx === -1) return

    match(strategy, {
      [RenderStrategy.Unmount]() {
        transitionableChildren.current.splice(idx, 1)
      },
      [RenderStrategy.Hidden]() {
        transitionableChildren.current[idx].state = TreeStates.Hidden
      },
    })

    microTask(() => {
      if (!hasChildren(transitionableChildren) && mounted.current) {
        doneRef.current?.()
      }
    })
  })

  let register = useEvent((container: ContainerElement) => {
    let child = transitionableChildren.current.find(({ el }) => el === container)
    if (!child) {
      transitionableChildren.current.push({ el: container, state: TreeStates.Visible })
    } else if (child.state !== TreeStates.Visible) {
      child.state = TreeStates.Visible
    }

    return () => unregister(container, RenderStrategy.Unmount)
  })

  let todos = useRef<(() => void)[]>([])
  let wait = useRef<Promise<void>>(Promise.resolve())

  let chains = useRef<
    Record<TransitionDirection, [identifier: ContainerElement, promise: Promise<void>][]>
  >({
    enter: [],
    leave: [],
    idle: [],
  })

  let onStart = useEvent(
    (
      container: ContainerElement,
      direction: TransitionDirection,
      cb: (direction: TransitionDirection) => void
    ) => {
      // Clear out all existing todos
      todos.current.splice(0)

      // Remove all existing promises for the current container from the parent because we can
      // ignore those and use only the new one.
      if (parent) {
        parent.chains.current[direction] = parent.chains.current[direction].filter(
          ([containerInParent]) => containerInParent !== container
        )
      }

      // Wait until our own transition is done
      parent?.chains.current[direction].push([
        container,
        new Promise<void>((resolve) => {
          todos.current.push(resolve)
        }),
      ])

      // Wait until our children are done
      parent?.chains.current[direction].push([
        container,
        new Promise<void>((resolve) => {
          Promise.all(chains.current[direction].map(([_container, promise]) => promise)).then(() =>
            resolve()
          )
        }),
      ])

      if (direction === 'enter') {
        wait.current = wait.current.then(() => parent?.wait.current).then(() => cb(direction))
      } else {
        cb(direction)
      }
    }
  )

  let onStop = useEvent(
    (
      _container: ContainerElement,
      direction: TransitionDirection,
      cb: (direction: TransitionDirection) => void
    ) => {
      Promise.all(chains.current[direction].splice(0).map(([_container, promise]) => promise)) // Wait for my children
        .then(() => {
          todos.current.shift()?.() // I'm ready
        })
        .then(() => cb(direction))
    }
  )

  return useMemo(
    () => ({
      children: transitionableChildren,
      register,
      unregister,
      onStart,
      onStop,
      wait,
      chains,
    }),
    [register, unregister, transitionableChildren, onStart, onStop, chains, wait]
  )
}

function noop() {}
let eventNames = ['beforeEnter', 'afterEnter', 'beforeLeave', 'afterLeave'] as const
function ensureEventHooksExist(events: TransitionEvents) {
  let result = {} as Record<keyof typeof events, () => void>
  for (let name of eventNames) {
    result[name] = events[name] ?? noop
  }
  return result
}

function useEvents(events: TransitionEvents) {
  let eventsRef = useRef(ensureEventHooksExist(events))

  useEffect(() => {
    eventsRef.current = ensureEventHooksExist(events)
  }, [events])

  return eventsRef
}

// ---

let DEFAULT_TRANSITION_CHILD_TAG = 'div' as const
type TransitionChildRenderPropArg = MutableRefObject<HTMLDivElement>
let TransitionChildRenderFeatures = Features.RenderStrategy

let TransitionChild = forwardRefWithAs(function TransitionChild<
  TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG
>(props: TransitionChildProps<TTag>, ref: Ref<HTMLElement>) {
  let {
    // Event "handlers"
    beforeEnter,
    afterEnter,
    beforeLeave,
    afterLeave,

    // Class names
    enter,
    enterFrom,
    enterTo,
    entered,
    leave,
    leaveFrom,
    leaveTo,

    // @ts-expect-error
    ...rest
  } = props as typeof props
  let container = useRef<HTMLElement | null>(null)
  let transitionRef = useSyncRefs(container, ref)
  let strategy = rest.unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden

  let { show, appear, initial } = useTransitionContext()

  let [state, setState] = useState(show ? TreeStates.Visible : TreeStates.Hidden)

  let parentNesting = useParentNesting()
  let { register, unregister } = parentNesting
  let prevShow = useRef<boolean | null>(null)

  useEffect(() => register(container), [register, container])

  useEffect(() => {
    // If we are in another mode than the Hidden mode then ignore
    if (strategy !== RenderStrategy.Hidden) return
    if (!container.current) return

    // Make sure that we are visible
    if (show && state !== TreeStates.Visible) {
      setState(TreeStates.Visible)
      return
    }

    return match(state, {
      [TreeStates.Hidden]: () => unregister(container),
      [TreeStates.Visible]: () => register(container),
    })
  }, [state, container, register, unregister, show, strategy])

  let classes = useLatestValue({
    enter: splitClasses(enter),
    enterFrom: splitClasses(enterFrom),
    enterTo: splitClasses(enterTo),
    entered: splitClasses(entered),
    leave: splitClasses(leave),
    leaveFrom: splitClasses(leaveFrom),
    leaveTo: splitClasses(leaveTo),
  })

  let events = useEvents({
    beforeEnter,
    afterEnter,
    beforeLeave,
    afterLeave,
  })

  let ready = useServerHandoffComplete()

  useEffect(() => {
    if (ready && state === TreeStates.Visible && container.current === null) {
      throw new Error('Did you forget to passthrough the `ref` to the actual DOM node?')
    }
  }, [container, state, ready])

  // Skipping initial transition
  let skip = initial && !appear

  let transitionDirection = (() => {
    if (!ready) return 'idle'
    if (skip) return 'idle'
    if (prevShow.current === show) return 'idle'
    return show ? 'enter' : 'leave'
  })() as TransitionDirection

  let beforeEvent = useEvent((direction: TransitionDirection) => {
    return match(direction, {
      enter: () => events.current.beforeEnter(),
      leave: () => events.current.beforeLeave(),
      idle: () => {},
    })
  })

  let afterEvent = useEvent((direction: TransitionDirection) => {
    return match(direction, {
      enter: () => events.current.afterEnter(),
      leave: () => events.current.afterLeave(),
      idle: () => {},
    })
  })

  let nesting = useNesting(() => {
    // When all children have been unmounted we can only hide ourselves if and only if we are not
    // transitioning ourselves. Otherwise we would unmount before the transitions are finished.
    setState(TreeStates.Hidden)
    unregister(container)
  }, parentNesting)

  useTransition({
    container,
    classes,
    direction: transitionDirection,
    onStart: useLatestValue((direction) => {
      nesting.onStart(container, direction, beforeEvent)
    }),
    onStop: useLatestValue((direction) => {
      nesting.onStop(container, direction, afterEvent)

      if (direction === 'leave' && !hasChildren(nesting)) {
        // When we don't have children anymore we can safely unregister from the parent and hide
        // ourselves.
        setState(TreeStates.Hidden)
        unregister(container)
      }
    }),
  })

  useEffect(() => {
    if (!skip) return

    if (strategy === RenderStrategy.Hidden) {
      prevShow.current = null
    } else {
      prevShow.current = show
    }
  }, [show, skip, state])

  let theirProps = rest
  let ourProps = { ref: transitionRef }

  return (
    <NestingContext.Provider value={nesting}>
      <OpenClosedProvider
        value={match(state, {
          [TreeStates.Visible]: State.Open,
          [TreeStates.Hidden]: State.Closed,
        })}
      >
        {render({
          ourProps,
          theirProps,
          defaultTag: DEFAULT_TRANSITION_CHILD_TAG,
          features: TransitionChildRenderFeatures,
          visible: state === TreeStates.Visible,
          name: 'Transition.Child',
        })}
      </OpenClosedProvider>
    </NestingContext.Provider>
  )
})

let TransitionRoot = forwardRefWithAs(function Transition<
  TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG
>(props: TransitionChildProps<TTag> & { show?: boolean; appear?: boolean }, ref: Ref<HTMLElement>) {
  // @ts-expect-error
  let { show, appear = false, unmount, ...theirProps } = props as typeof props
  let internalTransitionRef = useRef<HTMLElement | null>(null)
  let transitionRef = useSyncRefs(internalTransitionRef, ref)

  // The TransitionChild will also call this hook, and we have to make sure that we are ready.
  useServerHandoffComplete()

  let usesOpenClosedState = useOpenClosed()

  if (show === undefined && usesOpenClosedState !== null) {
    show = match(usesOpenClosedState, {
      [State.Open]: true,
      [State.Closed]: false,
    })
  }

  if (![true, false].includes(show as unknown as boolean)) {
    throw new Error('A <Transition /> is used but it is missing a `show={true | false}` prop.')
  }

  let [state, setState] = useState(show ? TreeStates.Visible : TreeStates.Hidden)

  let nestingBag = useNesting(() => {
    setState(TreeStates.Hidden)
  })

  let [initial, setInitial] = useState(true)

  // Change the `initial` value
  let changes = useRef([show])
  useIsoMorphicEffect(() => {
    // We can skip this effect
    if (initial === false) {
      return
    }

    // Track the changes
    if (changes.current[changes.current.length - 1] !== show) {
      changes.current.push(show)
      setInitial(false)
    }
  }, [changes, show])

  let transitionBag = useMemo<TransitionContextValues>(
    () => ({ show: show as boolean, appear, initial }),
    [show, appear, initial]
  )

  useEffect(() => {
    if (show) {
      setState(TreeStates.Visible)
    } else if (!hasChildren(nestingBag)) {
      setState(TreeStates.Hidden)
    } else if (
      process.env.NODE_ENV !==
      'test' /* TODO: Remove this once we have real tests! JSDOM doesn't "render", therefore getBoundingClientRect() will always result in `0`. */
    ) {
      let node = internalTransitionRef.current
      if (!node) return
      let rect = node.getBoundingClientRect()

      if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
        // The node is completely hidden, let's hide it
        setState(TreeStates.Hidden)
      }
    }
  }, [show, nestingBag])

  let sharedProps = { unmount }

  return (
    <NestingContext.Provider value={nestingBag}>
      <TransitionContext.Provider value={transitionBag}>
        {render({
          ourProps: {
            ...sharedProps,
            as: Fragment,
            children: <TransitionChild ref={transitionRef} {...sharedProps} {...theirProps} />,
          },
          theirProps: {},
          defaultTag: Fragment,
          features: TransitionChildRenderFeatures,
          visible: state === TreeStates.Visible,
          name: 'Transition',
        })}
      </TransitionContext.Provider>
    </NestingContext.Provider>
  )
})

let Child = forwardRefWithAs(function Child<
  TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG
>(props: TransitionChildProps<TTag>, ref: MutableRefObject<HTMLElement>) {
  let hasTransitionContext = useContext(TransitionContext) !== null
  let hasOpenClosedContext = useOpenClosed() !== null

  return (
    <>
      {!hasTransitionContext && hasOpenClosedContext ? (
        <TransitionRoot ref={ref} {...props} />
      ) : (
        <TransitionChild ref={ref} {...props} />
      )}
    </>
  )
})

export let Transition = Object.assign(TransitionRoot, { Child, Root: TransitionRoot })
