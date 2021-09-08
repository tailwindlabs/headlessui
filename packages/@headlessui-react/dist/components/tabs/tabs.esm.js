import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useRef, useCallback, useMemo, createContext, useContext, useReducer, useEffect, Fragment } from 'react';
import { match } from '../../utils/match.esm.js';
import { render, Features } from '../../utils/render.esm.js';
import { useSyncRefs } from '../../hooks/use-sync-refs.esm.js';
import { Keys } from '../keyboard.esm.js';
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { focusIn, Focus } from '../../utils/focus-management.esm.js';
import { useResolveButtonType } from '../../hooks/use-resolve-button-type.esm.js';

var _reducers;
var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["SetSelectedIndex"] = 0] = "SetSelectedIndex";
  ActionTypes[ActionTypes["SetOrientation"] = 1] = "SetOrientation";
  ActionTypes[ActionTypes["SetActivation"] = 2] = "SetActivation";
  ActionTypes[ActionTypes["RegisterTab"] = 3] = "RegisterTab";
  ActionTypes[ActionTypes["UnregisterTab"] = 4] = "UnregisterTab";
  ActionTypes[ActionTypes["RegisterPanel"] = 5] = "RegisterPanel";
  ActionTypes[ActionTypes["UnregisterPanel"] = 6] = "UnregisterPanel";
  ActionTypes[ActionTypes["ForceRerender"] = 7] = "ForceRerender";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.SetSelectedIndex] = function (state, action) {
  if (state.selectedIndex === action.index) return state;
  return _extends({}, state, {
    selectedIndex: action.index
  });
}, _reducers[ActionTypes.SetOrientation] = function (state, action) {
  if (state.orientation === action.orientation) return state;
  return _extends({}, state, {
    orientation: action.orientation
  });
}, _reducers[ActionTypes.SetActivation] = function (state, action) {
  if (state.activation === action.activation) return state;
  return _extends({}, state, {
    activation: action.activation
  });
}, _reducers[ActionTypes.RegisterTab] = function (state, action) {
  if (state.tabs.includes(action.tab)) return state;
  return _extends({}, state, {
    tabs: [].concat(state.tabs, [action.tab])
  });
}, _reducers[ActionTypes.UnregisterTab] = function (state, action) {
  return _extends({}, state, {
    tabs: state.tabs.filter(function (tab) {
      return tab !== action.tab;
    })
  });
}, _reducers[ActionTypes.RegisterPanel] = function (state, action) {
  if (state.panels.includes(action.panel)) return state;
  return _extends({}, state, {
    panels: [].concat(state.panels, [action.panel])
  });
}, _reducers[ActionTypes.UnregisterPanel] = function (state, action) {
  return _extends({}, state, {
    panels: state.panels.filter(function (panel) {
      return panel !== action.panel;
    })
  });
}, _reducers[ActionTypes.ForceRerender] = function (state) {
  return _extends({}, state);
}, _reducers);
var TabsContext = /*#__PURE__*/createContext(null);
TabsContext.displayName = 'TabsContext';

function useTabsContext(component) {
  var context = useContext(TabsContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <Tab.Group /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabsContext);
    throw err;
  }

  return context;
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_TABS_TAG = Fragment;

