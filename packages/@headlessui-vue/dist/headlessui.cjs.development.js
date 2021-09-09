'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

function match(value, lookup) {
  if (value in lookup) {
    var returnValue = lookup[value];

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return typeof returnValue === 'function' ? returnValue.apply(void 0, args) : returnValue;
  }

  var error = new Error("Tried to handle \"" + value + "\" but there is no handler defined. Only defined handlers are: " + Object.keys(lookup).map(function (key) {
    return "\"" + key + "\"";
  }).join(', ') + ".");
  if (Error.captureStackTrace) Error.captureStackTrace(error, match);
  throw error;
}

var Features;

(function (Features) {
  /** No features at all */
  Features[Features["None"] = 0] = "None";
  /**
   * When used, this will allow us to use one of the render strategies.
   *
   * **The render strategies are:**
   *    - **Unmount**   _(Will unmount the component.)_
   *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
   */

  Features[Features["RenderStrategy"] = 1] = "RenderStrategy";
  /**
   * When used, this will allow the user of our component to be in control. This can be used when
   * you want to transition based on some state.
   */

  Features[Features["Static"] = 2] = "Static";
})(Features || (Features = {}));

var RenderStrategy;

(function (RenderStrategy) {
  RenderStrategy[RenderStrategy["Unmount"] = 0] = "Unmount";
  RenderStrategy[RenderStrategy["Hidden"] = 1] = "Hidden";
})(RenderStrategy || (RenderStrategy = {}));

function render(_ref) {
  var _ref$visible = _ref.visible,
      visible = _ref$visible === void 0 ? true : _ref$visible,
      _ref$features = _ref.features,
      features = _ref$features === void 0 ? Features.None : _ref$features,
      main = _objectWithoutPropertiesLoose(_ref, ["visible", "features"]);

  // Visible always render
  if (visible) return _render(main);

  if (features & Features.Static) {
    // When the `static` prop is passed as `true`, then the user is in control, thus we don't care about anything else
    if (main.props["static"]) return _render(main);
  }

  if (features & Features.RenderStrategy) {
    var _main$props$unmount, _match;

    var strategy = ((_main$props$unmount = main.props.unmount) != null ? _main$props$unmount : true) ? RenderStrategy.Unmount : RenderStrategy.Hidden;
    return match(strategy, (_match = {}, _match[RenderStrategy.Unmount] = function () {
      return null;
    }, _match[RenderStrategy.Hidden] = function () {
      return _render(_extends({}, main, {
        props: _extends({}, main.props, {
          hidden: true,
          style: {
            display: 'none'
          }
        })
      }));
    }, _match));
  } // No features enabled, just render


  return _render(main);
}

function _render(_ref2) {
  var props = _ref2.props,
      attrs = _ref2.attrs,
      slots = _ref2.slots,
      slot = _ref2.slot,
      name = _ref2.name;

  var _omit = omit(props, ['unmount', 'static']),
      as = _omit.as,
      passThroughProps = _objectWithoutPropertiesLoose(_omit, ["as"]);

  var children = slots["default"] == null ? void 0 : slots["default"](slot);

  if (as === 'template') {
    if (Object.keys(passThroughProps).length > 0 || Object.keys(attrs).length > 0) {
      var _ref3 = children != null ? children : [],
          firstChild = _ref3[0],
          other = _ref3.slice(1);

      if (!isValidElement(firstChild) || other.length > 0) {
        throw new Error(['Passing props on "template"!', '', "The current component <" + name + " /> is rendering a \"template\".", "However we need to passthrough the following props:", Object.keys(passThroughProps).concat(Object.keys(attrs)).map(function (line) {
          return "  - " + line;
        }).join('\n'), '', 'You can apply a few solutions:', ['Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".', 'Render a single element as the child so that we can forward the props onto that element.'].map(function (line) {
          return "  - " + line;
        }).join('\n')].join('\n'));
      }

      return vue.cloneVNode(firstChild, passThroughProps);
    }

    if (Array.isArray(children) && children.length === 1) {
      return children[0];
    }

    return children;
  }

  return vue.h(as, passThroughProps, children);
}

function omit(object, keysToOmit) {
  if (keysToOmit === void 0) {
    keysToOmit = [];
  }

  var clone = Object.assign({}, object);

  for (var _iterator = _createForOfIteratorHelperLoose(keysToOmit), _step; !(_step = _iterator()).done;) {
    var key = _step.value;
    if (key in clone) delete clone[key];
  }

  return clone;
}

function isValidElement(input) {
  if (input == null) return false; // No children

  if (typeof input.type === 'string') return true; // 'div', 'span', ...

  if (typeof input.type === 'object') return true; // Other components

  if (typeof input.type === 'function') return true; // Built-ins like Transition

  return false; // Comments, strings, ...
}

// TODO: This must already exist somewhere, right? 🤔
// Ref: https://www.w3.org/TR/uievents-key/#named-key-attribute-values
var Keys;

(function (Keys) {
  Keys["Space"] = " ";
  Keys["Enter"] = "Enter";
  Keys["Escape"] = "Escape";
  Keys["Backspace"] = "Backspace";
  Keys["ArrowLeft"] = "ArrowLeft";
  Keys["ArrowUp"] = "ArrowUp";
  Keys["ArrowRight"] = "ArrowRight";
  Keys["ArrowDown"] = "ArrowDown";
  Keys["Home"] = "Home";
  Keys["End"] = "End";
  Keys["PageUp"] = "PageUp";
  Keys["PageDown"] = "PageDown";
  Keys["Tab"] = "Tab";
})(Keys || (Keys = {}));

var id = 0;

function generateId() {
  return ++id;
}

function useId() {
  return generateId();
}

//  - https://stackoverflow.com/a/30753870

var focusableSelector = /*#__PURE__*/['[contentEditable=true]', '[tabindex]', 'a[href]', 'area[href]', 'button:not([disabled])', 'iframe', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])'].map( function (selector) {
  return selector + ":not([tabindex='-1'])";
}).join(',');
var Focus;

(function (Focus) {
  /** Focus the first non-disabled element */
  Focus[Focus["First"] = 1] = "First";
  /** Focus the previous non-disabled element */

  Focus[Focus["Previous"] = 2] = "Previous";
  /** Focus the next non-disabled element */

  Focus[Focus["Next"] = 4] = "Next";
  /** Focus the last non-disabled element */

  Focus[Focus["Last"] = 8] = "Last";
  /** Wrap tab around */

  Focus[Focus["WrapAround"] = 16] = "WrapAround";
  /** Prevent scrolling the focusable elements into view */

  Focus[Focus["NoScroll"] = 32] = "NoScroll";
})(Focus || (Focus = {}));

var FocusResult;

(function (FocusResult) {
  FocusResult[FocusResult["Error"] = 0] = "Error";
  FocusResult[FocusResult["Overflow"] = 1] = "Overflow";
  FocusResult[FocusResult["Success"] = 2] = "Success";
  FocusResult[FocusResult["Underflow"] = 3] = "Underflow";
})(FocusResult || (FocusResult = {}));

var Direction;

(function (Direction) {
  Direction[Direction["Previous"] = -1] = "Previous";
  Direction[Direction["Next"] = 1] = "Next";
})(Direction || (Direction = {}));

function getFocusableElements(container) {
  if (container === void 0) {
    container = document.body;
  }

  if (container == null) return [];
  return Array.from(container.querySelectorAll(focusableSelector));
}
var FocusableMode;

(function (FocusableMode) {
  /** The element itself must be focusable. */
  FocusableMode[FocusableMode["Strict"] = 0] = "Strict";
  /** The element should be inside of a focusable element. */

  FocusableMode[FocusableMode["Loose"] = 1] = "Loose";
})(FocusableMode || (FocusableMode = {}));

function isFocusableElement(element, mode) {
  var _match;

  if (mode === void 0) {
    mode = FocusableMode.Strict;
  }

  if (element === document.body) return false;
  return match(mode, (_match = {}, _match[FocusableMode.Strict] = function () {
    return element.matches(focusableSelector);
  }, _match[FocusableMode.Loose] = function () {
    var next = element;

    while (next !== null) {
      if (next.matches(focusableSelector)) return true;
      next = next.parentElement;
    }

    return false;
  }, _match));
}
function focusElement(element) {
  element == null ? void 0 : element.focus({
    preventScroll: true
  });
}
function focusIn(container, focus) {
  var elements = Array.isArray(container) ? container : getFocusableElements(container);
  var active = document.activeElement;

  var direction = function () {
    if (focus & (Focus.First | Focus.Next)) return Direction.Next;
    if (focus & (Focus.Previous | Focus.Last)) return Direction.Previous;
    throw new Error('Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last');
  }();

  var startIndex = function () {
    if (focus & Focus.First) return 0;
    if (focus & Focus.Previous) return Math.max(0, elements.indexOf(active)) - 1;
    if (focus & Focus.Next) return Math.max(0, elements.indexOf(active)) + 1;
    if (focus & Focus.Last) return elements.length - 1;
    throw new Error('Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last');
  }();

  var focusOptions = focus & Focus.NoScroll ? {
    preventScroll: true
  } : {};
  var offset = 0;
  var total = elements.length;
  var next = undefined;

  do {
    var _next;

    // Guard against infinite loops
    if (offset >= total || offset + total <= 0) return FocusResult.Error;
    var nextIdx = startIndex + offset;

    if (focus & Focus.WrapAround) {
      nextIdx = (nextIdx + total) % total;
    } else {
      if (nextIdx < 0) return FocusResult.Underflow;
      if (nextIdx >= total) return FocusResult.Overflow;
    }

    next = elements[nextIdx]; // Try the focus the next element, might not work if it is "hidden" to the user.

    (_next = next) == null ? void 0 : _next.focus(focusOptions); // Try the next one in line

    offset += direction;
  } while (next !== document.activeElement); // This is a little weird, but let me try and explain: There are a few scenario's
  // in chrome for example where a focused `<a>` tag does not get the default focus
  // styles and sometimes they do. This highly depends on whether you started by
  // clicking or by using your keyboard. When you programmatically add focus `anchor.focus()`
  // then the active element (document.activeElement) is this anchor, which is expected.
  // However in that case the default focus styles are not applied *unless* you
  // also add this tabindex.


  if (!next.hasAttribute('tabindex')) next.setAttribute('tabindex', '0');
  return FocusResult.Success;
}

function useWindowEvent(type, listener, options) {
  try {
    window.addEventListener(type, listener, options);
  } catch (e) {}

  vue.onUnmounted(function () {
    return window.removeEventListener(type, listener, options);
  });
}

function contains(containers, element) {
  for (var _iterator = _createForOfIteratorHelperLoose(containers), _step; !(_step = _iterator()).done;) {
    var container = _step.value;
    if (container.contains(element)) return true;
  }

  return false;
}

function useFocusTrap(containers, enabled, options) {
  if (enabled === void 0) {
    enabled = vue.ref(true);
  }

  if (options === void 0) {
    options = vue.ref({});
  }

  var restoreElement = vue.ref(typeof window !== 'undefined' ? document.activeElement : null);
  var previousActiveElement = vue.ref(null);

  function handleFocus() {
    if (!enabled.value) return;
    if (containers.value.size !== 1) return;
    var initialFocus = options.value.initialFocus;
    var activeElement = document.activeElement;

    if (initialFocus) {
      if (initialFocus === activeElement) {
        return; // Initial focus ref is already the active element
      }
    } else if (contains(containers.value, activeElement)) {
      return; // Already focused within Dialog
    }

    restoreElement.value = activeElement; // Try to focus the initialFocus ref

    if (initialFocus) {
      focusElement(initialFocus);
    } else {
      var couldFocus = false;

      for (var _iterator = _createForOfIteratorHelperLoose(containers.value), _step; !(_step = _iterator()).done;) {
        var container = _step.value;
        var result = focusIn(container, Focus.First);

        if (result === FocusResult.Success) {
          couldFocus = true;
          break;
        }
      }

      if (!couldFocus) console.warn('There are no focusable elements inside the <FocusTrap />');
    }

    previousActiveElement.value = document.activeElement;
  } // Restore when `enabled` becomes false


  function restore() {
    focusElement(restoreElement.value);
    restoreElement.value = null;
    previousActiveElement.value = null;
  } // Handle initial focus


  vue.watchEffect(handleFocus);
  vue.onUpdated(function () {
    enabled.value ? handleFocus() : restore();
  });
  vue.onUnmounted(restore); // Handle Tab & Shift+Tab keyboard events

  useWindowEvent('keydown', function (event) {
    if (!enabled.value) return;
    if (event.key !== Keys.Tab) return;
    if (!document.activeElement) return;
    if (containers.value.size !== 1) return;
    event.preventDefault();

    for (var _iterator2 = _createForOfIteratorHelperLoose(containers.value), _step2; !(_step2 = _iterator2()).done;) {
      var element = _step2.value;
      var result = focusIn(element, (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround);

      if (result === FocusResult.Success) {
        previousActiveElement.value = document.activeElement;
        break;
      }
    }
  }); // Prevent programmatically escaping

  useWindowEvent('focus', function (event) {
    if (!enabled.value) return;
    if (containers.value.size !== 1) return;
    var previous = previousActiveElement.value;
    if (!previous) return;
    var toElement = event.target;

    if (toElement && toElement instanceof HTMLElement) {
      if (!contains(containers.value, toElement)) {
        event.preventDefault();
        event.stopPropagation();
        focusElement(previous);
      } else {
        previousActiveElement.value = toElement;
        focusElement(toElement);
      }
    } else {
      focusElement(previousActiveElement.value);
    }
  }, true);
}

var CHILDREN_SELECTOR =  'body > *';
var interactables = /*#__PURE__*/new Set();
var originals = /*#__PURE__*/new Map();

function inert(element) {
  element.setAttribute('aria-hidden', 'true'); // @ts-expect-error `inert` does not exist on HTMLElement (yet!)

  element.inert = true;
}

function restore(element) {
  var original = originals.get(element);
  if (!original) return;
  if (original['aria-hidden'] === null) element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden', original['aria-hidden']); // @ts-expect-error `inert` does not exist on HTMLElement (yet!)

  element.inert = original.inert;
}

function useInertOthers(container, enabled) {
  if (enabled === void 0) {
    enabled = vue.ref(true);
  }

  vue.watchEffect(function (onInvalidate) {
    if (!enabled.value) return;
    if (!container.value) return;
    var element = container.value; // Mark myself as an interactable element

    interactables.add(element); // Restore elements that now contain an interactable child

    for (var _iterator = _createForOfIteratorHelperLoose(originals.keys()), _step; !(_step = _iterator()).done;) {
      var original = _step.value;

      if (original.contains(element)) {
        restore(original);
        originals["delete"](original);
      }
    } // Collect direct children of the body


    document.querySelectorAll(CHILDREN_SELECTOR).forEach(function (child) {
      if (!(child instanceof HTMLElement)) return; // Skip non-HTMLElements
      // Skip the interactables, and the parents of the interactables

      for (var _iterator2 = _createForOfIteratorHelperLoose(interactables), _step2; !(_step2 = _iterator2()).done;) {
        var interactable = _step2.value;
        if (child.contains(interactable)) return;
      } // Keep track of the elements


      if (interactables.size === 1) {
        originals.set(child, {
          'aria-hidden': child.getAttribute('aria-hidden'),
          // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
          inert: child.inert
        }); // Mutate the element

        inert(child);
      }
    });
    onInvalidate(function () {
      // Inert is disabled on the current element
      interactables["delete"](element); // We still have interactable elements, therefore this one and its parent
      // will become inert as well.

      if (interactables.size > 0) {
        // Collect direct children of the body
        document.querySelectorAll(CHILDREN_SELECTOR).forEach(function (child) {
          if (!(child instanceof HTMLElement)) return; // Skip non-HTMLElements
          // Skip already inert parents

          if (originals.has(child)) return; // Skip the interactables, and the parents of the interactables

          for (var _iterator3 = _createForOfIteratorHelperLoose(interactables), _step3; !(_step3 = _iterator3()).done;) {
            var interactable = _step3.value;
            if (child.contains(interactable)) return;
          }

          originals.set(child, {
            'aria-hidden': child.getAttribute('aria-hidden'),
            // @ts-expect-error `inert` does not exist on HTMLElement (yet!)
            inert: child.inert
          }); // Mutate the element

          inert(child);
        });
      } else {
        for (var _iterator4 = _createForOfIteratorHelperLoose(originals.keys()), _step4; !(_step4 = _iterator4()).done;) {
          var _element = _step4.value;
          // Restore
          restore(_element); // Cleanup

          originals["delete"](_element);
        }
      }
    });
  });
}

var StackContext = /*#__PURE__*/Symbol('StackContext');
var StackMessage;

(function (StackMessage) {
  StackMessage[StackMessage["AddElement"] = 0] = "AddElement";
  StackMessage[StackMessage["RemoveElement"] = 1] = "RemoveElement";
})(StackMessage || (StackMessage = {}));

function useStackContext() {
  return vue.inject(StackContext, function () {});
}
function useElemenStack(element) {
  var notify = useStackContext();
  vue.watchEffect(function (onInvalidate) {
    var domElement = element == null ? void 0 : element.value;
    if (!domElement) return;
    notify(StackMessage.AddElement, domElement);
    onInvalidate(function () {
      return notify(StackMessage.RemoveElement, domElement);
    });
  });
}
function useStackProvider(onUpdate) {
  var parentUpdate = useStackContext();

  function notify() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // Notify our layer
    onUpdate == null ? void 0 : onUpdate.apply(void 0, args); // Notify the parent

    parentUpdate.apply(void 0, args);
  }

  vue.provide(StackContext, notify);
}

