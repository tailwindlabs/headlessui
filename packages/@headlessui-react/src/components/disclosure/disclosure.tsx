// WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#disclosure
import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,

  // Types
  Dispatch,
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  Ref,
} from 'react'

import { Props } from '../../types'
import { match } from '../../utils/match'
import { forwardRefWithAs, render, Features, PropsForFeatures } from '../../utils/render'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useId } from '../../hooks/use-id'
import { Keys } from '../keyboard'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'

enum DisclosureStates {
  Open,
  Closed,
}

interface StateDefinition {
  disclosureState: DisclosureStates

  linkedPanel: boolean

  buttonId: string
  panelId: string
}

enum ActionTypes {
  ToggleDisclosure,

  SetButtonId,
  SetPanelId,

  LinkPanel,
  UnlinkPanel,
}

type Actions =
  | { type: ActionTypes.ToggleDisclosure }
  | { type: ActionTypes.SetButtonId; buttonId: string }
  | { type: ActionTypes.SetPanelId; panelId: string }
  | { type: ActionTypes.LinkPanel }
  | { type: ActionTypes.UnlinkPanel }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.ToggleDisclosure]: state => ({
    ...state,
    disclosureState: match(state.disclosureState, {
      [DisclosureStates.Open]: DisclosureStates.Closed,
      [DisclosureStates.Closed]: DisclosureStates.Open,
    }),
  }),
  [ActionTypes.LinkPanel](state) {
    if (state.linkedPanel === true) return state
    return { ...state, linkedPanel: true }
  },
  [ActionTypes.UnlinkPanel](state) {
    if (state.linkedPanel === false) return state
    return { ...state, linkedPanel: false }
  },
  [ActionTypes.SetButtonId](state, action) {
    if (state.buttonId === action.buttonId) return state
    return { ...state, buttonId: action.buttonId }
  },
  [ActionTypes.SetPanelId](state, action) {
    if (state.panelId === action.panelId) return state
    return { ...state, panelId: action.panelId }
  },
}

let DisclosureContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
DisclosureContext.displayName = 'DisclosureContext'

function useDisclosureContext(component: string) {
  let context = useContext(DisclosureContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Disclosure.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_DISCLOSURE_TAG = Fragment
interface DisclosureRenderPropArg {
  open: boolean
}

export function Disclosure<TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(
  props: Props<TTag, DisclosureRenderPropArg> & {
    defaultOpen?: boolean
  }
) {
  let { defaultOpen = false, ...passthroughProps } = props
  let buttonId = `headlessui-disclosure-button-${useId()}`
  let panelId = `headlessui-disclosure-panel-${useId()}`

  let reducerBag = useReducer(stateReducer, {
    disclosureState: defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed,
    linkedPanel: false,
    buttonId,
    panelId,
  } as StateDefinition)
  let [{ disclosureState }, dispatch] = reducerBag

  useEffect(() => dispatch({ type: ActionTypes.SetButtonId, buttonId }), [buttonId, dispatch])
  useEffect(() => dispatch({ type: ActionTypes.SetPanelId, panelId }), [panelId, dispatch])

  let slot = useMemo<DisclosureRenderPropArg>(
    () => ({ open: disclosureState === DisclosureStates.Open }),
    [disclosureState]
  )

  return (
    <DisclosureContext.Provider value={reducerBag}>
      <OpenClosedProvider
        value={match(disclosureState, {
          [DisclosureStates.Open]: State.Open,
          [DisclosureStates.Closed]: State.Closed,
        })}
      >
        {render({
          props: passthroughProps,
          slot,
          defaultTag: DEFAULT_DISCLOSURE_TAG,
          name: 'Disclosure',
        })}
      </OpenClosedProvider>
    </DisclosureContext.Provider>
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
  let [state, dispatch] = useDisclosureContext([Disclosure.name, Button.name].join('.'))
  let buttonRef = useSyncRefs(ref)

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.ToggleDisclosure })
          break
      }
    },
    [dispatch]
  )

  let handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }, [])

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return
      if (props.disabled) return
      dispatch({ type: ActionTypes.ToggleDisclosure })
    },
    [dispatch, props.disabled]
  )

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.disclosureState === DisclosureStates.Open }),
    [state]
  )

  let passthroughProps = props
  let propsWeControl = {
    ref: buttonRef,
    id: state.buttonId,
    type: 'button',
    'aria-expanded': state.disclosureState === DisclosureStates.Open ? true : undefined,
    'aria-controls': state.linkedPanel ? state.panelId : undefined,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Disclosure.Button',
  })
})

// ---

let DEFAULT_PANEL_TAG = 'div' as const
interface PanelRenderPropArg {
  open: boolean
}
type PanelPropsWeControl = 'id'

let PanelRenderFeatures = Features.RenderStrategy | Features.Static

let Panel = forwardRefWithAs(function Panel<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: Props<TTag, PanelRenderPropArg, PanelPropsWeControl> &
    PropsForFeatures<typeof PanelRenderFeatures>,
  ref: Ref<HTMLDivElement>
) {
  let [state, dispatch] = useDisclosureContext([Disclosure.name, Panel.name].join('.'))
  let panelRef = useSyncRefs(ref, () => {
    if (state.linkedPanel) return
    dispatch({ type: ActionTypes.LinkPanel })
  })

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return state.disclosureState === DisclosureStates.Open
  })()

  // Unlink on "unmount" myself
  useEffect(() => () => dispatch({ type: ActionTypes.UnlinkPanel }), [dispatch])

  // Unlink on "unmount" children
  useEffect(() => {
    if (state.disclosureState === DisclosureStates.Closed && (props.unmount ?? true)) {
      dispatch({ type: ActionTypes.UnlinkPanel })
    }
  }, [state.disclosureState, props.unmount, dispatch])

  let slot = useMemo<PanelRenderPropArg>(
    () => ({ open: state.disclosureState === DisclosureStates.Open }),
    [state]
  )
  let propsWeControl = {
    ref: panelRef,
    id: state.panelId,
  }
  let passthroughProps = props

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_PANEL_TAG,
    features: PanelRenderFeatures,
    visible,
    name: 'Disclosure.Panel',
  })
})

// ---

Disclosure.Button = Button
Disclosure.Panel = Panel
