'use client'

import React, {
  useRef,
  type ElementType,
  type MutableRefObject,
  type FocusEvent as ReactFocusEvent,
  type Ref,
} from 'react'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useEventListener } from '../../hooks/use-event-listener'
import { useIsMounted } from '../../hooks/use-is-mounted'
import { useOnUnmount } from '../../hooks/use-on-unmount'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Direction as TabDirection, useTabDirection } from '../../hooks/use-tab-direction'
import { useWatch } from '../../hooks/use-watch'
import { Hidden, HiddenFeatures } from '../../internal/hidden'
import type { Props } from '../../types'
import { history } from '../../utils/active-element-history'
import { Focus, FocusResult, focusElement, focusIn } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { forwardRefWithAs, render, type HasDisplayName, type RefProp } from '../../utils/render'

type Containers =
  // Lazy resolved containers
  | (() => Iterable<HTMLElement>)

  // List of containers
  | MutableRefObject<Set<MutableRefObject<HTMLElement | null>>>

function resolveContainers(containers?: Containers): Set<HTMLElement> {
  if (!containers) return new Set<HTMLElement>()
  if (typeof containers === 'function') return new Set(containers())

  let all = new Set<HTMLElement>()
  for (let container of containers.current) {
    if (container.current instanceof HTMLElement) {
      all.add(container.current)
    }
  }
  return all
}

let DEFAULT_FOCUS_TRAP_TAG = 'div' as const

export enum FocusTrapFeatures {
  /** No features enabled for the focus trap. */
  None = 1 << 0,

  /** Ensure that we move focus initially into the container. */
  InitialFocus = 1 << 1,

  /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
  TabLock = 1 << 2,

  /** Ensure that programmatically moving focus outside of the container is disallowed. */
  FocusLock = 1 << 3,

  /** Ensure that we restore the focus when unmounting the focus trap. */
  RestoreFocus = 1 << 4,

  /** Initial focus should look for the `data-autofocus` */
  AutoFocus = 1 << 5,

  /** Enable all features. */
  All = InitialFocus | TabLock | FocusLock | RestoreFocus,
}

type FocusTrapRenderPropArg = {}
type FocusTrapPropsWeControl = never

export type FocusTrapProps<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG> = Props<
  TTag,
  FocusTrapRenderPropArg,
  FocusTrapPropsWeControl,
  {
    initialFocus?: MutableRefObject<HTMLElement | null>
    // A fallback element to focus, but this element will be skipped when tabbing around. This is
    // only done for focusing a fallback parent container (e.g.: A `Dialog`, but you want to tab
    // *inside* the dialog excluding the dialog itself).
    initialFocusFallback?: MutableRefObject<HTMLElement | null>
    features?: FocusTrapFeatures
    containers?: Containers
  }
>

