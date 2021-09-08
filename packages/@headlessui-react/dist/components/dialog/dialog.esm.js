import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose, createForOfIteratorHelperLoose as _createForOfIteratorHelperLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { createContext, useCallback, useMemo, useEffect, useContext, useState, useRef, useReducer } from 'react';
import { match } from '../../utils/match.esm.js';
import { forwardRefWithAs, render, Features as Features$1 } from '../../utils/render.esm.js';
import { useSyncRefs } from '../../hooks/use-sync-refs.esm.js';
import { Keys } from '../keyboard.esm.js';
import { isDisabledReactIssue7711 } from '../../utils/bugs.esm.js';
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { useWindowEvent } from '../../hooks/use-window-event.esm.js';
import { useFocusTrap, Features } from '../../hooks/use-focus-trap.esm.js';
import { useInertOthers } from '../../hooks/use-inert-others.esm.js';
import { ForcePortalRoot } from '../../internal/portal-force-root.esm.js';
import { Portal } from '../portal/portal.esm.js';
import { Description, useDescriptions } from '../description/description.esm.js';
import { useOpenClosed, State } from '../../internal/open-closed.esm.js';
import { StackProvider, StackMessage } from '../../internal/stack-context.esm.js';

var _reducers;
var DialogStates;

(function (DialogStates) {
  DialogStates[DialogStates["Open"] = 0] = "Open";
  DialogStates[DialogStates["Closed"] = 1] = "Closed";
})(DialogStates || (DialogStates = {}));

var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["SetTitleId"] = 0] = "SetTitleId";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.SetTitleId] = function (state, action) {
  if (state.titleId === action.id) return state;
  return _extends({}, state, {
    titleId: action.id
  });
}, _reducers);
var DialogContext = /*#__PURE__*/createContext(null);
DialogContext.displayName = 'DialogContext';

function useDialogContext(component) {
  var context = useContext(DialogContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Dialog.displayName + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext);
    throw err;
  }

  return context;
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_DIALOG_TAG = 'div';
var DialogRenderFeatures = Features$1.RenderStrategy | Features$1.Static;
var DialogRoot = /*#__PURE__*/forwardRefWithAs(function Dialog(props, ref) {
  var open = props.open,
      onClose = props.onClose,
      initialFocus = props.initialFocus,
      rest = _objectWithoutPropertiesLoose(props, ["open", "onClose", "initialFocus"]);

  var _useState = useState(0),
      nestedDialogCount = _useState[0],
      setNestedDialogCount = _useState[1];

  var usesOpenClosedState = useOpenClosed();

  if (open === undefined && usesOpenClosedState !== null) {
    var _match;

    // Update the `open` prop based on the open closed state
    open = match(usesOpenClosedState, (_match = {}, _match[State.Open] = true, _match[State.Closed] = false, _match));
  }

  var containers = useRef(new Set());
  var internalDialogRef = useRef(null);
  var dialogRef = useSyncRefs(internalDialogRef, ref); // Validations

  var hasOpen = props.hasOwnProperty('open') || usesOpenClosedState !== null;
  var hasOnClose = props.hasOwnProperty('onClose');

  if (!hasOpen && !hasOnClose) {
    throw new Error("You have to provide an `open` and an `onClose` prop to the `Dialog` component.");
  }

  if (!hasOpen) {
    throw new Error("You provided an `onClose` prop to the `Dialog`, but forgot an `open` prop.");
  }

  if (!hasOnClose) {
    throw new Error("You provided an `open` prop to the `Dialog`, but forgot an `onClose` prop.");
  }

  if (typeof open !== 'boolean') {
    throw new Error("You provided an `open` prop to the `Dialog`, but the value is not a boolean. Received: " + open);
  }

  if (typeof onClose !== 'function') {
    throw new Error("You provided an `onClose` prop to the `Dialog`, but the value is not a function. Received: " + onClose);
  }

  var dialogState = open ? DialogStates.Open : DialogStates.Closed;

  var visible = function () {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open;
    }

    return dialogState === DialogStates.Open;
  }();

  var _useReducer = useReducer(stateReducer, {
    titleId: null,
    descriptionId: null
  }),
      state = _useReducer[0],
      dispatch = _useReducer[1];

  var close = useCallback(function () {
    return onClose(false);
  }, [onClose]);
  var setTitleId = useCallback(function (id) {
    return dispatch({
      type: ActionTypes.SetTitleId,
      id: id
    });
  }, [dispatch]);
  var ready = useServerHandoffComplete();
  var enabled = ready && dialogState === DialogStates.Open;
  var hasNestedDialogs = nestedDialogCount > 1; // 1 is the current dialog

  var hasParentDialog = useContext(DialogContext) !== null; // If there are multiple dialogs, then you can be the root, the leaf or one
  // in between. We only care abou whether you are the top most one or not.

  var position = !hasNestedDialogs ? 'leaf' : 'parent';
  useFocusTrap(internalDialogRef, enabled ? match(position, {
    parent: Features.RestoreFocus,
    leaf: Features.All
  }) : Features.None, {
    initialFocus: initialFocus,
    containers: containers
  });
  useInertOthers(internalDialogRef, hasNestedDialogs ? enabled : false); // Handle outside click

  useWindowEvent('mousedown', function (event) {
    var _internalDialogRef$cu;

    var target = event.target;
    if (dialogState !== DialogStates.Open) return;
    if (hasNestedDialogs) return;
    if ((_internalDialogRef$cu = internalDialogRef.current) == null ? void 0 : _internalDialogRef$cu.contains(target)) return;
    close();
  }); // Handle `Escape` to close

  useWindowEvent('keydown', function (event) {
    if (event.key !== Keys.Escape) return;
    if (dialogState !== DialogStates.Open) return;
    if (hasNestedDialogs) return;
    event.preventDefault();
    event.stopPropagation();
    close();
  }); // Scroll lock

  useEffect(function () {
    if (dialogState !== DialogStates.Open) return;
    if (hasParentDialog) return;
    var overflow = document.documentElement.style.overflow;
    var paddingRight = document.documentElement.style.paddingRight;
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = scrollbarWidth + "px";
    return function () {
      document.documentElement.style.overflow = overflow;
      document.documentElement.style.paddingRight = paddingRight;
    };
  }, [dialogState, hasParentDialog]); // Trigger close when the FocusTrap gets hidden

  useEffect(function () {
    if (dialogState !== DialogStates.Open) return;
    if (!internalDialogRef.current) return;
    var observer = new IntersectionObserver(function (entries) {
      for (var _iterator = _createForOfIteratorHelperLoose(entries), _step; !(_step = _iterator()).done;) {
        var entry = _step.value;

        if (entry.boundingClientRect.x === 0 && entry.boundingClientRect.y === 0 && entry.boundingClientRect.width === 0 && entry.boundingClientRect.height === 0) {
          close();
        }
      }
    });
    observer.observe(internalDialogRef.current);
    return function () {
      return observer.disconnect();
    };
  }, [dialogState, internalDialogRef, close]);

  var _useDescriptions = useDescriptions(),
      describedby = _useDescriptions[0],
      DescriptionProvider = _useDescriptions[1];

  var id = "headlessui-dialog-" + useId();
  var contextBag = useMemo(function () {
    return [{
      dialogState: dialogState,
      close: close,
      setTitleId: setTitleId
    }, state];
  }, [dialogState, state, close, setTitleId]);
  var slot = useMemo(function () {
    return {
      open: dialogState === DialogStates.Open
    };
  }, [dialogState]);
  var propsWeControl = {
    ref: dialogRef,
    id: id,
    role: 'dialog',
    'aria-modal': dialogState === DialogStates.Open ? true : undefined,
    'aria-labelledby': state.titleId,
    'aria-describedby': describedby,
    onClick: function onClick(event) {
      event.stopPropagation();
    }
  };
  var passthroughProps = rest;
  return React.createElement(StackProvider, {
    type: "Dialog",
    element: internalDialogRef,
    onUpdate: useCallback(function (message, type, element) {
      var _match2;

      if (type !== 'Dialog') return;
      match(message, (_match2 = {}, _match2[StackMessage.Add] = function () {
        containers.current.add(element);
        setNestedDialogCount(function (count) {
          return count + 1;
        });
      }, _match2[StackMessage.Remove] = function () {
        containers.current.add(element);
        setNestedDialogCount(function (count) {
          return count - 1;
        });
      }, _match2));
    }, [])
  }, React.createElement(ForcePortalRoot, {
    force: true
  }, React.createElement(Portal, null, React.createElement(DialogContext.Provider, {
    value: contextBag
  }, React.createElement(Portal.Group, {
    target: internalDialogRef
  }, React.createElement(ForcePortalRoot, {
    force: false
  }, React.createElement(DescriptionProvider, {
    slot: slot,
    name: "Dialog.Description"
  }, render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_DIALOG_TAG,
    features: DialogRenderFeatures,
    visible: visible,
    name: 'Dialog'
  }))))))));
}); // ---

