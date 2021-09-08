import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useReducer, createRef, useMemo, createContext, useCallback, useRef, useContext, Fragment } from 'react';
import { match } from '../../utils/match.esm.js';
import { render, forwardRefWithAs, Features } from '../../utils/render.esm.js';
import { useSyncRefs } from '../../hooks/use-sync-refs.esm.js';
import { Keys } from '../keyboard.esm.js';
import { isDisabledReactIssue7711 } from '../../utils/bugs.esm.js';
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { isFocusableElement, FocusableMode } from '../../utils/focus-management.esm.js';
import { useWindowEvent } from '../../hooks/use-window-event.esm.js';
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed.esm.js';
import { useResolveButtonType } from '../../hooks/use-resolve-button-type.esm.js';
import { disposables } from '../../utils/disposables.esm.js';
import { useDisposables } from '../../hooks/use-disposables.esm.js';
import { useComputed } from '../../hooks/use-computed.esm.js';
import { calculateActiveIndex, Focus } from '../../utils/calculate-active-index.esm.js';

var _reducers;
var ListboxStates;

(function (ListboxStates) {
  ListboxStates[ListboxStates["Open"] = 0] = "Open";
  ListboxStates[ListboxStates["Closed"] = 1] = "Closed";
})(ListboxStates || (ListboxStates = {}));

var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["OpenListbox"] = 0] = "OpenListbox";
  ActionTypes[ActionTypes["CloseListbox"] = 1] = "CloseListbox";
  ActionTypes[ActionTypes["SetDisabled"] = 2] = "SetDisabled";
  ActionTypes[ActionTypes["SetOrientation"] = 3] = "SetOrientation";
  ActionTypes[ActionTypes["GoToOption"] = 4] = "GoToOption";
  ActionTypes[ActionTypes["Search"] = 5] = "Search";
  ActionTypes[ActionTypes["ClearSearch"] = 6] = "ClearSearch";
  ActionTypes[ActionTypes["RegisterOption"] = 7] = "RegisterOption";
  ActionTypes[ActionTypes["UnregisterOption"] = 8] = "UnregisterOption";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.CloseListbox] = function (state) {
  if (state.disabled) return state;
  if (state.listboxState === ListboxStates.Closed) return state;
  return _extends({}, state, {
    activeOptionIndex: null,
    listboxState: ListboxStates.Closed
  });
}, _reducers[ActionTypes.OpenListbox] = function (state) {
  if (state.disabled) return state;
  if (state.listboxState === ListboxStates.Open) return state;
  return _extends({}, state, {
    listboxState: ListboxStates.Open
  });
}, _reducers[ActionTypes.SetDisabled] = function (state, action) {
  if (state.disabled === action.disabled) return state;
  return _extends({}, state, {
    disabled: action.disabled
  });
}, _reducers[ActionTypes.SetOrientation] = function (state, action) {
  if (state.orientation === action.orientation) return state;
  return _extends({}, state, {
    orientation: action.orientation
  });
}, _reducers[ActionTypes.GoToOption] = function (state, action) {
  if (state.disabled) return state;
  if (state.listboxState === ListboxStates.Closed) return state;
  var activeOptionIndex = calculateActiveIndex(action, {
    resolveItems: function resolveItems() {
      return state.options;
    },
    resolveActiveIndex: function resolveActiveIndex() {
      return state.activeOptionIndex;
    },
    resolveId: function resolveId(item) {
      return item.id;
    },
    resolveDisabled: function resolveDisabled(item) {
      return item.dataRef.current.disabled;
    }
  });
  if (state.searchQuery === '' && state.activeOptionIndex === activeOptionIndex) return state;
  return _extends({}, state, {
    searchQuery: '',
    activeOptionIndex: activeOptionIndex
  });
}, _reducers[ActionTypes.Search] = function (state, action) {
  if (state.disabled) return state;
  if (state.listboxState === ListboxStates.Closed) return state;
  var searchQuery = state.searchQuery + action.value.toLowerCase();
  var match = state.options.findIndex(function (option) {
    var _option$dataRef$curre;

    return !option.dataRef.current.disabled && ((_option$dataRef$curre = option.dataRef.current.textValue) == null ? void 0 : _option$dataRef$curre.startsWith(searchQuery));
  });
  if (match === -1 || match === state.activeOptionIndex) return _extends({}, state, {
    searchQuery: searchQuery
  });
  return _extends({}, state, {
    searchQuery: searchQuery,
    activeOptionIndex: match
  });
}, _reducers[ActionTypes.ClearSearch] = function (state) {
  if (state.disabled) return state;
  if (state.listboxState === ListboxStates.Closed) return state;
  if (state.searchQuery === '') return state;
  return _extends({}, state, {
    searchQuery: ''
  });
}, _reducers[ActionTypes.RegisterOption] = function (state, action) {
  return _extends({}, state, {
    options: [].concat(state.options, [{
      id: action.id,
      dataRef: action.dataRef
    }])
  });
}, _reducers[ActionTypes.UnregisterOption] = function (state, action) {
  var nextOptions = state.options.slice();
  var currentActiveOption = state.activeOptionIndex !== null ? nextOptions[state.activeOptionIndex] : null;
  var idx = nextOptions.findIndex(function (a) {
    return a.id === action.id;
  });
  if (idx !== -1) nextOptions.splice(idx, 1);
  return _extends({}, state, {
    options: nextOptions,
    activeOptionIndex: function () {
      if (idx === state.activeOptionIndex) return null;
      if (currentActiveOption === null) return null; // If we removed the option before the actual active index, then it would be out of sync. To
      // fix this, we will find the correct (new) index position.

      return nextOptions.indexOf(currentActiveOption);
    }()
  });
}, _reducers);
var ListboxContext = /*#__PURE__*/createContext(null);
ListboxContext.displayName = 'ListboxContext';

