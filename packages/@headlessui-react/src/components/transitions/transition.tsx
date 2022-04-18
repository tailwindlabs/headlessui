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
import { Props } from '../../types'
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
import { useId } from '../../hooks/use-id'
import { useIsMounted } from '../../hooks/use-is-mounted'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTransition } from '../../hooks/use-transition'

type ID = ReturnType<typeof useId>

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

type TransitionChildProps<TTag> = Props<TTag, TransitionChildRenderPropArg> &
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
  children: MutableRefObject<{ id: ID; state: TreeStates }[]>
  register: MutableRefObject<(id: ID) => () => void>
  unregister: MutableRefObject<(id: ID, strategy?: RenderStrategy) => void>
}

let NestingContext = createContext<NestingContextValues | null>(null)
NestingContext.displayName = 'NestingContext'

function hasChildren(
  bag: NestingContextValues['children'] | { children: NestingContextValues['children'] }
): boolean {
  if ('children' in bag) return hasChildren(bag.children)
  return bag.current.filter(({ state }) => state === TreeStates.Visible).length > 0
}

function useNesting(done?: () => void) {
  let doneRef = useLatestValue(done)
  let transitionableChildren = useRef<NestingContextValues['children']['current']>([])
  let mounted = useIsMounted()

  let unregister = useLatestValue((childId: ID, strategy = RenderStrategy.Hidden) => {
    let idx = transitionableChildren.current.findIndex(({ id }) => id === childId)
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

  let register = useLatestValue((childId: ID) => {
    let child = transitionableChildren.current.find(({ id }) => id === childId)
    if (!child) {
      transitionableChildren.current.push({ id: childId, state: TreeStates.Visible })
    } else if (child.state !== TreeStates.Visible) {
      child.state = TreeStates.Visible
    }

    return () => unregister.current(childId, RenderStrategy.Unmount)
  })

  return useMemo(
    () => ({
      children: transitionableChildren,
      register,
      unregister,
    }),
    [register, unregister, transitionableChildren]
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
  let [state, setState] = useState(TreeStates.Visible)
  let strategy = rest.unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden

  let { show, appear, initial } = useTransitionContext()
  let { register, unregister } = useParentNesting()
  let prevShow = useRef<boolean | null>(null)

  let id = useId()

  let transitionInFlight = useRef(false)

  let nesting = useNesting(() => {
    // When all children have been unmounted we can only hide ourselves if and only if we are not
    // transitioning ourselves. Otherwise we would unmount before the transitions are finished.
    if (!transitionInFlight.current) {
      setState(TreeStates.Hidden)
      unregister.current(id)
    }
  })

  useEffect(() => {
    if (!id) return
    return register.current(id)
  }, [register, id])

  useEffect(() => {
    // If we are in another mode than the Hidden mode then ignore
    if (strategy !== RenderStrategy.Hidden) return
    if (!id) return

    // Make sure that we are visible
    if (show && state !== TreeStates.Visible) {
      setState(TreeStates.Visible)
      return
    }

    match(state, {
      [TreeStates.Hidden]: () => unregister.current(id),
      [TreeStates.Visible]: () => register.current(id),
    })
  }, [state, id, register, unregister, show, strategy])

  let classes = useLatestValue({
    enter: splitClasses(enter),
    enterFrom: splitClasses(enterFrom),
    enterTo: splitClasses(enterTo),
    entered: splitClasses(entered),
    leave: splitClasses(leave),
    leaveFrom: splitClasses(leaveFrom),
    leaveTo: splitClasses(leaveTo),
  })
  let events = useEvents({ beforeEnter, afterEnter, beforeLeave, afterLeave })

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
  })() as 'enter' | 'leave' | 'idle'

  useTransition({
    container,
    classes,
    events,
    direction: transitionDirection,
    onStart: useLatestValue(() => {}),
    onStop: useLatestValue((direction) => {
      if (direction === 'leave' && !hasChildren(nesting)) {
        // When we don't have children anymore we can safely unregister from the parent and hide
        // ourselves.
        setState(TreeStates.Hidden)
        unregister.current(id)
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
  let transitionRef = useSyncRefs(ref)

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

function Child<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionChildProps<TTag>
) {
  let hasTransitionContext = useContext(TransitionContext) !== null
  let hasOpenClosedContext = useOpenClosed() !== null

  return (
    <>
      {!hasTransitionContext && hasOpenClosedContext ? (
        <TransitionRoot {...props} />
      ) : (
        <TransitionChild {...props} />
      )}
    </>
  )
}

export let Transition = Object.assign(TransitionRoot, { Child, Root: TransitionRoot })
