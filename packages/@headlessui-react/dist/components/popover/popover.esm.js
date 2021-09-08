import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose, createForOfIteratorHelperLoose as _createForOfIteratorHelperLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useReducer, useEffect, useMemo, useContext, useCallback, createContext, useRef, useState } from 'react';
import { match } from '../../utils/match.esm.js';
import { render, forwardRefWithAs, Features } from '../../utils/render.esm.js';
import { useSyncRefs } from '../../hooks/use-sync-refs.esm.js';
import { Keys } from '../keyboard.esm.js';
import { isDisabledReactIssue7711 } from '../../utils/bugs.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { isFocusableElement, getFocusableElements, focusIn, Focus, FocusResult, FocusableMode } from '../../utils/focus-management.esm.js';
import { useWindowEvent } from '../../hooks/use-window-event.esm.js';
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed.esm.js';
import { useResolveButtonType } from '../../hooks/use-resolve-button-type.esm.js';

var _reducers;
var PopoverStates;

(function (PopoverStates) {
  PopoverStates[PopoverStates["Open"] = 0] = "Open";
  PopoverStates[PopoverStates["Closed"] = 1] = "Closed";
})(PopoverStates || (PopoverStates = {}));

var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["TogglePopover"] = 0] = "TogglePopover";
  ActionTypes[ActionTypes["ClosePopover"] = 1] = "ClosePopover";
  ActionTypes[ActionTypes["SetButton"] = 2] = "SetButton";
  ActionTypes[ActionTypes["SetButtonId"] = 3] = "SetButtonId";
  ActionTypes[ActionTypes["SetPanel"] = 4] = "SetPanel";
  ActionTypes[ActionTypes["SetPanelId"] = 5] = "SetPanelId";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.TogglePopover] = function (state) {
  var _match;

  return _extends({}, state, {
    popoverState: match(state.popoverState, (_match = {}, _match[PopoverStates.Open] = PopoverStates.Closed, _match[PopoverStates.Closed] = PopoverStates.Open, _match))
  });
}, _reducers[ActionTypes.ClosePopover] = function (state) {
  if (state.popoverState === PopoverStates.Closed) return state;
  return _extends({}, state, {
    popoverState: PopoverStates.Closed
  });
}, _reducers[ActionTypes.SetButton] = function (state, action) {
  if (state.button === action.button) return state;
  return _extends({}, state, {
    button: action.button
  });
}, _reducers[ActionTypes.SetButtonId] = function (state, action) {
  if (state.buttonId === action.buttonId) return state;
  return _extends({}, state, {
    buttonId: action.buttonId
  });
}, _reducers[ActionTypes.SetPanel] = function (state, action) {
  if (state.panel === action.panel) return state;
  return _extends({}, state, {
    panel: action.panel
  });
}, _reducers[ActionTypes.SetPanelId] = function (state, action) {
  if (state.panelId === action.panelId) return state;
  return _extends({}, state, {
    panelId: action.panelId
  });
}, _reducers);
var PopoverContext = /*#__PURE__*/createContext(null);
PopoverContext.displayName = 'PopoverContext';

function usePopoverContext(component) {
  var context = useContext(PopoverContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Popover.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverContext);
    throw err;
  }

  return context;
}

var PopoverAPIContext = /*#__PURE__*/createContext(null);
PopoverAPIContext.displayName = 'PopoverAPIContext';

function usePopoverAPIContext(component) {
  var context = useContext(PopoverAPIContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Popover.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverAPIContext);
    throw err;
  }

  return context;
}

var PopoverGroupContext = /*#__PURE__*/createContext(null);
PopoverGroupContext.displayName = 'PopoverGroupContext';

function usePopoverGroupContext() {
  return useContext(PopoverGroupContext);
}

var PopoverPanelContext = /*#__PURE__*/createContext(null);
PopoverPanelContext.displayName = 'PopoverPanelContext';

