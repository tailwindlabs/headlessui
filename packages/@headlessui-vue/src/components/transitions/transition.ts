import {
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  watchEffect,

  // Types
  InjectionKey,
  Ref,
  ConcreteComponent,
} from 'vue'

import { useId } from '../../hooks/use-id'
import { match } from '../../utils/match'

import { Features, omit, render, RenderStrategy } from '../../utils/render'
import { Reason, transition } from './utils/transition'
import { dom } from '../../utils/dom'
import {
  useOpenClosedProvider,
  State,
  useOpenClosed,
  hasOpenClosed,
} from '../../internal/open-closed'

type ID = ReturnType<typeof useId>

function splitClasses(classes: string = '') {
  return classes.split(' ').filter((className) => className.trim().length > 1)
}

interface TransitionContextValues {
  show: Ref<boolean>
  appear: Ref<boolean>
}
let TransitionContext = Symbol('TransitionContext') as InjectionKey<TransitionContextValues | null>

enum TreeStates {
  Visible = 'visible',
  Hidden = 'hidden',
}

function hasTransitionContext() {
  return inject(TransitionContext, null) !== null
}

function useTransitionContext() {
  let context = inject(TransitionContext, null)

  if (context === null) {
    throw new Error('A <TransitionChild /> is used but it is missing a parent <TransitionRoot />.')
  }

  return context
}

function useParentNesting() {
  let context = inject(NestingContext, null)

  if (context === null) {
    throw new Error('A <TransitionChild /> is used but it is missing a parent <TransitionRoot />.')
  }

  return context
}

interface NestingContextValues {
  children: Ref<{ id: ID; state: TreeStates }[]>
  register: (id: ID) => () => void
  unregister: (id: ID, strategy?: RenderStrategy) => void
}

let NestingContext = Symbol('NestingContext') as InjectionKey<NestingContextValues | null>

function hasChildren(
  bag: NestingContextValues['children'] | { children: NestingContextValues['children'] }
): boolean {
  if ('children' in bag) return hasChildren(bag.children)
  return bag.value.filter(({ state }) => state === TreeStates.Visible).length > 0
}

function useNesting(done?: () => void) {
  let transitionableChildren = ref<NestingContextValues['children']['value']>([])

  let mounted = ref(false)
  onMounted(() => (mounted.value = true))
  onUnmounted(() => (mounted.value = false))

  function unregister(childId: ID, strategy = RenderStrategy.Hidden) {
    let idx = transitionableChildren.value.findIndex(({ id }) => id === childId)
    if (idx === -1) return

    match(strategy, {
      [RenderStrategy.Unmount]() {
        transitionableChildren.value.splice(idx, 1)
      },
      [RenderStrategy.Hidden]() {
        transitionableChildren.value[idx].state = TreeStates.Hidden
      },
    })

    if (!hasChildren(transitionableChildren) && mounted.value) {
      done?.()
    }
  }

  function register(childId: ID) {
    let child = transitionableChildren.value.find(({ id }) => id === childId)
    if (!child) {
      transitionableChildren.value.push({ id: childId, state: TreeStates.Visible })
    } else if (child.state !== TreeStates.Visible) {
      child.state = TreeStates.Visible
    }

    return () => unregister(childId, RenderStrategy.Unmount)
  }

  return {
    children: transitionableChildren,
    register,
    unregister,
  }
}

// ---

let TransitionChildRenderFeatures = Features.RenderStrategy

