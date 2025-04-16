'use client'

import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type MutableRefObject,
  type Ref,
} from 'react'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useIsMounted } from '../../hooks/use-is-mounted'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { transitionDataAttributes, useTransition } from '../../hooks/use-transition'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import type { Props, ReactTag } from '../../types'
import { classNames } from '../../utils/class-names'
import { match } from '../../utils/match'
import {
  RenderFeatures,
  RenderStrategy,
  compact,
  forwardRefWithAs,
  useRender,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'

type ContainerElement = MutableRefObject<HTMLElement | null>

type TransitionDirection = 'enter' | 'leave'

/**
 * Check if we should forward the ref to the child element or not. This is to
 * prevent crashes when the `as` prop is a Fragment _and_ the component just acts
 * as a state container (aka, there is no actual transition happening).
 *
 * E.g.:
 *
 * ```tsx
 * <Transition show={true}>
 *   <Transition.Child enter="duration-100"><div>Child 1</div></Transition.Child>
 *   <Transition.Child enter="duration-200"><div>Child 2</div></Transition.Child>
 * </Transition>
 * ```
 *
 * In this scenario, the child components are transitioning, but the
 * `Transition` parent, which is a `Fragment`, is not. So we should not forward
 * the ref to the `Fragment`.
 */
function shouldForwardRef<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionRootProps<TTag>
) {
  return (
    // If we have any of the enter/leave classes
    Boolean(
      props.enter ||
        props.enterFrom ||
        props.enterTo ||
        props.leave ||
        props.leaveFrom ||
        props.leaveTo
    ) ||
    // If the `as` prop is not a Fragment
    (props.as ?? DEFAULT_TRANSITION_CHILD_TAG) !== Fragment ||
    // If we have a single child, then we can forward the ref directly
    React.Children.count(props.children) === 1
  )
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
  /**
   * @deprecated The `enterTo` and `leaveTo` classes stay applied after the transition has finished.
   */
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

type TransitionChildPropsWeControl = never

export type TransitionChildProps<TTag extends ReactTag> = Props<
  TTag,
  TransitionChildRenderPropArg,
  TransitionChildPropsWeControl,
  PropsForFeatures<typeof TransitionChildRenderFeatures> &
    TransitionClasses &
    TransitionEvents & { transition?: boolean; appear?: boolean }
>

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
  let d = useDisposables()

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

    d.microTask(() => {
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
  >({ enter: [], leave: [] })

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

// ---

let DEFAULT_TRANSITION_CHILD_TAG = Fragment
type TransitionChildRenderPropArg = MutableRefObject<HTMLElement>
let TransitionChildRenderFeatures = RenderFeatures.RenderStrategy

function TransitionChildFn<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionChildProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let {
    // Whether or not to enable transitions on the current element (by exposing
    // transition data). When set to false, the `Transition` component still
    // acts as a transition boundary for `TransitionChild` components.
    transition = true,

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

    ...theirProps
  } = props as typeof props
  let [localContainerElement, setLocalContainerElement] = useState<HTMLElement | null>(null)
  let container = useRef<HTMLElement | null>(null)
  let requiresRef = shouldForwardRef(props)

  let transitionRef = useSyncRefs(
    ...(requiresRef ? [container, ref, setLocalContainerElement] : ref === null ? [] : [ref])
  )
  let strategy = theirProps.unmount ?? true ? RenderStrategy.Unmount : RenderStrategy.Hidden

  let { show, appear, initial } = useTransitionContext()

  let [treeState, setState] = useState(show ? TreeStates.Visible : TreeStates.Hidden)

  let parentNesting = useParentNesting()
  let { register, unregister } = parentNesting

  useIsoMorphicEffect(() => register(container), [register, container])

  useIsoMorphicEffect(() => {
    // If we are in another mode than the Hidden mode then ignore
    if (strategy !== RenderStrategy.Hidden) return
    if (!container.current) return

    // Make sure that we are visible
    if (show && treeState !== TreeStates.Visible) {
      setState(TreeStates.Visible)
      return
    }

    return match(treeState, {
      [TreeStates.Hidden]: () => unregister(container),
      [TreeStates.Visible]: () => register(container),
    })
  }, [treeState, container, register, unregister, show, strategy])

  let ready = useServerHandoffComplete()

  useIsoMorphicEffect(() => {
    if (!requiresRef) return

    if (ready && treeState === TreeStates.Visible && container.current === null) {
      throw new Error('Did you forget to passthrough the `ref` to the actual DOM node?')
    }
  }, [container, treeState, ready, requiresRef])

  // Skipping initial transition
  let skip = initial && !appear
  let immediate = appear && show && initial

  let isTransitioning = useRef(false)

  let nesting = useNesting(() => {
    // When all children have been unmounted we can only hide ourselves if and
    // only if we are not transitioning ourselves. Otherwise we would unmount
    // before the transitions are finished.
    if (isTransitioning.current) return

    setState(TreeStates.Hidden)
    unregister(container)
  }, parentNesting)

  let start = useEvent((show: boolean) => {
    isTransitioning.current = true
    let direction: TransitionDirection = show ? 'enter' : 'leave'

    nesting.onStart(container, direction, (direction) => {
      if (direction === 'enter') beforeEnter?.()
      else if (direction === 'leave') beforeLeave?.()
    })
  })

  let end = useEvent((show: boolean) => {
    let direction: TransitionDirection = show ? 'enter' : 'leave'

    isTransitioning.current = false
    nesting.onStop(container, direction, (direction) => {
      if (direction === 'enter') afterEnter?.()
      else if (direction === 'leave') afterLeave?.()
    })

    if (direction === 'leave' && !hasChildren(nesting)) {
      // When we don't have children anymore we can safely unregister from the
      // parent and hide ourselves.
      setState(TreeStates.Hidden)
      unregister(container)
    }
  })

  useEffect(() => {
    if (requiresRef && transition) return

    // When we don't transition, then we can complete the transition
    // immediately.
    start(show)
    end(show)
  }, [show, requiresRef, transition])

  let enabled = (() => {
    // Should the current component transition? If not, then we can still
    // orchestrate the child transitions.
    if (!transition) return false

    // If we don't require a ref, then we can't transition.
    if (!requiresRef) return false

    // If the server handoff isn't completed yet, we can't transition.
    if (!ready) return false

    // If we start in a `show` state but without the `appear` prop, then we skip
    // the initial transition.
    if (skip) return false

    return true
  })()

  // Ignoring the `visible` state because this doesn't handle the hierarchy. If
  // a leave transition on the `<Transition>` is done, but there is still a
  // child `<TransitionChild>` busy, then `visible` would be `false`, while
  // `state` would still be `TreeStates.Visible`.
  let [, transitionData] = useTransition(enabled, localContainerElement, show, { start, end })

  let ourProps = compact({
    ref: transitionRef,
    className:
      classNames(
        // Incoming classes if any
        // @ts-expect-error: className may not exist because not
        // all components accept className (but all HTML elements do)
        theirProps.className,

        // Apply these classes immediately
        immediate && enter,
        immediate && enterFrom,

        // Map data attributes to `enter`, `enterFrom` and `enterTo` classes
        transitionData.enter && enter,
        transitionData.enter && transitionData.closed && enterFrom,
        transitionData.enter && !transitionData.closed && enterTo,

        // Map data attributes to `leave`, `leaveFrom` and `leaveTo` classes
        transitionData.leave && leave,
        transitionData.leave && !transitionData.closed && leaveFrom,
        transitionData.leave && transitionData.closed && leaveTo,

        // Map data attributes to `entered` class (backwards compatibility)
        !transitionData.transition && show && entered
      )?.trim() || undefined, // If `className` is an empty string, we can omit it
    ...transitionDataAttributes(transitionData),
  })

  let openClosedState = 0
  if (treeState === TreeStates.Visible) openClosedState |= State.Open
  if (treeState === TreeStates.Hidden) openClosedState |= State.Closed
  if (show && treeState === TreeStates.Hidden) openClosedState |= State.Opening
  if (!show && treeState === TreeStates.Visible) openClosedState |= State.Closing

  let render = useRender()

  return (
    <NestingContext.Provider value={nesting}>
      <OpenClosedProvider value={openClosedState}>
        {render({
          ourProps,
          theirProps,
          defaultTag: DEFAULT_TRANSITION_CHILD_TAG,
          features: TransitionChildRenderFeatures,
          visible: treeState === TreeStates.Visible,
          name: 'Transition.Child',
        })}
      </OpenClosedProvider>
    </NestingContext.Provider>
  )
}

export type TransitionRootProps<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG> =
  TransitionChildProps<TTag> & {
    show?: boolean
    appear?: boolean
  }

function TransitionRootFn<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionRootProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { show, appear = false, unmount = true, ...theirProps } = props as typeof props
  let internalTransitionRef = useRef<HTMLElement | null>(null)
  let requiresRef = shouldForwardRef(props)

  let transitionRef = useSyncRefs(
    ...(requiresRef ? [internalTransitionRef, ref] : ref === null ? [] : [ref])
  )

  // The TransitionChild will also call this hook, and we have to make sure that we are ready.
  useServerHandoffComplete()

  let usesOpenClosedState = useOpenClosed()

  if (show === undefined && usesOpenClosedState !== null) {
    show = (usesOpenClosedState & State.Open) === State.Open
  }

  if (show === undefined) {
    throw new Error('A <Transition /> is used but it is missing a `show={true | false}` prop.')
  }

  let [state, setState] = useState(show ? TreeStates.Visible : TreeStates.Hidden)

  let nestingBag = useNesting(() => {
    if (show) return
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
    () => ({ show, appear, initial }),
    [show, appear, initial]
  )

  useIsoMorphicEffect(() => {
    if (show) {
      setState(TreeStates.Visible)
    } else if (!hasChildren(nestingBag) && internalTransitionRef.current !== null) {
      setState(TreeStates.Hidden)
    }
  }, [show, nestingBag])

  let sharedProps = { unmount }

  let beforeEnter = useEvent(() => {
    if (initial) setInitial(false)
    props.beforeEnter?.()
  })

  let beforeLeave = useEvent(() => {
    if (initial) setInitial(false)
    props.beforeLeave?.()
  })

  let render = useRender()

  return (
    <NestingContext.Provider value={nestingBag}>
      <TransitionContext.Provider value={transitionBag}>
        {render({
          ourProps: {
            ...sharedProps,
            as: Fragment,
            children: (
              <InternalTransitionChild
                ref={transitionRef}
                {...sharedProps}
                {...theirProps}
                beforeEnter={beforeEnter}
                beforeLeave={beforeLeave}
              />
            ),
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
}

function ChildFn<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
  props: TransitionChildProps<TTag>,
  ref: MutableRefObject<HTMLElement>
) {
  let hasTransitionContext = useContext(TransitionContext) !== null
  let hasOpenClosedContext = useOpenClosed() !== null

  return (
    <>
      {!hasTransitionContext && hasOpenClosedContext ? (
        <TransitionRoot ref={ref} {...props} />
      ) : (
        <InternalTransitionChild ref={ref} {...props} />
      )}
    </>
  )
}

export interface _internal_ComponentTransitionRoot extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
    props: TransitionRootProps<TTag> & RefProp<typeof TransitionRootFn>
  ): React.JSX.Element
}

export interface _internal_ComponentTransitionChild extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(
    props: TransitionChildProps<TTag> & RefProp<typeof TransitionChildFn>
  ): React.JSX.Element
}

let TransitionRoot = forwardRefWithAs(TransitionRootFn) as _internal_ComponentTransitionRoot
let InternalTransitionChild = forwardRefWithAs(
  TransitionChildFn
) as _internal_ComponentTransitionChild
export let TransitionChild = forwardRefWithAs(ChildFn) as _internal_ComponentTransitionChild

export let Transition = Object.assign(TransitionRoot, {
  /** @deprecated use `<TransitionChild>` instead of `<Transition.Child>` */
  Child: TransitionChild,
  /** @deprecated use `<Transition>` instead of `<Transition.Root>` */
  Root: TransitionRoot,
})