function usePopoverPanelContext() {
  return useContext(PopoverPanelContext);
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_POPOVER_TAG = 'div';
function Popover(props) {
  var _match2;

  var buttonId = "headlessui-popover-button-" + useId();
  var panelId = "headlessui-popover-panel-" + useId();
  var reducerBag = useReducer(stateReducer, {
    popoverState: PopoverStates.Closed,
    button: null,
    buttonId: buttonId,
    panel: null,
    panelId: panelId
  });
  var _reducerBag$ = reducerBag[0],
      popoverState = _reducerBag$.popoverState,
      button = _reducerBag$.button,
      panel = _reducerBag$.panel,
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
  var registerBag = useMemo(function () {
    return {
      buttonId: buttonId,
      panelId: panelId,
      close: function close() {
        return dispatch({
          type: ActionTypes.ClosePopover
        });
      }
    };
  }, [buttonId, panelId, dispatch]);
  var groupContext = usePopoverGroupContext();
  var registerPopover = groupContext == null ? void 0 : groupContext.registerPopover;
  var isFocusWithinPopoverGroup = useCallback(function () {
    var _groupContext$isFocus;

    return (_groupContext$isFocus = groupContext == null ? void 0 : groupContext.isFocusWithinPopoverGroup()) != null ? _groupContext$isFocus : (button == null ? void 0 : button.contains(document.activeElement)) || (panel == null ? void 0 : panel.contains(document.activeElement));
  }, [groupContext, button, panel]);
  useEffect(function () {
    return registerPopover == null ? void 0 : registerPopover(registerBag);
  }, [registerPopover, registerBag]); // Handle focus out

  useWindowEvent('focus', function () {
    if (popoverState !== PopoverStates.Open) return;
    if (isFocusWithinPopoverGroup()) return;
    if (!button) return;
    if (!panel) return;
    dispatch({
      type: ActionTypes.ClosePopover
    });
  }, true); // Handle outside click

  useWindowEvent('mousedown', function (event) {
    var target = event.target;
    if (popoverState !== PopoverStates.Open) return;
    if (button == null ? void 0 : button.contains(target)) return;
    if (panel == null ? void 0 : panel.contains(target)) return;
    dispatch({
      type: ActionTypes.ClosePopover
    });

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault();
      button == null ? void 0 : button.focus();
    }
  });
  var close = useCallback(function (focusableElement) {
    dispatch({
      type: ActionTypes.ClosePopover
    });

    var restoreElement = function () {
      if (!focusableElement) return button;
      if (focusableElement instanceof HTMLElement) return focusableElement;
      if (focusableElement.current instanceof HTMLElement) return focusableElement.current;
      return button;
    }();

    restoreElement == null ? void 0 : restoreElement.focus();
  }, [dispatch, button]);
  var api = useMemo(function () {
    return {
      close: close
    };
  }, [close]);
  var slot = useMemo(function () {
    return {
      open: popoverState === PopoverStates.Open,
      close: close
    };
  }, [popoverState, close]);
  return React.createElement(PopoverContext.Provider, {
    value: reducerBag
  }, React.createElement(PopoverAPIContext.Provider, {
    value: api
  }, React.createElement(OpenClosedProvider, {
    value: match(popoverState, (_match2 = {}, _match2[PopoverStates.Open] = State.Open, _match2[PopoverStates.Closed] = State.Closed, _match2))
  }, render({
    props: props,
    slot: slot,
    defaultTag: DEFAULT_POPOVER_TAG,
    name: 'Popover'
  }))));
} // ---

