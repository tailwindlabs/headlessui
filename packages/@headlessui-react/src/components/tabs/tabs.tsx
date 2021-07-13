import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,

  // Types
  ElementType,
  MutableRefObject,
  KeyboardEvent as ReactKeyboardEvent,
  Dispatch,
  ContextType,
} from 'react'

import { Props } from '../../types'
import { render, Features, PropsForFeatures } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { match } from '../../utils/match'
import { Keys } from '../../components/keyboard'
import { focusIn, Focus } from '../../utils/focus-management'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useSyncRefs } from '../../hooks/use-sync-refs'

interface StateDefinition {
  selectedIndex: number | null

  orientation: 'horizontal' | 'vertical'
  activation: 'auto' | 'manual'

  tabs: MutableRefObject<HTMLElement | null>[]
  panels: MutableRefObject<HTMLElement | null>[]
}

enum ActionTypes {
  SetSelectedIndex,
  SetOrientation,
  SetActivation,

  RegisterTab,
  UnregisterTab,

  RegisterPanel,
  UnregisterPanel,

  ForceRerender,
}

type Actions =
  | { type: ActionTypes.SetSelectedIndex; index: number }
  | { type: ActionTypes.SetOrientation; orientation: StateDefinition['orientation'] }
  | { type: ActionTypes.SetActivation; activation: StateDefinition['activation'] }
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
    if (state.selectedIndex === action.index) return state
    return { ...state, selectedIndex: action.index }
  },
  [ActionTypes.SetOrientation](state, action) {
    if (state.orientation === action.orientation) return state
    return { ...state, orientation: action.orientation }
  },
  [ActionTypes.SetActivation](state, action) {
    if (state.activation === action.activation) return state
    return { ...state, activation: action.activation }
  },
  [ActionTypes.RegisterTab](state, action) {
    if (state.tabs.includes(action.tab)) return state
    return { ...state, tabs: [...state.tabs, action.tab] }
  },
  [ActionTypes.UnregisterTab](state, action) {
    return { ...state, tabs: state.tabs.filter(tab => tab !== action.tab) }
  },
  [ActionTypes.RegisterPanel](state, action) {
    if (state.panels.includes(action.panel)) return state
    return { ...state, panels: [...state.panels, action.panel] }
  },
  [ActionTypes.UnregisterPanel](state, action) {
    return { ...state, panels: state.panels.filter(panel => panel !== action.panel) }
  },
  [ActionTypes.ForceRerender](state) {
    return { ...state }
  },
}

let TabsContext = createContext<
  [StateDefinition, { change(index: number): void; dispatch: Dispatch<Actions> }] | null
>(null)
TabsContext.displayName = 'TabsContext'

