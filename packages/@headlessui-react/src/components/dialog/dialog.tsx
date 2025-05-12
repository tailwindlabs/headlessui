'use client'

// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ContextType,
  type ElementType,
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  type RefObject,
} from 'react'
import { useEscape } from '../../hooks/use-escape'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useInertOthers } from '../../hooks/use-inert-others'
import { useIsTouchDevice } from '../../hooks/use-is-touch-device'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useOnDisappear } from '../../hooks/use-on-disappear'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import {
  MainTreeProvider,
  useMainTreeNode,
  useRootContainers,
} from '../../hooks/use-root-containers'
import { useScrollLock } from '../../hooks/use-scroll-lock'
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { CloseProvider } from '../../internal/close-provider'
import { ResetOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { ForcePortalRoot } from '../../internal/portal-force-root'
import { stackMachines } from '../../machines/stack-machine'
import { useSlice } from '../../react-glue'
import type { Props } from '../../types'
import { match } from '../../utils/match'
import {
  RenderFeatures,
  forwardRefWithAs,
  useRender,
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
import { Portal, PortalGroup, useNestedPortals } from '../portal/portal'
import { Transition, TransitionChild } from '../transition/transition'

enum DialogStates {
  Open,
  Closed,
}

interface StateDefinition {
  titleId: string | null
  panelRef: MutableRefObject<HTMLElement | null>
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
        unmount: boolean
        close: () => void
        setTitleId: (id: string | null) => void
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

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let InternalDialog = forwardRefWithAs(function InternalDialog<
  TTag extends ElementType = typeof DEFAULT_DIALOG_TAG,
>(props: DialogProps<TTag>, ref: Ref<HTMLElement>) {
  let internalId = useId()
  let {
    id = `headlessui-dialog-${internalId}`,
    open,
    onClose,
    initialFocus,
    role = 'dialog',
    autoFocus = true,
    __demoMode = false,
    unmount = false,
    ...theirProps
  } = props

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

  let internalDialogRef = useRef<HTMLElement | null>(null)
  let dialogRef = useSyncRefs(internalDialogRef, ref)

  let ownerDocument = useOwnerDocument(internalDialogRef)

  let dialogState = open ? DialogStates.Open : DialogStates.Closed

  let [state, dispatch] = useReducer(stateReducer, {
    titleId: null,
    descriptionId: null,
    panelRef: createRef(),
  } as StateDefinition)

  let close = useEvent(() => onClose(false))

  let setTitleId = useEvent((id: string | null) => dispatch({ type: ActionTypes.SetTitleId, id }))

  let ready = useServerHandoffComplete()
  let enabled = ready ? dialogState === DialogStates.Open : false
  let [portals, PortalWrapper] = useNestedPortals()

  // We use this because reading these values during initial render(s)
  // can result in `null` rather then the actual elements
  // This doesn't happen when using certain components like a
  // `<Dialog.Title>` because they cause the parent to re-render
  let defaultContainer: RefObject<HTMLElement> = {
    get current() {
      return state.panelRef.current ?? internalDialogRef.current
    },
  }

  let mainTreeNode = useMainTreeNode()
  let { resolveContainers: resolveRootContainers } = useRootContainers({
    mainTreeNode,
    portals,
    defaultContainers: [defaultContainer],
  })

  // When the `Dialog` is wrapped in a `Transition` (or another Headless UI component that exposes
  // the OpenClosed state) then we get some information via context about its state. When the
  // `Transition` is about to close, then the `State.Closing` state will be exposed. This allows us
  // to enable/disable certain functionality in the `Dialog` upfront instead of waiting until the
  // `Transition` is done transitioning.
  let isClosing =
    usesOpenClosedState !== null ? (usesOpenClosedState & State.Closing) === State.Closing : false

  // Ensure other elements can't be interacted with
  let inertOthersEnabled = __demoMode ? false : isClosing ? false : enabled
  useInertOthers(inertOthersEnabled, {
    allowed: useEvent(() => [
      // Allow the headlessui-portal of the Dialog to be interactive. This
      // contains the current dialog and the necessary focus guard elements.
      internalDialogRef.current?.closest<HTMLElement>('[data-headlessui-portal]') ?? null,
    ]),
    disallowed: useEvent(() => [
      // Disallow the "main" tree root node
      mainTreeNode?.closest<HTMLElement>('body > *:not(#headlessui-portal-root)') ?? null,
    ]),
  })

  // Ensure that the Dialog is the top layer when it is opened.
  //
  // In a perfect world this is pushed / popped when we open / close the Dialog
  // for within an event listener. But since the state is controlled by the
  // user, this is the next best thing to do.
  let stackMachine = stackMachines.get(null)
  useIsoMorphicEffect(() => {
    if (!enabled) return

    stackMachine.actions.push(id)
    return () => stackMachine.actions.pop(id)
  }, [stackMachine, id, enabled])

  // Check if the dialog is the current top layer
  let isTopLayer = useSlice(
    stackMachine,
    useCallback((state) => stackMachine.selectors.isTop(state, id), [stackMachine, id])
  )

  // Close Dialog on outside click
  useOutsideClick(isTopLayer, resolveRootContainers, (event) => {
    event.preventDefault()
    close()
  })

  // Handle `Escape` to close
  useEscape(isTopLayer, ownerDocument?.defaultView, (event) => {
    event.preventDefault()
    event.stopPropagation()

    // Ensure that we blur the current activeElement to prevent maintaining
    // focus and potentially scrolling the page to the end (because the Dialog
    // is rendered in a Portal at the end of the document.body and the browser
    // tries to keep the focused element in view)
    //
    // Typically only happens in Safari.
    if (
      document.activeElement &&
      'blur' in document.activeElement &&
      typeof document.activeElement.blur === 'function'
    ) {
      document.activeElement.blur()
    }

    close()
  })

  // Scroll lock
  let scrollLockEnabled = __demoMode ? false : isClosing ? false : enabled
  useScrollLock(scrollLockEnabled, ownerDocument, resolveRootContainers)

  // Ensure we close the dialog as soon as the dialog itself becomes hidden
  useOnDisappear(enabled, internalDialogRef, close)

  let [describedby, DescriptionProvider] = useDescriptions()

  let contextBag = useMemo<ContextType<typeof DialogContext>>(
    () => [{ dialogState, close, setTitleId, unmount }, state],
    [dialogState, state, close, setTitleId, unmount]
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
    'aria-modal': __demoMode ? undefined : dialogState === DialogStates.Open ? true : undefined,
    'aria-labelledby': state.titleId,
    'aria-describedby': describedby,
    unmount,
  }

  let shouldMoveFocusInside = !useIsTouchDevice()
  let focusTrapFeatures = FocusTrapFeatures.None

  if (enabled && !__demoMode) {
    focusTrapFeatures |= FocusTrapFeatures.RestoreFocus
    focusTrapFeatures |= FocusTrapFeatures.TabLock

    if (autoFocus) {
      focusTrapFeatures |= FocusTrapFeatures.AutoFocus
    }

    if (shouldMoveFocusInside) {
      focusTrapFeatures |= FocusTrapFeatures.InitialFocus
    }
  }

  let render = useRender()

  return (
    <ResetOpenClosedProvider>
      <ForcePortalRoot force={true}>
        <Portal>
          <DialogContext.Provider value={contextBag}>
            <PortalGroup target={internalDialogRef}>
              <ForcePortalRoot force={false}>
                <DescriptionProvider slot={slot}>
                  <PortalWrapper>
                    <FocusTrap
                      initialFocus={initialFocus}
                      initialFocusFallback={internalDialogRef}
                      containers={resolveRootContainers}
                      features={focusTrapFeatures}
                    >
                      <CloseProvider value={close}>
                        {render({
                          ourProps,
                          theirProps,
                          slot,
                          defaultTag: DEFAULT_DIALOG_TAG,
                          features: DialogRenderFeatures,
                          visible: dialogState === DialogStates.Open,
                          name: 'Dialog',
                        })}
                      </CloseProvider>
                    </FocusTrap>
                  </PortalWrapper>
                </DescriptionProvider>
              </ForcePortalRoot>
            </PortalGroup>
          </DialogContext.Provider>
        </Portal>
      </ForcePortalRoot>
    </ResetOpenClosedProvider>
  )
})

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
    onClose: (value: boolean) => void
    initialFocus?: MutableRefObject<HTMLElement | null>
    role?: 'dialog' | 'alertdialog'
    autoFocus?: boolean
    transition?: boolean
    __demoMode?: boolean
  }
>

function DialogFn<TTag extends ElementType = typeof DEFAULT_DIALOG_TAG>(
  props: DialogProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { transition = false, open, ...rest } = props

  // Validations
  let usesOpenClosedState = useOpenClosed()
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

  if (!usesOpenClosedState && typeof props.open !== 'boolean') {
    throw new Error(
      `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${props.open}`
    )
  }

  if (typeof props.onClose !== 'function') {
    throw new Error(
      `You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${props.onClose}`
    )
  }

  if ((open !== undefined || transition) && !rest.static) {
    return (
      <MainTreeProvider>
        <Transition show={open} transition={transition} unmount={rest.unmount}>
          <InternalDialog ref={ref} {...rest} />
        </Transition>
      </MainTreeProvider>
    )
  }

  return (
    <MainTreeProvider>
      <InternalDialog ref={ref} open={open} {...rest} />
    </MainTreeProvider>
  )
}

// ---

let DEFAULT_PANEL_TAG = 'div' as const
type PanelRenderPropArg = {
  open: boolean
}

export type DialogPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
  TTag,
  PanelRenderPropArg,
  never,
  { transition?: boolean }
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: DialogPanelProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let { id = `headlessui-dialog-panel-${internalId}`, transition = false, ...theirProps } = props
  let [{ dialogState, unmount }, state] = useDialogContext('Dialog.Panel')
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

  let Wrapper = transition ? TransitionChild : Fragment
  let wrapperProps = transition ? { unmount } : {}

  let render = useRender()

  return (
    <Wrapper {...wrapperProps}>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_PANEL_TAG,
        name: 'Dialog.Panel',
      })}
    </Wrapper>
  )
}

