'use client'

// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
import React, {
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ContextType,
  type ElementType,
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  type RefObject,
} from 'react'
import { useDocumentOverflowLockedEffect } from '../../hooks/document-overflow/use-document-overflow'
import { useEvent } from '../../hooks/use-event'
import { useEventListener } from '../../hooks/use-event-listener'
import { useId } from '../../hooks/use-id'
import { useInert } from '../../hooks/use-inert'
import { useIsTouchDevice } from '../../hooks/use-is-touch-device'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useRootContainers } from '../../hooks/use-root-containers'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { HoistFormFields } from '../../internal/form-fields'
import { State, useOpenClosed } from '../../internal/open-closed'
import { ForcePortalRoot } from '../../internal/portal-force-root'
import { StackMessage, StackProvider } from '../../internal/stack-context'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { match } from '../../utils/match'
import {
  RenderFeatures,
  forwardRefWithAs,
  render,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import {
  Description,
  useDescriptions,
  type _internal_ComponentDescription,
} from '../description/description'
import { FocusTrap, FocusTrapFeatures } from '../focus-trap/focus-trap'
import { Keys } from '../keyboard'
import { Portal, useNestedPortals } from '../portal/portal'

enum DialogStates {
  Open,
  Closed,
}

interface StateDefinition {
  titleId: string | null
  panelRef: MutableRefObject<HTMLDivElement | null>
}

enum ActionTypes {
  SetTitleId,
}

type Actions = { type: ActionTypes.SetTitleId; id: string | null }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.SetTitleId](state, action) {
    if (state.titleId === action.id) return state
    return { ...state, titleId: action.id }
  },
}

let DialogContext = createContext<
  | [
      {
        dialogState: DialogStates
        close(): void
        setTitleId(id: string | null): void
      },
      StateDefinition,
    ]
  | null
>(null)
DialogContext.displayName = 'DialogContext'

function useDialogContext(component: string) {
  let context = useContext(DialogContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Dialog /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext)
    throw err
  }
  return context
}