var DEFAULT_BUTTON_TAG = 'button';
var Button = /*#__PURE__*/forwardRefWithAs(function Button(props, ref) {
  var _usePopoverContext = usePopoverContext([Popover.name, Button.name].join('.')),
      state = _usePopoverContext[0],
      dispatch = _usePopoverContext[1];

  var internalButtonRef = useRef(null);
  var groupContext = usePopoverGroupContext();
  var closeOthers = groupContext == null ? void 0 : groupContext.closeOthers;
  var panelContext = usePopoverPanelContext();
  var isWithinPanel = panelContext === null ? false : panelContext === state.panelId;
  var buttonRef = useSyncRefs(internalButtonRef, ref, isWithinPanel ? null : function (button) {
    return dispatch({
      type: ActionTypes.SetButton,
      button: button
    });
  });
  var withinPanelButtonRef = useSyncRefs(internalButtonRef, ref); // TODO: Revisit when handling Tab/Shift+Tab when using Portal's

  var activeElementRef = useRef(null);
  var previousActiveElementRef = useRef(typeof window === 'undefined' ? null : document.activeElement);
  useWindowEvent('focus', function () {
    previousActiveElementRef.current = activeElementRef.current;
    activeElementRef.current = document.activeElement;
  }, true);
  var handleKeyDown = useCallback(function (event) {
    var _state$button;

    if (isWithinPanel) {
      if (state.popoverState === PopoverStates.Closed) return;

      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault(); // Prevent triggering a *click* event

          event.stopPropagation();
          dispatch({
            type: ActionTypes.ClosePopover
          });
          (_state$button = state.button) == null ? void 0 : _state$button.focus(); // Re-focus the original opening Button

          break;
      }
    } else {
      switch (event.key) {
        case Keys.Space:
        case Keys.Enter:
          event.preventDefault(); // Prevent triggering a *click* event

          event.stopPropagation();
          if (state.popoverState === PopoverStates.Closed) closeOthers == null ? void 0 : closeOthers(state.buttonId);
          dispatch({
            type: ActionTypes.TogglePopover
          });
          break;

        case Keys.Escape:
          if (state.popoverState !== PopoverStates.Open) return closeOthers == null ? void 0 : closeOthers(state.buttonId);
          if (!internalButtonRef.current) return;
          if (!internalButtonRef.current.contains(document.activeElement)) return;
          dispatch({
            type: ActionTypes.ClosePopover
          });
          break;

        case Keys.Tab:
          if (state.popoverState !== PopoverStates.Open) return;
          if (!state.panel) return;
          if (!state.button) return; // TODO: Revisit when handling Tab/Shift+Tab when using Portal's

          if (event.shiftKey) {
            var _state$button2;

            // Check if the last focused element exists, and check that it is not inside button or panel itself
            if (!previousActiveElementRef.current) return;
            if ((_state$button2 = state.button) == null ? void 0 : _state$button2.contains(previousActiveElementRef.current)) return;
            if (state.panel.contains(previousActiveElementRef.current)) return; // Check if the last focused element is *after* the button in the DOM

            var focusableElements = getFocusableElements();
            var previousIdx = focusableElements.indexOf(previousActiveElementRef.current);
            var buttonIdx = focusableElements.indexOf(state.button);
            if (buttonIdx > previousIdx) return;
            event.preventDefault();
            event.stopPropagation();
            focusIn(state.panel, Focus.Last);
          } else {
            event.preventDefault();
            event.stopPropagation();
            focusIn(state.panel, Focus.First);
          }

          break;
      }
    }
  }, [dispatch, state.popoverState, state.buttonId, state.button, state.panel, internalButtonRef, closeOthers, isWithinPanel]);
  var handleKeyUp = useCallback(function (event) {
    var _state$button3;

    if (isWithinPanel) return;

    if (event.key === Keys.Space) {
      // Required for firefox, event.preventDefault() in handleKeyDown for
      // the Space key doesn't cancel the handleKeyUp, which in turn
      // triggers a *click*.
      event.preventDefault();
    }

    if (state.popoverState !== PopoverStates.Open) return;
    if (!state.panel) return;
    if (!state.button) return; // TODO: Revisit when handling Tab/Shift+Tab when using Portal's

    switch (event.key) {
      case Keys.Tab:
        // Check if the last focused element exists, and check that it is not inside button or panel itself
        if (!previousActiveElementRef.current) return;
        if ((_state$button3 = state.button) == null ? void 0 : _state$button3.contains(previousActiveElementRef.current)) return;
        if (state.panel.contains(previousActiveElementRef.current)) return; // Check if the last focused element is *after* the button in the DOM

        var focusableElements = getFocusableElements();
        var previousIdx = focusableElements.indexOf(previousActiveElementRef.current);
        var buttonIdx = focusableElements.indexOf(state.button);
        if (buttonIdx > previousIdx) return;
        event.preventDefault();
        event.stopPropagation();
        focusIn(state.panel, Focus.Last);
        break;
    }
  }, [state.popoverState, state.panel, state.button, isWithinPanel]);
  var handleClick = useCallback(function (event) {
    if (isDisabledReactIssue7711(event.currentTarget)) return;
    if (props.disabled) return;

    if (isWithinPanel) {
      var _state$button4;

      dispatch({
        type: ActionTypes.ClosePopover
      });
      (_state$button4 = state.button) == null ? void 0 : _state$button4.focus(); // Re-focus the original opening Button
    } else {
      var _state$button5;

      if (state.popoverState === PopoverStates.Closed) closeOthers == null ? void 0 : closeOthers(state.buttonId);
      (_state$button5 = state.button) == null ? void 0 : _state$button5.focus();
      dispatch({
        type: ActionTypes.TogglePopover
      });
    }
  }, [dispatch, state.button, state.popoverState, state.buttonId, props.disabled, closeOthers, isWithinPanel]);
  var slot = useMemo(function () {
    return {
      open: state.popoverState === PopoverStates.Open
    };
  }, [state]);
  var type = useResolveButtonType(props, internalButtonRef);
  var passthroughProps = props;
  var propsWeControl = isWithinPanel ? {
    ref: withinPanelButtonRef,
    type: type,
    onKeyDown: handleKeyDown,
    onClick: handleClick
  } : {
    ref: buttonRef,
    id: state.buttonId,
    type: type,
    'aria-expanded': props.disabled ? undefined : state.popoverState === PopoverStates.Open,
    'aria-controls': state.panel ? state.panelId : undefined,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick
  };
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Popover.Button'
  });
}); // ---