function Tabs(props) {
  var _props$defaultIndex = props.defaultIndex,
      defaultIndex = _props$defaultIndex === void 0 ? 0 : _props$defaultIndex,
      _props$vertical = props.vertical,
      vertical = _props$vertical === void 0 ? false : _props$vertical,
      _props$manual = props.manual,
      manual = _props$manual === void 0 ? false : _props$manual,
      onChange = props.onChange,
      passThroughProps = _objectWithoutPropertiesLoose(props, ["defaultIndex", "vertical", "manual", "onChange"]);

  var orientation = vertical ? 'vertical' : 'horizontal';
  var activation = manual ? 'manual' : 'auto';

  var _useReducer = useReducer(stateReducer, {
    selectedIndex: null,
    tabs: [],
    panels: [],
    orientation: orientation,
    activation: activation
  }),
      state = _useReducer[0],
      dispatch = _useReducer[1];

  var slot = useMemo(function () {
    return {
      selectedIndex: state.selectedIndex
    };
  }, [state.selectedIndex]);
  var onChangeRef = useRef(function () {});
  useEffect(function () {
    dispatch({
      type: ActionTypes.SetOrientation,
      orientation: orientation
    });
  }, [orientation]);
  useEffect(function () {
    dispatch({
      type: ActionTypes.SetActivation,
      activation: activation
    });
  }, [activation]);
  useEffect(function () {
    if (typeof onChange === 'function') {
      onChangeRef.current = onChange;
    }
  }, [onChange]);
  useEffect(function () {
    if (state.tabs.length <= 0) return;
    if (state.selectedIndex !== null) return;
    var tabs = state.tabs.map(function (tab) {
      return tab.current;
    }).filter(Boolean);
    var focusableTabs = tabs.filter(function (tab) {
      return !tab.hasAttribute('disabled');
    }); // Underflow

    if (defaultIndex < 0) {
      dispatch({
        type: ActionTypes.SetSelectedIndex,
        index: tabs.indexOf(focusableTabs[0])
      });
    } // Overflow
    else if (defaultIndex > state.tabs.length) {
        dispatch({
          type: ActionTypes.SetSelectedIndex,
          index: tabs.indexOf(focusableTabs[focusableTabs.length - 1])
        });
      } // Middle
      else {
          var before = tabs.slice(0, defaultIndex);
          var after = tabs.slice(defaultIndex);
          var next = [].concat(after, before).find(function (tab) {
            return focusableTabs.includes(tab);
          });
          if (!next) return;
          dispatch({
            type: ActionTypes.SetSelectedIndex,
            index: tabs.indexOf(next)
          });
        }
  }, [defaultIndex, state.tabs, state.selectedIndex]);
  var lastChangedIndex = useRef(state.selectedIndex);
  var providerBag = useMemo(function () {
    return [state, {
      dispatch: dispatch,
      change: function change(index) {
        if (lastChangedIndex.current !== index) onChangeRef.current(index);
        lastChangedIndex.current = index;
        dispatch({
          type: ActionTypes.SetSelectedIndex,
          index: index
        });
      }
    }];
  }, [state, dispatch]);
  return React.createElement(TabsContext.Provider, {
    value: providerBag
  }, render({
    props: _extends({}, passThroughProps),
    slot: slot,
    defaultTag: DEFAULT_TABS_TAG,
    name: 'Tabs'
  }));
} // ---


var DEFAULT_LIST_TAG = 'div';

