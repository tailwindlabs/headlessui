import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useReducer, createRef, useMemo, createContext, useCallback, useEffect, useRef, useContext, Fragment } from 'react';
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
import { calculateActiveIndex, Focus } from '../../utils/calculate-active-index.esm.js';
import { useTreeWalker } from '../../hooks/use-tree-walker.esm.js';

var _reducers;
var MenuStates;

(function (MenuStates) {
  MenuStates[MenuStates["Open"] = 0] = "Open";
  MenuStates[MenuStates["Closed"] = 1] = "Closed";
})(MenuStates || (MenuStates = {}));

var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["OpenMenu"] = 0] = "OpenMenu";
  ActionTypes[ActionTypes["CloseMenu"] = 1] = "CloseMenu";
  ActionTypes[ActionTypes["GoToItem"] = 2] = "GoToItem";
  ActionTypes[ActionTypes["Search"] = 3] = "Search";
  ActionTypes[ActionTypes["ClearSearch"] = 4] = "ClearSearch";
  ActionTypes[ActionTypes["RegisterItem"] = 5] = "RegisterItem";
  ActionTypes[ActionTypes["UnregisterItem"] = 6] = "UnregisterItem";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.CloseMenu] = function (state) {
  if (state.menuState === MenuStates.Closed) return state;
  return _extends({}, state, {
    activeItemIndex: null,
    menuState: MenuStates.Closed
  });
}, _reducers[ActionTypes.OpenMenu] = function (state) {
  if (state.menuState === MenuStates.Open) return state;
  return _extends({}, state, {
    menuState: MenuStates.Open
  });
}, _reducers[ActionTypes.GoToItem] = function (state, action) {
  var activeItemIndex = calculateActiveIndex(action, {
    resolveItems: function resolveItems() {
      return state.items;
    },
    resolveActiveIndex: function resolveActiveIndex() {
      return state.activeItemIndex;
    },
    resolveId: function resolveId(item) {
      return item.id;
    },
    resolveDisabled: function resolveDisabled(item) {
      return item.dataRef.current.disabled;
    }
  });
  if (state.searchQuery === '' && state.activeItemIndex === activeItemIndex) return state;
  return _extends({}, state, {
    searchQuery: '',
    activeItemIndex: activeItemIndex
  });
}, _reducers[ActionTypes.Search] = function (state, action) {
  var searchQuery = state.searchQuery + action.value.toLowerCase();
  var match = state.items.findIndex(function (item) {
    var _item$dataRef$current;

    return ((_item$dataRef$current = item.dataRef.current.textValue) == null ? void 0 : _item$dataRef$current.startsWith(searchQuery)) && !item.dataRef.current.disabled;
  });
  if (match === -1 || match === state.activeItemIndex) return _extends({}, state, {
    searchQuery: searchQuery
  });
  return _extends({}, state, {
    searchQuery: searchQuery,
    activeItemIndex: match
  });
}, _reducers[ActionTypes.ClearSearch] = function (state) {
  if (state.searchQuery === '') return state;
  return _extends({}, state, {
    searchQuery: ''
  });
}, _reducers[ActionTypes.RegisterItem] = function (state, action) {
  return _extends({}, state, {
    items: [].concat(state.items, [{
      id: action.id,
      dataRef: action.dataRef
    }])
  });
}, _reducers[ActionTypes.UnregisterItem] = function (state, action) {
  var nextItems = state.items.slice();
  var currentActiveItem = state.activeItemIndex !== null ? nextItems[state.activeItemIndex] : null;
  var idx = nextItems.findIndex(function (a) {
    return a.id === action.id;
  });
  if (idx !== -1) nextItems.splice(idx, 1);
  return _extends({}, state, {
    items: nextItems,
    activeItemIndex: function () {
      if (idx === state.activeItemIndex) return null;
      if (currentActiveItem === null) return null; // If we removed the item before the actual active index, then it would be out of sync. To
      // fix this, we will find the correct (new) index position.

      return nextItems.indexOf(currentActiveItem);
    }()
  });
}, _reducers);
var MenuContext = /*#__PURE__*/createContext(null);
MenuContext.displayName = 'MenuContext';

