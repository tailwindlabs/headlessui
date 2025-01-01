"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Button: () => Button,
  Checkbox: () => Checkbox,
  CloseButton: () => CloseButton,
  Combobox: () => Combobox,
  ComboboxButton: () => ComboboxButton,
  ComboboxInput: () => ComboboxInput,
  ComboboxLabel: () => ComboboxLabel,
  ComboboxOption: () => ComboboxOption,
  ComboboxOptions: () => ComboboxOptions,
  DataInteractive: () => DataInteractive,
  Description: () => Description,
  Dialog: () => Dialog,
  DialogBackdrop: () => DialogBackdrop,
  DialogDescription: () => DialogDescription,
  DialogPanel: () => DialogPanel,
  DialogTitle: () => DialogTitle,
  Disclosure: () => Disclosure,
  DisclosureButton: () => DisclosureButton,
  DisclosurePanel: () => DisclosurePanel,
  Field: () => Field,
  Fieldset: () => Fieldset,
  FocusTrap: () => FocusTrap,
  FocusTrapFeatures: () => FocusTrapFeatures,
  Input: () => Input,
  Label: () => Label,
  Legend: () => Legend,
  Listbox: () => Listbox,
  ListboxButton: () => ListboxButton,
  ListboxLabel: () => ListboxLabel,
  ListboxOption: () => ListboxOption,
  ListboxOptions: () => ListboxOptions,
  ListboxSelectedOption: () => ListboxSelectedOption,
  Menu: () => Menu,
  MenuButton: () => MenuButton,
  MenuHeading: () => MenuHeading,
  MenuItem: () => MenuItem,
  MenuItems: () => MenuItems,
  MenuSection: () => MenuSection,
  MenuSeparator: () => MenuSeparator,
  Popover: () => Popover,
  PopoverBackdrop: () => PopoverBackdrop,
  PopoverButton: () => PopoverButton,
  PopoverGroup: () => PopoverGroup,
  PopoverOverlay: () => PopoverOverlay,
  PopoverPanel: () => PopoverPanel,
  Portal: () => Portal,
  Radio: () => Radio,
  RadioGroup: () => RadioGroup,
  RadioGroupDescription: () => RadioGroupDescription,
  RadioGroupLabel: () => RadioGroupLabel,
  RadioGroupOption: () => RadioGroupOption,
  Select: () => Select,
  Switch: () => Switch,
  SwitchDescription: () => SwitchDescription,
  SwitchGroup: () => SwitchGroup,
  SwitchLabel: () => SwitchLabel,
  Tab: () => Tab,
  TabGroup: () => TabGroup,
  TabList: () => TabList,
  TabPanel: () => TabPanel,
  TabPanels: () => TabPanels,
  Textarea: () => Textarea,
  Transition: () => Transition,
  TransitionChild: () => TransitionChild,
  useClose: () => useClose
});
module.exports = __toCommonJS(src_exports);

// ../../node_modules/@react-aria/utils/dist/useLayoutEffect.mjs
var import_react = __toESM(require("react"), 1);
var $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c = typeof document !== "undefined" ? (0, import_react.default).useLayoutEffect : () => {
};

// ../../node_modules/@react-aria/utils/dist/useEffectEvent.mjs
var import_react2 = require("react");
function $8ae05eaa5c114e9c$export$7f54fc3180508a52(fn) {
  const ref = (0, import_react2.useRef)(null);
  (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(() => {
    ref.current = fn;
  }, [
    fn
  ]);
  return (0, import_react2.useCallback)((...args) => {
    const f = ref.current;
    return f === null || f === void 0 ? void 0 : f(...args);
  }, []);
}

// ../../node_modules/@react-aria/utils/dist/domHelpers.mjs
var $431fbd86ca7dc216$export$b204af158042fbac = (el) => {
  var _el_ownerDocument;
  return (_el_ownerDocument = el === null || el === void 0 ? void 0 : el.ownerDocument) !== null && _el_ownerDocument !== void 0 ? _el_ownerDocument : document;
};
var $431fbd86ca7dc216$export$f21a1ffae260145a = (el) => {
  if (el && "window" in el && el.window === el)
    return el;
  const doc = $431fbd86ca7dc216$export$b204af158042fbac(el);
  return doc.defaultView || window;
};

// ../../node_modules/@react-aria/utils/dist/platform.mjs
function $c87311424ea30a05$var$testUserAgent(re) {
  var _window_navigator_userAgentData;
  if (typeof window === "undefined" || window.navigator == null)
    return false;
  return ((_window_navigator_userAgentData = window.navigator["userAgentData"]) === null || _window_navigator_userAgentData === void 0 ? void 0 : _window_navigator_userAgentData.brands.some((brand) => re.test(brand.brand))) || re.test(window.navigator.userAgent);
}
function $c87311424ea30a05$var$testPlatform(re) {
  var _window_navigator_userAgentData;
  return typeof window !== "undefined" && window.navigator != null ? re.test(((_window_navigator_userAgentData = window.navigator["userAgentData"]) === null || _window_navigator_userAgentData === void 0 ? void 0 : _window_navigator_userAgentData.platform) || window.navigator.platform) : false;
}
function $c87311424ea30a05$var$cached(fn) {
  let res = null;
  return () => {
    if (res == null)
      res = fn();
    return res;
  };
}
var $c87311424ea30a05$export$9ac100e40613ea10 = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testPlatform(/^Mac/i);
});
var $c87311424ea30a05$export$186c6964ca17d99 = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testPlatform(/^iPhone/i);
});
var $c87311424ea30a05$export$7bef049ce92e4224 = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testPlatform(/^iPad/i) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
  $c87311424ea30a05$export$9ac100e40613ea10() && navigator.maxTouchPoints > 1;
});
var $c87311424ea30a05$export$fedb369cb70207f1 = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$export$186c6964ca17d99() || $c87311424ea30a05$export$7bef049ce92e4224();
});
var $c87311424ea30a05$export$e1865c3bedcd822b = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$export$9ac100e40613ea10() || $c87311424ea30a05$export$fedb369cb70207f1();
});
var $c87311424ea30a05$export$78551043582a6a98 = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testUserAgent(/AppleWebKit/i) && !$c87311424ea30a05$export$6446a186d09e379e();
});
var $c87311424ea30a05$export$6446a186d09e379e = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testUserAgent(/Chrome/i);
});
var $c87311424ea30a05$export$a11b0059900ceec8 = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testUserAgent(/Android/i);
});
var $c87311424ea30a05$export$b7d78993b74f766d = $c87311424ea30a05$var$cached(function() {
  return $c87311424ea30a05$var$testUserAgent(/Firefox/i);
});

// ../../node_modules/@react-aria/utils/dist/isVirtualEvent.mjs
function $6a7db85432448f7f$export$60278871457622de(event) {
  if (event.mozInputSource === 0 && event.isTrusted)
    return true;
  if ((0, $c87311424ea30a05$export$a11b0059900ceec8)() && event.pointerType)
    return event.type === "click" && event.buttons === 1;
  return event.detail === 0 && !event.pointerType;
}

// ../../node_modules/@react-aria/interactions/dist/utils.mjs
var import_react3 = require("react");
var $8a9cb279dc87e130$export$905e7fc544a71f36 = class {
  isDefaultPrevented() {
    return this.nativeEvent.defaultPrevented;
  }
  preventDefault() {
    this.defaultPrevented = true;
    this.nativeEvent.preventDefault();
  }
  stopPropagation() {
    this.nativeEvent.stopPropagation();
    this.isPropagationStopped = () => true;
  }
  isPropagationStopped() {
    return false;
  }
  persist() {
  }
  constructor(type, nativeEvent) {
    this.nativeEvent = nativeEvent;
    this.target = nativeEvent.target;
    this.currentTarget = nativeEvent.currentTarget;
    this.relatedTarget = nativeEvent.relatedTarget;
    this.bubbles = nativeEvent.bubbles;
    this.cancelable = nativeEvent.cancelable;
    this.defaultPrevented = nativeEvent.defaultPrevented;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.timeStamp = nativeEvent.timeStamp;
    this.type = type;
  }
};
function $8a9cb279dc87e130$export$715c682d09d639cc(onBlur) {
  let stateRef = (0, import_react3.useRef)({
    isFocused: false,
    observer: null
  });
  (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(() => {
    const state = stateRef.current;
    return () => {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
    };
  }, []);
  let dispatchBlur = (0, $8ae05eaa5c114e9c$export$7f54fc3180508a52)((e) => {
    onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
  });
  return (0, import_react3.useCallback)((e) => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
      stateRef.current.isFocused = true;
      let target = e.target;
      let onBlurHandler = (e2) => {
        stateRef.current.isFocused = false;
        if (target.disabled)
          dispatchBlur(new $8a9cb279dc87e130$export$905e7fc544a71f36("blur", e2));
        if (stateRef.current.observer) {
          stateRef.current.observer.disconnect();
          stateRef.current.observer = null;
        }
      };
      target.addEventListener("focusout", onBlurHandler, {
        once: true
      });
      stateRef.current.observer = new MutationObserver(() => {
        if (stateRef.current.isFocused && target.disabled) {
          var _stateRef_current_observer;
          (_stateRef_current_observer = stateRef.current.observer) === null || _stateRef_current_observer === void 0 ? void 0 : _stateRef_current_observer.disconnect();
          let relatedTargetEl = target === document.activeElement ? null : document.activeElement;
          target.dispatchEvent(new FocusEvent("blur", {
            relatedTarget: relatedTargetEl
          }));
          target.dispatchEvent(new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: relatedTargetEl
          }));
        }
      });
      stateRef.current.observer.observe(target, {
        attributes: true,
        attributeFilter: [
          "disabled"
        ]
      });
    }
  }, [
    dispatchBlur
  ]);
}

// ../../node_modules/@react-aria/interactions/dist/useFocus.mjs
var import_react4 = require("react");
function $a1ea59d68270f0dd$export$f8168d8dd8fd66e6(props) {
  let { isDisabled, onFocus: onFocusProp, onBlur: onBlurProp, onFocusChange } = props;
  const onBlur = (0, import_react4.useCallback)((e) => {
    if (e.target === e.currentTarget) {
      if (onBlurProp)
        onBlurProp(e);
      if (onFocusChange)
        onFocusChange(false);
      return true;
    }
  }, [
    onBlurProp,
    onFocusChange
  ]);
  const onSyntheticFocus = (0, $8a9cb279dc87e130$export$715c682d09d639cc)(onBlur);
  const onFocus = (0, import_react4.useCallback)((e) => {
    const ownerDocument = (0, $431fbd86ca7dc216$export$b204af158042fbac)(e.target);
    if (e.target === e.currentTarget && ownerDocument.activeElement === e.target) {
      if (onFocusProp)
        onFocusProp(e);
      if (onFocusChange)
        onFocusChange(true);
      onSyntheticFocus(e);
    }
  }, [
    onFocusChange,
    onFocusProp,
    onSyntheticFocus
  ]);
  return {
    focusProps: {
      onFocus: !isDisabled && (onFocusProp || onFocusChange || onBlurProp) ? onFocus : void 0,
      onBlur: !isDisabled && (onBlurProp || onFocusChange) ? onBlur : void 0
    }
  };
}

// ../../node_modules/@react-aria/interactions/dist/useFocusVisible.mjs
var import_react5 = require("react");
var $507fabe10e71c6fb$var$currentModality = null;
var $507fabe10e71c6fb$var$changeHandlers = /* @__PURE__ */ new Set();
var $507fabe10e71c6fb$export$d90243b58daecda7 = /* @__PURE__ */ new Map();
var $507fabe10e71c6fb$var$hasEventBeforeFocus = false;
var $507fabe10e71c6fb$var$hasBlurredWindowRecently = false;
var $507fabe10e71c6fb$var$FOCUS_VISIBLE_INPUT_KEYS = {
  Tab: true,
  Escape: true
};
function $507fabe10e71c6fb$var$triggerChangeHandlers(modality, e) {
  for (let handler of $507fabe10e71c6fb$var$changeHandlers)
    handler(modality, e);
}
function $507fabe10e71c6fb$var$isValidKey(e) {
  return !(e.metaKey || !(0, $c87311424ea30a05$export$9ac100e40613ea10)() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
function $507fabe10e71c6fb$var$handleKeyboardEvent(e) {
  $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
  if ($507fabe10e71c6fb$var$isValidKey(e)) {
    $507fabe10e71c6fb$var$currentModality = "keyboard";
    $507fabe10e71c6fb$var$triggerChangeHandlers("keyboard", e);
  }
}
function $507fabe10e71c6fb$var$handlePointerEvent(e) {
  $507fabe10e71c6fb$var$currentModality = "pointer";
  if (e.type === "mousedown" || e.type === "pointerdown") {
    $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
    $507fabe10e71c6fb$var$triggerChangeHandlers("pointer", e);
  }
}
function $507fabe10e71c6fb$var$handleClickEvent(e) {
  if ((0, $6a7db85432448f7f$export$60278871457622de)(e)) {
    $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
    $507fabe10e71c6fb$var$currentModality = "virtual";
  }
}
function $507fabe10e71c6fb$var$handleFocusEvent(e) {
  if (e.target === window || e.target === document)
    return;
  if (!$507fabe10e71c6fb$var$hasEventBeforeFocus && !$507fabe10e71c6fb$var$hasBlurredWindowRecently) {
    $507fabe10e71c6fb$var$currentModality = "virtual";
    $507fabe10e71c6fb$var$triggerChangeHandlers("virtual", e);
  }
  $507fabe10e71c6fb$var$hasEventBeforeFocus = false;
  $507fabe10e71c6fb$var$hasBlurredWindowRecently = false;
}
function $507fabe10e71c6fb$var$handleWindowBlur() {
  $507fabe10e71c6fb$var$hasEventBeforeFocus = false;
  $507fabe10e71c6fb$var$hasBlurredWindowRecently = true;
}
function $507fabe10e71c6fb$var$setupGlobalFocusEvents(element) {
  if (typeof window === "undefined" || $507fabe10e71c6fb$export$d90243b58daecda7.get((0, $431fbd86ca7dc216$export$f21a1ffae260145a)(element)))
    return;
  const windowObject = (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(element);
  const documentObject = (0, $431fbd86ca7dc216$export$b204af158042fbac)(element);
  let focus = windowObject.HTMLElement.prototype.focus;
  windowObject.HTMLElement.prototype.focus = function() {
    $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
    focus.apply(this, arguments);
  };
  documentObject.addEventListener("keydown", $507fabe10e71c6fb$var$handleKeyboardEvent, true);
  documentObject.addEventListener("keyup", $507fabe10e71c6fb$var$handleKeyboardEvent, true);
  documentObject.addEventListener("click", $507fabe10e71c6fb$var$handleClickEvent, true);
  windowObject.addEventListener("focus", $507fabe10e71c6fb$var$handleFocusEvent, true);
  windowObject.addEventListener("blur", $507fabe10e71c6fb$var$handleWindowBlur, false);
  if (typeof PointerEvent !== "undefined") {
    documentObject.addEventListener("pointerdown", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.addEventListener("pointermove", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.addEventListener("pointerup", $507fabe10e71c6fb$var$handlePointerEvent, true);
  } else {
    documentObject.addEventListener("mousedown", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.addEventListener("mousemove", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.addEventListener("mouseup", $507fabe10e71c6fb$var$handlePointerEvent, true);
  }
  windowObject.addEventListener("beforeunload", () => {
    $507fabe10e71c6fb$var$tearDownWindowFocusTracking(element);
  }, {
    once: true
  });
  $507fabe10e71c6fb$export$d90243b58daecda7.set(windowObject, {
    focus
  });
}
var $507fabe10e71c6fb$var$tearDownWindowFocusTracking = (element, loadListener) => {
  const windowObject = (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(element);
  const documentObject = (0, $431fbd86ca7dc216$export$b204af158042fbac)(element);
  if (loadListener)
    documentObject.removeEventListener("DOMContentLoaded", loadListener);
  if (!$507fabe10e71c6fb$export$d90243b58daecda7.has(windowObject))
    return;
  windowObject.HTMLElement.prototype.focus = $507fabe10e71c6fb$export$d90243b58daecda7.get(windowObject).focus;
  documentObject.removeEventListener("keydown", $507fabe10e71c6fb$var$handleKeyboardEvent, true);
  documentObject.removeEventListener("keyup", $507fabe10e71c6fb$var$handleKeyboardEvent, true);
  documentObject.removeEventListener("click", $507fabe10e71c6fb$var$handleClickEvent, true);
  windowObject.removeEventListener("focus", $507fabe10e71c6fb$var$handleFocusEvent, true);
  windowObject.removeEventListener("blur", $507fabe10e71c6fb$var$handleWindowBlur, false);
  if (typeof PointerEvent !== "undefined") {
    documentObject.removeEventListener("pointerdown", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.removeEventListener("pointermove", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.removeEventListener("pointerup", $507fabe10e71c6fb$var$handlePointerEvent, true);
  } else {
    documentObject.removeEventListener("mousedown", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.removeEventListener("mousemove", $507fabe10e71c6fb$var$handlePointerEvent, true);
    documentObject.removeEventListener("mouseup", $507fabe10e71c6fb$var$handlePointerEvent, true);
  }
  $507fabe10e71c6fb$export$d90243b58daecda7.delete(windowObject);
};
function $507fabe10e71c6fb$export$2f1888112f558a7d(element) {
  const documentObject = (0, $431fbd86ca7dc216$export$b204af158042fbac)(element);
  let loadListener;
  if (documentObject.readyState !== "loading")
    $507fabe10e71c6fb$var$setupGlobalFocusEvents(element);
  else {
    loadListener = () => {
      $507fabe10e71c6fb$var$setupGlobalFocusEvents(element);
    };
    documentObject.addEventListener("DOMContentLoaded", loadListener);
  }
  return () => $507fabe10e71c6fb$var$tearDownWindowFocusTracking(element, loadListener);
}
if (typeof document !== "undefined")
  $507fabe10e71c6fb$export$2f1888112f558a7d();
function $507fabe10e71c6fb$export$b9b3dfddab17db27() {
  return $507fabe10e71c6fb$var$currentModality !== "pointer";
}
var $507fabe10e71c6fb$var$nonTextInputTypes = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset"
]);
function $507fabe10e71c6fb$var$isKeyboardFocusEvent(isTextInput, modality, e) {
  var _e_target;
  const IHTMLInputElement = typeof window !== "undefined" ? (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(e === null || e === void 0 ? void 0 : e.target).HTMLInputElement : HTMLInputElement;
  const IHTMLTextAreaElement = typeof window !== "undefined" ? (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(e === null || e === void 0 ? void 0 : e.target).HTMLTextAreaElement : HTMLTextAreaElement;
  const IHTMLElement = typeof window !== "undefined" ? (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(e === null || e === void 0 ? void 0 : e.target).HTMLElement : HTMLElement;
  const IKeyboardEvent = typeof window !== "undefined" ? (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(e === null || e === void 0 ? void 0 : e.target).KeyboardEvent : KeyboardEvent;
  isTextInput = isTextInput || (e === null || e === void 0 ? void 0 : e.target) instanceof IHTMLInputElement && !$507fabe10e71c6fb$var$nonTextInputTypes.has(e === null || e === void 0 ? void 0 : (_e_target = e.target) === null || _e_target === void 0 ? void 0 : _e_target.type) || (e === null || e === void 0 ? void 0 : e.target) instanceof IHTMLTextAreaElement || (e === null || e === void 0 ? void 0 : e.target) instanceof IHTMLElement && (e === null || e === void 0 ? void 0 : e.target.isContentEditable);
  return !(isTextInput && modality === "keyboard" && e instanceof IKeyboardEvent && !$507fabe10e71c6fb$var$FOCUS_VISIBLE_INPUT_KEYS[e.key]);
}
function $507fabe10e71c6fb$export$ec71b4b83ac08ec3(fn, deps, opts) {
  $507fabe10e71c6fb$var$setupGlobalFocusEvents();
  (0, import_react5.useEffect)(() => {
    let handler = (modality, e) => {
      if (!$507fabe10e71c6fb$var$isKeyboardFocusEvent(!!(opts === null || opts === void 0 ? void 0 : opts.isTextInput), modality, e))
        return;
      fn($507fabe10e71c6fb$export$b9b3dfddab17db27());
    };
    $507fabe10e71c6fb$var$changeHandlers.add(handler);
    return () => {
      $507fabe10e71c6fb$var$changeHandlers.delete(handler);
    };
  }, deps);
}

// ../../node_modules/@react-aria/interactions/dist/useFocusWithin.mjs
var import_react6 = require("react");
function $9ab94262bd0047c7$export$420e68273165f4ec(props) {
  let { isDisabled, onBlurWithin, onFocusWithin, onFocusWithinChange } = props;
  let state = (0, import_react6.useRef)({
    isFocusWithin: false
  });
  let onBlur = (0, import_react6.useCallback)((e) => {
    if (state.current.isFocusWithin && !e.currentTarget.contains(e.relatedTarget)) {
      state.current.isFocusWithin = false;
      if (onBlurWithin)
        onBlurWithin(e);
      if (onFocusWithinChange)
        onFocusWithinChange(false);
    }
  }, [
    onBlurWithin,
    onFocusWithinChange,
    state
  ]);
  let onSyntheticFocus = (0, $8a9cb279dc87e130$export$715c682d09d639cc)(onBlur);
  let onFocus = (0, import_react6.useCallback)((e) => {
    if (!state.current.isFocusWithin && document.activeElement === e.target) {
      if (onFocusWithin)
        onFocusWithin(e);
      if (onFocusWithinChange)
        onFocusWithinChange(true);
      state.current.isFocusWithin = true;
      onSyntheticFocus(e);
    }
  }, [
    onFocusWithin,
    onFocusWithinChange,
    onSyntheticFocus
  ]);
  if (isDisabled)
    return {
      focusWithinProps: {
        // These should not have been null, that would conflict in mergeProps
        onFocus: void 0,
        onBlur: void 0
      }
    };
  return {
    focusWithinProps: {
      onFocus,
      onBlur
    }
  };
}

// ../../node_modules/@react-aria/interactions/dist/useHover.mjs
var import_react7 = require("react");
var $6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents = false;
var $6179b936705e76d3$var$hoverCount = 0;
function $6179b936705e76d3$var$setGlobalIgnoreEmulatedMouseEvents() {
  $6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents = true;
  setTimeout(() => {
    $6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents = false;
  }, 50);
}
function $6179b936705e76d3$var$handleGlobalPointerEvent(e) {
  if (e.pointerType === "touch")
    $6179b936705e76d3$var$setGlobalIgnoreEmulatedMouseEvents();
}
function $6179b936705e76d3$var$setupGlobalTouchEvents() {
  if (typeof document === "undefined")
    return;
  if (typeof PointerEvent !== "undefined")
    document.addEventListener("pointerup", $6179b936705e76d3$var$handleGlobalPointerEvent);
  else
    document.addEventListener("touchend", $6179b936705e76d3$var$setGlobalIgnoreEmulatedMouseEvents);
  $6179b936705e76d3$var$hoverCount++;
  return () => {
    $6179b936705e76d3$var$hoverCount--;
    if ($6179b936705e76d3$var$hoverCount > 0)
      return;
    if (typeof PointerEvent !== "undefined")
      document.removeEventListener("pointerup", $6179b936705e76d3$var$handleGlobalPointerEvent);
    else
      document.removeEventListener("touchend", $6179b936705e76d3$var$setGlobalIgnoreEmulatedMouseEvents);
  };
}
function $6179b936705e76d3$export$ae780daf29e6d456(props) {
  let { onHoverStart, onHoverChange, onHoverEnd, isDisabled } = props;
  let [isHovered, setHovered] = (0, import_react7.useState)(false);
  let state = (0, import_react7.useRef)({
    isHovered: false,
    ignoreEmulatedMouseEvents: false,
    pointerType: "",
    target: null
  }).current;
  (0, import_react7.useEffect)($6179b936705e76d3$var$setupGlobalTouchEvents, []);
  let { hoverProps, triggerHoverEnd } = (0, import_react7.useMemo)(() => {
    let triggerHoverStart = (event, pointerType) => {
      state.pointerType = pointerType;
      if (isDisabled || pointerType === "touch" || state.isHovered || !event.currentTarget.contains(event.target))
        return;
      state.isHovered = true;
      let target = event.currentTarget;
      state.target = target;
      if (onHoverStart)
        onHoverStart({
          type: "hoverstart",
          target,
          pointerType
        });
      if (onHoverChange)
        onHoverChange(true);
      setHovered(true);
    };
    let triggerHoverEnd2 = (event, pointerType) => {
      state.pointerType = "";
      state.target = null;
      if (pointerType === "touch" || !state.isHovered)
        return;
      state.isHovered = false;
      let target = event.currentTarget;
      if (onHoverEnd)
        onHoverEnd({
          type: "hoverend",
          target,
          pointerType
        });
      if (onHoverChange)
        onHoverChange(false);
      setHovered(false);
    };
    let hoverProps2 = {};
    if (typeof PointerEvent !== "undefined") {
      hoverProps2.onPointerEnter = (e) => {
        if ($6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents && e.pointerType === "mouse")
          return;
        triggerHoverStart(e, e.pointerType);
      };
      hoverProps2.onPointerLeave = (e) => {
        if (!isDisabled && e.currentTarget.contains(e.target))
          triggerHoverEnd2(e, e.pointerType);
      };
    } else {
      hoverProps2.onTouchStart = () => {
        state.ignoreEmulatedMouseEvents = true;
      };
      hoverProps2.onMouseEnter = (e) => {
        if (!state.ignoreEmulatedMouseEvents && !$6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents)
          triggerHoverStart(e, "mouse");
        state.ignoreEmulatedMouseEvents = false;
      };
      hoverProps2.onMouseLeave = (e) => {
        if (!isDisabled && e.currentTarget.contains(e.target))
          triggerHoverEnd2(e, "mouse");
      };
    }
    return {
      hoverProps: hoverProps2,
      triggerHoverEnd: triggerHoverEnd2
    };
  }, [
    onHoverStart,
    onHoverChange,
    onHoverEnd,
    isDisabled,
    state
  ]);
  (0, import_react7.useEffect)(() => {
    if (isDisabled)
      triggerHoverEnd({
        currentTarget: state.target
      }, state.pointerType);
  }, [
    isDisabled
  ]);
  return {
    hoverProps,
    isHovered
  };
}

// ../../node_modules/@react-aria/focus/dist/useFocusRing.mjs
var import_react8 = require("react");
function $f7dceffc5ad7768b$export$4e328f61c538687f(props = {}) {
  let { autoFocus = false, isTextInput, within } = props;
  let state = (0, import_react8.useRef)({
    isFocused: false,
    isFocusVisible: autoFocus || (0, $507fabe10e71c6fb$export$b9b3dfddab17db27)()
  });
  let [isFocused, setFocused] = (0, import_react8.useState)(false);
  let [isFocusVisibleState, setFocusVisible] = (0, import_react8.useState)(() => state.current.isFocused && state.current.isFocusVisible);
  let updateState = (0, import_react8.useCallback)(() => setFocusVisible(state.current.isFocused && state.current.isFocusVisible), []);
  let onFocusChange = (0, import_react8.useCallback)((isFocused2) => {
    state.current.isFocused = isFocused2;
    setFocused(isFocused2);
    updateState();
  }, [
    updateState
  ]);
  (0, $507fabe10e71c6fb$export$ec71b4b83ac08ec3)((isFocusVisible) => {
    state.current.isFocusVisible = isFocusVisible;
    updateState();
  }, [], {
    isTextInput
  });
  let { focusProps } = (0, $a1ea59d68270f0dd$export$f8168d8dd8fd66e6)({
    isDisabled: within,
    onFocusChange
  });
  let { focusWithinProps } = (0, $9ab94262bd0047c7$export$420e68273165f4ec)({
    isDisabled: !within,
    onFocusWithinChange: onFocusChange
  });
  return {
    isFocused,
    isFocusVisible: isFocusVisibleState,
    focusProps: within ? focusWithinProps : focusProps
  };
}

// src/components/button/button.tsx
var import_react16 = require("react");

// src/hooks/use-active-press.tsx
var import_react13 = require("react");

// src/utils/env.ts
var Env = class {
  constructor() {
    __publicField(this, "current", this.detect());
    __publicField(this, "handoffState", "pending");
    __publicField(this, "currentId", 0);
  }
  set(env2) {
    if (this.current === env2)
      return;
    this.handoffState = "pending";
    this.currentId = 0;
    this.current = env2;
  }
  reset() {
    this.set(this.detect());
  }
  nextId() {
    return ++this.currentId;
  }
  get isServer() {
    return this.current === "server";
  }
  get isClient() {
    return this.current === "client";
  }
  detect() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return "server";
    }
    return "client";
  }
  handoff() {
    if (this.handoffState === "pending") {
      this.handoffState = "complete";
    }
  }
  get isHandoffComplete() {
    return this.handoffState === "complete";
  }
};
var env = new Env();

// src/utils/owner.ts
function getOwnerDocument(element) {
  var _a3, _b2;
  if (env.isServer)
    return null;
  if (!element)
    return document;
  if ("ownerDocument" in element)
    return element.ownerDocument;
  if ("current" in element)
    return (_b2 = (_a3 = element.current) == null ? void 0 : _a3.ownerDocument) != null ? _b2 : document;
  return null;
}

// src/hooks/use-disposables.ts
var import_react9 = require("react");

// src/utils/micro-task.ts
function microTask(cb) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(cb);
  } else {
    Promise.resolve().then(cb).catch(
      (e) => setTimeout(() => {
        throw e;
      })
    );
  }
}

// src/utils/disposables.ts
function disposables() {
  let _disposables = [];
  let api = {
    addEventListener(element, name, listener, options) {
      element.addEventListener(name, listener, options);
      return api.add(() => element.removeEventListener(name, listener, options));
    },
    requestAnimationFrame(...args) {
      let raf = requestAnimationFrame(...args);
      return api.add(() => cancelAnimationFrame(raf));
    },
    nextFrame(...args) {
      return api.requestAnimationFrame(() => {
        return api.requestAnimationFrame(...args);
      });
    },
    setTimeout(...args) {
      let timer = setTimeout(...args);
      return api.add(() => clearTimeout(timer));
    },
    microTask(...args) {
      let task = { current: true };
      microTask(() => {
        if (task.current) {
          args[0]();
        }
      });
      return api.add(() => {
        task.current = false;
      });
    },
    style(node, property, value) {
      let previous = node.style.getPropertyValue(property);
      Object.assign(node.style, { [property]: value });
      return this.add(() => {
        Object.assign(node.style, { [property]: previous });
      });
    },
    group(cb) {
      let d = disposables();
      cb(d);
      return this.add(() => d.dispose());
    },
    add(cb) {
      if (!_disposables.includes(cb)) {
        _disposables.push(cb);
      }
      return () => {
        let idx = _disposables.indexOf(cb);
        if (idx >= 0) {
          for (let dispose of _disposables.splice(idx, 1)) {
            dispose();
          }
        }
      };
    },
    dispose() {
      for (let dispose of _disposables.splice(0)) {
        dispose();
      }
    }
  };
  return api;
}

// src/hooks/use-disposables.ts
function useDisposables() {
  let [d] = (0, import_react9.useState)(disposables);
  (0, import_react9.useEffect)(() => () => d.dispose(), [d]);
  return d;
}

// src/hooks/use-event.ts
var import_react12 = __toESM(require("react"), 1);

// src/hooks/use-latest-value.ts
var import_react11 = require("react");

// src/hooks/use-iso-morphic-effect.ts
var import_react10 = require("react");
var useIsoMorphicEffect = (effect, deps) => {
  if (env.isServer) {
    (0, import_react10.useEffect)(effect, deps);
  } else {
    (0, import_react10.useLayoutEffect)(effect, deps);
  }
};

// src/hooks/use-latest-value.ts
function useLatestValue(value) {
  let cache = (0, import_react11.useRef)(value);
  useIsoMorphicEffect(() => {
    cache.current = value;
  }, [value]);
  return cache;
}

// src/hooks/use-event.ts
var useEvent = (
  // TODO: Add React.useEvent ?? once the useEvent hook is available
  function useEvent2(cb) {
    let cache = useLatestValue(cb);
    return import_react12.default.useCallback((...args) => cache.current(...args), [cache]);
  }
);

// src/hooks/use-active-press.tsx
function pointerRectFromPointerEvent(event) {
  let offsetX = event.width / 2;
  let offsetY = event.height / 2;
  return {
    top: event.clientY - offsetY,
    right: event.clientX + offsetX,
    bottom: event.clientY + offsetY,
    left: event.clientX - offsetX
  };
}
function areRectsOverlapping(a, b) {
  if (!a || !b) {
    return false;
  }
  if (a.right < b.left || a.left > b.right) {
    return false;
  }
  if (a.bottom < b.top || a.top > b.bottom) {
    return false;
  }
  return true;
}
function useActivePress({ disabled = false } = {}) {
  let target = (0, import_react13.useRef)(null);
  let [pressed, setPressed] = (0, import_react13.useState)(false);
  let d = useDisposables();
  let reset = useEvent(() => {
    target.current = null;
    setPressed(false);
    d.dispose();
  });
  let handlePointerDown = useEvent((event) => {
    d.dispose();
    if (target.current !== null)
      return;
    target.current = event.currentTarget;
    setPressed(true);
    {
      let owner = getOwnerDocument(event.currentTarget);
      d.addEventListener(owner, "pointerup", reset, false);
      d.addEventListener(
        owner,
        "pointermove",
        (event2) => {
          if (target.current) {
            let pointerRect = pointerRectFromPointerEvent(event2);
            setPressed(areRectsOverlapping(pointerRect, target.current.getBoundingClientRect()));
          }
        },
        false
      );
      d.addEventListener(owner, "pointercancel", reset, false);
    }
  });
  return {
    pressed,
    pressProps: disabled ? {} : {
      onPointerDown: handlePointerDown,
      onPointerUp: reset,
      onClick: reset
    }
  };
}

// src/internal/disabled.tsx
var import_react14 = __toESM(require("react"), 1);
var DisabledContext = (0, import_react14.createContext)(void 0);
function useDisabled() {
  return (0, import_react14.useContext)(DisabledContext);
}
function DisabledProvider({
  value,
  children
}) {
  return /* @__PURE__ */ import_react14.default.createElement(DisabledContext.Provider, { value }, children);
}

// src/utils/render.ts
var import_react15 = __toESM(require("react"), 1);

// src/utils/class-names.ts
function classNames(...classes) {
  return Array.from(
    new Set(
      classes.flatMap((value) => {
        if (typeof value === "string") {
          return value.split(" ");
        }
        return [];
      })
    )
  ).filter(Boolean).join(" ");
}

// src/utils/match.ts
function match(value, lookup, ...args) {
  if (value in lookup) {
    let returnValue = lookup[value];
    return typeof returnValue === "function" ? returnValue(...args) : returnValue;
  }
  let error2 = new Error(
    `Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(
      lookup
    ).map((key) => `"${key}"`).join(", ")}.`
  );
  if (Error.captureStackTrace)
    Error.captureStackTrace(error2, match);
  throw error2;
}

// src/utils/render.ts
function useRender() {
  let mergeRefs = useMergeRefsFn();
  return (0, import_react15.useCallback)(
    (args) => render({ mergeRefs, ...args }),
    [mergeRefs]
  );
}
function render({
  ourProps,
  theirProps,
  slot,
  defaultTag,
  features,
  visible = true,
  name,
  mergeRefs
}) {
  mergeRefs = mergeRefs != null ? mergeRefs : defaultMergeRefs;
  let props = mergePropsAdvanced(theirProps, ourProps);
  if (visible)
    return _render(props, slot, defaultTag, name, mergeRefs);
  let featureFlags = features != null ? features : 0 /* None */;
  if (featureFlags & 2 /* Static */) {
    let { static: isStatic = false, ...rest } = props;
    if (isStatic)
      return _render(rest, slot, defaultTag, name, mergeRefs);
  }
  if (featureFlags & 1 /* RenderStrategy */) {
    let { unmount = true, ...rest } = props;
    let strategy = unmount ? 0 /* Unmount */ : 1 /* Hidden */;
    return match(strategy, {
      [0 /* Unmount */]() {
        return null;
      },
      [1 /* Hidden */]() {
        return _render(
          { ...rest, ...{ hidden: true, style: { display: "none" } } },
          slot,
          defaultTag,
          name,
          mergeRefs
        );
      }
    });
  }
  return _render(props, slot, defaultTag, name, mergeRefs);
}
function _render(props, slot = {}, tag, name, mergeRefs) {
  let {
    as: Component = tag,
    children,
    refName = "ref",
    ...rest
  } = omit(props, ["unmount", "static"]);
  let refRelatedProps = props.ref !== void 0 ? { [refName]: props.ref } : {};
  let resolvedChildren = typeof children === "function" ? children(slot) : children;
  if ("className" in rest && rest.className && typeof rest.className === "function") {
    rest.className = rest.className(slot);
  }
  if (rest["aria-labelledby"] && rest["aria-labelledby"] === rest.id) {
    rest["aria-labelledby"] = void 0;
  }
  let dataAttributes = {};
  if (slot) {
    let exposeState = false;
    let states = [];
    for (let [k, v] of Object.entries(slot)) {
      if (typeof v === "boolean") {
        exposeState = true;
      }
      if (v === true) {
        states.push(k.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`));
      }
    }
    if (exposeState) {
      dataAttributes["data-headlessui-state"] = states.join(" ");
      for (let state of states) {
        dataAttributes[`data-${state}`] = "";
      }
    }
  }
  if (Component === import_react15.Fragment) {
    if (Object.keys(compact(rest)).length > 0 || Object.keys(compact(dataAttributes)).length > 0) {
      if (!(0, import_react15.isValidElement)(resolvedChildren) || Array.isArray(resolvedChildren) && resolvedChildren.length > 1) {
        if (Object.keys(compact(rest)).length > 0) {
          throw new Error(
            [
              'Passing props on "Fragment"!',
              "",
              `The current component <${name} /> is rendering a "Fragment".`,
              `However we need to passthrough the following props:`,
              Object.keys(compact(rest)).concat(Object.keys(compact(dataAttributes))).map((line) => `  - ${line}`).join("\n"),
              "",
              "You can apply a few solutions:",
              [
                'Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',
                "Render a single element as the child so that we can forward the props onto that element."
              ].map((line) => `  - ${line}`).join("\n")
            ].join("\n")
          );
        }
      } else {
        let childProps = resolvedChildren.props;
        let childPropsClassName = childProps == null ? void 0 : childProps.className;
        let newClassName = typeof childPropsClassName === "function" ? (...args) => classNames(
          childPropsClassName(...args),
          rest.className
        ) : classNames(childPropsClassName, rest.className);
        let classNameProps = newClassName ? { className: newClassName } : {};
        let mergedProps = mergePropsAdvanced(
          resolvedChildren.props,
          // Filter out undefined values so that they don't override the existing values
          compact(omit(rest, ["ref"]))
        );
        for (let key in dataAttributes) {
          if (key in mergedProps) {
            delete dataAttributes[key];
          }
        }
        return (0, import_react15.cloneElement)(
          resolvedChildren,
          Object.assign(
            {},
            mergedProps,
            dataAttributes,
            refRelatedProps,
            { ref: mergeRefs(getElementRef(resolvedChildren), refRelatedProps.ref) },
            classNameProps
          )
        );
      }
    }
  }
  return (0, import_react15.createElement)(
    Component,
    Object.assign(
      {},
      omit(rest, ["ref"]),
      Component !== import_react15.Fragment && refRelatedProps,
      Component !== import_react15.Fragment && dataAttributes
    ),
    resolvedChildren
  );
}
function useMergeRefsFn() {
  let currentRefs = (0, import_react15.useRef)([]);
  let mergedRef = (0, import_react15.useCallback)((value) => {
    for (let ref of currentRefs.current) {
      if (ref == null)
        continue;
      if (typeof ref === "function")
        ref(value);
      else
        ref.current = value;
    }
  }, []);
  return (...refs) => {
    if (refs.every((ref) => ref == null)) {
      return void 0;
    }
    currentRefs.current = refs;
    return mergedRef;
  };
}
function defaultMergeRefs(...refs) {
  return refs.every((ref) => ref == null) ? void 0 : (value) => {
    for (let ref of refs) {
      if (ref == null)
        continue;
      if (typeof ref === "function")
        ref(value);
      else
        ref.current = value;
    }
  };
}
function mergePropsAdvanced(...listOfProps) {
  var _a3;
  if (listOfProps.length === 0)
    return {};
  if (listOfProps.length === 1)
    return listOfProps[0];
  let target = {};
  let eventHandlers = {};
  for (let props of listOfProps) {
    for (let prop in props) {
      if (prop.startsWith("on") && typeof props[prop] === "function") {
        (_a3 = eventHandlers[prop]) != null ? _a3 : eventHandlers[prop] = [];
        eventHandlers[prop].push(props[prop]);
      } else {
        target[prop] = props[prop];
      }
    }
  }
  if (target.disabled || target["aria-disabled"]) {
    for (let eventName in eventHandlers) {
      if (/^(on(?:Click|Pointer|Mouse|Key)(?:Down|Up|Press)?)$/.test(eventName)) {
        eventHandlers[eventName] = [(e) => {
          var _a4;
          return (_a4 = e == null ? void 0 : e.preventDefault) == null ? void 0 : _a4.call(e);
        }];
      }
    }
  }
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](event, ...args) {
        let handlers = eventHandlers[eventName];
        for (let handler of handlers) {
          if ((event instanceof Event || (event == null ? void 0 : event.nativeEvent) instanceof Event) && event.defaultPrevented) {
            return;
          }
          handler(event, ...args);
        }
      }
    });
  }
  return target;
}
function mergeProps(...listOfProps) {
  var _a3;
  if (listOfProps.length === 0)
    return {};
  if (listOfProps.length === 1)
    return listOfProps[0];
  let target = {};
  let eventHandlers = {};
  for (let props of listOfProps) {
    for (let prop in props) {
      if (prop.startsWith("on") && typeof props[prop] === "function") {
        (_a3 = eventHandlers[prop]) != null ? _a3 : eventHandlers[prop] = [];
        eventHandlers[prop].push(props[prop]);
      } else {
        target[prop] = props[prop];
      }
    }
  }
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](...args) {
        let handlers = eventHandlers[eventName];
        for (let handler of handlers) {
          handler == null ? void 0 : handler(...args);
        }
      }
    });
  }
  return target;
}
function forwardRefWithAs(component) {
  var _a3;
  return Object.assign((0, import_react15.forwardRef)(component), {
    displayName: (_a3 = component.displayName) != null ? _a3 : component.name
  });
}
function compact(object) {
  let clone = Object.assign({}, object);
  for (let key in clone) {
    if (clone[key] === void 0)
      delete clone[key];
  }
  return clone;
}
function omit(object, keysToOmit = []) {
  let clone = Object.assign({}, object);
  for (let key of keysToOmit) {
    if (key in clone)
      delete clone[key];
  }
  return clone;
}
function getElementRef(element) {
  return import_react15.default.version.split(".")[0] >= "19" ? element.props.ref : element.ref;
}

// src/components/button/button.tsx
var DEFAULT_BUTTON_TAG = "button";
function ButtonFn(props, ref) {
  var _a3;
  let providedDisabled = useDisabled();
  let { disabled = providedDisabled || false, autoFocus = false, ...theirProps } = props;
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let ourProps = mergeProps(
    {
      ref,
      type: (_a3 = theirProps.type) != null ? _a3 : "button",
      disabled: disabled || void 0,
      autoFocus
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let slot = (0, import_react16.useMemo)(() => {
    return { disabled, hover, focus, active, autofocus: autoFocus };
  }, [disabled, hover, focus, active, autoFocus]);
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: "Button"
  });
}
var Button = forwardRefWithAs(ButtonFn);

// src/components/checkbox/checkbox.tsx
var import_react25 = __toESM(require("react"), 1);

// src/hooks/use-controllable.ts
var import_react17 = require("react");
function useControllable(controlledValue, onChange, defaultValue) {
  let [internalValue, setInternalValue] = (0, import_react17.useState)(defaultValue);
  let isControlled = controlledValue !== void 0;
  let wasControlled = (0, import_react17.useRef)(isControlled);
  let didWarnOnUncontrolledToControlled = (0, import_react17.useRef)(false);
  let didWarnOnControlledToUncontrolled = (0, import_react17.useRef)(false);
  if (isControlled && !wasControlled.current && !didWarnOnUncontrolledToControlled.current) {
    didWarnOnUncontrolledToControlled.current = true;
    wasControlled.current = isControlled;
    console.error(
      "A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen."
    );
  } else if (!isControlled && wasControlled.current && !didWarnOnControlledToUncontrolled.current) {
    didWarnOnControlledToUncontrolled.current = true;
    wasControlled.current = isControlled;
    console.error(
      "A component is changing from controlled to uncontrolled. This may be caused by the value changing from a defined value to undefined, which should not happen."
    );
  }
  return [
    isControlled ? controlledValue : internalValue,
    useEvent((value) => {
      if (isControlled) {
        return onChange == null ? void 0 : onChange(value);
      } else {
        setInternalValue(value);
        return onChange == null ? void 0 : onChange(value);
      }
    })
  ];
}

// src/hooks/use-default-value.ts
var import_react18 = require("react");
function useDefaultValue(value) {
  let [defaultValue] = (0, import_react18.useState)(value);
  return defaultValue;
}

// src/hooks/use-id.ts
var import_react19 = require("react");

// src/internal/form-fields.tsx
var import_react20 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// src/utils/form.ts
function objectToFormEntries(source = {}, parentKey = null, entries = []) {
  for (let [key, value] of Object.entries(source)) {
    append(entries, composeKey(parentKey, key), value);
  }
  return entries;
}
function composeKey(parent, key) {
  return parent ? parent + "[" + key + "]" : key;
}
function append(entries, key, value) {
  if (Array.isArray(value)) {
    for (let [subkey, subvalue] of value.entries()) {
      append(entries, composeKey(key, subkey.toString()), subvalue);
    }
  } else if (value instanceof Date) {
    entries.push([key, value.toISOString()]);
  } else if (typeof value === "boolean") {
    entries.push([key, value ? "1" : "0"]);
  } else if (typeof value === "string") {
    entries.push([key, value]);
  } else if (typeof value === "number") {
    entries.push([key, `${value}`]);
  } else if (value === null || value === void 0) {
    entries.push([key, ""]);
  } else {
    objectToFormEntries(value, key, entries);
  }
}
function attemptSubmit(elementInForm) {
  var _a3, _b2;
  let form = (_a3 = elementInForm == null ? void 0 : elementInForm.form) != null ? _a3 : elementInForm.closest("form");
  if (!form)
    return;
  for (let element of form.elements) {
    if (element === elementInForm)
      continue;
    if (element.tagName === "INPUT" && element.type === "submit" || element.tagName === "BUTTON" && element.type === "submit" || element.nodeName === "INPUT" && element.type === "image") {
      element.click();
      return;
    }
  }
  (_b2 = form.requestSubmit) == null ? void 0 : _b2.call(form);
}

// src/internal/hidden.tsx
var DEFAULT_VISUALLY_HIDDEN_TAG = "span";
function VisuallyHidden(props, ref) {
  var _a3;
  let { features = 1 /* None */, ...theirProps } = props;
  let ourProps = {
    ref,
    "aria-hidden": (features & 2 /* Focusable */) === 2 /* Focusable */ ? true : (_a3 = theirProps["aria-hidden"]) != null ? _a3 : void 0,
    hidden: (features & 4 /* Hidden */) === 4 /* Hidden */ ? true : void 0,
    style: {
      position: "fixed",
      top: 1,
      left: 1,
      width: 1,
      height: 0,
      padding: 0,
      margin: -1,
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      borderWidth: "0",
      ...(features & 4 /* Hidden */) === 4 /* Hidden */ && !((features & 2 /* Focusable */) === 2 /* Focusable */) && {
        display: "none"
      }
    }
  };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_VISUALLY_HIDDEN_TAG,
    name: "Hidden"
  });
}
var Hidden = forwardRefWithAs(VisuallyHidden);

// src/internal/form-fields.tsx
var FormFieldsContext = (0, import_react20.createContext)(null);
function FormFieldsProvider(props) {
  let [target, setTarget] = (0, import_react20.useState)(null);
  return /* @__PURE__ */ import_react20.default.createElement(FormFieldsContext.Provider, { value: { target } }, props.children, /* @__PURE__ */ import_react20.default.createElement(Hidden, { features: 4 /* Hidden */, ref: setTarget }));
}
function HoistFormFields({ children }) {
  let formFieldsContext = (0, import_react20.useContext)(FormFieldsContext);
  if (!formFieldsContext)
    return /* @__PURE__ */ import_react20.default.createElement(import_react20.default.Fragment, null, children);
  let { target } = formFieldsContext;
  return target ? (0, import_react_dom.createPortal)(/* @__PURE__ */ import_react20.default.createElement(import_react20.default.Fragment, null, children), target) : null;
}
function FormFields({
  data,
  form: formId,
  disabled,
  onReset,
  overrides
}) {
  let [form, setForm] = (0, import_react20.useState)(null);
  let d = useDisposables();
  (0, import_react20.useEffect)(() => {
    if (!onReset)
      return;
    if (!form)
      return;
    return d.addEventListener(form, "reset", onReset);
  }, [form, formId, onReset]);
  return /* @__PURE__ */ import_react20.default.createElement(HoistFormFields, null, /* @__PURE__ */ import_react20.default.createElement(FormResolver, { setForm, formId }), objectToFormEntries(data).map(([name, value]) => {
    return /* @__PURE__ */ import_react20.default.createElement(
      Hidden,
      {
        features: 4 /* Hidden */,
        ...compact({
          key: name,
          as: "input",
          type: "hidden",
          hidden: true,
          readOnly: true,
          form: formId,
          disabled,
          name,
          value,
          ...overrides
        })
      }
    );
  }));
}
function FormResolver({
  setForm,
  formId
}) {
  (0, import_react20.useEffect)(() => {
    if (formId) {
      let resolvedForm = document.getElementById(formId);
      if (resolvedForm)
        setForm(resolvedForm);
    }
  }, [setForm, formId]);
  return formId ? null : /* @__PURE__ */ import_react20.default.createElement(
    Hidden,
    {
      features: 4 /* Hidden */,
      as: "input",
      type: "hidden",
      hidden: true,
      readOnly: true,
      ref: (el) => {
        if (!el)
          return;
        let resolvedForm = el.closest("form");
        if (resolvedForm)
          setForm(resolvedForm);
      }
    }
  );
}

// src/internal/id.tsx
var import_react21 = __toESM(require("react"), 1);
var IdContext = (0, import_react21.createContext)(void 0);
function useProvidedId() {
  return (0, import_react21.useContext)(IdContext);
}
function IdProvider({ id, children }) {
  return /* @__PURE__ */ import_react21.default.createElement(IdContext.Provider, { value: id }, children);
}

// src/utils/bugs.ts
function isDisabledReactIssue7711(element) {
  let parent = element.parentElement;
  let legend = null;
  while (parent && !(parent instanceof HTMLFieldSetElement)) {
    if (parent instanceof HTMLLegendElement)
      legend = parent;
    parent = parent.parentElement;
  }
  let isParentDisabled = (parent == null ? void 0 : parent.getAttribute("disabled")) === "";
  if (isParentDisabled && isFirstLegend(legend))
    return false;
  return isParentDisabled;
}
function isFirstLegend(element) {
  if (!element)
    return false;
  let previous = element.previousElementSibling;
  while (previous !== null) {
    if (previous instanceof HTMLLegendElement)
      return false;
    previous = previous.previousElementSibling;
  }
  return true;
}

// src/components/description/description.tsx
var import_react23 = __toESM(require("react"), 1);

// src/hooks/use-sync-refs.ts
var import_react22 = require("react");
var Optional = Symbol();
function optionalRef(cb, isOptional = true) {
  return Object.assign(cb, { [Optional]: isOptional });
}
function useSyncRefs(...refs) {
  let cache = (0, import_react22.useRef)(refs);
  (0, import_react22.useEffect)(() => {
    cache.current = refs;
  }, [refs]);
  let syncRefs = useEvent((value) => {
    for (let ref of cache.current) {
      if (ref == null)
        continue;
      if (typeof ref === "function")
        ref(value);
      else
        ref.current = value;
    }
  });
  return refs.every(
    (ref) => ref == null || // @ts-expect-error
    (ref == null ? void 0 : ref[Optional])
  ) ? void 0 : syncRefs;
}

// src/components/description/description.tsx
var DescriptionContext = (0, import_react23.createContext)(null);
DescriptionContext.displayName = "DescriptionContext";
function useDescriptionContext() {
  let context = (0, import_react23.useContext)(DescriptionContext);
  if (context === null) {
    let err = new Error(
      "You used a <Description /> component, but it is not inside a relevant parent."
    );
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useDescriptionContext);
    throw err;
  }
  return context;
}
function useDescribedBy() {
  var _a3, _b2;
  return (_b2 = (_a3 = (0, import_react23.useContext)(DescriptionContext)) == null ? void 0 : _a3.value) != null ? _b2 : void 0;
}
function useDescriptions() {
  let [descriptionIds, setDescriptionIds] = (0, import_react23.useState)([]);
  return [
    // The actual id's as string or undefined
    descriptionIds.length > 0 ? descriptionIds.join(" ") : void 0,
    // The provider component
    (0, import_react23.useMemo)(() => {
      return function DescriptionProvider(props) {
        let register = useEvent((value) => {
          setDescriptionIds((existing) => [...existing, value]);
          return () => {
            return setDescriptionIds((existing) => {
              let clone = existing.slice();
              let idx = clone.indexOf(value);
              if (idx !== -1)
                clone.splice(idx, 1);
              return clone;
            });
          };
        });
        let contextBag = (0, import_react23.useMemo)(
          () => ({
            register,
            slot: props.slot,
            name: props.name,
            props: props.props,
            value: props.value
          }),
          [register, props.slot, props.name, props.props, props.value]
        );
        return /* @__PURE__ */ import_react23.default.createElement(DescriptionContext.Provider, { value: contextBag }, props.children);
      };
    }, [setDescriptionIds])
  ];
}
var DEFAULT_DESCRIPTION_TAG = "p";
function DescriptionFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let providedDisabled = useDisabled();
  let { id = `headlessui-description-${internalId}`, ...theirProps } = props;
  let context = useDescriptionContext();
  let descriptionRef = useSyncRefs(ref);
  useIsoMorphicEffect(() => context.register(id), [id, context.register]);
  let disabled = providedDisabled || false;
  let slot = (0, import_react23.useMemo)(() => ({ ...context.slot, disabled }), [context.slot, disabled]);
  let ourProps = { ref: descriptionRef, ...context.props, id };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_DESCRIPTION_TAG,
    name: context.name || "Description"
  });
}
var DescriptionRoot = forwardRefWithAs(DescriptionFn);
var Description = Object.assign(DescriptionRoot, {
  //
});

// src/components/label/label.tsx
var import_react24 = __toESM(require("react"), 1);
var LabelContext = (0, import_react24.createContext)(null);
LabelContext.displayName = "LabelContext";
function useLabelContext() {
  let context = (0, import_react24.useContext)(LabelContext);
  if (context === null) {
    let err = new Error("You used a <Label /> component, but it is not inside a relevant parent.");
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useLabelContext);
    throw err;
  }
  return context;
}
function useLabelledBy(alwaysAvailableIds) {
  var _a3, _b2, _c;
  let labelIds = (_b2 = (_a3 = (0, import_react24.useContext)(LabelContext)) == null ? void 0 : _a3.value) != null ? _b2 : void 0;
  if (((_c = alwaysAvailableIds == null ? void 0 : alwaysAvailableIds.length) != null ? _c : 0) > 0) {
    return [labelIds, ...alwaysAvailableIds].filter(Boolean).join(" ");
  }
  return labelIds;
}
function useLabels({ inherit = false } = {}) {
  let parentLabelledBy = useLabelledBy();
  let [labelIds, setLabelIds] = (0, import_react24.useState)([]);
  let allLabelIds = inherit ? [parentLabelledBy, ...labelIds].filter(Boolean) : labelIds;
  return [
    // The actual id's as string or undefined.
    allLabelIds.length > 0 ? allLabelIds.join(" ") : void 0,
    // The provider component
    (0, import_react24.useMemo)(() => {
      return function LabelProvider(props) {
        let register = useEvent((value) => {
          setLabelIds((existing) => [...existing, value]);
          return () => {
            return setLabelIds((existing) => {
              let clone = existing.slice();
              let idx = clone.indexOf(value);
              if (idx !== -1)
                clone.splice(idx, 1);
              return clone;
            });
          };
        });
        let contextBag = (0, import_react24.useMemo)(
          () => ({
            register,
            slot: props.slot,
            name: props.name,
            props: props.props,
            value: props.value
          }),
          [register, props.slot, props.name, props.props, props.value]
        );
        return /* @__PURE__ */ import_react24.default.createElement(LabelContext.Provider, { value: contextBag }, props.children);
      };
    }, [setLabelIds])
  ];
}
var DEFAULT_LABEL_TAG = "label";
function LabelFn(props, ref) {
  var _a3;
  let internalId = (0, import_react19.useId)();
  let context = useLabelContext();
  let providedHtmlFor = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = `headlessui-label-${internalId}`,
    htmlFor = providedHtmlFor != null ? providedHtmlFor : (_a3 = context.props) == null ? void 0 : _a3.htmlFor,
    passive = false,
    ...theirProps
  } = props;
  let labelRef = useSyncRefs(ref);
  useIsoMorphicEffect(() => context.register(id), [id, context.register]);
  let handleClick = useEvent((e) => {
    let current = e.currentTarget;
    if (current instanceof HTMLLabelElement) {
      e.preventDefault();
    }
    if (context.props && "onClick" in context.props && typeof context.props.onClick === "function") {
      context.props.onClick(e);
    }
    if (current instanceof HTMLLabelElement) {
      let target = document.getElementById(current.htmlFor);
      if (target) {
        let actuallyDisabled = target.getAttribute("disabled");
        if (actuallyDisabled === "true" || actuallyDisabled === "") {
          return;
        }
        let ariaDisabled = target.getAttribute("aria-disabled");
        if (ariaDisabled === "true" || ariaDisabled === "") {
          return;
        }
        if (target instanceof HTMLInputElement && (target.type === "radio" || target.type === "checkbox") || target.role === "radio" || target.role === "checkbox" || target.role === "switch") {
          target.click();
        }
        target.focus({ preventScroll: true });
      }
    }
  });
  let disabled = providedDisabled || false;
  let slot = (0, import_react24.useMemo)(() => ({ ...context.slot, disabled }), [context.slot, disabled]);
  let ourProps = {
    ref: labelRef,
    ...context.props,
    id,
    htmlFor,
    onClick: handleClick
  };
  if (passive) {
    if ("onClick" in ourProps) {
      delete ourProps["htmlFor"];
      delete ourProps["onClick"];
    }
    if ("onClick" in theirProps) {
      delete theirProps["onClick"];
    }
  }
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: htmlFor ? DEFAULT_LABEL_TAG : "div",
    name: context.name || "Label"
  });
}
var LabelRoot = forwardRefWithAs(LabelFn);
var Label = Object.assign(LabelRoot, {
  //
});

// src/components/checkbox/checkbox.tsx
var DEFAULT_CHECKBOX_TAG = "span";
function CheckboxFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = providedId || `headlessui-checkbox-${internalId}`,
    disabled = providedDisabled || false,
    autoFocus = false,
    checked: controlledChecked,
    defaultChecked: _defaultChecked,
    onChange: controlledOnChange,
    name,
    value,
    form,
    indeterminate = false,
    ...theirProps
  } = props;
  let defaultChecked = useDefaultValue(_defaultChecked);
  let [checked, onChange] = useControllable(
    controlledChecked,
    controlledOnChange,
    defaultChecked != null ? defaultChecked : false
  );
  let labelledBy = useLabelledBy();
  let describedBy = useDescribedBy();
  let d = useDisposables();
  let [changing, setChanging] = (0, import_react25.useState)(false);
  let toggle = useEvent(() => {
    setChanging(true);
    onChange == null ? void 0 : onChange(!checked);
    d.nextFrame(() => {
      setChanging(false);
    });
  });
  let handleClick = useEvent((event) => {
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    event.preventDefault();
    toggle();
  });
  let handleKeyUp = useEvent((event) => {
    if (event.key === " " /* Space */) {
      event.preventDefault();
      toggle();
    } else if (event.key === "Enter" /* Enter */) {
      attemptSubmit(event.currentTarget);
    }
  });
  let handleKeyPress = useEvent((event) => event.preventDefault());
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let ourProps = mergeProps(
    {
      ref,
      id,
      role: "checkbox",
      "aria-checked": indeterminate ? "mixed" : checked ? "true" : "false",
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-disabled": disabled ? true : void 0,
      indeterminate: indeterminate ? "true" : void 0,
      tabIndex: disabled ? void 0 : 0,
      onKeyUp: disabled ? void 0 : handleKeyUp,
      onKeyPress: disabled ? void 0 : handleKeyPress,
      onClick: disabled ? void 0 : handleClick
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let slot = (0, import_react25.useMemo)(() => {
    return {
      checked,
      disabled,
      hover,
      focus,
      active,
      indeterminate,
      changing,
      autofocus: autoFocus
    };
  }, [checked, indeterminate, disabled, hover, focus, active, changing, autoFocus]);
  let reset = (0, import_react25.useCallback)(() => {
    if (defaultChecked === void 0)
      return;
    return onChange == null ? void 0 : onChange(defaultChecked);
  }, [onChange, defaultChecked]);
  let render2 = useRender();
  return /* @__PURE__ */ import_react25.default.createElement(import_react25.default.Fragment, null, name != null && /* @__PURE__ */ import_react25.default.createElement(
    FormFields,
    {
      disabled,
      data: { [name]: value || "on" },
      overrides: { type: "checkbox", checked },
      form,
      onReset: reset
    }
  ), render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_CHECKBOX_TAG,
    name: "Checkbox"
  }));
}
var Checkbox = forwardRefWithAs(CheckboxFn);

// src/components/close-button/close-button.tsx
var import_react27 = __toESM(require("react"), 1);

// src/internal/close-provider.tsx
var import_react26 = __toESM(require("react"), 1);
var CloseContext = (0, import_react26.createContext)(() => {
});
function useClose() {
  return (0, import_react26.useContext)(CloseContext);
}
function CloseProvider({ value, children }) {
  return /* @__PURE__ */ import_react26.default.createElement(CloseContext.Provider, { value }, children);
}

// src/components/close-button/close-button.tsx
function CloseButtonFn(props, ref) {
  let close = useClose();
  return /* @__PURE__ */ import_react27.default.createElement(Button, { ref, ...mergeProps({ onClick: close }, props) });
}
var CloseButton = forwardRefWithAs(CloseButtonFn);

// ../../node_modules/@tanstack/react-virtual/dist/esm/index.js
var React11 = __toESM(require("react"), 1);
var import_react_dom2 = require("react-dom");

// ../../node_modules/@tanstack/react-virtual/node_modules/@tanstack/virtual-core/dist/esm/utils.js
function memo(getDeps, fn, opts) {
  var _a3;
  let deps = (_a3 = opts.initialDeps) != null ? _a3 : [];
  let result;
  return () => {
    var _a4, _b2, _c, _d;
    let depTime;
    if (opts.key && ((_a4 = opts.debug) == null ? void 0 : _a4.call(opts)))
      depTime = Date.now();
    const newDeps = getDeps();
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index3) => deps[index3] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && ((_b2 = opts.debug) == null ? void 0 : _b2.call(opts)))
      resultTime = Date.now();
    result = fn(...newDeps);
    if (opts.key && ((_c = opts.debug) == null ? void 0 : _c.call(opts))) {
      const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      const resultFpsPercentage = resultEndTime / 16;
      const pad = (str, num) => {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info(
        `%c\u23F1 ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * resultFpsPercentage, 120)
        )}deg 100% 31%);`,
        opts == null ? void 0 : opts.key
      );
    }
    (_d = opts == null ? void 0 : opts.onChange) == null ? void 0 : _d.call(opts, result);
    return result;
  };
}
function notUndefined(value, msg) {
  if (value === void 0) {
    throw new Error(`Unexpected undefined${msg ? `: ${msg}` : ""}`);
  } else {
    return value;
  }
}
var approxEqual = (a, b) => Math.abs(a - b) < 1;
var debounce = (targetWindow, fn, ms) => {
  let timeoutId;
  return function(...args) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
  };
};

// ../../node_modules/@tanstack/react-virtual/node_modules/@tanstack/virtual-core/dist/esm/index.js
var defaultKeyExtractor = (index3) => index3;
var defaultRangeExtractor = (range) => {
  const start = Math.max(range.startIndex - range.overscan, 0);
  const end = Math.min(range.endIndex + range.overscan, range.count - 1);
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
};
var observeElementRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  const handler = (rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };
  handler(element.getBoundingClientRect());
  if (!targetWindow.ResizeObserver) {
    return () => {
    };
  }
  const observer = new targetWindow.ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry == null ? void 0 : entry.borderBoxSize) {
      const box = entry.borderBoxSize[0];
      if (box) {
        handler({ width: box.inlineSize, height: box.blockSize });
        return;
      }
    }
    handler(element.getBoundingClientRect());
  });
  observer.observe(element, { box: "border-box" });
  return () => {
    observer.unobserve(element);
  };
};
var addEventListenerOptions = {
  passive: true
};
var supportsScrollend = typeof window == "undefined" ? true : "onscrollend" in window;
var observeElementOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset4 = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => void 0 : debounce(
    targetWindow,
    () => {
      cb(offset4, false);
    },
    instance.options.isScrollingResetDelay
  );
  const createHandler = (isScrolling) => () => {
    const { horizontal, isRtl } = instance.options;
    offset4 = horizontal ? element["scrollLeft"] * (isRtl && -1 || 1) : element["scrollTop"];
    fallback();
    cb(offset4, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  endHandler();
  element.addEventListener("scroll", handler, addEventListenerOptions);
  element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  return () => {
    element.removeEventListener("scroll", handler);
    element.removeEventListener("scrollend", endHandler);
  };
};
var measureElement = (element, entry, instance) => {
  if (entry == null ? void 0 : entry.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size4 = Math.round(
        box[instance.options.horizontal ? "inlineSize" : "blockSize"]
      );
      return size4;
    }
  }
  return Math.round(
    element.getBoundingClientRect()[instance.options.horizontal ? "width" : "height"]
  );
};
var elementScroll = (offset4, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a3, _b2;
  const toOffset = offset4 + adjustments;
  (_b2 = (_a3 = instance.scrollElement) == null ? void 0 : _a3.scrollTo) == null ? void 0 : _b2.call(_a3, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};
var Virtualizer = class {
  constructor(opts) {
    this.unsubs = [];
    this.scrollElement = null;
    this.targetWindow = null;
    this.isScrolling = false;
    this.scrollToIndexTimeoutId = null;
    this.measurementsCache = [];
    this.itemSizeCache = /* @__PURE__ */ new Map();
    this.pendingMeasuredCacheIndexes = [];
    this.scrollRect = null;
    this.scrollOffset = null;
    this.scrollDirection = null;
    this.scrollAdjustments = 0;
    this.elementsCache = /* @__PURE__ */ new Map();
    this.observer = /* @__PURE__ */ (() => {
      let _ro = null;
      const get = () => {
        if (_ro) {
          return _ro;
        }
        if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
          return null;
        }
        return _ro = new this.targetWindow.ResizeObserver((entries) => {
          entries.forEach((entry) => {
            this._measureElement(entry.target, entry);
          });
        });
      };
      return {
        disconnect: () => {
          var _a3;
          (_a3 = get()) == null ? void 0 : _a3.disconnect();
          _ro = null;
        },
        observe: (target) => {
          var _a3;
          return (_a3 = get()) == null ? void 0 : _a3.observe(target, { box: "border-box" });
        },
        unobserve: (target) => {
          var _a3;
          return (_a3 = get()) == null ? void 0 : _a3.unobserve(target);
        }
      };
    })();
    this.range = null;
    this.setOptions = (opts2) => {
      Object.entries(opts2).forEach(([key, value]) => {
        if (typeof value === "undefined")
          delete opts2[key];
      });
      this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: defaultKeyExtractor,
        rangeExtractor: defaultRangeExtractor,
        onChange: () => {
        },
        measureElement,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: true,
        isRtl: false,
        useScrollendEvent: true,
        ...opts2
      };
    };
    this.notify = (sync) => {
      var _a3, _b2;
      (_b2 = (_a3 = this.options).onChange) == null ? void 0 : _b2.call(_a3, this, sync);
    };
    this.maybeNotify = memo(
      () => {
        this.calculateRange();
        return [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ];
      },
      (isScrolling) => {
        this.notify(isScrolling);
      },
      {
        key: "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    );
    this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((d) => d());
      this.unsubs = [];
      this.observer.disconnect();
      this.scrollElement = null;
      this.targetWindow = null;
    };
    this._didMount = () => {
      return () => {
        this.cleanup();
      };
    };
    this._willUpdate = () => {
      var _a4;
      var _a3;
      const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== scrollElement) {
        this.cleanup();
        if (!scrollElement) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = scrollElement;
        if (this.scrollElement && "ownerDocument" in this.scrollElement) {
          this.targetWindow = this.scrollElement.ownerDocument.defaultView;
        } else {
          this.targetWindow = (_a4 = (_a3 = this.scrollElement) == null ? void 0 : _a3.window) != null ? _a4 : null;
        }
        this.elementsCache.forEach((cached) => {
          this.observer.observe(cached);
        });
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
        this.unsubs.push(
          this.options.observeElementRect(this, (rect) => {
            this.scrollRect = rect;
            this.maybeNotify();
          })
        );
        this.unsubs.push(
          this.options.observeElementOffset(this, (offset4, isScrolling) => {
            this.scrollAdjustments = 0;
            this.scrollDirection = isScrolling ? this.getScrollOffset() < offset4 ? "forward" : "backward" : null;
            this.scrollOffset = offset4;
            this.isScrolling = isScrolling;
            this.maybeNotify();
          })
        );
      }
    };
    this.getSize = () => {
      var _a3;
      if (!this.options.enabled) {
        this.scrollRect = null;
        return 0;
      }
      this.scrollRect = (_a3 = this.scrollRect) != null ? _a3 : this.options.initialRect;
      return this.scrollRect[this.options.horizontal ? "width" : "height"];
    };
    this.getScrollOffset = () => {
      var _a3;
      if (!this.options.enabled) {
        this.scrollOffset = null;
        return 0;
      }
      this.scrollOffset = (_a3 = this.scrollOffset) != null ? _a3 : typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset;
      return this.scrollOffset;
    };
    this.getFurthestMeasurement = (measurements, index3) => {
      const furthestMeasurementsFound = /* @__PURE__ */ new Map();
      const furthestMeasurements = /* @__PURE__ */ new Map();
      for (let m = index3 - 1; m >= 0; m--) {
        const measurement = measurements[m];
        if (furthestMeasurementsFound.has(measurement.lane)) {
          continue;
        }
        const previousFurthestMeasurement = furthestMeasurements.get(
          measurement.lane
        );
        if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
          furthestMeasurements.set(measurement.lane, measurement);
        } else if (measurement.end < previousFurthestMeasurement.end) {
          furthestMeasurementsFound.set(measurement.lane, true);
        }
        if (furthestMeasurementsFound.size === this.options.lanes) {
          break;
        }
      }
      return furthestMeasurements.size === this.options.lanes ? Array.from(furthestMeasurements.values()).sort((a, b) => {
        if (a.end === b.end) {
          return a.index - b.index;
        }
        return a.end - b.end;
      })[0] : void 0;
    };
    this.getMeasurementOptions = memo(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled
      ],
      (count2, paddingStart, scrollMargin, getItemKey, enabled) => {
        this.pendingMeasuredCacheIndexes = [];
        return {
          count: count2,
          paddingStart,
          scrollMargin,
          getItemKey,
          enabled
        };
      },
      {
        key: false
      }
    );
    this.getMeasurements = memo(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count: count2, paddingStart, scrollMargin, getItemKey, enabled }, itemSizeCache) => {
        if (!enabled) {
          this.measurementsCache = [];
          this.itemSizeCache.clear();
          return [];
        }
        if (this.measurementsCache.length === 0) {
          this.measurementsCache = this.options.initialMeasurementsCache;
          this.measurementsCache.forEach((item) => {
            this.itemSizeCache.set(item.key, item.size);
          });
        }
        const min2 = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        const measurements = this.measurementsCache.slice(0, min2);
        for (let i = min2; i < count2; i++) {
          const key = getItemKey(i);
          const furthestMeasurement = this.options.lanes === 1 ? measurements[i - 1] : this.getFurthestMeasurement(measurements, i);
          const start = furthestMeasurement ? furthestMeasurement.end + this.options.gap : paddingStart + scrollMargin;
          const measuredSize = itemSizeCache.get(key);
          const size4 = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
          const end = start + size4;
          const lane = furthestMeasurement ? furthestMeasurement.lane : i % this.options.lanes;
          measurements[i] = {
            index: i,
            start,
            size: size4,
            end,
            key,
            lane
          };
        }
        this.measurementsCache = measurements;
        return measurements;
      },
      {
        key: "getMeasurements",
        debug: () => this.options.debug
      }
    );
    this.calculateRange = memo(
      () => [this.getMeasurements(), this.getSize(), this.getScrollOffset()],
      (measurements, outerSize, scrollOffset) => {
        return this.range = measurements.length > 0 && outerSize > 0 ? calculateRange({
          measurements,
          outerSize,
          scrollOffset
        }) : null;
      },
      {
        key: "calculateRange",
        debug: () => this.options.debug
      }
    );
    this.getIndexes = memo(
      () => [
        this.options.rangeExtractor,
        this.calculateRange(),
        this.options.overscan,
        this.options.count
      ],
      (rangeExtractor, range, overscan, count2) => {
        return range === null ? [] : rangeExtractor({
          startIndex: range.startIndex,
          endIndex: range.endIndex,
          overscan,
          count: count2
        });
      },
      {
        key: "getIndexes",
        debug: () => this.options.debug
      }
    );
    this.indexFromElement = (node) => {
      const attributeName = this.options.indexAttribute;
      const indexStr = node.getAttribute(attributeName);
      if (!indexStr) {
        console.warn(
          `Missing attribute name '${attributeName}={index}' on measured element.`
        );
        return -1;
      }
      return parseInt(indexStr, 10);
    };
    this._measureElement = (node, entry) => {
      const index3 = this.indexFromElement(node);
      const item = this.measurementsCache[index3];
      if (!item) {
        return;
      }
      const key = item.key;
      const prevNode = this.elementsCache.get(key);
      if (prevNode !== node) {
        if (prevNode) {
          this.observer.unobserve(prevNode);
        }
        this.observer.observe(node);
        this.elementsCache.set(key, node);
      }
      if (node.isConnected) {
        this.resizeItem(index3, this.options.measureElement(node, entry, this));
      }
    };
    this.resizeItem = (index3, size4) => {
      var _a3;
      const item = this.measurementsCache[index3];
      if (!item) {
        return;
      }
      const itemSize = (_a3 = this.itemSizeCache.get(item.key)) != null ? _a3 : item.size;
      const delta = size4 - itemSize;
      if (delta !== 0) {
        if (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this) : item.start < this.getScrollOffset() + this.scrollAdjustments) {
          if (this.options.debug) {
            console.info("correction", delta);
          }
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: this.scrollAdjustments += delta,
            behavior: void 0
          });
        }
        this.pendingMeasuredCacheIndexes.push(item.index);
        this.itemSizeCache = new Map(this.itemSizeCache.set(item.key, size4));
        this.notify(false);
      }
    };
    this.measureElement = (node) => {
      if (!node) {
        this.elementsCache.forEach((cached, key) => {
          if (!cached.isConnected) {
            this.observer.unobserve(cached);
            this.elementsCache.delete(key);
          }
        });
        return;
      }
      this._measureElement(node, void 0);
    };
    this.getVirtualItems = memo(
      () => [this.getIndexes(), this.getMeasurements()],
      (indexes, measurements) => {
        const virtualItems = [];
        for (let k = 0, len = indexes.length; k < len; k++) {
          const i = indexes[k];
          const measurement = measurements[i];
          virtualItems.push(measurement);
        }
        return virtualItems;
      },
      {
        key: "getVirtualItems",
        debug: () => this.options.debug
      }
    );
    this.getVirtualItemForOffset = (offset4) => {
      const measurements = this.getMeasurements();
      if (measurements.length === 0) {
        return void 0;
      }
      return notUndefined(
        measurements[findNearestBinarySearch(
          0,
          measurements.length - 1,
          (index3) => notUndefined(measurements[index3]).start,
          offset4
        )]
      );
    };
    this.getOffsetForAlignment = (toOffset, align) => {
      const size4 = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        if (toOffset >= scrollOffset + size4) {
          align = "end";
        }
      }
      if (align === "end") {
        toOffset -= size4;
      }
      const scrollSizeProp = this.options.horizontal ? "scrollWidth" : "scrollHeight";
      const scrollSize = this.scrollElement ? "document" in this.scrollElement ? this.scrollElement.document.documentElement[scrollSizeProp] : this.scrollElement[scrollSizeProp] : 0;
      const maxOffset = scrollSize - size4;
      return Math.max(Math.min(maxOffset, toOffset), 0);
    };
    this.getOffsetForIndex = (index3, align = "auto") => {
      index3 = Math.max(0, Math.min(index3, this.options.count - 1));
      const item = this.measurementsCache[index3];
      if (!item) {
        return void 0;
      }
      const size4 = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        if (item.end >= scrollOffset + size4 - this.options.scrollPaddingEnd) {
          align = "end";
        } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
          align = "start";
        } else {
          return [scrollOffset, align];
        }
      }
      const centerOffset = item.start - this.options.scrollPaddingStart + (item.size - size4) / 2;
      switch (align) {
        case "center":
          return [this.getOffsetForAlignment(centerOffset, align), align];
        case "end":
          return [
            this.getOffsetForAlignment(
              item.end + this.options.scrollPaddingEnd,
              align
            ),
            align
          ];
        default:
          return [
            this.getOffsetForAlignment(
              item.start - this.options.scrollPaddingStart,
              align
            ),
            align
          ];
      }
    };
    this.isDynamicMode = () => this.elementsCache.size > 0;
    this.cancelScrollToIndex = () => {
      if (this.scrollToIndexTimeoutId !== null && this.targetWindow) {
        this.targetWindow.clearTimeout(this.scrollToIndexTimeoutId);
        this.scrollToIndexTimeoutId = null;
      }
    };
    this.scrollToOffset = (toOffset, { align = "start", behavior } = {}) => {
      this.cancelScrollToIndex();
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getOffsetForAlignment(toOffset, align), {
        adjustments: void 0,
        behavior
      });
    };
    this.scrollToIndex = (index3, { align: initialAlign = "auto", behavior } = {}) => {
      index3 = Math.max(0, Math.min(index3, this.options.count - 1));
      this.cancelScrollToIndex();
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      const offsetAndAlign = this.getOffsetForIndex(index3, initialAlign);
      if (!offsetAndAlign)
        return;
      const [offset4, align] = offsetAndAlign;
      this._scrollToOffset(offset4, { adjustments: void 0, behavior });
      if (behavior !== "smooth" && this.isDynamicMode() && this.targetWindow) {
        this.scrollToIndexTimeoutId = this.targetWindow.setTimeout(() => {
          this.scrollToIndexTimeoutId = null;
          const elementInDOM = this.elementsCache.has(
            this.options.getItemKey(index3)
          );
          if (elementInDOM) {
            const [latestOffset] = notUndefined(
              this.getOffsetForIndex(index3, align)
            );
            if (!approxEqual(latestOffset, this.getScrollOffset())) {
              this.scrollToIndex(index3, { align, behavior });
            }
          } else {
            this.scrollToIndex(index3, { align, behavior });
          }
        });
      }
    };
    this.scrollBy = (delta, { behavior } = {}) => {
      this.cancelScrollToIndex();
      if (behavior === "smooth" && this.isDynamicMode()) {
        console.warn(
          "The `smooth` scroll behavior is not fully supported with dynamic size."
        );
      }
      this._scrollToOffset(this.getScrollOffset() + delta, {
        adjustments: void 0,
        behavior
      });
    };
    this.getTotalSize = () => {
      var _a4;
      var _a3;
      const measurements = this.getMeasurements();
      let end;
      if (measurements.length === 0) {
        end = this.options.paddingStart;
      } else {
        end = this.options.lanes === 1 ? (_a4 = (_a3 = measurements[measurements.length - 1]) == null ? void 0 : _a3.end) != null ? _a4 : 0 : Math.max(
          ...measurements.slice(-this.options.lanes).map((m) => m.end)
        );
      }
      return Math.max(
        end - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    };
    this._scrollToOffset = (offset4, {
      adjustments,
      behavior
    }) => {
      this.options.scrollToFn(offset4, { behavior, adjustments }, this);
    };
    this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map();
      this.notify(false);
    };
    this.setOptions(opts);
  }
};
var findNearestBinarySearch = (low, high, getCurrentValue, value) => {
  while (low <= high) {
    const middle = (low + high) / 2 | 0;
    const currentValue = getCurrentValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};
function calculateRange({
  measurements,
  outerSize,
  scrollOffset
}) {
  const count2 = measurements.length - 1;
  const getOffset = (index3) => measurements[index3].start;
  const startIndex = findNearestBinarySearch(0, count2, getOffset, scrollOffset);
  let endIndex = startIndex;
  while (endIndex < count2 && measurements[endIndex].end < scrollOffset + outerSize) {
    endIndex++;
  }
  return { startIndex, endIndex };
}

// ../../node_modules/@tanstack/react-virtual/dist/esm/index.js
var useIsomorphicLayoutEffect = typeof document !== "undefined" ? React11.useLayoutEffect : React11.useEffect;
function useVirtualizerBase(options) {
  const rerender = React11.useReducer(() => ({}), {})[1];
  const resolvedOptions = {
    ...options,
    onChange: (instance2, sync) => {
      var _a3;
      if (sync) {
        (0, import_react_dom2.flushSync)(rerender);
      } else {
        rerender();
      }
      (_a3 = options.onChange) == null ? void 0 : _a3.call(options, instance2, sync);
    }
  };
  const [instance] = React11.useState(
    () => new Virtualizer(resolvedOptions)
  );
  instance.setOptions(resolvedOptions);
  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);
  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });
  return instance;
}
function useVirtualizer(options) {
  return useVirtualizerBase({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options
  });
}

// src/components/combobox/combobox.tsx
var import_react54 = __toESM(require("react"), 1);
var import_react_dom6 = require("react-dom");

// src/hooks/use-by-comparator.ts
var import_react28 = require("react");
function defaultBy(a, z) {
  if (a !== null && z !== null && typeof a === "object" && typeof z === "object" && "id" in a && "id" in z) {
    return a.id === z.id;
  }
  return a === z;
}
function useByComparator(by = defaultBy) {
  return (0, import_react28.useCallback)(
    (a, z) => {
      if (typeof by === "string") {
        let property = by;
        return (a == null ? void 0 : a[property]) === (z == null ? void 0 : z[property]);
      }
      return by(a, z);
    },
    [by]
  );
}

// src/hooks/use-element-size.ts
var import_react29 = require("react");
function computeSize(element) {
  if (element === null)
    return { width: 0, height: 0 };
  let { width, height } = element.getBoundingClientRect();
  return { width, height };
}
function useElementSize(element, unit = false) {
  let [identity, forceRerender] = (0, import_react29.useReducer)(() => ({}), {});
  let size4 = (0, import_react29.useMemo)(() => computeSize(element), [element, identity]);
  useIsoMorphicEffect(() => {
    if (!element)
      return;
    let observer = new ResizeObserver(forceRerender);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element]);
  if (unit) {
    return {
      width: `${size4.width}px`,
      height: `${size4.height}px`
    };
  }
  return size4;
}

// src/hooks/use-is-top-layer.ts
var import_react31 = require("react");

// src/utils/default-map.ts
var DefaultMap = class extends Map {
  constructor(factory) {
    super();
    this.factory = factory;
  }
  get(key) {
    let value = super.get(key);
    if (value === void 0) {
      value = this.factory(key);
      this.set(key, value);
    }
    return value;
  }
};

// src/utils/store.ts
function createStore(initial, actions) {
  let state = initial();
  let listeners = /* @__PURE__ */ new Set();
  return {
    getSnapshot() {
      return state;
    },
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    dispatch(key, ...args) {
      let newState = actions[key].call(state, ...args);
      if (newState) {
        state = newState;
        listeners.forEach((listener) => listener());
      }
    }
  };
}

// src/hooks/use-store.ts
var import_react30 = require("react");
function useStore(store) {
  return (0, import_react30.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getSnapshot);
}

// src/hooks/use-is-top-layer.ts
var hierarchyStores = new DefaultMap(
  () => createStore(() => [], {
    ADD(id) {
      if (this.includes(id))
        return this;
      return [...this, id];
    },
    REMOVE(id) {
      let idx = this.indexOf(id);
      if (idx === -1)
        return this;
      let copy = this.slice();
      copy.splice(idx, 1);
      return copy;
    }
  })
);
function useIsTopLayer(enabled, scope) {
  let hierarchyStore = hierarchyStores.get(scope);
  let id = (0, import_react31.useId)();
  let hierarchy = useStore(hierarchyStore);
  useIsoMorphicEffect(() => {
    if (!enabled)
      return;
    hierarchyStore.dispatch("ADD", id);
    return () => hierarchyStore.dispatch("REMOVE", id);
  }, [hierarchyStore, enabled]);
  if (!enabled)
    return false;
  let idx = hierarchy.indexOf(id);
  let hierarchyLength = hierarchy.length;
  if (idx === -1) {
    idx = hierarchyLength;
    hierarchyLength += 1;
  }
  return idx === hierarchyLength - 1;
}

// src/hooks/use-inert-others.tsx
var originals = /* @__PURE__ */ new Map();
var counts = /* @__PURE__ */ new Map();
function markInert(element) {
  var _a3;
  let count2 = (_a3 = counts.get(element)) != null ? _a3 : 0;
  counts.set(element, count2 + 1);
  if (count2 !== 0)
    return () => markNotInert(element);
  originals.set(element, {
    "aria-hidden": element.getAttribute("aria-hidden"),
    inert: element.inert
  });
  element.setAttribute("aria-hidden", "true");
  element.inert = true;
  return () => markNotInert(element);
}
function markNotInert(element) {
  var _a3;
  let count2 = (_a3 = counts.get(element)) != null ? _a3 : 1;
  if (count2 === 1)
    counts.delete(element);
  else
    counts.set(element, count2 - 1);
  if (count2 !== 1)
    return;
  let original = originals.get(element);
  if (!original)
    return;
  if (original["aria-hidden"] === null)
    element.removeAttribute("aria-hidden");
  else
    element.setAttribute("aria-hidden", original["aria-hidden"]);
  element.inert = original.inert;
  originals.delete(element);
}
function useInertOthers(enabled, {
  allowed,
  disallowed
} = {}) {
  let isTopLayer2 = useIsTopLayer(enabled, "inert-others");
  useIsoMorphicEffect(() => {
    var _a3, _b2;
    if (!isTopLayer2)
      return;
    let d = disposables();
    for (let element of (_a3 = disallowed == null ? void 0 : disallowed()) != null ? _a3 : []) {
      if (!element)
        continue;
      d.add(markInert(element));
    }
    let allowedElements = (_b2 = allowed == null ? void 0 : allowed()) != null ? _b2 : [];
    for (let element of allowedElements) {
      if (!element)
        continue;
      let ownerDocument = getOwnerDocument(element);
      if (!ownerDocument)
        continue;
      let parent = element.parentElement;
      while (parent && parent !== ownerDocument.body) {
        for (let node of parent.children) {
          if (allowedElements.some((el) => node.contains(el)))
            continue;
          d.add(markInert(node));
        }
        parent = parent.parentElement;
      }
    }
    return d.dispose;
  }, [isTopLayer2, allowed, disallowed]);
}

// src/hooks/use-on-disappear.ts
var import_react32 = require("react");
function useOnDisappear(enabled, ref, cb) {
  let listenerRef = useLatestValue((element) => {
    let rect = element.getBoundingClientRect();
    if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
      cb();
    }
  });
  (0, import_react32.useEffect)(() => {
    if (!enabled)
      return;
    let element = ref === null ? null : ref instanceof HTMLElement ? ref : ref.current;
    if (!element)
      return;
    let d = disposables();
    if (typeof ResizeObserver !== "undefined") {
      let observer = new ResizeObserver(() => listenerRef.current(element));
      observer.observe(element);
      d.add(() => observer.disconnect());
    }
    if (typeof IntersectionObserver !== "undefined") {
      let observer = new IntersectionObserver(() => listenerRef.current(element));
      observer.observe(element);
      d.add(() => observer.disconnect());
    }
    return () => d.dispose();
  }, [ref, listenerRef, enabled]);
}

// src/hooks/use-outside-click.ts
var import_react35 = require("react");

// src/utils/focus-management.ts
var focusableSelector = [
  "[contentEditable=true]",
  "[tabindex]",
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "iframe",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])"
].map(
  false ? (
    // TODO: Remove this once JSDOM fixes the issue where an element that is
    // "hidden" can be the document.activeElement, because this is not possible
    // in real browsers.
    (selector) => `${selector}:not([tabindex='-1']):not([style*='display: none'])`
  ) : (selector) => `${selector}:not([tabindex='-1'])`
).join(",");
var autoFocusableSelector = [
  // In a perfect world this was just `autofocus`, but React doesn't pass `autofocus` to the DOM...
  "[data-autofocus]"
].map(
  false ? (
    // TODO: Remove this once JSDOM fixes the issue where an element that is
    // "hidden" can be the document.activeElement, because this is not possible
    // in real browsers.
    (selector) => `${selector}:not([tabindex='-1']):not([style*='display: none'])`
  ) : (selector) => `${selector}:not([tabindex='-1'])`
).join(",");
function getFocusableElements(container = document.body) {
  if (container == null)
    return [];
  return Array.from(container.querySelectorAll(focusableSelector)).sort(
    // We want to move `tabIndex={0}` to the end of the list, this is what the browser does as well.
    (a, z) => Math.sign((a.tabIndex || Number.MAX_SAFE_INTEGER) - (z.tabIndex || Number.MAX_SAFE_INTEGER))
  );
}
function getAutoFocusableElements(container = document.body) {
  if (container == null)
    return [];
  return Array.from(container.querySelectorAll(autoFocusableSelector)).sort(
    // We want to move `tabIndex={0}` to the end of the list, this is what the browser does as well.
    (a, z) => Math.sign((a.tabIndex || Number.MAX_SAFE_INTEGER) - (z.tabIndex || Number.MAX_SAFE_INTEGER))
  );
}
function isFocusableElement(element, mode = 0 /* Strict */) {
  var _a3;
  if (element === ((_a3 = getOwnerDocument(element)) == null ? void 0 : _a3.body))
    return false;
  return match(mode, {
    [0 /* Strict */]() {
      return element.matches(focusableSelector);
    },
    [1 /* Loose */]() {
      let next = element;
      while (next !== null) {
        if (next.matches(focusableSelector))
          return true;
        next = next.parentElement;
      }
      return false;
    }
  });
}
function restoreFocusIfNecessary(element) {
  let ownerDocument = getOwnerDocument(element);
  disposables().nextFrame(() => {
    if (ownerDocument && !isFocusableElement(ownerDocument.activeElement, 0 /* Strict */)) {
      focusElement(element);
    }
  });
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.metaKey || event.altKey || event.ctrlKey) {
        return;
      }
      document.documentElement.dataset.headlessuiFocusVisible = "";
    },
    true
  );
  document.addEventListener(
    "click",
    (event) => {
      if (event.detail === 1 /* Mouse */) {
        delete document.documentElement.dataset.headlessuiFocusVisible;
      } else if (event.detail === 0 /* Keyboard */) {
        document.documentElement.dataset.headlessuiFocusVisible = "";
      }
    },
    true
  );
}
function focusElement(element) {
  element == null ? void 0 : element.focus({ preventScroll: true });
}
var selectableSelector = ["textarea", "input"].join(",");
function isSelectableElement(element) {
  var _a3, _b2;
  return (_b2 = (_a3 = element == null ? void 0 : element.matches) == null ? void 0 : _a3.call(element, selectableSelector)) != null ? _b2 : false;
}
function sortByDomNode(nodes, resolveKey = (i) => i) {
  return nodes.slice().sort((aItem, zItem) => {
    let a = resolveKey(aItem);
    let z = resolveKey(zItem);
    if (a === null || z === null)
      return 0;
    let position = a.compareDocumentPosition(z);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING)
      return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING)
      return 1;
    return 0;
  });
}
function focusFrom(current, focus) {
  return focusIn(getFocusableElements(), focus, { relativeTo: current });
}
function focusIn(container, focus, {
  sorted = true,
  relativeTo = null,
  skipElements = []
} = {}) {
  let ownerDocument = Array.isArray(container) ? container.length > 0 ? container[0].ownerDocument : document : container.ownerDocument;
  let elements = Array.isArray(container) ? sorted ? sortByDomNode(container) : container : focus & 64 /* AutoFocus */ ? getAutoFocusableElements(container) : getFocusableElements(container);
  if (skipElements.length > 0 && elements.length > 1) {
    elements = elements.filter(
      (element) => !skipElements.some(
        (skipElement) => skipElement != null && "current" in skipElement ? (skipElement == null ? void 0 : skipElement.current) === element : skipElement === element
        // Handle HTMLElement directly
      )
    );
  }
  relativeTo = relativeTo != null ? relativeTo : ownerDocument.activeElement;
  let direction = (() => {
    if (focus & (1 /* First */ | 4 /* Next */))
      return 1 /* Next */;
    if (focus & (2 /* Previous */ | 8 /* Last */))
      return -1 /* Previous */;
    throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
  })();
  let startIndex = (() => {
    if (focus & 1 /* First */)
      return 0;
    if (focus & 2 /* Previous */)
      return Math.max(0, elements.indexOf(relativeTo)) - 1;
    if (focus & 4 /* Next */)
      return Math.max(0, elements.indexOf(relativeTo)) + 1;
    if (focus & 8 /* Last */)
      return elements.length - 1;
    throw new Error("Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last");
  })();
  let focusOptions = focus & 32 /* NoScroll */ ? { preventScroll: true } : {};
  let offset4 = 0;
  let total = elements.length;
  let next = void 0;
  do {
    if (offset4 >= total || offset4 + total <= 0)
      return 0 /* Error */;
    let nextIdx = startIndex + offset4;
    if (focus & 16 /* WrapAround */) {
      nextIdx = (nextIdx + total) % total;
    } else {
      if (nextIdx < 0)
        return 3 /* Underflow */;
      if (nextIdx >= total)
        return 1 /* Overflow */;
    }
    next = elements[nextIdx];
    next == null ? void 0 : next.focus(focusOptions);
    offset4 += direction;
  } while (next !== ownerDocument.activeElement);
  if (focus & (4 /* Next */ | 2 /* Previous */) && isSelectableElement(next)) {
    next.select();
  }
  return 2 /* Success */;
}

// src/utils/platform.ts
function isIOS() {
  return (
    // Check if it is an iPhone
    /iPhone/gi.test(window.navigator.platform) || // Check if it is an iPad. iPad reports itself as "MacIntel", but we can check if it is a touch
    // screen. Let's hope that Apple doesn't release a touch screen Mac (or maybe this would then
    // work as expected 🤔).
    /Mac/gi.test(window.navigator.platform) && window.navigator.maxTouchPoints > 0
  );
}
function isAndroid() {
  return /Android/gi.test(window.navigator.userAgent);
}
function isMobile() {
  return isIOS() || isAndroid();
}

// src/hooks/use-document-event.ts
var import_react33 = require("react");
function useDocumentEvent(enabled, type, listener, options) {
  let listenerRef = useLatestValue(listener);
  (0, import_react33.useEffect)(() => {
    if (!enabled)
      return;
    function handler(event) {
      listenerRef.current(event);
    }
    document.addEventListener(type, handler, options);
    return () => document.removeEventListener(type, handler, options);
  }, [enabled, type, options]);
}

// src/hooks/use-window-event.ts
var import_react34 = require("react");
function useWindowEvent(enabled, type, listener, options) {
  let listenerRef = useLatestValue(listener);
  (0, import_react34.useEffect)(() => {
    if (!enabled)
      return;
    function handler(event) {
      listenerRef.current(event);
    }
    window.addEventListener(type, handler, options);
    return () => window.removeEventListener(type, handler, options);
  }, [enabled, type, options]);
}

// src/hooks/use-outside-click.ts
var MOVE_THRESHOLD_PX = 30;
function useOutsideClick(enabled, containers, cb) {
  let isTopLayer2 = useIsTopLayer(enabled, "outside-click");
  let cbRef = useLatestValue(cb);
  let handleOutsideClick = (0, import_react35.useCallback)(
    function handleOutsideClick2(event, resolveTarget) {
      if (event.defaultPrevented)
        return;
      let target = resolveTarget(event);
      if (target === null) {
        return;
      }
      if (!target.getRootNode().contains(target))
        return;
      if (!target.isConnected)
        return;
      let _containers = function resolve(containers2) {
        if (typeof containers2 === "function") {
          return resolve(containers2());
        }
        if (Array.isArray(containers2)) {
          return containers2;
        }
        if (containers2 instanceof Set) {
          return containers2;
        }
        return [containers2];
      }(containers);
      for (let container of _containers) {
        if (container === null)
          continue;
        if (container.contains(target)) {
          return;
        }
        if (event.composed && event.composedPath().includes(container)) {
          return;
        }
      }
      if (
        // This check allows us to know whether or not we clicked on a
        // "focusable" element like a button or an input. This is a backwards
        // compatibility check so that you can open a <Menu /> and click on
        // another <Menu /> which should close Menu A and open Menu B. We might
        // revisit that so that you will require 2 clicks instead.
        !isFocusableElement(target, 1 /* Loose */) && // This could be improved, but the `Combobox.Button` adds tabIndex={-1}
        // to make it unfocusable via the keyboard so that tabbing to the next
        // item from the input doesn't first go to the button.
        target.tabIndex !== -1
      ) {
        event.preventDefault();
      }
      return cbRef.current(event, target);
    },
    [cbRef, containers]
  );
  let initialClickTarget = (0, import_react35.useRef)(null);
  useDocumentEvent(
    isTopLayer2,
    "pointerdown",
    (event) => {
      var _a3, _b2;
      initialClickTarget.current = ((_b2 = (_a3 = event.composedPath) == null ? void 0 : _a3.call(event)) == null ? void 0 : _b2[0]) || event.target;
    },
    true
  );
  useDocumentEvent(
    isTopLayer2,
    "mousedown",
    (event) => {
      var _a3, _b2;
      initialClickTarget.current = ((_b2 = (_a3 = event.composedPath) == null ? void 0 : _a3.call(event)) == null ? void 0 : _b2[0]) || event.target;
    },
    true
  );
  useDocumentEvent(
    isTopLayer2,
    "click",
    (event) => {
      if (isMobile()) {
        return;
      }
      if (!initialClickTarget.current) {
        return;
      }
      handleOutsideClick(event, () => {
        return initialClickTarget.current;
      });
      initialClickTarget.current = null;
    },
    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  );
  let startPosition = (0, import_react35.useRef)({ x: 0, y: 0 });
  useDocumentEvent(
    isTopLayer2,
    "touchstart",
    (event) => {
      startPosition.current.x = event.touches[0].clientX;
      startPosition.current.y = event.touches[0].clientY;
    },
    true
  );
  useDocumentEvent(
    isTopLayer2,
    "touchend",
    (event) => {
      let endPosition = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
      if (Math.abs(endPosition.x - startPosition.current.x) >= MOVE_THRESHOLD_PX || Math.abs(endPosition.y - startPosition.current.y) >= MOVE_THRESHOLD_PX) {
        return;
      }
      return handleOutsideClick(event, () => {
        if (event.target instanceof HTMLElement) {
          return event.target;
        }
        return null;
      });
    },
    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  );
  useWindowEvent(
    isTopLayer2,
    "blur",
    (event) => {
      return handleOutsideClick(event, () => {
        return window.document.activeElement instanceof HTMLIFrameElement ? window.document.activeElement : null;
      });
    },
    true
  );
}

// src/hooks/use-owner.ts
var import_react36 = require("react");
function useOwnerDocument(...args) {
  return (0, import_react36.useMemo)(() => getOwnerDocument(...args), [...args]);
}

// src/hooks/use-refocusable-input.ts
var import_react38 = require("react");

// src/hooks/use-event-listener.ts
var import_react37 = require("react");
function useEventListener(element, type, listener, options) {
  let listenerRef = useLatestValue(listener);
  (0, import_react37.useEffect)(() => {
    element = element != null ? element : window;
    function handler(event) {
      listenerRef.current(event);
    }
    element.addEventListener(type, handler, options);
    return () => element.removeEventListener(type, handler, options);
  }, [element, type, options]);
}

// src/hooks/use-refocusable-input.ts
function useRefocusableInput(input) {
  let info = (0, import_react38.useRef)({
    value: "",
    selectionStart: null,
    selectionEnd: null
  });
  useEventListener(input, "blur", (event) => {
    let target = event.target;
    if (!(target instanceof HTMLInputElement))
      return;
    info.current = {
      value: target.value,
      selectionStart: target.selectionStart,
      selectionEnd: target.selectionEnd
    };
  });
  return useEvent(() => {
    if (document.activeElement === input)
      return;
    if (!(input instanceof HTMLInputElement))
      return;
    if (!input.isConnected)
      return;
    input.focus({ preventScroll: true });
    if (input.value !== info.current.value) {
      input.setSelectionRange(input.value.length, input.value.length);
    } else {
      let { selectionStart, selectionEnd } = info.current;
      if (selectionStart !== null && selectionEnd !== null) {
        input.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    info.current = { value: "", selectionStart: null, selectionEnd: null };
  });
}

// src/hooks/use-resolve-button-type.ts
var import_react39 = require("react");
function useResolveButtonType(props, element) {
  return (0, import_react39.useMemo)(() => {
    var _a3;
    if (props.type)
      return props.type;
    let tag = (_a3 = props.as) != null ? _a3 : "button";
    if (typeof tag === "string" && tag.toLowerCase() === "button")
      return "button";
    if ((element == null ? void 0 : element.tagName) === "BUTTON" && !element.hasAttribute("type"))
      return "button";
    return void 0;
  }, [props.type, props.as, element]);
}

// src/hooks/document-overflow/adjust-scrollbar-padding.ts
function adjustScrollbarPadding() {
  let scrollbarWidthBefore;
  return {
    before({ doc }) {
      var _a3;
      let documentElement = doc.documentElement;
      let ownerWindow = (_a3 = doc.defaultView) != null ? _a3 : window;
      scrollbarWidthBefore = Math.max(0, ownerWindow.innerWidth - documentElement.clientWidth);
    },
    after({ doc, d }) {
      let documentElement = doc.documentElement;
      let scrollbarWidthAfter = Math.max(
        0,
        documentElement.clientWidth - documentElement.offsetWidth
      );
      let scrollbarWidth = Math.max(0, scrollbarWidthBefore - scrollbarWidthAfter);
      d.style(documentElement, "paddingRight", `${scrollbarWidth}px`);
    }
  };
}

// src/hooks/document-overflow/handle-ios-locking.ts
function handleIOSLocking() {
  if (!isIOS()) {
    return {};
  }
  return {
    before({ doc, d, meta }) {
      function inAllowedContainer(el) {
        return meta.containers.flatMap((resolve) => resolve()).some((container) => container.contains(el));
      }
      d.microTask(() => {
        var _a3;
        if (window.getComputedStyle(doc.documentElement).scrollBehavior !== "auto") {
          let _d = disposables();
          _d.style(doc.documentElement, "scrollBehavior", "auto");
          d.add(() => d.microTask(() => _d.dispose()));
        }
        let scrollPosition = (_a3 = window.scrollY) != null ? _a3 : window.pageYOffset;
        let scrollToElement = null;
        d.addEventListener(
          doc,
          "click",
          (e) => {
            if (!(e.target instanceof HTMLElement)) {
              return;
            }
            try {
              let anchor = e.target.closest("a");
              if (!anchor)
                return;
              let { hash } = new URL(anchor.href);
              let el = doc.querySelector(hash);
              if (el && !inAllowedContainer(el)) {
                scrollToElement = el;
              }
            } catch (err) {
            }
          },
          true
        );
        d.addEventListener(doc, "touchstart", (e) => {
          if (e.target instanceof HTMLElement) {
            if (inAllowedContainer(e.target)) {
              let rootContainer = e.target;
              while (rootContainer.parentElement && inAllowedContainer(rootContainer.parentElement)) {
                rootContainer = rootContainer.parentElement;
              }
              d.style(rootContainer, "overscrollBehavior", "contain");
            } else {
              d.style(e.target, "touchAction", "none");
            }
          }
        });
        d.addEventListener(
          doc,
          "touchmove",
          (e) => {
            if (e.target instanceof HTMLElement) {
              if (e.target.tagName === "INPUT") {
                return;
              }
              if (inAllowedContainer(e.target)) {
                let scrollableParent = e.target;
                while (scrollableParent.parentElement && // Assumption: We are always used in a Headless UI Portal. Once we reach the
                // portal itself, we can stop crawling up the tree.
                scrollableParent.dataset.headlessuiPortal !== "") {
                  if (scrollableParent.scrollHeight > scrollableParent.clientHeight || scrollableParent.scrollWidth > scrollableParent.clientWidth) {
                    break;
                  }
                  scrollableParent = scrollableParent.parentElement;
                }
                if (scrollableParent.dataset.headlessuiPortal === "") {
                  e.preventDefault();
                }
              } else {
                e.preventDefault();
              }
            }
          },
          { passive: false }
        );
        d.add(() => {
          var _a4;
          let newScrollPosition = (_a4 = window.scrollY) != null ? _a4 : window.pageYOffset;
          if (scrollPosition !== newScrollPosition) {
            window.scrollTo(0, scrollPosition);
          }
          if (scrollToElement && scrollToElement.isConnected) {
            scrollToElement.scrollIntoView({ block: "nearest" });
            scrollToElement = null;
          }
        });
      });
    }
  };
}

// src/hooks/document-overflow/prevent-scroll.ts
function preventScroll() {
  return {
    before({ doc, d }) {
      d.style(doc.documentElement, "overflow", "hidden");
    }
  };
}

// src/hooks/document-overflow/overflow-store.ts
function buildMeta(fns) {
  let tmp = {};
  for (let fn of fns) {
    Object.assign(tmp, fn(tmp));
  }
  return tmp;
}
var overflows = createStore(() => /* @__PURE__ */ new Map(), {
  PUSH(doc, meta) {
    var _a3;
    let entry = (_a3 = this.get(doc)) != null ? _a3 : {
      doc,
      count: 0,
      d: disposables(),
      meta: /* @__PURE__ */ new Set()
    };
    entry.count++;
    entry.meta.add(meta);
    this.set(doc, entry);
    return this;
  },
  POP(doc, meta) {
    let entry = this.get(doc);
    if (entry) {
      entry.count--;
      entry.meta.delete(meta);
    }
    return this;
  },
  SCROLL_PREVENT({ doc, d, meta }) {
    let ctx = {
      doc,
      d,
      meta: buildMeta(meta)
    };
    let steps = [
      handleIOSLocking(),
      adjustScrollbarPadding(),
      preventScroll()
    ];
    steps.forEach(({ before }) => before == null ? void 0 : before(ctx));
    steps.forEach(({ after }) => after == null ? void 0 : after(ctx));
  },
  SCROLL_ALLOW({ d }) {
    d.dispose();
  },
  TEARDOWN({ doc }) {
    this.delete(doc);
  }
});
overflows.subscribe(() => {
  let docs = overflows.getSnapshot();
  let styles = /* @__PURE__ */ new Map();
  for (let [doc] of docs) {
    styles.set(doc, doc.documentElement.style.overflow);
  }
  for (let entry of docs.values()) {
    let isHidden = styles.get(entry.doc) === "hidden";
    let isLocked = entry.count !== 0;
    let willChange = isLocked && !isHidden || !isLocked && isHidden;
    if (willChange) {
      overflows.dispatch(entry.count > 0 ? "SCROLL_PREVENT" : "SCROLL_ALLOW", entry);
    }
    if (entry.count === 0) {
      overflows.dispatch("TEARDOWN", entry);
    }
  }
});

// src/hooks/document-overflow/use-document-overflow.ts
function useDocumentOverflowLockedEffect(shouldBeLocked, doc, meta = () => ({ containers: [] })) {
  let store = useStore(overflows);
  let entry = doc ? store.get(doc) : void 0;
  let locked = entry ? entry.count > 0 : false;
  useIsoMorphicEffect(() => {
    if (!doc || !shouldBeLocked) {
      return;
    }
    overflows.dispatch("PUSH", doc, meta);
    return () => overflows.dispatch("POP", doc, meta);
  }, [shouldBeLocked, doc]);
  return locked;
}

// src/hooks/use-scroll-lock.ts
function useScrollLock(enabled, ownerDocument, resolveAllowedContainers = () => [document.body]) {
  let isTopLayer2 = useIsTopLayer(enabled, "scroll-lock");
  useDocumentOverflowLockedEffect(isTopLayer2, ownerDocument, (meta) => {
    var _a3;
    return {
      containers: [...(_a3 = meta.containers) != null ? _a3 : [], resolveAllowedContainers]
    };
  });
}

// src/hooks/use-tracked-pointer.ts
var import_react40 = require("react");
function eventToPosition(evt) {
  return [evt.screenX, evt.screenY];
}
function useTrackedPointer() {
  let lastPos = (0, import_react40.useRef)([-1, -1]);
  return {
    wasMoved(evt) {
      if (false) {
        return true;
      }
      let newPos = eventToPosition(evt);
      if (lastPos.current[0] === newPos[0] && lastPos.current[1] === newPos[1]) {
        return false;
      }
      lastPos.current = newPos;
      return true;
    },
    update(evt) {
      lastPos.current = eventToPosition(evt);
    }
  };
}

// src/hooks/use-transition.ts
var import_react42 = require("react");

// src/hooks/use-flags.ts
var import_react41 = require("react");
function useFlags(initialFlags = 0) {
  let [flags, setFlags] = (0, import_react41.useState)(initialFlags);
  let setFlag = (0, import_react41.useCallback)((flag) => setFlags(flag), [flags]);
  let addFlag = (0, import_react41.useCallback)((flag) => setFlags((flags2) => flags2 | flag), [flags]);
  let hasFlag = (0, import_react41.useCallback)((flag) => (flags & flag) === flag, [flags]);
  let removeFlag = (0, import_react41.useCallback)((flag) => setFlags((flags2) => flags2 & ~flag), [setFlags]);
  let toggleFlag = (0, import_react41.useCallback)((flag) => setFlags((flags2) => flags2 ^ flag), [setFlags]);
  return { flags, setFlag, addFlag, hasFlag, removeFlag, toggleFlag };
}

// src/hooks/use-transition.ts
var _a, _b;
if (typeof process !== "undefined" && typeof globalThis !== "undefined" && typeof Element !== "undefined" && // Strange string concatenation is on purpose to prevent `esbuild` from
// replacing `process.env.NODE_ENV` with `production` in the build output,
// eliminating this whole branch.
((_a = process == null ? void 0 : process.env) == null ? void 0 : _a["NODE_ENV"]) === "test") {
  if (typeof ((_b = Element == null ? void 0 : Element.prototype) == null ? void 0 : _b.getAnimations) === "undefined") {
    Element.prototype.getAnimations = function getAnimationsPolyfill() {
      console.warn(
        [
          "Headless UI has polyfilled `Element.prototype.getAnimations` for your tests.",
          "Please install a proper polyfill e.g. `jsdom-testing-mocks`, to silence these warnings.",
          "",
          "Example usage:",
          "```js",
          "import { mockAnimationsApi } from 'jsdom-testing-mocks'",
          "mockAnimationsApi()",
          "```"
        ].join("\n")
      );
      return [];
    };
  }
}
function transitionDataAttributes(data) {
  let attributes = {};
  for (let key in data) {
    if (data[key] === true) {
      attributes[`data-${key}`] = "";
    }
  }
  return attributes;
}
function useTransition(enabled, element, show, events) {
  let [visible, setVisible] = (0, import_react42.useState)(show);
  let { hasFlag, addFlag, removeFlag } = useFlags(
    enabled && visible ? 2 /* Enter */ | 1 /* Closed */ : 0 /* None */
  );
  let inFlight = (0, import_react42.useRef)(false);
  let cancelledRef = (0, import_react42.useRef)(false);
  let d = useDisposables();
  useIsoMorphicEffect(() => {
    var _a3;
    if (!enabled)
      return;
    if (show) {
      setVisible(true);
    }
    if (!element) {
      if (show) {
        addFlag(2 /* Enter */ | 1 /* Closed */);
      }
      return;
    }
    (_a3 = events == null ? void 0 : events.start) == null ? void 0 : _a3.call(events, show);
    return transition(element, {
      inFlight,
      prepare() {
        if (cancelledRef.current) {
          cancelledRef.current = false;
        } else {
          cancelledRef.current = inFlight.current;
        }
        inFlight.current = true;
        if (cancelledRef.current)
          return;
        if (show) {
          addFlag(2 /* Enter */ | 1 /* Closed */);
          removeFlag(4 /* Leave */);
        } else {
          addFlag(4 /* Leave */);
          removeFlag(2 /* Enter */);
        }
      },
      run() {
        if (cancelledRef.current) {
          if (show) {
            removeFlag(2 /* Enter */ | 1 /* Closed */);
            addFlag(4 /* Leave */);
          } else {
            removeFlag(4 /* Leave */);
            addFlag(2 /* Enter */ | 1 /* Closed */);
          }
        } else {
          if (show) {
            removeFlag(1 /* Closed */);
          } else {
            addFlag(1 /* Closed */);
          }
        }
      },
      done() {
        var _a4;
        if (cancelledRef.current) {
          if (typeof element.getAnimations === "function" && element.getAnimations().length > 0) {
            return;
          }
        }
        inFlight.current = false;
        removeFlag(2 /* Enter */ | 4 /* Leave */ | 1 /* Closed */);
        if (!show) {
          setVisible(false);
        }
        (_a4 = events == null ? void 0 : events.end) == null ? void 0 : _a4.call(events, show);
      }
    });
  }, [enabled, show, element, d]);
  if (!enabled) {
    return [
      show,
      {
        closed: void 0,
        enter: void 0,
        leave: void 0,
        transition: void 0
      }
    ];
  }
  return [
    visible,
    {
      closed: hasFlag(1 /* Closed */),
      enter: hasFlag(2 /* Enter */),
      leave: hasFlag(4 /* Leave */),
      transition: hasFlag(2 /* Enter */) || hasFlag(4 /* Leave */)
    }
  ];
}
function transition(node, {
  prepare,
  run,
  done,
  inFlight
}) {
  let d = disposables();
  prepareTransition(node, {
    prepare,
    inFlight
  });
  d.nextFrame(() => {
    run();
    d.requestAnimationFrame(() => {
      d.add(waitForTransition(node, done));
    });
  });
  return d.dispose;
}
function waitForTransition(node, done) {
  var _a3, _b2;
  let d = disposables();
  if (!node)
    return d.dispose;
  let cancelled = false;
  d.add(() => {
    cancelled = true;
  });
  let transitions = (_b2 = (_a3 = node.getAnimations) == null ? void 0 : _a3.call(node).filter((animation) => animation instanceof CSSTransition)) != null ? _b2 : [];
  if (transitions.length === 0) {
    done();
    return d.dispose;
  }
  Promise.allSettled(transitions.map((transition2) => transition2.finished)).then(() => {
    if (!cancelled) {
      done();
    }
  });
  return d.dispose;
}
function prepareTransition(node, { inFlight, prepare }) {
  if (inFlight == null ? void 0 : inFlight.current) {
    prepare();
    return;
  }
  let previous = node.style.transition;
  node.style.transition = "none";
  prepare();
  node.offsetHeight;
  node.style.transition = previous;
}

// src/hooks/use-tree-walker.ts
var import_react43 = require("react");
function useTreeWalker(enabled, {
  container,
  accept,
  walk
}) {
  let acceptRef = (0, import_react43.useRef)(accept);
  let walkRef = (0, import_react43.useRef)(walk);
  (0, import_react43.useEffect)(() => {
    acceptRef.current = accept;
    walkRef.current = walk;
  }, [accept, walk]);
  useIsoMorphicEffect(() => {
    if (!container)
      return;
    if (!enabled)
      return;
    let ownerDocument = getOwnerDocument(container);
    if (!ownerDocument)
      return;
    let accept2 = acceptRef.current;
    let walk2 = walkRef.current;
    let acceptNode = Object.assign((node) => accept2(node), { acceptNode: accept2 });
    let walker = ownerDocument.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      acceptNode,
      // @ts-expect-error This `false` is a simple small fix for older browsers
      false
    );
    while (walker.nextNode())
      walk2(walker.currentNode);
  }, [container, enabled, acceptRef, walkRef]);
}

// src/hooks/use-watch.ts
var import_react44 = require("react");
function useWatch(cb, dependencies) {
  let track = (0, import_react44.useRef)([]);
  let action = useEvent(cb);
  (0, import_react44.useEffect)(() => {
    let oldValues = [...track.current];
    for (let [idx, value] of dependencies.entries()) {
      if (track.current[idx] !== value) {
        let returnValue = action(dependencies, oldValues);
        track.current = dependencies;
        return returnValue;
      }
    }
  }, [action, ...dependencies]);
}

// node_modules/@floating-ui/react/dist/floating-ui.react.mjs
var React13 = __toESM(require("react"), 1);
var import_react46 = require("react");

// ../../node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element) {
  return ["table", "td", "th"].includes(getNodeName(element));
}
function isTopLayer(element) {
  return [":popover-open", ":modal"].some((selector) => {
    try {
      return element.matches(selector);
    } catch (e) {
      return false;
    }
  });
}
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle2(elementOrCss) : elementOrCss;
  return css.transform !== "none" || css.perspective !== "none" || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports)
    return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// node_modules/@floating-ui/react/dist/floating-ui.react.utils.mjs
function getUserAgent() {
  const uaData = navigator.userAgentData;
  if (uaData && Array.isArray(uaData.brands)) {
    return uaData.brands.map((_ref) => {
      let {
        brand,
        version
      } = _ref;
      return brand + "/" + version;
    }).join(" ");
  }
  return navigator.userAgent;
}

// ../../node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var min = Math.min;
var max = Math.max;
var round = Math.round;
var floor = Math.floor;
var createCoords = (v) => ({
  x: v,
  y: v
});
var oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
var oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ["left", "right"];
  const rl = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl)
        return isStart ? rl : lr;
      return isStart ? lr : rl;
    case "left":
    case "right":
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

// node_modules/@floating-ui/react/dist/floating-ui.react.mjs
var ReactDOM2 = __toESM(require("react-dom"), 1);

// ../../node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
var computePosition = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
var flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows2 = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows2.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows2.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows: overflows2
      }];
      if (!overflows2.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
var shift = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x2,
              y: y2
            } = _ref;
            return {
              x: x2,
              y: y2
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
var size = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      var _state$middlewareData, _state$middlewareData2;
      const {
        placement,
        rects,
        platform: platform2,
        elements
      } = state;
      const {
        apply = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};

// ../../node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css = getComputedStyle2(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
  if (ignoreScrollbarX === void 0) {
    ignoreScrollbarX = false;
  }
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 : (
    // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect)
  ));
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle2(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle2(element).direction === "rtl";
}
var platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var detectOverflow2 = detectOverflow;
var offset2 = offset;
var shift2 = shift;
var flip2 = flip;
var size2 = size;
var computePosition2 = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

// ../../node_modules/@floating-ui/react-dom/dist/floating-ui.react-dom.mjs
var React12 = __toESM(require("react"), 1);
var import_react45 = require("react");
var ReactDOM = __toESM(require("react-dom"), 1);
var index = typeof document !== "undefined" ? import_react45.useLayoutEffect : import_react45.useEffect;
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === "function" && a.toString() === b.toString()) {
    return true;
  }
  let length;
  let i;
  let keys;
  if (a && b && typeof a === "object") {
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length)
        return false;
      for (i = length; i-- !== 0; ) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) {
      return false;
    }
    for (i = length; i-- !== 0; ) {
      if (!{}.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (key === "_owner" && a.$$typeof) {
        continue;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return a !== a && b !== b;
}
function getDPR(element) {
  if (typeof window === "undefined") {
    return 1;
  }
  const win = element.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element, value) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}
function useLatestRef(value) {
  const ref = React12.useRef(value);
  index(() => {
    ref.current = value;
  });
  return ref;
}
function useFloating(options) {
  if (options === void 0) {
    options = {};
  }
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2,
    elements: {
      reference: externalReference,
      floating: externalFloating
    } = {},
    transform = true,
    whileElementsMounted,
    open
  } = options;
  const [data, setData] = React12.useState({
    x: 0,
    y: 0,
    strategy,
    placement,
    middlewareData: {},
    isPositioned: false
  });
  const [latestMiddleware, setLatestMiddleware] = React12.useState(middleware);
  if (!deepEqual(latestMiddleware, middleware)) {
    setLatestMiddleware(middleware);
  }
  const [_reference, _setReference] = React12.useState(null);
  const [_floating, _setFloating] = React12.useState(null);
  const setReference = React12.useCallback((node) => {
    if (node !== referenceRef.current) {
      referenceRef.current = node;
      _setReference(node);
    }
  }, []);
  const setFloating = React12.useCallback((node) => {
    if (node !== floatingRef.current) {
      floatingRef.current = node;
      _setFloating(node);
    }
  }, []);
  const referenceEl = externalReference || _reference;
  const floatingEl = externalFloating || _floating;
  const referenceRef = React12.useRef(null);
  const floatingRef = React12.useRef(null);
  const dataRef = React12.useRef(data);
  const hasWhileElementsMounted = whileElementsMounted != null;
  const whileElementsMountedRef = useLatestRef(whileElementsMounted);
  const platformRef = useLatestRef(platform2);
  const openRef = useLatestRef(open);
  const update = React12.useCallback(() => {
    if (!referenceRef.current || !floatingRef.current) {
      return;
    }
    const config = {
      placement,
      strategy,
      middleware: latestMiddleware
    };
    if (platformRef.current) {
      config.platform = platformRef.current;
    }
    computePosition2(referenceRef.current, floatingRef.current, config).then((data2) => {
      const fullData = {
        ...data2,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: openRef.current !== false
      };
      if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
        dataRef.current = fullData;
        ReactDOM.flushSync(() => {
          setData(fullData);
        });
      }
    });
  }, [latestMiddleware, placement, strategy, platformRef, openRef]);
  index(() => {
    if (open === false && dataRef.current.isPositioned) {
      dataRef.current.isPositioned = false;
      setData((data2) => ({
        ...data2,
        isPositioned: false
      }));
    }
  }, [open]);
  const isMountedRef = React12.useRef(false);
  index(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  index(() => {
    if (referenceEl)
      referenceRef.current = referenceEl;
    if (floatingEl)
      floatingRef.current = floatingEl;
    if (referenceEl && floatingEl) {
      if (whileElementsMountedRef.current) {
        return whileElementsMountedRef.current(referenceEl, floatingEl, update);
      }
      update();
    }
  }, [referenceEl, floatingEl, update, whileElementsMountedRef, hasWhileElementsMounted]);
  const refs = React12.useMemo(() => ({
    reference: referenceRef,
    floating: floatingRef,
    setReference,
    setFloating
  }), [setReference, setFloating]);
  const elements = React12.useMemo(() => ({
    reference: referenceEl,
    floating: floatingEl
  }), [referenceEl, floatingEl]);
  const floatingStyles = React12.useMemo(() => {
    const initialStyles = {
      position: strategy,
      left: 0,
      top: 0
    };
    if (!elements.floating) {
      return initialStyles;
    }
    const x = roundByDPR(elements.floating, data.x);
    const y = roundByDPR(elements.floating, data.y);
    if (transform) {
      return {
        ...initialStyles,
        transform: "translate(" + x + "px, " + y + "px)",
        ...getDPR(elements.floating) >= 1.5 && {
          willChange: "transform"
        }
      };
    }
    return {
      position: strategy,
      left: x,
      top: y
    };
  }, [strategy, transform, elements.floating, data.x, data.y]);
  return React12.useMemo(() => ({
    ...data,
    update,
    refs,
    elements,
    floatingStyles
  }), [data, update, refs, elements, floatingStyles]);
}
var offset3 = (options, deps) => ({
  ...offset2(options),
  options: [options, deps]
});
var shift3 = (options, deps) => ({
  ...shift2(options),
  options: [options, deps]
});
var flip3 = (options, deps) => ({
  ...flip2(options),
  options: [options, deps]
});
var size3 = (options, deps) => ({
  ...size2(options),
  options: [options, deps]
});

// node_modules/@floating-ui/react/dist/floating-ui.react.mjs
var SafeReact = {
  ...React13
};
var useInsertionEffect = SafeReact.useInsertionEffect;
var useSafeInsertionEffect = useInsertionEffect || ((fn) => fn());
function useEffectEvent(callback) {
  const ref = React13.useRef(() => {
    if (true) {
      throw new Error("Cannot call an event handler while rendering.");
    }
  });
  useSafeInsertionEffect(() => {
    ref.current = callback;
  });
  return React13.useCallback(function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return ref.current == null ? void 0 : ref.current(...args);
  }, []);
}
var ARROW_UP = "ArrowUp";
var ARROW_DOWN = "ArrowDown";
var ARROW_LEFT = "ArrowLeft";
var ARROW_RIGHT = "ArrowRight";
var index2 = typeof document !== "undefined" ? import_react46.useLayoutEffect : import_react46.useEffect;
var horizontalKeys = [ARROW_LEFT, ARROW_RIGHT];
var verticalKeys = [ARROW_UP, ARROW_DOWN];
var allKeys = [...horizontalKeys, ...verticalKeys];
var serverHandoffComplete = false;
var count = 0;
var genId = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + count++
);
function useFloatingId() {
  const [id, setId] = React13.useState(() => serverHandoffComplete ? genId() : void 0);
  index2(() => {
    if (id == null) {
      setId(genId());
    }
  }, []);
  React13.useEffect(() => {
    serverHandoffComplete = true;
  }, []);
  return id;
}
var useReactId = SafeReact.useId;
var useId3 = useReactId || useFloatingId;
var devMessageSet;
if (true) {
  devMessageSet = /* @__PURE__ */ new Set();
}
function warn() {
  var _devMessageSet;
  for (var _len = arguments.length, messages = new Array(_len), _key = 0; _key < _len; _key++) {
    messages[_key] = arguments[_key];
  }
  const message = "Floating UI: " + messages.join(" ");
  if (!((_devMessageSet = devMessageSet) != null && _devMessageSet.has(message))) {
    var _devMessageSet2;
    (_devMessageSet2 = devMessageSet) == null || _devMessageSet2.add(message);
    console.warn(message);
  }
}
function error() {
  var _devMessageSet3;
  for (var _len2 = arguments.length, messages = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    messages[_key2] = arguments[_key2];
  }
  const message = "Floating UI: " + messages.join(" ");
  if (!((_devMessageSet3 = devMessageSet) != null && _devMessageSet3.has(message))) {
    var _devMessageSet4;
    (_devMessageSet4 = devMessageSet) == null || _devMessageSet4.add(message);
    console.error(message);
  }
}
function createPubSub() {
  const map = /* @__PURE__ */ new Map();
  return {
    emit(event, data) {
      var _map$get;
      (_map$get = map.get(event)) == null || _map$get.forEach((handler) => handler(data));
    },
    on(event, listener) {
      map.set(event, [...map.get(event) || [], listener]);
    },
    off(event, listener) {
      var _map$get2;
      map.set(event, ((_map$get2 = map.get(event)) == null ? void 0 : _map$get2.filter((l) => l !== listener)) || []);
    }
  };
}
var FloatingNodeContext = /* @__PURE__ */ React13.createContext(null);
var FloatingTreeContext = /* @__PURE__ */ React13.createContext(null);
var useFloatingParentNodeId = () => {
  var _React$useContext;
  return ((_React$useContext = React13.useContext(FloatingNodeContext)) == null ? void 0 : _React$useContext.id) || null;
};
var useFloatingTree = () => React13.useContext(FloatingTreeContext);
var FOCUSABLE_ATTRIBUTE = "data-floating-ui-focusable";
function useFloatingRootContext(options) {
  const {
    open = false,
    onOpenChange: onOpenChangeProp,
    elements: elementsProp
  } = options;
  const floatingId = useId3();
  const dataRef = React13.useRef({});
  const [events] = React13.useState(() => createPubSub());
  const nested = useFloatingParentNodeId() != null;
  if (true) {
    const optionDomReference = elementsProp.reference;
    if (optionDomReference && !isElement(optionDomReference)) {
      error("Cannot pass a virtual element to the `elements.reference` option,", "as it must be a real DOM element. Use `refs.setPositionReference()`", "instead.");
    }
  }
  const [positionReference, setPositionReference] = React13.useState(elementsProp.reference);
  const onOpenChange = useEffectEvent((open2, event, reason) => {
    dataRef.current.openEvent = open2 ? event : void 0;
    events.emit("openchange", {
      open: open2,
      event,
      reason,
      nested
    });
    onOpenChangeProp == null || onOpenChangeProp(open2, event, reason);
  });
  const refs = React13.useMemo(() => ({
    setPositionReference
  }), []);
  const elements = React13.useMemo(() => ({
    reference: positionReference || elementsProp.reference || null,
    floating: elementsProp.floating || null,
    domReference: elementsProp.reference
  }), [positionReference, elementsProp.reference, elementsProp.floating]);
  return React13.useMemo(() => ({
    dataRef,
    open,
    onOpenChange,
    elements,
    events,
    floatingId,
    refs
  }), [open, onOpenChange, elements, events, floatingId, refs]);
}
function useFloating2(options) {
  if (options === void 0) {
    options = {};
  }
  const {
    nodeId
  } = options;
  const internalRootContext = useFloatingRootContext({
    ...options,
    elements: {
      reference: null,
      floating: null,
      ...options.elements
    }
  });
  const rootContext = options.rootContext || internalRootContext;
  const computedElements = rootContext.elements;
  const [_domReference, setDomReference] = React13.useState(null);
  const [positionReference, _setPositionReference] = React13.useState(null);
  const optionDomReference = computedElements == null ? void 0 : computedElements.domReference;
  const domReference = optionDomReference || _domReference;
  const domReferenceRef = React13.useRef(null);
  const tree = useFloatingTree();
  index2(() => {
    if (domReference) {
      domReferenceRef.current = domReference;
    }
  }, [domReference]);
  const position = useFloating({
    ...options,
    elements: {
      ...computedElements,
      ...positionReference && {
        reference: positionReference
      }
    }
  });
  const setPositionReference = React13.useCallback((node) => {
    const computedPositionReference = isElement(node) ? {
      getBoundingClientRect: () => node.getBoundingClientRect(),
      contextElement: node
    } : node;
    _setPositionReference(computedPositionReference);
    position.refs.setReference(computedPositionReference);
  }, [position.refs]);
  const setReference = React13.useCallback((node) => {
    if (isElement(node) || node === null) {
      domReferenceRef.current = node;
      setDomReference(node);
    }
    if (isElement(position.refs.reference.current) || position.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    node !== null && !isElement(node)) {
      position.refs.setReference(node);
    }
  }, [position.refs]);
  const refs = React13.useMemo(() => ({
    ...position.refs,
    setReference,
    setPositionReference,
    domReference: domReferenceRef
  }), [position.refs, setReference, setPositionReference]);
  const elements = React13.useMemo(() => ({
    ...position.elements,
    domReference
  }), [position.elements, domReference]);
  const context = React13.useMemo(() => ({
    ...position,
    ...rootContext,
    refs,
    elements,
    nodeId
  }), [position, refs, elements, nodeId, rootContext]);
  index2(() => {
    rootContext.dataRef.current.floatingContext = context;
    const node = tree == null ? void 0 : tree.nodesRef.current.find((node2) => node2.id === nodeId);
    if (node) {
      node.context = context;
    }
  });
  return React13.useMemo(() => ({
    ...position,
    context,
    refs,
    elements
  }), [position, refs, elements, context]);
}
var ACTIVE_KEY = "active";
var SELECTED_KEY = "selected";
function mergeProps2(userProps, propsList, elementKey) {
  const map = /* @__PURE__ */ new Map();
  const isItem = elementKey === "item";
  let domUserProps = userProps;
  if (isItem && userProps) {
    const {
      [ACTIVE_KEY]: _,
      [SELECTED_KEY]: __,
      ...validProps
    } = userProps;
    domUserProps = validProps;
  }
  return {
    ...elementKey === "floating" && {
      tabIndex: -1,
      [FOCUSABLE_ATTRIBUTE]: ""
    },
    ...domUserProps,
    ...propsList.map((value) => {
      const propsOrGetProps = value ? value[elementKey] : null;
      if (typeof propsOrGetProps === "function") {
        return userProps ? propsOrGetProps(userProps) : null;
      }
      return propsOrGetProps;
    }).concat(userProps).reduce((acc, props) => {
      if (!props) {
        return acc;
      }
      Object.entries(props).forEach((_ref) => {
        let [key, value] = _ref;
        if (isItem && [ACTIVE_KEY, SELECTED_KEY].includes(key)) {
          return;
        }
        if (key.indexOf("on") === 0) {
          if (!map.has(key)) {
            map.set(key, []);
          }
          if (typeof value === "function") {
            var _map$get;
            (_map$get = map.get(key)) == null || _map$get.push(value);
            acc[key] = function() {
              var _map$get2;
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              return (_map$get2 = map.get(key)) == null ? void 0 : _map$get2.map((fn) => fn(...args)).find((val) => val !== void 0);
            };
          }
        } else {
          acc[key] = value;
        }
      });
      return acc;
    }, {})
  };
}
function useInteractions(propsList) {
  if (propsList === void 0) {
    propsList = [];
  }
  const referenceDeps = propsList.map((key) => key == null ? void 0 : key.reference);
  const floatingDeps = propsList.map((key) => key == null ? void 0 : key.floating);
  const itemDeps = propsList.map((key) => key == null ? void 0 : key.item);
  const getReferenceProps = React13.useCallback(
    (userProps) => mergeProps2(userProps, propsList, "reference"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    referenceDeps
  );
  const getFloatingProps = React13.useCallback(
    (userProps) => mergeProps2(userProps, propsList, "floating"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    floatingDeps
  );
  const getItemProps = React13.useCallback(
    (userProps) => mergeProps2(userProps, propsList, "item"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    itemDeps
  );
  return React13.useMemo(() => ({
    getReferenceProps,
    getFloatingProps,
    getItemProps
  }), [getReferenceProps, getFloatingProps, getItemProps]);
}
function getArgsWithCustomFloatingHeight(state, height) {
  return {
    ...state,
    rects: {
      ...state.rects,
      floating: {
        ...state.rects.floating,
        height
      }
    }
  };
}
var inner = (props) => ({
  name: "inner",
  options: props,
  async fn(state) {
    const {
      listRef,
      overflowRef,
      onFallbackChange,
      offset: innerOffset = 0,
      index: index3 = 0,
      minItemsVisible = 4,
      referenceOverflowThreshold = 0,
      scrollRef,
      ...detectOverflowOptions
    } = evaluate(props, state);
    const {
      rects,
      elements: {
        floating
      }
    } = state;
    const item = listRef.current[index3];
    const scrollEl = (scrollRef == null ? void 0 : scrollRef.current) || floating;
    const clientTop = floating.clientTop || scrollEl.clientTop;
    const floatingIsBordered = floating.clientTop !== 0;
    const scrollElIsBordered = scrollEl.clientTop !== 0;
    const floatingIsScrollEl = floating === scrollEl;
    if (true) {
      if (!state.placement.startsWith("bottom")) {
        warn('`placement` side must be "bottom" when using the `inner`', "middleware.");
      }
    }
    if (!item) {
      return {};
    }
    const nextArgs = {
      ...state,
      ...await offset3(-item.offsetTop - floating.clientTop - rects.reference.height / 2 - item.offsetHeight / 2 - innerOffset).fn(state)
    };
    const overflow = await detectOverflow2(getArgsWithCustomFloatingHeight(nextArgs, scrollEl.scrollHeight + clientTop + floating.clientTop), detectOverflowOptions);
    const refOverflow = await detectOverflow2(nextArgs, {
      ...detectOverflowOptions,
      elementContext: "reference"
    });
    const diffY = max(0, overflow.top);
    const nextY = nextArgs.y + diffY;
    const isScrollable = scrollEl.scrollHeight > scrollEl.clientHeight;
    const rounder = isScrollable ? (v) => v : round;
    const maxHeight = rounder(max(0, scrollEl.scrollHeight + (floatingIsBordered && floatingIsScrollEl || scrollElIsBordered ? clientTop * 2 : 0) - diffY - max(0, overflow.bottom)));
    scrollEl.style.maxHeight = maxHeight + "px";
    scrollEl.scrollTop = diffY;
    if (onFallbackChange) {
      const shouldFallback = scrollEl.offsetHeight < item.offsetHeight * min(minItemsVisible, listRef.current.length) - 1 || refOverflow.top >= -referenceOverflowThreshold || refOverflow.bottom >= -referenceOverflowThreshold;
      ReactDOM2.flushSync(() => onFallbackChange(shouldFallback));
    }
    if (overflowRef) {
      overflowRef.current = await detectOverflow2(getArgsWithCustomFloatingHeight({
        ...nextArgs,
        y: nextY
      }, scrollEl.offsetHeight + clientTop + floating.clientTop), detectOverflowOptions);
    }
    return {
      y: nextY
    };
  }
});
function useInnerOffset(context, props) {
  const {
    open,
    elements
  } = context;
  const {
    enabled = true,
    overflowRef,
    scrollRef,
    onChange: unstable_onChange
  } = props;
  const onChange = useEffectEvent(unstable_onChange);
  const controlledScrollingRef = React13.useRef(false);
  const prevScrollTopRef = React13.useRef(null);
  const initialOverflowRef = React13.useRef(null);
  React13.useEffect(() => {
    if (!enabled)
      return;
    function onWheel(e) {
      if (e.ctrlKey || !el || overflowRef.current == null) {
        return;
      }
      const dY = e.deltaY;
      const isAtTop = overflowRef.current.top >= -0.5;
      const isAtBottom = overflowRef.current.bottom >= -0.5;
      const remainingScroll = el.scrollHeight - el.clientHeight;
      const sign = dY < 0 ? -1 : 1;
      const method = dY < 0 ? "max" : "min";
      if (el.scrollHeight <= el.clientHeight) {
        return;
      }
      if (!isAtTop && dY > 0 || !isAtBottom && dY < 0) {
        e.preventDefault();
        ReactDOM2.flushSync(() => {
          onChange((d) => d + Math[method](dY, remainingScroll * sign));
        });
      } else if (/firefox/i.test(getUserAgent())) {
        el.scrollTop += dY;
      }
    }
    const el = (scrollRef == null ? void 0 : scrollRef.current) || elements.floating;
    if (open && el) {
      el.addEventListener("wheel", onWheel);
      requestAnimationFrame(() => {
        prevScrollTopRef.current = el.scrollTop;
        if (overflowRef.current != null) {
          initialOverflowRef.current = {
            ...overflowRef.current
          };
        }
      });
      return () => {
        prevScrollTopRef.current = null;
        initialOverflowRef.current = null;
        el.removeEventListener("wheel", onWheel);
      };
    }
  }, [enabled, open, elements.floating, overflowRef, scrollRef, onChange]);
  const floating = React13.useMemo(() => ({
    onKeyDown() {
      controlledScrollingRef.current = true;
    },
    onWheel() {
      controlledScrollingRef.current = false;
    },
    onPointerMove() {
      controlledScrollingRef.current = false;
    },
    onScroll() {
      const el = (scrollRef == null ? void 0 : scrollRef.current) || elements.floating;
      if (!overflowRef.current || !el || !controlledScrollingRef.current) {
        return;
      }
      if (prevScrollTopRef.current !== null) {
        const scrollDiff = el.scrollTop - prevScrollTopRef.current;
        if (overflowRef.current.bottom < -0.5 && scrollDiff < -1 || overflowRef.current.top < -0.5 && scrollDiff > 1) {
          ReactDOM2.flushSync(() => onChange((d) => d + scrollDiff));
        }
      }
      requestAnimationFrame(() => {
        prevScrollTopRef.current = el.scrollTop;
      });
    }
  }), [elements.floating, onChange, overflowRef, scrollRef]);
  return React13.useMemo(() => enabled ? {
    floating
  } : {}, [enabled, floating]);
}

// src/internal/floating.tsx
var React14 = __toESM(require("react"), 1);
var import_react48 = require("react");
var FloatingContext = (0, import_react48.createContext)({
  styles: void 0,
  setReference: () => {
  },
  setFloating: () => {
  },
  getReferenceProps: () => ({}),
  getFloatingProps: () => ({}),
  slot: {}
});
FloatingContext.displayName = "FloatingContext";
var PlacementContext = (0, import_react48.createContext)(null);
PlacementContext.displayName = "PlacementContext";
function useResolvedAnchor(anchor) {
  return (0, import_react48.useMemo)(() => {
    if (!anchor)
      return null;
    if (typeof anchor === "string")
      return { to: anchor };
    return anchor;
  }, [anchor]);
}
function useFloatingReference() {
  return (0, import_react48.useContext)(FloatingContext).setReference;
}
function useFloatingReferenceProps() {
  return (0, import_react48.useContext)(FloatingContext).getReferenceProps;
}
function useFloatingPanelProps() {
  let { getFloatingProps, slot } = (0, import_react48.useContext)(FloatingContext);
  return (0, import_react48.useCallback)(
    (...args) => {
      return Object.assign({}, getFloatingProps(...args), {
        "data-anchor": slot.anchor
      });
    },
    [getFloatingProps, slot]
  );
}
function useFloatingPanel(placement = null) {
  if (placement === false)
    placement = null;
  if (typeof placement === "string")
    placement = { to: placement };
  let updatePlacementConfig = (0, import_react48.useContext)(PlacementContext);
  let stablePlacement = (0, import_react48.useMemo)(
    () => placement,
    [
      JSON.stringify(placement, (_, v) => {
        var _a3;
        return (_a3 = v == null ? void 0 : v.outerHTML) != null ? _a3 : v;
      })
    ]
  );
  useIsoMorphicEffect(() => {
    updatePlacementConfig == null ? void 0 : updatePlacementConfig(stablePlacement != null ? stablePlacement : null);
  }, [updatePlacementConfig, stablePlacement]);
  let context = (0, import_react48.useContext)(FloatingContext);
  return (0, import_react48.useMemo)(
    () => [context.setFloating, placement ? context.styles : {}],
    [context.setFloating, placement, context.styles]
  );
}
var MINIMUM_ITEMS_VISIBLE = 4;
function FloatingProvider({
  children,
  enabled = true
}) {
  let [config, setConfig] = (0, import_react48.useState)(null);
  let [innerOffset, setInnerOffset] = (0, import_react48.useState)(0);
  let overflowRef = (0, import_react48.useRef)(null);
  let [floatingEl, setFloatingElement] = (0, import_react48.useState)(null);
  useFixScrollingPixel(floatingEl);
  let isEnabled = enabled && config !== null && floatingEl !== null;
  let {
    to: placement = "bottom",
    gap = 0,
    offset: offset4 = 0,
    padding = 0,
    inner: inner2
  } = useResolvedConfig(config, floatingEl);
  let [to, align = "center"] = placement.split(" ");
  useIsoMorphicEffect(() => {
    if (!isEnabled)
      return;
    setInnerOffset(0);
  }, [isEnabled]);
  let { refs, floatingStyles, context } = useFloating2({
    open: isEnabled,
    placement: to === "selection" ? align === "center" ? "bottom" : `bottom-${align}` : align === "center" ? `${to}` : `${to}-${align}`,
    // This component will be used in combination with a `Portal`, which means the floating
    // element will be rendered outside of the current DOM tree.
    strategy: "absolute",
    // We use the panel in a `Dialog` which is making the page inert, therefore no re-positioning is
    // needed when scrolling changes.
    transform: false,
    middleware: [
      // - The `mainAxis` is set to `gap` which defines the gap between the panel and the
      //   trigger/reference.
      // - The `crossAxis` is set to `offset` which nudges the panel from its original position.
      //
      // When we are showing the panel on top of the selected item, we don't want a gap between the
      // reference and the panel, therefore setting the `mainAxis` to `0`.
      offset3({
        mainAxis: to === "selection" ? 0 : gap,
        crossAxis: offset4
      }),
      // When the panel overflows the viewport, we will try to nudge the panel to the other side to
      // ensure it's not clipped. We use the `padding` to define the  minimum space between the
      // panel and the viewport.
      shift3({ padding }),
      // The `flip` middleware will swap the `placement` of the panel if there is not enough room.
      // This is not compatible with the `inner` middleware (which is only enabled when `to` is set
      // to "selection").
      to !== "selection" && flip3({ padding }),
      // The `inner` middleware will ensure the panel is always fully visible on screen and
      // positioned on top of the reference and moved to the currently selected item.
      to === "selection" && inner2 ? inner({
        ...inner2,
        padding,
        // For overflow detection
        overflowRef,
        offset: innerOffset,
        minItemsVisible: MINIMUM_ITEMS_VISIBLE,
        referenceOverflowThreshold: padding,
        onFallbackChange(fallback) {
          var _a3, _b2;
          if (!fallback)
            return;
          let parent = context.elements.floating;
          if (!parent)
            return;
          let scrollPaddingBottom = parseFloat(getComputedStyle(parent).scrollPaddingBottom) || 0;
          let missing = Math.min(MINIMUM_ITEMS_VISIBLE, parent.childElementCount);
          let elementHeight = 0;
          let elementAmountVisible = 0;
          for (let child of (_b2 = (_a3 = context.elements.floating) == null ? void 0 : _a3.childNodes) != null ? _b2 : []) {
            if (child instanceof HTMLElement) {
              let childTop = child.offsetTop;
              let childBottom = childTop + child.clientHeight + scrollPaddingBottom;
              let parentTop = parent.scrollTop;
              let parentBottom = parentTop + parent.clientHeight;
              if (childTop >= parentTop && childBottom <= parentBottom) {
                missing--;
              } else {
                elementAmountVisible = Math.max(
                  0,
                  Math.min(childBottom, parentBottom) - Math.max(childTop, parentTop)
                );
                elementHeight = child.clientHeight;
                break;
              }
            }
          }
          if (missing >= 1) {
            setInnerOffset((existingOffset) => {
              let newInnerOffset = elementHeight * missing - // `missing` amount of `elementHeight`
              elementAmountVisible + // The amount of the last item that is visible
              scrollPaddingBottom;
              if (existingOffset >= newInnerOffset) {
                return existingOffset;
              }
              return newInnerOffset;
            });
          }
        }
      }) : null,
      // The `size` middleware will ensure the panel is never bigger than the viewport minus the
      // provided `padding` that we want.
      size3({
        padding,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            overflow: "auto",
            maxWidth: `${availableWidth}px`,
            maxHeight: `min(var(--anchor-max-height, 100vh), ${availableHeight}px)`
          });
        }
      })
    ].filter(Boolean),
    whileElementsMounted: autoUpdate
  });
  let [exposedTo = to, exposedAlign = align] = context.placement.split("-");
  if (to === "selection")
    exposedTo = "selection";
  let data = (0, import_react48.useMemo)(
    () => ({
      anchor: [exposedTo, exposedAlign].filter(Boolean).join(" ")
    }),
    [exposedTo, exposedAlign]
  );
  let innerOffsetConfig = useInnerOffset(context, {
    overflowRef,
    onChange: setInnerOffset
  });
  let { getReferenceProps, getFloatingProps } = useInteractions([innerOffsetConfig]);
  let setFloatingRef = useEvent((el) => {
    setFloatingElement(el);
    refs.setFloating(el);
  });
  return /* @__PURE__ */ React14.createElement(PlacementContext.Provider, { value: setConfig }, /* @__PURE__ */ React14.createElement(
    FloatingContext.Provider,
    {
      value: {
        setFloating: setFloatingRef,
        setReference: refs.setReference,
        styles: floatingStyles,
        getReferenceProps,
        getFloatingProps,
        slot: data
      }
    },
    children
  ));
}
function useFixScrollingPixel(element) {
  useIsoMorphicEffect(() => {
    if (!element)
      return;
    let observer = new MutationObserver(() => {
      let maxHeight = window.getComputedStyle(element).maxHeight;
      let maxHeightFloat = parseFloat(maxHeight);
      if (isNaN(maxHeightFloat))
        return;
      let maxHeightInt = parseInt(maxHeight);
      if (isNaN(maxHeightInt))
        return;
      if (maxHeightFloat !== maxHeightInt) {
        element.style.maxHeight = `${Math.ceil(maxHeightFloat)}px`;
      }
    });
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["style"]
    });
    return () => {
      observer.disconnect();
    };
  }, [element]);
}
function useResolvedConfig(config, element) {
  var _a3, _b2, _c;
  let gap = useResolvePxValue((_a3 = config == null ? void 0 : config.gap) != null ? _a3 : "var(--anchor-gap, 0)", element);
  let offset4 = useResolvePxValue((_b2 = config == null ? void 0 : config.offset) != null ? _b2 : "var(--anchor-offset, 0)", element);
  let padding = useResolvePxValue((_c = config == null ? void 0 : config.padding) != null ? _c : "var(--anchor-padding, 0)", element);
  return { ...config, gap, offset: offset4, padding };
}
function useResolvePxValue(input, element, defaultValue = void 0) {
  let d = useDisposables();
  let computeValue = useEvent((value2, element2) => {
    if (value2 == null)
      return [defaultValue, null];
    if (typeof value2 === "number")
      return [value2, null];
    if (typeof value2 === "string") {
      if (!element2)
        return [defaultValue, null];
      let result = resolveCSSVariablePxValue(value2, element2);
      return [
        result,
        (setValue2) => {
          let variables = resolveVariables(value2);
          {
            let history2 = variables.map(
              (variable) => window.getComputedStyle(element2).getPropertyValue(variable)
            );
            d.requestAnimationFrame(function check() {
              d.nextFrame(check);
              let changed = false;
              for (let [idx, variable] of variables.entries()) {
                let value3 = window.getComputedStyle(element2).getPropertyValue(variable);
                if (history2[idx] !== value3) {
                  history2[idx] = value3;
                  changed = true;
                  break;
                }
              }
              if (!changed)
                return;
              let newResult = resolveCSSVariablePxValue(value2, element2);
              if (result !== newResult) {
                setValue2(newResult);
                result = newResult;
              }
            });
          }
          return d.dispose;
        }
      ];
    }
    return [defaultValue, null];
  });
  let immediateValue = (0, import_react48.useMemo)(() => computeValue(input, element)[0], [input, element]);
  let [value = immediateValue, setValue] = (0, import_react48.useState)();
  useIsoMorphicEffect(() => {
    let [value2, watcher] = computeValue(input, element);
    setValue(value2);
    if (!watcher)
      return;
    return watcher(setValue);
  }, [input, element]);
  return value;
}
function resolveVariables(value) {
  let matches = /var\((.*)\)/.exec(value);
  if (matches) {
    let idx = matches[1].indexOf(",");
    if (idx === -1) {
      return [matches[1]];
    }
    let variable = matches[1].slice(0, idx).trim();
    let fallback = matches[1].slice(idx + 1).trim();
    if (fallback) {
      return [variable, ...resolveVariables(fallback)];
    }
    return [variable];
  }
  return [];
}
function resolveCSSVariablePxValue(input, element) {
  let tmpEl = document.createElement("div");
  element.appendChild(tmpEl);
  tmpEl.style.setProperty("margin-top", "0px", "important");
  tmpEl.style.setProperty("margin-top", input, "important");
  let pxValue = parseFloat(window.getComputedStyle(tmpEl).marginTop) || 0;
  element.removeChild(tmpEl);
  return pxValue;
}

// src/internal/frozen.tsx
var import_react49 = __toESM(require("react"), 1);
function Frozen({ children, freeze }) {
  let contents = useFrozenData(freeze, children);
  return /* @__PURE__ */ import_react49.default.createElement(import_react49.default.Fragment, null, contents);
}
function useFrozenData(freeze, data) {
  let [frozenValue, setFrozenValue] = (0, import_react49.useState)(data);
  if (!freeze && frozenValue !== data) {
    setFrozenValue(data);
  }
  return freeze ? frozenValue : data;
}

// src/internal/open-closed.tsx
var import_react50 = __toESM(require("react"), 1);
var Context = (0, import_react50.createContext)(null);
Context.displayName = "OpenClosedContext";
function useOpenClosed() {
  return (0, import_react50.useContext)(Context);
}
function OpenClosedProvider({ value, children }) {
  return /* @__PURE__ */ import_react50.default.createElement(Context.Provider, { value }, children);
}
function ResetOpenClosedProvider({ children }) {
  return /* @__PURE__ */ import_react50.default.createElement(Context.Provider, { value: null }, children);
}

// src/utils/document-ready.ts
function onDocumentReady(cb) {
  function check() {
    if (document.readyState === "loading")
      return;
    cb();
    document.removeEventListener("DOMContentLoaded", check);
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", check);
    check();
  }
}

// src/utils/active-element-history.ts
var history = [];
onDocumentReady(() => {
  function handle(e) {
    if (!(e.target instanceof HTMLElement))
      return;
    if (e.target === document.body)
      return;
    if (history[0] === e.target)
      return;
    let focusableElement = e.target;
    focusableElement = focusableElement.closest(focusableSelector);
    history.unshift(focusableElement != null ? focusableElement : e.target);
    history = history.filter((x) => x != null && x.isConnected);
    history.splice(10);
  }
  window.addEventListener("click", handle, { capture: true });
  window.addEventListener("mousedown", handle, { capture: true });
  window.addEventListener("focus", handle, { capture: true });
  document.body.addEventListener("click", handle, { capture: true });
  document.body.addEventListener("mousedown", handle, { capture: true });
  document.body.addEventListener("focus", handle, { capture: true });
});

// src/utils/calculate-active-index.ts
function assertNever(x) {
  throw new Error("Unexpected object: " + x);
}
function calculateActiveIndex(action, resolvers) {
  let items = resolvers.resolveItems();
  if (items.length <= 0)
    return null;
  let currentActiveIndex = resolvers.resolveActiveIndex();
  let activeIndex = currentActiveIndex != null ? currentActiveIndex : -1;
  switch (action.focus) {
    case 0 /* First */: {
      for (let i = 0; i < items.length; ++i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i;
        }
      }
      return currentActiveIndex;
    }
    case 1 /* Previous */: {
      if (activeIndex === -1)
        activeIndex = items.length;
      for (let i = activeIndex - 1; i >= 0; --i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i;
        }
      }
      return currentActiveIndex;
    }
    case 2 /* Next */: {
      for (let i = activeIndex + 1; i < items.length; ++i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i;
        }
      }
      return currentActiveIndex;
    }
    case 3 /* Last */: {
      for (let i = items.length - 1; i >= 0; --i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i;
        }
      }
      return currentActiveIndex;
    }
    case 4 /* Specific */: {
      for (let i = 0; i < items.length; ++i) {
        if (resolvers.resolveId(items[i], i, items) === action.id) {
          return i;
        }
      }
      return currentActiveIndex;
    }
    case 5 /* Nothing */:
      return null;
    default:
      assertNever(action);
  }
}

// src/components/portal/portal.tsx
var import_react53 = __toESM(require("react"), 1);
var import_react_dom5 = require("react-dom");

// src/hooks/use-on-unmount.ts
var import_react51 = require("react");
function useOnUnmount(cb) {
  let stableCb = useEvent(cb);
  let trulyUnmounted = (0, import_react51.useRef)(false);
  (0, import_react51.useEffect)(() => {
    trulyUnmounted.current = false;
    return () => {
      trulyUnmounted.current = true;
      microTask(() => {
        if (!trulyUnmounted.current)
          return;
        stableCb();
      });
    };
  }, [stableCb]);
}

// src/hooks/use-server-handoff-complete.ts
var React17 = __toESM(require("react"), 1);
function useIsHydratingInReact18() {
  let isServer = typeof document === "undefined";
  if (!("useSyncExternalStore" in React17)) {
    return false;
  }
  const useSyncExternalStore2 = ((r) => r.useSyncExternalStore)(React17);
  let result = useSyncExternalStore2(
    () => () => {
    },
    () => false,
    () => isServer ? false : true
  );
  return result;
}
function useServerHandoffComplete() {
  let isHydrating = useIsHydratingInReact18();
  let [complete, setComplete] = React17.useState(env.isHandoffComplete);
  if (complete && env.isHandoffComplete === false) {
    setComplete(false);
  }
  React17.useEffect(() => {
    if (complete === true)
      return;
    setComplete(true);
  }, [complete]);
  React17.useEffect(() => env.handoff(), []);
  if (isHydrating) {
    return false;
  }
  return complete;
}

// src/internal/portal-force-root.tsx
var import_react52 = __toESM(require("react"), 1);
var ForcePortalRootContext = (0, import_react52.createContext)(false);
function usePortalRoot() {
  return (0, import_react52.useContext)(ForcePortalRootContext);
}
function ForcePortalRoot(props) {
  return /* @__PURE__ */ import_react52.default.createElement(ForcePortalRootContext.Provider, { value: props.force }, props.children);
}

// src/components/portal/portal.tsx
function usePortalTarget(ownerDocument) {
  let forceInRoot = usePortalRoot();
  let groupTarget = (0, import_react53.useContext)(PortalGroupContext);
  let [target, setTarget] = (0, import_react53.useState)(() => {
    var _a3;
    if (!forceInRoot && groupTarget !== null)
      return (_a3 = groupTarget.current) != null ? _a3 : null;
    if (env.isServer)
      return null;
    let existingRoot = ownerDocument == null ? void 0 : ownerDocument.getElementById("headlessui-portal-root");
    if (existingRoot)
      return existingRoot;
    if (ownerDocument === null)
      return null;
    let root = ownerDocument.createElement("div");
    root.setAttribute("id", "headlessui-portal-root");
    return ownerDocument.body.appendChild(root);
  });
  (0, import_react53.useEffect)(() => {
    if (target === null)
      return;
    if (!(ownerDocument == null ? void 0 : ownerDocument.body.contains(target))) {
      ownerDocument == null ? void 0 : ownerDocument.body.appendChild(target);
    }
  }, [target, ownerDocument]);
  (0, import_react53.useEffect)(() => {
    if (forceInRoot)
      return;
    if (groupTarget === null)
      return;
    setTarget(groupTarget.current);
  }, [groupTarget, setTarget, forceInRoot]);
  return target;
}
var DEFAULT_PORTAL_TAG = import_react53.Fragment;
var InternalPortalFn = forwardRefWithAs(function InternalPortalFn2(props, ref) {
  let { ownerDocument: incomingOwnerDocument = null, ...theirProps } = props;
  let internalPortalRootRef = (0, import_react53.useRef)(null);
  let portalRef = useSyncRefs(
    optionalRef((ref2) => {
      internalPortalRootRef.current = ref2;
    }),
    ref
  );
  let defaultOwnerDocument = useOwnerDocument(internalPortalRootRef);
  let ownerDocument = incomingOwnerDocument != null ? incomingOwnerDocument : defaultOwnerDocument;
  let target = usePortalTarget(ownerDocument);
  let [element] = (0, import_react53.useState)(
    () => {
      var _a3;
      return env.isServer ? null : (_a3 = ownerDocument == null ? void 0 : ownerDocument.createElement("div")) != null ? _a3 : null;
    }
  );
  let parent = (0, import_react53.useContext)(PortalParentContext);
  let ready = useServerHandoffComplete();
  useIsoMorphicEffect(() => {
    if (!target || !element)
      return;
    if (!target.contains(element)) {
      element.setAttribute("data-headlessui-portal", "");
      target.appendChild(element);
    }
  }, [target, element]);
  useIsoMorphicEffect(() => {
    if (!element)
      return;
    if (!parent)
      return;
    return parent.register(element);
  }, [parent, element]);
  useOnUnmount(() => {
    var _a3;
    if (!target || !element)
      return;
    if (element instanceof Node && target.contains(element)) {
      target.removeChild(element);
    }
    if (target.childNodes.length <= 0) {
      (_a3 = target.parentElement) == null ? void 0 : _a3.removeChild(target);
    }
  });
  let render2 = useRender();
  if (!ready)
    return null;
  let ourProps = { ref: portalRef };
  return !target || !element ? null : (0, import_react_dom5.createPortal)(
    render2({
      ourProps,
      theirProps,
      slot: {},
      defaultTag: DEFAULT_PORTAL_TAG,
      name: "Portal"
    }),
    element
  );
});
function PortalFn(props, ref) {
  let portalRef = useSyncRefs(ref);
  let { enabled = true, ownerDocument, ...theirProps } = props;
  let render2 = useRender();
  return enabled ? /* @__PURE__ */ import_react53.default.createElement(InternalPortalFn, { ...theirProps, ownerDocument, ref: portalRef }) : render2({
    ourProps: { ref: portalRef },
    theirProps,
    slot: {},
    defaultTag: DEFAULT_PORTAL_TAG,
    name: "Portal"
  });
}
var DEFAULT_GROUP_TAG = import_react53.Fragment;
var PortalGroupContext = (0, import_react53.createContext)(null);
function GroupFn(props, ref) {
  let { target, ...theirProps } = props;
  let groupRef = useSyncRefs(ref);
  let ourProps = { ref: groupRef };
  let render2 = useRender();
  return /* @__PURE__ */ import_react53.default.createElement(PortalGroupContext.Provider, { value: target }, render2({
    ourProps,
    theirProps,
    defaultTag: DEFAULT_GROUP_TAG,
    name: "Popover.Group"
  }));
}
var PortalParentContext = (0, import_react53.createContext)(null);
function useNestedPortals() {
  let parent = (0, import_react53.useContext)(PortalParentContext);
  let portals = (0, import_react53.useRef)([]);
  let register = useEvent((portal) => {
    portals.current.push(portal);
    if (parent)
      parent.register(portal);
    return () => unregister(portal);
  });
  let unregister = useEvent((portal) => {
    let idx = portals.current.indexOf(portal);
    if (idx !== -1)
      portals.current.splice(idx, 1);
    if (parent)
      parent.unregister(portal);
  });
  let api = (0, import_react53.useMemo)(
    () => ({ register, unregister, portals }),
    [register, unregister, portals]
  );
  return [
    portals,
    (0, import_react53.useMemo)(() => {
      return function PortalWrapper({ children }) {
        return /* @__PURE__ */ import_react53.default.createElement(PortalParentContext.Provider, { value: api }, children);
      };
    }, [api])
  ];
}
var PortalRoot = forwardRefWithAs(PortalFn);
var PortalGroup = forwardRefWithAs(GroupFn);
var Portal = Object.assign(PortalRoot, {
  /** @deprecated use `<PortalGroup>` instead of `<Portal.Group>` */
  Group: PortalGroup
});

// src/components/combobox/combobox.tsx
function adjustOrderedState(state, adjustment = (i) => i) {
  let currentActiveOption = state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null;
  let list = adjustment(state.options.slice());
  let sortedOptions = list.length > 0 && list[0].dataRef.current.order !== null ? (
    // Prefer sorting based on the `order`
    list.sort((a, z) => a.dataRef.current.order - z.dataRef.current.order)
  ) : (
    // Fallback to much slower DOM order
    sortByDomNode(list, (option) => option.dataRef.current.domRef.current)
  );
  let adjustedActiveOptionIndex = currentActiveOption ? sortedOptions.indexOf(currentActiveOption) : null;
  if (adjustedActiveOptionIndex === -1) {
    adjustedActiveOptionIndex = null;
  }
  return {
    options: sortedOptions,
    activeOptionIndex: adjustedActiveOptionIndex
  };
}
var reducers = {
  [1 /* CloseCombobox */](state) {
    var _a3;
    if ((_a3 = state.dataRef.current) == null ? void 0 : _a3.disabled)
      return state;
    if (state.comboboxState === 1 /* Closed */)
      return state;
    return {
      ...state,
      activeOptionIndex: null,
      comboboxState: 1 /* Closed */,
      isTyping: false,
      // Clear the last known activation trigger
      // This is because if a user interacts with the combobox using a mouse
      // resulting in it closing we might incorrectly handle the next interaction
      // for example, not scrolling to the active option in a virtual list
      activationTrigger: 2 /* Other */,
      __demoMode: false
    };
  },
  [0 /* OpenCombobox */](state) {
    var _a3, _b2;
    if ((_a3 = state.dataRef.current) == null ? void 0 : _a3.disabled)
      return state;
    if (state.comboboxState === 0 /* Open */)
      return state;
    if ((_b2 = state.dataRef.current) == null ? void 0 : _b2.value) {
      let idx = state.dataRef.current.calculateIndex(state.dataRef.current.value);
      if (idx !== -1) {
        return {
          ...state,
          activeOptionIndex: idx,
          comboboxState: 0 /* Open */,
          __demoMode: false
        };
      }
    }
    return { ...state, comboboxState: 0 /* Open */, __demoMode: false };
  },
  [3 /* SetTyping */](state, action) {
    if (state.isTyping === action.isTyping)
      return state;
    return { ...state, isTyping: action.isTyping };
  },
  [2 /* GoToOption */](state, action) {
    var _a3, _b2, _c, _d;
    if ((_a3 = state.dataRef.current) == null ? void 0 : _a3.disabled)
      return state;
    if (state.optionsElement && !((_b2 = state.dataRef.current) == null ? void 0 : _b2.optionsPropsRef.current.static) && state.comboboxState === 1 /* Closed */) {
      return state;
    }
    if (state.virtual) {
      let { options, disabled } = state.virtual;
      let activeOptionIndex2 = action.focus === 4 /* Specific */ ? action.idx : calculateActiveIndex(action, {
        resolveItems: () => options,
        resolveActiveIndex: () => {
          var _a4, _b3;
          return (_b3 = (_a4 = state.activeOptionIndex) != null ? _a4 : options.findIndex((option) => !disabled(option))) != null ? _b3 : null;
        },
        resolveDisabled: disabled,
        resolveId() {
          throw new Error("Function not implemented.");
        }
      });
      let activationTrigger2 = (_c = action.trigger) != null ? _c : 2 /* Other */;
      if (state.activeOptionIndex === activeOptionIndex2 && state.activationTrigger === activationTrigger2) {
        return state;
      }
      return {
        ...state,
        activeOptionIndex: activeOptionIndex2,
        activationTrigger: activationTrigger2,
        isTyping: false,
        __demoMode: false
      };
    }
    let adjustedState = adjustOrderedState(state);
    if (adjustedState.activeOptionIndex === null) {
      let localActiveOptionIndex = adjustedState.options.findIndex(
        (option) => !option.dataRef.current.disabled
      );
      if (localActiveOptionIndex !== -1) {
        adjustedState.activeOptionIndex = localActiveOptionIndex;
      }
    }
    let activeOptionIndex = action.focus === 4 /* Specific */ ? action.idx : calculateActiveIndex(action, {
      resolveItems: () => adjustedState.options,
      resolveActiveIndex: () => adjustedState.activeOptionIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled
    });
    let activationTrigger = (_d = action.trigger) != null ? _d : 2 /* Other */;
    if (state.activeOptionIndex === activeOptionIndex && state.activationTrigger === activationTrigger) {
      return state;
    }
    return {
      ...state,
      ...adjustedState,
      isTyping: false,
      activeOptionIndex,
      activationTrigger,
      __demoMode: false
    };
  },
  [4 /* RegisterOption */]: (state, action) => {
    var _a3, _b2, _c;
    if ((_a3 = state.dataRef.current) == null ? void 0 : _a3.virtual) {
      return {
        ...state,
        options: [...state.options, action.payload]
      };
    }
    let option = action.payload;
    let adjustedState = adjustOrderedState(state, (options) => {
      options.push(option);
      return options;
    });
    if (state.activeOptionIndex === null) {
      if ((_b2 = state.dataRef.current) == null ? void 0 : _b2.isSelected(action.payload.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option);
      }
    }
    let nextState = {
      ...state,
      ...adjustedState,
      activationTrigger: 2 /* Other */
    };
    if (((_c = state.dataRef.current) == null ? void 0 : _c.__demoMode) && state.dataRef.current.value === void 0) {
      nextState.activeOptionIndex = 0;
    }
    return nextState;
  },
  [5 /* UnregisterOption */]: (state, action) => {
    var _a3;
    if ((_a3 = state.dataRef.current) == null ? void 0 : _a3.virtual) {
      return {
        ...state,
        options: state.options.filter((option) => option.id !== action.id)
      };
    }
    let adjustedState = adjustOrderedState(state, (options) => {
      let idx = options.findIndex((option) => option.id === action.id);
      if (idx !== -1)
        options.splice(idx, 1);
      return options;
    });
    return {
      ...state,
      ...adjustedState,
      activationTrigger: 2 /* Other */
    };
  },
  [6 /* SetActivationTrigger */]: (state, action) => {
    if (state.activationTrigger === action.trigger) {
      return state;
    }
    return {
      ...state,
      activationTrigger: action.trigger
    };
  },
  [7 /* UpdateVirtualConfiguration */]: (state, action) => {
    var _a3, _b2;
    if (state.virtual === null) {
      return {
        ...state,
        virtual: { options: action.options, disabled: (_a3 = action.disabled) != null ? _a3 : () => false }
      };
    }
    if (state.virtual.options === action.options && state.virtual.disabled === action.disabled) {
      return state;
    }
    let adjustedActiveOptionIndex = state.activeOptionIndex;
    if (state.activeOptionIndex !== null) {
      let idx = action.options.indexOf(state.virtual.options[state.activeOptionIndex]);
      if (idx !== -1) {
        adjustedActiveOptionIndex = idx;
      } else {
        adjustedActiveOptionIndex = null;
      }
    }
    return {
      ...state,
      activeOptionIndex: adjustedActiveOptionIndex,
      virtual: { options: action.options, disabled: (_b2 = action.disabled) != null ? _b2 : () => false }
    };
  },
  [8 /* SetInputElement */]: (state, action) => {
    if (state.inputElement === action.element)
      return state;
    return { ...state, inputElement: action.element };
  },
  [9 /* SetButtonElement */]: (state, action) => {
    if (state.buttonElement === action.element)
      return state;
    return { ...state, buttonElement: action.element };
  },
  [10 /* SetOptionsElement */]: (state, action) => {
    if (state.optionsElement === action.element)
      return state;
    return { ...state, optionsElement: action.element };
  }
};
var ComboboxActionsContext = (0, import_react54.createContext)(null);
ComboboxActionsContext.displayName = "ComboboxActionsContext";
function useActions(component) {
  let context = (0, import_react54.useContext)(ComboboxActionsContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useActions);
    throw err;
  }
  return context;
}
var VirtualContext = (0, import_react54.createContext)(null);
function VirtualProvider(props) {
  let data = useData("VirtualProvider");
  let { options } = data.virtual;
  let [paddingStart, paddingEnd] = (0, import_react54.useMemo)(() => {
    let el = data.optionsElement;
    if (!el)
      return [0, 0];
    let styles = window.getComputedStyle(el);
    return [
      parseFloat(styles.paddingBlockStart || styles.paddingTop),
      parseFloat(styles.paddingBlockEnd || styles.paddingBottom)
    ];
  }, [data.optionsElement]);
  let virtualizer = useVirtualizer({
    enabled: options.length !== 0,
    scrollPaddingStart: paddingStart,
    scrollPaddingEnd: paddingEnd,
    count: options.length,
    estimateSize() {
      return 40;
    },
    getScrollElement() {
      return data.optionsElement;
    },
    overscan: 12
  });
  let [baseKey, setBaseKey] = (0, import_react54.useState)(0);
  useIsoMorphicEffect(() => {
    setBaseKey((v) => v + 1);
  }, [options]);
  let items = virtualizer.getVirtualItems();
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ import_react54.default.createElement(VirtualContext.Provider, { value: virtualizer }, /* @__PURE__ */ import_react54.default.createElement(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: `${virtualizer.getTotalSize()}px`
      },
      ref: (el) => {
        if (!el) {
          return;
        }
        if (data.activationTrigger === 0 /* Pointer */) {
          return;
        }
        if (data.activeOptionIndex !== null && options.length > data.activeOptionIndex) {
          virtualizer.scrollToIndex(data.activeOptionIndex);
        }
      }
    },
    items.map((item) => {
      var _a3;
      return /* @__PURE__ */ import_react54.default.createElement(import_react54.Fragment, { key: item.key }, import_react54.default.cloneElement(
        (_a3 = props.children) == null ? void 0 : _a3.call(props, {
          ...props.slot,
          option: options[item.index]
        }),
        {
          key: `${baseKey}-${item.key}`,
          "data-index": item.index,
          "aria-setsize": options.length,
          "aria-posinset": item.index + 1,
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translateY(${item.start}px)`,
            overflowAnchor: "none"
          }
        }
      ));
    })
  ));
}
var ComboboxDataContext = (0, import_react54.createContext)(null);
ComboboxDataContext.displayName = "ComboboxDataContext";
function useData(component) {
  let context = (0, import_react54.useContext)(ComboboxDataContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useData);
    throw err;
  }
  return context;
}
function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
}
var DEFAULT_COMBOBOX_TAG = import_react54.Fragment;
function ComboboxFn(props, ref) {
  var _a3, _b2;
  let providedDisabled = useDisabled();
  let {
    value: controlledValue,
    defaultValue: _defaultValue,
    onChange: controlledOnChange,
    form,
    name,
    by,
    disabled = providedDisabled || false,
    onClose,
    __demoMode = false,
    multiple = false,
    immediate = false,
    virtual = null,
    // Deprecated, but let's pluck it from the props such that it doesn't end up
    // on the `Fragment`
    nullable: _nullable,
    ...theirProps
  } = props;
  let defaultValue = useDefaultValue(_defaultValue);
  let [value = multiple ? [] : void 0, theirOnChange] = useControllable(
    controlledValue,
    controlledOnChange,
    defaultValue
  );
  let [state, dispatch] = (0, import_react54.useReducer)(stateReducer, {
    dataRef: (0, import_react54.createRef)(),
    comboboxState: __demoMode ? 0 /* Open */ : 1 /* Closed */,
    isTyping: false,
    options: [],
    virtual: virtual ? { options: virtual.options, disabled: (_a3 = virtual.disabled) != null ? _a3 : () => false } : null,
    activeOptionIndex: null,
    activationTrigger: 2 /* Other */,
    inputElement: null,
    buttonElement: null,
    optionsElement: null,
    __demoMode
  });
  let defaultToFirstOption = (0, import_react54.useRef)(false);
  let optionsPropsRef = (0, import_react54.useRef)({ static: false, hold: false });
  let compare = useByComparator(by);
  let calculateIndex = useEvent((value2) => {
    if (virtual) {
      if (by === null) {
        return virtual.options.indexOf(value2);
      } else {
        return virtual.options.findIndex((other) => compare(other, value2));
      }
    } else {
      return state.options.findIndex((other) => compare(other.dataRef.current.value, value2));
    }
  });
  let isSelected = (0, import_react54.useCallback)(
    (other) => match(data.mode, {
      [1 /* Multi */]: () => value.some((option) => compare(option, other)),
      [0 /* Single */]: () => compare(value, other)
    }),
    [value]
  );
  let isActive = useEvent((other) => {
    return state.activeOptionIndex === calculateIndex(other);
  });
  let data = (0, import_react54.useMemo)(
    () => ({
      ...state,
      immediate,
      optionsPropsRef,
      value,
      defaultValue,
      disabled,
      mode: multiple ? 1 /* Multi */ : 0 /* Single */,
      virtual: virtual ? state.virtual : null,
      get activeOptionIndex() {
        if (defaultToFirstOption.current && state.activeOptionIndex === null && (virtual ? virtual.options.length > 0 : state.options.length > 0)) {
          if (virtual) {
            let localActiveOptionIndex2 = virtual.options.findIndex(
              (option) => {
                var _a4, _b3;
                return !((_b3 = (_a4 = virtual.disabled) == null ? void 0 : _a4.call(virtual, option)) != null ? _b3 : false);
              }
            );
            if (localActiveOptionIndex2 !== -1) {
              return localActiveOptionIndex2;
            }
          }
          let localActiveOptionIndex = state.options.findIndex((option) => {
            return !option.dataRef.current.disabled;
          });
          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex;
          }
        }
        return state.activeOptionIndex;
      },
      calculateIndex,
      compare,
      isSelected,
      isActive
    }),
    [value, defaultValue, disabled, multiple, __demoMode, state, virtual]
  );
  useIsoMorphicEffect(() => {
    var _a4;
    if (!virtual)
      return;
    dispatch({
      type: 7 /* UpdateVirtualConfiguration */,
      options: virtual.options,
      disabled: (_a4 = virtual.disabled) != null ? _a4 : null
    });
  }, [virtual, virtual == null ? void 0 : virtual.options, virtual == null ? void 0 : virtual.disabled]);
  useIsoMorphicEffect(() => {
    state.dataRef.current = data;
  }, [data]);
  let outsideClickEnabled = data.comboboxState === 0 /* Open */;
  useOutsideClick(
    outsideClickEnabled,
    [data.buttonElement, data.inputElement, data.optionsElement],
    () => actions.closeCombobox()
  );
  let slot = (0, import_react54.useMemo)(() => {
    var _a4, _b3, _c;
    return {
      open: data.comboboxState === 0 /* Open */,
      disabled,
      activeIndex: data.activeOptionIndex,
      activeOption: data.activeOptionIndex === null ? null : data.virtual ? data.virtual.options[(_a4 = data.activeOptionIndex) != null ? _a4 : 0] : (_c = (_b3 = data.options[data.activeOptionIndex]) == null ? void 0 : _b3.dataRef.current.value) != null ? _c : null,
      value
    };
  }, [data, disabled, value]);
  let selectActiveOption = useEvent(() => {
    if (data.activeOptionIndex === null)
      return;
    actions.setIsTyping(false);
    if (data.virtual) {
      onChange(data.virtual.options[data.activeOptionIndex]);
    } else {
      let { dataRef } = data.options[data.activeOptionIndex];
      onChange(dataRef.current.value);
    }
    actions.goToOption(4 /* Specific */, data.activeOptionIndex);
  });
  let openCombobox = useEvent(() => {
    dispatch({ type: 0 /* OpenCombobox */ });
    defaultToFirstOption.current = true;
  });
  let closeCombobox = useEvent(() => {
    dispatch({ type: 1 /* CloseCombobox */ });
    defaultToFirstOption.current = false;
    onClose == null ? void 0 : onClose();
  });
  let setIsTyping = useEvent((isTyping) => {
    dispatch({ type: 3 /* SetTyping */, isTyping });
  });
  let goToOption = useEvent((focus, idx, trigger) => {
    defaultToFirstOption.current = false;
    if (focus === 4 /* Specific */) {
      return dispatch({ type: 2 /* GoToOption */, focus: 4 /* Specific */, idx, trigger });
    }
    return dispatch({ type: 2 /* GoToOption */, focus, trigger });
  });
  let registerOption = useEvent((id, dataRef) => {
    dispatch({ type: 4 /* RegisterOption */, payload: { id, dataRef } });
    return () => {
      if (data.isActive(dataRef.current.value)) {
        defaultToFirstOption.current = true;
      }
      dispatch({ type: 5 /* UnregisterOption */, id });
    };
  });
  let onChange = useEvent((value2) => {
    return match(data.mode, {
      [0 /* Single */]() {
        return theirOnChange == null ? void 0 : theirOnChange(value2);
      },
      [1 /* Multi */]() {
        let copy = data.value.slice();
        let idx = copy.findIndex((item) => compare(item, value2));
        if (idx === -1) {
          copy.push(value2);
        } else {
          copy.splice(idx, 1);
        }
        return theirOnChange == null ? void 0 : theirOnChange(copy);
      }
    });
  });
  let setActivationTrigger = useEvent((trigger) => {
    dispatch({ type: 6 /* SetActivationTrigger */, trigger });
  });
  let setInputElement = useEvent((element) => {
    dispatch({ type: 8 /* SetInputElement */, element });
  });
  let setButtonElement = useEvent((element) => {
    dispatch({ type: 9 /* SetButtonElement */, element });
  });
  let setOptionsElement = useEvent((element) => {
    dispatch({ type: 10 /* SetOptionsElement */, element });
  });
  let actions = (0, import_react54.useMemo)(
    () => ({
      onChange,
      registerOption,
      goToOption,
      setIsTyping,
      closeCombobox,
      openCombobox,
      setActivationTrigger,
      selectActiveOption,
      setInputElement,
      setButtonElement,
      setOptionsElement
    }),
    []
  );
  let [labelledby, LabelProvider] = useLabels();
  let ourProps = ref === null ? {} : { ref };
  let reset = (0, import_react54.useCallback)(() => {
    if (defaultValue === void 0)
      return;
    return theirOnChange == null ? void 0 : theirOnChange(defaultValue);
  }, [theirOnChange, defaultValue]);
  let render2 = useRender();
  return /* @__PURE__ */ import_react54.default.createElement(
    LabelProvider,
    {
      value: labelledby,
      props: {
        htmlFor: (_b2 = data.inputElement) == null ? void 0 : _b2.id
      },
      slot: {
        open: data.comboboxState === 0 /* Open */,
        disabled
      }
    },
    /* @__PURE__ */ import_react54.default.createElement(FloatingProvider, null, /* @__PURE__ */ import_react54.default.createElement(ComboboxActionsContext.Provider, { value: actions }, /* @__PURE__ */ import_react54.default.createElement(ComboboxDataContext.Provider, { value: data }, /* @__PURE__ */ import_react54.default.createElement(
      OpenClosedProvider,
      {
        value: match(data.comboboxState, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        })
      },
      name != null && /* @__PURE__ */ import_react54.default.createElement(
        FormFields,
        {
          disabled,
          data: value != null ? { [name]: value } : {},
          form,
          onReset: reset
        }
      ),
      render2({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_COMBOBOX_TAG,
        name: "Combobox"
      })
    ))))
  );
}
var DEFAULT_INPUT_TAG = "input";
function InputFn(props, ref) {
  var _a3, _b2, _c, _d, _e;
  let data = useData("Combobox.Input");
  let actions = useActions("Combobox.Input");
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let {
    id = providedId || `headlessui-combobox-input-${internalId}`,
    onChange,
    displayValue,
    disabled = data.disabled || false,
    autoFocus = false,
    // @ts-ignore: We know this MAY NOT exist for a given tag but we only care when it _does_ exist.
    type = "text",
    ...theirProps
  } = props;
  let internalInputRef = (0, import_react54.useRef)(null);
  let inputRef = useSyncRefs(internalInputRef, ref, useFloatingReference(), actions.setInputElement);
  let ownerDocument = useOwnerDocument(data.inputElement);
  let d = useDisposables();
  let clear = useEvent(() => {
    actions.onChange(null);
    if (data.optionsElement) {
      data.optionsElement.scrollTop = 0;
    }
    actions.goToOption(5 /* Nothing */);
  });
  let currentDisplayValue = (0, import_react54.useMemo)(() => {
    var _a4;
    if (typeof displayValue === "function" && data.value !== void 0) {
      return (_a4 = displayValue(data.value)) != null ? _a4 : "";
    } else if (typeof data.value === "string") {
      return data.value;
    } else {
      return "";
    }
  }, [data.value, displayValue]);
  useWatch(
    ([currentDisplayValue2, state], [oldCurrentDisplayValue, oldState]) => {
      if (data.isTyping)
        return;
      let input = internalInputRef.current;
      if (!input)
        return;
      input.autocomplete = "off";
      if (oldState === 0 /* Open */ && state === 1 /* Closed */) {
        input.value = currentDisplayValue2;
      } else if (currentDisplayValue2 !== oldCurrentDisplayValue) {
        input.value = currentDisplayValue2;
      }
      requestAnimationFrame(() => {
        if (data.isTyping)
          return;
        if (!input)
          return;
        if ((ownerDocument == null ? void 0 : ownerDocument.activeElement) !== input)
          return;
        let { selectionStart, selectionEnd } = input;
        if (Math.abs((selectionEnd != null ? selectionEnd : 0) - (selectionStart != null ? selectionStart : 0)) !== 0)
          return;
        if (selectionStart !== 0)
          return;
        input.setSelectionRange(input.value.length, input.value.length);
      });
    },
    [currentDisplayValue, data.comboboxState, ownerDocument, data.isTyping]
  );
  useWatch(
    ([newState], [oldState]) => {
      if (newState === 0 /* Open */ && oldState === 1 /* Closed */) {
        if (data.isTyping)
          return;
        let input = internalInputRef.current;
        if (!input)
          return;
        let currentValue = input.value;
        let { selectionStart, selectionEnd, selectionDirection } = input;
        input.value = "";
        input.value = currentValue;
        if (selectionDirection !== null) {
          input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
        } else {
          input.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    },
    [data.comboboxState]
  );
  let isComposing = (0, import_react54.useRef)(false);
  let handleCompositionStart = useEvent(() => {
    isComposing.current = true;
  });
  let handleCompositionEnd = useEvent(() => {
    d.nextFrame(() => {
      isComposing.current = false;
    });
  });
  let handleKeyDown = useEvent((event) => {
    actions.setIsTyping(true);
    switch (event.key) {
      case "Enter" /* Enter */:
        if (data.comboboxState !== 0 /* Open */)
          return;
        if (isComposing.current)
          return;
        event.preventDefault();
        event.stopPropagation();
        if (data.activeOptionIndex === null) {
          actions.closeCombobox();
          return;
        }
        actions.selectActiveOption();
        if (data.mode === 0 /* Single */) {
          actions.closeCombobox();
        }
        break;
      case "ArrowDown" /* ArrowDown */:
        event.preventDefault();
        event.stopPropagation();
        return match(data.comboboxState, {
          [0 /* Open */]: () => actions.goToOption(2 /* Next */),
          [1 /* Closed */]: () => actions.openCombobox()
        });
      case "ArrowUp" /* ArrowUp */:
        event.preventDefault();
        event.stopPropagation();
        return match(data.comboboxState, {
          [0 /* Open */]: () => actions.goToOption(1 /* Previous */),
          [1 /* Closed */]: () => {
            (0, import_react_dom6.flushSync)(() => actions.openCombobox());
            if (!data.value)
              actions.goToOption(3 /* Last */);
          }
        });
      case "Home" /* Home */:
        if (event.shiftKey) {
          break;
        }
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(0 /* First */);
      case "PageUp" /* PageUp */:
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(0 /* First */);
      case "End" /* End */:
        if (event.shiftKey) {
          break;
        }
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(3 /* Last */);
      case "PageDown" /* PageDown */:
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(3 /* Last */);
      case "Escape" /* Escape */:
        if (data.comboboxState !== 0 /* Open */)
          return;
        event.preventDefault();
        if (data.optionsElement && !data.optionsPropsRef.current.static) {
          event.stopPropagation();
        }
        if (data.mode === 0 /* Single */) {
          if (data.value === null) {
            clear();
          }
        }
        return actions.closeCombobox();
      case "Tab" /* Tab */:
        if (data.comboboxState !== 0 /* Open */)
          return;
        if (data.mode === 0 /* Single */ && data.activationTrigger !== 1 /* Focus */) {
          actions.selectActiveOption();
        }
        actions.closeCombobox();
        break;
    }
  });
  let handleChange = useEvent((event) => {
    onChange == null ? void 0 : onChange(event);
    if (data.mode === 0 /* Single */ && event.target.value === "") {
      clear();
    }
    actions.openCombobox();
  });
  let handleBlur = useEvent((event) => {
    var _a4, _b3, _c2;
    let relatedTarget = (_a4 = event.relatedTarget) != null ? _a4 : history.find((x) => x !== event.currentTarget);
    if ((_b3 = data.optionsElement) == null ? void 0 : _b3.contains(relatedTarget))
      return;
    if ((_c2 = data.buttonElement) == null ? void 0 : _c2.contains(relatedTarget))
      return;
    if (data.comboboxState !== 0 /* Open */)
      return;
    event.preventDefault();
    if (data.mode === 0 /* Single */ && data.value === null) {
      clear();
    }
    return actions.closeCombobox();
  });
  let handleFocus = useEvent((event) => {
    var _a4, _b3, _c2;
    let relatedTarget = (_a4 = event.relatedTarget) != null ? _a4 : history.find((x) => x !== event.currentTarget);
    if ((_b3 = data.buttonElement) == null ? void 0 : _b3.contains(relatedTarget))
      return;
    if ((_c2 = data.optionsElement) == null ? void 0 : _c2.contains(relatedTarget))
      return;
    if (data.disabled)
      return;
    if (!data.immediate)
      return;
    if (data.comboboxState === 0 /* Open */)
      return;
    d.microTask(() => {
      (0, import_react_dom6.flushSync)(() => actions.openCombobox());
      actions.setActivationTrigger(1 /* Focus */);
    });
  });
  let labelledBy = useLabelledBy();
  let describedBy = useDescribedBy();
  let { isFocused: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let slot = (0, import_react54.useMemo)(() => {
    return {
      open: data.comboboxState === 0 /* Open */,
      disabled,
      hover,
      focus,
      autofocus: autoFocus
    };
  }, [data, hover, focus, autoFocus, disabled]);
  let ourProps = mergeProps(
    {
      ref: inputRef,
      id,
      role: "combobox",
      type,
      "aria-controls": (_a3 = data.optionsElement) == null ? void 0 : _a3.id,
      "aria-expanded": data.comboboxState === 0 /* Open */,
      "aria-activedescendant": data.activeOptionIndex === null ? void 0 : data.virtual ? (_b2 = data.options.find(
        (option) => !option.dataRef.current.disabled && data.compare(
          option.dataRef.current.value,
          data.virtual.options[data.activeOptionIndex]
        )
      )) == null ? void 0 : _b2.id : (_c = data.options[data.activeOptionIndex]) == null ? void 0 : _c.id,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-autocomplete": "list",
      defaultValue: (_e = (_d = props.defaultValue) != null ? _d : data.defaultValue !== void 0 ? displayValue == null ? void 0 : displayValue(data.defaultValue) : null) != null ? _e : data.defaultValue,
      disabled: disabled || void 0,
      autoFocus,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      onKeyDown: handleKeyDown,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    focusProps,
    hoverProps
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_INPUT_TAG,
    name: "Combobox.Input"
  });
}
var DEFAULT_BUTTON_TAG2 = "button";
function ButtonFn2(props, ref) {
  var _a3;
  let data = useData("Combobox.Button");
  let actions = useActions("Combobox.Button");
  let buttonRef = useSyncRefs(ref, actions.setButtonElement);
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-combobox-button-${internalId}`,
    disabled = data.disabled || false,
    autoFocus = false,
    ...theirProps
  } = props;
  let refocusInput = useRefocusableInput(data.inputElement);
  let handleKeyDown = useEvent((event) => {
    switch (event.key) {
      case " " /* Space */:
      case "Enter" /* Enter */:
        event.preventDefault();
        event.stopPropagation();
        if (data.comboboxState === 1 /* Closed */) {
          (0, import_react_dom6.flushSync)(() => actions.openCombobox());
        }
        refocusInput();
        return;
      case "ArrowDown" /* ArrowDown */:
        event.preventDefault();
        event.stopPropagation();
        if (data.comboboxState === 1 /* Closed */) {
          (0, import_react_dom6.flushSync)(() => actions.openCombobox());
          if (!data.value)
            actions.goToOption(0 /* First */);
        }
        refocusInput();
        return;
      case "ArrowUp" /* ArrowUp */:
        event.preventDefault();
        event.stopPropagation();
        if (data.comboboxState === 1 /* Closed */) {
          (0, import_react_dom6.flushSync)(() => actions.openCombobox());
          if (!data.value)
            actions.goToOption(3 /* Last */);
        }
        refocusInput();
        return;
      case "Escape" /* Escape */:
        if (data.comboboxState !== 0 /* Open */)
          return;
        event.preventDefault();
        if (data.optionsElement && !data.optionsPropsRef.current.static) {
          event.stopPropagation();
        }
        (0, import_react_dom6.flushSync)(() => actions.closeCombobox());
        refocusInput();
        return;
      default:
        return;
    }
  });
  let handleMouseDown = useEvent((event) => {
    event.preventDefault();
    if (isDisabledReactIssue7711(event.currentTarget))
      return;
    if (event.button === 0 /* Left */) {
      if (data.comboboxState === 0 /* Open */) {
        actions.closeCombobox();
      } else {
        actions.openCombobox();
      }
    }
    refocusInput();
  });
  let labelledBy = useLabelledBy([id]);
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let slot = (0, import_react54.useMemo)(() => {
    return {
      open: data.comboboxState === 0 /* Open */,
      active: active || data.comboboxState === 0 /* Open */,
      disabled,
      value: data.value,
      hover,
      focus
    };
  }, [data, hover, focus, active, disabled]);
  let ourProps = mergeProps(
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, data.buttonElement),
      tabIndex: -1,
      "aria-haspopup": "listbox",
      "aria-controls": (_a3 = data.optionsElement) == null ? void 0 : _a3.id,
      "aria-expanded": data.comboboxState === 0 /* Open */,
      "aria-labelledby": labelledBy,
      disabled: disabled || void 0,
      autoFocus,
      onMouseDown: handleMouseDown,
      onKeyDown: handleKeyDown
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG2,
    name: "Combobox.Button"
  });
}
var DEFAULT_OPTIONS_TAG = "div";
var OptionsRenderFeatures = 1 /* RenderStrategy */ | 2 /* Static */;
function OptionsFn(props, ref) {
  var _a3, _b2, _c;
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-combobox-options-${internalId}`,
    hold = false,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition: transition2 = false,
    ...theirProps
  } = props;
  let data = useData("Combobox.Options");
  let actions = useActions("Combobox.Options");
  let anchor = useResolvedAnchor(rawAnchor);
  if (anchor) {
    portal = true;
  }
  let [floatingRef, style] = useFloatingPanel(anchor);
  let [localOptionsElement, setLocalOptionsElement] = (0, import_react54.useState)(null);
  let getFloatingPanelProps = useFloatingPanelProps();
  let optionsRef = useSyncRefs(
    ref,
    anchor ? floatingRef : null,
    actions.setOptionsElement,
    setLocalOptionsElement
  );
  let portalOwnerDocument = useOwnerDocument(data.buttonElement || data.inputElement);
  let ownerDocument = useOwnerDocument(data.optionsElement);
  let usesOpenClosedState = useOpenClosed();
  let [visible, transitionData] = useTransition(
    transition2,
    localOptionsElement,
    usesOpenClosedState !== null ? (usesOpenClosedState & 1 /* Open */) === 1 /* Open */ : data.comboboxState === 0 /* Open */
  );
  useOnDisappear(visible, data.inputElement, actions.closeCombobox);
  let scrollLockEnabled = data.__demoMode ? false : modal && data.comboboxState === 0 /* Open */;
  useScrollLock(scrollLockEnabled, ownerDocument);
  let inertOthersEnabled = data.__demoMode ? false : modal && data.comboboxState === 0 /* Open */;
  useInertOthers(inertOthersEnabled, {
    allowed: (0, import_react54.useCallback)(
      () => [data.inputElement, data.buttonElement, data.optionsElement],
      [data.inputElement, data.buttonElement, data.optionsElement]
    )
  });
  useIsoMorphicEffect(() => {
    var _a4;
    data.optionsPropsRef.current.static = (_a4 = props.static) != null ? _a4 : false;
  }, [data.optionsPropsRef, props.static]);
  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.hold = hold;
  }, [data.optionsPropsRef, hold]);
  useTreeWalker(data.comboboxState === 0 /* Open */, {
    container: data.optionsElement,
    accept(node) {
      if (node.getAttribute("role") === "option")
        return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute("role"))
        return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk(node) {
      node.setAttribute("role", "none");
    }
  });
  let labelledBy = useLabelledBy([(_a3 = data.buttonElement) == null ? void 0 : _a3.id]);
  let slot = (0, import_react54.useMemo)(() => {
    return {
      open: data.comboboxState === 0 /* Open */,
      option: void 0
    };
  }, [data.comboboxState]);
  let handleWheel = useEvent(() => {
    actions.setActivationTrigger(0 /* Pointer */);
  });
  let handleMouseDown = useEvent((event) => {
    event.preventDefault();
    actions.setActivationTrigger(0 /* Pointer */);
  });
  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    "aria-labelledby": labelledBy,
    role: "listbox",
    "aria-multiselectable": data.mode === 1 /* Multi */ ? true : void 0,
    id,
    ref: optionsRef,
    style: {
      ...theirProps.style,
      ...style,
      "--input-width": useElementSize(data.inputElement, true).width,
      "--button-width": useElementSize(data.buttonElement, true).width
    },
    onWheel: data.activationTrigger === 0 /* Pointer */ ? void 0 : handleWheel,
    onMouseDown: handleMouseDown,
    ...transitionDataAttributes(transitionData)
  });
  let shouldFreeze = visible && data.comboboxState === 1 /* Closed */;
  let options = useFrozenData(shouldFreeze, (_b2 = data.virtual) == null ? void 0 : _b2.options);
  let frozenValue = useFrozenData(shouldFreeze, data.value);
  let isSelected = useEvent((compareValue) => data.compare(frozenValue, compareValue));
  if (data.virtual) {
    if (options === void 0)
      throw new Error("Missing `options` in virtual mode");
    Object.assign(theirProps, {
      children: /* @__PURE__ */ import_react54.default.createElement(
        ComboboxDataContext.Provider,
        {
          value: options !== data.virtual.options ? { ...data, virtual: { ...data.virtual, options } } : data
        },
        /* @__PURE__ */ import_react54.default.createElement(VirtualProvider, { slot }, theirProps.children)
      )
    });
  }
  let render2 = useRender();
  return /* @__PURE__ */ import_react54.default.createElement(Portal, { enabled: portal ? props.static || visible : false, ownerDocument: portalOwnerDocument }, /* @__PURE__ */ import_react54.default.createElement(
    ComboboxDataContext.Provider,
    {
      value: data.mode === 1 /* Multi */ ? data : { ...data, isSelected }
    },
    render2({
      ourProps,
      theirProps: {
        ...theirProps,
        children: /* @__PURE__ */ import_react54.default.createElement(Frozen, { freeze: shouldFreeze }, typeof theirProps.children === "function" ? (_c = theirProps.children) == null ? void 0 : _c.call(theirProps, slot) : theirProps.children)
      },
      slot,
      defaultTag: DEFAULT_OPTIONS_TAG,
      features: OptionsRenderFeatures,
      visible,
      name: "Combobox.Options"
    })
  ));
}
var DEFAULT_OPTION_TAG = "div";
function OptionFn(props, ref) {
  var _a3, _b2, _c, _d;
  let data = useData("Combobox.Option");
  let actions = useActions("Combobox.Option");
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-combobox-option-${internalId}`,
    value,
    disabled = (_c = (_b2 = (_a3 = data.virtual) == null ? void 0 : _a3.disabled) == null ? void 0 : _b2.call(_a3, value)) != null ? _c : false,
    order = null,
    ...theirProps
  } = props;
  let refocusInput = useRefocusableInput(data.inputElement);
  let active = data.virtual ? data.activeOptionIndex === data.calculateIndex(value) : data.activeOptionIndex === null ? false : ((_d = data.options[data.activeOptionIndex]) == null ? void 0 : _d.id) === id;
  let selected = data.isSelected(value);
  let internalOptionRef = (0, import_react54.useRef)(null);
  let bag = useLatestValue({
    disabled,
    value,
    domRef: internalOptionRef,
    order
  });
  let virtualizer = (0, import_react54.useContext)(VirtualContext);
  let optionRef = useSyncRefs(
    ref,
    internalOptionRef,
    virtualizer ? virtualizer.measureElement : null
  );
  let select = useEvent(() => {
    actions.setIsTyping(false);
    actions.onChange(value);
  });
  useIsoMorphicEffect(() => actions.registerOption(id, bag), [bag, id]);
  let enableScrollIntoView = (0, import_react54.useRef)(data.virtual || data.__demoMode ? false : true);
  useIsoMorphicEffect(() => {
    if (data.virtual)
      return;
    if (data.__demoMode)
      return;
    return disposables().requestAnimationFrame(() => {
      enableScrollIntoView.current = true;
    });
  }, [data.virtual, data.__demoMode]);
  useIsoMorphicEffect(() => {
    if (!enableScrollIntoView.current)
      return;
    if (data.comboboxState !== 0 /* Open */)
      return;
    if (!active)
      return;
    if (data.activationTrigger === 0 /* Pointer */)
      return;
    return disposables().requestAnimationFrame(() => {
      var _a4, _b3;
      (_b3 = (_a4 = internalOptionRef.current) == null ? void 0 : _a4.scrollIntoView) == null ? void 0 : _b3.call(_a4, { block: "nearest" });
    });
  }, [
    internalOptionRef,
    active,
    data.comboboxState,
    data.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */
    data.activeOptionIndex
  ]);
  let handleMouseDown = useEvent((event) => {
    event.preventDefault();
    if (event.button !== 0 /* Left */) {
      return;
    }
    if (disabled)
      return;
    select();
    if (!isMobile()) {
      requestAnimationFrame(() => refocusInput());
    }
    if (data.mode === 0 /* Single */) {
      actions.closeCombobox();
    }
  });
  let handleFocus = useEvent(() => {
    if (disabled) {
      return actions.goToOption(5 /* Nothing */);
    }
    let idx = data.calculateIndex(value);
    actions.goToOption(4 /* Specific */, idx);
  });
  let pointer = useTrackedPointer();
  let handleEnter = useEvent((evt) => pointer.update(evt));
  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt))
      return;
    if (disabled)
      return;
    if (active)
      return;
    let idx = data.calculateIndex(value);
    actions.goToOption(4 /* Specific */, idx, 0 /* Pointer */);
  });
  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt))
      return;
    if (disabled)
      return;
    if (!active)
      return;
    if (data.optionsPropsRef.current.hold)
      return;
    actions.goToOption(5 /* Nothing */);
  });
  let slot = (0, import_react54.useMemo)(() => {
    return {
      active,
      focus: active,
      selected,
      disabled
    };
  }, [active, selected, disabled]);
  let ourProps = {
    id,
    ref: optionRef,
    role: "option",
    tabIndex: disabled === true ? void 0 : -1,
    "aria-disabled": disabled === true ? true : void 0,
    // According to the WAI-ARIA best practices, we should use aria-checked for
    // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
    // both single and multi-select.
    "aria-selected": selected,
    disabled: void 0,
    // Never forward the `disabled` prop
    onMouseDown: handleMouseDown,
    onFocus: handleFocus,
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave
  };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: "Combobox.Option"
  });
}
var ComboboxRoot = forwardRefWithAs(ComboboxFn);
var ComboboxButton = forwardRefWithAs(ButtonFn2);
var ComboboxInput = forwardRefWithAs(InputFn);
var ComboboxLabel = Label;
var ComboboxOptions = forwardRefWithAs(OptionsFn);
var ComboboxOption = forwardRefWithAs(OptionFn);
var Combobox = Object.assign(ComboboxRoot, {
  /** @deprecated use `<ComboboxInput>` instead of `<Combobox.Input>` */
  Input: ComboboxInput,
  /** @deprecated use `<ComboboxButton>` instead of `<Combobox.Button>` */
  Button: ComboboxButton,
  /** @deprecated use `<Label>` instead of `<Combobox.Label>` */
  Label: ComboboxLabel,
  /** @deprecated use `<ComboboxOptions>` instead of `<Combobox.Options>` */
  Options: ComboboxOptions,
  /** @deprecated use `<ComboboxOption>` instead of `<Combobox.Option>` */
  Option: ComboboxOption
});

// src/components/data-interactive/data-interactive.tsx
var import_react55 = require("react");
var DEFAULT_DATA_INTERACTIVE_TAG = import_react55.Fragment;
function DataInteractiveFn(props, ref) {
  let { ...theirProps } = props;
  let disabled = false;
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let ourProps = mergeProps({ ref }, focusProps, hoverProps, pressProps);
  let slot = (0, import_react55.useMemo)(
    () => ({ hover, focus, active }),
    [hover, focus, active]
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_DATA_INTERACTIVE_TAG,
    name: "DataInteractive"
  });
}
var DataInteractive = forwardRefWithAs(
  DataInteractiveFn
);

// src/components/dialog/dialog.tsx
var import_react62 = __toESM(require("react"), 1);

// src/hooks/use-escape.ts
function useEscape(enabled, view = typeof document !== "undefined" ? document.defaultView : null, cb) {
  let isTopLayer2 = useIsTopLayer(enabled, "escape");
  useEventListener(view, "keydown", (event) => {
    if (!isTopLayer2)
      return;
    if (event.defaultPrevented)
      return;
    if (event.key !== "Escape" /* Escape */)
      return;
    cb(event);
  });
}

// src/hooks/use-is-touch-device.ts
var import_react56 = require("react");
function useIsTouchDevice() {
  var _a3;
  let [mq] = (0, import_react56.useState)(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)") : null
  );
  let [isTouchDevice, setIsTouchDevice] = (0, import_react56.useState)((_a3 = mq == null ? void 0 : mq.matches) != null ? _a3 : false);
  useIsoMorphicEffect(() => {
    if (!mq)
      return;
    function handle(event) {
      setIsTouchDevice(event.matches);
    }
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, [mq]);
  return isTouchDevice;
}

// src/hooks/use-root-containers.tsx
var import_react57 = __toESM(require("react"), 1);
function useRootContainers({
  defaultContainers = [],
  portals,
  // Reference to a node in the "main" tree, not in the portalled Dialog tree.
  mainTreeNode
} = {}) {
  let ownerDocument = useOwnerDocument(mainTreeNode);
  let resolveContainers2 = useEvent(() => {
    var _a3, _b2;
    let containers = [];
    for (let container of defaultContainers) {
      if (container === null)
        continue;
      if (container instanceof HTMLElement) {
        containers.push(container);
      } else if ("current" in container && container.current instanceof HTMLElement) {
        containers.push(container.current);
      }
    }
    if (portals == null ? void 0 : portals.current) {
      for (let portal of portals.current) {
        containers.push(portal);
      }
    }
    for (let container of (_a3 = ownerDocument == null ? void 0 : ownerDocument.querySelectorAll("html > *, body > *")) != null ? _a3 : []) {
      if (container === document.body)
        continue;
      if (container === document.head)
        continue;
      if (!(container instanceof HTMLElement))
        continue;
      if (container.id === "headlessui-portal-root")
        continue;
      if (mainTreeNode) {
        if (container.contains(mainTreeNode))
          continue;
        if (container.contains((_b2 = mainTreeNode == null ? void 0 : mainTreeNode.getRootNode()) == null ? void 0 : _b2.host))
          continue;
      }
      if (containers.some((defaultContainer) => container.contains(defaultContainer)))
        continue;
      containers.push(container);
    }
    return containers;
  });
  return {
    resolveContainers: resolveContainers2,
    contains: useEvent(
      (element) => resolveContainers2().some((container) => container.contains(element))
    )
  };
}
var MainTreeContext = (0, import_react57.createContext)(null);
function MainTreeProvider({
  children,
  node
}) {
  let [mainTreeNode, setMainTreeNode] = (0, import_react57.useState)(null);
  let resolvedMainTreeNode = useMainTreeNode(node != null ? node : mainTreeNode);
  return /* @__PURE__ */ import_react57.default.createElement(MainTreeContext.Provider, { value: resolvedMainTreeNode }, children, resolvedMainTreeNode === null && /* @__PURE__ */ import_react57.default.createElement(
    Hidden,
    {
      features: 4 /* Hidden */,
      ref: (el) => {
        var _a3, _b2;
        if (!el)
          return;
        for (let container of (_b2 = (_a3 = getOwnerDocument(el)) == null ? void 0 : _a3.querySelectorAll("html > *, body > *")) != null ? _b2 : []) {
          if (container === document.body)
            continue;
          if (container === document.head)
            continue;
          if (!(container instanceof HTMLElement))
            continue;
          if (container == null ? void 0 : container.contains(el)) {
            setMainTreeNode(container);
            break;
          }
        }
      }
    }
  ));
}
function useMainTreeNode(fallbackMainTreeNode = null) {
  var _a3;
  return (_a3 = (0, import_react57.useContext)(MainTreeContext)) != null ? _a3 : fallbackMainTreeNode;
}

// src/components/focus-trap/focus-trap.tsx
var import_react60 = __toESM(require("react"), 1);

// src/hooks/use-is-mounted.ts
var import_react58 = require("react");
function useIsMounted() {
  let mounted = (0, import_react58.useRef)(false);
  useIsoMorphicEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}

// src/hooks/use-tab-direction.ts
var import_react59 = require("react");
function useTabDirection() {
  let direction = (0, import_react59.useRef)(0 /* Forwards */);
  let enabled = true;
  useWindowEvent(
    enabled,
    "keydown",
    (event) => {
      if (event.key === "Tab") {
        direction.current = event.shiftKey ? 1 /* Backwards */ : 0 /* Forwards */;
      }
    },
    true
  );
  return direction;
}

// src/components/focus-trap/focus-trap.tsx
function resolveContainers(containers) {
  if (!containers)
    return /* @__PURE__ */ new Set();
  if (typeof containers === "function")
    return new Set(containers());
  let all = /* @__PURE__ */ new Set();
  for (let container of containers.current) {
    if (container.current instanceof HTMLElement) {
      all.add(container.current);
    }
  }
  return all;
}
var DEFAULT_FOCUS_TRAP_TAG = "div";
var FocusTrapFeatures = /* @__PURE__ */ ((FocusTrapFeatures2) => {
  FocusTrapFeatures2[FocusTrapFeatures2["None"] = 0] = "None";
  FocusTrapFeatures2[FocusTrapFeatures2["InitialFocus"] = 1] = "InitialFocus";
  FocusTrapFeatures2[FocusTrapFeatures2["TabLock"] = 2] = "TabLock";
  FocusTrapFeatures2[FocusTrapFeatures2["FocusLock"] = 4] = "FocusLock";
  FocusTrapFeatures2[FocusTrapFeatures2["RestoreFocus"] = 8] = "RestoreFocus";
  FocusTrapFeatures2[FocusTrapFeatures2["AutoFocus"] = 16] = "AutoFocus";
  return FocusTrapFeatures2;
})(FocusTrapFeatures || {});
function FocusTrapFn(props, ref) {
  let container = (0, import_react60.useRef)(null);
  let focusTrapRef = useSyncRefs(container, ref);
  let {
    initialFocus,
    initialFocusFallback,
    containers,
    features = 1 /* InitialFocus */ | 2 /* TabLock */ | 4 /* FocusLock */ | 8 /* RestoreFocus */,
    ...theirProps
  } = props;
  if (!useServerHandoffComplete()) {
    features = 0 /* None */;
  }
  let ownerDocument = useOwnerDocument(container);
  useRestoreFocus(features, { ownerDocument });
  let previousActiveElement = useInitialFocus(features, {
    ownerDocument,
    container,
    initialFocus,
    initialFocusFallback
  });
  useFocusLock(features, { ownerDocument, container, containers, previousActiveElement });
  let direction = useTabDirection();
  let handleFocus = useEvent((e) => {
    let el = container.current;
    if (!el)
      return;
    let wrapper = false ? microTask : (cb) => cb();
    wrapper(() => {
      match(direction.current, {
        [0 /* Forwards */]: () => {
          focusIn(el, 1 /* First */, {
            skipElements: [e.relatedTarget, initialFocusFallback]
          });
        },
        [1 /* Backwards */]: () => {
          focusIn(el, 8 /* Last */, {
            skipElements: [e.relatedTarget, initialFocusFallback]
          });
        }
      });
    });
  });
  let tabLockEnabled = useIsTopLayer(
    Boolean(features & 2 /* TabLock */),
    "focus-trap#tab-lock"
  );
  let d = useDisposables();
  let recentlyUsedTabKey = (0, import_react60.useRef)(false);
  let ourProps = {
    ref: focusTrapRef,
    onKeyDown(e) {
      if (e.key == "Tab") {
        recentlyUsedTabKey.current = true;
        d.requestAnimationFrame(() => {
          recentlyUsedTabKey.current = false;
        });
      }
    },
    onBlur(e) {
      if (!(features & 4 /* FocusLock */))
        return;
      let allContainers = resolveContainers(containers);
      if (container.current instanceof HTMLElement)
        allContainers.add(container.current);
      let relatedTarget = e.relatedTarget;
      if (!(relatedTarget instanceof HTMLElement))
        return;
      if (relatedTarget.dataset.headlessuiFocusGuard === "true") {
        return;
      }
      if (!contains2(allContainers, relatedTarget)) {
        if (recentlyUsedTabKey.current) {
          focusIn(
            container.current,
            match(direction.current, {
              [0 /* Forwards */]: () => 4 /* Next */,
              [1 /* Backwards */]: () => 2 /* Previous */
            }) | 16 /* WrapAround */,
            { relativeTo: e.target }
          );
        } else if (e.target instanceof HTMLElement) {
          focusElement(e.target);
        }
      }
    }
  };
  let render2 = useRender();
  return /* @__PURE__ */ import_react60.default.createElement(import_react60.default.Fragment, null, tabLockEnabled && /* @__PURE__ */ import_react60.default.createElement(
    Hidden,
    {
      as: "button",
      type: "button",
      "data-headlessui-focus-guard": true,
      onFocus: handleFocus,
      features: 2 /* Focusable */
    }
  ), render2({
    ourProps,
    theirProps,
    defaultTag: DEFAULT_FOCUS_TRAP_TAG,
    name: "FocusTrap"
  }), tabLockEnabled && /* @__PURE__ */ import_react60.default.createElement(
    Hidden,
    {
      as: "button",
      type: "button",
      "data-headlessui-focus-guard": true,
      onFocus: handleFocus,
      features: 2 /* Focusable */
    }
  ));
}
var FocusTrapRoot = forwardRefWithAs(FocusTrapFn);
var FocusTrap = Object.assign(FocusTrapRoot, {
  /** @deprecated use `FocusTrapFeatures` instead of `FocusTrap.features` */
  features: FocusTrapFeatures
});
function useRestoreElement(enabled = true) {
  let localHistory = (0, import_react60.useRef)(history.slice());
  useWatch(
    ([newEnabled], [oldEnabled]) => {
      if (oldEnabled === true && newEnabled === false) {
        microTask(() => {
          localHistory.current.splice(0);
        });
      }
      if (oldEnabled === false && newEnabled === true) {
        localHistory.current = history.slice();
      }
    },
    [enabled, history, localHistory]
  );
  return useEvent(() => {
    var _a3;
    return (_a3 = localHistory.current.find((x) => x != null && x.isConnected)) != null ? _a3 : null;
  });
}
function useRestoreFocus(features, { ownerDocument }) {
  let enabled = Boolean(features & 8 /* RestoreFocus */);
  let getRestoreElement = useRestoreElement(enabled);
  useWatch(() => {
    if (enabled)
      return;
    if ((ownerDocument == null ? void 0 : ownerDocument.activeElement) === (ownerDocument == null ? void 0 : ownerDocument.body)) {
      focusElement(getRestoreElement());
    }
  }, [enabled]);
  useOnUnmount(() => {
    if (!enabled)
      return;
    focusElement(getRestoreElement());
  });
}
function useInitialFocus(features, {
  ownerDocument,
  container,
  initialFocus,
  initialFocusFallback
}) {
  let previousActiveElement = (0, import_react60.useRef)(null);
  let enabled = useIsTopLayer(
    Boolean(features & 1 /* InitialFocus */),
    "focus-trap#initial-focus"
  );
  let mounted = useIsMounted();
  useWatch(() => {
    if (features === 0 /* None */) {
      return;
    }
    if (!enabled) {
      if (initialFocusFallback == null ? void 0 : initialFocusFallback.current) {
        focusElement(initialFocusFallback.current);
      }
      return;
    }
    let containerElement = container.current;
    if (!containerElement)
      return;
    microTask(() => {
      if (!mounted.current) {
        return;
      }
      let activeElement2 = ownerDocument == null ? void 0 : ownerDocument.activeElement;
      if (initialFocus == null ? void 0 : initialFocus.current) {
        if ((initialFocus == null ? void 0 : initialFocus.current) === activeElement2) {
          previousActiveElement.current = activeElement2;
          return;
        }
      } else if (containerElement.contains(activeElement2)) {
        previousActiveElement.current = activeElement2;
        return;
      }
      if (initialFocus == null ? void 0 : initialFocus.current) {
        focusElement(initialFocus.current);
      } else {
        if (features & 16 /* AutoFocus */) {
          if (focusIn(containerElement, 1 /* First */ | 64 /* AutoFocus */) !== 0 /* Error */) {
            return;
          }
        } else if (focusIn(containerElement, 1 /* First */) !== 0 /* Error */) {
          return;
        }
        if (initialFocusFallback == null ? void 0 : initialFocusFallback.current) {
          focusElement(initialFocusFallback.current);
          if ((ownerDocument == null ? void 0 : ownerDocument.activeElement) === initialFocusFallback.current) {
            return;
          }
        }
        console.warn("There are no focusable elements inside the <FocusTrap />");
      }
      previousActiveElement.current = ownerDocument == null ? void 0 : ownerDocument.activeElement;
    });
  }, [initialFocusFallback, enabled, features]);
  return previousActiveElement;
}
function useFocusLock(features, {
  ownerDocument,
  container,
  containers,
  previousActiveElement
}) {
  let mounted = useIsMounted();
  let enabled = Boolean(features & 4 /* FocusLock */);
  useEventListener(
    ownerDocument == null ? void 0 : ownerDocument.defaultView,
    "focus",
    (event) => {
      if (!enabled)
        return;
      if (!mounted.current)
        return;
      let allContainers = resolveContainers(containers);
      if (container.current instanceof HTMLElement)
        allContainers.add(container.current);
      let previous = previousActiveElement.current;
      if (!previous)
        return;
      let toElement = event.target;
      if (toElement && toElement instanceof HTMLElement) {
        if (!contains2(allContainers, toElement)) {
          event.preventDefault();
          event.stopPropagation();
          focusElement(previous);
        } else {
          previousActiveElement.current = toElement;
          focusElement(toElement);
        }
      } else {
        focusElement(previousActiveElement.current);
      }
    },
    true
  );
}
function contains2(containers, element) {
  for (let container of containers) {
    if (container.contains(element))
      return true;
  }
  return false;
}

// src/components/transition/transition.tsx
var import_react61 = __toESM(require("react"), 1);
function shouldForwardRef(props) {
  var _a3;
  return (
    // If we have any of the enter/leave classes
    Boolean(
      props.enter || props.enterFrom || props.enterTo || props.leave || props.leaveFrom || props.leaveTo
    ) || // If the `as` prop is not a Fragment
    ((_a3 = props.as) != null ? _a3 : DEFAULT_TRANSITION_CHILD_TAG) !== import_react61.Fragment || // If we have a single child, then we can forward the ref directly
    import_react61.default.Children.count(props.children) === 1
  );
}
var TransitionContext = (0, import_react61.createContext)(null);
TransitionContext.displayName = "TransitionContext";
function useTransitionContext() {
  let context = (0, import_react61.useContext)(TransitionContext);
  if (context === null) {
    throw new Error(
      "A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />."
    );
  }
  return context;
}
function useParentNesting() {
  let context = (0, import_react61.useContext)(NestingContext);
  if (context === null) {
    throw new Error(
      "A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />."
    );
  }
  return context;
}
var NestingContext = (0, import_react61.createContext)(null);
NestingContext.displayName = "NestingContext";
function hasChildren(bag) {
  if ("children" in bag)
    return hasChildren(bag.children);
  return bag.current.filter(({ el }) => el.current !== null).filter(({ state }) => state === "visible" /* Visible */).length > 0;
}
function useNesting(done, parent) {
  let doneRef = useLatestValue(done);
  let transitionableChildren = (0, import_react61.useRef)([]);
  let mounted = useIsMounted();
  let d = useDisposables();
  let unregister = useEvent((container, strategy = 1 /* Hidden */) => {
    let idx = transitionableChildren.current.findIndex(({ el }) => el === container);
    if (idx === -1)
      return;
    match(strategy, {
      [0 /* Unmount */]() {
        transitionableChildren.current.splice(idx, 1);
      },
      [1 /* Hidden */]() {
        transitionableChildren.current[idx].state = "hidden" /* Hidden */;
      }
    });
    d.microTask(() => {
      var _a3;
      if (!hasChildren(transitionableChildren) && mounted.current) {
        (_a3 = doneRef.current) == null ? void 0 : _a3.call(doneRef);
      }
    });
  });
  let register = useEvent((container) => {
    let child = transitionableChildren.current.find(({ el }) => el === container);
    if (!child) {
      transitionableChildren.current.push({ el: container, state: "visible" /* Visible */ });
    } else if (child.state !== "visible" /* Visible */) {
      child.state = "visible" /* Visible */;
    }
    return () => unregister(container, 0 /* Unmount */);
  });
  let todos = (0, import_react61.useRef)([]);
  let wait = (0, import_react61.useRef)(Promise.resolve());
  let chains = (0, import_react61.useRef)({ enter: [], leave: [] });
  let onStart = useEvent(
    (container, direction, cb) => {
      todos.current.splice(0);
      if (parent) {
        parent.chains.current[direction] = parent.chains.current[direction].filter(
          ([containerInParent]) => containerInParent !== container
        );
      }
      parent == null ? void 0 : parent.chains.current[direction].push([
        container,
        new Promise((resolve) => {
          todos.current.push(resolve);
        })
      ]);
      parent == null ? void 0 : parent.chains.current[direction].push([
        container,
        new Promise((resolve) => {
          Promise.all(chains.current[direction].map(([_container, promise]) => promise)).then(
            () => resolve()
          );
        })
      ]);
      if (direction === "enter") {
        wait.current = wait.current.then(() => parent == null ? void 0 : parent.wait.current).then(() => cb(direction));
      } else {
        cb(direction);
      }
    }
  );
  let onStop = useEvent(
    (_container, direction, cb) => {
      Promise.all(chains.current[direction].splice(0).map(([_container2, promise]) => promise)).then(() => {
        var _a3;
        (_a3 = todos.current.shift()) == null ? void 0 : _a3();
      }).then(() => cb(direction));
    }
  );
  return (0, import_react61.useMemo)(
    () => ({
      children: transitionableChildren,
      register,
      unregister,
      onStart,
      onStop,
      wait,
      chains
    }),
    [register, unregister, transitionableChildren, onStart, onStop, chains, wait]
  );
}
var DEFAULT_TRANSITION_CHILD_TAG = import_react61.Fragment;
var TransitionChildRenderFeatures = 1 /* RenderStrategy */;
function TransitionChildFn(props, ref) {
  var _a3, _b2;
  let {
    // Whether or not to enable transitions on the current element (by exposing
    // transition data). When set to false, the `Transition` component still
    // acts as a transition boundary for `TransitionChild` components.
    transition: transition2 = true,
    // Event "handlers"
    beforeEnter,
    afterEnter,
    beforeLeave,
    afterLeave,
    // Class names
    enter,
    enterFrom,
    enterTo,
    entered,
    leave,
    leaveFrom,
    leaveTo,
    ...theirProps
  } = props;
  let [localContainerElement, setLocalContainerElement] = (0, import_react61.useState)(null);
  let container = (0, import_react61.useRef)(null);
  let requiresRef = shouldForwardRef(props);
  let transitionRef = useSyncRefs(
    ...requiresRef ? [container, ref, setLocalContainerElement] : ref === null ? [] : [ref]
  );
  let strategy = ((_a3 = theirProps.unmount) != null ? _a3 : true) ? 0 /* Unmount */ : 1 /* Hidden */;
  let { show, appear, initial } = useTransitionContext();
  let [state, setState] = (0, import_react61.useState)(show ? "visible" /* Visible */ : "hidden" /* Hidden */);
  let parentNesting = useParentNesting();
  let { register, unregister } = parentNesting;
  useIsoMorphicEffect(() => register(container), [register, container]);
  useIsoMorphicEffect(() => {
    if (strategy !== 1 /* Hidden */)
      return;
    if (!container.current)
      return;
    if (show && state !== "visible" /* Visible */) {
      setState("visible" /* Visible */);
      return;
    }
    return match(state, {
      ["hidden" /* Hidden */]: () => unregister(container),
      ["visible" /* Visible */]: () => register(container)
    });
  }, [state, container, register, unregister, show, strategy]);
  let ready = useServerHandoffComplete();
  useIsoMorphicEffect(() => {
    if (!requiresRef)
      return;
    if (ready && state === "visible" /* Visible */ && container.current === null) {
      throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?");
    }
  }, [container, state, ready, requiresRef]);
  let skip = initial && !appear;
  let immediate = appear && show && initial;
  let isTransitioning = (0, import_react61.useRef)(false);
  let nesting = useNesting(() => {
    if (isTransitioning.current)
      return;
    setState("hidden" /* Hidden */);
    unregister(container);
  }, parentNesting);
  let start = useEvent((show2) => {
    isTransitioning.current = true;
    let direction = show2 ? "enter" : "leave";
    nesting.onStart(container, direction, (direction2) => {
      if (direction2 === "enter")
        beforeEnter == null ? void 0 : beforeEnter();
      else if (direction2 === "leave")
        beforeLeave == null ? void 0 : beforeLeave();
    });
  });
  let end = useEvent((show2) => {
    let direction = show2 ? "enter" : "leave";
    isTransitioning.current = false;
    nesting.onStop(container, direction, (direction2) => {
      if (direction2 === "enter")
        afterEnter == null ? void 0 : afterEnter();
      else if (direction2 === "leave")
        afterLeave == null ? void 0 : afterLeave();
    });
    if (direction === "leave" && !hasChildren(nesting)) {
      setState("hidden" /* Hidden */);
      unregister(container);
    }
  });
  (0, import_react61.useEffect)(() => {
    if (requiresRef && transition2)
      return;
    start(show);
    end(show);
  }, [show, requiresRef, transition2]);
  let enabled = (() => {
    if (!transition2)
      return false;
    if (!requiresRef)
      return false;
    if (!ready)
      return false;
    if (skip)
      return false;
    return true;
  })();
  let [, transitionData] = useTransition(enabled, localContainerElement, show, { start, end });
  let ourProps = compact({
    ref: transitionRef,
    className: ((_b2 = classNames(
      // Incoming classes if any
      // @ts-expect-error: className may not exist because not
      // all components accept className (but all HTML elements do)
      theirProps.className,
      // Apply these classes immediately
      immediate && enter,
      immediate && enterFrom,
      // Map data attributes to `enter`, `enterFrom` and `enterTo` classes
      transitionData.enter && enter,
      transitionData.enter && transitionData.closed && enterFrom,
      transitionData.enter && !transitionData.closed && enterTo,
      // Map data attributes to `leave`, `leaveFrom` and `leaveTo` classes
      transitionData.leave && leave,
      transitionData.leave && !transitionData.closed && leaveFrom,
      transitionData.leave && transitionData.closed && leaveTo,
      // Map data attributes to `entered` class (backwards compatibility)
      !transitionData.transition && show && entered
    )) == null ? void 0 : _b2.trim()) || void 0,
    // If `className` is an empty string, we can omit it
    ...transitionDataAttributes(transitionData)
  });
  let openClosedState = 0;
  if (state === "visible" /* Visible */)
    openClosedState |= 1 /* Open */;
  if (state === "hidden" /* Hidden */)
    openClosedState |= 2 /* Closed */;
  if (transitionData.enter)
    openClosedState |= 8 /* Opening */;
  if (transitionData.leave)
    openClosedState |= 4 /* Closing */;
  let render2 = useRender();
  return /* @__PURE__ */ import_react61.default.createElement(NestingContext.Provider, { value: nesting }, /* @__PURE__ */ import_react61.default.createElement(OpenClosedProvider, { value: openClosedState }, render2({
    ourProps,
    theirProps,
    defaultTag: DEFAULT_TRANSITION_CHILD_TAG,
    features: TransitionChildRenderFeatures,
    visible: state === "visible" /* Visible */,
    name: "Transition.Child"
  })));
}
function TransitionRootFn(props, ref) {
  let { show, appear = false, unmount = true, ...theirProps } = props;
  let internalTransitionRef = (0, import_react61.useRef)(null);
  let requiresRef = shouldForwardRef(props);
  let transitionRef = useSyncRefs(
    ...requiresRef ? [internalTransitionRef, ref] : ref === null ? [] : [ref]
  );
  useServerHandoffComplete();
  let usesOpenClosedState = useOpenClosed();
  if (show === void 0 && usesOpenClosedState !== null) {
    show = (usesOpenClosedState & 1 /* Open */) === 1 /* Open */;
  }
  if (show === void 0) {
    throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");
  }
  let [state, setState] = (0, import_react61.useState)(show ? "visible" /* Visible */ : "hidden" /* Hidden */);
  let nestingBag = useNesting(() => {
    if (show)
      return;
    setState("hidden" /* Hidden */);
  });
  let [initial, setInitial] = (0, import_react61.useState)(true);
  let changes = (0, import_react61.useRef)([show]);
  useIsoMorphicEffect(() => {
    if (initial === false) {
      return;
    }
    if (changes.current[changes.current.length - 1] !== show) {
      changes.current.push(show);
      setInitial(false);
    }
  }, [changes, show]);
  let transitionBag = (0, import_react61.useMemo)(
    () => ({ show, appear, initial }),
    [show, appear, initial]
  );
  useIsoMorphicEffect(() => {
    if (show) {
      setState("visible" /* Visible */);
    } else if (!hasChildren(nestingBag) && internalTransitionRef.current !== null) {
      setState("hidden" /* Hidden */);
    }
  }, [show, nestingBag]);
  let sharedProps = { unmount };
  let beforeEnter = useEvent(() => {
    var _a3;
    if (initial)
      setInitial(false);
    (_a3 = props.beforeEnter) == null ? void 0 : _a3.call(props);
  });
  let beforeLeave = useEvent(() => {
    var _a3;
    if (initial)
      setInitial(false);
    (_a3 = props.beforeLeave) == null ? void 0 : _a3.call(props);
  });
  let render2 = useRender();
  return /* @__PURE__ */ import_react61.default.createElement(NestingContext.Provider, { value: nestingBag }, /* @__PURE__ */ import_react61.default.createElement(TransitionContext.Provider, { value: transitionBag }, render2({
    ourProps: {
      ...sharedProps,
      as: import_react61.Fragment,
      children: /* @__PURE__ */ import_react61.default.createElement(
        InternalTransitionChild,
        {
          ref: transitionRef,
          ...sharedProps,
          ...theirProps,
          beforeEnter,
          beforeLeave
        }
      )
    },
    theirProps: {},
    defaultTag: import_react61.Fragment,
    features: TransitionChildRenderFeatures,
    visible: state === "visible" /* Visible */,
    name: "Transition"
  })));
}
function ChildFn(props, ref) {
  let hasTransitionContext = (0, import_react61.useContext)(TransitionContext) !== null;
  let hasOpenClosedContext = useOpenClosed() !== null;
  return /* @__PURE__ */ import_react61.default.createElement(import_react61.default.Fragment, null, !hasTransitionContext && hasOpenClosedContext ? /* @__PURE__ */ import_react61.default.createElement(TransitionRoot, { ref, ...props }) : /* @__PURE__ */ import_react61.default.createElement(InternalTransitionChild, { ref, ...props }));
}
var TransitionRoot = forwardRefWithAs(TransitionRootFn);
var InternalTransitionChild = forwardRefWithAs(
  TransitionChildFn
);
var TransitionChild = forwardRefWithAs(ChildFn);
var Transition = Object.assign(TransitionRoot, {
  /** @deprecated use `<TransitionChild>` instead of `<Transition.Child>` */
  Child: TransitionChild,
  /** @deprecated use `<Transition>` instead of `<Transition.Root>` */
  Root: TransitionRoot
});

// src/components/dialog/dialog.tsx
var reducers2 = {
  [0 /* SetTitleId */](state, action) {
    if (state.titleId === action.id)
      return state;
    return { ...state, titleId: action.id };
  }
};
var DialogContext = (0, import_react62.createContext)(null);
DialogContext.displayName = "DialogContext";
function useDialogContext(component) {
  let context = (0, import_react62.useContext)(DialogContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Dialog /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useDialogContext);
    throw err;
  }
  return context;
}
function stateReducer2(state, action) {
  return match(action.type, reducers2, state, action);
}
var InternalDialog = forwardRefWithAs(function InternalDialog2(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-dialog-${internalId}`,
    open,
    onClose,
    initialFocus,
    role = "dialog",
    autoFocus = true,
    __demoMode = false,
    unmount = false,
    ...theirProps
  } = props;
  let didWarnOnRole = (0, import_react62.useRef)(false);
  role = function() {
    if (role === "dialog" || role === "alertdialog") {
      return role;
    }
    if (!didWarnOnRole.current) {
      didWarnOnRole.current = true;
      console.warn(
        `Invalid role [${role}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`
      );
    }
    return "dialog";
  }();
  let usesOpenClosedState = useOpenClosed();
  if (open === void 0 && usesOpenClosedState !== null) {
    open = (usesOpenClosedState & 1 /* Open */) === 1 /* Open */;
  }
  let internalDialogRef = (0, import_react62.useRef)(null);
  let dialogRef = useSyncRefs(internalDialogRef, ref);
  let ownerDocument = useOwnerDocument(internalDialogRef);
  let dialogState = open ? 0 /* Open */ : 1 /* Closed */;
  let [state, dispatch] = (0, import_react62.useReducer)(stateReducer2, {
    titleId: null,
    descriptionId: null,
    panelRef: (0, import_react62.createRef)()
  });
  let close = useEvent(() => onClose(false));
  let setTitleId = useEvent((id2) => dispatch({ type: 0 /* SetTitleId */, id: id2 }));
  let ready = useServerHandoffComplete();
  let enabled = ready ? dialogState === 0 /* Open */ : false;
  let [portals, PortalWrapper] = useNestedPortals();
  let defaultContainer = {
    get current() {
      var _a3;
      return (_a3 = state.panelRef.current) != null ? _a3 : internalDialogRef.current;
    }
  };
  let mainTreeNode = useMainTreeNode();
  let { resolveContainers: resolveRootContainers } = useRootContainers({
    mainTreeNode,
    portals,
    defaultContainers: [defaultContainer]
  });
  let isClosing = usesOpenClosedState !== null ? (usesOpenClosedState & 4 /* Closing */) === 4 /* Closing */ : false;
  let inertOthersEnabled = __demoMode ? false : isClosing ? false : enabled;
  useInertOthers(inertOthersEnabled, {
    allowed: useEvent(() => {
      var _a3, _b2;
      return [
        // Allow the headlessui-portal of the Dialog to be interactive. This
        // contains the current dialog and the necessary focus guard elements.
        (_b2 = (_a3 = internalDialogRef.current) == null ? void 0 : _a3.closest("[data-headlessui-portal]")) != null ? _b2 : null
      ];
    }),
    disallowed: useEvent(() => {
      var _a3;
      return [
        // Disallow the "main" tree root node
        (_a3 = mainTreeNode == null ? void 0 : mainTreeNode.closest("body > *:not(#headlessui-portal-root)")) != null ? _a3 : null
      ];
    })
  });
  useOutsideClick(enabled, resolveRootContainers, (event) => {
    event.preventDefault();
    close();
  });
  useEscape(enabled, ownerDocument == null ? void 0 : ownerDocument.defaultView, (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (document.activeElement && "blur" in document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    close();
  });
  let scrollLockEnabled = __demoMode ? false : isClosing ? false : enabled;
  useScrollLock(scrollLockEnabled, ownerDocument, resolveRootContainers);
  useOnDisappear(enabled, internalDialogRef, close);
  let [describedby, DescriptionProvider] = useDescriptions();
  let contextBag = (0, import_react62.useMemo)(
    () => [{ dialogState, close, setTitleId, unmount }, state],
    [dialogState, state, close, setTitleId, unmount]
  );
  let slot = (0, import_react62.useMemo)(
    () => ({ open: dialogState === 0 /* Open */ }),
    [dialogState]
  );
  let ourProps = {
    ref: dialogRef,
    id,
    role,
    tabIndex: -1,
    "aria-modal": __demoMode ? void 0 : dialogState === 0 /* Open */ ? true : void 0,
    "aria-labelledby": state.titleId,
    "aria-describedby": describedby,
    unmount
  };
  let shouldMoveFocusInside = !useIsTouchDevice();
  let focusTrapFeatures = 0 /* None */;
  if (enabled && !__demoMode) {
    focusTrapFeatures |= 8 /* RestoreFocus */;
    focusTrapFeatures |= 2 /* TabLock */;
    if (autoFocus) {
      focusTrapFeatures |= 16 /* AutoFocus */;
    }
    if (shouldMoveFocusInside) {
      focusTrapFeatures |= 1 /* InitialFocus */;
    }
  }
  let render2 = useRender();
  return /* @__PURE__ */ import_react62.default.createElement(ResetOpenClosedProvider, null, /* @__PURE__ */ import_react62.default.createElement(ForcePortalRoot, { force: true }, /* @__PURE__ */ import_react62.default.createElement(Portal, null, /* @__PURE__ */ import_react62.default.createElement(DialogContext.Provider, { value: contextBag }, /* @__PURE__ */ import_react62.default.createElement(PortalGroup, { target: internalDialogRef }, /* @__PURE__ */ import_react62.default.createElement(ForcePortalRoot, { force: false }, /* @__PURE__ */ import_react62.default.createElement(DescriptionProvider, { slot }, /* @__PURE__ */ import_react62.default.createElement(PortalWrapper, null, /* @__PURE__ */ import_react62.default.createElement(
    FocusTrap,
    {
      initialFocus,
      initialFocusFallback: internalDialogRef,
      containers: resolveRootContainers,
      features: focusTrapFeatures
    },
    /* @__PURE__ */ import_react62.default.createElement(CloseProvider, { value: close }, render2({
      ourProps,
      theirProps,
      slot,
      defaultTag: DEFAULT_DIALOG_TAG,
      features: DialogRenderFeatures,
      visible: dialogState === 0 /* Open */,
      name: "Dialog"
    }))
  )))))))));
});
var DEFAULT_DIALOG_TAG = "div";
var DialogRenderFeatures = 1 /* RenderStrategy */ | 2 /* Static */;
function DialogFn(props, ref) {
  let { transition: transition2 = false, open, ...rest } = props;
  let usesOpenClosedState = useOpenClosed();
  let hasOpen = props.hasOwnProperty("open") || usesOpenClosedState !== null;
  let hasOnClose = props.hasOwnProperty("onClose");
  if (!hasOpen && !hasOnClose) {
    throw new Error(
      `You have to provide an \`open\` and an \`onClose\` prop to the \`Dialog\` component.`
    );
  }
  if (!hasOpen) {
    throw new Error(
      `You provided an \`onClose\` prop to the \`Dialog\`, but forgot an \`open\` prop.`
    );
  }
  if (!hasOnClose) {
    throw new Error(
      `You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onClose\` prop.`
    );
  }
  if (!usesOpenClosedState && typeof props.open !== "boolean") {
    throw new Error(
      `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${props.open}`
    );
  }
  if (typeof props.onClose !== "function") {
    throw new Error(
      `You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${props.onClose}`
    );
  }
  if ((open !== void 0 || transition2) && !rest.static) {
    return /* @__PURE__ */ import_react62.default.createElement(MainTreeProvider, null, /* @__PURE__ */ import_react62.default.createElement(Transition, { show: open, transition: transition2, unmount: rest.unmount }, /* @__PURE__ */ import_react62.default.createElement(InternalDialog, { ref, ...rest })));
  }
  return /* @__PURE__ */ import_react62.default.createElement(MainTreeProvider, null, /* @__PURE__ */ import_react62.default.createElement(InternalDialog, { ref, open, ...rest }));
}
var DEFAULT_PANEL_TAG = "div";
function PanelFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let { id = `headlessui-dialog-panel-${internalId}`, transition: transition2 = false, ...theirProps } = props;
  let [{ dialogState, unmount }, state] = useDialogContext("Dialog.Panel");
  let panelRef = useSyncRefs(ref, state.panelRef);
  let slot = (0, import_react62.useMemo)(
    () => ({ open: dialogState === 0 /* Open */ }),
    [dialogState]
  );
  let handleClick = useEvent((event) => {
    event.stopPropagation();
  });
  let ourProps = {
    ref: panelRef,
    id,
    onClick: handleClick
  };
  let Wrapper = transition2 ? TransitionChild : import_react62.Fragment;
  let wrapperProps = transition2 ? { unmount } : {};
  let render2 = useRender();
  return /* @__PURE__ */ import_react62.default.createElement(Wrapper, { ...wrapperProps }, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANEL_TAG,
    name: "Dialog.Panel"
  }));
}
var DEFAULT_BACKDROP_TAG = "div";
function BackdropFn(props, ref) {
  let { transition: transition2 = false, ...theirProps } = props;
  let [{ dialogState, unmount }] = useDialogContext("Dialog.Backdrop");
  let slot = (0, import_react62.useMemo)(
    () => ({ open: dialogState === 0 /* Open */ }),
    [dialogState]
  );
  let ourProps = { ref, "aria-hidden": true };
  let Wrapper = transition2 ? TransitionChild : import_react62.Fragment;
  let wrapperProps = transition2 ? { unmount } : {};
  let render2 = useRender();
  return /* @__PURE__ */ import_react62.default.createElement(Wrapper, { ...wrapperProps }, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BACKDROP_TAG,
    name: "Dialog.Backdrop"
  }));
}
var DEFAULT_TITLE_TAG = "h2";
function TitleFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let { id = `headlessui-dialog-title-${internalId}`, ...theirProps } = props;
  let [{ dialogState, setTitleId }] = useDialogContext("Dialog.Title");
  let titleRef = useSyncRefs(ref);
  (0, import_react62.useEffect)(() => {
    setTitleId(id);
    return () => setTitleId(null);
  }, [id, setTitleId]);
  let slot = (0, import_react62.useMemo)(
    () => ({ open: dialogState === 0 /* Open */ }),
    [dialogState]
  );
  let ourProps = { ref: titleRef, id };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TITLE_TAG,
    name: "Dialog.Title"
  });
}
var DialogRoot = forwardRefWithAs(DialogFn);
var DialogPanel = forwardRefWithAs(PanelFn);
var DialogBackdrop = forwardRefWithAs(BackdropFn);
var DialogTitle = forwardRefWithAs(TitleFn);
var DialogDescription = Description;
var Dialog = Object.assign(DialogRoot, {
  /** @deprecated use `<DialogPanel>` instead of `<Dialog.Panel>` */
  Panel: DialogPanel,
  /** @deprecated use `<DialogTitle>` instead of `<Dialog.Title>` */
  Title: DialogTitle,
  /** @deprecated use `<Description>` instead of `<Dialog.Description>` */
  Description
});

// src/components/disclosure/disclosure.tsx
var import_react64 = __toESM(require("react"), 1);

// src/utils/start-transition.ts
var import_react63 = __toESM(require("react"), 1);
var _a2;
var startTransition = (
  // Prefer React's `startTransition` if it's available.
  (_a2 = import_react63.default.startTransition) != null ? _a2 : function startTransition2(cb) {
    cb();
  }
);

// src/components/disclosure/disclosure.tsx
var reducers3 = {
  [0 /* ToggleDisclosure */]: (state) => ({
    ...state,
    disclosureState: match(state.disclosureState, {
      [0 /* Open */]: 1 /* Closed */,
      [1 /* Closed */]: 0 /* Open */
    })
  }),
  [1 /* CloseDisclosure */]: (state) => {
    if (state.disclosureState === 1 /* Closed */)
      return state;
    return { ...state, disclosureState: 1 /* Closed */ };
  },
  [2 /* SetButtonId */](state, action) {
    if (state.buttonId === action.buttonId)
      return state;
    return { ...state, buttonId: action.buttonId };
  },
  [3 /* SetPanelId */](state, action) {
    if (state.panelId === action.panelId)
      return state;
    return { ...state, panelId: action.panelId };
  },
  [4 /* SetButtonElement */](state, action) {
    if (state.buttonElement === action.element)
      return state;
    return { ...state, buttonElement: action.element };
  },
  [5 /* SetPanelElement */](state, action) {
    if (state.panelElement === action.element)
      return state;
    return { ...state, panelElement: action.element };
  }
};
var DisclosureContext = (0, import_react64.createContext)(null);
DisclosureContext.displayName = "DisclosureContext";
function useDisclosureContext(component) {
  let context = (0, import_react64.useContext)(DisclosureContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useDisclosureContext);
    throw err;
  }
  return context;
}
var DisclosureAPIContext = (0, import_react64.createContext)(null);
DisclosureAPIContext.displayName = "DisclosureAPIContext";
function useDisclosureAPIContext(component) {
  let context = (0, import_react64.useContext)(DisclosureAPIContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useDisclosureAPIContext);
    throw err;
  }
  return context;
}
var DisclosurePanelContext = (0, import_react64.createContext)(null);
DisclosurePanelContext.displayName = "DisclosurePanelContext";
function useDisclosurePanelContext() {
  return (0, import_react64.useContext)(DisclosurePanelContext);
}
function stateReducer3(state, action) {
  return match(action.type, reducers3, state, action);
}
var DEFAULT_DISCLOSURE_TAG = import_react64.Fragment;
function DisclosureFn(props, ref) {
  let { defaultOpen = false, ...theirProps } = props;
  let internalDisclosureRef = (0, import_react64.useRef)(null);
  let disclosureRef = useSyncRefs(
    ref,
    optionalRef(
      (ref2) => {
        internalDisclosureRef.current = ref2;
      },
      props.as === void 0 || // @ts-expect-error The `as` prop _can_ be a Fragment
      props.as === import_react64.Fragment
    )
  );
  let reducerBag = (0, import_react64.useReducer)(stateReducer3, {
    disclosureState: defaultOpen ? 0 /* Open */ : 1 /* Closed */,
    buttonElement: null,
    panelElement: null,
    buttonId: null,
    panelId: null
  });
  let [{ disclosureState, buttonId }, dispatch] = reducerBag;
  let close = useEvent((focusableElement) => {
    dispatch({ type: 1 /* CloseDisclosure */ });
    let ownerDocument = getOwnerDocument(internalDisclosureRef);
    if (!ownerDocument)
      return;
    if (!buttonId)
      return;
    let restoreElement = (() => {
      if (!focusableElement)
        return ownerDocument.getElementById(buttonId);
      if (focusableElement instanceof HTMLElement)
        return focusableElement;
      if (focusableElement.current instanceof HTMLElement)
        return focusableElement.current;
      return ownerDocument.getElementById(buttonId);
    })();
    restoreElement == null ? void 0 : restoreElement.focus();
  });
  let api = (0, import_react64.useMemo)(() => ({ close }), [close]);
  let slot = (0, import_react64.useMemo)(() => {
    return {
      open: disclosureState === 0 /* Open */,
      close
    };
  }, [disclosureState, close]);
  let ourProps = {
    ref: disclosureRef
  };
  let render2 = useRender();
  return /* @__PURE__ */ import_react64.default.createElement(DisclosureContext.Provider, { value: reducerBag }, /* @__PURE__ */ import_react64.default.createElement(DisclosureAPIContext.Provider, { value: api }, /* @__PURE__ */ import_react64.default.createElement(CloseProvider, { value: close }, /* @__PURE__ */ import_react64.default.createElement(
    OpenClosedProvider,
    {
      value: match(disclosureState, {
        [0 /* Open */]: 1 /* Open */,
        [1 /* Closed */]: 2 /* Closed */
      })
    },
    render2({
      ourProps,
      theirProps,
      slot,
      defaultTag: DEFAULT_DISCLOSURE_TAG,
      name: "Disclosure"
    })
  ))));
}
var DEFAULT_BUTTON_TAG3 = "button";
function ButtonFn3(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-disclosure-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props;
  let [state, dispatch] = useDisclosureContext("Disclosure.Button");
  let panelContext = useDisclosurePanelContext();
  let isWithinPanel = panelContext === null ? false : panelContext === state.panelId;
  let internalButtonRef = (0, import_react64.useRef)(null);
  let buttonRef = useSyncRefs(
    internalButtonRef,
    ref,
    useEvent((element) => {
      if (isWithinPanel)
        return;
      return dispatch({ type: 4 /* SetButtonElement */, element });
    })
  );
  (0, import_react64.useEffect)(() => {
    if (isWithinPanel)
      return;
    dispatch({ type: 2 /* SetButtonId */, buttonId: id });
    return () => {
      dispatch({ type: 2 /* SetButtonId */, buttonId: null });
    };
  }, [id, dispatch, isWithinPanel]);
  let handleKeyDown = useEvent((event) => {
    var _a3;
    if (isWithinPanel) {
      if (state.disclosureState === 1 /* Closed */)
        return;
      switch (event.key) {
        case " " /* Space */:
        case "Enter" /* Enter */:
          event.preventDefault();
          event.stopPropagation();
          dispatch({ type: 0 /* ToggleDisclosure */ });
          (_a3 = state.buttonElement) == null ? void 0 : _a3.focus();
          break;
      }
    } else {
      switch (event.key) {
        case " " /* Space */:
        case "Enter" /* Enter */:
          event.preventDefault();
          event.stopPropagation();
          dispatch({ type: 0 /* ToggleDisclosure */ });
          break;
      }
    }
  });
  let handleKeyUp = useEvent((event) => {
    switch (event.key) {
      case " " /* Space */:
        event.preventDefault();
        break;
    }
  });
  let handleClick = useEvent((event) => {
    var _a3;
    if (isDisabledReactIssue7711(event.currentTarget))
      return;
    if (disabled)
      return;
    if (isWithinPanel) {
      dispatch({ type: 0 /* ToggleDisclosure */ });
      (_a3 = state.buttonElement) == null ? void 0 : _a3.focus();
    } else {
      dispatch({ type: 0 /* ToggleDisclosure */ });
    }
  });
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let slot = (0, import_react64.useMemo)(() => {
    return {
      open: state.disclosureState === 0 /* Open */,
      hover,
      active,
      disabled,
      focus,
      autofocus: autoFocus
    };
  }, [state, hover, active, focus, disabled, autoFocus]);
  let type = useResolveButtonType(props, state.buttonElement);
  let ourProps = isWithinPanel ? mergeProps(
    {
      ref: buttonRef,
      type,
      disabled: disabled || void 0,
      autoFocus,
      onKeyDown: handleKeyDown,
      onClick: handleClick
    },
    focusProps,
    hoverProps,
    pressProps
  ) : mergeProps(
    {
      ref: buttonRef,
      id,
      type,
      "aria-expanded": state.disclosureState === 0 /* Open */,
      "aria-controls": state.panelElement ? state.panelId : void 0,
      disabled: disabled || void 0,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG3,
    name: "Disclosure.Button"
  });
}
var DEFAULT_PANEL_TAG2 = "div";
var PanelRenderFeatures = 1 /* RenderStrategy */ | 2 /* Static */;
function PanelFn2(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-disclosure-panel-${internalId}`,
    transition: transition2 = false,
    ...theirProps
  } = props;
  let [state, dispatch] = useDisclosureContext("Disclosure.Panel");
  let { close } = useDisclosureAPIContext("Disclosure.Panel");
  let [localPanelElement, setLocalPanelElement] = (0, import_react64.useState)(null);
  let panelRef = useSyncRefs(
    ref,
    useEvent((element) => {
      startTransition(() => dispatch({ type: 5 /* SetPanelElement */, element }));
    }),
    setLocalPanelElement
  );
  (0, import_react64.useEffect)(() => {
    dispatch({ type: 3 /* SetPanelId */, panelId: id });
    return () => {
      dispatch({ type: 3 /* SetPanelId */, panelId: null });
    };
  }, [id, dispatch]);
  let usesOpenClosedState = useOpenClosed();
  let [visible, transitionData] = useTransition(
    transition2,
    localPanelElement,
    usesOpenClosedState !== null ? (usesOpenClosedState & 1 /* Open */) === 1 /* Open */ : state.disclosureState === 0 /* Open */
  );
  let slot = (0, import_react64.useMemo)(() => {
    return {
      open: state.disclosureState === 0 /* Open */,
      close
    };
  }, [state.disclosureState, close]);
  let ourProps = {
    ref: panelRef,
    id,
    ...transitionDataAttributes(transitionData)
  };
  let render2 = useRender();
  return /* @__PURE__ */ import_react64.default.createElement(ResetOpenClosedProvider, null, /* @__PURE__ */ import_react64.default.createElement(DisclosurePanelContext.Provider, { value: state.panelId }, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANEL_TAG2,
    features: PanelRenderFeatures,
    visible,
    name: "Disclosure.Panel"
  })));
}
var DisclosureRoot = forwardRefWithAs(DisclosureFn);
var DisclosureButton = forwardRefWithAs(ButtonFn3);
var DisclosurePanel = forwardRefWithAs(PanelFn2);
var Disclosure = Object.assign(DisclosureRoot, {
  /** @deprecated use `<DisclosureButton>` instead of `<Disclosure.Button>` */
  Button: DisclosureButton,
  /** @deprecated use `<DisclosurePanel>` instead of `<Disclosure.Panel>` */
  Panel: DisclosurePanel
});

// src/components/field/field.tsx
var import_react65 = __toESM(require("react"), 1);
var DEFAULT_FIELD_TAG = "div";
function FieldFn(props, ref) {
  let inputId = `headlessui-control-${(0, import_react19.useId)()}`;
  let [labelledby, LabelProvider] = useLabels();
  let [describedBy, DescriptionProvider] = useDescriptions();
  let providedDisabled = useDisabled();
  let { disabled = providedDisabled || false, ...theirProps } = props;
  let slot = (0, import_react65.useMemo)(() => ({ disabled }), [disabled]);
  let ourProps = {
    ref,
    disabled: disabled || void 0,
    "aria-disabled": disabled || void 0
  };
  let render2 = useRender();
  return /* @__PURE__ */ import_react65.default.createElement(DisabledProvider, { value: disabled }, /* @__PURE__ */ import_react65.default.createElement(LabelProvider, { value: labelledby }, /* @__PURE__ */ import_react65.default.createElement(DescriptionProvider, { value: describedBy }, /* @__PURE__ */ import_react65.default.createElement(IdProvider, { id: inputId }, render2({
    ourProps,
    theirProps: {
      ...theirProps,
      children: /* @__PURE__ */ import_react65.default.createElement(FormFieldsProvider, null, typeof theirProps.children === "function" ? theirProps.children(slot) : theirProps.children)
    },
    slot,
    defaultTag: DEFAULT_FIELD_TAG,
    name: "Field"
  })))));
}
var Field = forwardRefWithAs(FieldFn);

// src/components/fieldset/fieldset.tsx
var import_react67 = __toESM(require("react"), 1);

// src/hooks/use-resolved-tag.ts
var import_react66 = require("react");
function useResolvedTag(tag) {
  let tagName = typeof tag === "string" ? tag : void 0;
  let [resolvedTag, setResolvedTag] = (0, import_react66.useState)(tagName);
  return [
    // The resolved tag name
    tagName != null ? tagName : resolvedTag,
    // This callback should be passed to the `ref` of a component
    (0, import_react66.useCallback)(
      (ref) => {
        if (tagName)
          return;
        if (ref instanceof HTMLElement) {
          setResolvedTag(ref.tagName.toLowerCase());
        }
      },
      [tagName]
    )
  ];
}

// src/components/fieldset/fieldset.tsx
var DEFAULT_FIELDSET_TAG = "fieldset";
function FieldsetFn(props, ref) {
  var _a3;
  let providedDisabled = useDisabled();
  let { disabled = providedDisabled || false, ...theirProps } = props;
  let [tag, resolveTag] = useResolvedTag((_a3 = props.as) != null ? _a3 : DEFAULT_FIELDSET_TAG);
  let fieldsetRef = useSyncRefs(ref, resolveTag);
  let [labelledBy, LabelProvider] = useLabels();
  let slot = (0, import_react67.useMemo)(() => ({ disabled }), [disabled]);
  let ourProps = tag === "fieldset" ? {
    ref: fieldsetRef,
    "aria-labelledby": labelledBy,
    disabled: disabled || void 0
  } : {
    ref: fieldsetRef,
    role: "group",
    "aria-labelledby": labelledBy,
    "aria-disabled": disabled || void 0
  };
  let render2 = useRender();
  return /* @__PURE__ */ import_react67.default.createElement(DisabledProvider, { value: disabled }, /* @__PURE__ */ import_react67.default.createElement(LabelProvider, null, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_FIELDSET_TAG,
    name: "Fieldset"
  })));
}
var Fieldset = forwardRefWithAs(FieldsetFn);

// src/components/input/input.tsx
var import_react68 = require("react");
var DEFAULT_INPUT_TAG2 = "input";
function InputFn2(props, ref) {
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = providedId || `headlessui-input-${internalId}`,
    disabled = providedDisabled || false,
    autoFocus = false,
    invalid = false,
    ...theirProps
  } = props;
  let labelledBy = useLabelledBy();
  let describedBy = useDescribedBy();
  let { isFocused: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let ourProps = mergeProps(
    {
      ref,
      id,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-invalid": invalid ? "" : void 0,
      disabled: disabled || void 0,
      autoFocus
    },
    focusProps,
    hoverProps
  );
  let slot = (0, import_react68.useMemo)(() => {
    return { disabled, invalid, hover, focus, autofocus: autoFocus };
  }, [disabled, invalid, hover, focus, autoFocus]);
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_INPUT_TAG2,
    name: "Input"
  });
}
var Input = forwardRefWithAs(InputFn2);

// src/components/legend/legend.tsx
var import_react69 = __toESM(require("react"), 1);
function LegendFn(props, ref) {
  return /* @__PURE__ */ import_react69.default.createElement(Label, { as: "div", ref, ...props });
}
var Legend = forwardRefWithAs(LegendFn);

// src/components/listbox/listbox.tsx
var import_react72 = __toESM(require("react"), 1);
var import_react_dom7 = require("react-dom");

// src/hooks/use-did-element-move.ts
var import_react70 = require("react");
function useDidElementMove(enabled, element) {
  let elementPosition = (0, import_react70.useRef)({ left: 0, top: 0 });
  useIsoMorphicEffect(() => {
    if (!element)
      return;
    let DOMRect = element.getBoundingClientRect();
    if (DOMRect)
      elementPosition.current = DOMRect;
  }, [enabled, element]);
  if (element == null)
    return false;
  if (!enabled)
    return false;
  if (element === document.activeElement)
    return false;
  let buttonRect = element.getBoundingClientRect();
  let didElementMove = buttonRect.top !== elementPosition.current.top || buttonRect.left !== elementPosition.current.left;
  return didElementMove;
}

// src/hooks/use-text-value.ts
var import_react71 = require("react");

// src/utils/get-text-value.ts
var emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
function getTextContents(element) {
  var _a3, _b2;
  let currentInnerText = (_a3 = element.innerText) != null ? _a3 : "";
  let copy = element.cloneNode(true);
  if (!(copy instanceof HTMLElement)) {
    return currentInnerText;
  }
  let dropped = false;
  for (let child of copy.querySelectorAll('[hidden],[aria-hidden],[role="img"]')) {
    child.remove();
    dropped = true;
  }
  let value = dropped ? (_b2 = copy.innerText) != null ? _b2 : "" : currentInnerText;
  if (emojiRegex.test(value)) {
    value = value.replace(emojiRegex, "");
  }
  return value;
}
function getTextValue(element) {
  let label = element.getAttribute("aria-label");
  if (typeof label === "string")
    return label.trim();
  let labelledby = element.getAttribute("aria-labelledby");
  if (labelledby) {
    let labels = labelledby.split(" ").map((labelledby2) => {
      let labelEl = document.getElementById(labelledby2);
      if (labelEl) {
        let label2 = labelEl.getAttribute("aria-label");
        if (typeof label2 === "string")
          return label2.trim();
        return getTextContents(labelEl).trim();
      }
      return null;
    }).filter(Boolean);
    if (labels.length > 0)
      return labels.join(", ");
  }
  return getTextContents(element).trim();
}

// src/hooks/use-text-value.ts
function useTextValue(element) {
  let cacheKey = (0, import_react71.useRef)("");
  let cacheValue = (0, import_react71.useRef)("");
  return useEvent(() => {
    let el = element.current;
    if (!el)
      return "";
    let currentKey = el.innerText;
    if (cacheKey.current === currentKey) {
      return cacheValue.current;
    }
    let value = getTextValue(el).trim().toLowerCase();
    cacheKey.current = currentKey;
    cacheValue.current = value;
    return value;
  });
}

// src/components/listbox/listbox.tsx
function adjustOrderedState2(state, adjustment = (i) => i) {
  let currentActiveOption = state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null;
  let sortedOptions = sortByDomNode(
    adjustment(state.options.slice()),
    (option) => option.dataRef.current.domRef.current
  );
  let adjustedActiveOptionIndex = currentActiveOption ? sortedOptions.indexOf(currentActiveOption) : null;
  if (adjustedActiveOptionIndex === -1) {
    adjustedActiveOptionIndex = null;
  }
  return {
    options: sortedOptions,
    activeOptionIndex: adjustedActiveOptionIndex
  };
}
var reducers4 = {
  [1 /* CloseListbox */](state) {
    if (state.dataRef.current.disabled)
      return state;
    if (state.listboxState === 1 /* Closed */)
      return state;
    return {
      ...state,
      activeOptionIndex: null,
      listboxState: 1 /* Closed */,
      __demoMode: false
    };
  },
  [0 /* OpenListbox */](state) {
    if (state.dataRef.current.disabled)
      return state;
    if (state.listboxState === 0 /* Open */)
      return state;
    let activeOptionIndex = state.activeOptionIndex;
    let { isSelected } = state.dataRef.current;
    let optionIdx = state.options.findIndex((option) => isSelected(option.dataRef.current.value));
    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx;
    }
    return { ...state, listboxState: 0 /* Open */, activeOptionIndex, __demoMode: false };
  },
  [2 /* GoToOption */](state, action) {
    var _a3, _b2, _c, _d, _e;
    if (state.dataRef.current.disabled)
      return state;
    if (state.listboxState === 1 /* Closed */)
      return state;
    let base = {
      ...state,
      searchQuery: "",
      activationTrigger: (_a3 = action.trigger) != null ? _a3 : 1 /* Other */,
      __demoMode: false
    };
    if (action.focus === 5 /* Nothing */) {
      return {
        ...base,
        activeOptionIndex: null
      };
    }
    if (action.focus === 4 /* Specific */) {
      return {
        ...base,
        activeOptionIndex: state.options.findIndex((o) => o.id === action.id)
      };
    } else if (action.focus === 1 /* Previous */) {
      let activeOptionIdx = state.activeOptionIndex;
      if (activeOptionIdx !== null) {
        let currentDom = state.options[activeOptionIdx].dataRef.current.domRef;
        let previousOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => state.options,
          resolveActiveIndex: () => state.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled
        });
        if (previousOptionIndex !== null) {
          let previousDom = state.options[previousOptionIndex].dataRef.current.domRef;
          if (
            // Next to each other
            ((_b2 = currentDom.current) == null ? void 0 : _b2.previousElementSibling) === previousDom.current || // Or already the first element
            ((_c = previousDom.current) == null ? void 0 : _c.previousElementSibling) === null
          ) {
            return {
              ...base,
              activeOptionIndex: previousOptionIndex
            };
          }
        }
      }
    } else if (action.focus === 2 /* Next */) {
      let activeOptionIdx = state.activeOptionIndex;
      if (activeOptionIdx !== null) {
        let currentDom = state.options[activeOptionIdx].dataRef.current.domRef;
        let nextOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => state.options,
          resolveActiveIndex: () => state.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled
        });
        if (nextOptionIndex !== null) {
          let nextDom = state.options[nextOptionIndex].dataRef.current.domRef;
          if (
            // Next to each other
            ((_d = currentDom.current) == null ? void 0 : _d.nextElementSibling) === nextDom.current || // Or already the last element
            ((_e = nextDom.current) == null ? void 0 : _e.nextElementSibling) === null
          ) {
            return {
              ...base,
              activeOptionIndex: nextOptionIndex
            };
          }
        }
      }
    }
    let adjustedState = adjustOrderedState2(state);
    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.options,
      resolveActiveIndex: () => adjustedState.activeOptionIndex,
      resolveId: (option) => option.id,
      resolveDisabled: (option) => option.dataRef.current.disabled
    });
    return {
      ...base,
      ...adjustedState,
      activeOptionIndex
    };
  },
  [3 /* Search */]: (state, action) => {
    if (state.dataRef.current.disabled)
      return state;
    if (state.listboxState === 1 /* Closed */)
      return state;
    let wasAlreadySearching = state.searchQuery !== "";
    let offset4 = wasAlreadySearching ? 0 : 1;
    let searchQuery = state.searchQuery + action.value.toLowerCase();
    let reOrderedOptions = state.activeOptionIndex !== null ? state.options.slice(state.activeOptionIndex + offset4).concat(state.options.slice(0, state.activeOptionIndex + offset4)) : state.options;
    let matchingOption = reOrderedOptions.find(
      (option) => {
        var _a3;
        return !option.dataRef.current.disabled && ((_a3 = option.dataRef.current.textValue) == null ? void 0 : _a3.startsWith(searchQuery));
      }
    );
    let matchIdx = matchingOption ? state.options.indexOf(matchingOption) : -1;
    if (matchIdx === -1 || matchIdx === state.activeOptionIndex)
      return { ...state, searchQuery };
    return {
      ...state,
      searchQuery,
      activeOptionIndex: matchIdx,
      activationTrigger: 1 /* Other */
    };
  },
  [4 /* ClearSearch */](state) {
    if (state.dataRef.current.disabled)
      return state;
    if (state.listboxState === 1 /* Closed */)
      return state;
    if (state.searchQuery === "")
      return state;
    return { ...state, searchQuery: "" };
  },
  [5 /* RegisterOption */]: (state, action) => {
    let option = { id: action.id, dataRef: action.dataRef };
    let adjustedState = adjustOrderedState2(state, (options) => [...options, option]);
    if (state.activeOptionIndex === null) {
      if (state.dataRef.current.isSelected(action.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option);
      }
    }
    return { ...state, ...adjustedState };
  },
  [6 /* UnregisterOption */]: (state, action) => {
    let adjustedState = adjustOrderedState2(state, (options) => {
      let idx = options.findIndex((a) => a.id === action.id);
      if (idx !== -1)
        options.splice(idx, 1);
      return options;
    });
    return {
      ...state,
      ...adjustedState,
      activationTrigger: 1 /* Other */
    };
  },
  [7 /* SetButtonElement */]: (state, action) => {
    if (state.buttonElement === action.element)
      return state;
    return { ...state, buttonElement: action.element };
  },
  [8 /* SetOptionsElement */]: (state, action) => {
    if (state.optionsElement === action.element)
      return state;
    return { ...state, optionsElement: action.element };
  }
};
var ListboxActionsContext = (0, import_react72.createContext)(null);
ListboxActionsContext.displayName = "ListboxActionsContext";
function useActions2(component) {
  let context = (0, import_react72.useContext)(ListboxActionsContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useActions2);
    throw err;
  }
  return context;
}
var ListboxDataContext = (0, import_react72.createContext)(null);
ListboxDataContext.displayName = "ListboxDataContext";
function useData2(component) {
  let context = (0, import_react72.useContext)(ListboxDataContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useData2);
    throw err;
  }
  return context;
}
function stateReducer4(state, action) {
  return match(action.type, reducers4, state, action);
}
var DEFAULT_LISTBOX_TAG = import_react72.Fragment;
function ListboxFn(props, ref) {
  var _a3;
  let providedDisabled = useDisabled();
  let {
    value: controlledValue,
    defaultValue: _defaultValue,
    form,
    name,
    onChange: controlledOnChange,
    by,
    invalid = false,
    disabled = providedDisabled || false,
    horizontal = false,
    multiple = false,
    __demoMode = false,
    ...theirProps
  } = props;
  const orientation = horizontal ? "horizontal" : "vertical";
  let listboxRef = useSyncRefs(ref);
  let defaultValue = useDefaultValue(_defaultValue);
  let [value = multiple ? [] : void 0, theirOnChange] = useControllable(
    controlledValue,
    controlledOnChange,
    defaultValue
  );
  let [state, dispatch] = (0, import_react72.useReducer)(stateReducer4, {
    dataRef: (0, import_react72.createRef)(),
    listboxState: __demoMode ? 0 /* Open */ : 1 /* Closed */,
    options: [],
    searchQuery: "",
    activeOptionIndex: null,
    activationTrigger: 1 /* Other */,
    optionsVisible: false,
    buttonElement: null,
    optionsElement: null,
    __demoMode
  });
  let optionsPropsRef = (0, import_react72.useRef)({ static: false, hold: false });
  let listRef = (0, import_react72.useRef)(/* @__PURE__ */ new Map());
  let compare = useByComparator(by);
  let isSelected = (0, import_react72.useCallback)(
    (compareValue) => match(data.mode, {
      [1 /* Multi */]: () => {
        return value.some((option) => compare(option, compareValue));
      },
      [0 /* Single */]: () => {
        return compare(value, compareValue);
      }
    }),
    [value]
  );
  let data = (0, import_react72.useMemo)(
    () => ({
      ...state,
      value,
      disabled,
      invalid,
      mode: multiple ? 1 /* Multi */ : 0 /* Single */,
      orientation,
      compare,
      isSelected,
      optionsPropsRef,
      listRef
    }),
    [value, disabled, invalid, multiple, state, listRef]
  );
  useIsoMorphicEffect(() => {
    state.dataRef.current = data;
  }, [data]);
  let outsideClickEnabled = data.listboxState === 0 /* Open */;
  useOutsideClick(
    outsideClickEnabled,
    [data.buttonElement, data.optionsElement],
    (event, target) => {
      var _a4;
      dispatch({ type: 1 /* CloseListbox */ });
      if (!isFocusableElement(target, 1 /* Loose */)) {
        event.preventDefault();
        (_a4 = data.buttonElement) == null ? void 0 : _a4.focus();
      }
    }
  );
  let slot = (0, import_react72.useMemo)(() => {
    return {
      open: data.listboxState === 0 /* Open */,
      disabled,
      invalid,
      value
    };
  }, [data, disabled, value, invalid]);
  let selectOption = useEvent((id) => {
    let option = data.options.find((item) => item.id === id);
    if (!option)
      return;
    onChange(option.dataRef.current.value);
  });
  let selectActiveOption = useEvent(() => {
    if (data.activeOptionIndex !== null) {
      let { dataRef, id } = data.options[data.activeOptionIndex];
      onChange(dataRef.current.value);
      dispatch({ type: 2 /* GoToOption */, focus: 4 /* Specific */, id });
    }
  });
  let openListbox = useEvent(() => dispatch({ type: 0 /* OpenListbox */ }));
  let closeListbox = useEvent(() => dispatch({ type: 1 /* CloseListbox */ }));
  let d = useDisposables();
  let goToOption = useEvent((focus, id, trigger) => {
    d.dispose();
    d.microTask(() => {
      if (focus === 4 /* Specific */) {
        return dispatch({ type: 2 /* GoToOption */, focus: 4 /* Specific */, id, trigger });
      }
      return dispatch({ type: 2 /* GoToOption */, focus, trigger });
    });
  });
  let registerOption = useEvent((id, dataRef) => {
    dispatch({ type: 5 /* RegisterOption */, id, dataRef });
    return () => dispatch({ type: 6 /* UnregisterOption */, id });
  });
  let onChange = useEvent((value2) => {
    return match(data.mode, {
      [0 /* Single */]() {
        return theirOnChange == null ? void 0 : theirOnChange(value2);
      },
      [1 /* Multi */]() {
        let copy = data.value.slice();
        let idx = copy.findIndex((item) => compare(item, value2));
        if (idx === -1) {
          copy.push(value2);
        } else {
          copy.splice(idx, 1);
        }
        return theirOnChange == null ? void 0 : theirOnChange(copy);
      }
    });
  });
  let search = useEvent((value2) => dispatch({ type: 3 /* Search */, value: value2 }));
  let clearSearch = useEvent(() => dispatch({ type: 4 /* ClearSearch */ }));
  let setButtonElement = useEvent((element) => {
    dispatch({ type: 7 /* SetButtonElement */, element });
  });
  let setOptionsElement = useEvent((element) => {
    dispatch({ type: 8 /* SetOptionsElement */, element });
  });
  let actions = (0, import_react72.useMemo)(
    () => ({
      onChange,
      registerOption,
      goToOption,
      closeListbox,
      openListbox,
      selectActiveOption,
      selectOption,
      search,
      clearSearch,
      setButtonElement,
      setOptionsElement
    }),
    []
  );
  let [labelledby, LabelProvider] = useLabels({ inherit: true });
  let ourProps = { ref: listboxRef };
  let reset = (0, import_react72.useCallback)(() => {
    if (defaultValue === void 0)
      return;
    return theirOnChange == null ? void 0 : theirOnChange(defaultValue);
  }, [theirOnChange, defaultValue]);
  let render2 = useRender();
  return /* @__PURE__ */ import_react72.default.createElement(
    LabelProvider,
    {
      value: labelledby,
      props: {
        htmlFor: (_a3 = data.buttonElement) == null ? void 0 : _a3.id
      },
      slot: {
        open: data.listboxState === 0 /* Open */,
        disabled
      }
    },
    /* @__PURE__ */ import_react72.default.createElement(FloatingProvider, null, /* @__PURE__ */ import_react72.default.createElement(ListboxActionsContext.Provider, { value: actions }, /* @__PURE__ */ import_react72.default.createElement(ListboxDataContext.Provider, { value: data }, /* @__PURE__ */ import_react72.default.createElement(
      OpenClosedProvider,
      {
        value: match(data.listboxState, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        })
      },
      name != null && value != null && /* @__PURE__ */ import_react72.default.createElement(
        FormFields,
        {
          disabled,
          data: { [name]: value },
          form,
          onReset: reset
        }
      ),
      render2({
        ourProps,
        theirProps,
        slot,
        defaultTag: DEFAULT_LISTBOX_TAG,
        name: "Listbox"
      })
    ))))
  );
}
var DEFAULT_BUTTON_TAG4 = "button";
function ButtonFn4(props, ref) {
  var _a3;
  let data = useData2("Listbox.Button");
  let actions = useActions2("Listbox.Button");
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let {
    id = providedId || `headlessui-listbox-button-${internalId}`,
    disabled = data.disabled || false,
    autoFocus = false,
    ...theirProps
  } = props;
  let buttonRef = useSyncRefs(ref, useFloatingReference(), actions.setButtonElement);
  let getFloatingReferenceProps = useFloatingReferenceProps();
  let handleKeyDown = useEvent((event) => {
    switch (event.key) {
      case "Enter" /* Enter */:
        attemptSubmit(event.currentTarget);
        break;
      case " " /* Space */:
      case "ArrowDown" /* ArrowDown */:
        event.preventDefault();
        (0, import_react_dom7.flushSync)(() => actions.openListbox());
        if (!data.value)
          actions.goToOption(0 /* First */);
        break;
      case "ArrowUp" /* ArrowUp */:
        event.preventDefault();
        (0, import_react_dom7.flushSync)(() => actions.openListbox());
        if (!data.value)
          actions.goToOption(3 /* Last */);
        break;
    }
  });
  let handleKeyUp = useEvent((event) => {
    switch (event.key) {
      case " " /* Space */:
        event.preventDefault();
        break;
    }
  });
  let handleClick = useEvent((event) => {
    var _a4;
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    if (data.listboxState === 0 /* Open */) {
      (0, import_react_dom7.flushSync)(() => actions.closeListbox());
      (_a4 = data.buttonElement) == null ? void 0 : _a4.focus({ preventScroll: true });
    } else {
      event.preventDefault();
      actions.openListbox();
    }
  });
  let handleKeyPress = useEvent((event) => event.preventDefault());
  let labelledBy = useLabelledBy([id]);
  let describedBy = useDescribedBy();
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let slot = (0, import_react72.useMemo)(() => {
    return {
      open: data.listboxState === 0 /* Open */,
      active: active || data.listboxState === 0 /* Open */,
      disabled,
      invalid: data.invalid,
      value: data.value,
      hover,
      focus,
      autofocus: autoFocus
    };
  }, [data.listboxState, data.value, disabled, hover, focus, active, data.invalid, autoFocus]);
  let ourProps = mergeProps(
    getFloatingReferenceProps(),
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, data.buttonElement),
      "aria-haspopup": "listbox",
      "aria-controls": (_a3 = data.optionsElement) == null ? void 0 : _a3.id,
      "aria-expanded": data.listboxState === 0 /* Open */,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      disabled: disabled || void 0,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onKeyPress: handleKeyPress,
      onClick: handleClick
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG4,
    name: "Listbox.Button"
  });
}
var SelectedOptionContext = (0, import_react72.createContext)(false);
var DEFAULT_OPTIONS_TAG2 = "div";
var OptionsRenderFeatures2 = 1 /* RenderStrategy */ | 2 /* Static */;
function OptionsFn2(props, ref) {
  var _a3, _b2;
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-listbox-options-${internalId}`,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition: transition2 = false,
    ...theirProps
  } = props;
  let anchor = useResolvedAnchor(rawAnchor);
  let [localOptionsElement, setLocalOptionsElement] = (0, import_react72.useState)(null);
  if (anchor) {
    portal = true;
  }
  let data = useData2("Listbox.Options");
  let actions = useActions2("Listbox.Options");
  let portalOwnerDocument = useOwnerDocument(data.buttonElement);
  let ownerDocument = useOwnerDocument(data.optionsElement);
  let usesOpenClosedState = useOpenClosed();
  let [visible, transitionData] = useTransition(
    transition2,
    localOptionsElement,
    usesOpenClosedState !== null ? (usesOpenClosedState & 1 /* Open */) === 1 /* Open */ : data.listboxState === 0 /* Open */
  );
  useOnDisappear(visible, data.buttonElement, actions.closeListbox);
  let scrollLockEnabled = data.__demoMode ? false : modal && data.listboxState === 0 /* Open */;
  useScrollLock(scrollLockEnabled, ownerDocument);
  let inertOthersEnabled = data.__demoMode ? false : modal && data.listboxState === 0 /* Open */;
  useInertOthers(inertOthersEnabled, {
    allowed: (0, import_react72.useCallback)(
      () => [data.buttonElement, data.optionsElement],
      [data.buttonElement, data.optionsElement]
    )
  });
  let didElementMoveEnabled = data.listboxState !== 0 /* Open */;
  let didButtonMove = useDidElementMove(didElementMoveEnabled, data.buttonElement);
  let panelEnabled = didButtonMove ? false : visible;
  let shouldFreeze = visible && data.listboxState === 1 /* Closed */;
  let frozenValue = useFrozenData(shouldFreeze, data.value);
  let isSelected = useEvent((compareValue) => data.compare(frozenValue, compareValue));
  let selectedOptionIndex = (0, import_react72.useMemo)(() => {
    var _a4;
    if (anchor == null)
      return null;
    if (!((_a4 = anchor == null ? void 0 : anchor.to) == null ? void 0 : _a4.includes("selection")))
      return null;
    let idx = data.options.findIndex((option) => isSelected(option.dataRef.current.value));
    if (idx === -1)
      idx = 0;
    return idx;
  }, [anchor, data.options]);
  let anchorOptions = (() => {
    if (anchor == null)
      return void 0;
    if (selectedOptionIndex === null)
      return { ...anchor, inner: void 0 };
    let elements = Array.from(data.listRef.current.values());
    return {
      ...anchor,
      inner: {
        listRef: { current: elements },
        index: selectedOptionIndex
      }
    };
  })();
  let [floatingRef, style] = useFloatingPanel(anchorOptions);
  let getFloatingPanelProps = useFloatingPanelProps();
  let optionsRef = useSyncRefs(
    ref,
    anchor ? floatingRef : null,
    actions.setOptionsElement,
    setLocalOptionsElement
  );
  let searchDisposables = useDisposables();
  (0, import_react72.useEffect)(() => {
    var _a4;
    let container = data.optionsElement;
    if (!container)
      return;
    if (data.listboxState !== 0 /* Open */)
      return;
    if (container === ((_a4 = getOwnerDocument(container)) == null ? void 0 : _a4.activeElement))
      return;
    container == null ? void 0 : container.focus({ preventScroll: true });
  }, [data.listboxState, data.optionsElement]);
  let handleKeyDown = useEvent((event) => {
    var _a4, _b3;
    searchDisposables.dispose();
    switch (event.key) {
      case " " /* Space */:
        if (data.searchQuery !== "") {
          event.preventDefault();
          event.stopPropagation();
          return actions.search(event.key);
        }
      case "Enter" /* Enter */:
        event.preventDefault();
        event.stopPropagation();
        if (data.activeOptionIndex !== null) {
          let { dataRef } = data.options[data.activeOptionIndex];
          actions.onChange(dataRef.current.value);
        }
        if (data.mode === 0 /* Single */) {
          (0, import_react_dom7.flushSync)(() => actions.closeListbox());
          (_a4 = data.buttonElement) == null ? void 0 : _a4.focus({ preventScroll: true });
        }
        break;
      case match(data.orientation, { vertical: "ArrowDown" /* ArrowDown */, horizontal: "ArrowRight" /* ArrowRight */ }):
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(2 /* Next */);
      case match(data.orientation, { vertical: "ArrowUp" /* ArrowUp */, horizontal: "ArrowLeft" /* ArrowLeft */ }):
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(1 /* Previous */);
      case "Home" /* Home */:
      case "PageUp" /* PageUp */:
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(0 /* First */);
      case "End" /* End */:
      case "PageDown" /* PageDown */:
        event.preventDefault();
        event.stopPropagation();
        return actions.goToOption(3 /* Last */);
      case "Escape" /* Escape */:
        event.preventDefault();
        event.stopPropagation();
        (0, import_react_dom7.flushSync)(() => actions.closeListbox());
        (_b3 = data.buttonElement) == null ? void 0 : _b3.focus({ preventScroll: true });
        return;
      case "Tab" /* Tab */:
        event.preventDefault();
        event.stopPropagation();
        (0, import_react_dom7.flushSync)(() => actions.closeListbox());
        focusFrom(
          data.buttonElement,
          event.shiftKey ? 2 /* Previous */ : 4 /* Next */
        );
        break;
      default:
        if (event.key.length === 1) {
          actions.search(event.key);
          searchDisposables.setTimeout(() => actions.clearSearch(), 350);
        }
        break;
    }
  });
  let labelledby = (_a3 = data.buttonElement) == null ? void 0 : _a3.id;
  let slot = (0, import_react72.useMemo)(() => {
    return {
      open: data.listboxState === 0 /* Open */
    };
  }, [data.listboxState]);
  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    id,
    ref: optionsRef,
    "aria-activedescendant": data.activeOptionIndex === null ? void 0 : (_b2 = data.options[data.activeOptionIndex]) == null ? void 0 : _b2.id,
    "aria-multiselectable": data.mode === 1 /* Multi */ ? true : void 0,
    "aria-labelledby": labelledby,
    "aria-orientation": data.orientation,
    onKeyDown: handleKeyDown,
    role: "listbox",
    // When the `Listbox` is closed, it should not be focusable. This allows us
    // to skip focusing the `ListboxOptions` when pressing the tab key on an
    // open `Listbox`, and go to the next focusable element.
    tabIndex: data.listboxState === 0 /* Open */ ? 0 : void 0,
    style: {
      ...theirProps.style,
      ...style,
      "--button-width": useElementSize(data.buttonElement, true).width
    },
    ...transitionDataAttributes(transitionData)
  });
  let render2 = useRender();
  return /* @__PURE__ */ import_react72.default.createElement(Portal, { enabled: portal ? props.static || visible : false, ownerDocument: portalOwnerDocument }, /* @__PURE__ */ import_react72.default.createElement(
    ListboxDataContext.Provider,
    {
      value: data.mode === 1 /* Multi */ ? data : { ...data, isSelected }
    },
    render2({
      ourProps,
      theirProps,
      slot,
      defaultTag: DEFAULT_OPTIONS_TAG2,
      features: OptionsRenderFeatures2,
      visible: panelEnabled,
      name: "Listbox.Options"
    })
  ));
}
var DEFAULT_OPTION_TAG2 = "div";
function OptionFn2(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-listbox-option-${internalId}`,
    disabled = false,
    value,
    ...theirProps
  } = props;
  let usedInSelectedOption = (0, import_react72.useContext)(SelectedOptionContext) === true;
  let data = useData2("Listbox.Option");
  let actions = useActions2("Listbox.Option");
  let active = data.activeOptionIndex !== null ? data.options[data.activeOptionIndex].id === id : false;
  let selected = data.isSelected(value);
  let internalOptionRef = (0, import_react72.useRef)(null);
  let getTextValue2 = useTextValue(internalOptionRef);
  let bag = useLatestValue({
    disabled,
    value,
    domRef: internalOptionRef,
    get textValue() {
      return getTextValue2();
    }
  });
  let optionRef = useSyncRefs(ref, internalOptionRef, (el) => {
    if (!el) {
      data.listRef.current.delete(id);
    } else {
      data.listRef.current.set(id, el);
    }
  });
  useIsoMorphicEffect(() => {
    if (data.__demoMode)
      return;
    if (data.listboxState !== 0 /* Open */)
      return;
    if (!active)
      return;
    if (data.activationTrigger === 0 /* Pointer */)
      return;
    return disposables().requestAnimationFrame(() => {
      var _a3, _b2;
      (_b2 = (_a3 = internalOptionRef.current) == null ? void 0 : _a3.scrollIntoView) == null ? void 0 : _b2.call(_a3, { block: "nearest" });
    });
  }, [
    internalOptionRef,
    active,
    data.__demoMode,
    data.listboxState,
    data.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */
    data.activeOptionIndex
  ]);
  useIsoMorphicEffect(() => {
    if (usedInSelectedOption)
      return;
    return actions.registerOption(id, bag);
  }, [bag, id, usedInSelectedOption]);
  let handleClick = useEvent((event) => {
    var _a3;
    if (disabled)
      return event.preventDefault();
    actions.onChange(value);
    if (data.mode === 0 /* Single */) {
      (0, import_react_dom7.flushSync)(() => actions.closeListbox());
      (_a3 = data.buttonElement) == null ? void 0 : _a3.focus({ preventScroll: true });
    }
  });
  let handleFocus = useEvent(() => {
    if (disabled)
      return actions.goToOption(5 /* Nothing */);
    actions.goToOption(4 /* Specific */, id);
  });
  let pointer = useTrackedPointer();
  let handleEnter = useEvent((evt) => {
    pointer.update(evt);
    if (disabled)
      return;
    if (active)
      return;
    actions.goToOption(4 /* Specific */, id, 0 /* Pointer */);
  });
  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt))
      return;
    if (disabled)
      return;
    if (active)
      return;
    actions.goToOption(4 /* Specific */, id, 0 /* Pointer */);
  });
  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt))
      return;
    if (disabled)
      return;
    if (!active)
      return;
    actions.goToOption(5 /* Nothing */);
  });
  let slot = (0, import_react72.useMemo)(() => {
    return {
      active,
      focus: active,
      selected,
      disabled,
      selectedOption: selected && usedInSelectedOption
    };
  }, [active, selected, disabled, usedInSelectedOption]);
  let ourProps = !usedInSelectedOption ? {
    id,
    ref: optionRef,
    role: "option",
    tabIndex: disabled === true ? void 0 : -1,
    "aria-disabled": disabled === true ? true : void 0,
    // According to the WAI-ARIA best practices, we should use aria-checked for
    // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
    // both single and multi-select.
    "aria-selected": selected,
    disabled: void 0,
    // Never forward the `disabled` prop
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave
  } : {};
  let render2 = useRender();
  if (!selected && usedInSelectedOption) {
    return null;
  }
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG2,
    name: "Listbox.Option"
  });
}
var DEFAULT_SELECTED_OPTION_TAG = import_react72.Fragment;
function SelectedFn(props, ref) {
  let { options: children, placeholder, ...theirProps } = props;
  let selectedRef = useSyncRefs(ref);
  let ourProps = { ref: selectedRef };
  let data = useData2("ListboxSelectedOption");
  let slot = (0, import_react72.useMemo)(() => ({}), []);
  let shouldShowPlaceholder = data.value === void 0 || data.value === null || data.mode === 1 /* Multi */ && Array.isArray(data.value) && data.value.length === 0;
  let render2 = useRender();
  return /* @__PURE__ */ import_react72.default.createElement(SelectedOptionContext.Provider, { value: true }, render2({
    ourProps,
    theirProps: {
      ...theirProps,
      children: /* @__PURE__ */ import_react72.default.createElement(import_react72.default.Fragment, null, placeholder && shouldShowPlaceholder ? placeholder : children)
    },
    slot,
    defaultTag: DEFAULT_SELECTED_OPTION_TAG,
    name: "ListboxSelectedOption"
  }));
}
var ListboxRoot = forwardRefWithAs(ListboxFn);
var ListboxButton = forwardRefWithAs(ButtonFn4);
var ListboxLabel = Label;
var ListboxOptions = forwardRefWithAs(OptionsFn2);
var ListboxOption = forwardRefWithAs(OptionFn2);
var ListboxSelectedOption = forwardRefWithAs(
  SelectedFn
);
var Listbox = Object.assign(ListboxRoot, {
  /** @deprecated use `<ListboxButton>` instead of `<Listbox.Button>` */
  Button: ListboxButton,
  /** @deprecated use `<Label>` instead of `<Listbox.Label>` */
  Label: ListboxLabel,
  /** @deprecated use `<ListboxOptions>` instead of `<Listbox.Options>` */
  Options: ListboxOptions,
  /** @deprecated use `<ListboxOption>` instead of `<Listbox.Option>` */
  Option: ListboxOption,
  /** @deprecated use `<ListboxSelectedOption>` instead of `<Listbox.SelectedOption>` */
  SelectedOption: ListboxSelectedOption
});

// src/components/menu/menu.tsx
var import_react73 = __toESM(require("react"), 1);
var import_react_dom8 = require("react-dom");
function adjustOrderedState3(state, adjustment = (i) => i) {
  let currentActiveItem = state.activeItemIndex !== null ? state.items[state.activeItemIndex] : null;
  let sortedItems = sortByDomNode(
    adjustment(state.items.slice()),
    (item) => item.dataRef.current.domRef.current
  );
  let adjustedActiveItemIndex = currentActiveItem ? sortedItems.indexOf(currentActiveItem) : null;
  if (adjustedActiveItemIndex === -1) {
    adjustedActiveItemIndex = null;
  }
  return {
    items: sortedItems,
    activeItemIndex: adjustedActiveItemIndex
  };
}
var reducers5 = {
  [1 /* CloseMenu */](state) {
    if (state.menuState === 1 /* Closed */)
      return state;
    return { ...state, activeItemIndex: null, menuState: 1 /* Closed */ };
  },
  [0 /* OpenMenu */](state) {
    if (state.menuState === 0 /* Open */)
      return state;
    return {
      ...state,
      /* We can turn off demo mode once we re-open the `Menu` */
      __demoMode: false,
      menuState: 0 /* Open */
    };
  },
  [2 /* GoToItem */]: (state, action) => {
    var _a3, _b2, _c, _d, _e;
    if (state.menuState === 1 /* Closed */)
      return state;
    let base = {
      ...state,
      searchQuery: "",
      activationTrigger: (_a3 = action.trigger) != null ? _a3 : 1 /* Other */,
      __demoMode: false
    };
    if (action.focus === 5 /* Nothing */) {
      return {
        ...base,
        activeItemIndex: null
      };
    }
    if (action.focus === 4 /* Specific */) {
      return {
        ...base,
        activeItemIndex: state.items.findIndex((o) => o.id === action.id)
      };
    } else if (action.focus === 1 /* Previous */) {
      let activeItemIdx = state.activeItemIndex;
      if (activeItemIdx !== null) {
        let currentDom = state.items[activeItemIdx].dataRef.current.domRef;
        let previousItemIndex = calculateActiveIndex(action, {
          resolveItems: () => state.items,
          resolveActiveIndex: () => state.activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.dataRef.current.disabled
        });
        if (previousItemIndex !== null) {
          let previousDom = state.items[previousItemIndex].dataRef.current.domRef;
          if (
            // Next to each other
            ((_b2 = currentDom.current) == null ? void 0 : _b2.previousElementSibling) === previousDom.current || // Or already the first element
            ((_c = previousDom.current) == null ? void 0 : _c.previousElementSibling) === null
          ) {
            return {
              ...base,
              activeItemIndex: previousItemIndex
            };
          }
        }
      }
    } else if (action.focus === 2 /* Next */) {
      let activeItemIdx = state.activeItemIndex;
      if (activeItemIdx !== null) {
        let currentDom = state.items[activeItemIdx].dataRef.current.domRef;
        let nextItemIndex = calculateActiveIndex(action, {
          resolveItems: () => state.items,
          resolveActiveIndex: () => state.activeItemIndex,
          resolveId: (item) => item.id,
          resolveDisabled: (item) => item.dataRef.current.disabled
        });
        if (nextItemIndex !== null) {
          let nextDom = state.items[nextItemIndex].dataRef.current.domRef;
          if (
            // Next to each other
            ((_d = currentDom.current) == null ? void 0 : _d.nextElementSibling) === nextDom.current || // Or already the last element
            ((_e = nextDom.current) == null ? void 0 : _e.nextElementSibling) === null
          ) {
            return {
              ...base,
              activeItemIndex: nextItemIndex
            };
          }
        }
      }
    }
    let adjustedState = adjustOrderedState3(state);
    let activeItemIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.items,
      resolveActiveIndex: () => adjustedState.activeItemIndex,
      resolveId: (item) => item.id,
      resolveDisabled: (item) => item.dataRef.current.disabled
    });
    return {
      ...base,
      ...adjustedState,
      activeItemIndex
    };
  },
  [3 /* Search */]: (state, action) => {
    let wasAlreadySearching = state.searchQuery !== "";
    let offset4 = wasAlreadySearching ? 0 : 1;
    let searchQuery = state.searchQuery + action.value.toLowerCase();
    let reOrderedItems = state.activeItemIndex !== null ? state.items.slice(state.activeItemIndex + offset4).concat(state.items.slice(0, state.activeItemIndex + offset4)) : state.items;
    let matchingItem = reOrderedItems.find(
      (item) => {
        var _a3;
        return ((_a3 = item.dataRef.current.textValue) == null ? void 0 : _a3.startsWith(searchQuery)) && !item.dataRef.current.disabled;
      }
    );
    let matchIdx = matchingItem ? state.items.indexOf(matchingItem) : -1;
    if (matchIdx === -1 || matchIdx === state.activeItemIndex)
      return { ...state, searchQuery };
    return {
      ...state,
      searchQuery,
      activeItemIndex: matchIdx,
      activationTrigger: 1 /* Other */
    };
  },
  [4 /* ClearSearch */](state) {
    if (state.searchQuery === "")
      return state;
    return { ...state, searchQuery: "", searchActiveItemIndex: null };
  },
  [5 /* RegisterItem */]: (state, action) => {
    let adjustedState = adjustOrderedState3(state, (items) => [
      ...items,
      { id: action.id, dataRef: action.dataRef }
    ]);
    return { ...state, ...adjustedState };
  },
  [6 /* UnregisterItem */]: (state, action) => {
    let adjustedState = adjustOrderedState3(state, (items) => {
      let idx = items.findIndex((a) => a.id === action.id);
      if (idx !== -1)
        items.splice(idx, 1);
      return items;
    });
    return {
      ...state,
      ...adjustedState,
      activationTrigger: 1 /* Other */
    };
  },
  [7 /* SetButtonElement */]: (state, action) => {
    if (state.buttonElement === action.element)
      return state;
    return { ...state, buttonElement: action.element };
  },
  [8 /* SetItemsElement */]: (state, action) => {
    if (state.itemsElement === action.element)
      return state;
    return { ...state, itemsElement: action.element };
  }
};
var MenuContext = (0, import_react73.createContext)(null);
MenuContext.displayName = "MenuContext";
function useMenuContext(component) {
  let context = (0, import_react73.useContext)(MenuContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Menu /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useMenuContext);
    throw err;
  }
  return context;
}
function stateReducer5(state, action) {
  return match(action.type, reducers5, state, action);
}
var DEFAULT_MENU_TAG = import_react73.Fragment;
function MenuFn(props, ref) {
  let { __demoMode = false, ...theirProps } = props;
  let reducerBag = (0, import_react73.useReducer)(stateReducer5, {
    __demoMode,
    menuState: __demoMode ? 0 /* Open */ : 1 /* Closed */,
    buttonElement: null,
    itemsElement: null,
    items: [],
    searchQuery: "",
    activeItemIndex: null,
    activationTrigger: 1 /* Other */
  });
  let [{ menuState, itemsElement, buttonElement }, dispatch] = reducerBag;
  let menuRef = useSyncRefs(ref);
  let outsideClickEnabled = menuState === 0 /* Open */;
  useOutsideClick(outsideClickEnabled, [buttonElement, itemsElement], (event, target) => {
    dispatch({ type: 1 /* CloseMenu */ });
    if (!isFocusableElement(target, 1 /* Loose */)) {
      event.preventDefault();
      buttonElement == null ? void 0 : buttonElement.focus();
    }
  });
  let close = useEvent(() => {
    dispatch({ type: 1 /* CloseMenu */ });
  });
  let slot = (0, import_react73.useMemo)(
    () => ({ open: menuState === 0 /* Open */, close }),
    [menuState, close]
  );
  let ourProps = { ref: menuRef };
  let render2 = useRender();
  return /* @__PURE__ */ import_react73.default.createElement(FloatingProvider, null, /* @__PURE__ */ import_react73.default.createElement(MenuContext.Provider, { value: reducerBag }, /* @__PURE__ */ import_react73.default.createElement(
    OpenClosedProvider,
    {
      value: match(menuState, {
        [0 /* Open */]: 1 /* Open */,
        [1 /* Closed */]: 2 /* Closed */
      })
    },
    render2({
      ourProps,
      theirProps,
      slot,
      defaultTag: DEFAULT_MENU_TAG,
      name: "Menu"
    })
  )));
}
var DEFAULT_BUTTON_TAG5 = "button";
function ButtonFn5(props, ref) {
  var _a3;
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-menu-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props;
  let [state, dispatch] = useMenuContext("Menu.Button");
  let getFloatingReferenceProps = useFloatingReferenceProps();
  let buttonRef = useSyncRefs(
    ref,
    useFloatingReference(),
    useEvent((element) => dispatch({ type: 7 /* SetButtonElement */, element }))
  );
  let handleKeyDown = useEvent((event) => {
    switch (event.key) {
      case " " /* Space */:
      case "Enter" /* Enter */:
      case "ArrowDown" /* ArrowDown */:
        event.preventDefault();
        event.stopPropagation();
        (0, import_react_dom8.flushSync)(() => dispatch({ type: 0 /* OpenMenu */ }));
        dispatch({ type: 2 /* GoToItem */, focus: 0 /* First */ });
        break;
      case "ArrowUp" /* ArrowUp */:
        event.preventDefault();
        event.stopPropagation();
        (0, import_react_dom8.flushSync)(() => dispatch({ type: 0 /* OpenMenu */ }));
        dispatch({ type: 2 /* GoToItem */, focus: 3 /* Last */ });
        break;
    }
  });
  let handleKeyUp = useEvent((event) => {
    switch (event.key) {
      case " " /* Space */:
        event.preventDefault();
        break;
    }
  });
  let handleClick = useEvent((event) => {
    var _a4;
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    if (disabled)
      return;
    if (state.menuState === 0 /* Open */) {
      (0, import_react_dom8.flushSync)(() => dispatch({ type: 1 /* CloseMenu */ }));
      (_a4 = state.buttonElement) == null ? void 0 : _a4.focus({ preventScroll: true });
    } else {
      event.preventDefault();
      dispatch({ type: 0 /* OpenMenu */ });
    }
  });
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let slot = (0, import_react73.useMemo)(() => {
    return {
      open: state.menuState === 0 /* Open */,
      active: active || state.menuState === 0 /* Open */,
      disabled,
      hover,
      focus,
      autofocus: autoFocus
    };
  }, [state, hover, focus, active, disabled, autoFocus]);
  let ourProps = mergeProps(
    getFloatingReferenceProps(),
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, state.buttonElement),
      "aria-haspopup": "menu",
      "aria-controls": (_a3 = state.itemsElement) == null ? void 0 : _a3.id,
      "aria-expanded": state.menuState === 0 /* Open */,
      disabled: disabled || void 0,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG5,
    name: "Menu.Button"
  });
}
var DEFAULT_ITEMS_TAG = "div";
var ItemsRenderFeatures = 1 /* RenderStrategy */ | 2 /* Static */;
function ItemsFn(props, ref) {
  var _a3, _b2;
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-menu-items-${internalId}`,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition: transition2 = false,
    ...theirProps
  } = props;
  let anchor = useResolvedAnchor(rawAnchor);
  let [state, dispatch] = useMenuContext("Menu.Items");
  let [floatingRef, style] = useFloatingPanel(anchor);
  let getFloatingPanelProps = useFloatingPanelProps();
  let [localItemsElement, setLocalItemsElement] = (0, import_react73.useState)(null);
  let itemsRef = useSyncRefs(
    ref,
    anchor ? floatingRef : null,
    useEvent((element) => dispatch({ type: 8 /* SetItemsElement */, element })),
    setLocalItemsElement
  );
  let portalOwnerDocument = useOwnerDocument(state.buttonElement);
  let ownerDocument = useOwnerDocument(state.itemsElement);
  if (anchor) {
    portal = true;
  }
  let usesOpenClosedState = useOpenClosed();
  let [visible, transitionData] = useTransition(
    transition2,
    localItemsElement,
    usesOpenClosedState !== null ? (usesOpenClosedState & 1 /* Open */) === 1 /* Open */ : state.menuState === 0 /* Open */
  );
  useOnDisappear(visible, state.buttonElement, () => {
    dispatch({ type: 1 /* CloseMenu */ });
  });
  let scrollLockEnabled = state.__demoMode ? false : modal && state.menuState === 0 /* Open */;
  useScrollLock(scrollLockEnabled, ownerDocument);
  let inertOthersEnabled = state.__demoMode ? false : modal && state.menuState === 0 /* Open */;
  useInertOthers(inertOthersEnabled, {
    allowed: (0, import_react73.useCallback)(
      () => [state.buttonElement, state.itemsElement],
      [state.buttonElement, state.itemsElement]
    )
  });
  let didButtonMoveEnabled = state.menuState !== 0 /* Open */;
  let didButtonMove = useDidElementMove(didButtonMoveEnabled, state.buttonElement);
  let panelEnabled = didButtonMove ? false : visible;
  (0, import_react73.useEffect)(() => {
    let container = state.itemsElement;
    if (!container)
      return;
    if (state.menuState !== 0 /* Open */)
      return;
    if (container === (ownerDocument == null ? void 0 : ownerDocument.activeElement))
      return;
    container.focus({ preventScroll: true });
  }, [state.menuState, state.itemsElement, ownerDocument]);
  useTreeWalker(state.menuState === 0 /* Open */, {
    container: state.itemsElement,
    accept(node) {
      if (node.getAttribute("role") === "menuitem")
        return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute("role"))
        return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk(node) {
      node.setAttribute("role", "none");
    }
  });
  let searchDisposables = useDisposables();
  let handleKeyDown = useEvent((event) => {
    var _a4, _b3, _c;
    searchDisposables.dispose();
    switch (event.key) {
      case " " /* Space */:
        if (state.searchQuery !== "") {
          event.preventDefault();
          event.stopPropagation();
          return dispatch({ type: 3 /* Search */, value: event.key });
        }
      case "Enter" /* Enter */:
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: 1 /* CloseMenu */ });
        if (state.activeItemIndex !== null) {
          let { dataRef } = state.items[state.activeItemIndex];
          (_b3 = (_a4 = dataRef.current) == null ? void 0 : _a4.domRef.current) == null ? void 0 : _b3.click();
        }
        restoreFocusIfNecessary(state.buttonElement);
        break;
      case "ArrowDown" /* ArrowDown */:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: 2 /* GoToItem */, focus: 2 /* Next */ });
      case "ArrowUp" /* ArrowUp */:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: 2 /* GoToItem */, focus: 1 /* Previous */ });
      case "Home" /* Home */:
      case "PageUp" /* PageUp */:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: 2 /* GoToItem */, focus: 0 /* First */ });
      case "End" /* End */:
      case "PageDown" /* PageDown */:
        event.preventDefault();
        event.stopPropagation();
        return dispatch({ type: 2 /* GoToItem */, focus: 3 /* Last */ });
      case "Escape" /* Escape */:
        event.preventDefault();
        event.stopPropagation();
        (0, import_react_dom8.flushSync)(() => dispatch({ type: 1 /* CloseMenu */ }));
        (_c = state.buttonElement) == null ? void 0 : _c.focus({ preventScroll: true });
        break;
      case "Tab" /* Tab */:
        event.preventDefault();
        event.stopPropagation();
        (0, import_react_dom8.flushSync)(() => dispatch({ type: 1 /* CloseMenu */ }));
        focusFrom(
          state.buttonElement,
          event.shiftKey ? 2 /* Previous */ : 4 /* Next */
        );
        break;
      default:
        if (event.key.length === 1) {
          dispatch({ type: 3 /* Search */, value: event.key });
          searchDisposables.setTimeout(() => dispatch({ type: 4 /* ClearSearch */ }), 350);
        }
        break;
    }
  });
  let handleKeyUp = useEvent((event) => {
    switch (event.key) {
      case " " /* Space */:
        event.preventDefault();
        break;
    }
  });
  let slot = (0, import_react73.useMemo)(() => {
    return {
      open: state.menuState === 0 /* Open */
    };
  }, [state.menuState]);
  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    "aria-activedescendant": state.activeItemIndex === null ? void 0 : (_a3 = state.items[state.activeItemIndex]) == null ? void 0 : _a3.id,
    "aria-labelledby": (_b2 = state.buttonElement) == null ? void 0 : _b2.id,
    id,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    role: "menu",
    // When the `Menu` is closed, it should not be focusable. This allows us
    // to skip focusing the `MenuItems` when pressing the tab key on an
    // open `Menu`, and go to the next focusable element.
    tabIndex: state.menuState === 0 /* Open */ ? 0 : void 0,
    ref: itemsRef,
    style: {
      ...theirProps.style,
      ...style,
      "--button-width": useElementSize(state.buttonElement, true).width
    },
    ...transitionDataAttributes(transitionData)
  });
  let render2 = useRender();
  return /* @__PURE__ */ import_react73.default.createElement(Portal, { enabled: portal ? props.static || visible : false, ownerDocument: portalOwnerDocument }, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_ITEMS_TAG,
    features: ItemsRenderFeatures,
    visible: panelEnabled,
    name: "Menu.Items"
  }));
}
var DEFAULT_ITEM_TAG = import_react73.Fragment;
function ItemFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let { id = `headlessui-menu-item-${internalId}`, disabled = false, ...theirProps } = props;
  let [state, dispatch] = useMenuContext("Menu.Item");
  let active = state.activeItemIndex !== null ? state.items[state.activeItemIndex].id === id : false;
  let internalItemRef = (0, import_react73.useRef)(null);
  let itemRef = useSyncRefs(ref, internalItemRef);
  useIsoMorphicEffect(() => {
    if (state.__demoMode)
      return;
    if (state.menuState !== 0 /* Open */)
      return;
    if (!active)
      return;
    if (state.activationTrigger === 0 /* Pointer */)
      return;
    return disposables().requestAnimationFrame(() => {
      var _a3, _b2;
      (_b2 = (_a3 = internalItemRef.current) == null ? void 0 : _a3.scrollIntoView) == null ? void 0 : _b2.call(_a3, { block: "nearest" });
    });
  }, [
    state.__demoMode,
    internalItemRef,
    active,
    state.menuState,
    state.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */
    state.activeItemIndex
  ]);
  let getTextValue2 = useTextValue(internalItemRef);
  let bag = (0, import_react73.useRef)({
    disabled,
    domRef: internalItemRef,
    get textValue() {
      return getTextValue2();
    }
  });
  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled;
  }, [bag, disabled]);
  useIsoMorphicEffect(() => {
    dispatch({ type: 5 /* RegisterItem */, id, dataRef: bag });
    return () => dispatch({ type: 6 /* UnregisterItem */, id });
  }, [bag, id]);
  let close = useEvent(() => {
    dispatch({ type: 1 /* CloseMenu */ });
  });
  let handleClick = useEvent((event) => {
    if (disabled)
      return event.preventDefault();
    dispatch({ type: 1 /* CloseMenu */ });
    restoreFocusIfNecessary(state.buttonElement);
  });
  let handleFocus = useEvent(() => {
    if (disabled)
      return dispatch({ type: 2 /* GoToItem */, focus: 5 /* Nothing */ });
    dispatch({ type: 2 /* GoToItem */, focus: 4 /* Specific */, id });
  });
  let pointer = useTrackedPointer();
  let handleEnter = useEvent((evt) => {
    pointer.update(evt);
    if (disabled)
      return;
    if (active)
      return;
    dispatch({
      type: 2 /* GoToItem */,
      focus: 4 /* Specific */,
      id,
      trigger: 0 /* Pointer */
    });
  });
  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt))
      return;
    if (disabled)
      return;
    if (active)
      return;
    dispatch({
      type: 2 /* GoToItem */,
      focus: 4 /* Specific */,
      id,
      trigger: 0 /* Pointer */
    });
  });
  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt))
      return;
    if (disabled)
      return;
    if (!active)
      return;
    dispatch({ type: 2 /* GoToItem */, focus: 5 /* Nothing */ });
  });
  let [labelledby, LabelProvider] = useLabels();
  let [describedby, DescriptionProvider] = useDescriptions();
  let slot = (0, import_react73.useMemo)(
    () => ({ active, focus: active, disabled, close }),
    [active, disabled, close]
  );
  let ourProps = {
    id,
    ref: itemRef,
    role: "menuitem",
    tabIndex: disabled === true ? void 0 : -1,
    "aria-disabled": disabled === true ? true : void 0,
    "aria-labelledby": labelledby,
    "aria-describedby": describedby,
    disabled: void 0,
    // Never forward the `disabled` prop
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave
  };
  let render2 = useRender();
  return /* @__PURE__ */ import_react73.default.createElement(LabelProvider, null, /* @__PURE__ */ import_react73.default.createElement(DescriptionProvider, null, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_ITEM_TAG,
    name: "Menu.Item"
  })));
}
var DEFAULT_SECTION_TAG = "div";
function SectionFn(props, ref) {
  let [labelledby, LabelProvider] = useLabels();
  let theirProps = props;
  let ourProps = { ref, "aria-labelledby": labelledby, role: "group" };
  let render2 = useRender();
  return /* @__PURE__ */ import_react73.default.createElement(LabelProvider, null, render2({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_SECTION_TAG,
    name: "Menu.Section"
  }));
}
var DEFAULT_HEADING_TAG = "header";
function HeadingFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let { id = `headlessui-menu-heading-${internalId}`, ...theirProps } = props;
  let context = useLabelContext();
  useIsoMorphicEffect(() => context.register(id), [id, context.register]);
  let ourProps = { id, ref, role: "presentation", ...context.props };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_HEADING_TAG,
    name: "Menu.Heading"
  });
}
var DEFAULT_SEPARATOR_TAG = "div";
function SeparatorFn(props, ref) {
  let theirProps = props;
  let ourProps = { ref, role: "separator" };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot: {},
    defaultTag: DEFAULT_SEPARATOR_TAG,
    name: "Menu.Separator"
  });
}
var MenuRoot = forwardRefWithAs(MenuFn);
var MenuButton = forwardRefWithAs(ButtonFn5);
var MenuItems = forwardRefWithAs(ItemsFn);
var MenuItem = forwardRefWithAs(ItemFn);
var MenuSection = forwardRefWithAs(SectionFn);
var MenuHeading = forwardRefWithAs(HeadingFn);
var MenuSeparator = forwardRefWithAs(SeparatorFn);
var Menu = Object.assign(MenuRoot, {
  /** @deprecated use `<MenuButton>` instead of `<Menu.Button>` */
  Button: MenuButton,
  /** @deprecated use `<MenuItems>` instead of `<Menu.Items>` */
  Items: MenuItems,
  /** @deprecated use `<MenuItem>` instead of `<Menu.Item>` */
  Item: MenuItem,
  /** @deprecated use `<MenuSection>` instead of `<Menu.Section>` */
  Section: MenuSection,
  /** @deprecated use `<MenuHeading>` instead of `<Menu.Heading>` */
  Heading: MenuHeading,
  /** @deprecated use `<MenuSeparator>` instead of `<Menu.Separator>` */
  Separator: MenuSeparator
});

// src/components/popover/popover.tsx
var import_react74 = __toESM(require("react"), 1);
var reducers6 = {
  [0 /* TogglePopover */]: (state) => {
    return {
      ...state,
      popoverState: match(state.popoverState, {
        [0 /* Open */]: 1 /* Closed */,
        [1 /* Closed */]: 0 /* Open */
      }),
      __demoMode: false
    };
  },
  [1 /* ClosePopover */](state) {
    if (state.popoverState === 1 /* Closed */)
      return state;
    return { ...state, popoverState: 1 /* Closed */, __demoMode: false };
  },
  [2 /* SetButton */](state, action) {
    if (state.button === action.button)
      return state;
    return { ...state, button: action.button };
  },
  [3 /* SetButtonId */](state, action) {
    if (state.buttonId === action.buttonId)
      return state;
    return { ...state, buttonId: action.buttonId };
  },
  [4 /* SetPanel */](state, action) {
    if (state.panel === action.panel)
      return state;
    return { ...state, panel: action.panel };
  },
  [5 /* SetPanelId */](state, action) {
    if (state.panelId === action.panelId)
      return state;
    return { ...state, panelId: action.panelId };
  }
};
var PopoverContext = (0, import_react74.createContext)(null);
PopoverContext.displayName = "PopoverContext";
function usePopoverContext(component) {
  let context = (0, import_react74.useContext)(PopoverContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Popover /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, usePopoverContext);
    throw err;
  }
  return context;
}
var PopoverAPIContext = (0, import_react74.createContext)(null);
PopoverAPIContext.displayName = "PopoverAPIContext";
function usePopoverAPIContext(component) {
  let context = (0, import_react74.useContext)(PopoverAPIContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Popover /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, usePopoverAPIContext);
    throw err;
  }
  return context;
}
var PopoverGroupContext = (0, import_react74.createContext)(null);
PopoverGroupContext.displayName = "PopoverGroupContext";
function usePopoverGroupContext() {
  return (0, import_react74.useContext)(PopoverGroupContext);
}
var PopoverPanelContext = (0, import_react74.createContext)(null);
PopoverPanelContext.displayName = "PopoverPanelContext";
function usePopoverPanelContext() {
  return (0, import_react74.useContext)(PopoverPanelContext);
}
function stateReducer6(state, action) {
  return match(action.type, reducers6, state, action);
}
var DEFAULT_POPOVER_TAG = "div";
function PopoverFn(props, ref) {
  var _a3;
  let { __demoMode = false, ...theirProps } = props;
  let internalPopoverRef = (0, import_react74.useRef)(null);
  let popoverRef = useSyncRefs(
    ref,
    optionalRef((ref2) => {
      internalPopoverRef.current = ref2;
    })
  );
  let buttons = (0, import_react74.useRef)([]);
  let reducerBag = (0, import_react74.useReducer)(stateReducer6, {
    __demoMode,
    popoverState: __demoMode ? 0 /* Open */ : 1 /* Closed */,
    buttons,
    button: null,
    buttonId: null,
    panel: null,
    panelId: null,
    beforePanelSentinel: (0, import_react74.createRef)(),
    afterPanelSentinel: (0, import_react74.createRef)(),
    afterButtonSentinel: (0, import_react74.createRef)()
  });
  let [
    {
      popoverState,
      button,
      buttonId,
      panel,
      panelId,
      beforePanelSentinel,
      afterPanelSentinel,
      afterButtonSentinel
    },
    dispatch
  ] = reducerBag;
  let ownerDocument = useOwnerDocument((_a3 = internalPopoverRef.current) != null ? _a3 : button);
  let isPortalled = (0, import_react74.useMemo)(() => {
    if (!button)
      return false;
    if (!panel)
      return false;
    for (let root2 of document.querySelectorAll("body > *")) {
      if (Number(root2 == null ? void 0 : root2.contains(button)) ^ Number(root2 == null ? void 0 : root2.contains(panel))) {
        return true;
      }
    }
    let elements = getFocusableElements();
    let buttonIdx = elements.indexOf(button);
    let beforeIdx = (buttonIdx + elements.length - 1) % elements.length;
    let afterIdx = (buttonIdx + 1) % elements.length;
    let beforeElement = elements[beforeIdx];
    let afterElement = elements[afterIdx];
    if (!panel.contains(beforeElement) && !panel.contains(afterElement)) {
      return true;
    }
    return false;
  }, [button, panel]);
  let buttonIdRef = useLatestValue(buttonId);
  let panelIdRef = useLatestValue(panelId);
  let registerBag = (0, import_react74.useMemo)(
    () => ({
      buttonId: buttonIdRef,
      panelId: panelIdRef,
      close: () => dispatch({ type: 1 /* ClosePopover */ })
    }),
    [buttonIdRef, panelIdRef, dispatch]
  );
  let groupContext = usePopoverGroupContext();
  let registerPopover = groupContext == null ? void 0 : groupContext.registerPopover;
  let isFocusWithinPopoverGroup = useEvent(() => {
    var _a4;
    return (_a4 = groupContext == null ? void 0 : groupContext.isFocusWithinPopoverGroup()) != null ? _a4 : (ownerDocument == null ? void 0 : ownerDocument.activeElement) && ((button == null ? void 0 : button.contains(ownerDocument.activeElement)) || (panel == null ? void 0 : panel.contains(ownerDocument.activeElement)));
  });
  (0, import_react74.useEffect)(() => registerPopover == null ? void 0 : registerPopover(registerBag), [registerPopover, registerBag]);
  let [portals, PortalWrapper] = useNestedPortals();
  let mainTreeNode = useMainTreeNode(button);
  let root = useRootContainers({
    mainTreeNode,
    portals,
    defaultContainers: [button, panel]
  });
  useEventListener(
    ownerDocument == null ? void 0 : ownerDocument.defaultView,
    "focus",
    (event) => {
      var _a4, _b2, _c, _d, _e, _f;
      if (event.target === window)
        return;
      if (!(event.target instanceof HTMLElement))
        return;
      if (popoverState !== 0 /* Open */)
        return;
      if (isFocusWithinPopoverGroup())
        return;
      if (!button)
        return;
      if (!panel)
        return;
      if (root.contains(event.target))
        return;
      if ((_b2 = (_a4 = beforePanelSentinel.current) == null ? void 0 : _a4.contains) == null ? void 0 : _b2.call(_a4, event.target))
        return;
      if ((_d = (_c = afterPanelSentinel.current) == null ? void 0 : _c.contains) == null ? void 0 : _d.call(_c, event.target))
        return;
      if ((_f = (_e = afterButtonSentinel.current) == null ? void 0 : _e.contains) == null ? void 0 : _f.call(_e, event.target))
        return;
      dispatch({ type: 1 /* ClosePopover */ });
    },
    true
  );
  let outsideClickEnabled = popoverState === 0 /* Open */;
  useOutsideClick(outsideClickEnabled, root.resolveContainers, (event, target) => {
    dispatch({ type: 1 /* ClosePopover */ });
    if (!isFocusableElement(target, 1 /* Loose */)) {
      event.preventDefault();
      button == null ? void 0 : button.focus();
    }
  });
  let close = useEvent(
    (focusableElement) => {
      dispatch({ type: 1 /* ClosePopover */ });
      let restoreElement = (() => {
        if (!focusableElement)
          return button;
        if (focusableElement instanceof HTMLElement)
          return focusableElement;
        if ("current" in focusableElement && focusableElement.current instanceof HTMLElement)
          return focusableElement.current;
        return button;
      })();
      restoreElement == null ? void 0 : restoreElement.focus();
    }
  );
  let api = (0, import_react74.useMemo)(
    () => ({ close, isPortalled }),
    [close, isPortalled]
  );
  let slot = (0, import_react74.useMemo)(
    () => ({ open: popoverState === 0 /* Open */, close }),
    [popoverState, close]
  );
  let ourProps = { ref: popoverRef };
  let render2 = useRender();
  return /* @__PURE__ */ import_react74.default.createElement(MainTreeProvider, { node: mainTreeNode }, /* @__PURE__ */ import_react74.default.createElement(FloatingProvider, null, /* @__PURE__ */ import_react74.default.createElement(PopoverPanelContext.Provider, { value: null }, /* @__PURE__ */ import_react74.default.createElement(PopoverContext.Provider, { value: reducerBag }, /* @__PURE__ */ import_react74.default.createElement(PopoverAPIContext.Provider, { value: api }, /* @__PURE__ */ import_react74.default.createElement(CloseProvider, { value: close }, /* @__PURE__ */ import_react74.default.createElement(
    OpenClosedProvider,
    {
      value: match(popoverState, {
        [0 /* Open */]: 1 /* Open */,
        [1 /* Closed */]: 2 /* Closed */
      })
    },
    /* @__PURE__ */ import_react74.default.createElement(PortalWrapper, null, render2({
      ourProps,
      theirProps,
      slot,
      defaultTag: DEFAULT_POPOVER_TAG,
      name: "Popover"
    }))
  )))))));
}
var DEFAULT_BUTTON_TAG6 = "button";
function ButtonFn6(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-popover-button-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props;
  let [state, dispatch] = usePopoverContext("Popover.Button");
  let { isPortalled } = usePopoverAPIContext("Popover.Button");
  let internalButtonRef = (0, import_react74.useRef)(null);
  let sentinelId = `headlessui-focus-sentinel-${(0, import_react19.useId)()}`;
  let groupContext = usePopoverGroupContext();
  let closeOthers = groupContext == null ? void 0 : groupContext.closeOthers;
  let panelContext = usePopoverPanelContext();
  let isWithinPanel = panelContext !== null;
  (0, import_react74.useEffect)(() => {
    if (isWithinPanel)
      return;
    dispatch({ type: 3 /* SetButtonId */, buttonId: id });
    return () => {
      dispatch({ type: 3 /* SetButtonId */, buttonId: null });
    };
  }, [isWithinPanel, id, dispatch]);
  let [uniqueIdentifier] = (0, import_react74.useState)(() => Symbol());
  let buttonRef = useSyncRefs(
    internalButtonRef,
    ref,
    useFloatingReference(),
    useEvent((button) => {
      if (isWithinPanel)
        return;
      if (button) {
        state.buttons.current.push(uniqueIdentifier);
      } else {
        let idx = state.buttons.current.indexOf(uniqueIdentifier);
        if (idx !== -1)
          state.buttons.current.splice(idx, 1);
      }
      if (state.buttons.current.length > 1) {
        console.warn(
          "You are already using a <Popover.Button /> but only 1 <Popover.Button /> is supported."
        );
      }
      button && dispatch({ type: 2 /* SetButton */, button });
    })
  );
  let withinPanelButtonRef = useSyncRefs(internalButtonRef, ref);
  let ownerDocument = useOwnerDocument(internalButtonRef);
  let handleKeyDown = useEvent((event) => {
    var _a3, _b2, _c;
    if (isWithinPanel) {
      if (state.popoverState === 1 /* Closed */)
        return;
      switch (event.key) {
        case " " /* Space */:
        case "Enter" /* Enter */:
          event.preventDefault();
          (_b2 = (_a3 = event.target).click) == null ? void 0 : _b2.call(_a3);
          dispatch({ type: 1 /* ClosePopover */ });
          (_c = state.button) == null ? void 0 : _c.focus();
          break;
      }
    } else {
      switch (event.key) {
        case " " /* Space */:
        case "Enter" /* Enter */:
          event.preventDefault();
          event.stopPropagation();
          if (state.popoverState === 1 /* Closed */)
            closeOthers == null ? void 0 : closeOthers(state.buttonId);
          dispatch({ type: 0 /* TogglePopover */ });
          break;
        case "Escape" /* Escape */:
          if (state.popoverState !== 0 /* Open */)
            return closeOthers == null ? void 0 : closeOthers(state.buttonId);
          if (!internalButtonRef.current)
            return;
          if ((ownerDocument == null ? void 0 : ownerDocument.activeElement) && !internalButtonRef.current.contains(ownerDocument.activeElement)) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          dispatch({ type: 1 /* ClosePopover */ });
          break;
      }
    }
  });
  let handleKeyUp = useEvent((event) => {
    if (isWithinPanel)
      return;
    if (event.key === " " /* Space */) {
      event.preventDefault();
    }
  });
  let handleClick = useEvent((event) => {
    var _a3, _b2;
    if (isDisabledReactIssue7711(event.currentTarget))
      return;
    if (disabled)
      return;
    if (isWithinPanel) {
      dispatch({ type: 1 /* ClosePopover */ });
      (_a3 = state.button) == null ? void 0 : _a3.focus();
    } else {
      event.preventDefault();
      event.stopPropagation();
      if (state.popoverState === 1 /* Closed */)
        closeOthers == null ? void 0 : closeOthers(state.buttonId);
      dispatch({ type: 0 /* TogglePopover */ });
      (_b2 = state.button) == null ? void 0 : _b2.focus();
    }
  });
  let handleMouseDown = useEvent((event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let visible = state.popoverState === 0 /* Open */;
  let slot = (0, import_react74.useMemo)(() => {
    return {
      open: visible,
      active: active || visible,
      disabled,
      hover,
      focus,
      autofocus: autoFocus
    };
  }, [visible, hover, focus, active, disabled, autoFocus]);
  let type = useResolveButtonType(props, state.button);
  let ourProps = isWithinPanel ? mergeProps(
    {
      ref: withinPanelButtonRef,
      type,
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      disabled: disabled || void 0,
      autoFocus
    },
    focusProps,
    hoverProps,
    pressProps
  ) : mergeProps(
    {
      ref: buttonRef,
      id: state.buttonId,
      type,
      "aria-expanded": state.popoverState === 0 /* Open */,
      "aria-controls": state.panel ? state.panelId : void 0,
      disabled: disabled || void 0,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick,
      onMouseDown: handleMouseDown
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let direction = useTabDirection();
  let handleFocus = useEvent(() => {
    let el = state.panel;
    if (!el)
      return;
    function run() {
      let result = match(direction.current, {
        [0 /* Forwards */]: () => focusIn(el, 1 /* First */),
        [1 /* Backwards */]: () => focusIn(el, 8 /* Last */)
      });
      if (result === 0 /* Error */) {
        focusIn(
          getFocusableElements().filter((el2) => el2.dataset.headlessuiFocusGuard !== "true"),
          match(direction.current, {
            [0 /* Forwards */]: 4 /* Next */,
            [1 /* Backwards */]: 2 /* Previous */
          }),
          { relativeTo: state.button }
        );
      }
    }
    if (false) {
      microTask(run);
    } else {
      run();
    }
  });
  let render2 = useRender();
  return /* @__PURE__ */ import_react74.default.createElement(import_react74.default.Fragment, null, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG6,
    name: "Popover.Button"
  }), visible && !isWithinPanel && isPortalled && /* @__PURE__ */ import_react74.default.createElement(
    Hidden,
    {
      id: sentinelId,
      ref: state.afterButtonSentinel,
      features: 2 /* Focusable */,
      "data-headlessui-focus-guard": true,
      as: "button",
      type: "button",
      onFocus: handleFocus
    }
  ));
}
var DEFAULT_BACKDROP_TAG2 = "div";
var BackdropRenderFeatures = 1 /* RenderStrategy */ | 2 /* Static */;
function BackdropFn2(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-popover-backdrop-${internalId}`,
    transition: transition2 = false,
    ...theirProps
  } = props;
  let [{ popoverState }, dispatch] = usePopoverContext("Popover.Backdrop");
  let [localBackdropElement, setLocalBackdropElement] = (0, import_react74.useState)(null);
  let backdropRef = useSyncRefs(ref, setLocalBackdropElement);
  let usesOpenClosedState = useOpenClosed();
  let [visible, transitionData] = useTransition(
    transition2,
    localBackdropElement,
    usesOpenClosedState !== null ? (usesOpenClosedState & 1 /* Open */) === 1 /* Open */ : popoverState === 0 /* Open */
  );
  let handleClick = useEvent((event) => {
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    dispatch({ type: 1 /* ClosePopover */ });
  });
  let slot = (0, import_react74.useMemo)(() => {
    return {
      open: popoverState === 0 /* Open */
    };
  }, [popoverState]);
  let ourProps = {
    ref: backdropRef,
    id,
    "aria-hidden": true,
    onClick: handleClick,
    ...transitionDataAttributes(transitionData)
  };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BACKDROP_TAG2,
    features: BackdropRenderFeatures,
    visible,
    name: "Popover.Backdrop"
  });
}
var DEFAULT_PANEL_TAG3 = "div";
var PanelRenderFeatures2 = 1 /* RenderStrategy */ | 2 /* Static */;
function PanelFn3(props, ref) {
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-popover-panel-${internalId}`,
    focus = false,
    anchor: rawAnchor,
    portal = false,
    modal = false,
    transition: transition2 = false,
    ...theirProps
  } = props;
  let [state, dispatch] = usePopoverContext("Popover.Panel");
  let { close, isPortalled } = usePopoverAPIContext("Popover.Panel");
  let beforePanelSentinelId = `headlessui-focus-sentinel-before-${internalId}`;
  let afterPanelSentinelId = `headlessui-focus-sentinel-after-${internalId}`;
  let internalPanelRef = (0, import_react74.useRef)(null);
  let anchor = useResolvedAnchor(rawAnchor);
  let [floatingRef, style] = useFloatingPanel(anchor);
  let getFloatingPanelProps = useFloatingPanelProps();
  if (anchor) {
    portal = true;
  }
  let [localPanelElement, setLocalPanelElement] = (0, import_react74.useState)(null);
  let panelRef = useSyncRefs(
    internalPanelRef,
    ref,
    anchor ? floatingRef : null,
    useEvent((panel) => dispatch({ type: 4 /* SetPanel */, panel })),
    setLocalPanelElement
  );
  let portalOwnerDocument = useOwnerDocument(state.button);
  let ownerDocument = useOwnerDocument(internalPanelRef);
  useIsoMorphicEffect(() => {
    dispatch({ type: 5 /* SetPanelId */, panelId: id });
    return () => {
      dispatch({ type: 5 /* SetPanelId */, panelId: null });
    };
  }, [id, dispatch]);
  let usesOpenClosedState = useOpenClosed();
  let [visible, transitionData] = useTransition(
    transition2,
    localPanelElement,
    usesOpenClosedState !== null ? (usesOpenClosedState & 1 /* Open */) === 1 /* Open */ : state.popoverState === 0 /* Open */
  );
  useOnDisappear(visible, state.button, () => {
    dispatch({ type: 1 /* ClosePopover */ });
  });
  let scrollLockEnabled = state.__demoMode ? false : modal && visible;
  useScrollLock(scrollLockEnabled, ownerDocument);
  let handleKeyDown = useEvent((event) => {
    var _a3;
    switch (event.key) {
      case "Escape" /* Escape */:
        if (state.popoverState !== 0 /* Open */)
          return;
        if (!internalPanelRef.current)
          return;
        if ((ownerDocument == null ? void 0 : ownerDocument.activeElement) && !internalPanelRef.current.contains(ownerDocument.activeElement)) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: 1 /* ClosePopover */ });
        (_a3 = state.button) == null ? void 0 : _a3.focus();
        break;
    }
  });
  (0, import_react74.useEffect)(() => {
    var _a3;
    if (props.static)
      return;
    if (state.popoverState === 1 /* Closed */ && ((_a3 = props.unmount) != null ? _a3 : true)) {
      dispatch({ type: 4 /* SetPanel */, panel: null });
    }
  }, [state.popoverState, props.unmount, props.static, dispatch]);
  (0, import_react74.useEffect)(() => {
    if (state.__demoMode)
      return;
    if (!focus)
      return;
    if (state.popoverState !== 0 /* Open */)
      return;
    if (!internalPanelRef.current)
      return;
    let activeElement2 = ownerDocument == null ? void 0 : ownerDocument.activeElement;
    if (internalPanelRef.current.contains(activeElement2))
      return;
    focusIn(internalPanelRef.current, 1 /* First */);
  }, [state.__demoMode, focus, internalPanelRef.current, state.popoverState]);
  let slot = (0, import_react74.useMemo)(() => {
    return {
      open: state.popoverState === 0 /* Open */,
      close
    };
  }, [state.popoverState, close]);
  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    ref: panelRef,
    id,
    onKeyDown: handleKeyDown,
    onBlur: focus && state.popoverState === 0 /* Open */ ? (event) => {
      var _a3, _b2, _c, _d, _e;
      let el = event.relatedTarget;
      if (!el)
        return;
      if (!internalPanelRef.current)
        return;
      if ((_a3 = internalPanelRef.current) == null ? void 0 : _a3.contains(el))
        return;
      dispatch({ type: 1 /* ClosePopover */ });
      if (((_c = (_b2 = state.beforePanelSentinel.current) == null ? void 0 : _b2.contains) == null ? void 0 : _c.call(_b2, el)) || ((_e = (_d = state.afterPanelSentinel.current) == null ? void 0 : _d.contains) == null ? void 0 : _e.call(_d, el))) {
        el.focus({ preventScroll: true });
      }
    } : void 0,
    tabIndex: -1,
    style: {
      ...theirProps.style,
      ...style,
      "--button-width": useElementSize(state.button, true).width
    },
    ...transitionDataAttributes(transitionData)
  });
  let direction = useTabDirection();
  let handleBeforeFocus = useEvent(() => {
    let el = internalPanelRef.current;
    if (!el)
      return;
    function run() {
      match(direction.current, {
        [0 /* Forwards */]: () => {
          var _a3;
          let result = focusIn(el, 1 /* First */);
          if (result === 0 /* Error */) {
            (_a3 = state.afterPanelSentinel.current) == null ? void 0 : _a3.focus();
          }
        },
        [1 /* Backwards */]: () => {
          var _a3;
          (_a3 = state.button) == null ? void 0 : _a3.focus({ preventScroll: true });
        }
      });
    }
    if (false) {
      microTask(run);
    } else {
      run();
    }
  });
  let handleAfterFocus = useEvent(() => {
    let el = internalPanelRef.current;
    if (!el)
      return;
    function run() {
      match(direction.current, {
        [0 /* Forwards */]: () => {
          if (!state.button)
            return;
          let elements = getFocusableElements();
          let idx = elements.indexOf(state.button);
          let before = elements.slice(0, idx + 1);
          let after = elements.slice(idx + 1);
          let combined = [...after, ...before];
          for (let element of combined.slice()) {
            if (element.dataset.headlessuiFocusGuard === "true" || (localPanelElement == null ? void 0 : localPanelElement.contains(element))) {
              let idx2 = combined.indexOf(element);
              if (idx2 !== -1)
                combined.splice(idx2, 1);
            }
          }
          focusIn(combined, 1 /* First */, { sorted: false });
        },
        [1 /* Backwards */]: () => {
          var _a3;
          let result = focusIn(el, 2 /* Previous */);
          if (result === 0 /* Error */) {
            (_a3 = state.button) == null ? void 0 : _a3.focus();
          }
        }
      });
    }
    if (false) {
      microTask(run);
    } else {
      run();
    }
  });
  let render2 = useRender();
  return /* @__PURE__ */ import_react74.default.createElement(ResetOpenClosedProvider, null, /* @__PURE__ */ import_react74.default.createElement(PopoverPanelContext.Provider, { value: id }, /* @__PURE__ */ import_react74.default.createElement(PopoverAPIContext.Provider, { value: { close, isPortalled } }, /* @__PURE__ */ import_react74.default.createElement(
    Portal,
    {
      enabled: portal ? props.static || visible : false,
      ownerDocument: portalOwnerDocument
    },
    visible && isPortalled && /* @__PURE__ */ import_react74.default.createElement(
      Hidden,
      {
        id: beforePanelSentinelId,
        ref: state.beforePanelSentinel,
        features: 2 /* Focusable */,
        "data-headlessui-focus-guard": true,
        as: "button",
        type: "button",
        onFocus: handleBeforeFocus
      }
    ),
    render2({
      ourProps,
      theirProps,
      slot,
      defaultTag: DEFAULT_PANEL_TAG3,
      features: PanelRenderFeatures2,
      visible,
      name: "Popover.Panel"
    }),
    visible && isPortalled && /* @__PURE__ */ import_react74.default.createElement(
      Hidden,
      {
        id: afterPanelSentinelId,
        ref: state.afterPanelSentinel,
        features: 2 /* Focusable */,
        "data-headlessui-focus-guard": true,
        as: "button",
        type: "button",
        onFocus: handleAfterFocus
      }
    )
  ))));
}
var DEFAULT_GROUP_TAG2 = "div";
function GroupFn2(props, ref) {
  let internalGroupRef = (0, import_react74.useRef)(null);
  let groupRef = useSyncRefs(internalGroupRef, ref);
  let [popovers, setPopovers] = (0, import_react74.useState)([]);
  let unregisterPopover = useEvent((registerBag) => {
    setPopovers((existing) => {
      let idx = existing.indexOf(registerBag);
      if (idx !== -1) {
        let clone = existing.slice();
        clone.splice(idx, 1);
        return clone;
      }
      return existing;
    });
  });
  let registerPopover = useEvent((registerBag) => {
    setPopovers((existing) => [...existing, registerBag]);
    return () => unregisterPopover(registerBag);
  });
  let isFocusWithinPopoverGroup = useEvent(() => {
    var _a3;
    let ownerDocument = getOwnerDocument(internalGroupRef);
    if (!ownerDocument)
      return false;
    let element = ownerDocument.activeElement;
    if ((_a3 = internalGroupRef.current) == null ? void 0 : _a3.contains(element))
      return true;
    return popovers.some((bag) => {
      var _a4, _b2;
      return ((_a4 = ownerDocument.getElementById(bag.buttonId.current)) == null ? void 0 : _a4.contains(element)) || ((_b2 = ownerDocument.getElementById(bag.panelId.current)) == null ? void 0 : _b2.contains(element));
    });
  });
  let closeOthers = useEvent((buttonId) => {
    for (let popover of popovers) {
      if (popover.buttonId.current !== buttonId)
        popover.close();
    }
  });
  let contextBag = (0, import_react74.useMemo)(
    () => ({
      registerPopover,
      unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers
    }),
    [registerPopover, unregisterPopover, isFocusWithinPopoverGroup, closeOthers]
  );
  let slot = (0, import_react74.useMemo)(() => ({}), []);
  let theirProps = props;
  let ourProps = { ref: groupRef };
  let render2 = useRender();
  return /* @__PURE__ */ import_react74.default.createElement(MainTreeProvider, null, /* @__PURE__ */ import_react74.default.createElement(PopoverGroupContext.Provider, { value: contextBag }, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_GROUP_TAG2,
    name: "Popover.Group"
  })));
}
var PopoverRoot = forwardRefWithAs(PopoverFn);
var PopoverButton = forwardRefWithAs(ButtonFn6);
var PopoverOverlay = forwardRefWithAs(BackdropFn2);
var PopoverBackdrop = forwardRefWithAs(BackdropFn2);
var PopoverPanel = forwardRefWithAs(PanelFn3);
var PopoverGroup = forwardRefWithAs(GroupFn2);
var Popover = Object.assign(PopoverRoot, {
  /** @deprecated use `<PopoverButton>` instead of `<Popover.Button>` */
  Button: PopoverButton,
  /** @deprecated use `<PopoverBackdrop>` instead of `<Popover.Backdrop>` */
  Backdrop: PopoverBackdrop,
  /** @deprecated use `<PopoverOverlay>` instead of `<Popover.Overlay>` */
  Overlay: PopoverOverlay,
  /** @deprecated use `<PopoverPanel>` instead of `<Popover.Panel>` */
  Panel: PopoverPanel,
  /** @deprecated use `<PopoverGroup>` instead of `<Popover.Group>` */
  Group: PopoverGroup
});

// src/components/radio-group/radio-group.tsx
var import_react75 = __toESM(require("react"), 1);
var reducers7 = {
  [0 /* RegisterOption */](state, action) {
    let nextOptions = [
      ...state.options,
      { id: action.id, element: action.element, propsRef: action.propsRef }
    ];
    return {
      ...state,
      options: sortByDomNode(nextOptions, (option) => option.element.current)
    };
  },
  [1 /* UnregisterOption */](state, action) {
    let options = state.options.slice();
    let idx = state.options.findIndex((radio) => radio.id === action.id);
    if (idx === -1)
      return state;
    options.splice(idx, 1);
    return { ...state, options };
  }
};
var RadioGroupDataContext = (0, import_react75.createContext)(null);
RadioGroupDataContext.displayName = "RadioGroupDataContext";
function useData3(component) {
  let context = (0, import_react75.useContext)(RadioGroupDataContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useData3);
    throw err;
  }
  return context;
}
var RadioGroupActionsContext = (0, import_react75.createContext)(null);
RadioGroupActionsContext.displayName = "RadioGroupActionsContext";
function useActions3(component) {
  let context = (0, import_react75.useContext)(RadioGroupActionsContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useActions3);
    throw err;
  }
  return context;
}
function stateReducer7(state, action) {
  return match(action.type, reducers7, state, action);
}
var DEFAULT_RADIO_GROUP_TAG = "div";
function RadioGroupFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let providedDisabled = useDisabled();
  let {
    id = `headlessui-radiogroup-${internalId}`,
    value: controlledValue,
    form,
    name,
    onChange: controlledOnChange,
    by,
    disabled = providedDisabled || false,
    defaultValue: _defaultValue,
    ...theirProps
  } = props;
  let compare = useByComparator(by);
  let [state, dispatch] = (0, import_react75.useReducer)(stateReducer7, { options: [] });
  let options = state.options;
  let [labelledby, LabelProvider] = useLabels();
  let [describedby, DescriptionProvider] = useDescriptions();
  let internalRadioGroupRef = (0, import_react75.useRef)(null);
  let radioGroupRef = useSyncRefs(internalRadioGroupRef, ref);
  let defaultValue = useDefaultValue(_defaultValue);
  let [value, onChange] = useControllable(controlledValue, controlledOnChange, defaultValue);
  let firstOption = (0, import_react75.useMemo)(
    () => options.find((option) => {
      if (option.propsRef.current.disabled)
        return false;
      return true;
    }),
    [options]
  );
  let containsCheckedOption = (0, import_react75.useMemo)(
    () => options.some((option) => compare(option.propsRef.current.value, value)),
    [options, value]
  );
  let triggerChange = useEvent((nextValue) => {
    var _a3;
    if (disabled)
      return false;
    if (compare(nextValue, value))
      return false;
    let nextOption = (_a3 = options.find(
      (option) => compare(option.propsRef.current.value, nextValue)
    )) == null ? void 0 : _a3.propsRef.current;
    if (nextOption == null ? void 0 : nextOption.disabled)
      return false;
    onChange == null ? void 0 : onChange(nextValue);
    return true;
  });
  let handleKeyDown = useEvent((event) => {
    let container = internalRadioGroupRef.current;
    if (!container)
      return;
    let ownerDocument = getOwnerDocument(container);
    let all = options.filter((option) => option.propsRef.current.disabled === false).map((radio) => radio.element.current);
    switch (event.key) {
      case "Enter" /* Enter */:
        attemptSubmit(event.currentTarget);
        break;
      case "ArrowLeft" /* ArrowLeft */:
      case "ArrowUp" /* ArrowUp */:
        {
          event.preventDefault();
          event.stopPropagation();
          let result = focusIn(all, 2 /* Previous */ | 16 /* WrapAround */);
          if (result === 2 /* Success */) {
            let activeOption = options.find(
              (option) => option.element.current === (ownerDocument == null ? void 0 : ownerDocument.activeElement)
            );
            if (activeOption)
              triggerChange(activeOption.propsRef.current.value);
          }
        }
        break;
      case "ArrowRight" /* ArrowRight */:
      case "ArrowDown" /* ArrowDown */:
        {
          event.preventDefault();
          event.stopPropagation();
          let result = focusIn(all, 4 /* Next */ | 16 /* WrapAround */);
          if (result === 2 /* Success */) {
            let activeOption = options.find(
              (option) => option.element.current === (ownerDocument == null ? void 0 : ownerDocument.activeElement)
            );
            if (activeOption)
              triggerChange(activeOption.propsRef.current.value);
          }
        }
        break;
      case " " /* Space */:
        {
          event.preventDefault();
          event.stopPropagation();
          let activeOption = options.find(
            (option) => option.element.current === (ownerDocument == null ? void 0 : ownerDocument.activeElement)
          );
          if (activeOption)
            triggerChange(activeOption.propsRef.current.value);
        }
        break;
    }
  });
  let registerOption = useEvent((option) => {
    dispatch({ type: 0 /* RegisterOption */, ...option });
    return () => dispatch({ type: 1 /* UnregisterOption */, id: option.id });
  });
  let radioGroupData = (0, import_react75.useMemo)(
    () => ({ value, firstOption, containsCheckedOption, disabled, compare, ...state }),
    [value, firstOption, containsCheckedOption, disabled, compare, state]
  );
  let radioGroupActions = (0, import_react75.useMemo)(
    () => ({ registerOption, change: triggerChange }),
    [registerOption, triggerChange]
  );
  let ourProps = {
    ref: radioGroupRef,
    id,
    role: "radiogroup",
    "aria-labelledby": labelledby,
    "aria-describedby": describedby,
    onKeyDown: handleKeyDown
  };
  let slot = (0, import_react75.useMemo)(() => ({ value }), [value]);
  let reset = (0, import_react75.useCallback)(() => {
    if (defaultValue === void 0)
      return;
    return triggerChange(defaultValue);
  }, [triggerChange, defaultValue]);
  let render2 = useRender();
  return /* @__PURE__ */ import_react75.default.createElement(DescriptionProvider, { name: "RadioGroup.Description" }, /* @__PURE__ */ import_react75.default.createElement(LabelProvider, { name: "RadioGroup.Label" }, /* @__PURE__ */ import_react75.default.createElement(RadioGroupActionsContext.Provider, { value: radioGroupActions }, /* @__PURE__ */ import_react75.default.createElement(RadioGroupDataContext.Provider, { value: radioGroupData }, name != null && /* @__PURE__ */ import_react75.default.createElement(
    FormFields,
    {
      disabled,
      data: { [name]: value || "on" },
      overrides: { type: "radio", checked: value != null },
      form,
      onReset: reset
    }
  ), render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_RADIO_GROUP_TAG,
    name: "RadioGroup"
  })))));
}
var DEFAULT_OPTION_TAG3 = "div";
function OptionFn3(props, ref) {
  var _a3;
  let data = useData3("RadioGroup.Option");
  let actions = useActions3("RadioGroup.Option");
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-radiogroup-option-${internalId}`,
    value,
    disabled = data.disabled || false,
    autoFocus = false,
    ...theirProps
  } = props;
  let internalOptionRef = (0, import_react75.useRef)(null);
  let optionRef = useSyncRefs(internalOptionRef, ref);
  let [labelledby, LabelProvider] = useLabels();
  let [describedby, DescriptionProvider] = useDescriptions();
  let propsRef = useLatestValue({ value, disabled });
  useIsoMorphicEffect(
    () => actions.registerOption({ id, element: internalOptionRef, propsRef }),
    [id, actions, internalOptionRef, propsRef]
  );
  let handleClick = useEvent((event) => {
    var _a4;
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    if (!actions.change(value))
      return;
    (_a4 = internalOptionRef.current) == null ? void 0 : _a4.focus();
  });
  let isFirstOption = ((_a3 = data.firstOption) == null ? void 0 : _a3.id) === id;
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let checked = data.compare(data.value, value);
  let ourProps = mergeProps(
    {
      ref: optionRef,
      id,
      role: "radio",
      "aria-checked": checked ? "true" : "false",
      "aria-labelledby": labelledby,
      "aria-describedby": describedby,
      "aria-disabled": disabled ? true : void 0,
      tabIndex: (() => {
        if (disabled)
          return -1;
        if (checked)
          return 0;
        if (!data.containsCheckedOption && isFirstOption)
          return 0;
        return -1;
      })(),
      onClick: disabled ? void 0 : handleClick,
      autoFocus
    },
    focusProps,
    hoverProps
  );
  let slot = (0, import_react75.useMemo)(() => {
    return {
      checked,
      disabled,
      active: focus,
      hover,
      focus,
      autofocus: autoFocus
    };
  }, [checked, disabled, hover, focus, autoFocus]);
  let render2 = useRender();
  return /* @__PURE__ */ import_react75.default.createElement(DescriptionProvider, { name: "RadioGroup.Description" }, /* @__PURE__ */ import_react75.default.createElement(LabelProvider, { name: "RadioGroup.Label" }, render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG3,
    name: "RadioGroup.Option"
  })));
}
var DEFAULT_RADIO_TAG = "span";
function RadioFn(props, ref) {
  var _a3;
  let data = useData3("Radio");
  let actions = useActions3("Radio");
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = providedId || `headlessui-radio-${internalId}`,
    value,
    disabled = data.disabled || providedDisabled || false,
    autoFocus = false,
    ...theirProps
  } = props;
  let internalRadioRef = (0, import_react75.useRef)(null);
  let radioRef = useSyncRefs(internalRadioRef, ref);
  let labelledby = useLabelledBy();
  let describedby = useDescribedBy();
  let propsRef = useLatestValue({ value, disabled });
  useIsoMorphicEffect(
    () => actions.registerOption({ id, element: internalRadioRef, propsRef }),
    [id, actions, internalRadioRef, propsRef]
  );
  let handleClick = useEvent((event) => {
    var _a4;
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    if (!actions.change(value))
      return;
    (_a4 = internalRadioRef.current) == null ? void 0 : _a4.focus();
  });
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let isFirstOption = ((_a3 = data.firstOption) == null ? void 0 : _a3.id) === id;
  let checked = data.compare(data.value, value);
  let ourProps = mergeProps(
    {
      ref: radioRef,
      id,
      role: "radio",
      "aria-checked": checked ? "true" : "false",
      "aria-labelledby": labelledby,
      "aria-describedby": describedby,
      "aria-disabled": disabled ? true : void 0,
      tabIndex: (() => {
        if (disabled)
          return -1;
        if (checked)
          return 0;
        if (!data.containsCheckedOption && isFirstOption)
          return 0;
        return -1;
      })(),
      autoFocus,
      onClick: disabled ? void 0 : handleClick
    },
    focusProps,
    hoverProps
  );
  let slot = (0, import_react75.useMemo)(() => {
    return { checked, disabled, hover, focus, autofocus: autoFocus };
  }, [checked, disabled, hover, focus, autoFocus]);
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_RADIO_TAG,
    name: "Radio"
  });
}
var RadioGroupRoot = forwardRefWithAs(RadioGroupFn);
var RadioGroupOption = forwardRefWithAs(OptionFn3);
var Radio = forwardRefWithAs(RadioFn);
var RadioGroupLabel = Label;
var RadioGroupDescription = Description;
var RadioGroup = Object.assign(RadioGroupRoot, {
  /** @deprecated use `<Radio>` instead of `<RadioGroup.Option>` */
  Option: RadioGroupOption,
  /** @deprecated use `<Radio>` instead of `<RadioGroup.Radio>` */
  Radio,
  /** @deprecated use `<Label>` instead of `<RadioGroup.Label>` */
  Label: RadioGroupLabel,
  /** @deprecated use `<Description>` instead of `<RadioGroup.Description>` */
  Description: RadioGroupDescription
});

// src/components/select/select.tsx
var import_react76 = require("react");
var DEFAULT_SELECT_TAG = "select";
function SelectFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = providedId || `headlessui-select-${internalId}`,
    disabled = providedDisabled || false,
    invalid = false,
    autoFocus = false,
    ...theirProps
  } = props;
  let labelledBy = useLabelledBy();
  let describedBy = useDescribedBy();
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let ourProps = mergeProps(
    {
      ref,
      id,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-invalid": invalid ? "" : void 0,
      disabled: disabled || void 0,
      autoFocus
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let slot = (0, import_react76.useMemo)(() => {
    return {
      disabled,
      invalid,
      hover,
      focus,
      active,
      autofocus: autoFocus
    };
  }, [disabled, invalid, hover, focus, active, autoFocus]);
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_SELECT_TAG,
    name: "Select"
  });
}
var Select = forwardRefWithAs(SelectFn);

// src/components/switch/switch.tsx
var import_react77 = __toESM(require("react"), 1);
var GroupContext = (0, import_react77.createContext)(null);
GroupContext.displayName = "GroupContext";
var DEFAULT_GROUP_TAG3 = import_react77.Fragment;
function GroupFn3(props) {
  var _a3;
  let [switchElement, setSwitchElement] = (0, import_react77.useState)(null);
  let [labelledby, LabelProvider] = useLabels();
  let [describedby, DescriptionProvider] = useDescriptions();
  let context = (0, import_react77.useMemo)(
    () => ({ switch: switchElement, setSwitch: setSwitchElement }),
    [switchElement, setSwitchElement]
  );
  let ourProps = {};
  let theirProps = props;
  let render2 = useRender();
  return /* @__PURE__ */ import_react77.default.createElement(DescriptionProvider, { name: "Switch.Description", value: describedby }, /* @__PURE__ */ import_react77.default.createElement(
    LabelProvider,
    {
      name: "Switch.Label",
      value: labelledby,
      props: {
        htmlFor: (_a3 = context.switch) == null ? void 0 : _a3.id,
        onClick(event) {
          if (!switchElement)
            return;
          if (event.currentTarget instanceof HTMLLabelElement) {
            event.preventDefault();
          }
          switchElement.click();
          switchElement.focus({ preventScroll: true });
        }
      }
    },
    /* @__PURE__ */ import_react77.default.createElement(GroupContext.Provider, { value: context }, render2({
      ourProps,
      theirProps,
      slot: {},
      defaultTag: DEFAULT_GROUP_TAG3,
      name: "Switch.Group"
    }))
  ));
}
var DEFAULT_SWITCH_TAG = "button";
function SwitchFn(props, ref) {
  var _a3;
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = providedId || `headlessui-switch-${internalId}`,
    disabled = providedDisabled || false,
    checked: controlledChecked,
    defaultChecked: _defaultChecked,
    onChange: controlledOnChange,
    name,
    value,
    form,
    autoFocus = false,
    ...theirProps
  } = props;
  let groupContext = (0, import_react77.useContext)(GroupContext);
  let [switchElement, setSwitchElement] = (0, import_react77.useState)(null);
  let internalSwitchRef = (0, import_react77.useRef)(null);
  let switchRef = useSyncRefs(
    internalSwitchRef,
    ref,
    groupContext === null ? null : groupContext.setSwitch,
    setSwitchElement
  );
  let defaultChecked = useDefaultValue(_defaultChecked);
  let [checked, onChange] = useControllable(
    controlledChecked,
    controlledOnChange,
    defaultChecked != null ? defaultChecked : false
  );
  let d = useDisposables();
  let [changing, setChanging] = (0, import_react77.useState)(false);
  let toggle = useEvent(() => {
    setChanging(true);
    onChange == null ? void 0 : onChange(!checked);
    d.nextFrame(() => {
      setChanging(false);
    });
  });
  let handleClick = useEvent((event) => {
    if (isDisabledReactIssue7711(event.currentTarget))
      return event.preventDefault();
    event.preventDefault();
    toggle();
  });
  let handleKeyUp = useEvent((event) => {
    if (event.key === " " /* Space */) {
      event.preventDefault();
      toggle();
    } else if (event.key === "Enter" /* Enter */) {
      attemptSubmit(event.currentTarget);
    }
  });
  let handleKeyPress = useEvent((event) => event.preventDefault());
  let labelledBy = useLabelledBy();
  let describedBy = useDescribedBy();
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let slot = (0, import_react77.useMemo)(() => {
    return {
      checked,
      disabled,
      hover,
      focus,
      active,
      autofocus: autoFocus,
      changing
    };
  }, [checked, hover, focus, active, disabled, changing, autoFocus]);
  let ourProps = mergeProps(
    {
      id,
      ref: switchRef,
      role: "switch",
      type: useResolveButtonType(props, switchElement),
      tabIndex: props.tabIndex === -1 ? 0 : (_a3 = props.tabIndex) != null ? _a3 : 0,
      "aria-checked": checked,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      disabled: disabled || void 0,
      autoFocus,
      onClick: handleClick,
      onKeyUp: handleKeyUp,
      onKeyPress: handleKeyPress
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let reset = (0, import_react77.useCallback)(() => {
    if (defaultChecked === void 0)
      return;
    return onChange == null ? void 0 : onChange(defaultChecked);
  }, [onChange, defaultChecked]);
  let render2 = useRender();
  return /* @__PURE__ */ import_react77.default.createElement(import_react77.default.Fragment, null, name != null && /* @__PURE__ */ import_react77.default.createElement(
    FormFields,
    {
      disabled,
      data: { [name]: value || "on" },
      overrides: { type: "checkbox", checked },
      form,
      onReset: reset
    }
  ), render2({ ourProps, theirProps, slot, defaultTag: DEFAULT_SWITCH_TAG, name: "Switch" }));
}
var SwitchRoot = forwardRefWithAs(SwitchFn);
var SwitchGroup = GroupFn3;
var SwitchLabel = Label;
var SwitchDescription = Description;
var Switch = Object.assign(SwitchRoot, {
  /** @deprecated use `<Field>` instead of `<Switch.Group>` */
  Group: SwitchGroup,
  /** @deprecated use `<Label>` instead of `<Switch.Label>` */
  Label: SwitchLabel,
  /** @deprecated use `<Description>` instead of `<Switch.Description>` */
  Description: SwitchDescription
});

// src/components/tabs/tabs.tsx
var import_react79 = __toESM(require("react"), 1);

// src/internal/focus-sentinel.tsx
var import_react78 = __toESM(require("react"), 1);
function FocusSentinel({ onFocus }) {
  let [enabled, setEnabled] = (0, import_react78.useState)(true);
  let mounted = useIsMounted();
  if (!enabled)
    return null;
  return /* @__PURE__ */ import_react78.default.createElement(
    Hidden,
    {
      as: "button",
      type: "button",
      features: 2 /* Focusable */,
      onFocus: (event) => {
        event.preventDefault();
        let frame;
        let tries = 50;
        function forwardFocus() {
          if (tries-- <= 0) {
            if (frame)
              cancelAnimationFrame(frame);
            return;
          }
          if (onFocus()) {
            cancelAnimationFrame(frame);
            if (!mounted.current)
              return;
            setEnabled(false);
            return;
          }
          frame = requestAnimationFrame(forwardFocus);
        }
        frame = requestAnimationFrame(forwardFocus);
      }
    }
  );
}

// src/utils/stable-collection.tsx
var React36 = __toESM(require("react"), 1);
var StableCollectionContext = React36.createContext(null);
function createCollection() {
  return {
    /** @type {Map<string, Map<string, number>>} */
    groups: /* @__PURE__ */ new Map(),
    get(group, key) {
      var _a3;
      let list = this.groups.get(group);
      if (!list) {
        list = /* @__PURE__ */ new Map();
        this.groups.set(group, list);
      }
      let renders = (_a3 = list.get(key)) != null ? _a3 : 0;
      list.set(key, renders + 1);
      let index3 = Array.from(list.keys()).indexOf(key);
      function release() {
        let renders2 = list.get(key);
        if (renders2 > 1) {
          list.set(key, renders2 - 1);
        } else {
          list.delete(key);
        }
      }
      return [index3, release];
    }
  };
}
function StableCollection({ children }) {
  let collection = React36.useRef(createCollection());
  return /* @__PURE__ */ React36.createElement(StableCollectionContext.Provider, { value: collection }, children);
}
function useStableCollectionIndex(group) {
  let collection = React36.useContext(StableCollectionContext);
  if (!collection)
    throw new Error("You must wrap your component in a <StableCollection>");
  let key = React36.useId();
  let [idx, cleanupIdx] = collection.current.get(group, key);
  React36.useEffect(() => cleanupIdx, []);
  return idx;
}

// src/components/tabs/tabs.tsx
var reducers8 = {
  [0 /* SetSelectedIndex */](state, action) {
    var _a3;
    let tabs = sortByDomNode(state.tabs, (tab) => tab.current);
    let panels = sortByDomNode(state.panels, (panel) => panel.current);
    let focusableTabs = tabs.filter((tab) => {
      var _a4;
      return !((_a4 = tab.current) == null ? void 0 : _a4.hasAttribute("disabled"));
    });
    let nextState = { ...state, tabs, panels };
    if (
      // Underflow
      action.index < 0 || // Overflow
      action.index > tabs.length - 1
    ) {
      let direction = match(Math.sign(action.index - state.selectedIndex), {
        [-1 /* Less */]: () => 1 /* Backwards */,
        [0 /* Equal */]: () => {
          return match(Math.sign(action.index), {
            [-1 /* Less */]: () => 0 /* Forwards */,
            [0 /* Equal */]: () => 0 /* Forwards */,
            [1 /* Greater */]: () => 1 /* Backwards */
          });
        },
        [1 /* Greater */]: () => 0 /* Forwards */
      });
      if (focusableTabs.length === 0) {
        return nextState;
      }
      let nextSelectedIndex = match(direction, {
        [0 /* Forwards */]: () => tabs.indexOf(focusableTabs[0]),
        [1 /* Backwards */]: () => tabs.indexOf(focusableTabs[focusableTabs.length - 1])
      });
      return {
        ...nextState,
        selectedIndex: nextSelectedIndex === -1 ? state.selectedIndex : nextSelectedIndex
      };
    }
    let before = tabs.slice(0, action.index);
    let after = tabs.slice(action.index);
    let next = [...after, ...before].find((tab) => focusableTabs.includes(tab));
    if (!next)
      return nextState;
    let selectedIndex = (_a3 = tabs.indexOf(next)) != null ? _a3 : state.selectedIndex;
    if (selectedIndex === -1)
      selectedIndex = state.selectedIndex;
    return { ...nextState, selectedIndex };
  },
  [1 /* RegisterTab */](state, action) {
    if (state.tabs.includes(action.tab))
      return state;
    let activeTab = state.tabs[state.selectedIndex];
    let adjustedTabs = sortByDomNode([...state.tabs, action.tab], (tab) => tab.current);
    let selectedIndex = state.selectedIndex;
    if (!state.info.current.isControlled) {
      selectedIndex = adjustedTabs.indexOf(activeTab);
      if (selectedIndex === -1)
        selectedIndex = state.selectedIndex;
    }
    return { ...state, tabs: adjustedTabs, selectedIndex };
  },
  [2 /* UnregisterTab */](state, action) {
    return { ...state, tabs: state.tabs.filter((tab) => tab !== action.tab) };
  },
  [3 /* RegisterPanel */](state, action) {
    if (state.panels.includes(action.panel))
      return state;
    return {
      ...state,
      panels: sortByDomNode([...state.panels, action.panel], (panel) => panel.current)
    };
  },
  [4 /* UnregisterPanel */](state, action) {
    return { ...state, panels: state.panels.filter((panel) => panel !== action.panel) };
  }
};
var TabsDataContext = (0, import_react79.createContext)(null);
TabsDataContext.displayName = "TabsDataContext";
function useData4(component) {
  let context = (0, import_react79.useContext)(TabsDataContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useData4);
    throw err;
  }
  return context;
}
var TabsActionsContext = (0, import_react79.createContext)(null);
TabsActionsContext.displayName = "TabsActionsContext";
function useActions4(component) {
  let context = (0, import_react79.useContext)(TabsActionsContext);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Tab.Group /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useActions4);
    throw err;
  }
  return context;
}
function stateReducer8(state, action) {
  return match(action.type, reducers8, state, action);
}
var DEFAULT_TABS_TAG = "div";
function GroupFn4(props, ref) {
  let {
    defaultIndex = 0,
    vertical = false,
    manual = false,
    onChange,
    selectedIndex = null,
    ...theirProps
  } = props;
  const orientation = vertical ? "vertical" : "horizontal";
  const activation = manual ? "manual" : "auto";
  let isControlled = selectedIndex !== null;
  let info = useLatestValue({ isControlled });
  let tabsRef = useSyncRefs(ref);
  let [state, dispatch] = (0, import_react79.useReducer)(stateReducer8, {
    info,
    selectedIndex: selectedIndex != null ? selectedIndex : defaultIndex,
    tabs: [],
    panels: []
  });
  let slot = (0, import_react79.useMemo)(
    () => ({ selectedIndex: state.selectedIndex }),
    [state.selectedIndex]
  );
  let onChangeRef = useLatestValue(onChange || (() => {
  }));
  let stableTabsRef = useLatestValue(state.tabs);
  let tabsData = (0, import_react79.useMemo)(
    () => ({ orientation, activation, ...state }),
    [orientation, activation, state]
  );
  let registerTab = useEvent((tab) => {
    dispatch({ type: 1 /* RegisterTab */, tab });
    return () => dispatch({ type: 2 /* UnregisterTab */, tab });
  });
  let registerPanel = useEvent((panel) => {
    dispatch({ type: 3 /* RegisterPanel */, panel });
    return () => dispatch({ type: 4 /* UnregisterPanel */, panel });
  });
  let change = useEvent((index3) => {
    if (realSelectedIndex.current !== index3) {
      onChangeRef.current(index3);
    }
    if (!isControlled) {
      dispatch({ type: 0 /* SetSelectedIndex */, index: index3 });
    }
  });
  let realSelectedIndex = useLatestValue(isControlled ? props.selectedIndex : state.selectedIndex);
  let tabsActions = (0, import_react79.useMemo)(() => ({ registerTab, registerPanel, change }), []);
  useIsoMorphicEffect(() => {
    dispatch({ type: 0 /* SetSelectedIndex */, index: selectedIndex != null ? selectedIndex : defaultIndex });
  }, [
    selectedIndex
    /* Deliberately skipping defaultIndex */
  ]);
  useIsoMorphicEffect(() => {
    if (realSelectedIndex.current === void 0)
      return;
    if (state.tabs.length <= 0)
      return;
    let sorted = sortByDomNode(state.tabs, (tab) => tab.current);
    let didOrderChange = sorted.some((tab, i) => state.tabs[i] !== tab);
    if (didOrderChange) {
      change(sorted.indexOf(state.tabs[realSelectedIndex.current]));
    }
  });
  let ourProps = { ref: tabsRef };
  let render2 = useRender();
  return /* @__PURE__ */ import_react79.default.createElement(StableCollection, null, /* @__PURE__ */ import_react79.default.createElement(TabsActionsContext.Provider, { value: tabsActions }, /* @__PURE__ */ import_react79.default.createElement(TabsDataContext.Provider, { value: tabsData }, tabsData.tabs.length <= 0 && /* @__PURE__ */ import_react79.default.createElement(
    FocusSentinel,
    {
      onFocus: () => {
        var _a3, _b2;
        for (let tab of stableTabsRef.current) {
          if (((_a3 = tab.current) == null ? void 0 : _a3.tabIndex) === 0) {
            (_b2 = tab.current) == null ? void 0 : _b2.focus();
            return true;
          }
        }
        return false;
      }
    }
  ), render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TABS_TAG,
    name: "Tabs"
  }))));
}
var DEFAULT_LIST_TAG = "div";
function ListFn(props, ref) {
  let { orientation, selectedIndex } = useData4("Tab.List");
  let listRef = useSyncRefs(ref);
  let slot = (0, import_react79.useMemo)(() => ({ selectedIndex }), [selectedIndex]);
  let theirProps = props;
  let ourProps = {
    ref: listRef,
    role: "tablist",
    "aria-orientation": orientation
  };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_LIST_TAG,
    name: "Tabs.List"
  });
}
var DEFAULT_TAB_TAG = "button";
function TabFn(props, ref) {
  var _a3, _b2;
  let internalId = (0, import_react19.useId)();
  let {
    id = `headlessui-tabs-tab-${internalId}`,
    disabled = false,
    autoFocus = false,
    ...theirProps
  } = props;
  let { orientation, activation, selectedIndex, tabs, panels } = useData4("Tab");
  let actions = useActions4("Tab");
  let data = useData4("Tab");
  let [tabElement, setTabElement] = (0, import_react79.useState)(null);
  let internalTabRef = (0, import_react79.useRef)(null);
  let tabRef = useSyncRefs(internalTabRef, ref, setTabElement);
  useIsoMorphicEffect(() => actions.registerTab(internalTabRef), [actions, internalTabRef]);
  let mySSRIndex = useStableCollectionIndex("tabs");
  let myIndex = tabs.indexOf(internalTabRef);
  if (myIndex === -1)
    myIndex = mySSRIndex;
  let selected = myIndex === selectedIndex;
  let activateUsing = useEvent((cb) => {
    var _a4;
    let result = cb();
    if (result === 2 /* Success */ && activation === "auto") {
      let newTab = (_a4 = getOwnerDocument(internalTabRef)) == null ? void 0 : _a4.activeElement;
      let idx = data.tabs.findIndex((tab) => tab.current === newTab);
      if (idx !== -1)
        actions.change(idx);
    }
    return result;
  });
  let handleKeyDown = useEvent((event) => {
    let list = tabs.map((tab) => tab.current).filter(Boolean);
    if (event.key === " " /* Space */ || event.key === "Enter" /* Enter */) {
      event.preventDefault();
      event.stopPropagation();
      actions.change(myIndex);
      return;
    }
    switch (event.key) {
      case "Home" /* Home */:
      case "PageUp" /* PageUp */:
        event.preventDefault();
        event.stopPropagation();
        return activateUsing(() => focusIn(list, 1 /* First */));
      case "End" /* End */:
      case "PageDown" /* PageDown */:
        event.preventDefault();
        event.stopPropagation();
        return activateUsing(() => focusIn(list, 8 /* Last */));
    }
    let result = activateUsing(() => {
      return match(orientation, {
        vertical() {
          if (event.key === "ArrowUp" /* ArrowUp */)
            return focusIn(list, 2 /* Previous */ | 16 /* WrapAround */);
          if (event.key === "ArrowDown" /* ArrowDown */)
            return focusIn(list, 4 /* Next */ | 16 /* WrapAround */);
          return 0 /* Error */;
        },
        horizontal() {
          if (event.key === "ArrowLeft" /* ArrowLeft */)
            return focusIn(list, 2 /* Previous */ | 16 /* WrapAround */);
          if (event.key === "ArrowRight" /* ArrowRight */)
            return focusIn(list, 4 /* Next */ | 16 /* WrapAround */);
          return 0 /* Error */;
        }
      });
    });
    if (result === 2 /* Success */) {
      return event.preventDefault();
    }
  });
  let ready = (0, import_react79.useRef)(false);
  let handleSelection = useEvent(() => {
    var _a4;
    if (ready.current)
      return;
    ready.current = true;
    (_a4 = internalTabRef.current) == null ? void 0 : _a4.focus({ preventScroll: true });
    actions.change(myIndex);
    microTask(() => {
      ready.current = false;
    });
  });
  let handleMouseDown = useEvent((event) => {
    event.preventDefault();
  });
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let { pressed: active, pressProps } = useActivePress({ disabled });
  let slot = (0, import_react79.useMemo)(() => {
    return {
      selected,
      hover,
      active,
      focus,
      autofocus: autoFocus,
      disabled
    };
  }, [selected, hover, focus, active, autoFocus, disabled]);
  let ourProps = mergeProps(
    {
      ref: tabRef,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
      onClick: handleSelection,
      id,
      role: "tab",
      type: useResolveButtonType(props, tabElement),
      "aria-controls": (_b2 = (_a3 = panels[myIndex]) == null ? void 0 : _a3.current) == null ? void 0 : _b2.id,
      "aria-selected": selected,
      tabIndex: selected ? 0 : -1,
      disabled: disabled || void 0,
      autoFocus
    },
    focusProps,
    hoverProps,
    pressProps
  );
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TAB_TAG,
    name: "Tabs.Tab"
  });
}
var DEFAULT_PANELS_TAG = "div";
function PanelsFn(props, ref) {
  let { selectedIndex } = useData4("Tab.Panels");
  let panelsRef = useSyncRefs(ref);
  let slot = (0, import_react79.useMemo)(() => ({ selectedIndex }), [selectedIndex]);
  let theirProps = props;
  let ourProps = { ref: panelsRef };
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANELS_TAG,
    name: "Tabs.Panels"
  });
}
var DEFAULT_PANEL_TAG4 = "div";
var PanelRenderFeatures3 = 1 /* RenderStrategy */ | 2 /* Static */;
function PanelFn4(props, ref) {
  var _a3, _b2, _c, _d;
  let internalId = (0, import_react19.useId)();
  let { id = `headlessui-tabs-panel-${internalId}`, tabIndex = 0, ...theirProps } = props;
  let { selectedIndex, tabs, panels } = useData4("Tab.Panel");
  let actions = useActions4("Tab.Panel");
  let internalPanelRef = (0, import_react79.useRef)(null);
  let panelRef = useSyncRefs(internalPanelRef, ref);
  useIsoMorphicEffect(() => actions.registerPanel(internalPanelRef), [actions, internalPanelRef]);
  let mySSRIndex = useStableCollectionIndex("panels");
  let myIndex = panels.indexOf(internalPanelRef);
  if (myIndex === -1)
    myIndex = mySSRIndex;
  let selected = myIndex === selectedIndex;
  let { isFocusVisible: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f();
  let slot = (0, import_react79.useMemo)(() => ({ selected, focus }), [selected, focus]);
  let ourProps = mergeProps(
    {
      ref: panelRef,
      id,
      role: "tabpanel",
      "aria-labelledby": (_b2 = (_a3 = tabs[myIndex]) == null ? void 0 : _a3.current) == null ? void 0 : _b2.id,
      tabIndex: selected ? tabIndex : -1
    },
    focusProps
  );
  let render2 = useRender();
  if (!selected && ((_c = theirProps.unmount) != null ? _c : true) && !((_d = theirProps.static) != null ? _d : false)) {
    return /* @__PURE__ */ import_react79.default.createElement(Hidden, { "aria-hidden": "true", ...ourProps });
  }
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_PANEL_TAG4,
    features: PanelRenderFeatures3,
    visible: selected,
    name: "Tabs.Panel"
  });
}
var TabRoot = forwardRefWithAs(TabFn);
var TabGroup = forwardRefWithAs(GroupFn4);
var TabList = forwardRefWithAs(ListFn);
var TabPanels = forwardRefWithAs(PanelsFn);
var TabPanel = forwardRefWithAs(PanelFn4);
var Tab = Object.assign(TabRoot, {
  /** @deprecated use `<TabGroup>` instead of `<Tab.Group>` */
  Group: TabGroup,
  /** @deprecated use `<TabList>` instead of `<Tab.List>` */
  List: TabList,
  /** @deprecated use `<TabPanels>` instead of `<Tab.Panels>` */
  Panels: TabPanels,
  /** @deprecated use `<TabPanel>` instead of `<Tab.Panel>` */
  Panel: TabPanel
});

// src/components/textarea/textarea.tsx
var import_react80 = require("react");
var DEFAULT_TEXTAREA_TAG = "textarea";
function TextareaFn(props, ref) {
  let internalId = (0, import_react19.useId)();
  let providedId = useProvidedId();
  let providedDisabled = useDisabled();
  let {
    id = providedId || `headlessui-textarea-${internalId}`,
    disabled = providedDisabled || false,
    autoFocus = false,
    invalid = false,
    ...theirProps
  } = props;
  let labelledBy = useLabelledBy();
  let describedBy = useDescribedBy();
  let { isFocused: focus, focusProps } = $f7dceffc5ad7768b$export$4e328f61c538687f({ autoFocus });
  let { isHovered: hover, hoverProps } = $6179b936705e76d3$export$ae780daf29e6d456({ isDisabled: disabled });
  let ourProps = mergeProps(
    {
      ref,
      id,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-invalid": invalid ? "" : void 0,
      disabled: disabled || void 0,
      autoFocus
    },
    focusProps,
    hoverProps
  );
  let slot = (0, import_react80.useMemo)(() => {
    return { disabled, invalid, hover, focus, autofocus: autoFocus };
  }, [disabled, invalid, hover, focus, autoFocus]);
  let render2 = useRender();
  return render2({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_TEXTAREA_TAG,
    name: "Textarea"
  });
}
var Textarea = forwardRefWithAs(TextareaFn);
