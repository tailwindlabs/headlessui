import * as React from 'react'

import { useId } from '../../hooks/use-id'
import { useIsInitialRender } from '../../hooks/use-is-initial-render'
import { useIsMounted } from '../../hooks/use-is-mounted'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'

import { match } from '../../utils/match'
import { Reason, transition } from './utils/transition'

type ID = ReturnType<typeof useId>

function useSplitClasses(classes: string = '') {
  return React.useMemo(() => classes.split(' ').filter(className => className.trim().length > 1), [
    classes,
  ])
}

type TransitionContextValues = {
  show: boolean
  appear: boolean
} | null
const TransitionContext = React.createContext<TransitionContextValues>(null)

enum TreeStates {
  Visible = 'visible',
  Hidden = 'hidden',
}

export type TransitionClasses = Partial<{
  enter: string
  enterFrom: string
  enterTo: string
  leave: string
  leaveFrom: string
  leaveTo: string
}>

export type TransitionEvents = Partial<{
  beforeEnter(): void
  afterEnter(): void
  beforeLeave(): void
  afterLeave(): void
}>

type HTMLTags = keyof JSX.IntrinsicElements
type HTMLTagProps<TTag extends HTMLTags> = JSX.IntrinsicElements[TTag]

type AsShortcut<TTag extends HTMLTags> = {
  children?: React.ReactNode
  as?: TTag
} & Omit<HTMLTagProps<TTag>, 'ref'>

type AsRenderPropFunction = {
  children: (ref: React.MutableRefObject<any>) => JSX.Element
}

type BaseConfig = Partial<{ appear: boolean }>

type TransitionChildProps<TTag extends HTMLTags> = BaseConfig &
  (AsShortcut<TTag> | AsRenderPropFunction) &
  TransitionClasses &
  TransitionEvents

function useTransitionContext() {
  const context = React.useContext(TransitionContext)

  if (context === null) {
    throw new Error('A <Transition.Child /> is used but it is missing a parent <Transition />.')
  }

  return context
}

function useParentNesting() {
  const context = React.useContext(NestingContext)

  if (context === null) {
    throw new Error('A <Transition.Child /> is used but it is missing a parent <Transition />.')
  }

  return context
}

type NestingContextValues = {
  children: React.MutableRefObject<ID[]>
  register: (id: ID) => () => void
  unregister: (id: ID) => void
}

const NestingContext = React.createContext<NestingContextValues | null>(null)

function useNesting(done?: () => void) {
  const doneRef = React.useRef(done)
  const transitionableChildren = React.useRef<ID[]>([])
  const mounted = useIsMounted()

  React.useEffect(() => {
    doneRef.current = done
  }, [done])

  const unregister = React.useCallback(
    (childId: ID) => {
      const idx = transitionableChildren.current.indexOf(childId)

      if (idx === -1) return

      transitionableChildren.current.splice(idx, 1)

      if (transitionableChildren.current.length <= 0 && mounted.current) {
        doneRef.current?.()
      }
    },
    [doneRef, mounted, transitionableChildren]
  )

  const register = React.useCallback(
    (childId: ID) => {
      transitionableChildren.current.push(childId)
      return () => unregister(childId)
    },
    [transitionableChildren, unregister]
  )

  return React.useMemo(
    () => ({
      children: transitionableChildren,
      register,
      unregister,
    }),
    [register, unregister, transitionableChildren]
  )
}

function noop() {}
const eventNames: (keyof TransitionEvents)[] = [
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
  const eventsRef = React.useRef(ensureEventHooksExist(events))

  React.useEffect(() => {
    eventsRef.current = ensureEventHooksExist(events)
  }, [events])

  return eventsRef
}

function TransitionChild<TTag extends HTMLTags = 'div'>(props: TransitionChildProps<TTag>) {
  const {
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

    // ..
    children,
    ...rest
  } = props
  const container = React.useRef<HTMLElement | null>(null)
  const [state, setState] = React.useState(TreeStates.Visible)

  const { show, appear } = useTransitionContext()
  const { register, unregister } = useParentNesting()

  const initial = useIsInitialRender()
  const id = useId()

  const isTransitioning = React.useRef(false)

  const nesting = useNesting(() => {
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

  const enterClasses = useSplitClasses(enter)
  const enterFromClasses = useSplitClasses(enterFrom)
  const enterToClasses = useSplitClasses(enterTo)

  const leaveClasses = useSplitClasses(leave)
  const leaveFromClasses = useSplitClasses(leaveFrom)
  const leaveToClasses = useSplitClasses(leaveTo)

  const events = useEvents({ beforeEnter, afterEnter, beforeLeave, afterLeave })

  React.useEffect(() => {
    if (state === TreeStates.Visible && container.current === null) {
      throw new Error('Did you forget to passthrough the `ref` to the actual DOM node?')
    }
  }, [container, state])

  // Skipping initial transition
  const skip = initial && !appear

  useIsoMorphicEffect(() => {
    const node = container.current
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
          if (nesting.children.current.length <= 0) {
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

  // Unmount the whole tree
  if (state === TreeStates.Hidden) return null

  if (typeof children === 'function') {
    return (
      <NestingContext.Provider value={nesting}>
        {(children as AsRenderPropFunction['children'])(container)}
      </NestingContext.Provider>
    )
  }

  const { as: Component = 'div', ...passthroughProps } = rest as AsShortcut<TTag>
  return (
    <NestingContext.Provider value={nesting}>
      {/* @ts-expect-error Expression produces a union type that is too complex to represent. */}
      <Component {...passthroughProps} ref={container}>
        {children}
      </Component>
    </NestingContext.Provider>
  )
}

export function Transition<TTag extends HTMLTags = 'div'>(
  props: TransitionChildProps<TTag> & { show: boolean; appear?: boolean }
) {
  const { show, appear = false, ...rest } = props

  if (![true, false].includes(show)) {
    throw new Error('A <Transition /> is used but it is missing a `show={true | false}` prop.')
  }

  const [state, setState] = React.useState(show ? TreeStates.Visible : TreeStates.Hidden)

  const nestingBag = useNesting(() => {
    setState(TreeStates.Hidden)
  })

  const initial = useIsInitialRender()
  const transitionBag = React.useMemo<TransitionContextValues>(
    () => ({ show, appear: appear || !initial }),
    [show, appear, initial]
  )

  React.useEffect(() => {
    if (show) {
      setState(TreeStates.Visible)
    } else if (nestingBag.children.current.length <= 0) {
      setState(TreeStates.Hidden)
    }
  }, [show, nestingBag])

  return (
    <NestingContext.Provider value={nestingBag}>
      <TransitionContext.Provider value={transitionBag}>
        {match(state, {
          [TreeStates.Visible]: () => <TransitionChild {...rest} />,
          [TreeStates.Hidden]: null,
        })}
      </TransitionContext.Provider>
    </NestingContext.Provider>
  )
}

Transition.Child = TransitionChild