function useMenuContext(component) {
  var context = useContext(MenuContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Menu.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext);
    throw err;
  }

  return context;
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_MENU_TAG = Fragment;
function Menu(props) {
  var _match;

  var reducerBag = useReducer(stateReducer, {
    menuState: MenuStates.Closed,
    buttonRef: createRef(),
    itemsRef: createRef(),
    items: [],
    searchQuery: '',
    activeItemIndex: null
  });
  var _reducerBag$ = reducerBag[0],
      menuState = _reducerBag$.menuState,
      itemsRef = _reducerBag$.itemsRef,
      buttonRef = _reducerBag$.buttonRef,
      dispatch = reducerBag[1]; // Handle outside click

  useWindowEvent('mousedown', function (event) {
    var _buttonRef$current, _itemsRef$current;

    var target = event.target;
    if (menuState !== MenuStates.Open) return;
    if ((_buttonRef$current = buttonRef.current) == null ? void 0 : _buttonRef$current.contains(target)) return;
    if ((_itemsRef$current = itemsRef.current) == null ? void 0 : _itemsRef$current.contains(target)) return;
    dispatch({
      type: ActionTypes.CloseMenu
    });

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      var _buttonRef$current2;

      event.preventDefault();
      (_buttonRef$current2 = buttonRef.current) == null ? void 0 : _buttonRef$current2.focus();
    }
  });
  var slot = useMemo(function () {
    return {
      open: menuState === MenuStates.Open
    };
  }, [menuState]);
  return React.createElement(MenuContext.Provider, {
    value: reducerBag
  }, React.createElement(OpenClosedProvider, {
    value: match(menuState, (_match = {}, _match[MenuStates.Open] = State.Open, _match[MenuStates.Closed] = State.Closed, _match))
  }, render({
    props: props,
    slot: slot,
    defaultTag: DEFAULT_MENU_TAG,
    name: 'Menu'
  })));
} // ---

var DEFAULT_BUTTON_TAG = 'button';
var Button = /*#__PURE__*/forwardRefWithAs(function Button(props, ref) {
  var _state$itemsRef$curre;

  var _useMenuContext = useMenuContext([Menu.name, Button.name].join('.')),
      state = _useMenuContext[0],
      dispatch = _useMenuContext[1];

  var buttonRef = useSyncRefs(state.buttonRef, ref);
  var id = "headlessui-menu-button-" + useId();
  var d = useDisposables();
  var handleKeyDown = useCallback(function (event) {
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: ActionTypes.OpenMenu
        });
        d.nextFrame(function () {
          return dispatch({
            type: ActionTypes.GoToItem,
            focus: Focus.First
          });
        });
        break;

      case Keys.ArrowUp:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: ActionTypes.OpenMenu
        });
        d.nextFrame(function () {
          return dispatch({
            type: ActionTypes.GoToItem,
            focus: Focus.Last
          });
        });
        break;
    }
  }, [dispatch, d]);
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
    if (props.disabled) return;

    if (state.menuState === MenuStates.Open) {
      dispatch({
        type: ActionTypes.CloseMenu
      });
      d.nextFrame(function () {
        var _state$buttonRef$curr;

        return (_state$buttonRef$curr = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr.focus({
          preventScroll: true
        });
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
      dispatch({
        type: ActionTypes.OpenMenu
      });
    }
  }, [dispatch, d, state, props.disabled]);
  var slot = useMemo(function () {
    return {
      open: state.menuState === MenuStates.Open
    };
  }, [state]);
  var passthroughProps = props;
  var propsWeControl = {
    ref: buttonRef,
    id: id,
    type: useResolveButtonType(props, state.buttonRef),
    'aria-haspopup': true,
    'aria-controls': (_state$itemsRef$curre = state.itemsRef.current) == null ? void 0 : _state$itemsRef$curre.id,
    'aria-expanded': props.disabled ? undefined : state.menuState === MenuStates.Open,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick
  };
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Menu.Button'
  });
}); // ---

var DEFAULT_ITEMS_TAG = 'div';
var ItemsRenderFeatures = Features.RenderStrategy | Features.Static;
var Items = /*#__PURE__*/forwardRefWithAs(function Items(props, ref) {
  var _state$items$state$ac, _state$buttonRef$curr4;

  var _useMenuContext2 = useMenuContext([Menu.name, Items.name].join('.')),
      state = _useMenuContext2[0],
      dispatch = _useMenuContext2[1];

  var itemsRef = useSyncRefs(state.itemsRef, ref);
  var id = "headlessui-menu-items-" + useId();
  var searchDisposables = useDisposables();
  var usesOpenClosedState = useOpenClosed();

  var visible = function () {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open;
    }

    return state.menuState === MenuStates.Open;
  }();

  useEffect(function () {
    var container = state.itemsRef.current;
    if (!container) return;
    if (state.menuState !== MenuStates.Open) return;
    if (container === document.activeElement) return;
    container.focus({
      preventScroll: true
    });
  }, [state.menuState, state.itemsRef]);
  useTreeWalker({
    container: state.itemsRef.current,
    enabled: state.menuState === MenuStates.Open,
    accept: function accept(node) {
      if (node.getAttribute('role') === 'menuitem') return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk: function walk(node) {
      node.setAttribute('role', 'none');
    }
  });
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
          type: ActionTypes.CloseMenu
        });

        if (state.activeItemIndex !== null) {
          var _document$getElementB;

          var _id = state.items[state.activeItemIndex].id;
          (_document$getElementB = document.getElementById(_id)) == null ? void 0 : _document$getElementB.click();
        }

        disposables().nextFrame(function () {
          var _state$buttonRef$curr2;

          return (_state$buttonRef$curr2 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr2.focus({
            preventScroll: true
          });
        });
        break;

      case Keys.ArrowDown:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToItem,
          focus: Focus.Next
        });

      case Keys.ArrowUp:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToItem,
          focus: Focus.Previous
        });

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToItem,
          focus: Focus.First
        });

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({
          type: ActionTypes.GoToItem,
          focus: Focus.Last
        });

      case Keys.Escape:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: ActionTypes.CloseMenu
        });
        disposables().nextFrame(function () {
          var _state$buttonRef$curr3;

          return (_state$buttonRef$curr3 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr3.focus({
            preventScroll: true
          });
        });
        break;

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
  }, [dispatch, searchDisposables, state]);
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
  var slot = useMemo(function () {
    return {
      open: state.menuState === MenuStates.Open
    };
  }, [state]);
  var propsWeControl = {
    'aria-activedescendant': state.activeItemIndex === null ? undefined : (_state$items$state$ac = state.items[state.activeItemIndex]) == null ? void 0 : _state$items$state$ac.id,
    'aria-labelledby': (_state$buttonRef$curr4 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr4.id,
    id: id,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    role: 'menu',
    tabIndex: 0,
    ref: itemsRef
  };
  var passthroughProps = props;
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_ITEMS_TAG,
    features: ItemsRenderFeatures,
    visible: visible,
    name: 'Menu.Items'
  });
}); // ---