var ForcePortalRootContext = /*#__PURE__*/Symbol('ForcePortalRootContext');
function usePortalRoot() {
  return vue.inject(ForcePortalRootContext, false);
}
var ForcePortalRoot = /*#__PURE__*/vue.defineComponent({
  name: 'ForcePortalRoot',
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    },
    force: {
      type: Boolean,
      "default": false
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs;
    vue.provide(ForcePortalRootContext, props.force);
    return function () {
      var passThroughProps = _objectWithoutPropertiesLoose(props, ["force"]);

      return render({
        props: passThroughProps,
        slot: {},
        slots: slots,
        attrs: attrs,
        name: 'ForcePortalRoot'
      });
    };
  }
});

function getPortalRoot() {
  var existingRoot = document.getElementById('headlessui-portal-root');
  if (existingRoot) return existingRoot;
  var root = document.createElement('div');
  root.setAttribute('id', 'headlessui-portal-root');
  return document.body.appendChild(root);
}

var Portal = /*#__PURE__*/vue.defineComponent({
  name: 'Portal',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs;
    var forcePortalRoot = usePortalRoot();
    var groupContext = vue.inject(PortalGroupContext, null);
    var myTarget = vue.ref(forcePortalRoot === true ? getPortalRoot() : groupContext === null ? getPortalRoot() : groupContext.resolveTarget());
    vue.watchEffect(function () {
      if (forcePortalRoot) return;
      if (groupContext === null) return;
      myTarget.value = groupContext.resolveTarget();
    });
    var element = vue.ref(null);
    useElemenStack(element);
    vue.onUnmounted(function () {
      var root = document.getElementById('headlessui-portal-root');
      if (!root) return;
      if (myTarget.value !== root) return;

      if (myTarget.value.children.length <= 0) {
        var _myTarget$value$paren;

        (_myTarget$value$paren = myTarget.value.parentElement) == null ? void 0 : _myTarget$value$paren.removeChild(myTarget.value);
      }
    });
    useStackProvider();
    return function () {
      if (myTarget.value === null) return null;
      var propsWeControl = {
        ref: element
      };
      return vue.h( // @ts-expect-error Children can be an object, but TypeScript is not happy
      // with it. Once this is fixed upstream we can remove this assertion.
      vue.Teleport, {
        to: myTarget.value
      }, render({
        props: _extends({}, props, propsWeControl),
        slot: {},
        attrs: attrs,
        slots: slots,
        name: 'Portal'
      }));
    };
  }
}); // ---

var PortalGroupContext = /*#__PURE__*/Symbol('PortalGroupContext');
var PortalGroup = /*#__PURE__*/vue.defineComponent({
  name: 'PortalGroup',
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    },
    target: {
      type: Object,
      "default": null
    }
  },
  setup: function setup(props, _ref2) {
    var attrs = _ref2.attrs,
        slots = _ref2.slots;
    var api = vue.reactive({
      resolveTarget: function resolveTarget() {
        return props.target;
      }
    });
    vue.provide(PortalGroupContext, api);
    return function () {
      var passThroughProps = _objectWithoutPropertiesLoose(props, ["target"]);

      return render({
        props: passThroughProps,
        slot: {},
        attrs: attrs,
        slots: slots,
        name: 'PortalGroup'
      });
    };
  }
});

var DescriptionContext = /*#__PURE__*/Symbol('DescriptionContext');

function useDescriptionContext() {
  var context = vue.inject(DescriptionContext, null);

  if (context === null) {
    throw new Error('Missing parent');
  }

  return context;
}

function useDescriptions(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$slot = _ref.slot,
      slot = _ref$slot === void 0 ? vue.ref({}) : _ref$slot,
      _ref$name = _ref.name,
      name = _ref$name === void 0 ? 'Description' : _ref$name,
      _ref$props = _ref.props,
      props = _ref$props === void 0 ? {} : _ref$props;

  var descriptionIds = vue.ref([]);

  function register(value) {
    descriptionIds.value.push(value);
    return function () {
      var idx = descriptionIds.value.indexOf(value);
      if (idx === -1) return;
      descriptionIds.value.splice(idx, 1);
    };
  }

  vue.provide(DescriptionContext, {
    register: register,
    slot: slot,
    name: name,
    props: props
  }); // The actual id's as string or undefined.

  return vue.computed(function () {
    return descriptionIds.value.length > 0 ? descriptionIds.value.join(' ') : undefined;
  });
} // ---

var Description = /*#__PURE__*/vue.defineComponent({
  name: 'Description',
  props: {
    as: {
      type: [Object, String],
      "default": 'p'
    }
  },
  render: function render$1() {
    var _this$context = this.context,
        _this$context$name = _this$context.name,
        name = _this$context$name === void 0 ? 'Description' : _this$context$name,
        _this$context$slot = _this$context.slot,
        slot = _this$context$slot === void 0 ? vue.ref({}) : _this$context$slot,
        _this$context$props = _this$context.props,
        props = _this$context$props === void 0 ? {} : _this$context$props;
    var passThroughProps = this.$props;

    var propsWeControl = _extends({}, Object.entries(props).reduce(function (acc, _ref2) {
      var _Object$assign;

      var key = _ref2[0],
          value = _ref2[1];
      return Object.assign(acc, (_Object$assign = {}, _Object$assign[key] = vue.unref(value), _Object$assign));
    }, {}), {
      id: this.id
    });

    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: slot.value,
      attrs: this.$attrs,
      slots: this.$slots,
      name: name
    });
  },
  setup: function setup() {
    var context = useDescriptionContext();
    var id = "headlessui-description-" + useId();
    vue.onMounted(function () {
      return vue.onUnmounted(context.register(id));
    });
    return {
      id: id,
      context: context
    };
  }
});

function dom(ref) {
  var _ref$value$$el;

  if (ref == null) return null;
  if (ref.value == null) return null;
  return (_ref$value$$el = ref.value.$el) != null ? _ref$value$$el : ref.value;
}

var Context = /*#__PURE__*/Symbol('Context');
var State;

(function (State) {
  State[State["Open"] = 0] = "Open";
  State[State["Closed"] = 1] = "Closed";
})(State || (State = {}));

function hasOpenClosed() {
  return useOpenClosed() !== null;
}
function useOpenClosed() {
  return vue.inject(Context, null);
}
function useOpenClosedProvider(value) {
  vue.provide(Context, value);
}

var DialogStates;

(function (DialogStates) {
  DialogStates[DialogStates["Open"] = 0] = "Open";
  DialogStates[DialogStates["Closed"] = 1] = "Closed";
})(DialogStates || (DialogStates = {}));

var DialogContext = /*#__PURE__*/Symbol('DialogContext');

function useDialogContext(component) {
  var context = vue.inject(DialogContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <Dialog /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDialogContext);
    throw err;
  }

  return context;
} // ---


var Missing = 'DC8F892D-2EBD-447C-A4C8-A03058436FF4';
var Dialog = /*#__PURE__*/vue.defineComponent({
  name: 'Dialog',
  inheritAttrs: false,
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    },
    open: {
      type: [Boolean, String],
      "default": Missing
    },
    initialFocus: {
      type: Object,
      "default": null
    }
  },
  emits: {
    close: function close(_close) {
      return true;
    }
  },
  render: function render$1() {
    var _this = this;

    var propsWeControl = _extends({}, this.$attrs, {
      ref: 'el',
      id: this.id,
      role: 'dialog',
      'aria-modal': this.dialogState === DialogStates.Open ? true : undefined,
      'aria-labelledby': this.titleId,
      'aria-describedby': this.describedby,
      onClick: this.handleClick
    });

    var _this$$props = this.$props,
        passThroughProps = _objectWithoutPropertiesLoose(_this$$props, ["open", "initialFocus"]);

    var slot = {
      open: this.dialogState === DialogStates.Open
    };
    return vue.h(ForcePortalRoot, {
      force: true
    }, function () {
      return vue.h(Portal, function () {
        return vue.h(PortalGroup, {
          target: _this.dialogRef
        }, function () {
          return vue.h(ForcePortalRoot, {
            force: false
          }, function () {
            return render({
              props: _extends({}, passThroughProps, propsWeControl),
              slot: slot,
              attrs: _this.$attrs,
              slots: _this.$slots,
              visible: _this.visible,
              features: Features.RenderStrategy | Features.Static,
              name: 'Dialog'
            });
          });
        });
      });
    });
  },
  setup: function setup(props, _ref) {
    var emit = _ref.emit;
    var containers = vue.ref(new Set());
    var usesOpenClosedState = useOpenClosed();
    var open = vue.computed(function () {
      if (props.open === Missing && usesOpenClosedState !== null) {
        var _match;

        // Update the `open` prop based on the open closed state
        return match(usesOpenClosedState.value, (_match = {}, _match[State.Open] = true, _match[State.Closed] = false, _match));
      }

      return props.open;
    }); // Validations

    var hasOpen = props.open !== Missing || usesOpenClosedState !== null;

    if (!hasOpen) {
      throw new Error("You forgot to provide an `open` prop to the `Dialog`.");
    }

    if (typeof open.value !== 'boolean') {
      throw new Error("You provided an `open` prop to the `Dialog`, but the value is not a boolean. Received: " + (open.value === Missing ? undefined : props.open));
    }

    var dialogState = vue.computed(function () {
      return props.open ? DialogStates.Open : DialogStates.Closed;
    });
    var visible = vue.computed(function () {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open;
      }

      return dialogState.value === DialogStates.Open;
    });
    var internalDialogRef = vue.ref(null);
    var enabled = vue.ref(dialogState.value === DialogStates.Open);
    vue.onUpdated(function () {
      enabled.value = dialogState.value === DialogStates.Open;
    });
    var id = "headlessui-dialog-" + useId();
    var focusTrapOptions = vue.computed(function () {
      return {
        initialFocus: props.initialFocus
      };
    });
    useFocusTrap(containers, enabled, focusTrapOptions);
    useInertOthers(internalDialogRef, enabled);
    useStackProvider(function (message, element) {
      var _match2;

      return match(message, (_match2 = {}, _match2[StackMessage.AddElement] = function () {
        containers.value.add(element);
      }, _match2[StackMessage.RemoveElement] = function () {
        containers.value["delete"](element);
      }, _match2));
    });
    var describedby = useDescriptions({
      name: 'DialogDescription',
      slot: vue.computed(function () {
        return {
          open: open.value
        };
      })
    });
    var titleId = vue.ref(null);
    var api = {
      titleId: titleId,
      dialogState: dialogState,
      setTitleId: function setTitleId(id) {
        if (titleId.value === id) return;
        titleId.value = id;
      },
      close: function close() {
        emit('close', false);
      }
    };
    vue.provide(DialogContext, api); // Handle outside click

    useWindowEvent('mousedown', function (event) {
      var target = event.target;
      if (dialogState.value !== DialogStates.Open) return;
      if (containers.value.size !== 1) return;
      if (contains(containers.value, target)) return;
      api.close();
      vue.nextTick(function () {
        return target == null ? void 0 : target.focus();
      });
    }); // Handle `Escape` to close

    useWindowEvent('keydown', function (event) {
      if (event.key !== Keys.Escape) return;
      if (dialogState.value !== DialogStates.Open) return;
      if (containers.value.size > 1) return; // 1 is myself, otherwise other elements in the Stack

      event.preventDefault();
      event.stopPropagation();
      api.close();
    }); // Scroll lock

    vue.watchEffect(function (onInvalidate) {
      if (dialogState.value !== DialogStates.Open) return;
      var overflow = document.documentElement.style.overflow;
      var paddingRight = document.documentElement.style.paddingRight;
      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = scrollbarWidth + "px";
      onInvalidate(function () {
        document.documentElement.style.overflow = overflow;
        document.documentElement.style.paddingRight = paddingRight;
      });
    }); // Trigger close when the FocusTrap gets hidden

    vue.watchEffect(function (onInvalidate) {
      if (dialogState.value !== DialogStates.Open) return;
      var container = dom(internalDialogRef);
      if (!container) return;
      var observer = new IntersectionObserver(function (entries) {
        for (var _iterator = _createForOfIteratorHelperLoose(entries), _step; !(_step = _iterator()).done;) {
          var entry = _step.value;

          if (entry.boundingClientRect.x === 0 && entry.boundingClientRect.y === 0 && entry.boundingClientRect.width === 0 && entry.boundingClientRect.height === 0) {
            api.close();
          }
        }
      });
      observer.observe(container);
      onInvalidate(function () {
        return observer.disconnect();
      });
    });
    return {
      id: id,
      el: internalDialogRef,
      dialogRef: internalDialogRef,
      containers: containers,
      dialogState: dialogState,
      titleId: titleId,
      describedby: describedby,
      visible: visible,
      open: open,
      handleClick: function handleClick(event) {
        event.stopPropagation();
      }
    };
  }
}); // ---

var DialogOverlay = /*#__PURE__*/vue.defineComponent({
  name: 'DialogOverlay',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    }
  },
  render: function render$1() {
    var api = useDialogContext('DialogOverlay');
    var propsWeControl = {
      ref: 'el',
      id: this.id,
      'aria-hidden': true,
      onClick: this.handleClick
    };
    var passThroughProps = this.$props;
    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: {
        open: api.dialogState.value === DialogStates.Open
      },
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'DialogOverlay'
    });
  },
  setup: function setup() {
    var api = useDialogContext('DialogOverlay');
    var id = "headlessui-dialog-overlay-" + useId();
    return {
      id: id,
      handleClick: function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        api.close();
      }
    };
  }
}); // ---

var DialogTitle = /*#__PURE__*/vue.defineComponent({
  name: 'DialogTitle',
  props: {
    as: {
      type: [Object, String],
      "default": 'h2'
    }
  },
  render: function render$1() {
    var api = useDialogContext('DialogTitle');
    var propsWeControl = {
      id: this.id
    };
    var passThroughProps = this.$props;
    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: {
        open: api.dialogState.value === DialogStates.Open
      },
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'DialogTitle'
    });
  },
  setup: function setup() {
    var api = useDialogContext('DialogTitle');
    var id = "headlessui-dialog-title-" + useId();
    vue.onMounted(function () {
      api.setTitleId(id);
      vue.onUnmounted(function () {
        return api.setTitleId(null);
      });
    });
    return {
      id: id
    };
  }
}); // ---

var DialogDescription = Description;

function resolveType(type, as) {
  if (type) return type;
  var tag = as != null ? as : 'button';
  if (typeof tag === 'string' && tag.toLowerCase() === 'button') return 'button';
  return undefined;
}

function useResolveButtonType(data, refElement) {
  var type = vue.ref(resolveType(data.value.type, data.value.as));
  vue.onMounted(function () {
    type.value = resolveType(data.value.type, data.value.as);
  });
  vue.watchEffect(function () {
    var _dom;

    if (type.value) return;
    if (!dom(refElement)) return;

    if (dom(refElement) instanceof HTMLButtonElement && !((_dom = dom(refElement)) == null ? void 0 : _dom.hasAttribute('type'))) {
      type.value = 'button';
    }
  });
  return type;
}

var DisclosureStates;

(function (DisclosureStates) {
  DisclosureStates[DisclosureStates["Open"] = 0] = "Open";
  DisclosureStates[DisclosureStates["Closed"] = 1] = "Closed";
})(DisclosureStates || (DisclosureStates = {}));

var DisclosureContext = /*#__PURE__*/Symbol('DisclosureContext');

function useDisclosureContext(component) {
  var context = vue.inject(DisclosureContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <Disclosure /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDisclosureContext);
    throw err;
  }

  return context;
}