// ---

let DEFAULT_BACKDROP_TAG = 'div' as const
type BackdropRenderPropArg = {
  open: boolean
}

export type DialogBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<
  TTag,
  BackdropRenderPropArg,
  never,
  { transition?: boolean }
>

function BackdropFn<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(
  props: DialogBackdropProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { transition = false, ...theirProps } = props
  let [{ dialogState, unmount }] = useDialogContext('Dialog.Backdrop')

  let slot = useMemo(
    () => ({ open: dialogState === DialogStates.Open }) satisfies BackdropRenderPropArg,
    [dialogState]
  )

  let ourProps = { ref, 'aria-hidden': true }

  let Wrapper = transition ? TransitionChild : Fragment
  let wrapperProps = transition ? { unmount } : {}

  let render = useRender()

  return (
    <Wrapper {...wrapperProps}>
      {render({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_BACKDROP_TAG,
        name: 'Dialog.Backdrop',
      })}
    </Wrapper>
  )
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
  ref: Ref<HTMLElement>
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

  let render = useRender()

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
  ): React.JSX.Element
}

export interface _internal_ComponentDialogPanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: DialogPanelProps<TTag> & RefProp<typeof PanelFn>
  ): React.JSX.Element
}

export interface _internal_ComponentDialogBackdrop extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(
    props: DialogBackdropProps<TTag> & RefProp<typeof BackdropFn>
  ): React.JSX.Element
}

export interface _internal_ComponentDialogTitle extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TITLE_TAG>(
    props: DialogTitleProps<TTag> & RefProp<typeof TitleFn>
  ): React.JSX.Element
}

export interface _internal_ComponentDialogDescription extends _internal_ComponentDescription {}

let DialogRoot = forwardRefWithAs(DialogFn) as _internal_ComponentDialog
export let DialogPanel = forwardRefWithAs(PanelFn) as _internal_ComponentDialogPanel
export let DialogBackdrop = forwardRefWithAs(BackdropFn) as _internal_ComponentDialogBackdrop
export let DialogTitle = forwardRefWithAs(TitleFn) as _internal_ComponentDialogTitle
/** @deprecated use `<Description>` instead of `<DialogDescription>` */
export let DialogDescription = Description as _internal_ComponentDialogDescription

export let Dialog = Object.assign(DialogRoot, {
  /** @deprecated use `<DialogPanel>` instead of `<Dialog.Panel>` */
  Panel: DialogPanel,
  /** @deprecated use `<DialogTitle>` instead of `<Dialog.Title>` */
  Title: DialogTitle,
  /** @deprecated use `<Description>` instead of `<Dialog.Description>` */
  Description: Description as _internal_ComponentDialogDescription,
})