function FocusTrapFn<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(
  props: FocusTrapProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let container = useRef<HTMLDivElement | null>(null)
  let focusTrapRef = useSyncRefs(container, ref)
  let {
    initialFocus,
    initialFocusFallback,
    containers,
    features = FocusTrapFeatures.All,
    ...theirProps
  } = props

  if (!useServerHandoffComplete()) {
    features = FocusTrapFeatures.None
  }

  let ownerDocument = useOwnerDocument(container)

  useRestoreFocus({ ownerDocument }, Boolean(features & FocusTrapFeatures.RestoreFocus))
  let previousActiveElement = useInitialFocus(
    { ownerDocument, container, initialFocus, initialFocusFallback },
    features
  )

  useFocusLock(
    { ownerDocument, container, containers, previousActiveElement },
    Boolean(features & FocusTrapFeatures.FocusLock)
  )

  let direction = useTabDirection()
  let handleFocus = useEvent((e: ReactFocusEvent) => {
    let el = container.current as HTMLElement
    if (!el) return

    // TODO: Cleanup once we are using real browser tests
    let wrapper = process.env.NODE_ENV === 'test' ? microTask : (cb: Function) => cb()
    wrapper(() => {
      match(direction.current, {
        [TabDirection.Forwards]: () => {
          focusIn(el, Focus.First, {
            skipElements: [e.relatedTarget, initialFocusFallback] as HTMLElement[],
          })
        },
        [TabDirection.Backwards]: () => {
          focusIn(el, Focus.Last, {
            skipElements: [e.relatedTarget, initialFocusFallback] as HTMLElement[],
          })
        },
      })
    })
  })

  let d = useDisposables()
  let recentlyUsedTabKey = useRef(false)
  let ourProps = {
    ref: focusTrapRef,
    onKeyDown(e: KeyboardEvent) {
      if (e.key == 'Tab') {
        recentlyUsedTabKey.current = true
        d.requestAnimationFrame(() => {
          recentlyUsedTabKey.current = false
        })
      }
    },
    onBlur(e: ReactFocusEvent) {
      if (!Boolean(features & FocusTrapFeatures.FocusLock)) return

      let allContainers = resolveContainers(containers)
      if (container.current instanceof HTMLElement) allContainers.add(container.current)

      let relatedTarget = e.relatedTarget
      if (!(relatedTarget instanceof HTMLElement)) return

      // Known guards, leave them alone!
      if (relatedTarget.dataset.headlessuiFocusGuard === 'true') {
        return
      }

      // Blur is triggered due to focus on relatedTarget, and the relatedTarget is not inside any
      // of the dialog containers. In other words, let's move focus back in!
      if (!contains(allContainers, relatedTarget)) {
        // Was the blur invoked via the keyboard? Redirect to the next in line.
        if (recentlyUsedTabKey.current) {
          focusIn(
            container.current as HTMLElement,
            match(direction.current, {
              [TabDirection.Forwards]: () => Focus.Next,
              [TabDirection.Backwards]: () => Focus.Previous,
            }) | Focus.WrapAround,
            { relativeTo: e.target as HTMLElement }
          )
        }

        // It was invoked via something else (e.g.: click, programmatically, ...). Redirect to the
        // previous active item in the FocusTrap
        else if (e.target instanceof HTMLElement) {
          focusElement(e.target)
        }
      }
    },
  }

  return (
    <>
      {Boolean(features & FocusTrapFeatures.TabLock) && (
        <Hidden
          as="button"
          type="button"
          data-headlessui-focus-guard
          onFocus={handleFocus}
          features={HiddenFeatures.Focusable}
        />
      )}
      {render({
        ourProps,
        theirProps,
        defaultTag: DEFAULT_FOCUS_TRAP_TAG,
        name: 'FocusTrap',
      })}
      {Boolean(features & FocusTrapFeatures.TabLock) && (
        <Hidden
          as="button"
          type="button"
          data-headlessui-focus-guard
          onFocus={handleFocus}
          features={HiddenFeatures.Focusable}
        />
      )}
    </>
  )
}

// ---

export interface _internal_ComponentFocusTrap extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(
    props: FocusTrapProps<TTag> & RefProp<typeof FocusTrapFn>
  ): JSX.Element
}

let FocusTrapRoot = forwardRefWithAs(FocusTrapFn) as unknown as _internal_ComponentFocusTrap

export let FocusTrap = Object.assign(FocusTrapRoot, {
  features: FocusTrapFeatures,
})

// ---

function useRestoreElement(enabled: boolean = true) {
  let localHistory = useRef<HTMLElement[]>(history.slice())

  useWatch(
    ([newEnabled], [oldEnabled]) => {
      // We are disabling the restore element, so we need to clear it.
      if (oldEnabled === true && newEnabled === false) {
        // However, let's schedule it in a microTask, so that we can still read the value in the
        // places where we are restoring the focus.
        microTask(() => {
          localHistory.current.splice(0)
        })
      }

      // We are enabling the restore element, so we need to set it to the last "focused" element.
      if (oldEnabled === false && newEnabled === true) {
        localHistory.current = history.slice()
      }
    },
    [enabled, history, localHistory]
  )

  // We want to return the last element that is still connected to the DOM, so we can restore the
  // focus to it.
  return useEvent(() => {
    return localHistory.current.find((x) => x != null && x.isConnected) ?? null
  })
}

function useRestoreFocus({ ownerDocument }: { ownerDocument: Document | null }, enabled: boolean) {
  let getRestoreElement = useRestoreElement(enabled)

  // Restore the focus to the previous element when `enabled` becomes false again
  useWatch(() => {
    if (enabled) return

    if (ownerDocument?.activeElement === ownerDocument?.body) {
      focusElement(getRestoreElement())
    }
  }, [enabled])

  // Restore the focus to the previous element when the component is unmounted
  useOnUnmount(() => {
    if (!enabled) return

    focusElement(getRestoreElement())
  })
}

