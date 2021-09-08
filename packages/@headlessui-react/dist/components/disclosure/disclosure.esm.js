import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useReducer, useEffect, useCallback, useMemo, createContext, useRef, useContext, Fragment } from 'react';
import { match } from '../../utils/match.esm.js';
import { render, forwardRefWithAs, Features } from '../../utils/render.esm.js';
import { useSyncRefs } from '../../hooks/use-sync-refs.esm.js';
import { Keys } from '../keyboard.esm.js';
import { isDisabledReactIssue7711 } from '../../utils/bugs.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed.esm.js';
import { useResolveButtonType } from '../../hooks/use-resolve-button-type.esm.js';

var _reducers;
var DisclosureStates;

(function (DisclosureStates) {
  DisclosureStates[DisclosureStates["Open"] = 0] = "Open";
  DisclosureStates[DisclosureStates["Closed"] = 1] = "Closed";
})(DisclosureStates || (DisclosureStates = {}));

var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["ToggleDisclosure"] = 0] = "ToggleDisclosure";
  ActionTypes[ActionTypes["CloseDisclosure"] = 1] = "CloseDisclosure";
  ActionTypes[ActionTypes["SetButtonId"] = 2] = "SetButtonId";
  ActionTypes[ActionTypes["SetPanelId"] = 3] = "SetPanelId";
  ActionTypes[ActionTypes["LinkPanel"] = 4] = "LinkPanel";
  ActionTypes[ActionTypes["UnlinkPanel"] = 5] = "UnlinkPanel";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.ToggleDisclosure] = function (state) {
  var _match;

  return _extends({}, state, {
    disclosureState: match(state.disclosureState, (_match = {}, _match[DisclosureStates.Open] = DisclosureStates.Closed, _match[DisclosureStates.Closed] = DisclosureStates.Open, _match))
  });
}, _reducers[ActionTypes.CloseDisclosure] = function (state) {
  if (state.disclosureState === DisclosureStates.Closed) return state;
  return _extends({}, state, {
    disclosureState: DisclosureStates.Closed
  });
}, _reducers[ActionTypes.LinkPanel] = function (state) {
  if (state.linkedPanel === true) return state;
  return _extends({}, state, {
    linkedPanel: true
  });
}, _reducers[ActionTypes.UnlinkPanel] = function (state) {
  if (state.linkedPanel === false) return state;
  return _extends({}, state, {
    linkedPanel: false
  });
}, _reducers[ActionTypes.SetButtonId] = function (state, action) {
  if (state.buttonId === action.buttonId) return state;
  return _extends({}, state, {
    buttonId: action.buttonId
  });
}, _reducers[ActionTypes.SetPanelId] = function (state, action) {
  if (state.panelId === action.panelId) return state;
  return _extends({}, state, {
    panelId: action.panelId
  });
}, _reducers);
var DisclosureContext = /*#__PURE__*/createContext(null);
DisclosureContext.displayName = 'DisclosureContext';

function useDisclosureContext(component) {
  var context = useContext(DisclosureContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Disclosure.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext);
    throw err;
  }

  return context;
}

var DisclosureAPIContext = /*#__PURE__*/createContext(null);
DisclosureAPIContext.displayName = 'DisclosureAPIContext';

function useDisclosureAPIContext(component) {
  var context = useContext(DisclosureAPIContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Disclosure.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureAPIContext);
    throw err;
  }

  return context;
}

var DisclosurePanelContext = /*#__PURE__*/createContext(null);
DisclosurePanelContext.displayName = 'DisclosurePanelContext';