export let TransitionChild = defineComponent({
  props: {
    as: { type: [Object, String], default: 'div' },
    show: { type: [Boolean], default: null },
    unmount: { type: [Boolean], default: true },
    appear: { type: [Boolean], default: false },
    enter: { type: [String], default: '' },
    enterFrom: { type: [String], default: '' },
    enterTo: { type: [String], default: '' },
    entered: { type: [String], default: '' },
    leave: { type: [String], default: '' },
    leaveFrom: { type: [String], default: '' },
    leaveTo: { type: [String], default: '' },
  },
  emits: {
    beforeEnter: () => true,
    afterEnter: () => true,
    beforeLeave: () => true,
    afterLeave: () => true,
  },
  setup(props, { emit, attrs, slots, expose }) {
    if (!hasTransitionContext() && hasOpenClosed()) {
      return () =>
        h(
          TransitionRoot,
          {
            ...props,
            onBeforeEnter: () => emit('beforeEnter'),
            onAfterEnter: () => emit('afterEnter'),
            onBeforeLeave: () => emit('beforeLeave'),
            onAfterLeave: () => emit('afterLeave'),
          },
          slots
        )
    }

    let container = ref<HTMLElement | null>(null)
    let state = ref(TreeStates.Visible)
    let strategy = computed(() => (props.unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden))

    expose({ el: container, $el: container })

    let { show, appear } = useTransitionContext()
    let { register, unregister } = useParentNesting()

    let initial = { value: true }

    let id = useId()

    let isTransitioning = { value: false }

    let nesting = useNesting(() => {
      // When all children have been unmounted we can only hide ourselves if and only if we are not
      // transitioning ourselves. Otherwise we would unmount before the transitions are finished.
      if (!isTransitioning.value) {
        state.value = TreeStates.Hidden
        unregister(id)
        emit('afterLeave')
      }
    })

    onMounted(() => {
      let unregister = register(id)
      onUnmounted(unregister)
    })

    watchEffect(() => {
      // If we are in another mode than the Hidden mode then ignore
      if (strategy.value !== RenderStrategy.Hidden) return
      if (!id) return

      // Make sure that we are visible
      if (show && state.value !== TreeStates.Visible) {
        state.value = TreeStates.Visible
        return
      }

      match(state.value, {
        [TreeStates.Hidden]: () => unregister(id),
        [TreeStates.Visible]: () => register(id),
      })
    })

    let enterClasses = splitClasses(props.enter)
    let enterFromClasses = splitClasses(props.enterFrom)
    let enterToClasses = splitClasses(props.enterTo)

    let enteredClasses = splitClasses(props.entered)

    let leaveClasses = splitClasses(props.leave)
    let leaveFromClasses = splitClasses(props.leaveFrom)
    let leaveToClasses = splitClasses(props.leaveTo)

    onMounted(() => {
      watchEffect(() => {
        if (state.value === TreeStates.Visible) {
          let domElement = dom(container)
          // When you return `null` from a component, the actual DOM reference will
          // be an empty comment... This means that we can never check for the DOM
          // node to be `null`. So instead we check for an empty comment.
          let isEmptyDOMNode = domElement instanceof Comment && domElement.data === ''
          if (isEmptyDOMNode) {
            throw new Error('Did you forget to passthrough the `ref` to the actual DOM node?')
          }
        }
      })
    })

    function executeTransition(onInvalidate: (cb: () => void) => void) {
      // Skipping initial transition
      let skip = initial.value && !appear.value

      let node = dom(container)
      if (!node || !(node instanceof HTMLElement)) return
      if (skip) return

      isTransitioning.value = true

      if (show.value) emit('beforeEnter')
      if (!show.value) emit('beforeLeave')

      onInvalidate(
        show.value
          ? transition(
              node,
              enterClasses,
              enterFromClasses,
              enterToClasses,
              enteredClasses,
              (reason) => {
                isTransitioning.value = false
                if (reason === Reason.Finished) emit('afterEnter')
              }
            )
          : transition(
              node,
              leaveClasses,
              leaveFromClasses,
              leaveToClasses,
              enteredClasses,
              (reason) => {
                isTransitioning.value = false

                if (reason !== Reason.Finished) return

                // When we don't have children anymore we can safely unregister from the parent and hide
                // ourselves.
                if (!hasChildren(nesting)) {
                  state.value = TreeStates.Hidden
                  unregister(id)
                  emit('afterLeave')
                }
              }
            )
      )
    }

    onMounted(() => {
      watch(
        [show, appear],
        (_oldValues, _newValues, onInvalidate) => {
          executeTransition(onInvalidate)
          initial.value = false
        },
        { immediate: true }
      )
    })

    provide(NestingContext, nesting)
    useOpenClosedProvider(
      computed(() =>
        match(state.value, {
          [TreeStates.Visible]: State.Open,
          [TreeStates.Hidden]: State.Closed,
        })
      )
    )

    return () => {
      let {
        appear,
        show,

        // Class names
        enter,
        enterFrom,
        enterTo,
        entered,
        leave,
        leaveFrom,
        leaveTo,
        ...rest
      } = props

      let ourProps = { ref: container }
      let incomingProps = rest

      return render({
        props: { ...incomingProps, ...ourProps },
        slot: {},
        slots,
        attrs,
        features: TransitionChildRenderFeatures,
        visible: state.value === TreeStates.Visible,
        name: 'TransitionChild',
      })
    }
  },
})