function useListboxContext(component) {
  var context = useContext(ListboxContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Listbox.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext);
    throw err;
  }

  return context;
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_LISTBOX_TAG = Fragment;
function Listbox(props) {
  var _match;

  var value = props.value,
      onChange = props.onChange,
      _props$disabled = props.disabled,
      disabled = _props$disabled === void 0 ? false : _props$disabled,
      _props$horizontal = props.horizontal,
      horizontal = _props$horizontal === void 0 ? false : _props$horizontal,
      passThroughProps = _objectWithoutPropertiesLoose(props, ["value", "onChange", "disabled", "horizontal"]);

  var orientation = horizontal ? 'horizontal' : 'vertical';
  var reducerBag = useReducer(stateReducer, {
    listboxState: ListboxStates.Closed,
    propsRef: {
      current: {
        value: value,
        onChange: onChange
      }
    },
    labelRef: createRef(),
    buttonRef: createRef(),
    optionsRef: createRef(),
    disabled: disabled,
    orientation: orientation,
    options: [],
    searchQuery: '',
    activeOptionIndex: null
  });
  var _reducerBag$ = reducerBag[0],
      listboxState = _reducerBag$.listboxState,
      propsRef = _reducerBag$.propsRef,
      optionsRef = _reducerBag$.optionsRef,
      buttonRef = _reducerBag$.buttonRef,
      dispatch = reducerBag[1];
  useIsoMorphicEffect(function () {
    propsRef.current.value = value;
  }, [value, propsRef]);
  useIsoMorphicEffect(function () {
    propsRef.current.onChange = onChange;
  }, [onChange, propsRef]);
  useIsoMorphicEffect(function () {
    return dispatch({
      type: ActionTypes.SetDisabled,
      disabled: disabled
    });
  }, [disabled]);
  useIsoMorphicEffect(function () {
    return dispatch({
      type: ActionTypes.SetOrientation,
      orientation: orientation
    });
  }, [orientation]); // Handle outside click

  useWindowEvent('mousedown', function (event) {
    var _buttonRef$current, _optionsRef$current;

    var target = event.target;
    if (listboxState !== ListboxStates.Open) return;
    if ((_buttonRef$current = buttonRef.current) == null ? void 0 : _buttonRef$current.contains(target)) return;
    if ((_optionsRef$current = optionsRef.current) == null ? void 0 : _optionsRef$current.contains(target)) return;
    dispatch({
      type: ActionTypes.CloseListbox
    });

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      var _buttonRef$current2;

      event.preventDefault();
      (_buttonRef$current2 = buttonRef.current) == null ? void 0 : _buttonRef$current2.focus();
    }
  });
  var slot = useMemo(function () {
    return {
      open: listboxState === ListboxStates.Open,
      disabled: disabled
    };
  }, [listboxState, disabled]);
  return React.createElement(ListboxContext.Provider, {
    value: reducerBag
  }, React.createElement(OpenClosedProvider, {
    value: match(listboxState, (_match = {}, _match[ListboxStates.Open] = State.Open, _match[ListboxStates.Closed] = State.Closed, _match))
  }, render({
    props: passThroughProps,
    slot: slot,
    defaultTag: DEFAULT_LISTBOX_TAG,
    name: 'Listbox'
  })));
} // ---

