'use client'

// WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ContextType,
  type Dispatch,
  type ElementType,
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { optionalRef, useSyncRefs } from '../../hooks/use-sync-refs'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  render,
  useMergeRefsFn,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { startTransition } from '../../utils/start-transition'
import { Keys } from '../keyboard'

enum DisclosureStates {
  Open,
  Closed,
}

interface StateDefinition {
  disclosureState: DisclosureStates

  linkedPanel: boolean

  buttonRef: MutableRefObject<HTMLButtonElement | null>
  panelRef: MutableRefObject<HTMLDivElement | null>

  buttonId: string | null
  panelId: string | null
}

enum ActionTypes {
  ToggleDisclosure,
  CloseDisclosure,

  SetButtonId,
  SetPanelId,

  LinkPanel,
  UnlinkPanel,
}

type Actions =
  | { type: ActionTypes.ToggleDisclosure }
  | { type: ActionTypes.CloseDisclosure }
  | { type: ActionTypes.SetButtonId; buttonId: string | null }
  | { type: ActionTypes.SetPanelId; panelId: string | null }
  | { type: ActionTypes.LinkPanel }
  | { type: ActionTypes.UnlinkPanel }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.ToggleDisclosure]: (state) => ({
    ...state,
    disclosureState: match(state.disclosureState, {
      [DisclosureStates.Open]: DisclosureStates.Closed,
      [DisclosureStates.Closed]: DisclosureStates.Open,
    }),
  }),
  [ActionTypes.CloseDisclosure]: (state) => {
    if (state.disclosureState === DisclosureStates.Closed) return state
    return { ...state, disclosureState: DisclosureStates.Closed }
  },
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
    let err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext)
    throw err
  }
  return context
}

let DisclosureAPIContext = createContext<{
  close(focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>): void
} | null>(null)
DisclosureAPIContext.displayName = 'DisclosureAPIContext'

function useDisclosureAPIContext(component: string) {
  let context = useContext(DisclosureAPIContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureAPIContext)
    throw err
  }
  return context
}

let DisclosurePanelContext = createContext<string | null>(null)
DisclosurePanelContext.displayName = 'DisclosurePanelContext'

