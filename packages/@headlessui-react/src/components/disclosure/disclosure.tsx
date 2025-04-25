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
  useState,
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
import { transitionDataAttributes, useTransition } from '../../hooks/use-transition'
import { CloseProvider } from '../../internal/close-provider'
import {
  OpenClosedProvider,
  ResetOpenClosedProvider,
  State,
  useOpenClosed,
} from '../../internal/open-closed'
import type { Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import * as DOM from '../../utils/dom'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  useRender,
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

  buttonElement: HTMLButtonElement | null
  panelElement: HTMLElement | null

  buttonId: string | null
  panelId: string | null
}

enum ActionTypes {
  ToggleDisclosure,
  CloseDisclosure,

  SetButtonId,
  SetPanelId,

  SetButtonElement,
  SetPanelElement,
}

type Actions =
  | { type: ActionTypes.ToggleDisclosure }
  | { type: ActionTypes.CloseDisclosure }
  | { type: ActionTypes.SetButtonId; buttonId: string | null }
  | { type: ActionTypes.SetPanelId; panelId: string | null }
  | { type: ActionTypes.SetButtonElement; element: HTMLButtonElement | null }
  | { type: ActionTypes.SetPanelElement; element: HTMLElement | null }

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
  [ActionTypes.SetButtonId](state, action) {
    if (state.buttonId === action.buttonId) return state
    return { ...state, buttonId: action.buttonId }
  },
  [ActionTypes.SetPanelId](state, action) {
    if (state.panelId === action.panelId) return state
    return { ...state, panelId: action.panelId }
  },
  [ActionTypes.SetButtonElement](state, action) {
    if (state.buttonElement === action.element) return state
    return { ...state, buttonElement: action.element }
  },
  [ActionTypes.SetPanelElement](state, action) {
    if (state.panelElement === action.element) return state
    return { ...state, panelElement: action.element }
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
  close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void
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
  close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void
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
        internalDisclosureRef.current = ref
      },
      props.as === undefined ||
        // @ts-expect-error The `as` prop _can_ be a Fragment
        props.as === Fragment
    )
  )

  let reducerBag = useReducer(stateReducer, {
    disclosureState: defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed,
    buttonElement: null,
    panelElement: null,
    buttonId: null,
    panelId: null,
  } as StateDefinition)
  let [{ disclosureState, buttonId }, dispatch] = reducerBag

  let close = useEvent(
    (focusableElement?: HTMLOrSVGElement | MutableRefObject<HTMLOrSVGElement | null>) => {
      dispatch({ type: ActionTypes.CloseDisclosure })
      let ownerDocument = getOwnerDocument(internalDisclosureRef)
      if (!ownerDocument) return
      if (!buttonId) return

      let restoreElement = (() => {
        if (!focusableElement) return ownerDocument.getElementById(buttonId)
        if (DOM.isHTMLorSVGElement(focusableElement)) return focusableElement
        if ('current' in focusableElement && DOM.isHTMLorSVGElement(focusableElement.current)) {
          return focusableElement.current
        }

        return ownerDocument.getElementById(buttonId)
      })()

      restoreElement?.focus()
    }
  )

  let api = useMemo<ContextType<typeof DisclosureAPIContext>>(() => ({ close }), [close])

  let slot = useMemo(() => {
    return {
      open: disclosureState === DisclosureStates.Open,
      close,
    } satisfies DisclosureRenderPropArg
  }, [disclosureState, close])

  let ourProps = {
    ref: disclosureRef,
  }

  let render = useRender()

  return (
    <DisclosureContext.Provider value={reducerBag}>
      <DisclosureAPIContext.Provider value={api}>
        <CloseProvider value={close}>
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
        </CloseProvider>
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
  disabled: boolean
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
  let {
    id = `headlessui-disclosure-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props
  let [state, dispatch] = useDisclosureContext('Disclosure.Button')
  let panelContext = useDisclosurePanelContext()
  let isWithinPanel = panelContext === null ? false : panelContext === state.panelId

  let internalButtonRef = useRef<HTMLButtonElement | null>(null)
  let buttonRef = useSyncRefs(
    internalButtonRef,
    ref,
    useEvent((element) => {
      if (isWithinPanel) return
      return dispatch({ type: ActionTypes.SetButtonElement, element })
    })
  )

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
          state.buttonElement?.focus()
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
    if (disabled) return

    if (isWithinPanel) {
      dispatch({ type: ActionTypes.ToggleDisclosure })
      state.buttonElement?.focus()
    } else {
      dispatch({ type: ActionTypes.ToggleDisclosure })
    }
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let slot = useMemo(() => {
    return {
      open: state.disclosureState === DisclosureStates.Open,
      hover,
      active,
      disabled,
      focus,
      autofocus: autoFocus,
    } satisfies ButtonRenderPropArg
  }, [state, hover, active, focus, disabled, autoFocus])

  let type = useResolveButtonType(props, state.buttonElement)
  let ourProps = isWithinPanel
    ? mergeProps(
        {
          ref: buttonRef,
          type,
          disabled: disabled || undefined,
          autoFocus,
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
          'aria-controls': state.panelElement ? state.panelId : undefined,
          disabled: disabled || undefined,
          autoFocus,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
          onClick: handleClick,
        },
        focusProps,
        hoverProps,
        pressProps
      )

  let render = useRender()

  return render({
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
  { transition?: boolean } & PropsForFeatures<typeof PanelRenderFeatures>
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: DisclosurePanelProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-disclosure-panel-${internalId}`,
    transition = false,
    ...theirProps
  } = props
  let [state, dispatch] = useDisclosureContext('Disclosure.Panel')
  let { close } = useDisclosureAPIContext('Disclosure.Panel')

  // To improve the correctness of transitions (timing related race conditions),
  // we track the element locally to this component, instead of relying on the
  // context value. This way, the component can re-render independently of the
  // parent component when the `useTransition(…)` hook performs a state change.
  let [localPanelElement, setLocalPanelElement] = useState<HTMLElement | null>(null)

  let panelRef = useSyncRefs(
    ref,
    useEvent((element) => {
      startTransition(() => dispatch({ type: ActionTypes.SetPanelElement, element }))
    }),
    setLocalPanelElement
  )

  useEffect(() => {
    dispatch({ type: ActionTypes.SetPanelId, panelId: id })
    return () => {
      dispatch({ type: ActionTypes.SetPanelId, panelId: null })
    }
  }, [id, dispatch])

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localPanelElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : state.disclosureState === DisclosureStates.Open
  )

  let slot = useMemo(() => {
    return {
      open: state.disclosureState === DisclosureStates.Open,
      close,
    } satisfies PanelRenderPropArg
  }, [state.disclosureState, close])

  let ourProps = {
    ref: panelRef,
    id,
    ...transitionDataAttributes(transitionData),
  }

  let render = useRender()

  return (
    <ResetOpenClosedProvider>
      <DisclosurePanelContext.Provider value={state.panelId}>
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_PANEL_TAG,
          features: PanelRenderFeatures,
          visible,
          name: 'Disclosure.Panel',
        })}
      </DisclosurePanelContext.Provider>
    </ResetOpenClosedProvider>
  )
}

// ---

export interface _internal_ComponentDisclosure extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(
    props: DisclosureProps<TTag> & RefProp<typeof DisclosureFn>
  ): React.JSX.Element
}

export interface _internal_ComponentDisclosureButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: DisclosureButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): React.JSX.Element
}

export interface _internal_ComponentDisclosurePanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: DisclosurePanelProps<TTag> & RefProp<typeof PanelFn>
  ): React.JSX.Element
}

let DisclosureRoot = forwardRefWithAs(DisclosureFn) as _internal_ComponentDisclosure
export let DisclosureButton = forwardRefWithAs(ButtonFn) as _internal_ComponentDisclosureButton
export let DisclosurePanel = forwardRefWithAs(PanelFn) as _internal_ComponentDisclosurePanel

export let Disclosure = Object.assign(DisclosureRoot, {
  /** @deprecated use `<DisclosureButton>` instead of `<Disclosure.Button>` */
  Button: DisclosureButton,
  /** @deprecated use `<DisclosurePanel>` instead of `<Disclosure.Panel>` */
  Panel: DisclosurePanel,
})