function useInitialFocus(
  {
    ownerDocument,
    container,
    initialFocus,
    initialFocusFallback,
  }: {
    ownerDocument: Document | null
    container: MutableRefObject<HTMLElement | null>
    initialFocus?: MutableRefObject<HTMLElement | null>
    initialFocusFallback?: MutableRefObject<HTMLElement | null>
  },
  features: FocusTrapFeatures
) {
  let enabled = Boolean(features & FocusTrapFeatures.InitialFocus)
  let previousActiveElement = useRef<HTMLElement | null>(null)

  let mounted = useIsMounted()

  // Handle initial focus
  useWatch(() => {
    if (!enabled) {
      // If we are disabling the initialFocus, then we should focus the fallback element if one is
      // provided. This is needed to ensure _something_ is focused. Typically a wrapping element
      // (e.g.: `Dialog` component).
      //
      // Note: we _don't_ want to move focus to the `initialFocus` ref, because the `InitialFocus`
      // feature is disabled.
      if (initialFocusFallback?.current) {
        focusElement(initialFocusFallback.current)
      }

      return
    }
    let containerElement = container.current
    if (!containerElement) return

    // Delaying the focus to the next microtask ensures that a few conditions are true:
    // - The container is rendered
    // - Transitions could be started
    // If we don't do this, then focusing an element will immediately cancel any transitions. This
    // is not ideal because transitions will look broken.
    // There is an additional issue with doing this immediately. The FocusTrap is used inside a
    // Dialog, the Dialog is rendered inside of a Portal and the Portal is rendered at the end of
    // the `document.body`. This means that the moment we call focus, the browser immediately
    // tries to focus the element, which will still be at the bodem resulting in the page to
    // scroll down. Delaying this will prevent the page to scroll down entirely.
    microTask(() => {
      if (!mounted.current) {
        return
      }

      let activeElement = ownerDocument?.activeElement as HTMLElement

      if (initialFocus?.current) {
        if (initialFocus?.current === activeElement) {
          previousActiveElement.current = activeElement
          return // Initial focus ref is already the active element
        }
      } else if (containerElement!.contains(activeElement)) {
        previousActiveElement.current = activeElement
        return // Already focused within Dialog
      }

      // Try to focus the initialFocus ref
      if (initialFocus?.current) {
        focusElement(initialFocus.current)
      } else {
        if (features & FocusTrapFeatures.AutoFocus) {
          // Try to focus the first focusable element with `Focus.AutoFocus` feature enabled
          if (focusIn(containerElement!, Focus.First | Focus.AutoFocus) !== FocusResult.Error) {
            return // Worked, bail
          }
        }

        // Try to focus the first focusable element.
        else if (focusIn(containerElement!, Focus.First) !== FocusResult.Error) {
          return // Worked, bail
        }

        // Try the fallback
        if (initialFocusFallback?.current) {
          focusElement(initialFocusFallback.current)
          if (ownerDocument?.activeElement === initialFocusFallback.current) {
            return // Worked, bail
          }
        }

        // Nothing worked
        console.warn('There are no focusable elements inside the <FocusTrap />')
      }

      previousActiveElement.current = ownerDocument?.activeElement as HTMLElement
    })
  }, [initialFocusFallback, enabled, features])

  return previousActiveElement
}

function useFocusLock(
  {
    ownerDocument,
    container,
    containers,
    previousActiveElement,
  }: {
    ownerDocument: Document | null
    container: MutableRefObject<HTMLElement | null>
    containers?: Containers
    previousActiveElement: MutableRefObject<HTMLElement | null>
  },
  enabled: boolean
) {
  let mounted = useIsMounted()

  // Prevent programmatically escaping the container
  useEventListener(
    ownerDocument?.defaultView,
    'focus',
    (event) => {
      if (!enabled) return
      if (!mounted.current) return

      let allContainers = resolveContainers(containers)
      if (container.current instanceof HTMLElement) allContainers.add(container.current)

      let previous = previousActiveElement.current
      if (!previous) return

      let toElement = event.target as HTMLElement | null

      if (toElement && toElement instanceof HTMLElement) {
        if (!contains(allContainers, toElement)) {
          event.preventDefault()
          event.stopPropagation()
          focusElement(previous)
        } else {
          previousActiveElement.current = toElement
          focusElement(toElement)
        }
      } else {
        focusElement(previousActiveElement.current)
      }
    },
    true
  )
}

function contains(containers: Set<HTMLElement>, element: HTMLElement) {
  for (let container of containers) {
    if (container.contains(element)) return true
  }

  return false
}
