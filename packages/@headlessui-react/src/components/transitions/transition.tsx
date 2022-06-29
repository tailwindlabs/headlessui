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
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTransition } from '../../hooks/use-transition'
import { useEvent } from '../../hooks/use-event'
import { TransitionMachine } from './state'
import { useTransitionMachine } from './use-transition-machine'

type TransitionDirection = 'enter' | 'leave' | 'idle'

// ---

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
  children: MutableRefObject<
    { id: ID; state: TreeStates; nesting: MutableRefObject<NestingContextValues> }[]
  >
  register: (id: ID, nesting: MutableRefObject<NestingContextValues>) => () => void
  unregister: (id: ID, strategy?: RenderStrategy) => void

  machine: TransitionMachine

  prepare(before: () => void, after: () => void): void
  reset(): void
  start(direction: TransitionDirection): void
  stop(direction: TransitionDirection): void
  cancel(direction: TransitionDirection): void
}

let NestingContext = createContext<MutableRefObject<NestingContextValues> | null>(null)
NestingContext.displayName = 'NestingContext'

function hasChildren(
  bag: NestingContextValues['children'] | { children: NestingContextValues['children'] }
): boolean {
  if ('children' in bag) return hasChildren(bag.children)
  return bag.current.filter(({ state }) => state === TreeStates.Visible).length > 0
}

function useNesting(
  root = false,
  parent?: MutableRefObject<NestingContextValues>,
  id?: string
): MutableRefObject<NestingContextValues> {
  type TransitionAction = () => void

  let transitionableChildren = useRef<NestingContextValues['children']['current']>([])

  let onStartCallback = useRef<TransitionAction>()
  let onStopCallback = useRef<TransitionAction>()

  // The state machine for the current transition
  let machine = useTransitionMachine(id ?? 'unnamed', () => ({
    onStart: () => {
      onStartCallback.current?.()
    },

    onStop: () => {
      onStopCallback.current?.()

      if (root) {
        machine.send('reset')
      }
    },

    onEvent: (event) => {
      console.log('[%s] Transition event', machine.id, event)
    },

    onChange(prev, current) {
      console.log('[%s] Transition state change', machine.id, { prev, current })
    },
  }))

  // Link the current transition to its parent
  useIsoMorphicEffect(() => {
    parent?.current?.machine?.add(machine)

    return () => {
      parent?.current?.machine?.remove(machine)
    }
  }, [parent])

  let unregister = useEvent((childId: ID, strategy = RenderStrategy.Hidden) => {
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
  })

  let register = useEvent((childId: ID, nesting: MutableRefObject<NestingContextValues>) => {
    let child = transitionableChildren.current.find(({ id }) => id === childId)
    if (!child) {
      transitionableChildren.current.push({
        id: childId,
        state: TreeStates.Visible,
        nesting,
      })
    } else if (child.state !== TreeStates.Visible) {
      child.nesting = nesting
      child.state = TreeStates.Visible
    }

    return () => unregister(childId, RenderStrategy.Unmount)
  })

  let reset = useEvent(() => machine.send('reset'))

  let prepare = useEvent((before: TransitionAction, after: TransitionAction) => {
    onStartCallback.current = before
    onStopCallback.current = after
  })

  let start = useEvent((direction: TransitionDirection) => {
    match(direction, {
      enter: () => machine.send('enter'),
      leave: () => machine.send('leave'),
      idle: () => {},
    })

    machine.send('start')
  })

  let stop = useEvent((_: TransitionDirection) => {
    machine.send('stop')
  })

  let cancel = useEvent((_: TransitionDirection) => {
    machine.send('cancel')
  })

  return useLatestValue({
    children: transitionableChildren,
    register,
    unregister,
    machine,
    reset,
    prepare,
    start,
    stop,
    cancel,
  })
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

  let parentNesting = useParentNesting()
  let nesting = useNesting(false, parentNesting, props['data-debug'])
  let prevShow = useRef<boolean | null>(null)

  let id = useId()

  useIsoMorphicEffect(() => {
    if (!id) return
    return parentNesting.current.register(id, nesting)
  }, [parentNesting, id, nesting])

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
      [TreeStates.Hidden]: () => parentNesting.current.unregister(id),
      [TreeStates.Visible]: () => parentNesting.current.register(id, nesting),
    })
  }, [state, id, parentNesting, show, strategy, nesting])

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
      leave: () => {
        setState(TreeStates.Hidden)
        parentNesting.current.unregister(id)
        return events.current.afterLeave()
      },
      idle: () => {},
    })
  })

  useTransition({
    container,
    classes,
    direction: transitionDirection,
    onStart: useLatestValue((direction) => {
      nesting.current.prepare(
        () => beforeEvent(direction),
        () => afterEvent(direction)
      )
      nesting.current.start(direction)
    }),
    onStop: useLatestValue((direction) => {
      nesting.current.stop(direction)
    }),
    onCancel: useLatestValue((direction) => {
      nesting.current.cancel(direction)
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

  let nestingBag = useNesting(true, undefined, props['data-debug'])

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
    } else if (!hasChildren(nestingBag.current)) {
      setState(TreeStates.Hidden)
    } else {
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