function useScrollLock(
  ownerDocument: Document | null,
  enabled: boolean,
  resolveAllowedContainers: () => HTMLElement[] = () => [document.body]
) {
  useDocumentOverflowLockedEffect(ownerDocument, enabled, (meta) => ({
    containers: [...(meta.containers ?? []), resolveAllowedContainers],
  }))
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_DIALOG_TAG = 'div' as const
type DialogRenderPropArg = {
  open: boolean
}
type DialogPropsWeControl = 'aria-describedby' | 'aria-labelledby' | 'aria-modal'

let DialogRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type DialogProps<TTag extends ElementType = typeof DEFAULT_DIALOG_TAG> = Props<
  TTag,
  DialogRenderPropArg,
  DialogPropsWeControl,
  PropsForFeatures<typeof DialogRenderFeatures> & {
    open?: boolean
    onClose(value: boolean): void
    initialFocus?: MutableRefObject<HTMLElement | null>
    role?: 'dialog' | 'alertdialog'
    autoFocus?: boolean
    __demoMode?: boolean
  }
>

function DialogFn<TTag extends ElementType = typeof DEFAULT_DIALOG_TAG>(
  props: DialogProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-dialog-${internalId}`,
    open,
    onClose,
    initialFocus,
    role = 'dialog',
    autoFocus = true,
    __demoMode = false,
    ...theirProps
  } = props
  let [nestedDialogCount, setNestedDialogCount] = useState(0)

  let didWarnOnRole = useRef(false)

  role = (function () {
    if (role === 'dialog' || role === 'alertdialog') {
      return role
    }

    if (!didWarnOnRole.current) {
      didWarnOnRole.current = true
      console.warn(
        `Invalid role [${role}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`
      )
    }

    return 'dialog'
  })()

  let usesOpenClosedState = useOpenClosed()
  if (open === undefined && usesOpenClosedState !== null) {
    // Update the `open` prop based on the open closed state
    open = (usesOpenClosedState & State.Open) === State.Open
  }

  let internalDialogRef = useRef<HTMLDivElement | null>(null)
  let dialogRef = useSyncRefs(internalDialogRef, ref)

  let ownerDocument = useOwnerDocument(internalDialogRef)

  // Validations
  let hasOpen = props.hasOwnProperty('open') || usesOpenClosedState !== null
  let hasOnClose = props.hasOwnProperty('onClose')
  if (!hasOpen && !hasOnClose) {
    throw new Error(
      `You have to provide an \`open\` and an \`onClose\` prop to the \`Dialog\` component.`
    )
  }

  if (!hasOpen) {
    throw new Error(
      `You provided an \`onClose\` prop to the \`Dialog\`, but forgot an \`open\` prop.`
    )
  }

  if (!hasOnClose) {
    throw new Error(
      `You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onClose\` prop.`
    )
  }

  if (typeof open !== 'boolean') {
    throw new Error(
      `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${open}`
    )
  }

  if (typeof onClose !== 'function') {
    throw new Error(
      `You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${onClose}`
    )
  }

  let dialogState = open ? DialogStates.Open : DialogStates.Closed

  let [state, dispatch] = useReducer(stateReducer, {
    titleId: null,
    descriptionId: null,
    panelRef: createRef(),
  } as StateDefinition)

  let close = useEvent(() => onClose(false))

  let setTitleId = useEvent((id: string | null) => dispatch({ type: ActionTypes.SetTitleId, id }))

  let ready = useServerHandoffComplete()
  let enabled = ready ? (__demoMode ? false : dialogState === DialogStates.Open) : false
  let hasNestedDialogs = nestedDialogCount > 1 // 1 is the current dialog
  let hasParentDialog = useContext(DialogContext) !== null
  let [portals, PortalWrapper] = useNestedPortals()

  // We use this because reading these values during iniital render(s)
  // can result in `null` rather then the actual elements
  // This doesn't happen when using certain components like a
  // `<Dialog.Title>` because they cause the parent to re-render
  let defaultContainer: RefObject<HTMLElement> = {
    get current() {
      return state.panelRef.current ?? internalDialogRef.current
    },
  }

  let {
    resolveContainers: resolveRootContainers,
    mainTreeNodeRef,
    MainTreeNode,
  } = useRootContainers({
    portals,
    defaultContainers: [defaultContainer],
  })

  // If there are multiple dialogs, then you can be the root, the leaf or one
  // in between. We only care abou whether you are the top most one or not.
  let position = !hasNestedDialogs ? 'leaf' : 'parent'

  // When the `Dialog` is wrapped in a `Transition` (or another Headless UI component that exposes
  // the OpenClosed state) then we get some information via context about its state. When the
  // `Transition` is about to close, then the `State.Closing` state will be exposed. This allows us
  // to enable/disable certain functionality in the `Dialog` upfront instead of waiting until the
  // `Transition` is done transitioning.
  let isClosing =
    usesOpenClosedState !== null ? (usesOpenClosedState & State.Closing) === State.Closing : false

  // Ensure other elements can't be interacted with
  let inertOthersEnabled = (() => {
    // Nested dialogs should not modify the `inert` property, only the root one should.
    if (hasParentDialog) return false
    if (isClosing) return false
    return enabled
  })()
  let resolveRootOfMainTreeNode = useCallback(() => {
    return (Array.from(ownerDocument?.querySelectorAll('body > *') ?? []).find((root) => {
      // Skip the portal root, we don't want to make that one inert
      if (root.id === 'headlessui-portal-root') return false

      // Find the root of the main tree node
      return root.contains(mainTreeNodeRef.current) && root instanceof HTMLElement
    }) ?? null) as HTMLElement | null
  }, [mainTreeNodeRef])
  useInert(resolveRootOfMainTreeNode, inertOthersEnabled)

  // This would mark the parent dialogs as inert
  let inertParentDialogs = (() => {
    if (hasNestedDialogs) return true
    return enabled
  })()
  let resolveRootOfParentDialog = useCallback(() => {
    return (Array.from(ownerDocument?.querySelectorAll('[data-headlessui-portal]') ?? []).find(
      (root) => root.contains(mainTreeNodeRef.current) && root instanceof HTMLElement
    ) ?? null) as HTMLElement | null
  }, [mainTreeNodeRef])
  useInert(resolveRootOfParentDialog, inertParentDialogs)

  // Close Dialog on outside click
  let outsideClickEnabled = (() => {
    if (!enabled) return false
    if (hasNestedDialogs) return false
    return true
  })()
  useOutsideClick(resolveRootContainers, close, outsideClickEnabled)

  // Handle `Escape` to close
  let escapeToCloseEnabled = (() => {
    if (hasNestedDialogs) return false
    if (dialogState !== DialogStates.Open) return false
    return true
  })()
  useEventListener(ownerDocument?.defaultView, 'keydown', (event) => {
    if (!escapeToCloseEnabled) return
    if (event.defaultPrevented) return
    if (event.key !== Keys.Escape) return
    event.preventDefault()
    event.stopPropagation()
    close()
  })

  // Scroll lock
  let scrollLockEnabled = (() => {
    if (isClosing) return false
    if (dialogState !== DialogStates.Open) return false
    if (hasParentDialog) return false
    return true
  })()
  useScrollLock(ownerDocument, scrollLockEnabled, resolveRootContainers)

  // Trigger close when the FocusTrap gets hidden
  useEffect(() => {
    if (dialogState !== DialogStates.Open) return
    if (!internalDialogRef.current) return

    let observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        let rect = entry.target.getBoundingClientRect()
        if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
          close()
        }
      }
    })

    observer.observe(internalDialogRef.current)

    return () => observer.disconnect()
  }, [dialogState, internalDialogRef, close])

  let [describedby, DescriptionProvider] = useDescriptions()

  let contextBag = useMemo<ContextType<typeof DialogContext>>(
    () => [{ dialogState, close, setTitleId }, state],
    [dialogState, state, close, setTitleId]
  )

  let slot = useMemo(
    () => ({ open: dialogState === DialogStates.Open }) satisfies DialogRenderPropArg,
    [dialogState]
  )

  let ourProps = {
    ref: dialogRef,
    id,
    role,
    tabIndex: -1,
    'aria-modal': dialogState === DialogStates.Open ? true : undefined,
    'aria-labelledby': state.titleId,
    'aria-describedby': describedby,
  }

  let shouldAutoFocus = !useIsTouchDevice()

  let focusTrapFeatures = enabled
    ? match(position, {
        parent: FocusTrapFeatures.RestoreFocus,
        leaf: FocusTrapFeatures.All & ~FocusTrapFeatures.FocusLock,
      })
    : FocusTrapFeatures.None

  // Enable AutoFocus feature
  if (autoFocus) {
    focusTrapFeatures |= FocusTrapFeatures.AutoFocus
  }

  // Remove initialFocus when we should not auto focus at all
  if (!shouldAutoFocus) {
    focusTrapFeatures &= ~FocusTrapFeatures.InitialFocus
  }

  return (
    <StackProvider
      type="Dialog"
      enabled={dialogState === DialogStates.Open}
      element={internalDialogRef}
      onUpdate={useEvent((message, type) => {
        if (type !== 'Dialog') return

        match(message, {
          [StackMessage.Add]: () => setNestedDialogCount((count) => count + 1),
          [StackMessage.Remove]: () => setNestedDialogCount((count) => count - 1),
        })
      })}
    >
      <ForcePortalRoot force={true}>
        <Portal>
          <DialogContext.Provider value={contextBag}>
            <Portal.Group target={internalDialogRef}>
              <ForcePortalRoot force={false}>
                <DescriptionProvider slot={slot} name="Dialog.Description">
                  <PortalWrapper>
                    <FocusTrap
                      initialFocus={initialFocus}
                      initialFocusFallback={internalDialogRef}
                      containers={resolveRootContainers}
                      features={focusTrapFeatures}
                    >
                      {render({
                        ourProps,
                        theirProps,
                        slot,
                        defaultTag: DEFAULT_DIALOG_TAG,
                        features: DialogRenderFeatures,
                        visible: dialogState === DialogStates.Open,
                        name: 'Dialog',
                      })}
                    </FocusTrap>
                  </PortalWrapper>
                </DescriptionProvider>
              </ForcePortalRoot>
            </Portal.Group>
          </DialogContext.Provider>
        </Portal>
      </ForcePortalRoot>
      <HoistFormFields>
        <MainTreeNode />
      </HoistFormFields>
    </StackProvider>
  )
}

