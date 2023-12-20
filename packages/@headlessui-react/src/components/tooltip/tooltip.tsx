'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useSyncExternalStore,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react'
import { useDisposables } from '../../hooks/use-disposables'
import { useEvent } from '../../hooks/use-event'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingReference,
  type AnchorProps,
} from '../../internal/floating'
import { State, useOpenClosed } from '../../internal/open-closed'
import type { Props } from '../../types'
import { match } from '../../utils/match'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { Description, useDescribedBy, useDescriptions } from '../description/description'
import { Keys } from '../keyboard'
import { Portal } from '../portal/portal'

enum TooltipState {
  // Completely hidden
  Hidden,

  // Will be visible after a delay
  Initiated,

  // Completely visible
  Visible,

  // Visible, but will be hidden after a delay
  Hiding,
}

enum When {
  // Show the tooltip after a delay
  Delayed,

  // Show the tooltip immediately
  Immediate,
}

type ActiveTooltipId = string | null
class TooltipStore {
  private _state: ActiveTooltipId = null
  private _listeners: ((state: ActiveTooltipId) => void)[] = []

  subscribe = (listener: (state: ActiveTooltipId) => void) => {
    this._listeners.push(listener)
    return () => {
      this._listeners = this._listeners.filter((x) => x !== listener)
    }
  }

  getSnapshot = () => {
    return this._state
  }

  getServerSnapshot = () => {
    return this._state
  }

  setTooltipId = (state: ActiveTooltipId) => {
    if (this._state === state) return
    this._state = state
    this._listeners.forEach((listener) => listener(state))
  }
}

let tooltipStore = new TooltipStore()

interface StateDefinition {
  id: string
  tooltipState: TooltipState
}

enum ActionTypes {
  ShowTooltip,
  HideTooltip,
}

type Actions =
  | { type: ActionTypes.ShowTooltip; when: When }
  | { type: ActionTypes.HideTooltip; when: When }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.ShowTooltip](state, action) {
    return {
      ...state,
      tooltipState: match(state.tooltipState, {
        [TooltipState.Hidden]: match(action.when, {
          [When.Immediate]: TooltipState.Visible,
          [When.Delayed]: TooltipState.Initiated,
        }),
        [TooltipState.Initiated]: match(action.when, {
          [When.Immediate]: TooltipState.Visible,
          [When.Delayed]: TooltipState.Initiated,
        }),
        [TooltipState.Visible]: TooltipState.Visible,
        [TooltipState.Hiding]: TooltipState.Visible,
      }),
    }
  },
  [ActionTypes.HideTooltip](state, action) {
    return {
      ...state,
      tooltipState: match(state.tooltipState, {
        [TooltipState.Hidden]: TooltipState.Hidden,
        [TooltipState.Initiated]: TooltipState.Hidden,
        [TooltipState.Visible]: match(action.when, {
          [When.Immediate]: TooltipState.Hidden,
          [When.Delayed]: TooltipState.Hiding,
        }),
        [TooltipState.Hiding]: match(action.when, {
          [When.Immediate]: TooltipState.Hidden,
          [When.Delayed]: TooltipState.Hiding,
        }),
      }),
    }
  },
}

let TooltipActionsContext = createContext<{
  showTooltip(when: When): void
  hideTooltip(when: When): void
} | null>(null)
TooltipActionsContext.displayName = 'TooltipActionsContext'