function useDisclosurePanelContext() {
  return useContext(DisclosurePanelContext)
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_DISCLOSURE_TAG = Fragment
type DisclosureRenderPropArg = {
  open: boolean
  close(focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>): void
}
type DisclosurePropsWeControl = never

export type DisclosureProps<TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG> = Props<
  TTag,
  DisclosureRenderPropArg,
  DisclosurePropsWeControl,
  {
    defaultOpen?: boolean
  }
>

function DisclosureFn<TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(
  props: DisclosureProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { defaultOpen = false, ...theirProps } = props
  let internalDisclosureRef = useRef<HTMLElement | null>(null)
  let disclosureRef = useSyncRefs(
    ref,
    optionalRef(
      (ref) => {
        internalDisclosureRef.current = ref as unknown as HTMLElement | null
      },
      props.as === undefined ||
        // @ts-expect-error The `as` prop _can_ be a Fragment
        props.as === Fragment
    )
  )

  let panelRef = useRef<StateDefinition['panelRef']['current']>(null)
  let buttonRef = useRef<StateDefinition['buttonRef']['current']>(null)

  let reducerBag = useReducer(stateReducer, {
    disclosureState: defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed,
    linkedPanel: false,
    buttonRef,
    panelRef,
    buttonId: null,
    panelId: null,
  } as StateDefinition)
  let [{ disclosureState, buttonId }, dispatch] = reducerBag

  let close = useEvent((focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => {
    dispatch({ type: ActionTypes.CloseDisclosure })
    let ownerDocument = getOwnerDocument(internalDisclosureRef)
    if (!ownerDocument) return
    if (!buttonId) return

    let restoreElement = (() => {
      if (!focusableElement) return ownerDocument.getElementById(buttonId)
      if (focusableElement instanceof HTMLElement) return focusableElement
      if (focusableElement.current instanceof HTMLElement) return focusableElement.current

      return ownerDocument.getElementById(buttonId)
    })()

    restoreElement?.focus()
  })

  let api = useMemo<ContextType<typeof DisclosureAPIContext>>(() => ({ close }), [close])

  let slot = useMemo(
    () =>
      ({
        open: disclosureState === DisclosureStates.Open,
        close,
      }) satisfies DisclosureRenderPropArg,
    [disclosureState, close]
  )

  let ourProps = {
    ref: disclosureRef,
  }

  return (
    <DisclosureContext.Provider value={reducerBag}>
      <DisclosureAPIContext.Provider value={api}>
        <OpenClosedProvider
          value={match(disclosureState, {
            [DisclosureStates.Open]: State.Open,
            [DisclosureStates.Closed]: State.Closed,
          })}
        >
          {render({
            ourProps,
            theirProps,
            slot,
            defaultTag: DEFAULT_DISCLOSURE_TAG,
            name: 'Disclosure',
          })}
        </OpenClosedProvider>
      </DisclosureAPIContext.Provider>
    </DisclosureContext.Provider>
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
type ButtonRenderPropArg = {
  open: boolean
  hover: boolean
  active: boolean
  focus: boolean
  autofocus: boolean
}
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded'

export type DisclosureButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    disabled?: boolean
    autoFocus?: boolean
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: DisclosureButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let { id = `headlessui-disclosure-button-${internalId}`, ...theirProps } = props
  let [state, dispatch] = useDisclosureContext('Disclosure.Button')
  let panelContext = useDisclosurePanelContext()
  let isWithinPanel = panelContext === null ? false : panelContext === state.panelId

  let internalButtonRef = useRef<HTMLButtonElement | null>(null)
  let buttonRef = useSyncRefs(internalButtonRef, ref, !isWithinPanel ? state.buttonRef : null)
  let mergeRefs = useMergeRefsFn()

  useEffect(() => {
    if (isWithinPanel) return

    dispatch({ type: ActionTypes.SetButtonId, buttonId: id })
    return () => {
      dispatch({ type: ActionTypes.SetButtonId, buttonId: null })
    }
  }, [id, dispatch, isWithinPanel])

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isWithinPanel) {
      if (state.disclosureState === DisclosureStates.Closed) return

      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.ToggleDisclosure })
          state.buttonRef.current?.focus()
          break
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.ToggleDisclosure })
          break
      }
    }
  })

  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  })

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return
    if (props.disabled) return

    if (isWithinPanel) {
      dispatch({ type: ActionTypes.ToggleDisclosure })
      state.buttonRef.current?.focus()
    } else {
      dispatch({ type: ActionTypes.ToggleDisclosure })
    }
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: props.disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: props.disabled ?? false })

  let slot = useMemo(
    () =>
      ({
        open: state.disclosureState === DisclosureStates.Open,
        hover,
        active,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies ButtonRenderPropArg,
    [state, hover, active, focus, props.autoFocus]
  )

  let type = useResolveButtonType(props, internalButtonRef)
  let ourProps = isWithinPanel
    ? mergeProps(
        {
          ref: buttonRef,
          type,
          onKeyDown: handleKeyDown,
          onClick: handleClick,
        },
        focusProps,
        hoverProps,
        pressProps
      )
    : mergeProps(
        {
          ref: buttonRef,
          id,
          type,
          'aria-expanded': state.disclosureState === DisclosureStates.Open,
          'aria-controls': state.linkedPanel ? state.panelId : undefined,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
          onClick: handleClick,
        },
        focusProps,
        hoverProps,
        pressProps
      )

  return render({
    mergeRefs,
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Disclosure.Button',
  })
}

// ---

let DEFAULT_PANEL_TAG = 'div' as const
type PanelRenderPropArg = {
  open: boolean
  close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void
}
type DisclosurePanelPropsWeControl = never

let PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type DisclosurePanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
  TTag,
  PanelRenderPropArg,
  DisclosurePanelPropsWeControl,
  PropsForFeatures<typeof PanelRenderFeatures>
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: DisclosurePanelProps<TTag>,
  ref: Ref<HTMLDivElement>
) {
  let internalId = useId()
  let { id = `headlessui-disclosure-panel-${internalId}`, ...theirProps } = props
  let [state, dispatch] = useDisclosureContext('Disclosure.Panel')
  let { close } = useDisclosureAPIContext('Disclosure.Panel')
  let mergeRefs = useMergeRefsFn()

  let panelRef = useSyncRefs(ref, state.panelRef, (el) => {
    startTransition(() => dispatch({ type: el ? ActionTypes.LinkPanel : ActionTypes.UnlinkPanel }))
  })

  useEffect(() => {
    dispatch({ type: ActionTypes.SetPanelId, panelId: id })
    return () => {
      dispatch({ type: ActionTypes.SetPanelId, panelId: null })
    }
  }, [id, dispatch])

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return state.disclosureState === DisclosureStates.Open
  })()

  let slot = useMemo(
    () =>
      ({
        open: state.disclosureState === DisclosureStates.Open,
        close,
      }) satisfies PanelRenderPropArg,
    [state, close]
  )

  let ourProps = {
    ref: panelRef,
    id,
  }

  return (
    <DisclosurePanelContext.Provider value={state.panelId}>
      {render({
        mergeRefs,
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_PANEL_TAG,
        features: PanelRenderFeatures,
        visible,
        name: 'Disclosure.Panel',
      })}
    </DisclosurePanelContext.Provider>
  )
}

// ---

export interface _internal_ComponentDisclosure extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(
    props: DisclosureProps<TTag> & RefProp<typeof DisclosureFn>
  ): JSX.Element
}

export interface _internal_ComponentDisclosureButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: DisclosureButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

export interface _internal_ComponentDisclosurePanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: DisclosurePanelProps<TTag> & RefProp<typeof PanelFn>
  ): JSX.Element
}

let DisclosureRoot = forwardRefWithAs(DisclosureFn) as unknown as _internal_ComponentDisclosure
export let DisclosureButton = forwardRefWithAs(
  ButtonFn
) as unknown as _internal_ComponentDisclosureButton
export let DisclosurePanel = forwardRefWithAs(
  PanelFn
) as unknown as _internal_ComponentDisclosurePanel

export let Disclosure = Object.assign(DisclosureRoot, {
  Button: DisclosureButton,
  Panel: DisclosurePanel,
})