var DEFAULT_OVERLAY_TAG = 'div';
var OverlayRenderFeatures = Features.RenderStrategy | Features.Static;
var Overlay = /*#__PURE__*/forwardRefWithAs(function Overlay(props, ref) {
  var _usePopoverContext2 = usePopoverContext([Popover.name, Overlay.name].join('.')),
      popoverState = _usePopoverContext2[0].popoverState,
      dispatch = _usePopoverContext2[1];

  var overlayRef = useSyncRefs(ref);
  var id = "headlessui-popover-overlay-" + useId();
  var usesOpenClosedState = useOpenClosed();

  var visible = function () {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open;
    }

    return popoverState === PopoverStates.Open;
  }();

  var handleClick = useCallback(function (event) {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault();
    dispatch({
      type: ActionTypes.ClosePopover
    });
  }, [dispatch]);
  var slot = useMemo(function () {
    return {
      open: popoverState === PopoverStates.Open
    };
  }, [popoverState]);
  var propsWeControl = {
    ref: overlayRef,
    id: id,
    'aria-hidden': true,
    onClick: handleClick
  };
  var passthroughProps = props;
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_OVERLAY_TAG,
    features: OverlayRenderFeatures,
    visible: visible,
    name: 'Popover.Overlay'
  });
}); // ---

