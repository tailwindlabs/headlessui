import React, {
  Fragment,
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,

  // Types
  ContextType,
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  Ref,
} from 'react'

import { Props } from '../../types'
import { render, Features, PropsForFeatures, forwardRefWithAs } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { match } from '../../utils/match'
import { Keys } from '../../components/keyboard'
import { focusIn, Focus, sortByDomNode } from '../../utils/focus-management'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useLatestValue } from '../../hooks/use-latest-value'
import { FocusSentinel } from '../../internal/focus-sentinel'
import { useEvent } from '../../hooks/use-event'

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

  ForceRerender,
}

type Actions =
  | { type: ActionTypes.SetSelectedIndex; index: number }
  | { type: ActionTypes.RegisterTab; tab: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.UnregisterTab; tab: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.RegisterPanel; panel: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.UnregisterPanel; panel: MutableRefObject<HTMLElement | null> }
  | { type: ActionTypes.ForceRerender }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.SetSelectedIndex](state, action) {
    let focusableTabs = state.tabs.filter((tab) => !tab.current?.hasAttribute('disabled'))

    // Underflow
    if (action.index < 0) {
      return { ...state, selectedIndex: state.tabs.indexOf(focusableTabs[0]) }
    }

    // Overflow
    else if (action.index > state.tabs.length) {
      return {
        ...state,
        selectedIndex: state.tabs.indexOf(focusableTabs[focusableTabs.length - 1]),
      }
    }

    // Middle
    let before = state.tabs.slice(0, action.index)
    let after = state.tabs.slice(action.index)

    let next = [...after, ...before].find((tab) => focusableTabs.includes(tab))
    if (!next) return state

    return { ...state, selectedIndex: state.tabs.indexOf(next) }
  },
  [ActionTypes.RegisterTab](state, action) {
    if (state.tabs.includes(action.tab)) return state
    return { ...state, tabs: sortByDomNode([...state.tabs, action.tab], (tab) => tab.current) }
  },
  [ActionTypes.UnregisterTab](state, action) {
    return {
      ...state,
      tabs: sortByDomNode(
        state.tabs.filter((tab) => tab !== action.tab),
        (tab) => tab.current
      ),
    }
  },
  [ActionTypes.RegisterPanel](state, action) {
    if (state.panels.includes(action.panel)) return state
    return { ...state, panels: [...state.panels, action.panel] }
  },
  [ActionTypes.UnregisterPanel](state, action) {
    return { ...state, panels: state.panels.filter((panel) => panel !== action.panel) }
  },
  [ActionTypes.ForceRerender](state) {
    return { ...state }
  },
}

let TabsSSRContext = createContext<MutableRefObject<{ tabs: string[]; panels: string[] }> | null>(
  null
)
TabsSSRContext.displayName = 'TabsSSRContext'

function useSSRTabsCounter(component: string) {
  let context = useContext(TabsSSRContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useSSRTabsCounter)
    throw err
  }
  return context
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
  forceRerender(): void
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
interface TabsRenderPropArg {
  selectedIndex: number
}

let Tabs = forwardRefWithAs(function Tabs<TTag extends ElementType = typeof DEFAULT_TABS_TAG>(
  props: Props<TTag, TabsRenderPropArg> & {
    defaultIndex?: number
    onChange?: (index: number) => void
    selectedIndex?: number
    vertical?: boolean
    manual?: boolean
  },
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

  let tabsRef = useSyncRefs(ref)
  let [state, dispatch] = useReducer(stateReducer, {
    selectedIndex: selectedIndex ?? defaultIndex,
    tabs: [],
    panels: [],
  })
  let slot = useMemo(() => ({ selectedIndex: state.selectedIndex }), [state.selectedIndex])
  let onChangeRef = useLatestValue(onChange || (() => {}))
  let stableTabsRef = useLatestValue(state.tabs)

  let tabsData = useMemo<_Data>(
    () => ({ orientation, activation, ...state }),
    [orientation, activation, state]
  )

  let lastChangedIndex = useLatestValue(state.selectedIndex)
  let tabsActions: _Actions = useMemo(
    () => ({
      registerTab(tab) {
        dispatch({ type: ActionTypes.RegisterTab, tab })
        return () => dispatch({ type: ActionTypes.UnregisterTab, tab })
      },
      registerPanel(panel) {
        dispatch({ type: ActionTypes.RegisterPanel, panel })
        return () => dispatch({ type: ActionTypes.UnregisterPanel, panel })
      },
      forceRerender() {
        dispatch({ type: ActionTypes.ForceRerender })
      },
      change(index: number) {
        if (lastChangedIndex.current !== index) onChangeRef.current(index)
        lastChangedIndex.current = index

        dispatch({ type: ActionTypes.SetSelectedIndex, index })
      },
    }),
    [dispatch]
  )

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.SetSelectedIndex, index: selectedIndex ?? defaultIndex })
  }, [selectedIndex /* Deliberately skipping defaultIndex */])

  let SSRCounter = useRef({ tabs: [], panels: [] })
  let ourProps = { ref: tabsRef }

  return (
    <TabsSSRContext.Provider value={SSRCounter}>
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
    </TabsSSRContext.Provider>
  )
})

// ---

let DEFAULT_LIST_TAG = 'div' as const
interface ListRenderPropArg {
  selectedIndex: number
}
type ListPropsWeControl = 'role' | 'aria-orientation'