var DEFAULT_OVERLAY_TAG = 'div';
var Overlay = /*#__PURE__*/forwardRefWithAs(function Overlay(props, ref) {
  var _useDialogContext = useDialogContext([Dialog.displayName, Overlay.name].join('.')),
      _useDialogContext$ = _useDialogContext[0],
      dialogState = _useDialogContext$.dialogState,
      close = _useDialogContext$.close;

  var overlayRef = useSyncRefs(ref);
  var id = "headlessui-dialog-overlay-" + useId();
  var handleClick = useCallback(function (event) {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault();
    event.preventDefault();
    event.stopPropagation();
    close();
  }, [close]);
  var slot = useMemo(function () {
    return {
      open: dialogState === DialogStates.Open
    };
  }, [dialogState]);
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
    name: 'Dialog.Overlay'
  });
}); // ---

var DEFAULT_TITLE_TAG = 'h2';

function Title(props) {
  var _useDialogContext2 = useDialogContext([Dialog.displayName, Title.name].join('.')),
      _useDialogContext2$ = _useDialogContext2[0],
      dialogState = _useDialogContext2$.dialogState,
      setTitleId = _useDialogContext2$.setTitleId;

  var id = "headlessui-dialog-title-" + useId();
  useEffect(function () {
    setTitleId(id);
    return function () {
      return setTitleId(null);
    };
  }, [id, setTitleId]);
  var slot = useMemo(function () {
    return {
      open: dialogState === DialogStates.Open
    };
  }, [dialogState]);
  var propsWeControl = {
    id: id
  };
  var passthroughProps = props;
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_TITLE_TAG,
    name: 'Dialog.Title'
  });
} // ---


var Dialog = /*#__PURE__*/Object.assign(DialogRoot, {
  Overlay: Overlay,
  Title: Title,
  Description: Description
});

export { Dialog };
//# sourceMappingURL=dialog.esm.js.map