function useActions(component: string) {
  let context = useContext(TooltipActionsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tooltip /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}
type _Actions = ReturnType<typeof useActions>

let TooltipDataContext = createContext<({ visible: boolean } & StateDefinition) | null>(null)
TooltipDataContext.displayName = 'TooltipDataContext'

function useData(component: string) {
  let context = useContext(TooltipDataContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tooltip /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
type _Data = ReturnType<typeof useData>

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_TOOLTIP_TAG = Fragment

type TooltipRenderPropArg = {}
type TooltipPropsWeControl = never

export type TooltipProps<TTag extends ElementType = typeof DEFAULT_TOOLTIP_TAG> = Props<
  TTag,
  TooltipRenderPropArg,
  TooltipPropsWeControl,
  {
    showDelayMs?: number
    hideDelayMs?: number
  }
>

function TooltipFn<TTag extends ElementType = typeof DEFAULT_TOOLTIP_TAG>(
  props: TooltipProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let {
    id = `headlessui-tooltip-${useId()}`,
    showDelayMs = 750,
    hideDelayMs = 300,
    ...theirProps
  } = props

  let activeTooltipId = useSyncExternalStore(
    tooltipStore.subscribe,
    tooltipStore.getSnapshot,
    tooltipStore.getServerSnapshot
  )
  let [state, dispatch] = useReducer(stateReducer, {
    id,
    tooltipState: TooltipState.Hidden,
  })

  let [describedBy, DescriptionProvider] = useDescriptions()

  let d = useDisposables()
  useEffect(() => {
    d.dispose()

    match(state.tooltipState, {
      [TooltipState.Hidden]() {
        //
      },
      [TooltipState.Initiated]() {
        d.setTimeout(() => showTooltip(When.Immediate), showDelayMs)
      },
      [TooltipState.Visible]() {
        //
      },
      [TooltipState.Hiding]() {
        d.setTimeout(() => hideTooltip(When.Immediate), hideDelayMs)
      },
    })
  }, [d, state.tooltipState, showDelayMs, hideDelayMs])

  let showTooltip = useEvent((when: When) => {
    // In this case, showing the tooltip should be delayed, however if another tooltip is already
    // active then we can make the tooltip show up immediately such that the end use doesn't have to
    // wait again.
    if (when === When.Delayed && activeTooltipId !== null && activeTooltipId !== id) {
      when = When.Immediate
    }

    // This tooltip should be immediatley visible, therefore it should be the active tooltip.
    if (when === When.Immediate) {
      tooltipStore.setTooltipId(id)
    }

    dispatch({ type: ActionTypes.ShowTooltip, when })
  })
  let hideTooltip = useEvent((when: When) => {
    // We are the current active tooltip and we need to be hidden immediatlely, therefore there
    // should not be any active tooltip anymore.
    if (activeTooltipId === id && when === When.Immediate) {
      tooltipStore.setTooltipId(null)
    }

    dispatch({ type: ActionTypes.HideTooltip, when })
  })
  let tooltipRef = useSyncRefs(ref)

  let ourProps = { ref: tooltipRef }

  let slot = useMemo(() => ({}) satisfies TooltipRenderPropArg, [])

  let data = useMemo<_Data>(
    () => ({
      visible:
        activeTooltipId === state.id &&
        match(state.tooltipState, {
          [TooltipState.Hidden]: false,
          [TooltipState.Initiated]: false,
          [TooltipState.Visible]: true,
          [TooltipState.Hiding]: true,
        }),
      ...state,
    }),
    [activeTooltipId, state]
  )
  let actions = useMemo<_Actions>(() => ({ showTooltip, hideTooltip }), [showTooltip, hideTooltip])

  return (
    <DescriptionProvider value={describedBy}>
      <FloatingProvider>
        <TooltipActionsContext.Provider value={actions}>
          <TooltipDataContext.Provider value={data}>
            {render({
              ourProps,
              theirProps,
              slot,
              defaultTag: DEFAULT_TOOLTIP_TAG,
              name: 'Tooltip',
            })}
          </TooltipDataContext.Provider>
        </TooltipActionsContext.Provider>
      </FloatingProvider>
    </DescriptionProvider>
  )
}

// ---

let DEFAULT_TRIGGER_TAG = Fragment

type TriggerRenderPropArg = { hover: boolean; focus: boolean; autofocus: boolean }
type TriggerPropsWeControl = 'aria-describedby'

export type TooltipTriggerProps<TTag extends ElementType = typeof DEFAULT_TRIGGER_TAG> = Props<
  TTag,
  TriggerRenderPropArg,
  TriggerPropsWeControl,
  { autoFocus?: boolean; disabled?: boolean }
>

function TriggerFn<TTag extends ElementType = typeof DEFAULT_TRIGGER_TAG>(
  props: TooltipTriggerProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { ...theirProps } = props
  let data = useData('TooltipTrigger')
  let actions = useActions('TooltipTrigger')
  let describedBy = useDescribedBy()
  let internalButtonRef = useRef<HTMLElement | null>(null)
  let triggerRef = useSyncRefs(internalButtonRef, ref, useFloatingReference())

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: props.disabled ?? false })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Enter:
      case Keys.Escape:
      case Keys.Space:
        if (data.tooltipState === TooltipState.Visible) {
          return actions.hideTooltip(When.Immediate)
        }
        break
    }
  })

  let handleFocus = useEvent(() => {
    actions.showTooltip(When.Immediate)
  })

  let handleBlur = useEvent(() => {
    actions.hideTooltip(When.Immediate)
  })

  let handleMouseDown = useEvent(() => {
    actions.hideTooltip(When.Immediate)
  })

  let handleMouseEnter = useEvent(() => {
    actions.showTooltip(When.Delayed)
  })

  let handleMouseLeave = useEvent(() => {
    actions.hideTooltip(When.Delayed)
  })

  let handleMouseMove = useEvent(() => {
    if (data.tooltipState === TooltipState.Hiding) {
      actions.showTooltip(When.Immediate)
    }
  })

  let slot = useMemo(
    () => ({ hover, focus, autofocus: props.autoFocus ?? false }) satisfies TriggerRenderPropArg,
    [hover, focus, props.autoFocus]
  )
  let ourProps = mergeProps(
    {
      ref: triggerRef,
      'aria-describedby': data.visible ? describedBy : undefined,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseDown: handleMouseDown,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
    },
    focusProps,
    hoverProps
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TRIGGER_TAG,
    name: 'TooltipTrigger',
  })
}