var DEFAULT_BUTTON_TAG = 'button';
var Button = /*#__PURE__*/forwardRefWithAs(function Button(props, ref) {
  var _state$optionsRef$cur;

  var _useListboxContext = useListboxContext([Listbox.name, Button.name].join('.')),
      state = _useListboxContext[0],
      dispatch = _useListboxContext[1];

  var buttonRef = useSyncRefs(state.buttonRef, ref);
  var id = "headlessui-listbox-button-" + useId();
  var d = useDisposables();
  var handleKeyDown = useCallback(function (event) {
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault();
        dispatch({
          type: ActionTypes.OpenListbox
        });
        d.nextFrame(function () {
          if (!state.propsRef.current.value) dispatch({
            type: ActionTypes.GoToOption,
            focus: Focus.First
          });
        });
        break;

      case Keys.ArrowUp:
        event.preventDefault();
        dispatch({
          type: ActionTypes.OpenListbox
        });
        d.nextFrame(function () {
          if (!state.propsRef.current.value) dispatch({
            type: ActionTypes.GoToOption,
            focus: Focus.Last
          });
        });
        break;
    }
  }, [dispatch, state, d]);
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
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault();

    if (state.listboxState === ListboxStates.Open) {
      dispatch({
        type: ActionTypes.CloseListbox
      });
      d.nextFrame(function () {
        var _state$buttonRef$curr;

        return (_state$buttonRef$curr = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr.focus({
          preventScroll: true
        });
      });
    } else {
      event.preventDefault();
      dispatch({
        type: ActionTypes.OpenListbox
      });
    }
  }, [dispatch, d, state]);
  var labelledby = useComputed(function () {
    if (!state.labelRef.current) return undefined;
    return [state.labelRef.current.id, id].join(' ');
  }, [state.labelRef.current, id]);
  var slot = useMemo(function () {
    return {
      open: state.listboxState === ListboxStates.Open,
      disabled: state.disabled
    };
  }, [state]);
  var passthroughProps = props;
  var propsWeControl = {
    ref: buttonRef,
    id: id,
    type: useResolveButtonType(props, state.buttonRef),
    'aria-haspopup': true,
    'aria-controls': (_state$optionsRef$cur = state.optionsRef.current) == null ? void 0 : _state$optionsRef$cur.id,
    'aria-expanded': state.disabled ? undefined : state.listboxState === ListboxStates.Open,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick
  };
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Listbox.Button'
  });
}); // ---

var DEFAULT_LABEL_TAG = 'label';

