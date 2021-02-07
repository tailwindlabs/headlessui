import React, {
  useMemo,
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
  Fragment,

  // Types
  ElementType,
  MutableRefObject,
} from 'react'
import { Props, Expand } from '../../types'

import { useId } from '../../hooks/use-id'
import { useIsInitialRender } from '../../hooks/use-is-initial-render'
import { match } from '../../utils/match'
import { useIsMounted } from '../../hooks/use-is-mounted'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'

import { Features, PropsForFeatures, render, RenderStrategy } from '../../utils/render'
import { Reason, transition } from './utils/transition'

type ID = ReturnType<typeof useId>

function useSplitClasses(classes: string = '') {
  return useMemo(() => classes.split(' ').filter(className => className.trim().length > 1), [
    classes,
  ])
}

interface TransitionContextValues {
  show: boolean
  appear: boolean
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
    throw new Error('A <Transition.Child /> is used but it is missing a parent <Transition />.')
  }

  return context
}

function useParentNesting() {
  let context = useContext(NestingContext)

  if (context === null) {
    throw new Error('A <Transition.Child /> is used but it is missing a parent <Transition />.')
  }

  return context
}

interface NestingContextValues {
  children: MutableRefObject<{ id: ID; state: TreeStates }[]>
  register: (id: ID) => () => void
  unregister: (id: ID, strategy?: RenderStrategy) => void
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
  let doneRef = useRef(done)
  let transitionableChildren = useRef<NestingContextValues['children']['current']>([])
  let mounted = useIsMounted()

  useEffect(() => {
    doneRef.current = done
  }, [done])

  let unregister = useCallback(
    (childId: ID, strategy = RenderStrategy.Hidden) => {
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

      if (!hasChildren(transitionableChildren) && mounted.current) {
        doneRef.current?.()
      }
    },
    [doneRef, mounted, transitionableChildren]
  )

  let register = useCallback(
    (childId: ID) => {
      let child = transitionableChildren.current.find(({ id }) => id === childId)
      if (!child) {
        transitionableChildren.current.push({ id: childId, state: TreeStates.Visible })
      } else if (child.state !== TreeStates.Visible) {
        child.state = TreeStates.Visible
      }

      return () => unregister(childId, RenderStrategy.Unmount)
    },
    [transitionableChildren, unregister]
  )

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
let eventNames: (keyof TransitionEvents)[] = [
  'beforeEnter',
  'afterEnter',
  'beforeLeave',
  'afterLeave',
]
function ensureEventHooksExist(events: TransitionEvents) {
  return eventNames.reduce((all, eventName) => {
    all[eventName] = events[eventName] || noop
    return all
  }, {} as Record<keyof TransitionEvents, () => void>)
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

function TransitionChild<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionChildProps<TTag>
) {
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
    leave,
    leaveFrom,
    leaveTo,
    ...rest
  } = props as Expand<typeof props>
  let container = useRef<HTMLElement | null>(null)
  let [state, setState] = useState(TreeStates.Visible)
  let strategy = rest.unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden

  let { show, appear } = useTransitionContext()
  let { register, unregister } = useParentNesting()

  let initial = useIsInitialRender()
  let id = useId()

  let isTransitioning = useRef(false)

  let nesting = useNesting(() => {
    // When all children have been unmounted we can only hide ourselves if and only if we are not
    // transitioning ourserlves. Otherwise we would unmount before the transitions are finished.
    if (!isTransitioning.current) {
      setState(TreeStates.Hidden)
      unregister(id)
      events.current.afterLeave()
    }
  })

  useIsoMorphicEffect(() => {
    if (!id) return
    return register(id)
  }, [register, id])

  useIsoMorphicEffect(() => {
    // If we are in another mode than the Hidden mode then ignore
    if (strategy !== RenderStrategy.Hidden) return
    if (!id) return

    // Make sure that we are visible
    if (show && state !== TreeStates.Visible) {
      setState(TreeStates.Visible)
      return
    }

    match(state, {
      [TreeStates.Hidden]: () => unregister(id),
      [TreeStates.Visible]: () => register(id),
    })
  }, [state, id, register, unregister, show, strategy])

  let enterClasses = useSplitClasses(enter)
  let enterFromClasses = useSplitClasses(enterFrom)
  let enterToClasses = useSplitClasses(enterTo)

  let leaveClasses = useSplitClasses(leave)
  let leaveFromClasses = useSplitClasses(leaveFrom)
  let leaveToClasses = useSplitClasses(leaveTo)

  let events = useEvents({ beforeEnter, afterEnter, beforeLeave, afterLeave })

  useEffect(() => {
    if (state === TreeStates.Visible && container.current === null) {
      throw new Error('Did you forget to passthrough the `ref` to the actual DOM node?')
    }
  }, [container, state])

  // Skipping initial transition
  let skip = initial && !appear

  useIsoMorphicEffect(() => {
    let node = container.current
    if (!node) return
    if (skip) return

    isTransitioning.current = true

    if (show) events.current.beforeEnter()
    if (!show) events.current.beforeLeave()

    return show
      ? transition(node, enterClasses, enterFromClasses, enterToClasses, reason => {
          isTransitioning.current = false
          if (reason === Reason.Finished) events.current.afterEnter()
        })
      : transition(node, leaveClasses, leaveFromClasses, leaveToClasses, reason => {
          isTransitioning.current = false

          if (reason !== Reason.Finished) return

          // When we don't have children anymore we can safely unregister from the parent and hide
          // ourselves.
          if (!hasChildren(nesting)) {
            setState(TreeStates.Hidden)
            unregister(id)
            events.current.afterLeave()
          }
        })
  }, [
    events,
    id,
    isTransitioning,
    unregister,
    nesting,
    container,
    skip,
    show,
    enterClasses,
    enterFromClasses,
    enterToClasses,
    leaveClasses,
    leaveFromClasses,
    leaveToClasses,
  ])

  let propsBag = {}
  let propsWeControl = { ref: container }
  let passthroughProps = rest

  return (
    <NestingContext.Provider value={nesting}>
      {render(
        { ...passthroughProps, ...propsWeControl },
        propsBag,
        DEFAULT_TRANSITION_CHILD_TAG,
        TransitionChildRenderFeatures,
        state === TreeStates.Visible
      )}
    </NestingContext.Provider>
  )
}

export function Transition<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionChildProps<TTag> & { show: boolean; appear?: boolean }
) {
  let { show, appear = false, unmount, ...passthroughProps } = props as Expand<typeof props>

  if (![true, false].includes(show)) {
    throw new Error('A <Transition /> is used but it is missing a `show={true | false}` prop.')
  }

  let [state, setState] = useState(show ? TreeStates.Visible : TreeStates.Hidden)

  let nestingBag = useNesting(() => {
    setState(TreeStates.Hidden)
  })

  let initial = useIsInitialRender()
  let transitionBag = useMemo<TransitionContextValues>(
    () => ({ show, appear: appear || !initial }),
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
  let propsBag = {}

  return (
    <NestingContext.Provider value={nestingBag}>
      <TransitionContext.Provider value={transitionBag}>
        {render(
          {
            ...sharedProps,
            as: Fragment,
            children: <TransitionChild {...sharedProps} {...passthroughProps} />,
          },
          propsBag,
          Fragment,
          TransitionChildRenderFeatures,
          state === TreeStates.Visible
        )}
      </TransitionContext.Provider>
    </NestingContext.Provider>
  )
}

Transition.Child = TransitionChild