var DisclosurePanelContext = /*#__PURE__*/Symbol('DisclosurePanelContext');

function useDisclosurePanelContext() {
  return vue.inject(DisclosurePanelContext, null);
} // ---


var Disclosure = /*#__PURE__*/vue.defineComponent({
  name: 'Disclosure',
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    },
    defaultOpen: {
      type: [Boolean],
      "default": false
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs;
    var buttonId = "headlessui-disclosure-button-" + useId();
    var panelId = "headlessui-disclosure-panel-" + useId();
    var disclosureState = vue.ref(props.defaultOpen ? DisclosureStates.Open : DisclosureStates.Closed);
    var panelRef = vue.ref(null);
    var buttonRef = vue.ref(null);
    var api = {
      buttonId: buttonId,
      panelId: panelId,
      disclosureState: disclosureState,
      panel: panelRef,
      button: buttonRef,
      toggleDisclosure: function toggleDisclosure() {
        var _match;

        disclosureState.value = match(disclosureState.value, (_match = {}, _match[DisclosureStates.Open] = DisclosureStates.Closed, _match[DisclosureStates.Closed] = DisclosureStates.Open, _match));
      },
      closeDisclosure: function closeDisclosure() {
        if (disclosureState.value === DisclosureStates.Closed) return;
        disclosureState.value = DisclosureStates.Closed;
      },
      close: function close(focusableElement) {
        api.closeDisclosure();

        var restoreElement = function () {
          if (!focusableElement) return dom(api.button);
          if (focusableElement instanceof HTMLElement) return focusableElement;
          if (focusableElement.value instanceof HTMLElement) return dom(focusableElement);
          return dom(api.button);
        }();

        restoreElement == null ? void 0 : restoreElement.focus();
      }
    };
    vue.provide(DisclosureContext, api);
    useOpenClosedProvider(vue.computed(function () {
      var _match2;

      return match(disclosureState.value, (_match2 = {}, _match2[DisclosureStates.Open] = State.Open, _match2[DisclosureStates.Closed] = State.Closed, _match2));
    }));
    return function () {
      var passThroughProps = _objectWithoutPropertiesLoose(props, ["defaultOpen"]);

      var slot = {
        open: disclosureState.value === DisclosureStates.Open,
        close: api.close
      };
      return render({
        props: passThroughProps,
        slot: slot,
        slots: slots,
        attrs: attrs,
        name: 'Disclosure'
      });
    };
  }
}); // ---

var DisclosureButton = /*#__PURE__*/vue.defineComponent({
  name: 'DisclosureButton',
  props: {
    as: {
      type: [Object, String],
      "default": 'button'
    },
    disabled: {
      type: [Boolean],
      "default": false
    }
  },
  render: function render$1() {
    var api = useDisclosureContext('DisclosureButton');
    var slot = {
      open: api.disclosureState.value === DisclosureStates.Open
    };
    var propsWeControl = this.isWithinPanel ? {
      ref: 'el',
      type: this.type,
      onClick: this.handleClick,
      onKeydown: this.handleKeyDown
    } : {
      id: this.id,
      ref: 'el',
      type: this.type,
      'aria-expanded': this.$props.disabled ? undefined : api.disclosureState.value === DisclosureStates.Open,
      'aria-controls': dom(api.panel) ? api.panelId : undefined,
      disabled: this.$props.disabled ? true : undefined,
      onClick: this.handleClick,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'DisclosureButton'
    });
  },
  setup: function setup(props, _ref2) {
    var attrs = _ref2.attrs;
    var api = useDisclosureContext('DisclosureButton');
    var panelContext = useDisclosurePanelContext();
    var isWithinPanel = panelContext === null ? false : panelContext === api.panelId;
    var elementRef = vue.ref(null);

    if (!isWithinPanel) {
      vue.watchEffect(function () {
        api.button.value = elementRef.value;
      });
    }

    return {
      isWithinPanel: isWithinPanel,
      id: api.buttonId,
      el: elementRef,
      type: useResolveButtonType(vue.computed(function () {
        return {
          as: props.as,
          type: attrs.type
        };
      }), elementRef),
      handleClick: function handleClick() {
        if (props.disabled) return;

        if (isWithinPanel) {
          var _dom;

          api.toggleDisclosure();
          (_dom = dom(api.button)) == null ? void 0 : _dom.focus();
        } else {
          api.toggleDisclosure();
        }
      },
      handleKeyDown: function handleKeyDown(event) {
        var _dom2;

        if (props.disabled) return;

        if (isWithinPanel) {
          switch (event.key) {
            case Keys.Space:
            case Keys.Enter:
              event.preventDefault();
              event.stopPropagation();
              api.toggleDisclosure();
              (_dom2 = dom(api.button)) == null ? void 0 : _dom2.focus();
              break;
          }
        } else {
          switch (event.key) {
            case Keys.Space:
            case Keys.Enter:
              event.preventDefault();
              event.stopPropagation();
              api.toggleDisclosure();
              break;
          }
        }
      },
      handleKeyUp: function handleKeyUp(event) {
        switch (event.key) {
          case Keys.Space:
            // Required for firefox, event.preventDefault() in handleKeyDown for
            // the Space key doesn't cancel the handleKeyUp, which in turn
            // triggers a *click*.
            event.preventDefault();
            break;
        }
      }
    };
  }
}); // ---

var DisclosurePanel = /*#__PURE__*/vue.defineComponent({
  name: 'DisclosurePanel',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    }
  },
  render: function render$1() {
    var api = useDisclosureContext('DisclosurePanel');
    var slot = {
      open: api.disclosureState.value === DisclosureStates.Open,
      close: api.close
    };
    var propsWeControl = {
      id: this.id,
      ref: 'el'
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: this.visible,
      name: 'DisclosurePanel'
    });
  },
  setup: function setup() {
    var api = useDisclosureContext('DisclosurePanel');
    vue.provide(DisclosurePanelContext, api.panelId);
    var usesOpenClosedState = useOpenClosed();
    var visible = vue.computed(function () {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open;
      }

      return api.disclosureState.value === DisclosureStates.Open;
    });
    return {
      id: api.panelId,
      el: api.panel,
      visible: visible
    };
  }
});

var FocusTrap = /*#__PURE__*/vue.defineComponent({
  name: 'FocusTrap',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    initialFocus: {
      type: Object,
      "default": null
    }
  },
  render: function render$1() {
    var slot = {};
    var propsWeControl = {
      ref: 'el'
    };

    var _this$$props = this.$props,
        passThroughProps = _objectWithoutPropertiesLoose(_this$$props, ["initialFocus"]);

    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'FocusTrap'
    });
  },
  setup: function setup(props) {
    var containers = vue.ref(new Set());
    var container = vue.ref(null);
    var enabled = vue.ref(true);
    var focusTrapOptions = vue.computed(function () {
      return {
        initialFocus: props.initialFocus
      };
    });
    vue.onMounted(function () {
      if (!container.value) return;
      containers.value.add(container.value);
      useFocusTrap(containers, enabled, focusTrapOptions);
    });
    vue.onUnmounted(function () {
      enabled.value = false;
    });
    return {
      el: container
    };
  }
});

function assertNever(x) {
  throw new Error('Unexpected object: ' + x);
}

var Focus$1;

(function (Focus) {
  /** Focus the first non-disabled item. */
  Focus[Focus["First"] = 0] = "First";
  /** Focus the previous non-disabled item. */

  Focus[Focus["Previous"] = 1] = "Previous";
  /** Focus the next non-disabled item. */

  Focus[Focus["Next"] = 2] = "Next";
  /** Focus the last non-disabled item. */

  Focus[Focus["Last"] = 3] = "Last";
  /** Focus a specific item based on the `id` of the item. */

  Focus[Focus["Specific"] = 4] = "Specific";
  /** Focus no items at all. */

  Focus[Focus["Nothing"] = 5] = "Nothing";
})(Focus$1 || (Focus$1 = {}));

function calculateActiveIndex(action, resolvers) {
  var items = resolvers.resolveItems();
  if (items.length <= 0) return null;
  var currentActiveIndex = resolvers.resolveActiveIndex();
  var activeIndex = currentActiveIndex != null ? currentActiveIndex : -1;

  var nextActiveIndex = function () {
    switch (action.focus) {
      case Focus$1.First:
        return items.findIndex(function (item) {
          return !resolvers.resolveDisabled(item);
        });

      case Focus$1.Previous:
        {
          var idx = items.slice().reverse().findIndex(function (item, idx, all) {
            if (activeIndex !== -1 && all.length - idx - 1 >= activeIndex) return false;
            return !resolvers.resolveDisabled(item);
          });
          if (idx === -1) return idx;
          return items.length - 1 - idx;
        }

      case Focus$1.Next:
        return items.findIndex(function (item, idx) {
          if (idx <= activeIndex) return false;
          return !resolvers.resolveDisabled(item);
        });

      case Focus$1.Last:
        {
          var _idx = items.slice().reverse().findIndex(function (item) {
            return !resolvers.resolveDisabled(item);
          });

          if (_idx === -1) return _idx;
          return items.length - 1 - _idx;
        }

      case Focus$1.Specific:
        return items.findIndex(function (item) {
          return resolvers.resolveId(item) === action.id;
        });

      case Focus$1.Nothing:
        return null;

      default:
        assertNever(action);
    }
  }();

  return nextActiveIndex === -1 ? currentActiveIndex : nextActiveIndex;
}

var ListboxStates;

(function (ListboxStates) {
  ListboxStates[ListboxStates["Open"] = 0] = "Open";
  ListboxStates[ListboxStates["Closed"] = 1] = "Closed";
})(ListboxStates || (ListboxStates = {}));

function nextFrame(cb) {
  requestAnimationFrame(function () {
    return requestAnimationFrame(cb);
  });
}

var ListboxContext = /*#__PURE__*/Symbol('ListboxContext');

function useListboxContext(component) {
  var context = vue.inject(ListboxContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <Listbox /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext);
    throw err;
  }

  return context;
} // ---


var Listbox = /*#__PURE__*/vue.defineComponent({
  name: 'Listbox',
  emits: {
    'update:modelValue': function updateModelValue(_value) {
      return true;
    }
  },
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    },
    disabled: {
      type: [Boolean],
      "default": false
    },
    horizontal: {
      type: [Boolean],
      "default": false
    },
    modelValue: {
      type: [Object, String, Number, Boolean]
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs,
        emit = _ref.emit;
    var listboxState = vue.ref(ListboxStates.Closed);
    var labelRef = vue.ref(null);
    var buttonRef = vue.ref(null);
    var optionsRef = vue.ref(null);
    var options = vue.ref([]);
    var searchQuery = vue.ref('');
    var activeOptionIndex = vue.ref(null);
    var value = vue.computed(function () {
      return props.modelValue;
    });
    var api = {
      listboxState: listboxState,
      value: value,
      orientation: vue.computed(function () {
        return props.horizontal ? 'horizontal' : 'vertical';
      }),
      labelRef: labelRef,
      buttonRef: buttonRef,
      optionsRef: optionsRef,
      disabled: vue.computed(function () {
        return props.disabled;
      }),
      options: options,
      searchQuery: searchQuery,
      activeOptionIndex: activeOptionIndex,
      closeListbox: function closeListbox() {
        if (props.disabled) return;
        if (listboxState.value === ListboxStates.Closed) return;
        listboxState.value = ListboxStates.Closed;
        activeOptionIndex.value = null;
      },
      openListbox: function openListbox() {
        if (props.disabled) return;
        if (listboxState.value === ListboxStates.Open) return;
        listboxState.value = ListboxStates.Open;
      },
      goToOption: function goToOption(focus, id) {
        if (props.disabled) return;
        if (listboxState.value === ListboxStates.Closed) return;
        var nextActiveOptionIndex = calculateActiveIndex(focus === Focus$1.Specific ? {
          focus: Focus$1.Specific,
          id: id
        } : {
          focus: focus
        }, {
          resolveItems: function resolveItems() {
            return options.value;
          },
          resolveActiveIndex: function resolveActiveIndex() {
            return activeOptionIndex.value;
          },
          resolveId: function resolveId(option) {
            return option.id;
          },
          resolveDisabled: function resolveDisabled(option) {
            return option.dataRef.disabled;
          }
        });
        if (searchQuery.value === '' && activeOptionIndex.value === nextActiveOptionIndex) return;
        searchQuery.value = '';
        activeOptionIndex.value = nextActiveOptionIndex;
      },
      search: function search(value) {
        if (props.disabled) return;
        if (listboxState.value === ListboxStates.Closed) return;
        searchQuery.value += value.toLowerCase();
        var match = options.value.findIndex(function (option) {
          return !option.dataRef.disabled && option.dataRef.textValue.startsWith(searchQuery.value);
        });
        if (match === -1 || match === activeOptionIndex.value) return;
        activeOptionIndex.value = match;
      },
      clearSearch: function clearSearch() {
        if (props.disabled) return;
        if (listboxState.value === ListboxStates.Closed) return;
        if (searchQuery.value === '') return;
        searchQuery.value = '';
      },
      registerOption: function registerOption(id, dataRef) {
        // @ts-expect-error The expected type comes from property 'dataRef' which is declared here on type '{ id: string; dataRef: { textValue: string; disabled: boolean; }; }'
        options.value.push({
          id: id,
          dataRef: dataRef
        });
      },
      unregisterOption: function unregisterOption(id) {
        var nextOptions = options.value.slice();
        var currentActiveOption = activeOptionIndex.value !== null ? nextOptions[activeOptionIndex.value] : null;
        var idx = nextOptions.findIndex(function (a) {
          return a.id === id;
        });
        if (idx !== -1) nextOptions.splice(idx, 1);
        options.value = nextOptions;

        activeOptionIndex.value = function () {
          if (idx === activeOptionIndex.value) return null;
          if (currentActiveOption === null) return null; // If we removed the option before the actual active index, then it would be out of sync. To
          // fix this, we will find the correct (new) index position.

          return nextOptions.indexOf(currentActiveOption);
        }();
      },
      select: function select(value) {
        if (props.disabled) return;
        emit('update:modelValue', value);
      }
    };
    useWindowEvent('mousedown', function (event) {
      var _dom, _dom2, _dom3;

      var target = event.target;
      var active = document.activeElement;
      if (listboxState.value !== ListboxStates.Open) return;
      if ((_dom = dom(buttonRef)) == null ? void 0 : _dom.contains(target)) return;
      if (!((_dom2 = dom(optionsRef)) == null ? void 0 : _dom2.contains(target))) api.closeListbox();
      if (active !== document.body && (active == null ? void 0 : active.contains(target))) return; // Keep focus on newly clicked/focused element

      if (!event.defaultPrevented) (_dom3 = dom(buttonRef)) == null ? void 0 : _dom3.focus({
        preventScroll: true
      });
    }); // @ts-expect-error Types of property 'dataRef' are incompatible.

    vue.provide(ListboxContext, api);
    useOpenClosedProvider(vue.computed(function () {
      var _match;

      return match(listboxState.value, (_match = {}, _match[ListboxStates.Open] = State.Open, _match[ListboxStates.Closed] = State.Closed, _match));
    }));
    return function () {
      var slot = {
        open: listboxState.value === ListboxStates.Open,
        disabled: props.disabled,
        openListbox: api.openListbox,
        closeListbox: api.closeListbox
      };
      return render({
        props: omit(props, ['modelValue', 'onUpdate:modelValue', 'disabled', 'horizontal']),
        slot: slot,
        slots: slots,
        attrs: attrs,
        name: 'Listbox'
      });
    };
  }
}); // ---

var ListboxLabel = /*#__PURE__*/vue.defineComponent({
  name: 'ListboxLabel',
  props: {
    as: {
      type: [Object, String],
      "default": 'label'
    }
  },
  render: function render$1() {
    var api = useListboxContext('ListboxLabel');
    var slot = {
      open: api.listboxState.value === ListboxStates.Open,
      disabled: api.disabled.value
    };
    var propsWeControl = {
      id: this.id,
      ref: 'el',
      onClick: this.handleClick
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'ListboxLabel'
    });
  },
  setup: function setup() {
    var api = useListboxContext('ListboxLabel');
    var id = "headlessui-listbox-label-" + useId();
    return {
      id: id,
      el: api.labelRef,
      handleClick: function handleClick() {
        var _dom4;

        (_dom4 = dom(api.buttonRef)) == null ? void 0 : _dom4.focus({
          preventScroll: true
        });
      }
    };
  }
}); // ---

