// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
import React, {
  createContext,
  useContext,
  Fragment,
  useReducer,
  useMemo,
  useCallback,

  // Types
  Dispatch,
  ElementType,
  Ref,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
} from 'react'

import { Props } from '../../types'
import { match } from '../../utils/match'
import { forwardRefWithAs, render, Features, PropsForFeatures } from '../../utils/render'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Keys } from '../keyboard'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { useId } from '../../hooks/use-id'
import { useFocusTrap } from '../../hooks/use-focus-trap'

enum DialogStates {
  Open,
  Closed,
}

interface StateDefinition {
  dialogState: DialogStates
}

enum ActionTypes {
  ToggleDialog,
  CloseDialog,
}

type Actions = { type: ActionTypes.ToggleDialog } | { type: ActionTypes.CloseDialog }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.ToggleDialog]: state => ({
    ...state,
    dialogState: match(state.dialogState, {
      [DialogStates.Open]: DialogStates.Closed,
      [DialogStates.Closed]: DialogStates.Open,
    }),
  }),
  [ActionTypes.CloseDialog]: state => ({ ...state, dialogState: DialogStates.Closed }),
}

let DialogContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
DialogContext.displayName = 'DialogContext'

function useDialogContext(component: string) {
  let context = useContext(DialogContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Dialog.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_DISCLOSURE_TAG = Fragment
interface DialogRenderPropArg {
  open: boolean
  close(): void
}

export function Dialog<TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(
  props: Props<TTag, DialogRenderPropArg>
) {
  let reducerBag = useReducer(stateReducer, {
    dialogState: DialogStates.Closed,
  } as StateDefinition)
  let [{ dialogState }, dispatch] = reducerBag

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key !== Keys.Escape) return
      if (dialogState !== DialogStates.Open) return

      dispatch({ type: ActionTypes.CloseDialog })
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch, dialogState])

  let propsBag = useMemo(() => ({ open: dialogState === DialogStates.Open }), [dialogState])

  return (
    <DialogContext.Provider value={reducerBag}>
      {render(props, propsBag, DEFAULT_DISCLOSURE_TAG)}
    </DialogContext.Provider>
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
}
type ButtonPropsWeControl =
  | 'id'
  | 'type'
  | 'aria-expanded'
  | 'aria-controls'
  | 'onKeyDown'
  | 'onClick'

let Button = forwardRefWithAs(function Button<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: Ref<HTMLButtonElement>
) {
  let [state, dispatch] = useDialogContext([Dialog.name, Button.name].join('.'))
  let buttonRef = useSyncRefs(ref)

  let id = `headlessui-dialog-button-${useId()}`

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      if (props.disabled) return

      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault()
          dispatch({ type: ActionTypes.ToggleDialog })
          break
      }
    },
    [dispatch, props.disabled]
  )

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return
      if (props.disabled) return
      dispatch({ type: ActionTypes.ToggleDialog })
    },
    [dispatch, props.disabled]
  )

  let propsBag = useMemo(() => ({ open: state.dialogState === DialogStates.Open }), [state])

  let passthroughProps = props
  let propsWeControl = {
    ref: buttonRef,
    id,
    type: 'button',
    onKeyDown: handleKeyDown,
    onClick: handleClick,
  }

  return render({ ...passthroughProps, ...propsWeControl }, propsBag, DEFAULT_BUTTON_TAG)
})

// ---

let DEFAULT_PANEL_TAG = 'div' as const
interface PanelRenderPropArg {
  open: boolean
  close(): void
}
type PanelPropsWeControl = 'id' | 'role' | 'aria-modal'

let PanelRenderFeatures = Features.RenderStrategy | Features.Static

let Panel = forwardRefWithAs(function Panel<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: Props<TTag, PanelRenderPropArg, PanelPropsWeControl> &
    PropsForFeatures<typeof PanelRenderFeatures>,
  ref: Ref<HTMLDivElement>
) {
  let [state, dispatch] = useDialogContext([Dialog.name, Panel.name].join('.'))
  let internalPanelRef = useRef<HTMLDivElement | null>(null)
  let panelRef = useSyncRefs(internalPanelRef, ref)

  let { handleKeyDown: handleFocusTrapKeyDown } = useFocusTrap(
    internalPanelRef,
    props.static ? true : state.dialogState === DialogStates.Open
  )

  let id = `headlessui-dialog-panel-${useId()}`

  let close = useCallback(() => dispatch({ type: ActionTypes.CloseDialog }), [dispatch])

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case Keys.Escape:
          event.preventDefault()
          dispatch({ type: ActionTypes.CloseDialog })
          break

        default:
          handleFocusTrapKeyDown(event)
      }
    },
    [dispatch, handleFocusTrapKeyDown]
  )

  let propsBag = useMemo(() => ({ open: state.dialogState === DialogStates.Open, close }), [
    state,
    close,
  ])
  let propsWeControl = {
    ref: panelRef,
    id,
    role: 'dialog',
    'aria-modal': true,
    onKeyDown: handleKeyDown,
  }
  let passthroughProps = props

  return render(
    { ...passthroughProps, ...propsWeControl },
    propsBag,
    DEFAULT_PANEL_TAG,
    PanelRenderFeatures,
    state.dialogState === DialogStates.Open
  )
})

// ---

let DEFAULT_OVERLAY_TAG = 'button' as const
interface OverlayRenderPropArg {
  open: boolean
  close(): void
}

let OverlayRenderFeatures = Features.RenderStrategy | Features.Static

let Overlay = forwardRefWithAs(function Overlay<
  TTag extends ElementType = typeof DEFAULT_OVERLAY_TAG
>(
  props: Props<TTag, OverlayRenderPropArg> & PropsForFeatures<typeof OverlayRenderFeatures>,
  ref: Ref<HTMLDivElement>
) {
  let [state, dispatch] = useDialogContext([Dialog.name, Overlay.name].join('.'))
  let panelRef = useSyncRefs(ref)

  let id = `headlessui-dialog-overlay-${useId()}`

  let close = useCallback(() => dispatch({ type: ActionTypes.CloseDialog }), [dispatch])

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      dispatch({ type: ActionTypes.CloseDialog })
    },
    [dispatch]
  )

  let propsBag = useMemo(() => ({ open: state.dialogState === DialogStates.Open, close }), [
    state,
    close,
  ])
  let propsWeControl = {
    ref: panelRef,
    id,
    onClick: handleClick,
  }
  let passthroughProps = props

  return render(
    { ...passthroughProps, ...propsWeControl },
    propsBag,
    DEFAULT_OVERLAY_TAG,
    OverlayRenderFeatures,
    state.dialogState === DialogStates.Open
  )
})

// ---

Dialog.Button = Button
Dialog.Panel = Panel
Dialog.Overlay = Overlay