// ---

// This exists to work around typescript circular inference problem
let _TransitionChild = TransitionChild as ConcreteComponent

export let TransitionRoot = defineComponent({
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: 'div' },
    show: { type: [Boolean], default: null },
    unmount: { type: [Boolean], default: true },
    appear: { type: [Boolean], default: false },
    enter: { type: [String], default: '' },
    enterFrom: { type: [String], default: '' },
    enterTo: { type: [String], default: '' },
    entered: { type: [String], default: '' },
    leave: { type: [String], default: '' },
    leaveFrom: { type: [String], default: '' },
    leaveTo: { type: [String], default: '' },
  },
  emits: {
    beforeEnter: () => true,
    afterEnter: () => true,
    beforeLeave: () => true,
    afterLeave: () => true,
  },
  setup(props, { emit, attrs, slots }) {
    let usesOpenClosedState = useOpenClosed()

    let show = computed(() => {
      if (props.show === null && usesOpenClosedState !== null) {
        return match(usesOpenClosedState.value, {
          [State.Open]: true,
          [State.Closed]: false,
        })
      }

      return props.show
    })

    watchEffect(() => {
      if (![true, false].includes(show.value)) {
        throw new Error('A <Transition /> is used but it is missing a `:show="true | false"` prop.')
      }
    })

    let state = ref(show.value ? TreeStates.Visible : TreeStates.Hidden)

    let nestingBag = useNesting(() => {
      state.value = TreeStates.Hidden
    })

    let initial = { value: true }
    let transitionBag = {
      show,
      appear: computed(() => props.appear || !initial.value),
    }

    onMounted(() => {
      watchEffect(() => {
        initial.value = false

        if (show.value) {
          state.value = TreeStates.Visible
        } else if (!hasChildren(nestingBag)) {
          state.value = TreeStates.Hidden
        }
      })
    })

    provide(NestingContext, nestingBag)
    provide(TransitionContext, transitionBag)

    return () => {
      let incomingProps = omit(props, ['show', 'appear', 'unmount'])
      let sharedProps = { unmount: props.unmount }

      return render({
        props: {
          ...sharedProps,
          as: 'template',
        },
        slot: {},
        slots: {
          ...slots,
          default: () => [
            h(
              _TransitionChild,
              {
                onBeforeEnter: () => emit('beforeEnter'),
                onAfterEnter: () => emit('afterEnter'),
                onBeforeLeave: () => emit('beforeLeave'),
                onAfterLeave: () => emit('afterLeave'),
                ...attrs,
                ...sharedProps,
                ...incomingProps,
              },
              slots.default
            ),
          ],
        },
        attrs: {},
        features: TransitionChildRenderFeatures,
        visible: state.value === TreeStates.Visible,
        name: 'Transition',
      })
    }
  },
})