var ListboxButton = /*#__PURE__*/vue.defineComponent({
  name: 'ListboxButton',
  props: {
    as: {
      type: [Object, String],
      "default": 'button'
    }
  },
  render: function render$1() {
    var _dom5, _dom6;

    var api = useListboxContext('ListboxButton');
    var slot = {
      open: api.listboxState.value === ListboxStates.Open,
      disabled: api.disabled.value
    };
    var propsWeControl = {
      ref: 'el',
      id: this.id,
      type: this.type,
      'aria-haspopup': true,
      'aria-controls': (_dom5 = dom(api.optionsRef)) == null ? void 0 : _dom5.id,
      'aria-expanded': api.disabled.value ? undefined : api.listboxState.value === ListboxStates.Open,
      'aria-labelledby': api.labelRef.value ? [(_dom6 = dom(api.labelRef)) == null ? void 0 : _dom6.id, this.id].join(' ') : undefined,
      disabled: api.disabled.value === true ? true : undefined,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      onClick: this.handleClick
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'ListboxButton'
    });
  },
  setup: function setup(props, _ref2) {
    var attrs = _ref2.attrs;
    var api = useListboxContext('ListboxButton');
    var id = "headlessui-listbox-button-" + useId();

    function handleKeyDown(event) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault();
          api.openListbox();
          vue.nextTick(function () {
            var _dom7;

            (_dom7 = dom(api.optionsRef)) == null ? void 0 : _dom7.focus({
              preventScroll: true
            });
            if (!api.value.value) api.goToOption(Focus$1.First);
          });
          break;

        case Keys.ArrowUp:
          event.preventDefault();
          api.openListbox();
          vue.nextTick(function () {
            var _dom8;

            (_dom8 = dom(api.optionsRef)) == null ? void 0 : _dom8.focus({
              preventScroll: true
            });
            if (!api.value.value) api.goToOption(Focus$1.Last);
          });
          break;
      }
    }

    function handleKeyUp(event) {
      switch (event.key) {
        case Keys.Space:
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault();
          break;
      }
    }

    function handleClick(event) {
      if (api.disabled.value) return;

      if (api.listboxState.value === ListboxStates.Open) {
        api.closeListbox();
        vue.nextTick(function () {
          var _dom9;

          return (_dom9 = dom(api.buttonRef)) == null ? void 0 : _dom9.focus({
            preventScroll: true
          });
        });
      } else {
        event.preventDefault();
        api.openListbox();
        nextFrame(function () {
          var _dom10;

          return (_dom10 = dom(api.optionsRef)) == null ? void 0 : _dom10.focus({
            preventScroll: true
          });
        });
      }
    }

    return {
      id: id,
      el: api.buttonRef,
      type: useResolveButtonType(vue.computed(function () {
        return {
          as: props.as,
          type: attrs.type
        };
      }), api.buttonRef),
      handleKeyDown: handleKeyDown,
      handleKeyUp: handleKeyUp,
      handleClick: handleClick
    };
  }
}); // ---

var ListboxOptions = /*#__PURE__*/vue.defineComponent({
  name: 'ListboxOptions',
  props: {
    as: {
      type: [Object, String],
      "default": 'ul'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    }
  },
  render: function render$1() {
    var _api$options$value$ap, _dom$id, _dom11, _dom12;

    var api = useListboxContext('ListboxOptions');
    var slot = {
      open: api.listboxState.value === ListboxStates.Open
    };
    var propsWeControl = {
      'aria-activedescendant': api.activeOptionIndex.value === null ? undefined : (_api$options$value$ap = api.options.value[api.activeOptionIndex.value]) == null ? void 0 : _api$options$value$ap.id,
      'aria-labelledby': (_dom$id = (_dom11 = dom(api.labelRef)) == null ? void 0 : _dom11.id) != null ? _dom$id : (_dom12 = dom(api.buttonRef)) == null ? void 0 : _dom12.id,
      'aria-orientation': api.orientation.value,
      id: this.id,
      onKeydown: this.handleKeyDown,
      role: 'listbox',
      tabIndex: 0,
      ref: 'el'
    };
    var passThroughProps = this.$props;
    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: this.visible,
      name: 'ListboxOptions'
    });
  },
  setup: function setup() {
    var api = useListboxContext('ListboxOptions');
    var id = "headlessui-listbox-options-" + useId();
    var searchDebounce = vue.ref(null);

    function handleKeyDown(event) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value);

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (api.searchQuery.value !== '') {
            event.preventDefault();
            event.stopPropagation();
            return api.search(event.key);
          }

        // When in type ahead mode, fallthrough

        case Keys.Enter:
          event.preventDefault();
          event.stopPropagation();

          if (api.activeOptionIndex.value !== null) {
            var dataRef = api.options.value[api.activeOptionIndex.value].dataRef;
            api.select(dataRef.value);
          }

          api.closeListbox();
          vue.nextTick(function () {
            var _dom13;

            return (_dom13 = dom(api.buttonRef)) == null ? void 0 : _dom13.focus({
              preventScroll: true
            });
          });
          break;

        case match(api.orientation.value, {
          vertical: Keys.ArrowDown,
          horizontal: Keys.ArrowRight
        }):
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(Focus$1.Next);

        case match(api.orientation.value, {
          vertical: Keys.ArrowUp,
          horizontal: Keys.ArrowLeft
        }):
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(Focus$1.Previous);

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(Focus$1.First);

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(Focus$1.Last);

        case Keys.Escape:
          event.preventDefault();
          event.stopPropagation();
          api.closeListbox();
          vue.nextTick(function () {
            var _dom14;

            return (_dom14 = dom(api.buttonRef)) == null ? void 0 : _dom14.focus({
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
            api.search(event.key);
            searchDebounce.value = setTimeout(function () {
              return api.clearSearch();
            }, 350);
          }

          break;
      }
    }

    var usesOpenClosedState = useOpenClosed();
    var visible = vue.computed(function () {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open;
      }

      return api.listboxState.value === ListboxStates.Open;
    });
    return {
      id: id,
      el: api.optionsRef,
      handleKeyDown: handleKeyDown,
      visible: visible
    };
  }
});
var ListboxOption = /*#__PURE__*/vue.defineComponent({
  name: 'ListboxOption',
  props: {
    as: {
      type: [Object, String],
      "default": 'li'
    },
    value: {
      type: [Object, String, Number, Boolean]
    },
    disabled: {
      type: Boolean,
      "default": false
    }
  },
  setup: function setup(props, _ref3) {
    var slots = _ref3.slots,
        attrs = _ref3.attrs;
    var api = useListboxContext('ListboxOption');
    var id = "headlessui-listbox-option-" + useId();
    var active = vue.computed(function () {
      return api.activeOptionIndex.value !== null ? api.options.value[api.activeOptionIndex.value].id === id : false;
    });
    var selected = vue.computed(function () {
      return vue.toRaw(api.value.value) === vue.toRaw(props.value);
    });
    var dataRef = vue.ref({
      disabled: props.disabled,
      value: props.value,
      textValue: ''
    });
    vue.onMounted(function () {
      var _document$getElementB, _document$getElementB2;

      var textValue = (_document$getElementB = document.getElementById(id)) == null ? void 0 : (_document$getElementB2 = _document$getElementB.textContent) == null ? void 0 : _document$getElementB2.toLowerCase().trim();
      if (textValue !== undefined) dataRef.value.textValue = textValue;
    });
    vue.onMounted(function () {
      return api.registerOption(id, dataRef);
    });
    vue.onUnmounted(function () {
      return api.unregisterOption(id);
    });
    vue.onMounted(function () {
      vue.watch([api.listboxState, selected], function () {
        var _document$getElementB3;

        if (api.listboxState.value !== ListboxStates.Open) return;
        if (!selected.value) return;
        api.goToOption(Focus$1.Specific, id);
        (_document$getElementB3 = document.getElementById(id)) == null ? void 0 : _document$getElementB3.focus == null ? void 0 : _document$getElementB3.focus();
      }, {
        immediate: true
      });
    });
    vue.watchEffect(function () {
      if (api.listboxState.value !== ListboxStates.Open) return;
      if (!active.value) return;
      vue.nextTick(function () {
        var _document$getElementB4;

        return (_document$getElementB4 = document.getElementById(id)) == null ? void 0 : _document$getElementB4.scrollIntoView == null ? void 0 : _document$getElementB4.scrollIntoView({
          block: 'nearest'
        });
      });
    });

    function handleClick(event) {
      if (props.disabled) return event.preventDefault();
      api.select(props.value);
      api.closeListbox();
      vue.nextTick(function () {
        var _dom15;

        return (_dom15 = dom(api.buttonRef)) == null ? void 0 : _dom15.focus({
          preventScroll: true
        });
      });
    }

    function handleFocus() {
      if (props.disabled) return api.goToOption(Focus$1.Nothing);
      api.goToOption(Focus$1.Specific, id);
    }

    function handleMove() {
      if (props.disabled) return;
      if (active.value) return;
      api.goToOption(Focus$1.Specific, id);
    }

    function handleLeave() {
      if (props.disabled) return;
      if (!active.value) return;
      api.goToOption(Focus$1.Nothing);
    }

    return function () {
      var disabled = props.disabled;
      var slot = {
        active: active.value,
        selected: selected.value,
        disabled: disabled
      };
      var propsWeControl = {
        id: id,
        role: 'option',
        tabIndex: disabled === true ? undefined : -1,
        'aria-disabled': disabled === true ? true : undefined,
        'aria-selected': selected.value === true ? selected.value : undefined,
        disabled: undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave
      };
      return render({
        props: _extends({}, props, propsWeControl),
        slot: slot,
        attrs: attrs,
        slots: slots,
        name: 'ListboxOption'
      });
    };
  }
});

function useTreeWalker(_ref) {
  var container = _ref.container,
      accept = _ref.accept,
      walk = _ref.walk,
      enabled = _ref.enabled;
  vue.watchEffect(function () {
    var root = container.value;
    if (!root) return;
    if (enabled !== undefined && !enabled.value) return;
    var acceptNode = Object.assign(function (node) {
      return accept(node);
    }, {
      acceptNode: accept
    });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, acceptNode, false);

    while (walker.nextNode()) {
      walk(walker.currentNode);
    }
  });
}

var MenuStates;

(function (MenuStates) {
  MenuStates[MenuStates["Open"] = 0] = "Open";
  MenuStates[MenuStates["Closed"] = 1] = "Closed";
})(MenuStates || (MenuStates = {}));

function nextFrame$1(cb) {
  requestAnimationFrame(function () {
    return requestAnimationFrame(cb);
  });
}

var MenuContext = /*#__PURE__*/Symbol('MenuContext');

function useMenuContext(component) {
  var context = vue.inject(MenuContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <Menu /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useMenuContext);
    throw err;
  }

  return context;
}

