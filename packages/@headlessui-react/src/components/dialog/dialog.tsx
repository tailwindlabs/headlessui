// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,

  // Types
  ContextType,
  ElementType,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MutableRefObject,
  Ref,
} from 'react'

import { Props } from '../../types'
import { match } from '../../utils/match'
import { forwardRefWithAs, render, Features, PropsForFeatures } from '../../utils/render'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Keys } from '../keyboard'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { useId } from '../../hooks/use-id'
import { useFocusTrap } from '../../hooks/use-focus-trap'
import { useInertOthers } from '../../hooks/use-inert-others'
import { Portal } from '../../components/portal/portal'
import { StackProvider, StackMessage } from '../../internal/stack-context'
import { ForcePortalRoot } from '../../internal/portal-force-root'
import { contains } from '../../internal/dom-containers'
import { Description, useDescriptions } from '../description/description'
import { useWindowEvent } from '../../hooks/use-window-event'

enum DialogStates {
  Open,
  Closed,
}

interface StateDefinition {
  titleId: string | null
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
      StateDefinition
    ]
  | null
>(null)
DialogContext.displayName = 'DialogContext'

function useDialogContext(component: string) {
  let context = useContext(DialogContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Dialog.displayName} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_DIALOG_TAG = 'div' as const
interface DialogRenderPropArg {
  open: boolean
}
type DialogPropsWeControl =
  | 'id'
  | 'role'
  | 'aria-modal'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'onClick'

let DialogRenderFeatures = Features.RenderStrategy | Features.Static

let DialogRoot = forwardRefWithAs(function Dialog<
  TTag extends ElementType = typeof DEFAULT_DIALOG_TAG
>(
  props: Props<TTag, DialogRenderPropArg, DialogPropsWeControl> &
    PropsForFeatures<typeof DialogRenderFeatures> & {
      open: boolean
      onClose(value: boolean): void
      initialFocus?: MutableRefObject<HTMLElement | null>
    },
  ref: Ref<HTMLDivElement>
) {
  let { open, onClose, initialFocus, ...rest } = props

  let containers = useRef<Set<HTMLElement>>(new Set())
  let internalDialogRef = useRef<HTMLDivElement | null>(null)
  let dialogRef = useSyncRefs(internalDialogRef, ref)

  // Validations
  let hasOpen = props.hasOwnProperty('open')
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
  } as StateDefinition)

  let close = useCallback(() => onClose(false), [onClose])

  let setTitleId = useCallback(
    (id: string | null) => dispatch({ type: ActionTypes.SetTitleId, id }),
    [dispatch]
  )

  // Handle outside click
  useWindowEvent('mousedown', event => {
    let target = event.target as HTMLElement

    if (dialogState !== DialogStates.Open) return
    if (containers.current.size !== 1) return
    if (contains(containers.current, target)) return

    close()
  })

  // Scroll lock
  useEffect(() => {
    if (dialogState !== DialogStates.Open) return

    let overflow = document.documentElement.style.overflow
    let paddingRight = document.documentElement.style.paddingRight

    let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.documentElement.style.overflow = overflow
      document.documentElement.style.paddingRight = paddingRight
    }
  }, [dialogState])

  // Trigger close when the FocusTrap gets hidden
  useEffect(() => {
    if (dialogState !== DialogStates.Open) return
    if (!internalDialogRef.current) return

    let observer = new IntersectionObserver(entries => {
      for (let entry of entries) {
        if (
          entry.boundingClientRect.x === 0 &&
          entry.boundingClientRect.y === 0 &&
          entry.boundingClientRect.width === 0 &&
          entry.boundingClientRect.height === 0
        ) {
          close()
        }
      }
    })

    observer.observe(internalDialogRef.current)

    return () => observer.disconnect()
  }, [dialogState, internalDialogRef, close])

  let enabled = dialogState === DialogStates.Open

  useFocusTrap(containers, enabled, { initialFocus })
  useInertOthers(internalDialogRef, enabled)
  let [describedby, DescriptionProvider] = useDescriptions()

  let id = `headlessui-dialog-${useId()}`

  let contextBag = useMemo<ContextType<typeof DialogContext>>(
    () => [{ dialogState, close, setTitleId }, state],
    [dialogState, state, close, setTitleId]
  )

  let slot = useMemo<DialogRenderPropArg>(() => ({ open: dialogState === DialogStates.Open }), [
    dialogState,
  ])

  let propsWeControl = {
    ref: dialogRef,
    id,
    role: 'dialog',
    'aria-modal': dialogState === DialogStates.Open ? true : undefined,
    'aria-labelledby': state.titleId,
    'aria-describedby': describedby,
    onClick(event: ReactMouseEvent) {
      event.stopPropagation()
    },

    // Handle `Escape` to close
    onKeyDown(event: ReactKeyboardEvent) {
      if (event.key !== Keys.Escape) return
      if (dialogState !== DialogStates.Open) return
      if (containers.current.size > 1) return // 1 is myself, otherwise other elements in the Stack
      event.preventDefault()
      event.stopPropagation()
      close()
    },
  }
  let passthroughProps = rest

  return (
    <StackProvider
      onUpdate={(message, element) => {
        return match(message, {
          [StackMessage.AddElement]() {
            containers.current.add(element)
          },
          [StackMessage.RemoveElement]() {
            containers.current.delete(element)
          },
        })
      }}
    >
      <ForcePortalRoot force={true}>
        <Portal>
          <DialogContext.Provider value={contextBag}>
            <Portal.Group target={internalDialogRef}>
              <ForcePortalRoot force={false}>
                <DescriptionProvider slot={slot} name="Dialog.Description">
                  {render({
                    props: { ...passthroughProps, ...propsWeControl },
                    slot,
                    defaultTag: DEFAULT_DIALOG_TAG,
                    features: DialogRenderFeatures,
                    visible: dialogState === DialogStates.Open,
                    name: 'Dialog',
                  })}
                </DescriptionProvider>
              </ForcePortalRoot>
            </Portal.Group>
          </DialogContext.Provider>
        </Portal>
      </ForcePortalRoot>
    </StackProvider>
  )
})