function List(props) {
  var _useTabsContext = useTabsContext([Tab.name, List.name].join('.')),
      _useTabsContext$ = _useTabsContext[0],
      selectedIndex = _useTabsContext$.selectedIndex,
      orientation = _useTabsContext$.orientation;

  var slot = {
    selectedIndex: selectedIndex
  };
  var propsWeControl = {
    role: 'tablist',
    'aria-orientation': orientation
  };
  var passThroughProps = props;
  return render({
    props: _extends({}, passThroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_LIST_TAG,
    name: 'Tabs.List'
  });
} // ---


var DEFAULT_TAB_TAG = 'button';
function Tab(props) {
  var _panels$myIndex, _panels$myIndex$curre;

  var id = "headlessui-tabs-tab-" + useId();

  var _useTabsContext2 = useTabsContext(Tab.name),
      _useTabsContext2$ = _useTabsContext2[0],
      selectedIndex = _useTabsContext2$.selectedIndex,
      tabs = _useTabsContext2$.tabs,
      panels = _useTabsContext2$.panels,
      orientation = _useTabsContext2$.orientation,
      activation = _useTabsContext2$.activation,
      _useTabsContext2$2 = _useTabsContext2[1],
      dispatch = _useTabsContext2$2.dispatch,
      change = _useTabsContext2$2.change;

  var internalTabRef = useRef(null);
  var tabRef = useSyncRefs(internalTabRef, function (element) {
    if (!element) return;
    dispatch({
      type: ActionTypes.ForceRerender
    });
  });
  useIsoMorphicEffect(function () {
    dispatch({
      type: ActionTypes.RegisterTab,
      tab: internalTabRef
    });
    return function () {
      return dispatch({
        type: ActionTypes.UnregisterTab,
        tab: internalTabRef
      });
    };
  }, [dispatch, internalTabRef]);
  var myIndex = tabs.indexOf(internalTabRef);
  var selected = myIndex === selectedIndex;
  var handleKeyDown = useCallback(function (event) {
    var list = tabs.map(function (tab) {
      return tab.current;
    }).filter(Boolean);

    if (event.key === Keys.Space || event.key === Keys.Enter) {
      event.preventDefault();
      event.stopPropagation();
      change(myIndex);
      return;
    }

    switch (event.key) {
      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();
        return focusIn(list, Focus.First);

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();
        return focusIn(list, Focus.Last);
    }

    return match(orientation, {
      vertical: function vertical() {
        if (event.key === Keys.ArrowUp) return focusIn(list, Focus.Previous | Focus.WrapAround);
        if (event.key === Keys.ArrowDown) return focusIn(list, Focus.Next | Focus.WrapAround);
        return;
      },
      horizontal: function horizontal() {
        if (event.key === Keys.ArrowLeft) return focusIn(list, Focus.Previous | Focus.WrapAround);
        if (event.key === Keys.ArrowRight) return focusIn(list, Focus.Next | Focus.WrapAround);
        return;
      }
    });
  }, [tabs, orientation, myIndex, change]);
  var handleFocus = useCallback(function () {
    var _internalTabRef$curre;

    (_internalTabRef$curre = internalTabRef.current) == null ? void 0 : _internalTabRef$curre.focus();
  }, [internalTabRef]);
  var handleSelection = useCallback(function () {
    var _internalTabRef$curre2;

    (_internalTabRef$curre2 = internalTabRef.current) == null ? void 0 : _internalTabRef$curre2.focus();
    change(myIndex);
  }, [change, myIndex, internalTabRef]);
  var slot = useMemo(function () {
    return {
      selected: selected
    };
  }, [selected]);
  var propsWeControl = {
    ref: tabRef,
    onKeyDown: handleKeyDown,
    onFocus: activation === 'manual' ? handleFocus : handleSelection,
    onClick: handleSelection,
    id: id,
    role: 'tab',
    type: useResolveButtonType(props, internalTabRef),
    'aria-controls': (_panels$myIndex = panels[myIndex]) == null ? void 0 : (_panels$myIndex$curre = _panels$myIndex.current) == null ? void 0 : _panels$myIndex$curre.id,
    'aria-selected': selected,
    tabIndex: selected ? 0 : -1
  };
  var passThroughProps = props;

  if (process.env.NODE_ENV === 'test') {
    var _Object$assign;

    Object.assign(propsWeControl, (_Object$assign = {}, _Object$assign['data-headlessui-index'] = myIndex, _Object$assign));
  }

  return render({
    props: _extends({}, passThroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_TAB_TAG,
    name: 'Tabs.Tab'
  });
} // ---

var DEFAULT_PANELS_TAG = 'div';

function Panels(props) {
  var _useTabsContext3 = useTabsContext([Tab.name, Panels.name].join('.')),
      selectedIndex = _useTabsContext3[0].selectedIndex;

  var slot = useMemo(function () {
    return {
      selectedIndex: selectedIndex
    };
  }, [selectedIndex]);
  return render({
    props: props,
    slot: slot,
    defaultTag: DEFAULT_PANELS_TAG,
    name: 'Tabs.Panels'
  });
} // ---


var DEFAULT_PANEL_TAG = 'div';
var PanelRenderFeatures = Features.RenderStrategy | Features.Static;

function Panel(props) {
  var _tabs$myIndex, _tabs$myIndex$current;

  var _useTabsContext4 = useTabsContext([Tab.name, Panel.name].join('.')),
      _useTabsContext4$ = _useTabsContext4[0],
      selectedIndex = _useTabsContext4$.selectedIndex,
      tabs = _useTabsContext4$.tabs,
      panels = _useTabsContext4$.panels,
      dispatch = _useTabsContext4[1].dispatch;

  var id = "headlessui-tabs-panel-" + useId();
  var internalPanelRef = useRef(null);
  var panelRef = useSyncRefs(internalPanelRef, function (element) {
    if (!element) return;
    dispatch({
      type: ActionTypes.ForceRerender
    });
  });
  useIsoMorphicEffect(function () {
    dispatch({
      type: ActionTypes.RegisterPanel,
      panel: internalPanelRef
    });
    return function () {
      return dispatch({
        type: ActionTypes.UnregisterPanel,
        panel: internalPanelRef
      });
    };
  }, [dispatch, internalPanelRef]);
  var myIndex = panels.indexOf(internalPanelRef);
  var selected = myIndex === selectedIndex;
  var slot = useMemo(function () {
    return {
      selected: selected
    };
  }, [selected]);
  var propsWeControl = {
    ref: panelRef,
    id: id,
    role: 'tabpanel',
    'aria-labelledby': (_tabs$myIndex = tabs[myIndex]) == null ? void 0 : (_tabs$myIndex$current = _tabs$myIndex.current) == null ? void 0 : _tabs$myIndex$current.id,
    tabIndex: selected ? 0 : -1
  };

  if (process.env.NODE_ENV === 'test') {
    var _Object$assign2;

    Object.assign(propsWeControl, (_Object$assign2 = {}, _Object$assign2['data-headlessui-index'] = myIndex, _Object$assign2));
  }

  var passThroughProps = props;
  return render({
    props: _extends({}, passThroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_PANEL_TAG,
    features: PanelRenderFeatures,
    visible: selected,
    name: 'Tabs.Panel'
  });
} // ---


Tab.Group = Tabs;
Tab.List = List;
Tab.Panels = Panels;
Tab.Panel = Panel;

export { Tab };
//# sourceMappingURL=tabs.esm.js.map