var Menu = /*#__PURE__*/vue.defineComponent({
  name: 'Menu',
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs;
    var menuState = vue.ref(MenuStates.Closed);
    var buttonRef = vue.ref(null);
    var itemsRef = vue.ref(null);
    var items = vue.ref([]);
    var searchQuery = vue.ref('');
    var activeItemIndex = vue.ref(null);
    var api = {
      menuState: menuState,
      buttonRef: buttonRef,
      itemsRef: itemsRef,
      items: items,
      searchQuery: searchQuery,
      activeItemIndex: activeItemIndex,
      closeMenu: function closeMenu() {
        menuState.value = MenuStates.Closed;
        activeItemIndex.value = null;
      },
      openMenu: function openMenu() {
        return menuState.value = MenuStates.Open;
      },
      goToItem: function goToItem(focus, id) {
        var nextActiveItemIndex = calculateActiveIndex(focus === Focus$1.Specific ? {
          focus: Focus$1.Specific,
          id: id
        } : {
          focus: focus
        }, {
          resolveItems: function resolveItems() {
            return items.value;
          },
          resolveActiveIndex: function resolveActiveIndex() {
            return activeItemIndex.value;
          },
          resolveId: function resolveId(item) {
            return item.id;
          },
          resolveDisabled: function resolveDisabled(item) {
            return item.dataRef.disabled;
          }
        });
        if (searchQuery.value === '' && activeItemIndex.value === nextActiveItemIndex) return;
        searchQuery.value = '';
        activeItemIndex.value = nextActiveItemIndex;
      },
      search: function search(value) {
        searchQuery.value += value.toLowerCase();
        var match = items.value.findIndex(function (item) {
          return item.dataRef.textValue.startsWith(searchQuery.value) && !item.dataRef.disabled;
        });
        if (match === -1 || match === activeItemIndex.value) return;
        activeItemIndex.value = match;
      },
      clearSearch: function clearSearch() {
        searchQuery.value = '';
      },
      registerItem: function registerItem(id, dataRef) {
        // @ts-expect-error The expected type comes from property 'dataRef' which is declared here on type '{ id: string; dataRef: { textValue: string; disabled: boolean; }; }'
        items.value.push({
          id: id,
          dataRef: dataRef
        });
      },
      unregisterItem: function unregisterItem(id) {
        var nextItems = items.value.slice();
        var currentActiveItem = activeItemIndex.value !== null ? nextItems[activeItemIndex.value] : null;
        var idx = nextItems.findIndex(function (a) {
          return a.id === id;
        });
        if (idx !== -1) nextItems.splice(idx, 1);
        items.value = nextItems;

        activeItemIndex.value = function () {
          if (idx === activeItemIndex.value) return null;
          if (currentActiveItem === null) return null; // If we removed the item before the actual active index, then it would be out of sync. To
          // fix this, we will find the correct (new) index position.

          return nextItems.indexOf(currentActiveItem);
        }();
      }
    };
    useWindowEvent('mousedown', function (event) {
      var _dom, _dom2, _dom3;

      var target = event.target;
      var active = document.activeElement;
      if (menuState.value !== MenuStates.Open) return;
      if ((_dom = dom(buttonRef)) == null ? void 0 : _dom.contains(target)) return;
      if (!((_dom2 = dom(itemsRef)) == null ? void 0 : _dom2.contains(target))) api.closeMenu();
      if (active !== document.body && (active == null ? void 0 : active.contains(target))) return; // Keep focus on newly clicked/focused element

      if (!event.defaultPrevented) (_dom3 = dom(buttonRef)) == null ? void 0 : _dom3.focus({
        preventScroll: true
      });
    }); // @ts-expect-error Types of property 'dataRef' are incompatible.

    vue.provide(MenuContext, api);
    useOpenClosedProvider(vue.computed(function () {
      var _match;

      return match(menuState.value, (_match = {}, _match[MenuStates.Open] = State.Open, _match[MenuStates.Closed] = State.Closed, _match));
    }));
    return function () {
      var slot = {
        open: menuState.value === MenuStates.Open
      };
      return render({
        props: props,
        slot: slot,
        slots: slots,
        attrs: attrs,
        name: 'Menu'
      });
    };
  }
});
var MenuButton = /*#__PURE__*/vue.defineComponent({
  name: 'MenuButton',
  props: {
    disabled: {
      type: Boolean,
      "default": false
    },
    as: {
      type: [Object, String],
      "default": 'button'
    }
  },
  render: function render$1() {
    var _dom4;

    var api = useMenuContext('MenuButton');
    var slot = {
      open: api.menuState.value === MenuStates.Open
    };
    var propsWeControl = {
      ref: 'el',
      id: this.id,
      type: this.type,
      'aria-haspopup': true,
      'aria-controls': (_dom4 = dom(api.itemsRef)) == null ? void 0 : _dom4.id,
      'aria-expanded': this.$props.disabled ? undefined : api.menuState.value === MenuStates.Open,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      onClick: this.handleClick
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'MenuButton'
    });
  },
  setup: function setup(props, _ref2) {
    var attrs = _ref2.attrs;
    var api = useMenuContext('MenuButton');
    var id = "headlessui-menu-button-" + useId();

    function handleKeyDown(event) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault();
          event.stopPropagation();
          api.openMenu();
          vue.nextTick(function () {
            var _dom5;

            (_dom5 = dom(api.itemsRef)) == null ? void 0 : _dom5.focus({
              preventScroll: true
            });
            api.goToItem(Focus$1.First);
          });
          break;

        case Keys.ArrowUp:
          event.preventDefault();
          event.stopPropagation();
          api.openMenu();
          vue.nextTick(function () {
            var _dom6;

            (_dom6 = dom(api.itemsRef)) == null ? void 0 : _dom6.focus({
              preventScroll: true
            });
            api.goToItem(Focus$1.Last);
          });
          break;
      }
    }

    function handleKeyUp(event) {
      switch (event.key) {
        case Keys.Space:
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault();
          break;
      }
    }

    function handleClick(event) {
      if (props.disabled) return;

      if (api.menuState.value === MenuStates.Open) {
        api.closeMenu();
        vue.nextTick(function () {
          var _dom7;

          return (_dom7 = dom(api.buttonRef)) == null ? void 0 : _dom7.focus({
            preventScroll: true
          });
        });
      } else {
        event.preventDefault();
        event.stopPropagation();
        api.openMenu();
        nextFrame$1(function () {
          var _dom8;

          return (_dom8 = dom(api.itemsRef)) == null ? void 0 : _dom8.focus({
            preventScroll: true
          });
        });
      }
    }

    return {
      id: id,
      el: api.buttonRef,
      type: useResolveButtonType(vue.computed(function () {
        return {
          as: props.as,
          type: attrs.type
        };
      }), api.buttonRef),
      handleKeyDown: handleKeyDown,
      handleKeyUp: handleKeyUp,
      handleClick: handleClick
    };
  }
});
var MenuItems = /*#__PURE__*/vue.defineComponent({
  name: 'MenuItems',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    }
  },
  render: function render$1() {
    var _api$items$value$api$, _dom9;

    var api = useMenuContext('MenuItems');
    var slot = {
      open: api.menuState.value === MenuStates.Open
    };
    var propsWeControl = {
      'aria-activedescendant': api.activeItemIndex.value === null ? undefined : (_api$items$value$api$ = api.items.value[api.activeItemIndex.value]) == null ? void 0 : _api$items$value$api$.id,
      'aria-labelledby': (_dom9 = dom(api.buttonRef)) == null ? void 0 : _dom9.id,
      id: this.id,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      role: 'menu',
      tabIndex: 0,
      ref: 'el'
    };
    var passThroughProps = this.$props;
    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: this.visible,
      name: 'MenuItems'
    });
  },
  setup: function setup() {
    var api = useMenuContext('MenuItems');
    var id = "headlessui-menu-items-" + useId();
    var searchDebounce = vue.ref(null);
    useTreeWalker({
      container: vue.computed(function () {
        return dom(api.itemsRef);
      }),
      enabled: vue.computed(function () {
        return api.menuState.value === MenuStates.Open;
      }),
      accept: function accept(node) {
        if (node.getAttribute('role') === 'menuitem') return NodeFilter.FILTER_REJECT;
        if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
      walk: function walk(node) {
        node.setAttribute('role', 'none');
      }
    });

    function handleKeyDown(event) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value);

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (api.searchQuery.value !== '') {
            event.preventDefault();
            event.stopPropagation();
            return api.search(event.key);
          }

        // When in type ahead mode, fallthrough

        case Keys.Enter:
          event.preventDefault();
          event.stopPropagation();

          if (api.activeItemIndex.value !== null) {
            var _document$getElementB;

            var _id = api.items.value[api.activeItemIndex.value].id;
            (_document$getElementB = document.getElementById(_id)) == null ? void 0 : _document$getElementB.click();
          }

          api.closeMenu();
          vue.nextTick(function () {
            var _dom10;

            return (_dom10 = dom(api.buttonRef)) == null ? void 0 : _dom10.focus({
              preventScroll: true
            });
          });
          break;

        case Keys.ArrowDown:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(Focus$1.Next);

        case Keys.ArrowUp:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(Focus$1.Previous);

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(Focus$1.First);

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(Focus$1.Last);

        case Keys.Escape:
          event.preventDefault();
          event.stopPropagation();
          api.closeMenu();
          vue.nextTick(function () {
            var _dom11;

            return (_dom11 = dom(api.buttonRef)) == null ? void 0 : _dom11.focus({
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
            api.search(event.key);
            searchDebounce.value = setTimeout(function () {
              return api.clearSearch();
            }, 350);
          }

          break;
      }
    }

    function handleKeyUp(event) {
      switch (event.key) {
        case Keys.Space:
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault();
          break;
      }
    }

    var usesOpenClosedState = useOpenClosed();
    var visible = vue.computed(function () {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open;
      }

      return api.menuState.value === MenuStates.Open;
    });
    return {
      id: id,
      el: api.itemsRef,
      handleKeyDown: handleKeyDown,
      handleKeyUp: handleKeyUp,
      visible: visible
    };
  }
});
var MenuItem = /*#__PURE__*/vue.defineComponent({
  name: 'MenuItem',
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    },
    disabled: {
      type: Boolean,
      "default": false
    }
  },
  setup: function setup(props, _ref3) {
    var slots = _ref3.slots,
        attrs = _ref3.attrs;
    var api = useMenuContext('MenuItem');
    var id = "headlessui-menu-item-" + useId();
    var active = vue.computed(function () {
      return api.activeItemIndex.value !== null ? api.items.value[api.activeItemIndex.value].id === id : false;
    });
    var dataRef = vue.ref({
      disabled: props.disabled,
      textValue: ''
    });
    vue.onMounted(function () {
      var _document$getElementB2, _document$getElementB3;

      var textValue = (_document$getElementB2 = document.getElementById(id)) == null ? void 0 : (_document$getElementB3 = _document$getElementB2.textContent) == null ? void 0 : _document$getElementB3.toLowerCase().trim();
      if (textValue !== undefined) dataRef.value.textValue = textValue;
    });
    vue.onMounted(function () {
      return api.registerItem(id, dataRef);
    });
    vue.onUnmounted(function () {
      return api.unregisterItem(id);
    });
    vue.watchEffect(function () {
      if (api.menuState.value !== MenuStates.Open) return;
      if (!active.value) return;
      vue.nextTick(function () {
        var _document$getElementB4;

        return (_document$getElementB4 = document.getElementById(id)) == null ? void 0 : _document$getElementB4.scrollIntoView == null ? void 0 : _document$getElementB4.scrollIntoView({
          block: 'nearest'
        });
      });
    });

    function handleClick(event) {
      if (props.disabled) return event.preventDefault();
      api.closeMenu();
      vue.nextTick(function () {
        var _dom12;

        return (_dom12 = dom(api.buttonRef)) == null ? void 0 : _dom12.focus({
          preventScroll: true
        });
      });
    }

    function handleFocus() {
      if (props.disabled) return api.goToItem(Focus$1.Nothing);
      api.goToItem(Focus$1.Specific, id);
    }

    function handleMove() {
      if (props.disabled) return;
      if (active.value) return;
      api.goToItem(Focus$1.Specific, id);
    }

    function handleLeave() {
      if (props.disabled) return;
      if (!active.value) return;
      api.goToItem(Focus$1.Nothing);
    }

    return function () {
      var disabled = props.disabled;
      var slot = {
        active: active.value,
        disabled: disabled
      };
      var propsWeControl = {
        id: id,
        role: 'menuitem',
        tabIndex: disabled === true ? undefined : -1,
        'aria-disabled': disabled === true ? true : undefined,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave
      };
      return render({
        props: _extends({}, props, propsWeControl),
        slot: slot,
        attrs: attrs,
        slots: slots,
        name: 'MenuItem'
      });
    };
  }
});

var PopoverStates;

(function (PopoverStates) {
  PopoverStates[PopoverStates["Open"] = 0] = "Open";
  PopoverStates[PopoverStates["Closed"] = 1] = "Closed";
})(PopoverStates || (PopoverStates = {}));

var PopoverContext = /*#__PURE__*/Symbol('PopoverContext');

function usePopoverContext(component) {
  var context = vue.inject(PopoverContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + Popover.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, usePopoverContext);
    throw err;
  }

  return context;
}

var PopoverGroupContext = /*#__PURE__*/Symbol('PopoverGroupContext');

function usePopoverGroupContext() {
  return vue.inject(PopoverGroupContext, null);
}

var PopoverPanelContext = /*#__PURE__*/Symbol('PopoverPanelContext');

function usePopoverPanelContext() {
  return vue.inject(PopoverPanelContext, null);
} // ---


var Popover = /*#__PURE__*/vue.defineComponent({
  name: 'Popover',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs;
    var buttonId = "headlessui-popover-button-" + useId();
    var panelId = "headlessui-popover-panel-" + useId();
    var popoverState = vue.ref(PopoverStates.Closed);
    var button = vue.ref(null);
    var panel = vue.ref(null);
    var api = {
      popoverState: popoverState,
      buttonId: buttonId,
      panelId: panelId,
      panel: panel,
      button: button,
      togglePopover: function togglePopover() {
        var _match;

        popoverState.value = match(popoverState.value, (_match = {}, _match[PopoverStates.Open] = PopoverStates.Closed, _match[PopoverStates.Closed] = PopoverStates.Open, _match));
      },
      closePopover: function closePopover() {
        if (popoverState.value === PopoverStates.Closed) return;
        popoverState.value = PopoverStates.Closed;
      },
      close: function close(focusableElement) {
        api.closePopover();

        var restoreElement = function () {
          if (!focusableElement) return dom(api.button);
          if (focusableElement instanceof HTMLElement) return focusableElement;
          if (focusableElement.value instanceof HTMLElement) return dom(focusableElement);
          return dom(api.button);
        }();

        restoreElement == null ? void 0 : restoreElement.focus();
      }
    };
    vue.provide(PopoverContext, api);
    useOpenClosedProvider(vue.computed(function () {
      var _match2;

      return match(popoverState.value, (_match2 = {}, _match2[PopoverStates.Open] = State.Open, _match2[PopoverStates.Closed] = State.Closed, _match2));
    }));
    var registerBag = {
      buttonId: buttonId,
      panelId: panelId,
      close: function close() {
        api.closePopover();
      }
    };
    var groupContext = usePopoverGroupContext();
    var registerPopover = groupContext == null ? void 0 : groupContext.registerPopover;

    function isFocusWithinPopoverGroup() {
      var _groupContext$isFocus, _dom, _dom2;

      return (_groupContext$isFocus = groupContext == null ? void 0 : groupContext.isFocusWithinPopoverGroup()) != null ? _groupContext$isFocus : ((_dom = dom(button)) == null ? void 0 : _dom.contains(document.activeElement)) || ((_dom2 = dom(panel)) == null ? void 0 : _dom2.contains(document.activeElement));
    }

    vue.watchEffect(function () {
      return registerPopover == null ? void 0 : registerPopover(registerBag);
    }); // Handle focus out

    useWindowEvent('focus', function () {
      if (popoverState.value !== PopoverStates.Open) return;
      if (isFocusWithinPopoverGroup()) return;
      if (!button) return;
      if (!panel) return;
      api.closePopover();
    }, true); // Handle outside click

    useWindowEvent('mousedown', function (event) {
      var _dom3, _dom4;

      var target = event.target;
      if (popoverState.value !== PopoverStates.Open) return;
      if ((_dom3 = dom(button)) == null ? void 0 : _dom3.contains(target)) return;
      if ((_dom4 = dom(panel)) == null ? void 0 : _dom4.contains(target)) return;
      api.closePopover();

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        var _dom5;

        event.preventDefault();
        (_dom5 = dom(button)) == null ? void 0 : _dom5.focus();
      }
    });
    return function () {
      var slot = {
        open: popoverState.value === PopoverStates.Open,
        close: api.close
      };
      return render({
        props: props,
        slot: slot,
        slots: slots,
        attrs: attrs,
        name: 'Popover'
      });
    };
  }
}); // ---

var PopoverButton = /*#__PURE__*/vue.defineComponent({
  name: 'PopoverButton',
  props: {
    as: {
      type: [Object, String],
      "default": 'button'
    },
    disabled: {
      type: [Boolean],
      "default": false
    }
  },
  render: function render$1() {
    var api = usePopoverContext('PopoverButton');
    var slot = {
      open: api.popoverState.value === PopoverStates.Open
    };
    var propsWeControl = this.isWithinPanel ? {
      ref: 'el',
      type: this.type,
      onKeydown: this.handleKeyDown,
      onClick: this.handleClick
    } : {
      ref: 'el',
      id: api.buttonId,
      type: this.type,
      'aria-expanded': this.$props.disabled ? undefined : api.popoverState.value === PopoverStates.Open,
      'aria-controls': dom(api.panel) ? api.panelId : undefined,
      disabled: this.$props.disabled ? true : undefined,
      onKeydown: this.handleKeyDown,
      onKeyup: this.handleKeyUp,
      onClick: this.handleClick
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'PopoverButton'
    });
  },
  setup: function setup(props, _ref2) {
    var attrs = _ref2.attrs;
    var api = usePopoverContext('PopoverButton');
    var groupContext = usePopoverGroupContext();
    var closeOthers = groupContext == null ? void 0 : groupContext.closeOthers;
    var panelContext = usePopoverPanelContext();
    var isWithinPanel = panelContext === null ? false : panelContext === api.panelId; // TODO: Revisit when handling Tab/Shift+Tab when using Portal's

    var activeElementRef = vue.ref(null);
    var previousActiveElementRef = vue.ref(typeof window === 'undefined' ? null : document.activeElement);
    useWindowEvent('focus', function () {
      previousActiveElementRef.value = activeElementRef.value;
      activeElementRef.value = document.activeElement;
    }, true);
    var elementRef = vue.ref(null);

    if (!isWithinPanel) {
      vue.watchEffect(function () {
        api.button.value = elementRef.value;
      });
    }

    return {
      isWithinPanel: isWithinPanel,
      el: elementRef,
      type: useResolveButtonType(vue.computed(function () {
        return {
          as: props.as,
          type: attrs.type
        };
      }), elementRef),
      handleKeyDown: function handleKeyDown(event) {
        var _dom6, _dom7;

        if (isWithinPanel) {
          if (api.popoverState.value === PopoverStates.Closed) return;

          switch (event.key) {
            case Keys.Space:
            case Keys.Enter:
              event.preventDefault(); // Prevent triggering a *click* event

              event.stopPropagation();
              api.closePopover();
              (_dom6 = dom(api.button)) == null ? void 0 : _dom6.focus(); // Re-focus the original opening Button

              break;
          }
        } else {
          switch (event.key) {
            case Keys.Space:
            case Keys.Enter:
              event.preventDefault(); // Prevent triggering a *click* event

              event.stopPropagation();
              if (api.popoverState.value === PopoverStates.Closed) closeOthers == null ? void 0 : closeOthers(api.buttonId);
              api.togglePopover();
              break;

            case Keys.Escape:
              if (api.popoverState.value !== PopoverStates.Open) return closeOthers == null ? void 0 : closeOthers(api.buttonId);
              if (!dom(api.button)) return;
              if (!((_dom7 = dom(api.button)) == null ? void 0 : _dom7.contains(document.activeElement))) return;
              api.closePopover();
              break;

            case Keys.Tab:
              if (api.popoverState.value !== PopoverStates.Open) return;
              if (!api.panel) return;
              if (!api.button) return; // TODO: Revisit when handling Tab/Shift+Tab when using Portal's

              if (event.shiftKey) {
                var _dom8, _dom9;

                // Check if the last focused element exists, and check that it is not inside button or panel itself
                if (!previousActiveElementRef.value) return;
                if ((_dom8 = dom(api.button)) == null ? void 0 : _dom8.contains(previousActiveElementRef.value)) return;
                if ((_dom9 = dom(api.panel)) == null ? void 0 : _dom9.contains(previousActiveElementRef.value)) return; // Check if the last focused element is *after* the button in the DOM

                var focusableElements = getFocusableElements();
                var previousIdx = focusableElements.indexOf(previousActiveElementRef.value);
                var buttonIdx = focusableElements.indexOf(dom(api.button));
                if (buttonIdx > previousIdx) return;
                event.preventDefault();
                event.stopPropagation();
                focusIn(dom(api.panel), Focus.Last);
              } else {
                event.preventDefault();
                event.stopPropagation();
                focusIn(dom(api.panel), Focus.First);
              }

              break;
          }
        }
      },
      handleKeyUp: function handleKeyUp(event) {
        var _dom10, _dom11;

        if (isWithinPanel) return;

        if (event.key === Keys.Space) {
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault();
        }

        if (api.popoverState.value !== PopoverStates.Open) return;
        if (!api.panel) return;
        if (!api.button) return; // TODO: Revisit when handling Tab/Shift+Tab when using Portal's

        switch (event.key) {
          case Keys.Tab:
            // Check if the last focused element exists, and check that it is not inside button or panel itself
            if (!previousActiveElementRef.value) return;
            if ((_dom10 = dom(api.button)) == null ? void 0 : _dom10.contains(previousActiveElementRef.value)) return;
            if ((_dom11 = dom(api.panel)) == null ? void 0 : _dom11.contains(previousActiveElementRef.value)) return; // Check if the last focused element is *after* the button in the DOM

            var focusableElements = getFocusableElements();
            var previousIdx = focusableElements.indexOf(previousActiveElementRef.value);
            var buttonIdx = focusableElements.indexOf(dom(api.button));
            if (buttonIdx > previousIdx) return;
            event.preventDefault();
            event.stopPropagation();
            focusIn(dom(api.panel), Focus.Last);
            break;
        }
      },
      handleClick: function handleClick() {
        if (props.disabled) return;

        if (isWithinPanel) {
          var _dom12;

          api.closePopover();
          (_dom12 = dom(api.button)) == null ? void 0 : _dom12.focus(); // Re-focus the original opening Button
        } else {
          var _dom13;

          if (api.popoverState.value === PopoverStates.Closed) closeOthers == null ? void 0 : closeOthers(api.buttonId);
          (_dom13 = dom(api.button)) == null ? void 0 : _dom13.focus();
          api.togglePopover();
        }
      }
    };
  }
}); // ---

