'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ElementType,
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { FocusSentinel } from '../../internal/focus-sentinel'
import { Hidden } from '../../internal/hidden'
import type { Props } from '../../types'
import { Focus, FocusResult, focusIn, sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { microTask } from '../../utils/micro-task'
import { getOwnerDocument } from '../../utils/owner'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { StableCollection, useStableCollectionIndex } from '../../utils/stable-collection'
import { Keys } from '../keyboard'

enum Direction {
  Forwards,
  Backwards,
}

enum Ordering {
  Less = -1,
  Equal = 0,
  Greater = 1,
}

interface StateDefinition {
  selectedIndex: number

  tabs: MutableRefObject<HTMLElement | null>[]
  panels: MutableRefObject<HTMLElement | null>[]
}

enum ActionTypes {
  SetSelectedIndex,

  RegisterTab,
  UnregisterTab,

  RegisterPanel,
  UnregisterPanel,
}

type Actions =
  | { type: ActionTypes.SetSelectedIndex; index: number }
  | { type: ActionTypes.RegisterTab; tab: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.UnregisterTab; tab: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.RegisterPanel; panel: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.UnregisterPanel; panel: MutableRefObject<HTMLElement | null> }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.SetSelectedIndex](state, action) {
    let tabs = sortByDomNode(state.tabs, (tab) => tab.current)
    let panels = sortByDomNode(state.panels, (panel) => panel.current)

    let focusableTabs = tabs.filter((tab) => !tab.current?.hasAttribute('disabled'))

    let nextState = { ...state, tabs, panels }

    if (
      // Underflow
      action.index < 0 ||
      // Overflow
      action.index > tabs.length - 1
    ) {
      let direction = match(Math.sign(action.index - state.selectedIndex), {
        [Ordering.Less]: () => Direction.Backwards,
        [Ordering.Equal]: () => {
          return match(Math.sign(action.index), {
            [Ordering.Less]: () => Direction.Forwards,
            [Ordering.Equal]: () => Direction.Forwards,
            [Ordering.Greater]: () => Direction.Backwards,
          })
        },
        [Ordering.Greater]: () => Direction.Forwards,
      })

      // If there are no focusable tabs then.
      // We won't change the selected index
      // because it's likely the user is
      // lazy loading tabs and there's
      // nothing to focus on yet
      if (focusableTabs.length === 0) {
        return nextState
      }

      let nextSelectedIndex = match(direction, {
        [Direction.Forwards]: () => tabs.indexOf(focusableTabs[0]),
        [Direction.Backwards]: () => tabs.indexOf(focusableTabs[focusableTabs.length - 1]),
      })

      return {
        ...nextState,
        selectedIndex: nextSelectedIndex === -1 ? state.selectedIndex : nextSelectedIndex,
      }
    }

    // Middle
    let before = tabs.slice(0, action.index)
    let after = tabs.slice(action.index)

    let next = [...after, ...before].find((tab) => focusableTabs.includes(tab))
    if (!next) return nextState

    let selectedIndex = tabs.indexOf(next) ?? state.selectedIndex
    if (selectedIndex === -1) selectedIndex = state.selectedIndex

    return { ...nextState, selectedIndex }
  },
  [ActionTypes.RegisterTab](state, action) {
    if (state.tabs.includes(action.tab)) return state
    let activeTab = state.tabs[state.selectedIndex]

    let adjustedTabs = sortByDomNode([...state.tabs, action.tab], (tab) => tab.current)
    let selectedIndex = adjustedTabs.indexOf(activeTab) ?? state.selectedIndex
    if (selectedIndex === -1) selectedIndex = state.selectedIndex

    return { ...state, tabs: adjustedTabs, selectedIndex }
  },
  [ActionTypes.UnregisterTab](state, action) {
    return { ...state, tabs: state.tabs.filter((tab) => tab !== action.tab) }
  },
  [ActionTypes.RegisterPanel](state, action) {
    if (state.panels.includes(action.panel)) return state
    return {
      ...state,
      panels: sortByDomNode([...state.panels, action.panel], (panel) => panel.current),
    }
  },
  [ActionTypes.UnregisterPanel](state, action) {
    return { ...state, panels: state.panels.filter((panel) => panel !== action.panel) }
  },
}

let TabsDataContext = createContext<
  | ({
      orientation: 'horizontal' | 'vertical'
      activation: 'auto' | 'manual'
    } & StateDefinition)
  | null
>(null)
TabsDataContext.displayName = 'TabsDataContext'