// ---

let DEFAULT_OVERLAY_TAG = 'div' as const
type OverlayRenderPropArg = {
  open: boolean
}
type OverlayPropsWeControl = 'aria-hidden'

export type DialogOverlayProps<TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG> = Props<
  TTag,
  OverlayRenderPropArg,
  OverlayPropsWeControl
>

function OverlayFn<TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG>(
  props: DialogOverlayProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let { id = `headlessui-dialog-overlay-${internalId}`, ...theirProps } = props
  let [{ dialogState, close }] = useDialogContext('Dialog.Overlay')
  let overlayRef = useSyncRefs(ref)

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (event.target !== event.currentTarget) return
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    event.preventDefault()
    event.stopPropagation()
    close()
  })

  let slot = useMemo(
    () => ({ open: dialogState === DialogStates.Open }) satisfies OverlayRenderPropArg,
    [dialogState]
  )

  let ourProps = {
    ref: overlayRef,
    id,
    'aria-hidden': true,
    onClick: handleClick,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OVERLAY_TAG,
    name: 'Dialog.Overlay',
  })
}

// ---

let DEFAULT_BACKDROP_TAG = 'div' as const
type BackdropRenderPropArg = {
  open: boolean
}
type BackdropPropsWeControl = 'aria-hidden'

export type DialogBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<
  TTag,
  BackdropRenderPropArg,
  BackdropPropsWeControl
>