var PopoverOverlay = /*#__PURE__*/vue.defineComponent({
  name: 'PopoverOverlay',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    }
  },
  render: function render$1() {
    var api = usePopoverContext('PopoverOverlay');
    var slot = {
      open: api.popoverState.value === PopoverStates.Open
    };
    var propsWeControl = {
      id: this.id,
      ref: 'el',
      'aria-hidden': true,
      onClick: this.handleClick
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: this.visible,
      name: 'PopoverOverlay'
    });
  },
  setup: function setup() {
    var api = usePopoverContext('PopoverOverlay');
    var usesOpenClosedState = useOpenClosed();
    var visible = vue.computed(function () {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open;
      }

      return api.popoverState.value === PopoverStates.Open;
    });
    return {
      id: "headlessui-popover-overlay-" + useId(),
      handleClick: function handleClick() {
        api.closePopover();
      },
      visible: visible
    };
  }
}); // ---

var PopoverPanel = /*#__PURE__*/vue.defineComponent({
  name: 'PopoverPanel',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    },
    focus: {
      type: Boolean,
      "default": false
    }
  },
  render: function render$1() {
    var api = usePopoverContext('PopoverPanel');
    var slot = {
      open: api.popoverState.value === PopoverStates.Open,
      close: api.close
    };
    var propsWeControl = {
      ref: 'el',
      id: this.id,
      onKeydown: this.handleKeyDown
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.RenderStrategy | Features.Static,
      visible: this.visible,
      name: 'PopoverPanel'
    });
  },
  setup: function setup(props) {
    var focus = props.focus;
    var api = usePopoverContext('PopoverPanel');
    vue.provide(PopoverPanelContext, api.panelId);
    vue.onUnmounted(function () {
      api.panel.value = null;
    }); // Move focus within panel

    vue.watchEffect(function () {
      var _dom14;

      if (!focus) return;
      if (api.popoverState.value !== PopoverStates.Open) return;
      if (!api.panel) return;
      var activeElement = document.activeElement;
      if ((_dom14 = dom(api.panel)) == null ? void 0 : _dom14.contains(activeElement)) return; // Already focused within Dialog

      focusIn(dom(api.panel), Focus.First);
    }); // Handle Tab / Shift+Tab focus positioning

    useWindowEvent('keydown', function (event) {
      var _dom15;

      if (api.popoverState.value !== PopoverStates.Open) return;
      if (!dom(api.panel)) return;
      if (event.key !== Keys.Tab) return;
      if (!document.activeElement) return;
      if (!((_dom15 = dom(api.panel)) == null ? void 0 : _dom15.contains(document.activeElement))) return; // We will take-over the default tab behaviour so that we have a bit
      // control over what is focused next. It will behave exactly the same,
      // but it will also "fix" some issues based on whether you are using a
      // Portal or not.

      event.preventDefault();
      var result = focusIn(dom(api.panel), event.shiftKey ? Focus.Previous : Focus.Next);

      if (result === FocusResult.Underflow) {
        var _dom16;

        return (_dom16 = dom(api.button)) == null ? void 0 : _dom16.focus();
      } else if (result === FocusResult.Overflow) {
        if (!dom(api.button)) return;
        var elements = getFocusableElements();
        var buttonIdx = elements.indexOf(dom(api.button));
        var nextElements = elements.splice(buttonIdx + 1) // Elements after button
        .filter(function (element) {
          var _dom17;

          return !((_dom17 = dom(api.panel)) == null ? void 0 : _dom17.contains(element));
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
      var _dom18;

      if (!focus) return;
      if (api.popoverState.value !== PopoverStates.Open) return;
      if (!dom(api.panel)) return;
      if ((_dom18 = dom(api.panel)) == null ? void 0 : _dom18.contains(document.activeElement)) return;
      api.closePopover();
    }, true);
    var usesOpenClosedState = useOpenClosed();
    var visible = vue.computed(function () {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open;
      }

      return api.popoverState.value === PopoverStates.Open;
    });
    return {
      id: api.panelId,
      el: api.panel,
      handleKeyDown: function handleKeyDown(event) {
        var _dom19, _dom20;

        switch (event.key) {
          case Keys.Escape:
            if (api.popoverState.value !== PopoverStates.Open) return;
            if (!dom(api.panel)) return;
            if (!((_dom19 = dom(api.panel)) == null ? void 0 : _dom19.contains(document.activeElement))) return;
            event.preventDefault();
            api.closePopover();
            (_dom20 = dom(api.button)) == null ? void 0 : _dom20.focus();
            break;
        }
      },
      visible: visible
    };
  }
}); // ---

var PopoverGroup = /*#__PURE__*/vue.defineComponent({
  name: 'PopoverGroup',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    }
  },
  render: function render$1() {
    var propsWeControl = {
      ref: 'el'
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'PopoverGroup'
    });
  },
  setup: function setup() {
    var groupRef = vue.ref(null);
    var popovers = vue.ref([]);

    function unregisterPopover(registerBag) {
      var idx = popovers.value.indexOf(registerBag);
      if (idx !== -1) popovers.value.splice(idx, 1);
    }

    function registerPopover(registerBag) {
      popovers.value.push(registerBag);
      return function () {
        unregisterPopover(registerBag);
      };
    }

    function isFocusWithinPopoverGroup() {
      var _dom21;

      var element = document.activeElement;
      if ((_dom21 = dom(groupRef)) == null ? void 0 : _dom21.contains(element)) return true; // Check if the focus is in one of the button or panel elements. This is important in case you are rendering inside a Portal.

      return popovers.value.some(function (bag) {
        var _document$getElementB, _document$getElementB2;

        return ((_document$getElementB = document.getElementById(bag.buttonId)) == null ? void 0 : _document$getElementB.contains(element)) || ((_document$getElementB2 = document.getElementById(bag.panelId)) == null ? void 0 : _document$getElementB2.contains(element));
      });
    }

    function closeOthers(buttonId) {
      for (var _iterator = _createForOfIteratorHelperLoose(popovers.value), _step; !(_step = _iterator()).done;) {
        var popover = _step.value;
        if (popover.buttonId !== buttonId) popover.close();
      }
    }

    vue.provide(PopoverGroupContext, {
      registerPopover: registerPopover,
      unregisterPopover: unregisterPopover,
      isFocusWithinPopoverGroup: isFocusWithinPopoverGroup,
      closeOthers: closeOthers
    });
    return {
      el: groupRef
    };
  }
});

var LabelContext = /*#__PURE__*/Symbol('LabelContext');

function useLabelContext() {
  var context = vue.inject(LabelContext, null);

  if (context === null) {
    var err = new Error('You used a <Label /> component, but it is not inside a parent.');
    if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext);
    throw err;
  }

  return context;
}

function useLabels(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$slot = _ref.slot,
      slot = _ref$slot === void 0 ? {} : _ref$slot,
      _ref$name = _ref.name,
      name = _ref$name === void 0 ? 'Label' : _ref$name,
      _ref$props = _ref.props,
      props = _ref$props === void 0 ? {} : _ref$props;

  var labelIds = vue.ref([]);

  function register(value) {
    labelIds.value.push(value);
    return function () {
      var idx = labelIds.value.indexOf(value);
      if (idx === -1) return;
      labelIds.value.splice(idx, 1);
    };
  }

  vue.provide(LabelContext, {
    register: register,
    slot: slot,
    name: name,
    props: props
  }); // The actual id's as string or undefined.

  return vue.computed(function () {
    return labelIds.value.length > 0 ? labelIds.value.join(' ') : undefined;
  });
} // ---

var Label = /*#__PURE__*/vue.defineComponent({
  name: 'Label',
  props: {
    as: {
      type: [Object, String],
      "default": 'label'
    },
    passive: {
      type: [Boolean],
      "default": false
    }
  },
  render: function render$1() {
    var _this$context = this.context,
        _this$context$name = _this$context.name,
        name = _this$context$name === void 0 ? 'Label' : _this$context$name,
        _this$context$slot = _this$context.slot,
        slot = _this$context$slot === void 0 ? {} : _this$context$slot,
        _this$context$props = _this$context.props,
        props = _this$context$props === void 0 ? {} : _this$context$props;

    var _this$$props = this.$props,
        passive = _this$$props.passive,
        passThroughProps = _objectWithoutPropertiesLoose(_this$$props, ["passive"]);

    var propsWeControl = _extends({}, Object.entries(props).reduce(function (acc, _ref2) {
      var _Object$assign;

      var key = _ref2[0],
          value = _ref2[1];
      return Object.assign(acc, (_Object$assign = {}, _Object$assign[key] = vue.unref(value), _Object$assign));
    }, {}), {
      id: this.id
    });

    var allProps = _extends({}, passThroughProps, propsWeControl); // @ts-expect-error props are dynamic via context, some components will
    //                  provide an onClick then we can delete it.


    if (passive) delete allProps['onClick'];
    return render({
      props: allProps,
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: name
    });
  },
  setup: function setup() {
    var context = useLabelContext();
    var id = "headlessui-label-" + useId();
    vue.onMounted(function () {
      return vue.onUnmounted(context.register(id));
    });
    return {
      id: id,
      context: context
    };
  }
});

var RadioGroupContext = /*#__PURE__*/Symbol('RadioGroupContext');

function useRadioGroupContext(component) {
  var context = vue.inject(RadioGroupContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <RadioGroup /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useRadioGroupContext);
    throw err;
  }

  return context;
} // ---


var RadioGroup = /*#__PURE__*/vue.defineComponent({
  name: 'RadioGroup',
  emits: {
    'update:modelValue': function updateModelValue(_value) {
      return true;
    }
  },
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    disabled: {
      type: [Boolean],
      "default": false
    },
    modelValue: {
      type: [Object, String, Number, Boolean]
    }
  },
  render: function render$1() {
    var _this$$props = this.$props,
        passThroughProps = _objectWithoutPropertiesLoose(_this$$props, ["modelValue", "disabled"]);

    var propsWeControl = {
      ref: 'el',
      id: this.id,
      role: 'radiogroup',
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      onKeydown: this.handleKeyDown
    };
    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: {},
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'RadioGroup'
    });
  },
  setup: function setup(props, _ref) {
    var emit = _ref.emit;
    var radioGroupRef = vue.ref(null);
    var options = vue.ref([]);
    var labelledby = useLabels({
      name: 'RadioGroupLabel'
    });
    var describedby = useDescriptions({
      name: 'RadioGroupDescription'
    });
    var value = vue.computed(function () {
      return props.modelValue;
    });
    var api = {
      options: options,
      value: value,
      disabled: vue.computed(function () {
        return props.disabled;
      }),
      firstOption: vue.computed(function () {
        return options.value.find(function (option) {
          if (option.propsRef.disabled) return false;
          return true;
        });
      }),
      containsCheckedOption: vue.computed(function () {
        return options.value.some(function (option) {
          return vue.toRaw(option.propsRef.value) === vue.toRaw(props.modelValue);
        });
      }),
      change: function change(nextValue) {
        var _options$value$find;

        if (props.disabled) return false;
        if (value.value === nextValue) return false;
        var nextOption = (_options$value$find = options.value.find(function (option) {
          return vue.toRaw(option.propsRef.value) === vue.toRaw(nextValue);
        })) == null ? void 0 : _options$value$find.propsRef;
        if (nextOption == null ? void 0 : nextOption.disabled) return false;
        emit('update:modelValue', nextValue);
        return true;
      },
      registerOption: function registerOption(action) {
        var _radioGroupRef$value;

        var orderMap = Array.from((_radioGroupRef$value = radioGroupRef.value) == null ? void 0 : _radioGroupRef$value.querySelectorAll('[id^="headlessui-radiogroup-option-"]')).reduce(function (lookup, element, index) {
          var _Object$assign;

          return Object.assign(lookup, (_Object$assign = {}, _Object$assign[element.id] = index, _Object$assign));
        }, {});
        options.value.push(action);
        options.value.sort(function (a, z) {
          return orderMap[a.id] - orderMap[z.id];
        });
      },
      unregisterOption: function unregisterOption(id) {
        var idx = options.value.findIndex(function (radio) {
          return radio.id === id;
        });
        if (idx === -1) return;
        options.value.splice(idx, 1);
      }
    }; // @ts-expect-error ...

    vue.provide(RadioGroupContext, api);
    useTreeWalker({
      container: vue.computed(function () {
        return dom(radioGroupRef);
      }),
      accept: function accept(node) {
        if (node.getAttribute('role') === 'radio') return NodeFilter.FILTER_REJECT;
        if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
      walk: function walk(node) {
        node.setAttribute('role', 'none');
      }
    });

    function handleKeyDown(event) {
      if (!radioGroupRef.value) return;
      if (!radioGroupRef.value.contains(event.target)) return;
      var all = options.value.filter(function (option) {
        return option.propsRef.disabled === false;
      }).map(function (radio) {
        return radio.element;
      });

      switch (event.key) {
        case Keys.ArrowLeft:
        case Keys.ArrowUp:
          {
            event.preventDefault();
            event.stopPropagation();
            var result = focusIn(all, Focus.Previous | Focus.WrapAround);

            if (result === FocusResult.Success) {
              var activeOption = options.value.find(function (option) {
                return option.element === document.activeElement;
              });
              if (activeOption) api.change(activeOption.propsRef.value);
            }
          }
          break;

        case Keys.ArrowRight:
        case Keys.ArrowDown:
          {
            event.preventDefault();
            event.stopPropagation();

            var _result = focusIn(all, Focus.Next | Focus.WrapAround);

            if (_result === FocusResult.Success) {
              var _activeOption = options.value.find(function (option) {
                return option.element === document.activeElement;
              });

              if (_activeOption) api.change(_activeOption.propsRef.value);
            }
          }
          break;

        case Keys.Space:
          {
            event.preventDefault();
            event.stopPropagation();

            var _activeOption2 = options.value.find(function (option) {
              return option.element === document.activeElement;
            });

            if (_activeOption2) api.change(_activeOption2.propsRef.value);
          }
          break;
      }
    }

    var id = "headlessui-radiogroup-" + useId();
    return {
      id: id,
      labelledby: labelledby,
      describedby: describedby,
      el: radioGroupRef,
      handleKeyDown: handleKeyDown
    };
  }
}); // ---

var OptionState;

(function (OptionState) {
  OptionState[OptionState["Empty"] = 1] = "Empty";
  OptionState[OptionState["Active"] = 2] = "Active";
})(OptionState || (OptionState = {}));