// ---

let DEFAULT_OVERLAY_TAG = 'div' as const
interface OverlayRenderPropArg {
  open: boolean
}
type OverlayPropsWeControl = 'id' | 'aria-hidden' | 'onClick'

let Overlay = forwardRefWithAs(function Overlay<
  TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG
>(props: Props<TTag, OverlayRenderPropArg, OverlayPropsWeControl>, ref: Ref<HTMLDivElement>) {
  let [{ dialogState, close }] = useDialogContext([Dialog.displayName, Overlay.name].join('.'))
  let overlayRef = useSyncRefs(ref)

  let id = `headlessui-dialog-overlay-${useId()}`

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      event.preventDefault()
      event.stopPropagation()
      close()
    },
    [close]
  )

  let slot = useMemo<OverlayRenderPropArg>(() => ({ open: dialogState === DialogStates.Open }), [
    dialogState,
  ])
  let propsWeControl = {
    ref: overlayRef,
    id,
    'aria-hidden': true,
    onClick: handleClick,
  }
  let passthroughProps = props

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_OVERLAY_TAG,
    name: 'Dialog.Overlay',
  })
})

// ---

let DEFAULT_TITLE_TAG = 'h2' as const
interface TitleRenderPropArg {
  open: boolean
}
type TitlePropsWeControl = 'id'

function Title<TTag extends ElementType = typeof DEFAULT_TITLE_TAG>(
  props: Props<TTag, TitleRenderPropArg, TitlePropsWeControl>
) {
  let [{ dialogState, setTitleId }] = useDialogContext([Dialog.displayName, Title.name].join('.'))

  let id = `headlessui-dialog-title-${useId()}`

  useEffect(() => {
    setTitleId(id)
    return () => setTitleId(null)
  }, [id, setTitleId])

  let slot = useMemo<TitleRenderPropArg>(() => ({ open: dialogState === DialogStates.Open }), [
    dialogState,
  ])
  let propsWeControl = { id }
  let passthroughProps = props

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_TITLE_TAG,
    name: 'Dialog.Title',
  })
}

// ---

export let Dialog = Object.assign(DialogRoot, { Overlay, Title, Description })