var DEFAULT_ITEM_TAG = Fragment;

function Item(props) {
  var _props$disabled = props.disabled,
      disabled = _props$disabled === void 0 ? false : _props$disabled,
      onClick = props.onClick,
      passthroughProps = _objectWithoutPropertiesLoose(props, ["disabled", "onClick"]);

  var _useMenuContext3 = useMenuContext([Menu.name, Item.name].join('.')),
      state = _useMenuContext3[0],
      dispatch = _useMenuContext3[1];

  var id = "headlessui-menu-item-" + useId();
  var active = state.activeItemIndex !== null ? state.items[state.activeItemIndex].id === id : false;
  useIsoMorphicEffect(function () {
    if (state.menuState !== MenuStates.Open) return;
    if (!active) return;
    var d = disposables();
    d.nextFrame(function () {
      var _document$getElementB2;

      return (_document$getElementB2 = document.getElementById(id)) == null ? void 0 : _document$getElementB2.scrollIntoView == null ? void 0 : _document$getElementB2.scrollIntoView({
        block: 'nearest'
      });
    });
    return d.dispose;
  }, [id, active, state.menuState]);
  var bag = useRef({
    disabled: disabled
  });
  useIsoMorphicEffect(function () {
    bag.current.disabled = disabled;
  }, [bag, disabled]);
  useIsoMorphicEffect(function () {
    var _document$getElementB3, _document$getElementB4;

    bag.current.textValue = (_document$getElementB3 = document.getElementById(id)) == null ? void 0 : (_document$getElementB4 = _document$getElementB3.textContent) == null ? void 0 : _document$getElementB4.toLowerCase();
  }, [bag, id]);
  useIsoMorphicEffect(function () {
    dispatch({
      type: ActionTypes.RegisterItem,
      id: id,
      dataRef: bag
    });
    return function () {
      return dispatch({
        type: ActionTypes.UnregisterItem,
        id: id
      });
    };
  }, [bag, id]);
  var handleClick = useCallback(function (event) {
    if (disabled) return event.preventDefault();
    dispatch({
      type: ActionTypes.CloseMenu
    });
    disposables().nextFrame(function () {
      var _state$buttonRef$curr5;

      return (_state$buttonRef$curr5 = state.buttonRef.current) == null ? void 0 : _state$buttonRef$curr5.focus({
        preventScroll: true
      });
    });
    if (onClick) return onClick(event);
  }, [dispatch, state.buttonRef, disabled, onClick]);
  var handleFocus = useCallback(function () {
    if (disabled) return dispatch({
      type: ActionTypes.GoToItem,
      focus: Focus.Nothing
    });
    dispatch({
      type: ActionTypes.GoToItem,
      focus: Focus.Specific,
      id: id
    });
  }, [disabled, id, dispatch]);
  var handleMove = useCallback(function () {
    if (disabled) return;
    if (active) return;
    dispatch({
      type: ActionTypes.GoToItem,
      focus: Focus.Specific,
      id: id
    });
  }, [disabled, active, id, dispatch]);
  var handleLeave = useCallback(function () {
    if (disabled) return;
    if (!active) return;
    dispatch({
      type: ActionTypes.GoToItem,
      focus: Focus.Nothing
    });
  }, [disabled, active, dispatch]);
  var slot = useMemo(function () {
    return {
      active: active,
      disabled: disabled
    };
  }, [active, disabled]);
  var propsWeControl = {
    id: id,
    role: 'menuitem',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
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
    defaultTag: DEFAULT_ITEM_TAG,
    name: 'Menu.Item'
  });
} // ---


Menu.Button = Button;
Menu.Items = Items;
Menu.Item = Item;

export { Menu };
//# sourceMappingURL=menu.esm.js.map