function useTabsContext(component: string) {
  let context = useContext(TabsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Tabs.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabsContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_TABS_TAG = Fragment
interface TabsRenderPropArg {
  selectedIndex: number
}

export function Tabs<TTag extends ElementType = typeof DEFAULT_TABS_TAG>(
  props: Props<TTag, TabsRenderPropArg> & {
    defaultIndex?: number
    onChange?: (index: number) => void
    vertical?: boolean
    manual?: boolean
  }
) {
  let { defaultIndex = 0, vertical = false, manual = false, onChange, ...passThroughProps } = props
  const orientation = vertical ? 'vertical' : 'horizontal'
  const activation = manual ? 'manual' : 'auto'

  let [state, dispatch] = useReducer(stateReducer, {
    selectedIndex: null,
    tabs: [],
    panels: [],
    orientation,
    activation,
  } as StateDefinition)
  let slot = useMemo(() => ({ selectedIndex: state.selectedIndex }), [state.selectedIndex])
  let onChangeRef = useRef<(index: number) => void>(() => {})

  useEffect(() => {
    dispatch({ type: ActionTypes.SetOrientation, orientation })
  }, [orientation])

  useEffect(() => {
    dispatch({ type: ActionTypes.SetActivation, activation })
  }, [activation])

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChangeRef.current = onChange
    }
  }, [onChange])

  useEffect(() => {
    if (state.tabs.length <= 0) return
    if (state.selectedIndex !== null) return

    let tabs = state.tabs.map(tab => tab.current).filter(Boolean) as HTMLElement[]
    let focusableTabs = tabs.filter(tab => !tab.hasAttribute('disabled'))

    // Underflow
    if (defaultIndex < 0) {
      dispatch({ type: ActionTypes.SetSelectedIndex, index: tabs.indexOf(focusableTabs[0]) })
    }

    // Overflow
    else if (defaultIndex > state.tabs.length) {
      dispatch({
        type: ActionTypes.SetSelectedIndex,
        index: tabs.indexOf(focusableTabs[focusableTabs.length - 1]),
      })
    }

    // Middle
    else {
      let before = tabs.slice(0, defaultIndex)
      let after = tabs.slice(defaultIndex)

      let next = [...after, ...before].find(tab => focusableTabs.includes(tab))
      if (!next) return

      dispatch({ type: ActionTypes.SetSelectedIndex, index: tabs.indexOf(next) })
    }
  }, [defaultIndex, state.tabs, state.selectedIndex])

  let lastChangedIndex = useRef(state.selectedIndex)
  let providerBag = useMemo<ContextType<typeof TabsContext>>(
    () => [
      state,
      {
        dispatch,
        change(index: number) {
          if (lastChangedIndex.current !== index) onChangeRef.current(index)
          lastChangedIndex.current = index

          dispatch({ type: ActionTypes.SetSelectedIndex, index })
        },
      },
    ],
    [state, dispatch]
  )

  return (
    <TabsContext.Provider value={providerBag}>
      {render({
        props: { ...passThroughProps },
        slot,
        defaultTag: DEFAULT_TABS_TAG,
        name: 'Tabs',
      })}
    </TabsContext.Provider>
  )
}

// ---

let DEFAULT_LIST_TAG = 'div' as const
interface ListRenderPropArg {
  selectedIndex: number
}
type ListPropsWeControl = 'role' | 'aria-orientation'

function List<TTag extends ElementType = typeof DEFAULT_LIST_TAG>(
  props: Props<TTag, ListRenderPropArg, ListPropsWeControl> & {}
) {
  let [{ selectedIndex, orientation }] = useTabsContext([Tabs.name, List.name].join('.'))

  let slot = { selectedIndex }
  let propsWeControl = {
    role: 'tablist',
    'aria-orientation': orientation,
  }
  let passThroughProps = props

  return render({
    props: { ...passThroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_LIST_TAG,
    name: 'Tabs.List',
  })
}

// ---

let DEFAULT_TAB_TAG = 'button' as const
interface TabRenderPropArg {
  selected: boolean
}
type TabPropsWeControl = 'id' | 'role' | 'type' | 'aria-controls' | 'aria-selected' | 'tabIndex'

function Tab<TTag extends ElementType = typeof DEFAULT_TAB_TAG>(
  props: Props<TTag, TabRenderPropArg, TabPropsWeControl>
) {
  let id = `headlessui-tabs-tab-${useId()}`

  let [
    { selectedIndex, tabs, panels, orientation, activation },
    { dispatch, change },
  ] = useTabsContext([Tabs.name, Tab.name].join('.'))

  let internalTabRef = useRef<HTMLElement>(null)
  let tabRef = useSyncRefs(internalTabRef, element => {
    if (!element) return
    dispatch({ type: ActionTypes.ForceRerender })
  })

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterTab, tab: internalTabRef })
    return () => dispatch({ type: ActionTypes.UnregisterTab, tab: internalTabRef })
  }, [dispatch, internalTabRef])

  let myIndex = tabs.indexOf(internalTabRef)
  let selected = myIndex === selectedIndex

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      let list = tabs.map(tab => tab.current).filter(Boolean) as HTMLElement[]

      if (event.key === Keys.Space || event.key === Keys.Enter) {
        event.preventDefault()
        event.stopPropagation()

        change(myIndex)
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
    },
    [tabs, orientation, myIndex, change]
  )

  let handleFocus = useCallback(() => {
    internalTabRef.current?.focus()
  }, [internalTabRef])

  let handleSelection = useCallback(() => {
    internalTabRef.current?.focus()
    change(myIndex)
  }, [change, myIndex, internalTabRef])

  let type = props?.type ?? (props.as || DEFAULT_TAB_TAG) === 'button' ? 'button' : undefined

  let slot = useMemo(() => ({ selected }), [selected])
  let propsWeControl = {
    ref: tabRef,
    onKeyDown: handleKeyDown,
    onFocus: activation === 'manual' ? handleFocus : handleSelection,
    onClick: handleSelection,
    id,
    role: 'tab',
    type,
    'aria-controls': panels[myIndex]?.current?.id,
    'aria-selected': selected,
    tabIndex: selected ? 0 : -1,
  }
  let passThroughProps = props

  if (process.env.NODE_ENV === 'test') {
    Object.assign(propsWeControl, { ['data-headlessui-index']: myIndex })
  }

  return render({
    props: { ...passThroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_TAB_TAG,
    name: 'Tabs.Tab',
  })
}