let List = forwardRefWithAs(function List<TTag extends ElementType = typeof DEFAULT_LIST_TAG>(
  props: Props<TTag, ListRenderPropArg, ListPropsWeControl> & {},
  ref: Ref<HTMLElement>
) {
  let { orientation, selectedIndex } = useData('Tab.List')
  let listRef = useSyncRefs(ref)

  let slot = { selectedIndex }

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
})

// ---

let DEFAULT_TAB_TAG = 'button' as const
interface TabRenderPropArg {
  selected: boolean
}
type TabPropsWeControl = 'id' | 'role' | 'type' | 'aria-controls' | 'aria-selected' | 'tabIndex'

let TabRoot = forwardRefWithAs(function Tab<TTag extends ElementType = typeof DEFAULT_TAB_TAG>(
  props: Props<TTag, TabRenderPropArg, TabPropsWeControl>,
  ref: Ref<HTMLElement>
) {
  let id = `headlessui-tabs-tab-${useId()}`

  let { orientation, activation, selectedIndex, tabs, panels } = useData('Tab')
  let actions = useActions('Tab')
  let SSRContext = useSSRTabsCounter('Tab')

  let internalTabRef = useRef<HTMLElement | null>(null)
  let tabRef = useSyncRefs(internalTabRef, ref, (element) => {
    if (!element) return
    actions.forceRerender()
  })

  useIsoMorphicEffect(() => actions.registerTab(internalTabRef), [actions, internalTabRef])

  let mySSRIndex = SSRContext.current.tabs.indexOf(id)
  if (mySSRIndex === -1) mySSRIndex = SSRContext.current.tabs.push(id) - 1

  let myIndex = tabs.indexOf(internalTabRef)
  if (myIndex === -1) myIndex = mySSRIndex
  let selected = myIndex === selectedIndex

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

        return focusIn(list, Focus.First)

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()

        return focusIn(list, Focus.Last)
    }

    return match(orientation, {
      vertical() {
        if (event.key === Keys.ArrowUp) return focusIn(list, Focus.Previous | Focus.WrapAround)
        if (event.key === Keys.ArrowDown) return focusIn(list, Focus.Next | Focus.WrapAround)
        return
      },
      horizontal() {
        if (event.key === Keys.ArrowLeft) return focusIn(list, Focus.Previous | Focus.WrapAround)
        if (event.key === Keys.ArrowRight) return focusIn(list, Focus.Next | Focus.WrapAround)
        return
      },
    })
  })

  let handleFocus = useEvent(() => {
    internalTabRef.current?.focus()
  })

  let handleSelection = useEvent(() => {
    internalTabRef.current?.focus()
    actions.change(myIndex)
  })

  // This is important because we want to only focus the tab when it gets focus
  // OR it finished the click event (mouseup). However, if you perform a `click`,
  // then you will first get the `focus` and then get the `click` event.
  let handleMouseDown = useEvent((event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault()
  })

  let slot = useMemo(() => ({ selected }), [selected])

  let theirProps = props
  let ourProps = {
    ref: tabRef,
    onKeyDown: handleKeyDown,
    onFocus: activation === 'manual' ? handleFocus : handleSelection,
    onMouseDown: handleMouseDown,
    onClick: handleSelection,
    id,
    role: 'tab',
    type: useResolveButtonType(props, internalTabRef),
    'aria-controls': panels[myIndex]?.current?.id,
    'aria-selected': selected,
    tabIndex: selected ? 0 : -1,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TAB_TAG,
    name: 'Tabs.Tab',
  })
})

// ---

let DEFAULT_PANELS_TAG = 'div' as const
interface PanelsRenderPropArg {
  selectedIndex: number
}

let Panels = forwardRefWithAs(function Panels<TTag extends ElementType = typeof DEFAULT_PANELS_TAG>(
  props: Props<TTag, PanelsRenderPropArg>,
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
})

// ---

let DEFAULT_PANEL_TAG = 'div' as const
interface PanelRenderPropArg {
  selected: boolean
}
type PanelPropsWeControl = 'id' | 'role' | 'aria-labelledby' | 'tabIndex'
let PanelRenderFeatures = Features.RenderStrategy | Features.Static

let Panel = forwardRefWithAs(function Panel<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: Props<TTag, PanelRenderPropArg, PanelPropsWeControl> &
    PropsForFeatures<typeof PanelRenderFeatures>,
  ref: Ref<HTMLElement>
) {
  let { selectedIndex, tabs, panels } = useData('Tab.Panel')
  let actions = useActions('Tab.Panel')
  let SSRContext = useSSRTabsCounter('Tab.Panel')

  let id = `headlessui-tabs-panel-${useId()}`
  let internalPanelRef = useRef<HTMLElement>(null)
  let panelRef = useSyncRefs(internalPanelRef, ref, (element) => {
    if (!element) return
    actions.forceRerender()
  })

  useIsoMorphicEffect(() => actions.registerPanel(internalPanelRef), [actions, internalPanelRef])

  let mySSRIndex = SSRContext.current.panels.indexOf(id)
  if (mySSRIndex === -1) mySSRIndex = SSRContext.current.panels.push(id) - 1

  let myIndex = panels.indexOf(internalPanelRef)
  if (myIndex === -1) myIndex = mySSRIndex

  let selected = myIndex === selectedIndex

  let slot = useMemo(() => ({ selected }), [selected])

  let theirProps = props
  let ourProps = {
    ref: panelRef,
    id,
    role: 'tabpanel',
    'aria-labelledby': tabs[myIndex]?.current?.id,
    tabIndex: selected ? 0 : -1,
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
})

// ---

export let Tab = Object.assign(TabRoot, { Group: Tabs, List, Panels, Panel })