function useData(component: string) {
  let context = useContext(TabsDataContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
type _Data = ReturnType<typeof useData>

let TabsActionsContext = createContext<{
  registerTab(tab: MutableRefObject<HTMLElement | null>): () => void
  registerPanel(panel: MutableRefObject<HTMLElement | null>): () => void
  change(index: number): void
} | null>(null)
TabsActionsContext.displayName = 'TabsActionsContext'

function useActions(component: string) {
  let context = useContext(TabsActionsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}
type _Actions = ReturnType<typeof useActions>

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_TABS_TAG = Fragment
type TabsRenderPropArg = {
  selectedIndex: number
}
type TabsPropsWeControl = never

export type TabGroupProps<TTag extends ElementType = typeof DEFAULT_TABS_TAG> = Props<
  TTag,
  TabsRenderPropArg,
  TabsPropsWeControl,
  {
    defaultIndex?: number
    onChange?: (index: number) => void
    selectedIndex?: number
    vertical?: boolean
    manual?: boolean
  }
>

function GroupFn<TTag extends ElementType = typeof DEFAULT_TABS_TAG>(
  props: TabGroupProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let {
    defaultIndex = 0,
    vertical = false,
    manual = false,
    onChange,
    selectedIndex = null,
    ...theirProps
  } = props
  const orientation = vertical ? 'vertical' : 'horizontal'
  const activation = manual ? 'manual' : 'auto'

  let isControlled = selectedIndex !== null

  let tabsRef = useSyncRefs(ref)
  let [state, dispatch] = useReducer(stateReducer, {
    selectedIndex: selectedIndex ?? defaultIndex,
    tabs: [],
    panels: [],
  })
  let slot = useMemo(
    () => ({ selectedIndex: state.selectedIndex }) satisfies TabsRenderPropArg,
    [state.selectedIndex]
  )
  let onChangeRef = useLatestValue(onChange || (() => {}))
  let stableTabsRef = useLatestValue(state.tabs)

  let tabsData = useMemo<_Data>(
    () => ({ orientation, activation, ...state }),
    [orientation, activation, state]
  )

  let registerTab = useEvent((tab) => {
    dispatch({ type: ActionTypes.RegisterTab, tab })
    return () => dispatch({ type: ActionTypes.UnregisterTab, tab })
  })

  let registerPanel = useEvent((panel) => {
    dispatch({ type: ActionTypes.RegisterPanel, panel })
    return () => dispatch({ type: ActionTypes.UnregisterPanel, panel })
  })

  let change = useEvent((index: number) => {
    if (realSelectedIndex.current !== index) {
      onChangeRef.current(index)
    }

    if (!isControlled) {
      dispatch({ type: ActionTypes.SetSelectedIndex, index })
    }
  })

  let realSelectedIndex = useLatestValue(isControlled ? props.selectedIndex : state.selectedIndex)
  let tabsActions = useMemo<_Actions>(() => ({ registerTab, registerPanel, change }), [])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.SetSelectedIndex, index: selectedIndex ?? defaultIndex })
  }, [selectedIndex /* Deliberately skipping defaultIndex */])

  useIsoMorphicEffect(() => {
    if (realSelectedIndex.current === undefined) return
    if (state.tabs.length <= 0) return

    // TODO: Figure out a way to detect this without the slow sort on every render. Might be fine
    //       unless you have a lot of tabs.
    let sorted = sortByDomNode(state.tabs, (tab) => tab.current)
    let didOrderChange = sorted.some((tab, i) => state.tabs[i] !== tab)

    if (didOrderChange) {
      change(sorted.indexOf(state.tabs[realSelectedIndex.current]))
    }
  })

  let ourProps = { ref: tabsRef }

  return (
    <StableCollection>
      <TabsActionsContext.Provider value={tabsActions}>
        <TabsDataContext.Provider value={tabsData}>
          {tabsData.tabs.length <= 0 && (
            <FocusSentinel
              onFocus={() => {
                for (let tab of stableTabsRef.current) {
                  if (tab.current?.tabIndex === 0) {
                    tab.current?.focus()
                    return true
                  }
                }

                return false
              }}
            />
          )}
          {render({
            ourProps,
            theirProps,
            slot,
            defaultTag: DEFAULT_TABS_TAG,
            name: 'Tabs',
          })}
        </TabsDataContext.Provider>
      </TabsActionsContext.Provider>
    </StableCollection>
  )
}

// ---