var RadioGroupOption = /*#__PURE__*/vue.defineComponent({
  name: 'RadioGroupOption',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    value: {
      type: [Object, String, Number, Boolean]
    },
    disabled: {
      type: Boolean,
      "default": false
    }
  },
  render: function render$1() {
    var _this$$props2 = this.$props,
        passThroughProps = _objectWithoutPropertiesLoose(_this$$props2, ["value", "disabled"]);

    var slot = {
      checked: this.checked,
      disabled: this.disabled,
      active: Boolean(this.state & OptionState.Active)
    };
    var propsWeControl = {
      id: this.id,
      ref: 'el',
      role: 'radio',
      'aria-checked': this.checked ? 'true' : 'false',
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      'aria-disabled': this.disabled ? true : undefined,
      tabIndex: this.tabIndex,
      onClick: this.disabled ? undefined : this.handleClick,
      onFocus: this.disabled ? undefined : this.handleFocus,
      onBlur: this.disabled ? undefined : this.handleBlur
    };
    return render({
      props: _extends({}, passThroughProps, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'RadioGroupOption'
    });
  },
  setup: function setup(props) {
    var api = useRadioGroupContext('RadioGroupOption');
    var id = "headlessui-radiogroup-option-" + useId();
    var labelledby = useLabels({
      name: 'RadioGroupLabel'
    });
    var describedby = useDescriptions({
      name: 'RadioGroupDescription'
    });
    var optionRef = vue.ref(null);
    var propsRef = vue.computed(function () {
      return {
        value: props.value,
        disabled: props.disabled
      };
    });
    var state = vue.ref(OptionState.Empty);
    vue.onMounted(function () {
      return api.registerOption({
        id: id,
        element: optionRef,
        propsRef: propsRef
      });
    });
    vue.onUnmounted(function () {
      return api.unregisterOption(id);
    });
    var isFirstOption = vue.computed(function () {
      var _api$firstOption$valu;

      return ((_api$firstOption$valu = api.firstOption.value) == null ? void 0 : _api$firstOption$valu.id) === id;
    });
    var disabled = vue.computed(function () {
      return api.disabled.value || props.disabled;
    });
    var checked = vue.computed(function () {
      return vue.toRaw(api.value.value) === vue.toRaw(props.value);
    });
    return {
      id: id,
      el: optionRef,
      labelledby: labelledby,
      describedby: describedby,
      state: state,
      disabled: disabled,
      checked: checked,
      tabIndex: vue.computed(function () {
        if (disabled.value) return -1;
        if (checked.value) return 0;
        if (!api.containsCheckedOption.value && isFirstOption.value) return 0;
        return -1;
      }),
      handleClick: function handleClick() {
        var _optionRef$value;

        if (!api.change(props.value)) return;
        state.value |= OptionState.Active;
        (_optionRef$value = optionRef.value) == null ? void 0 : _optionRef$value.focus();
      },
      handleFocus: function handleFocus() {
        state.value |= OptionState.Active;
      },
      handleBlur: function handleBlur() {
        state.value &= ~OptionState.Active;
      }
    };
  }
}); // ---

var RadioGroupLabel = Label;
var RadioGroupDescription = Description;

var GroupContext = /*#__PURE__*/Symbol('GroupContext'); // ---

var SwitchGroup = /*#__PURE__*/vue.defineComponent({
  name: 'SwitchGroup',
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs;
    var switchRef = vue.ref(null);
    var labelledby = useLabels({
      name: 'SwitchLabel',
      props: {
        onClick: function onClick() {
          if (!switchRef.value) return;
          switchRef.value.click();
          switchRef.value.focus({
            preventScroll: true
          });
        }
      }
    });
    var describedby = useDescriptions({
      name: 'SwitchDescription'
    });
    var api = {
      switchRef: switchRef,
      labelledby: labelledby,
      describedby: describedby
    };
    vue.provide(GroupContext, api);
    return function () {
      return render({
        props: props,
        slot: {},
        slots: slots,
        attrs: attrs,
        name: 'SwitchGroup'
      });
    };
  }
}); // ---

var Switch = /*#__PURE__*/vue.defineComponent({
  name: 'Switch',
  emits: {
    'update:modelValue': function updateModelValue(_value) {
      return true;
    }
  },
  props: {
    as: {
      type: [Object, String],
      "default": 'button'
    },
    modelValue: {
      type: Boolean,
      "default": false
    }
  },
  render: function render$1() {
    var slot = {
      checked: this.$props.modelValue
    };
    var propsWeControl = {
      id: this.id,
      ref: 'el',
      role: 'switch',
      type: this.type,
      tabIndex: 0,
      'aria-checked': this.$props.modelValue,
      'aria-labelledby': this.labelledby,
      'aria-describedby': this.describedby,
      onClick: this.handleClick,
      onKeyup: this.handleKeyUp,
      onKeypress: this.handleKeyPress
    };
    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'Switch'
    });
  },
  setup: function setup(props, _ref2) {
    var emit = _ref2.emit,
        attrs = _ref2.attrs;
    var api = vue.inject(GroupContext, null);
    var id = "headlessui-switch-" + useId();

    function toggle() {
      emit('update:modelValue', !props.modelValue);
    }

    var internalSwitchRef = vue.ref(null);
    var switchRef = api === null ? internalSwitchRef : api.switchRef;
    return {
      id: id,
      el: switchRef,
      type: useResolveButtonType(vue.computed(function () {
        return {
          as: props.as,
          type: attrs.type
        };
      }), switchRef),
      labelledby: api == null ? void 0 : api.labelledby,
      describedby: api == null ? void 0 : api.describedby,
      handleClick: function handleClick(event) {
        event.preventDefault();
        toggle();
      },
      handleKeyUp: function handleKeyUp(event) {
        if (event.key !== Keys.Tab) event.preventDefault();
        if (event.key === Keys.Space) toggle();
      },
      // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
      handleKeyPress: function handleKeyPress(event) {
        event.preventDefault();
      }
    };
  }
}); // ---

var SwitchLabel = Label;
var SwitchDescription = Description;

var TabsContext = /*#__PURE__*/Symbol('TabsContext');

function useTabsContext(component) {
  var context = vue.inject(TabsContext, null);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <TabGroup /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useTabsContext);
    throw err;
  }

  return context;
} // ---


var TabGroup = /*#__PURE__*/vue.defineComponent({
  name: 'TabGroup',
  emits: {
    change: function change(_index) {
      return true;
    }
  },
  props: {
    as: {
      type: [Object, String],
      "default": 'template'
    },
    defaultIndex: {
      type: [Number],
      "default": 0
    },
    vertical: {
      type: [Boolean],
      "default": false
    },
    manual: {
      type: [Boolean],
      "default": false
    }
  },
  setup: function setup(props, _ref) {
    var slots = _ref.slots,
        attrs = _ref.attrs,
        emit = _ref.emit;
    var selectedIndex = vue.ref(null);
    var tabs = vue.ref([]);
    var panels = vue.ref([]);
    var api = {
      selectedIndex: selectedIndex,
      orientation: vue.computed(function () {
        return props.vertical ? 'vertical' : 'horizontal';
      }),
      activation: vue.computed(function () {
        return props.manual ? 'manual' : 'auto';
      }),
      tabs: tabs,
      panels: panels,
      setSelectedIndex: function setSelectedIndex(index) {
        if (selectedIndex.value === index) return;
        selectedIndex.value = index;
        emit('change', index);
      },
      registerTab: function registerTab(tab) {
        if (!tabs.value.includes(tab)) tabs.value.push(tab);
      },
      unregisterTab: function unregisterTab(tab) {
        var idx = tabs.value.indexOf(tab);
        if (idx !== -1) tabs.value.slice(idx, 1);
      },
      registerPanel: function registerPanel(panel) {
        if (!panels.value.includes(panel)) panels.value.push(panel);
      },
      unregisterPanel: function unregisterPanel(panel) {
        var idx = panels.value.indexOf(panel);
        if (idx !== -1) panels.value.slice(idx, 1);
      }
    };
    vue.provide(TabsContext, api);
    vue.onMounted(function () {
      if (api.tabs.value.length <= 0) return console.log('bail');
      if (selectedIndex.value !== null) return console.log('bail 2');
      var tabs = api.tabs.value.map(function (tab) {
        return dom(tab);
      }).filter(Boolean);
      var focusableTabs = tabs.filter(function (tab) {
        return !tab.hasAttribute('disabled');
      }); // Underflow

      if (props.defaultIndex < 0) {
        selectedIndex.value = tabs.indexOf(focusableTabs[0]);
      } // Overflow
      else if (props.defaultIndex > api.tabs.value.length) {
          selectedIndex.value = tabs.indexOf(focusableTabs[focusableTabs.length - 1]);
        } // Middle
        else {
            var before = tabs.slice(0, props.defaultIndex);
            var after = tabs.slice(props.defaultIndex);
            var next = [].concat(after, before).find(function (tab) {
              return focusableTabs.includes(tab);
            });
            if (!next) return;
            selectedIndex.value = tabs.indexOf(next);
          }
    });
    return function () {
      var slot = {
        selectedIndex: selectedIndex.value
      };
      return render({
        props: omit(props, ['defaultIndex', 'manual', 'vertical']),
        slot: slot,
        slots: slots,
        attrs: attrs,
        name: 'TabGroup'
      });
    };
  }
}); // ---

var TabList = /*#__PURE__*/vue.defineComponent({
  name: 'TabList',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    }
  },
  setup: function setup(props, _ref2) {
    var attrs = _ref2.attrs,
        slots = _ref2.slots;
    var api = useTabsContext('TabList');
    return function () {
      var slot = {
        selectedIndex: api.selectedIndex.value
      };
      var propsWeControl = {
        role: 'tablist',
        'aria-orientation': api.orientation.value
      };
      var passThroughProps = props;
      return render({
        props: _extends({}, passThroughProps, propsWeControl),
        slot: slot,
        attrs: attrs,
        slots: slots,
        name: 'TabList'
      });
    };
  }
}); // ---

var Tab = /*#__PURE__*/vue.defineComponent({
  name: 'Tab',
  props: {
    as: {
      type: [Object, String],
      "default": 'button'
    },
    disabled: {
      type: [Boolean],
      "default": false
    }
  },
  render: function render$1() {
    var _api$panels$value$thi, _api$panels$value$thi2;

    var api = useTabsContext('Tab');
    var slot = {
      selected: this.selected
    };
    var propsWeControl = {
      ref: 'el',
      onKeydown: this.handleKeyDown,
      onFocus: api.activation.value === 'manual' ? this.handleFocus : this.handleSelection,
      onClick: this.handleSelection,
      id: this.id,
      role: 'tab',
      type: this.type,
      'aria-controls': (_api$panels$value$thi = api.panels.value[this.myIndex]) == null ? void 0 : (_api$panels$value$thi2 = _api$panels$value$thi.value) == null ? void 0 : _api$panels$value$thi2.id,
      'aria-selected': this.selected,
      tabIndex: this.selected ? 0 : -1,
      disabled: this.$props.disabled ? true : undefined
    };

    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      name: 'Tab'
    });
  },
  setup: function setup(props, _ref3) {
    var attrs = _ref3.attrs;
    var api = useTabsContext('Tab');
    var id = "headlessui-tabs-tab-" + useId();
    var tabRef = vue.ref();
    vue.onMounted(function () {
      return api.registerTab(tabRef);
    });
    vue.onUnmounted(function () {
      return api.unregisterTab(tabRef);
    });
    var myIndex = vue.computed(function () {
      return api.tabs.value.indexOf(tabRef);
    });
    var selected = vue.computed(function () {
      return myIndex.value === api.selectedIndex.value;
    });
    var type = vue.computed(function () {
      var _attrs$type;

      return (_attrs$type = attrs.type) != null ? _attrs$type : props.as === 'button' ? 'button' : undefined;
    });

    function handleKeyDown(event) {
      var list = api.tabs.value.map(function (tab) {
        return dom(tab);
      }).filter(Boolean);

      if (event.key === Keys.Space || event.key === Keys.Enter) {
        event.preventDefault();
        event.stopPropagation();
        api.setSelectedIndex(myIndex.value);
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

      return match(api.orientation.value, {
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
    }

    function handleFocus() {
      var _dom;

      (_dom = dom(tabRef)) == null ? void 0 : _dom.focus();
    }

    function handleSelection() {
      var _dom2;

      if (props.disabled) return;
      (_dom2 = dom(tabRef)) == null ? void 0 : _dom2.focus();
      api.setSelectedIndex(myIndex.value);
    }

    return {
      el: tabRef,
      id: id,
      selected: selected,
      myIndex: myIndex,
      type: type,
      handleKeyDown: handleKeyDown,
      handleFocus: handleFocus,
      handleSelection: handleSelection
    };
  }
}); // ---

var TabPanels = /*#__PURE__*/vue.defineComponent({
  name: 'TabPanels',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    }
  },
  setup: function setup(props, _ref4) {
    var slots = _ref4.slots,
        attrs = _ref4.attrs;
    var api = useTabsContext('TabPanels');
    return function () {
      var slot = {
        selectedIndex: api.selectedIndex.value
      };
      return render({
        props: props,
        slot: slot,
        attrs: attrs,
        slots: slots,
        name: 'TabPanels'
      });
    };
  }
});
var TabPanel = /*#__PURE__*/vue.defineComponent({
  name: 'TabPanel',
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    "static": {
      type: Boolean,
      "default": false
    },
    unmount: {
      type: Boolean,
      "default": true
    }
  },
  render: function render$1() {
    var _api$tabs$value$this$, _api$tabs$value$this$2;

    var api = useTabsContext('TabPanel');
    var slot = {
      selected: this.selected
    };
    var propsWeControl = {
      ref: 'el',
      id: this.id,
      role: 'tabpanel',
      'aria-labelledby': (_api$tabs$value$this$ = api.tabs.value[this.myIndex]) == null ? void 0 : (_api$tabs$value$this$2 = _api$tabs$value$this$.value) == null ? void 0 : _api$tabs$value$this$2.id,
      tabIndex: this.selected ? 0 : -1
    };

    return render({
      props: _extends({}, this.$props, propsWeControl),
      slot: slot,
      attrs: this.$attrs,
      slots: this.$slots,
      features: Features.Static | Features.RenderStrategy,
      visible: this.selected,
      name: 'TabPanel'
    });
  },
  setup: function setup() {
    var api = useTabsContext('TabPanel');
    var id = "headlessui-tabs-panel-" + useId();
    var panelRef = vue.ref();
    vue.onMounted(function () {
      return api.registerPanel(panelRef);
    });
    vue.onUnmounted(function () {
      return api.unregisterPanel(panelRef);
    });
    var myIndex = vue.computed(function () {
      return api.panels.value.indexOf(panelRef);
    });
    var selected = vue.computed(function () {
      return myIndex.value === api.selectedIndex.value;
    });
    return {
      id: id,
      el: panelRef,
      selected: selected,
      myIndex: myIndex
    };
  }
});

function once(cb) {
  var state = {
    called: false
  };
  return function () {
    if (state.called) return;
    state.called = true;
    return cb.apply(void 0, arguments);
  };
}

function disposables() {
  var disposables = [];
  var api = {
    requestAnimationFrame: function (_requestAnimationFrame) {
      function requestAnimationFrame() {
        return _requestAnimationFrame.apply(this, arguments);
      }

      requestAnimationFrame.toString = function () {
        return _requestAnimationFrame.toString();
      };

      return requestAnimationFrame;
    }(function () {
      var raf = requestAnimationFrame.apply(void 0, arguments);
      api.add(function () {
        return cancelAnimationFrame(raf);
      });
    }),
    nextFrame: function nextFrame() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      api.requestAnimationFrame(function () {
        api.requestAnimationFrame.apply(api, args);
      });
    },
    setTimeout: function (_setTimeout) {
      function setTimeout() {
        return _setTimeout.apply(this, arguments);
      }

      setTimeout.toString = function () {
        return _setTimeout.toString();
      };

      return setTimeout;
    }(function () {
      var timer = setTimeout.apply(void 0, arguments);
      api.add(function () {
        return clearTimeout(timer);
      });
    }),
    add: function add(cb) {
      disposables.push(cb);
    },
    dispose: function dispose() {
      for (var _iterator = _createForOfIteratorHelperLoose(disposables.splice(0)), _step; !(_step = _iterator()).done;) {
        var dispose = _step.value;
        dispose();
      }
    }
  };
  return api;
}

function addClasses(node) {
  var _node$classList;

  for (var _len = arguments.length, classes = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    classes[_key - 1] = arguments[_key];
  }

  node && classes.length > 0 && (_node$classList = node.classList).add.apply(_node$classList, classes);
}

function removeClasses(node) {
  var _node$classList2;

  for (var _len2 = arguments.length, classes = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    classes[_key2 - 1] = arguments[_key2];
  }

  node && classes.length > 0 && (_node$classList2 = node.classList).remove.apply(_node$classList2, classes);
}

var Reason;

(function (Reason) {
  Reason["Finished"] = "finished";
  Reason["Cancelled"] = "cancelled";
})(Reason || (Reason = {}));