function Label(props) {
  var _useListboxContext2 = useListboxContext([Listbox.name, Label.name].join('.')),
      state = _useListboxContext2[0];

  var id = "headlessui-listbox-label-" + useId();
  var handleClick = useCallback(function () {
    var _state$buttonRef$curr2;

    return (_state$buttonRef$curr2 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr2.focus({
      preventScroll: true
    });
  }, [state.buttonRef]);
  var slot = useMemo(function () {
    return {
      open: state.listboxState === ListboxStates.Open,
      disabled: state.disabled
    };
  }, [state]);
  var propsWeControl = {
    ref: state.labelRef,
    id: id,
    onClick: handleClick
  };
  return render({
    props: _extends({}, props, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Listbox.Label'
  });
} // ---


var DEFAULT_OPTIONS_TAG = 'ul';
var OptionsRenderFeatures = Features.RenderStrategy | Features.Static;
var Options = /*#__PURE__*/forwardRefWithAs(function Options(props, ref) {
  var _state$options$state$;

  var _useListboxContext3 = useListboxContext([Listbox.name, Options.name].join('.')),
      state = _useListboxContext3[0],
      dispatch = _useListboxContext3[1];

  var optionsRef = useSyncRefs(state.optionsRef, ref);
  var id = "headlessui-listbox-options-" + useId();
  var d = useDisposables();
  var searchDisposables = useDisposables();
  var usesOpenClosedState = useOpenClosed();

  var visible = function () {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open;
    }

    return state.listboxState === ListboxStates.Open;
  }();

  useIsoMorphicEffect(function () {
    var container = state.optionsRef.current;
    if (!container) return;
    if (state.listboxState !== ListboxStates.Open) return;
    if (container === document.activeElement) return;
    container.focus({
      preventScroll: true
    });
  }, [state.listboxState, state.optionsRef]);
  var handleKeyDown = useCallback(function (event) {
    searchDisposables.dispose();

    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
      // @ts-expect-error Fallthrough is expected here
      case Keys.Space:
        if (state.searchQuery !== '') {
          event.preventDefault();
          event.stopPropagation();
          return dispatch({
            type: ActionTypes.Search,
            value: event.key
          });
        }

      // When in type ahead mode, fallthrough

      case Keys.Enter:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: ActionTypes.CloseListbox
        });

        if (state.activeOptionIndex !== null) {
          var dataRef = state.options[state.activeOptionIndex].dataRef;
          state.propsRef.current.onChange(dataRef.current.value);
        }

        disposables().nextFrame(function () {
          var _state$buttonRef$curr3;

          return (_state$buttonRef$curr3 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr3.focus({
            preventScroll: true
          });
        });
        break;

      case match(state.orientation, {
        vertical: Keys.ArrowDown,
        horizontal: Keys.ArrowRight
      }):
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToOption,
          focus: Focus.Next
        });

      case match(state.orientation, {
        vertical: Keys.ArrowUp,
        horizontal: Keys.ArrowLeft
      }):
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToOption,
          focus: Focus.Previous
        });

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToOption,
          focus: Focus.First
        });

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToOption,
          focus: Focus.Last
        });

      case Keys.Escape:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: ActionTypes.CloseListbox
        });
        return d.nextFrame(function () {
          var _state$buttonRef$curr4;

          return (_state$buttonRef$curr4 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr4.focus({
            preventScroll: true
          });
        });

      case Keys.Tab:
        event.preventDefault();
        event.stopPropagation();
        break;

      default:
        if (event.key.length === 1) {
          dispatch({
            type: ActionTypes.Search,
            value: event.key
          });
          searchDisposables.setTimeout(function () {
            return dispatch({
              type: ActionTypes.ClearSearch
            });
          }, 350);
        }

        break;
    }
  }, [d, dispatch, searchDisposables, state]);
  var labelledby = useComputed(function () {
    var _state$labelRef$curre, _state$labelRef$curre2, _state$buttonRef$curr5;

    return (_state$labelRef$curre = (_state$labelRef$curre2 = state.labelRef.current) == null ? void 0 : _state$labelRef$curre2.id) != null ? _state$labelRef$curre : (_state$buttonRef$curr5 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr5.id;
  }, [state.labelRef.current, state.buttonRef.current]);
  var slot = useMemo(function () {
    return {
      open: state.listboxState === ListboxStates.Open
    };
  }, [state]);
  var propsWeControl = {
    'aria-activedescendant': state.activeOptionIndex === null ? undefined : (_state$options$state$ = state.options[state.activeOptionIndex]) == null ? void 0 : _state$options$state$.id,
    'aria-labelledby': labelledby,
    'aria-orientation': state.orientation,
    id: id,
    onKeyDown: handleKeyDown,
    role: 'listbox',
    tabIndex: 0,
    ref: optionsRef
  };
  var passthroughProps = props;
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_OPTIONS_TAG,
    features: OptionsRenderFeatures,
    visible: visible,
    name: 'Listbox.Options'
  });
}); // ---

var DEFAULT_OPTION_TAG = 'li';