function useDisclosurePanelContext() {
  return useContext(DisclosurePanelContext);
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_DISCLOSURE_TAG = Fragment;
function Disclosure(props) {
  var _match2;

  var _props$defaultOpen = props.defaultOpen,
      defaultOpen = _props$defaultOpen === void 0 ? false : _props$defaultOpen,
      passthroughProps = _objectWithoutPropertiesLoose(props, ["defaultOpen"]);

  var buttonId = "headlessui-disclosure-button-" + useId();
  var panelId = "headlessui-disclosure-panel-" + useId();
  var reducerBag = useReducer(stateReducer, {
    disclosureState: defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed,
    linkedPanel: false,
    buttonId: buttonId,
    panelId: panelId
  });
  var disclosureState = reducerBag[0].disclosureState,
      dispatch = reducerBag[1];
  useEffect(function () {
    return dispatch({
      type: ActionTypes.SetButtonId,
      buttonId: buttonId
    });
  }, [buttonId, dispatch]);
  useEffect(function () {
    return dispatch({
      type: ActionTypes.SetPanelId,
      panelId: panelId
    });
  }, [panelId, dispatch]);
  var close = useCallback(function (focusableElement) {
    dispatch({
      type: ActionTypes.CloseDisclosure
    });

    var restoreElement = function () {
      if (!focusableElement) return document.getElementById(buttonId);
      if (focusableElement instanceof HTMLElement) return focusableElement;
      if (focusableElement.current instanceof HTMLElement) return focusableElement.current;
      return document.getElementById(buttonId);
    }();

    restoreElement == null ? void 0 : restoreElement.focus();
  }, [dispatch, buttonId]);
  var api = useMemo(function () {
    return {
      close: close
    };
  }, [close]);
  var slot = useMemo(function () {
    return {
      open: disclosureState === DisclosureStates.Open,
      close: close
    };
  }, [disclosureState, close]);
  return React.createElement(DisclosureContext.Provider, {
    value: reducerBag
  }, React.createElement(DisclosureAPIContext.Provider, {
    value: api
  }, React.createElement(OpenClosedProvider, {
    value: match(disclosureState, (_match2 = {}, _match2[DisclosureStates.Open] = State.Open, _match2[DisclosureStates.Closed] = State.Closed, _match2))
  }, render({
    props: passthroughProps,
    slot: slot,
    defaultTag: DEFAULT_DISCLOSURE_TAG,
    name: 'Disclosure'
  }))));
} // ---

var DEFAULT_BUTTON_TAG = 'button';
var Button = /*#__PURE__*/forwardRefWithAs(function Button(props, ref) {
  var _useDisclosureContext = useDisclosureContext([Disclosure.name, Button.name].join('.')),
      state = _useDisclosureContext[0],
      dispatch = _useDisclosureContext[1];

  var internalButtonRef = useRef(null);
  var buttonRef = useSyncRefs(internalButtonRef, ref);
  var panelContext = useDisclosurePanelContext();
  var isWithinPanel = panelContext === null ? false : panelContext === state.panelId;
  var handleKeyDown = useCallback(function (event) {
    var _document$getElementB;

    if (isWithinPanel) {
      if (state.disclosureState === DisclosureStates.Closed) return;

      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault();
          event.stopPropagation();
          dispatch({
            type: ActionTypes.ToggleDisclosure
          });
          (_document$getElementB = document.getElementById(state.buttonId)) == null ? void 0 : _document$getElementB.focus();
          break;
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault();
          event.stopPropagation();
          dispatch({
            type: ActionTypes.ToggleDisclosure
          });
          break;
      }
    }
  }, [dispatch, isWithinPanel, state.disclosureState]);
  var handleKeyUp = useCallback(function (event) {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault();
        break;
    }
  }, []);
  var handleClick = useCallback(function (event) {
    if (isDisabledReactIssue7711(event.currentTarget)) return;
    if (props.disabled) return;

    if (isWithinPanel) {
      var _document$getElementB2;

      dispatch({
        type: ActionTypes.ToggleDisclosure
      });
      (_document$getElementB2 = document.getElementById(state.buttonId)) == null ? void 0 : _document$getElementB2.focus();
    } else {
      dispatch({
        type: ActionTypes.ToggleDisclosure
      });
    }
  }, [dispatch, props.disabled, state.buttonId, isWithinPanel]);
  var slot = useMemo(function () {
    return {
      open: state.disclosureState === DisclosureStates.Open
    };
  }, [state]);
  var type = useResolveButtonType(props, internalButtonRef);
  var passthroughProps = props;
  var propsWeControl = isWithinPanel ? {
    ref: buttonRef,
    type: type,
    onKeyDown: handleKeyDown,
    onClick: handleClick
  } : {
    ref: buttonRef,
    id: state.buttonId,
    type: type,
    'aria-expanded': props.disabled ? undefined : state.disclosureState === DisclosureStates.Open,
    'aria-controls': state.linkedPanel ? state.panelId : undefined,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick
  };
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Disclosure.Button'
  });
}); // ---

var DEFAULT_PANEL_TAG = 'div';
var PanelRenderFeatures = Features.RenderStrategy | Features.Static;
var Panel = /*#__PURE__*/forwardRefWithAs(function Panel(props, ref) {
  var _useDisclosureContext2 = useDisclosureContext([Disclosure.name, Panel.name].join('.')),
      state = _useDisclosureContext2[0],
      dispatch = _useDisclosureContext2[1];

  var _useDisclosureAPICont = useDisclosureAPIContext([Disclosure.name, Panel.name].join('.')),
      close = _useDisclosureAPICont.close;

  var panelRef = useSyncRefs(ref, function () {
    if (state.linkedPanel) return;
    dispatch({
      type: ActionTypes.LinkPanel
    });
  });
  var usesOpenClosedState = useOpenClosed();

  var visible = function () {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open;
    }

    return state.disclosureState === DisclosureStates.Open;
  }(); // Unlink on "unmount" myself


  useEffect(function () {
    return function () {
      return dispatch({
        type: ActionTypes.UnlinkPanel
      });
    };
  }, [dispatch]); // Unlink on "unmount" children

  useEffect(function () {
    var _props$unmount;

    if (state.disclosureState === DisclosureStates.Closed && ((_props$unmount = props.unmount) != null ? _props$unmount : true)) {
      dispatch({
        type: ActionTypes.UnlinkPanel
      });
    }
  }, [state.disclosureState, props.unmount, dispatch]);
  var slot = useMemo(function () {
    return {
      open: state.disclosureState === DisclosureStates.Open,
      close: close
    };
  }, [state, close]);
  var propsWeControl = {
    ref: panelRef,
    id: state.panelId
  };
  var passthroughProps = props;
  return React.createElement(DisclosurePanelContext.Provider, {
    value: state.panelId
  }, render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_PANEL_TAG,
    features: PanelRenderFeatures,
    visible: visible,
    name: 'Disclosure.Panel'
  }));
}); // ---

Disclosure.Button = Button;
Disclosure.Panel = Panel;

export { Disclosure };
//# sourceMappingURL=disclosure.esm.js.map