function waitForTransition(node, done) {
  var d = disposables();
  if (!node) return d.dispose; // Safari returns a comma separated list of values, so let's sort them and take the highest value.

  var _getComputedStyle = getComputedStyle(node),
      transitionDuration = _getComputedStyle.transitionDuration,
      transitionDelay = _getComputedStyle.transitionDelay;

  var _map = [transitionDuration, transitionDelay].map(function (value) {
    var _value$split$filter$m = value.split(',') // Remove falseys we can't work with
    .filter(Boolean) // Values are returned as `0.3s` or `75ms`
    .map(function (v) {
      return v.includes('ms') ? parseFloat(v) : parseFloat(v) * 1000;
    }).sort(function (a, z) {
      return z - a;
    }),
        _value$split$filter$m2 = _value$split$filter$m[0],
        resolvedValue = _value$split$filter$m2 === void 0 ? 0 : _value$split$filter$m2;

    return resolvedValue;
  }),
      durationMs = _map[0],
      delaysMs = _map[1]; // Waiting for the transition to end. We could use the `transitionend` event, however when no
  // actual transition/duration is defined then the `transitionend` event is not fired.
  //
  // TODO: Downside is, when you slow down transitions via devtools this timeout is still using the
  // full 100% speed instead of the 25% or 10%.


  if (durationMs !== 0) {
    d.setTimeout(function () {
      return done(Reason.Finished);
    }, durationMs + delaysMs);
  } else {
    // No transition is happening, so we should cleanup already. Otherwise we have to wait until we
    // get disposed.
    done(Reason.Finished);
  } // If we get disposed before the timeout runs we should cleanup anyway


  d.add(function () {
    return done(Reason.Cancelled);
  });
  return d.dispose;
}

function transition(node, base, from, to, entered, done) {
  var d = disposables();

  var _done = done !== undefined ? once(done) : function () {};

  removeClasses.apply(void 0, [node].concat(entered));
  addClasses.apply(void 0, [node].concat(base, from));
  d.nextFrame(function () {
    removeClasses.apply(void 0, [node].concat(from));
    addClasses.apply(void 0, [node].concat(to));
    d.add(waitForTransition(node, function (reason) {
      removeClasses.apply(void 0, [node].concat(to, base));
      addClasses.apply(void 0, [node].concat(entered));
      return _done(reason);
    }));
  }); // Once we get disposed, we should ensure that we cleanup after ourselves. In case of an unmount,
  // the node itself will be nullified and will be a no-op. In case of a full transition the classes
  // are already removed which is also a no-op. However if you go from enter -> leave mid-transition
  // then we have some leftovers that should be cleaned.

  d.add(function () {
    return removeClasses.apply(void 0, [node].concat(base, from, to, entered));
  }); // When we get disposed early, than we should also call the done method but switch the reason.

  d.add(function () {
    return _done(Reason.Cancelled);
  });
  return d.dispose;
}

function splitClasses(classes) {
  if (classes === void 0) {
    classes = '';
  }

  return classes.split(' ').filter(function (className) {
    return className.trim().length > 1;
  });
}

var TransitionContext = /*#__PURE__*/Symbol('TransitionContext');
var TreeStates;

(function (TreeStates) {
  TreeStates["Visible"] = "visible";
  TreeStates["Hidden"] = "hidden";
})(TreeStates || (TreeStates = {}));

function hasTransitionContext() {
  return vue.inject(TransitionContext, null) !== null;
}

function useTransitionContext() {
  var context = vue.inject(TransitionContext, null);

  if (context === null) {
    throw new Error('A <TransitionChild /> is used but it is missing a parent <TransitionRoot />.');
  }

  return context;
}

function useParentNesting() {
  var context = vue.inject(NestingContext, null);

  if (context === null) {
    throw new Error('A <TransitionChild /> is used but it is missing a parent <TransitionRoot />.');
  }

  return context;
}

var NestingContext = /*#__PURE__*/Symbol('NestingContext');

function hasChildren(bag) {
  if ('children' in bag) return hasChildren(bag.children);
  return bag.value.filter(function (_ref) {
    var state = _ref.state;
    return state === TreeStates.Visible;
  }).length > 0;
}

function useNesting(done) {
  var transitionableChildren = vue.ref([]);
  var mounted = vue.ref(false);
  vue.onMounted(function () {
    return mounted.value = true;
  });
  vue.onUnmounted(function () {
    return mounted.value = false;
  });

  function unregister(childId, strategy) {
    var _match;

    if (strategy === void 0) {
      strategy = RenderStrategy.Hidden;
    }

    var idx = transitionableChildren.value.findIndex(function (_ref2) {
      var id = _ref2.id;
      return id === childId;
    });
    if (idx === -1) return;
    match(strategy, (_match = {}, _match[RenderStrategy.Unmount] = function () {
      transitionableChildren.value.splice(idx, 1);
    }, _match[RenderStrategy.Hidden] = function () {
      transitionableChildren.value[idx].state = TreeStates.Hidden;
    }, _match));

    if (!hasChildren(transitionableChildren) && mounted.value) {
      done == null ? void 0 : done();
    }
  }

  function register(childId) {
    var child = transitionableChildren.value.find(function (_ref3) {
      var id = _ref3.id;
      return id === childId;
    });

    if (!child) {
      transitionableChildren.value.push({
        id: childId,
        state: TreeStates.Visible
      });
    } else if (child.state !== TreeStates.Visible) {
      child.state = TreeStates.Visible;
    }

    return function () {
      return unregister(childId, RenderStrategy.Unmount);
    };
  }

  return {
    children: transitionableChildren,
    register: register,
    unregister: unregister
  };
} // ---


var TransitionChildRenderFeatures = Features.RenderStrategy;
var TransitionChild = /*#__PURE__*/vue.defineComponent({
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    show: {
      type: [Boolean],
      "default": null
    },
    unmount: {
      type: [Boolean],
      "default": true
    },
    appear: {
      type: [Boolean],
      "default": false
    },
    enter: {
      type: [String],
      "default": ''
    },
    enterFrom: {
      type: [String],
      "default": ''
    },
    enterTo: {
      type: [String],
      "default": ''
    },
    entered: {
      type: [String],
      "default": ''
    },
    leave: {
      type: [String],
      "default": ''
    },
    leaveFrom: {
      type: [String],
      "default": ''
    },
    leaveTo: {
      type: [String],
      "default": ''
    }
  },
  emits: {
    beforeEnter: function beforeEnter() {
      return true;
    },
    afterEnter: function afterEnter() {
      return true;
    },
    beforeLeave: function beforeLeave() {
      return true;
    },
    afterLeave: function afterLeave() {
      return true;
    }
  },
  render: function render$1() {
    var _this = this;

    if (this.renderAsRoot) {
      return vue.h(TransitionRoot, _extends({}, this.$props, {
        onBeforeEnter: function onBeforeEnter() {
          return _this.$emit('beforeEnter');
        },
        onAfterEnter: function onAfterEnter() {
          return _this.$emit('afterEnter');
        },
        onBeforeLeave: function onBeforeLeave() {
          return _this.$emit('beforeLeave');
        },
        onAfterLeave: function onAfterLeave() {
          return _this.$emit('afterLeave');
        }
      }), this.$slots);
    }

    var _this$$props = this.$props,
        rest = _objectWithoutPropertiesLoose(_this$$props, ["appear", "show", "enter", "enterFrom", "enterTo", "entered", "leave", "leaveFrom", "leaveTo"]);

    var propsWeControl = {
      ref: 'el'
    };
    var passthroughProps = rest;
    return render({
      props: _extends({}, passthroughProps, propsWeControl),
      slot: {},
      slots: this.$slots,
      attrs: this.$attrs,
      features: TransitionChildRenderFeatures,
      visible: this.state === TreeStates.Visible,
      name: 'TransitionChild'
    });
  },
  setup: function setup(props, _ref4) {
    var emit = _ref4.emit;

    if (!hasTransitionContext() && hasOpenClosed()) {
      return {
        renderAsRoot: true
      };
    }

    var container = vue.ref(null);
    var state = vue.ref(TreeStates.Visible);
    var strategy = vue.computed(function () {
      return props.unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden;
    });

    var _useTransitionContext = useTransitionContext(),
        show = _useTransitionContext.show,
        appear = _useTransitionContext.appear;

    var _useParentNesting = useParentNesting(),
        register = _useParentNesting.register,
        unregister = _useParentNesting.unregister;

    var initial = {
      value: true
    };
    var id = useId();
    var isTransitioning = {
      value: false
    };
    var nesting = useNesting(function () {
      // When all children have been unmounted we can only hide ourselves if and only if we are not
      // transitioning ourselves. Otherwise we would unmount before the transitions are finished.
      if (!isTransitioning.value) {
        state.value = TreeStates.Hidden;
        unregister(id);
        emit('afterLeave');
      }
    });
    vue.onMounted(function () {
      var unregister = register(id);
      vue.onUnmounted(unregister);
    });
    vue.watchEffect(function () {
      var _match2;

      // If we are in another mode than the Hidden mode then ignore
      if (strategy.value !== RenderStrategy.Hidden) return;
      if (!id) return; // Make sure that we are visible

      if (show && state.value !== TreeStates.Visible) {
        state.value = TreeStates.Visible;
        return;
      }

      match(state.value, (_match2 = {}, _match2[TreeStates.Hidden] = function () {
        return unregister(id);
      }, _match2[TreeStates.Visible] = function () {
        return register(id);
      }, _match2));
    });
    var enterClasses = splitClasses(props.enter);
    var enterFromClasses = splitClasses(props.enterFrom);
    var enterToClasses = splitClasses(props.enterTo);
    var enteredClasses = splitClasses(props.entered);
    var leaveClasses = splitClasses(props.leave);
    var leaveFromClasses = splitClasses(props.leaveFrom);
    var leaveToClasses = splitClasses(props.leaveTo);
    vue.onMounted(function () {
      vue.watchEffect(function () {
        if (state.value === TreeStates.Visible) {
          var domElement = dom(container); // When you return `null` from a component, the actual DOM reference will
          // be an empty comment... This means that we can never check for the DOM
          // node to be `null`. So instead we check for an empty comment.

          var isEmptyDOMNode = domElement instanceof Comment && domElement.data === '';

          if (isEmptyDOMNode) {
            throw new Error('Did you forget to passthrough the `ref` to the actual DOM node?');
          }
        }
      });
    });

    function executeTransition(onInvalidate) {
      // Skipping initial transition
      var skip = initial.value && !appear.value;
      var node = dom(container);
      if (!node || !(node instanceof HTMLElement)) return;
      if (skip) return;
      isTransitioning.value = true;
      if (show.value) emit('beforeEnter');
      if (!show.value) emit('beforeLeave');
      onInvalidate(show.value ? transition(node, enterClasses, enterFromClasses, enterToClasses, enteredClasses, function (reason) {
        isTransitioning.value = false;
        if (reason === Reason.Finished) emit('afterEnter');
      }) : transition(node, leaveClasses, leaveFromClasses, leaveToClasses, enteredClasses, function (reason) {
        isTransitioning.value = false;
        if (reason !== Reason.Finished) return; // When we don't have children anymore we can safely unregister from the parent and hide
        // ourselves.

        if (!hasChildren(nesting)) {
          state.value = TreeStates.Hidden;
          unregister(id);
          emit('afterLeave');
        }
      }));
    }

    vue.onMounted(function () {
      vue.watch([show, appear], function (_oldValues, _newValues, onInvalidate) {
        executeTransition(onInvalidate);
        initial.value = false;
      }, {
        immediate: true
      });
    });
    vue.provide(NestingContext, nesting);
    useOpenClosedProvider(vue.computed(function () {
      var _match3;

      return match(state.value, (_match3 = {}, _match3[TreeStates.Visible] = State.Open, _match3[TreeStates.Hidden] = State.Closed, _match3));
    }));
    return {
      el: container,
      renderAsRoot: false,
      state: state
    };
  }
}); // ---

var TransitionRoot = /*#__PURE__*/vue.defineComponent({
  inheritAttrs: false,
  props: {
    as: {
      type: [Object, String],
      "default": 'div'
    },
    show: {
      type: [Boolean],
      "default": null
    },
    unmount: {
      type: [Boolean],
      "default": true
    },
    appear: {
      type: [Boolean],
      "default": false
    },
    enter: {
      type: [String],
      "default": ''
    },
    enterFrom: {
      type: [String],
      "default": ''
    },
    enterTo: {
      type: [String],
      "default": ''
    },
    entered: {
      type: [String],
      "default": ''
    },
    leave: {
      type: [String],
      "default": ''
    },
    leaveFrom: {
      type: [String],
      "default": ''
    },
    leaveTo: {
      type: [String],
      "default": ''
    }
  },
  emits: {
    beforeEnter: function beforeEnter() {
      return true;
    },
    afterEnter: function afterEnter() {
      return true;
    },
    beforeLeave: function beforeLeave() {
      return true;
    },
    afterLeave: function afterLeave() {
      return true;
    }
  },
  render: function render$1() {
    var _this2 = this;

    var _this$$props2 = this.$props,
        unmount = _this$$props2.unmount,
        passThroughProps = _objectWithoutPropertiesLoose(_this$$props2, ["show", "appear", "unmount"]);

    var sharedProps = {
      unmount: unmount
    };
    return render({
      props: _extends({}, sharedProps, {
        as: 'template'
      }),
      slot: {},
      slots: _extends({}, this.$slots, {
        "default": function _default() {
          return [vue.h(TransitionChild, _extends({
            onBeforeEnter: function onBeforeEnter() {
              return _this2.$emit('beforeEnter');
            },
            onAfterEnter: function onAfterEnter() {
              return _this2.$emit('afterEnter');
            },
            onBeforeLeave: function onBeforeLeave() {
              return _this2.$emit('beforeLeave');
            },
            onAfterLeave: function onAfterLeave() {
              return _this2.$emit('afterLeave');
            }
          }, _this2.$attrs, sharedProps, passThroughProps), _this2.$slots["default"])];
        }
      }),
      attrs: {},
      features: TransitionChildRenderFeatures,
      visible: this.state === TreeStates.Visible,
      name: 'Transition'
    });
  },
  setup: function setup(props) {
    var usesOpenClosedState = useOpenClosed();
    var show = vue.computed(function () {
      if (props.show === null && usesOpenClosedState !== null) {
        var _match4;

        return match(usesOpenClosedState.value, (_match4 = {}, _match4[State.Open] = true, _match4[State.Closed] = false, _match4));
      }

      return props.show;
    });
    vue.watchEffect(function () {
      if (![true, false].includes(show.value)) {
        throw new Error('A <Transition /> is used but it is missing a `:show="true | false"` prop.');
      }
    });
    var state = vue.ref(show.value ? TreeStates.Visible : TreeStates.Hidden);
    var nestingBag = useNesting(function () {
      state.value = TreeStates.Hidden;
    });
    var initial = {
      value: true
    };
    var transitionBag = {
      show: show,
      appear: vue.computed(function () {
        return props.appear || !initial.value;
      })
    };
    vue.onMounted(function () {
      vue.watchEffect(function () {
        initial.value = false;

        if (show.value) {
          state.value = TreeStates.Visible;
        } else if (!hasChildren(nestingBag)) {
          state.value = TreeStates.Hidden;
        }
      });
    });
    vue.provide(NestingContext, nestingBag);
    vue.provide(TransitionContext, transitionBag);
    return {
      state: state,
      show: show
    };
  }
});

exports.Dialog = Dialog;
exports.DialogDescription = DialogDescription;
exports.DialogOverlay = DialogOverlay;
exports.DialogTitle = DialogTitle;
exports.Disclosure = Disclosure;
exports.DisclosureButton = DisclosureButton;
exports.DisclosurePanel = DisclosurePanel;
exports.FocusTrap = FocusTrap;
exports.Listbox = Listbox;
exports.ListboxButton = ListboxButton;
exports.ListboxLabel = ListboxLabel;
exports.ListboxOption = ListboxOption;
exports.ListboxOptions = ListboxOptions;
exports.Menu = Menu;
exports.MenuButton = MenuButton;
exports.MenuItem = MenuItem;
exports.MenuItems = MenuItems;
exports.Popover = Popover;
exports.PopoverButton = PopoverButton;
exports.PopoverGroup = PopoverGroup;
exports.PopoverOverlay = PopoverOverlay;
exports.PopoverPanel = PopoverPanel;
exports.Portal = Portal;
exports.PortalGroup = PortalGroup;
exports.RadioGroup = RadioGroup;
exports.RadioGroupDescription = RadioGroupDescription;
exports.RadioGroupLabel = RadioGroupLabel;
exports.RadioGroupOption = RadioGroupOption;
exports.Switch = Switch;
exports.SwitchDescription = SwitchDescription;
exports.SwitchGroup = SwitchGroup;
exports.SwitchLabel = SwitchLabel;
exports.Tab = Tab;
exports.TabGroup = TabGroup;
exports.TabList = TabList;
exports.TabPanel = TabPanel;
exports.TabPanels = TabPanels;
exports.TransitionChild = TransitionChild;
exports.TransitionRoot = TransitionRoot;
//# sourceMappingURL=headlessui.cjs.development.js.map