var DEFAULT_PANEL_TAG = 'div';
var PanelRenderFeatures = Features.RenderStrategy | Features.Static;
var Panel = /*#__PURE__*/forwardRefWithAs(function Panel(props, ref) {
  var _props$focus = props.focus,
      focus = _props$focus === void 0 ? false : _props$focus,
      passthroughProps = _objectWithoutPropertiesLoose(props, ["focus"]);

  var _usePopoverContext3 = usePopoverContext([Popover.name, Panel.name].join('.')),
      state = _usePopoverContext3[0],
      dispatch = _usePopoverContext3[1];

  var _usePopoverAPIContext = usePopoverAPIContext([Popover.name, Panel.name].join('.')),
      close = _usePopoverAPIContext.close;

  var internalPanelRef = useRef(null);
  var panelRef = useSyncRefs(internalPanelRef, ref, function (panel) {
    dispatch({
      type: ActionTypes.SetPanel,
      panel: panel
    });
  });
  var usesOpenClosedState = useOpenClosed();

  var visible = function () {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open;
    }

    return state.popoverState === PopoverStates.Open;
  }();

  var handleKeyDown = useCallback(function (event) {
    var _state$button6;

    switch (event.key) {
      case Keys.Escape:
        if (state.popoverState !== PopoverStates.Open) return;
        if (!internalPanelRef.current) return;
        if (!internalPanelRef.current.contains(document.activeElement)) return;
        event.preventDefault();
        dispatch({
          type: ActionTypes.ClosePopover
        });
        (_state$button6 = state.button) == null ? void 0 : _state$button6.focus();
        break;
    }
  }, [state, internalPanelRef, dispatch]); // Unlink on "unmount" myself

  useEffect(function () {
    return function () {
      return dispatch({
        type: ActionTypes.SetPanel,
        panel: null
      });
    };
  }, [dispatch]); // Unlink on "unmount" children

  useEffect(function () {
    var _props$unmount;

    if (state.popoverState === PopoverStates.Closed && ((_props$unmount = props.unmount) != null ? _props$unmount : true)) {
      dispatch({
        type: ActionTypes.SetPanel,
        panel: null
      });
    }
  }, [state.popoverState, props.unmount, dispatch]); // Move focus within panel

  useEffect(function () {
    if (!focus) return;
    if (state.popoverState !== PopoverStates.Open) return;
    if (!internalPanelRef.current) return;
    var activeElement = document.activeElement;
    if (internalPanelRef.current.contains(activeElement)) return; // Already focused within Dialog

    focusIn(internalPanelRef.current, Focus.First);
  }, [focus, internalPanelRef, state.popoverState]); // Handle Tab / Shift+Tab focus positioning

  useWindowEvent('keydown', function (event) {
    if (state.popoverState !== PopoverStates.Open) return;
    if (!internalPanelRef.current) return;
    if (event.key !== Keys.Tab) return;
    if (!document.activeElement) return;
    if (!internalPanelRef.current) return;
    if (!internalPanelRef.current.contains(document.activeElement)) return; // We will take-over the default tab behaviour so that we have a bit
    // control over what is focused next. It will behave exactly the same,
    // but it will also "fix" some issues based on whether you are using a
    // Portal or not.

    event.preventDefault();
    var result = focusIn(internalPanelRef.current, event.shiftKey ? Focus.Previous : Focus.Next);

    if (result === FocusResult.Underflow) {
      var _state$button7;

      return (_state$button7 = state.button) == null ? void 0 : _state$button7.focus();
    } else if (result === FocusResult.Overflow) {
      if (!state.button) return;
      var elements = getFocusableElements();
      var buttonIdx = elements.indexOf(state.button);
      var nextElements = elements.splice(buttonIdx + 1) // Elements after button
      .filter(function (element) {
        var _internalPanelRef$cur;

        return !((_internalPanelRef$cur = internalPanelRef.current) == null ? void 0 : _internalPanelRef$cur.contains(element));
      }); // Ignore items in panel
      // Try to focus the next element, however it could fail if we are in a
      // Portal that happens to be the very last one in the DOM. In that
      // case we would Error (because nothing after the button is
      // focusable). Therefore we will try and focus the very first item in
      // the document.body.

      if (focusIn(nextElements, Focus.First) === FocusResult.Error) {
        focusIn(document.body, Focus.First);
      }
    }
  }); // Handle focus out when we are in special "focus" mode

  useWindowEvent('focus', function () {
    var _internalPanelRef$cur2;

    if (!focus) return;
    if (state.popoverState !== PopoverStates.Open) return;
    if (!internalPanelRef.current) return;
    if ((_internalPanelRef$cur2 = internalPanelRef.current) == null ? void 0 : _internalPanelRef$cur2.contains(document.activeElement)) return;
    dispatch({
      type: ActionTypes.ClosePopover
    });
  }, true);
  var slot = useMemo(function () {
    return {
      open: state.popoverState === PopoverStates.Open,
      close: close
    };
  }, [state, close]);
  var propsWeControl = {
    ref: panelRef,
    id: state.panelId,
    onKeyDown: handleKeyDown
  };
  return React.createElement(PopoverPanelContext.Provider, {
    value: state.panelId
  }, render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_PANEL_TAG,
    features: PanelRenderFeatures,
    visible: visible,
    name: 'Popover.Panel'
  }));
}); // ---