function Option(props) {
  var _props$disabled2 = props.disabled,
      disabled = _props$disabled2 === void 0 ? false : _props$disabled2,
      value = props.value,
      passthroughProps = _objectWithoutPropertiesLoose(props, ["disabled", "value"]);

  var _useListboxContext4 = useListboxContext([Listbox.name, Option.name].join('.')),
      state = _useListboxContext4[0],
      dispatch = _useListboxContext4[1];

  var id = "headlessui-listbox-option-" + useId();
  var active = state.activeOptionIndex !== null ? state.options[state.activeOptionIndex].id === id : false;
  var selected = state.propsRef.current.value === value;
  var bag = useRef({
    disabled: disabled,
    value: value
  });
  useIsoMorphicEffect(function () {
    bag.current.disabled = disabled;
  }, [bag, disabled]);
  useIsoMorphicEffect(function () {
    bag.current.value = value;
  }, [bag, value]);
  useIsoMorphicEffect(function () {
    var _document$getElementB, _document$getElementB2;

    bag.current.textValue = (_document$getElementB = document.getElementById(id)) == null ? void 0 : (_document$getElementB2 = _document$getElementB.textContent) == null ? void 0 : _document$getElementB2.toLowerCase();
  }, [bag, id]);
  var select = useCallback(function () {
    return state.propsRef.current.onChange(value);
  }, [state.propsRef, value]);
  useIsoMorphicEffect(function () {
    dispatch({
      type: ActionTypes.RegisterOption,
      id: id,
      dataRef: bag
    });
    return function () {
      return dispatch({
        type: ActionTypes.UnregisterOption,
        id: id
      });
    };
  }, [bag, id]);
  useIsoMorphicEffect(function () {
    var _document$getElementB3;

    if (state.listboxState !== ListboxStates.Open) return;
    if (!selected) return;
    dispatch({
      type: ActionTypes.GoToOption,
      focus: Focus.Specific,
      id: id
    });
    (_document$getElementB3 = document.getElementById(id)) == null ? void 0 : _document$getElementB3.focus == null ? void 0 : _document$getElementB3.focus();
  }, [state.listboxState]);
  useIsoMorphicEffect(function () {
    if (state.listboxState !== ListboxStates.Open) return;
    if (!active) return;
    var d = disposables();
    d.nextFrame(function () {
      var _document$getElementB4;

      return (_document$getElementB4 = document.getElementById(id)) == null ? void 0 : _document$getElementB4.scrollIntoView == null ? void 0 : _document$getElementB4.scrollIntoView({
        block: 'nearest'
      });
    });
    return d.dispose;
  }, [id, active, state.listboxState]);
  var handleClick = useCallback(function (event) {
    if (disabled) return event.preventDefault();
    select();
    dispatch({
      type: ActionTypes.CloseListbox
    });
    disposables().nextFrame(function () {
      var _state$buttonRef$curr6;

      return (_state$buttonRef$curr6 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr6.focus({
        preventScroll: true
      });
    });
  }, [dispatch, state.buttonRef, disabled, select]);
  var handleFocus = useCallback(function () {
    if (disabled) return dispatch({
      type: ActionTypes.GoToOption,
      focus: Focus.Nothing
    });
    dispatch({
      type: ActionTypes.GoToOption,
      focus: Focus.Specific,
      id: id
    });
  }, [disabled, id, dispatch]);
  var handleMove = useCallback(function () {
    if (disabled) return;
    if (active) return;
    dispatch({
      type: ActionTypes.GoToOption,
      focus: Focus.Specific,
      id: id
    });
  }, [disabled, active, id, dispatch]);
  var handleLeave = useCallback(function () {
    if (disabled) return;
    if (!active) return;
    dispatch({
      type: ActionTypes.GoToOption,
      focus: Focus.Nothing
    });
  }, [disabled, active, dispatch]);
  var slot = useMemo(function () {
    return {
      active: active,
      selected: selected,
      disabled: disabled
    };
  }, [active, selected, disabled]);
  var propsWeControl = {
    id: id,
    role: 'option',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
    'aria-selected': selected === true ? true : undefined,
    disabled: undefined,
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave
  };
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Listbox.Option'
  });
} // ---


Listbox.Button = Button;
Listbox.Label = Label;
Listbox.Options = Options;
Listbox.Option = Option;

export { Listbox };
//# sourceMappingURL=listbox.esm.js.map