function BackdropFn<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(
  props: DialogBackdropProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let { id = `headlessui-dialog-backdrop-${internalId}`, ...theirProps } = props
  let [{ dialogState }, state] = useDialogContext('Dialog.Backdrop')
  let backdropRef = useSyncRefs(ref)

  useEffect(() => {
    if (state.panelRef.current === null) {
      throw new Error(
        `A <Dialog.Backdrop /> component is being used, but a <Dialog.Panel /> component is missing.`
      )
    }
  }, [state.panelRef])

  let slot = useMemo(
    () => ({ open: dialogState === DialogStates.Open }) satisfies BackdropRenderPropArg,
    [dialogState]
  )

  let ourProps = {
    ref: backdropRef,
    id,
    'aria-hidden': true,
  }

  return (
    <ForcePortalRoot force>
      <Portal>
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_BACKDROP_TAG,
          name: 'Dialog.Backdrop',
        })}
      </Portal>
    </ForcePortalRoot>
  )
}

// ---

let DEFAULT_PANEL_TAG = 'div' as const
type PanelRenderPropArg = {
  open: boolean
}

export type DialogPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
  TTag,
  PanelRenderPropArg
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: DialogPanelProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let { id = `headlessui-dialog-panel-${internalId}`, ...theirProps } = props
  let [{ dialogState }, state] = useDialogContext('Dialog.Panel')
  let panelRef = useSyncRefs(ref, state.panelRef)

  let slot = useMemo(
    () => ({ open: dialogState === DialogStates.Open }) satisfies PanelRenderPropArg,
    [dialogState]
  )

  // Prevent the click events inside the Dialog.Panel from bubbling through the React Tree which
  // could submit wrapping <form> elements even if we portalled the Dialog.
  let handleClick = useEvent((event: ReactMouseEvent) => {
    event.stopPropagation()
  })

  let ourProps = {
    ref: panelRef,
    id,
    onClick: handleClick,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANEL_TAG,
    name: 'Dialog.Panel',
  })
}

// ---

let DEFAULT_TITLE_TAG = 'h2' as const
type TitleRenderPropArg = {
  open: boolean
}

export type DialogTitleProps<TTag extends ElementType = typeof DEFAULT_TITLE_TAG> = Props<
  TTag,
  TitleRenderPropArg
>

function TitleFn<TTag extends ElementType = typeof DEFAULT_TITLE_TAG>(
  props: DialogTitleProps<TTag>,
  ref: Ref<HTMLHeadingElement>
) {
  let internalId = useId()
  let { id = `headlessui-dialog-title-${internalId}`, ...theirProps } = props
  let [{ dialogState, setTitleId }] = useDialogContext('Dialog.Title')

  let titleRef = useSyncRefs(ref)

  useEffect(() => {
    setTitleId(id)
    return () => setTitleId(null)
  }, [id, setTitleId])

  let slot = useMemo(
    () => ({ open: dialogState === DialogStates.Open }) satisfies TitleRenderPropArg,
    [dialogState]
  )

  let ourProps = { ref: titleRef, id }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TITLE_TAG,
    name: 'Dialog.Title',
  })
}

// ---

export interface _internal_ComponentDialog extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_DIALOG_TAG>(
    props: DialogProps<TTag> & RefProp<typeof DialogFn>
  ): JSX.Element
}

export interface _internal_ComponentDialogBackdrop extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(
    props: DialogBackdropProps<TTag> & RefProp<typeof BackdropFn>
  ): JSX.Element
}

export interface _internal_ComponentDialogPanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: DialogPanelProps<TTag> & RefProp<typeof PanelFn>
  ): JSX.Element
}

export interface _internal_ComponentDialogOverlay extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG>(
    props: DialogOverlayProps<TTag> & RefProp<typeof OverlayFn>
  ): JSX.Element
}

export interface _internal_ComponentDialogTitle extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TITLE_TAG>(
    props: DialogTitleProps<TTag> & RefProp<typeof TitleFn>
  ): JSX.Element
}

export interface _internal_ComponentDialogDescription extends _internal_ComponentDescription {}

let DialogRoot = forwardRefWithAs(DialogFn) as unknown as _internal_ComponentDialog
export let DialogBackdrop = forwardRefWithAs(
  BackdropFn
) as unknown as _internal_ComponentDialogBackdrop
export let DialogPanel = forwardRefWithAs(PanelFn) as unknown as _internal_ComponentDialogPanel
export let DialogOverlay = forwardRefWithAs(
  OverlayFn
) as unknown as _internal_ComponentDialogOverlay
export let DialogTitle = forwardRefWithAs(TitleFn) as unknown as _internal_ComponentDialogTitle
/** @deprecated use `<Description>` instead of `<DialogDescription>` */
export let DialogDescription = Description as _internal_ComponentDialogDescription

export let Dialog = Object.assign(DialogRoot, {
  Backdrop: DialogBackdrop,
  Panel: DialogPanel,
  Overlay: DialogOverlay,
  Title: DialogTitle,
  /** @deprecated use `<Description>` instead of `<Dialog.Description>` */
  Description: Description as _internal_ComponentDialogDescription,
})