let DEFAULT_LIST_TAG = 'div' as const
type ListRenderPropArg = {
  selectedIndex: number
}
type ListPropsWeControl = 'aria-orientation' | 'role'

export type TabListProps<TTag extends ElementType = typeof DEFAULT_LIST_TAG> = Props<
  TTag,
  ListRenderPropArg,
  ListPropsWeControl,
  {
    //
  }
>

function ListFn<TTag extends ElementType = typeof DEFAULT_LIST_TAG>(
  props: TabListProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { orientation, selectedIndex } = useData('Tab.List')
  let listRef = useSyncRefs(ref)

  let slot = useMemo(() => ({ selectedIndex }) satisfies ListRenderPropArg, [selectedIndex])

  let theirProps = props
  let ourProps = {
    ref: listRef,
    role: 'tablist',
    'aria-orientation': orientation,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_LIST_TAG,
    name: 'Tabs.List',
  })
}

// ---

let DEFAULT_TAB_TAG = 'button' as const
type TabRenderPropArg = {
  hover: boolean
  focus: boolean
  active: boolean
  autofocus: boolean
  selected: boolean
}
type TabPropsWeControl = 'aria-controls' | 'aria-selected' | 'role' | 'tabIndex'

export type TabProps<TTag extends ElementType = typeof DEFAULT_TAB_TAG> = Props<
  TTag,
  TabRenderPropArg,
  TabPropsWeControl,
  {
    autoFocus?: boolean
    disabled?: boolean
  }
>

function TabFn<TTag extends ElementType = typeof DEFAULT_TAB_TAG>(
  props: TabProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let { id = `headlessui-tabs-tab-${internalId}`, ...theirProps } = props

  let { orientation, activation, selectedIndex, tabs, panels } = useData('Tab')
  let actions = useActions('Tab')
  let data = useData('Tab')

  let internalTabRef = useRef<HTMLElement | null>(null)
  let tabRef = useSyncRefs(internalTabRef, ref)

  useIsoMorphicEffect(() => actions.registerTab(internalTabRef), [actions, internalTabRef])

  let mySSRIndex = useStableCollectionIndex('tabs')

  let myIndex = tabs.indexOf(internalTabRef)
  if (myIndex === -1) myIndex = mySSRIndex
  let selected = myIndex === selectedIndex

  let activateUsing = useEvent((cb: () => FocusResult) => {
    let result = cb()
    if (result === FocusResult.Success && activation === 'auto') {
      let newTab = getOwnerDocument(internalTabRef)?.activeElement
      let idx = data.tabs.findIndex((tab) => tab.current === newTab)
      if (idx !== -1) actions.change(idx)
    }
    return result
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLElement>) => {
    let list = tabs.map((tab) => tab.current).filter(Boolean) as HTMLElement[]

    if (event.key === Keys.Space || event.key === Keys.Enter) {
      event.preventDefault()
      event.stopPropagation()

      actions.change(myIndex)
      return
    }

    switch (event.key) {
      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault()
        event.stopPropagation()

        return activateUsing(() => focusIn(list, Focus.First))

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()

        return activateUsing(() => focusIn(list, Focus.Last))
    }

    let result = activateUsing(() => {
      return match(orientation, {
        vertical() {
          if (event.key === Keys.ArrowUp) return focusIn(list, Focus.Previous | Focus.WrapAround)
          if (event.key === Keys.ArrowDown) return focusIn(list, Focus.Next | Focus.WrapAround)
          return FocusResult.Error
        },
        horizontal() {
          if (event.key === Keys.ArrowLeft) return focusIn(list, Focus.Previous | Focus.WrapAround)
          if (event.key === Keys.ArrowRight) return focusIn(list, Focus.Next | Focus.WrapAround)
          return FocusResult.Error
        },
      })
    })

    if (result === FocusResult.Success) {
      return event.preventDefault()
    }
  })

  let ready = useRef(false)
  let handleSelection = useEvent(() => {
    if (ready.current) return
    ready.current = true

    internalTabRef.current?.focus({ preventScroll: true })
    actions.change(myIndex)

    microTask(() => {
      ready.current = false
    })
  })

  // This is important because we want to only focus the tab when it gets focus
  // OR it finished the click event (mouseup). However, if you perform a `click`,
  // then you will first get the `focus` and then get the `click` event.
  let handleMouseDown = useEvent((event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault()
  })

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: props.disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: props.disabled ?? false })

  let slot = useMemo(
    () =>
      ({
        selected,
        hover,
        active,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies TabRenderPropArg,
    [selected, hover, focus, active, props.autoFocus]
  )

  let ourProps = mergeProps(
    {
      ref: tabRef,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      onClick: handleSelection,
      id,
      role: 'tab',
      type: useResolveButtonType(props, internalTabRef),
      'aria-controls': panels[myIndex]?.current?.id,
      'aria-selected': selected,
      tabIndex: selected ? 0 : -1,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TAB_TAG,
    name: 'Tabs.Tab',
  })
}

// ---

let DEFAULT_PANELS_TAG = 'div' as const
type PanelsRenderPropArg = {
  selectedIndex: number
}

export type TabPanelsProps<TTag extends ElementType = typeof DEFAULT_PANELS_TAG> = Props<
  TTag,
  PanelsRenderPropArg
>

function PanelsFn<TTag extends ElementType = typeof DEFAULT_PANELS_TAG>(
  props: TabPanelsProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { selectedIndex } = useData('Tab.Panels')
  let panelsRef = useSyncRefs(ref)

  let slot = useMemo(() => ({ selectedIndex }), [selectedIndex])

  let theirProps = props
  let ourProps = { ref: panelsRef }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANELS_TAG,
    name: 'Tabs.Panels',
  })
}