// ---

let DEFAULT_PANELS_TAG = 'div' as const
interface PanelsRenderPropArg {
  selectedIndex: number
}

function Panels<TTag extends ElementType = typeof DEFAULT_PANELS_TAG>(
  props: Props<TTag, PanelsRenderPropArg>
) {
  let [{ selectedIndex }] = useTabsContext([Tabs.name, Panels.name].join('.'))

  let slot = useMemo(() => ({ selectedIndex }), [selectedIndex])

  return render({
    props,
    slot,
    defaultTag: DEFAULT_PANELS_TAG,
    name: 'Tabs.Panels',
  })
}

// ---

let DEFAULT_PANEL_TAG = 'div' as const
interface PanelRenderPropArg {
  selected: boolean
}
type PanelPropsWeControl = 'id' | 'role' | 'aria-labelledby' | 'tabIndex'
let PanelRenderFeatures = Features.RenderStrategy | Features.Static

function Panel<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(
  props: Props<TTag, PanelRenderPropArg, PanelPropsWeControl> &
    PropsForFeatures<typeof PanelRenderFeatures>
) {
  let [{ selectedIndex, tabs, panels }, { dispatch }] = useTabsContext(
    [Tabs.name, Panel.name].join('.')
  )

  let id = `headlessui-tabs-panel-${useId()}`
  let internalPanelRef = useRef<HTMLElement>(null)
  let panelRef = useSyncRefs(internalPanelRef, element => {
    if (!element) return
    dispatch({ type: ActionTypes.ForceRerender })
  })

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterPanel, panel: internalPanelRef })
    return () => dispatch({ type: ActionTypes.UnregisterPanel, panel: internalPanelRef })
  }, [dispatch, internalPanelRef])

  let myIndex = panels.indexOf(internalPanelRef)
  let selected = myIndex === selectedIndex

  let slot = useMemo(() => ({ selected }), [selected])
  let propsWeControl = {
    ref: panelRef,
    id,
    role: 'tabpanel',
    'aria-labelledby': tabs[myIndex]?.current?.id,
    tabIndex: selected ? 0 : -1,
  }

  if (process.env.NODE_ENV === 'test') {
    Object.assign(propsWeControl, { ['data-headlessui-index']: myIndex })
  }

  let passThroughProps = props

  return render({
    props: { ...passThroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_PANEL_TAG,
    features: PanelRenderFeatures,
    visible: selected,
    name: 'Tabs.Panel',
  })
}

// ---

Tabs.List = List
Tabs.Tab = Tab
Tabs.Panels = Panels
Tabs.Panel = Panel