var DEFAULT_GROUP_TAG = 'div';

function Group(props) {
  var groupRef = useRef(null);

  var _useState = useState([]),
      popovers = _useState[0],
      setPopovers = _useState[1];

  var unregisterPopover = useCallback(function (registerbag) {
    setPopovers(function (existing) {
      var idx = existing.indexOf(registerbag);

      if (idx !== -1) {
        var clone = existing.slice();
        clone.splice(idx, 1);
        return clone;
      }

      return existing;
    });
  }, [setPopovers]);
  var registerPopover = useCallback(function (registerbag) {
    setPopovers(function (existing) {
      return [].concat(existing, [registerbag]);
    });
    return function () {
      return unregisterPopover(registerbag);
    };
  }, [setPopovers, unregisterPopover]);
  var isFocusWithinPopoverGroup = useCallback(function () {
    var _groupRef$current;

    var element = document.activeElement;
    if ((_groupRef$current = groupRef.current) == null ? void 0 : _groupRef$current.contains(element)) return true; // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.

    return popovers.some(function (bag) {
      var _document$getElementB, _document$getElementB2;

      return ((_document$getElementB = document.getElementById(bag.buttonId)) == null ? void 0 : _document$getElementB.contains(element)) || ((_document$getElementB2 = document.getElementById(bag.panelId)) == null ? void 0 : _document$getElementB2.contains(element));
    });
  }, [groupRef, popovers]);
  var closeOthers = useCallback(function (buttonId) {
    for (var _iterator = _createForOfIteratorHelperLoose(popovers), _step; !(_step = _iterator()).done;) {
      var popover = _step.value;
      if (popover.buttonId !== buttonId) popover.close();
    }
  }, [popovers]);
  var contextBag = useMemo(function () {
    return {
      registerPopover: registerPopover,
      unregisterPopover: unregisterPopover,
      isFocusWithinPopoverGroup: isFocusWithinPopoverGroup,
      closeOthers: closeOthers
    };
  }, [registerPopover, unregisterPopover, isFocusWithinPopoverGroup, closeOthers]);
  var slot = useMemo(function () {
    return {};
  }, []);
  var propsWeControl = {
    ref: groupRef
  };
  var passthroughProps = props;
  return React.createElement(PopoverGroupContext.Provider, {
    value: contextBag
  }, render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_GROUP_TAG,
    name: 'Popover.Group'
  }));
} // ---


Popover.Button = Button;
Popover.Overlay = Overlay;
Popover.Panel = Panel;
Popover.Group = Group;

export { Popover };
//# sourceMappingURL=popover.esm.js.map