// ---

let DEFAULT_PANEL_TAG = 'div' as const
type PanelRenderPropArg = {
  selected: boolean
}
type PanelPropsWeControl = 'role' | 'aria-labelledby'
let PanelRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type TabPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<
  TTag,
  PanelRenderPropArg,
  PanelPropsWeControl,
  PropsForFeatures<typeof PanelRenderFeatures> & { id?: string; tabIndex?: number }
>

function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: TabPanelProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let { id = `headlessui-tabs-panel-${internalId}`, tabIndex = 0, ...theirProps } = props
  let { selectedIndex, tabs, panels } = useData('Tab.Panel')
  let actions = useActions('Tab.Panel')

  let internalPanelRef = useRef<HTMLElement | null>(null)
  let panelRef = useSyncRefs(internalPanelRef, ref)

  useIsoMorphicEffect(() => actions.registerPanel(internalPanelRef), [actions, internalPanelRef])

  let mySSRIndex = useStableCollectionIndex('panels')

  let myIndex = panels.indexOf(internalPanelRef)
  if (myIndex === -1) myIndex = mySSRIndex

  let selected = myIndex === selectedIndex

  let slot = useMemo(() => ({ selected }), [selected])

  let ourProps = {
    ref: panelRef,
    id,
    role: 'tabpanel',
    'aria-labelledby': tabs[myIndex]?.current?.id,
    tabIndex: selected ? tabIndex : -1,
  }

  if (!selected && (theirProps.unmount ?? true) && !(theirProps.static ?? false)) {
    return <Hidden as="span" aria-hidden="true" {...ourProps} />
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANEL_TAG,
    features: PanelRenderFeatures,
    visible: selected,
    name: 'Tabs.Panel',
  })
}

// ---

export interface _internal_ComponentTab extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TAB_TAG>(
    props: TabProps<TTag> & RefProp<typeof TabFn>
  ): JSX.Element
}

export interface _internal_ComponentTabGroup extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_TABS_TAG>(
    props: TabGroupProps<TTag> & RefProp<typeof GroupFn>
  ): JSX.Element
}

export interface _internal_ComponentTabList extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_LIST_TAG>(
    props: TabListProps<TTag> & RefProp<typeof ListFn>
  ): JSX.Element
}

export interface _internal_ComponentTabPanels extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANELS_TAG>(
    props: TabPanelsProps<TTag> & RefProp<typeof PanelsFn>
  ): JSX.Element
}

export interface _internal_ComponentTabPanel extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
    props: TabPanelProps<TTag> & RefProp<typeof PanelFn>
  ): JSX.Element
}

let TabRoot = forwardRefWithAs(TabFn) as unknown as _internal_ComponentTab
export let TabGroup = forwardRefWithAs(GroupFn) as unknown as _internal_ComponentTabGroup
export let TabList = forwardRefWithAs(ListFn) as unknown as _internal_ComponentTabList
export let TabPanels = forwardRefWithAs(PanelsFn) as unknown as _internal_ComponentTabPanels
export let TabPanel = forwardRefWithAs(PanelFn) as unknown as _internal_ComponentTabPanel

export let Tab = Object.assign(TabRoot, {
  Group: TabGroup,
  List: TabList,
  Panels: TabPanels,
  Panel: TabPanel,
})