// ---

let DEFAULT_PANEL_TAG = Description

type PanelRenderPropArg = {}
type PanelPropsWeControl = 'role'
let PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type TooltipPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
  TTag,
  PanelRenderPropArg,
  PanelPropsWeControl,
  { anchor?: AnchorProps } & PropsForFeatures<typeof PanelRenderFeatures>
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: TooltipPanelProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let {
    anchor = {
      to: 'top',
      padding: 8,
      gap: 8,
      offset: -4,
    } as AnchorProps,
    ...theirProps
  } = props
  let data = useData('TooltipPanel')

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return data.visible
  })()

  let internalPanelRef = useRef<HTMLElement | null>(null)
  let [floatingRef, style] = useFloatingPanel(visible ? anchor : undefined)
  let panelRef = useSyncRefs(internalPanelRef, ref, floatingRef)

  let ourProps = {
    ref: panelRef,
    role: 'tooltip',
    ...(style ? { style } : {}),
  }

  let slot = useMemo(() => ({}) satisfies PanelRenderPropArg, [])

  return render({
    ourProps: {
      ...ourProps,
      as: Fragment,
      children: (
        <Portal>
          {/** @ts-ignore TODO: Figure out why `panelRef` is not working from a TypeScript perspective. */}
          <Description ref={panelRef} {...theirProps} />
        </Portal>
      ),
    },
    theirProps: {},
    slot,
    defaultTag: Fragment,
    features: PanelRenderFeatures,
    visible,
    name: 'TooltipPanel',
  })
}

// ---

export interface _internal_ComponentTooltip extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TOOLTIP_TAG>(
    props: TooltipProps<TTag> & RefProp<typeof TooltipFn>
  ): JSX.Element
}

export interface _internal_ComponentTrigger extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TRIGGER_TAG>(
    props: TooltipTriggerProps<TTag> & RefProp<typeof TriggerFn>
  ): JSX.Element
}

export interface _internal_ComponentPanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: TooltipPanelProps<TTag> & RefProp<typeof PanelFn>
  ): JSX.Element
}

export let Tooltip = forwardRefWithAs(TooltipFn) as unknown as _internal_ComponentTooltip
export let TooltipTrigger = forwardRefWithAs(TriggerFn) as unknown as _internal_ComponentTrigger
export let TooltipPanel = forwardRefWithAs(PanelFn) as unknown as _internal_ComponentPanel
