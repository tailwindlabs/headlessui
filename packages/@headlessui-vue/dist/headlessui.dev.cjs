"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Combobox: () => Combobox,
  ComboboxButton: () => ComboboxButton,
  ComboboxInput: () => ComboboxInput,
  ComboboxLabel: () => ComboboxLabel,
  ComboboxOption: () => ComboboxOption,
  ComboboxOptions: () => ComboboxOptions,
  Dialog: () => Dialog,
  DialogBackdrop: () => DialogBackdrop,
  DialogDescription: () => DialogDescription,
  DialogOverlay: () => DialogOverlay,
  DialogPanel: () => DialogPanel,
  DialogTitle: () => DialogTitle,
  Disclosure: () => Disclosure,
  DisclosureButton: () => DisclosureButton,
  DisclosurePanel: () => DisclosurePanel,
  FocusTrap: () => FocusTrap,
  Listbox: () => Listbox,
  ListboxButton: () => ListboxButton,
  ListboxLabel: () => ListboxLabel,
  ListboxOption: () => ListboxOption,
  ListboxOptions: () => ListboxOptions,
  Menu: () => Menu,
  MenuButton: () => MenuButton,
  MenuItem: () => MenuItem,
  MenuItems: () => MenuItems,
  Popover: () => Popover,
  PopoverButton: () => PopoverButton,
  PopoverGroup: () => PopoverGroup,
  PopoverOverlay: () => PopoverOverlay,
  PopoverPanel: () => PopoverPanel,
  Portal: () => Portal,
  PortalGroup: () => PortalGroup,
  RadioGroup: () => RadioGroup,
  RadioGroupDescription: () => RadioGroupDescription,
  RadioGroupLabel: () => RadioGroupLabel,
  RadioGroupOption: () => RadioGroupOption,
  Switch: () => Switch,
  SwitchDescription: () => SwitchDescription,
  SwitchGroup: () => SwitchGroup,
  SwitchLabel: () => SwitchLabel,
  Tab: () => Tab,
  TabGroup: () => TabGroup,
  TabList: () => TabList,
  TabPanel: () => TabPanel,
  TabPanels: () => TabPanels,
  TransitionChild: () => TransitionChild,
  TransitionRoot: () => TransitionRoot
});
module.exports = __toCommonJS(src_exports);

// node_modules/@tanstack/vue-virtual/build/lib/_virtual/_rollupPluginBabelHelpers.mjs
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
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

// ../../node_modules/@tanstack/virtual-core/build/lib/_virtual/_rollupPluginBabelHelpers.mjs
function _extends2() {
  _extends2 = Object.assign ? Object.assign.bind() : function(target) {
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
  return _extends2.apply(this, arguments);
}

// ../../node_modules/@tanstack/virtual-core/build/lib/utils.mjs
function memo(getDeps, fn, opts) {
  var _opts$initialDeps;
  var deps = (_opts$initialDeps = opts.initialDeps) != null ? _opts$initialDeps : [];
  var result;
  return function() {
    var depTime;
    if (opts.key && opts.debug != null && opts.debug())
      depTime = Date.now();
    var newDeps = getDeps();
    var depsChanged = newDeps.length !== deps.length || newDeps.some(function(dep, index) {
      return deps[index] !== dep;
    });
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    var resultTime;
    if (opts.key && opts.debug != null && opts.debug())
      resultTime = Date.now();
    result = fn.apply(void 0, newDeps);
    if (opts.key && opts.debug != null && opts.debug()) {
      var depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      var resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      var resultFpsPercentage = resultEndTime / 16;
      var pad = function pad2(str, num) {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info("%c\u23F1 " + pad(resultEndTime, 5) + " /" + pad(depEndTime, 5) + " ms", "\n            font-size: .6rem;\n            font-weight: bold;\n            color: hsl(" + Math.max(0, Math.min(120 - 120 * resultFpsPercentage, 120)) + "deg 100% 31%);", opts == null ? void 0 : opts.key);
    }
    opts == null ? void 0 : opts.onChange == null ? void 0 : opts.onChange(result);
    return result;
  };
}
function notUndefined(value, msg) {
  if (value === void 0) {
    throw new Error("Unexpected undefined" + (msg ? ": " + msg : ""));
  } else {
    return value;
  }
}
var approxEqual = function approxEqual2(a, b) {
  return Math.abs(a - b) < 1;
};

// ../../node_modules/@tanstack/virtual-core/build/lib/index.mjs
var defaultKeyExtractor = function defaultKeyExtractor2(index) {
  return index;
};
var defaultRangeExtractor = function defaultRangeExtractor2(range) {
  var start = Math.max(range.startIndex - range.overscan, 0);
  var end = Math.min(range.endIndex + range.overscan, range.count - 1);
  var arr = [];
  for (var _i = start; _i <= end; _i++) {
    arr.push(_i);
  }
  return arr;
};
var observeElementRect = function observeElementRect2(instance, cb) {
  var element = instance.scrollElement;
  if (!element) {
    return;
  }
  var handler = function handler2(rect) {
    var width = rect.width, height = rect.height;
    cb({
      width: Math.round(width),
      height: Math.round(height)
    });
  };
  handler(element.getBoundingClientRect());
  var observer = new ResizeObserver(function(entries) {
    var entry = entries[0];
    if (entry != null && entry.borderBoxSize) {
      var box = entry.borderBoxSize[0];
      if (box) {
        handler({
          width: box.inlineSize,
          height: box.blockSize
        });
        return;
      }
    }
    handler(element.getBoundingClientRect());
  });
  observer.observe(element, {
    box: "border-box"
  });
  return function() {
    observer.unobserve(element);
  };
};
var observeElementOffset = function observeElementOffset2(instance, cb) {
  var element = instance.scrollElement;
  if (!element) {
    return;
  }
  var handler = function handler2() {
    cb(element[instance.options.horizontal ? "scrollLeft" : "scrollTop"]);
  };
  handler();
  element.addEventListener("scroll", handler, {
    passive: true
  });
  return function() {
    element.removeEventListener("scroll", handler);
  };
};
var measureElement = function measureElement2(element, entry, instance) {
  if (entry != null && entry.borderBoxSize) {
    var box = entry.borderBoxSize[0];
    if (box) {
      var size = Math.round(box[instance.options.horizontal ? "inlineSize" : "blockSize"]);
      return size;
    }
  }
  return Math.round(element.getBoundingClientRect()[instance.options.horizontal ? "width" : "height"]);
};
var elementScroll = function elementScroll2(offset, _ref2, instance) {
  var _instance$scrollEleme3, _instance$scrollEleme4;
  var _ref2$adjustments = _ref2.adjustments, adjustments = _ref2$adjustments === void 0 ? 0 : _ref2$adjustments, behavior = _ref2.behavior;
  var toOffset = offset + adjustments;
  (_instance$scrollEleme3 = instance.scrollElement) == null ? void 0 : _instance$scrollEleme3.scrollTo == null ? void 0 : _instance$scrollEleme3.scrollTo((_instance$scrollEleme4 = {}, _instance$scrollEleme4[instance.options.horizontal ? "left" : "top"] = toOffset, _instance$scrollEleme4.behavior = behavior, _instance$scrollEleme4));
};
var Virtualizer = function Virtualizer2(_opts) {
  var _this = this;
  this.unsubs = [];
  this.scrollElement = null;
  this.isScrolling = false;
  this.isScrollingTimeoutId = null;
  this.scrollToIndexTimeoutId = null;
  this.measurementsCache = [];
  this.itemSizeCache = /* @__PURE__ */ new Map();
  this.pendingMeasuredCacheIndexes = [];
  this.scrollDirection = null;
  this.scrollAdjustments = 0;
  this.measureElementCache = /* @__PURE__ */ new Map();
  this.observer = function() {
    var _ro = null;
    var get = function get2() {
      if (_ro) {
        return _ro;
      } else if (typeof ResizeObserver !== "undefined") {
        return _ro = new ResizeObserver(function(entries) {
          entries.forEach(function(entry) {
            _this._measureElement(entry.target, entry);
          });
        });
      } else {
        return null;
      }
    };
    return {
      disconnect: function disconnect() {
        var _get;
        return (_get = get()) == null ? void 0 : _get.disconnect();
      },
      observe: function observe(target) {
        var _get2;
        return (_get2 = get()) == null ? void 0 : _get2.observe(target, {
          box: "border-box"
        });
      },
      unobserve: function unobserve(target) {
        var _get3;
        return (_get3 = get()) == null ? void 0 : _get3.unobserve(target);
      }
    };
  }();
  this.range = {
    startIndex: 0,
    endIndex: 0
  };
  this.setOptions = function(opts) {
    Object.entries(opts).forEach(function(_ref3) {
      var key = _ref3[0], value = _ref3[1];
      if (typeof value === "undefined")
        delete opts[key];
    });
    _this.options = _extends2({
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
      onChange: function onChange() {
      },
      measureElement,
      initialRect: {
        width: 0,
        height: 0
      },
      scrollMargin: 0,
      scrollingDelay: 150,
      indexAttribute: "data-index",
      initialMeasurementsCache: [],
      lanes: 1
    }, opts);
  };
  this.notify = function() {
    _this.options.onChange == null ? void 0 : _this.options.onChange(_this);
  };
  this.cleanup = function() {
    _this.unsubs.filter(Boolean).forEach(function(d) {
      return d();
    });
    _this.unsubs = [];
    _this.scrollElement = null;
  };
  this._didMount = function() {
    _this.measureElementCache.forEach(_this.observer.observe);
    return function() {
      _this.observer.disconnect();
      _this.cleanup();
    };
  };
  this._willUpdate = function() {
    var scrollElement = _this.options.getScrollElement();
    if (_this.scrollElement !== scrollElement) {
      _this.cleanup();
      _this.scrollElement = scrollElement;
      _this._scrollToOffset(_this.scrollOffset, {
        adjustments: void 0,
        behavior: void 0
      });
      _this.unsubs.push(_this.options.observeElementRect(_this, function(rect) {
        var prev = _this.scrollRect;
        _this.scrollRect = rect;
        if (_this.options.horizontal ? rect.width !== prev.width : rect.height !== prev.height) {
          _this.maybeNotify();
        }
      }));
      _this.unsubs.push(_this.options.observeElementOffset(_this, function(offset) {
        _this.scrollAdjustments = 0;
        if (_this.scrollOffset === offset) {
          return;
        }
        if (_this.isScrollingTimeoutId !== null) {
          clearTimeout(_this.isScrollingTimeoutId);
          _this.isScrollingTimeoutId = null;
        }
        _this.isScrolling = true;
        _this.scrollDirection = _this.scrollOffset < offset ? "forward" : "backward";
        _this.scrollOffset = offset;
        _this.maybeNotify();
        _this.isScrollingTimeoutId = setTimeout(function() {
          _this.isScrollingTimeoutId = null;
          _this.isScrolling = false;
          _this.scrollDirection = null;
          _this.maybeNotify();
        }, _this.options.scrollingDelay);
      }));
    }
  };
  this.getSize = function() {
    return _this.scrollRect[_this.options.horizontal ? "width" : "height"];
  };
  this.memoOptions = memo(function() {
    return [_this.options.count, _this.options.paddingStart, _this.options.scrollMargin, _this.options.getItemKey];
  }, function(count, paddingStart, scrollMargin, getItemKey) {
    _this.pendingMeasuredCacheIndexes = [];
    return {
      count,
      paddingStart,
      scrollMargin,
      getItemKey
    };
  }, {
    key: false
  });
  this.getFurthestMeasurement = function(measurements, index) {
    var furthestMeasurementsFound = /* @__PURE__ */ new Map();
    var furthestMeasurements = /* @__PURE__ */ new Map();
    for (var m = index - 1; m >= 0; m--) {
      var measurement = measurements[m];
      if (furthestMeasurementsFound.has(measurement.lane)) {
        continue;
      }
      var previousFurthestMeasurement = furthestMeasurements.get(measurement.lane);
      if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
        furthestMeasurements.set(measurement.lane, measurement);
      } else if (measurement.end < previousFurthestMeasurement.end) {
        furthestMeasurementsFound.set(measurement.lane, true);
      }
      if (furthestMeasurementsFound.size === _this.options.lanes) {
        break;
      }
    }
    return furthestMeasurements.size === _this.options.lanes ? Array.from(furthestMeasurements.values()).sort(function(a, b) {
      return a.end - b.end;
    })[0] : void 0;
  };
  this.getMeasurements = memo(function() {
    return [_this.memoOptions(), _this.itemSizeCache];
  }, function(_ref4, itemSizeCache) {
    var count = _ref4.count, paddingStart = _ref4.paddingStart, scrollMargin = _ref4.scrollMargin, getItemKey = _ref4.getItemKey;
    var min = _this.pendingMeasuredCacheIndexes.length > 0 ? Math.min.apply(Math, _this.pendingMeasuredCacheIndexes) : 0;
    _this.pendingMeasuredCacheIndexes = [];
    var measurements = _this.measurementsCache.slice(0, min);
    for (var _i2 = min; _i2 < count; _i2++) {
      var key = getItemKey(_i2);
      var furthestMeasurement = _this.options.lanes === 1 ? measurements[_i2 - 1] : _this.getFurthestMeasurement(measurements, _i2);
      var start = furthestMeasurement ? furthestMeasurement.end : paddingStart + scrollMargin;
      var measuredSize = itemSizeCache.get(key);
      var size = typeof measuredSize === "number" ? measuredSize : _this.options.estimateSize(_i2);
      var end = start + size;
      var lane = furthestMeasurement ? furthestMeasurement.lane : _i2 % _this.options.lanes;
      measurements[_i2] = {
        index: _i2,
        start,
        size,
        end,
        key,
        lane
      };
    }
    _this.measurementsCache = measurements;
    return measurements;
  }, {
    key: "getMeasurements",
    debug: function debug() {
      return _this.options.debug;
    }
  });
  this.calculateRange = memo(function() {
    return [_this.getMeasurements(), _this.getSize(), _this.scrollOffset];
  }, function(measurements, outerSize, scrollOffset) {
    return _this.range = calculateRange({
      measurements,
      outerSize,
      scrollOffset
    });
  }, {
    key: "calculateRange",
    debug: function debug() {
      return _this.options.debug;
    }
  });
  this.maybeNotify = memo(function() {
    var range = _this.calculateRange();
    return [range.startIndex, range.endIndex, _this.isScrolling];
  }, function() {
    _this.notify();
  }, {
    key: "maybeNotify",
    debug: function debug() {
      return _this.options.debug;
    },
    initialDeps: [this.range.startIndex, this.range.endIndex, this.isScrolling]
  });
  this.getIndexes = memo(function() {
    return [_this.options.rangeExtractor, _this.calculateRange(), _this.options.overscan, _this.options.count];
  }, function(rangeExtractor, range, overscan, count) {
    return rangeExtractor(_extends2({}, range, {
      overscan,
      count
    }));
  }, {
    key: "getIndexes",
    debug: function debug() {
      return _this.options.debug;
    }
  });
  this.indexFromElement = function(node) {
    var attributeName = _this.options.indexAttribute;
    var indexStr = node.getAttribute(attributeName);
    if (!indexStr) {
      console.warn("Missing attribute name '" + attributeName + "={index}' on measured element.");
      return -1;
    }
    return parseInt(indexStr, 10);
  };
  this._measureElement = function(node, entry) {
    var item = _this.measurementsCache[_this.indexFromElement(node)];
    if (!item) {
      _this.measureElementCache.forEach(function(cached, key) {
        if (cached === node) {
          _this.observer.unobserve(node);
          _this.measureElementCache["delete"](key);
        }
      });
      return;
    }
    var prevNode = _this.measureElementCache.get(item.key);
    if (!node.isConnected) {
      if (prevNode) {
        _this.observer.unobserve(prevNode);
        _this.measureElementCache["delete"](item.key);
      }
      return;
    }
    if (prevNode !== node) {
      if (prevNode) {
        _this.observer.unobserve(prevNode);
      }
      _this.observer.observe(node);
      _this.measureElementCache.set(item.key, node);
    }
    var measuredItemSize = _this.options.measureElement(node, entry, _this);
    _this.resizeItem(item, measuredItemSize);
  };
  this.resizeItem = function(item, size) {
    var _this$itemSizeCache$g;
    var itemSize = (_this$itemSizeCache$g = _this.itemSizeCache.get(item.key)) != null ? _this$itemSizeCache$g : item.size;
    var delta = size - itemSize;
    if (delta !== 0) {
      if (item.start < _this.scrollOffset) {
        if (_this.options.debug) {
          console.info("correction", delta);
        }
        _this._scrollToOffset(_this.scrollOffset, {
          adjustments: _this.scrollAdjustments += delta,
          behavior: void 0
        });
      }
      _this.pendingMeasuredCacheIndexes.push(item.index);
      _this.itemSizeCache = new Map(_this.itemSizeCache.set(item.key, size));
      _this.notify();
    }
  };
  this.measureElement = function(node) {
    if (!node) {
      return;
    }
    _this._measureElement(node, void 0);
  };
  this.getVirtualItems = memo(function() {
    return [_this.getIndexes(), _this.getMeasurements()];
  }, function(indexes, measurements) {
    var virtualItems = [];
    for (var k = 0, len = indexes.length; k < len; k++) {
      var _i3 = indexes[k];
      var measurement = measurements[_i3];
      virtualItems.push(measurement);
    }
    return virtualItems;
  }, {
    key: "getIndexes",
    debug: function debug() {
      return _this.options.debug;
    }
  });
  this.getVirtualItemForOffset = function(offset) {
    var measurements = _this.getMeasurements();
    return notUndefined(measurements[findNearestBinarySearch(0, measurements.length - 1, function(index) {
      return notUndefined(measurements[index]).start;
    }, offset)]);
  };
  this.getOffsetForAlignment = function(toOffset, align) {
    var size = _this.getSize();
    if (align === "auto") {
      if (toOffset <= _this.scrollOffset) {
        align = "start";
      } else if (toOffset >= _this.scrollOffset + size) {
        align = "end";
      } else {
        align = "start";
      }
    }
    if (align === "start") {
      toOffset = toOffset;
    } else if (align === "end") {
      toOffset = toOffset - size;
    } else if (align === "center") {
      toOffset = toOffset - size / 2;
    }
    var scrollSizeProp = _this.options.horizontal ? "scrollWidth" : "scrollHeight";
    var scrollSize = _this.scrollElement ? "document" in _this.scrollElement ? _this.scrollElement.document.documentElement[scrollSizeProp] : _this.scrollElement[scrollSizeProp] : 0;
    var maxOffset = scrollSize - _this.getSize();
    return Math.max(Math.min(maxOffset, toOffset), 0);
  };
  this.getOffsetForIndex = function(index, align) {
    if (align === void 0) {
      align = "auto";
    }
    index = Math.max(0, Math.min(index, _this.options.count - 1));
    var measurement = notUndefined(_this.getMeasurements()[index]);
    if (align === "auto") {
      if (measurement.end >= _this.scrollOffset + _this.getSize() - _this.options.scrollPaddingEnd) {
        align = "end";
      } else if (measurement.start <= _this.scrollOffset + _this.options.scrollPaddingStart) {
        align = "start";
      } else {
        return [_this.scrollOffset, align];
      }
    }
    var toOffset = align === "end" ? measurement.end + _this.options.scrollPaddingEnd : measurement.start - _this.options.scrollPaddingStart;
    return [_this.getOffsetForAlignment(toOffset, align), align];
  };
  this.isDynamicMode = function() {
    return _this.measureElementCache.size > 0;
  };
  this.cancelScrollToIndex = function() {
    if (_this.scrollToIndexTimeoutId !== null) {
      clearTimeout(_this.scrollToIndexTimeoutId);
      _this.scrollToIndexTimeoutId = null;
    }
  };
  this.scrollToOffset = function(toOffset, _temp) {
    var _ref5 = _temp === void 0 ? {} : _temp, _ref5$align = _ref5.align, align = _ref5$align === void 0 ? "start" : _ref5$align, behavior = _ref5.behavior;
    _this.cancelScrollToIndex();
    if (behavior === "smooth" && _this.isDynamicMode()) {
      console.warn("The `smooth` scroll behavior is not fully supported with dynamic size.");
    }
    _this._scrollToOffset(_this.getOffsetForAlignment(toOffset, align), {
      adjustments: void 0,
      behavior
    });
  };
  this.scrollToIndex = function(index, _temp2) {
    var _ref6 = _temp2 === void 0 ? {} : _temp2, _ref6$align = _ref6.align, initialAlign = _ref6$align === void 0 ? "auto" : _ref6$align, behavior = _ref6.behavior;
    index = Math.max(0, Math.min(index, _this.options.count - 1));
    _this.cancelScrollToIndex();
    if (behavior === "smooth" && _this.isDynamicMode()) {
      console.warn("The `smooth` scroll behavior is not fully supported with dynamic size.");
    }
    var _this$getOffsetForInd = _this.getOffsetForIndex(index, initialAlign), toOffset = _this$getOffsetForInd[0], align = _this$getOffsetForInd[1];
    _this._scrollToOffset(toOffset, {
      adjustments: void 0,
      behavior
    });
    if (behavior !== "smooth" && _this.isDynamicMode()) {
      _this.scrollToIndexTimeoutId = setTimeout(function() {
        _this.scrollToIndexTimeoutId = null;
        var elementInDOM = _this.measureElementCache.has(_this.options.getItemKey(index));
        if (elementInDOM) {
          var _this$getOffsetForInd2 = _this.getOffsetForIndex(index, align), _toOffset = _this$getOffsetForInd2[0];
          if (!approxEqual(_toOffset, _this.scrollOffset)) {
            _this.scrollToIndex(index, {
              align,
              behavior
            });
          }
        } else {
          _this.scrollToIndex(index, {
            align,
            behavior
          });
        }
      });
    }
  };
  this.scrollBy = function(delta, _temp3) {
    var _ref7 = _temp3 === void 0 ? {} : _temp3, behavior = _ref7.behavior;
    _this.cancelScrollToIndex();
    if (behavior === "smooth" && _this.isDynamicMode()) {
      console.warn("The `smooth` scroll behavior is not fully supported with dynamic size.");
    }
    _this._scrollToOffset(_this.scrollOffset + delta, {
      adjustments: void 0,
      behavior
    });
  };
  this.getTotalSize = function() {
    var _this$getMeasurements;
    return (((_this$getMeasurements = _this.getMeasurements()[_this.options.count - 1]) == null ? void 0 : _this$getMeasurements.end) || _this.options.paddingStart) - _this.options.scrollMargin + _this.options.paddingEnd;
  };
  this._scrollToOffset = function(offset, _ref8) {
    var adjustments = _ref8.adjustments, behavior = _ref8.behavior;
    _this.options.scrollToFn(offset, {
      behavior,
      adjustments
    }, _this);
  };
  this.measure = function() {
    _this.itemSizeCache = /* @__PURE__ */ new Map();
    _this.notify();
  };
  this.setOptions(_opts);
  this.scrollRect = this.options.initialRect;
  this.scrollOffset = this.options.initialOffset;
  this.measurementsCache = this.options.initialMeasurementsCache;
  this.measurementsCache.forEach(function(item) {
    _this.itemSizeCache.set(item.key, item.size);
  });
  this.maybeNotify();
};
var findNearestBinarySearch = function findNearestBinarySearch2(low, high, getCurrentValue, value) {
  while (low <= high) {
    var middle = (low + high) / 2 | 0;
    var currentValue = getCurrentValue(middle);
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
function calculateRange(_ref9) {
  var measurements = _ref9.measurements, outerSize = _ref9.outerSize, scrollOffset = _ref9.scrollOffset;
  var count = measurements.length - 1;
  var getOffset = function getOffset2(index) {
    return measurements[index].start;
  };
  var startIndex = findNearestBinarySearch(0, count, getOffset, scrollOffset);
  var endIndex = startIndex;
  while (endIndex < count && measurements[endIndex].end < scrollOffset + outerSize) {
    endIndex++;
  }
  return {
    startIndex,
    endIndex
  };
}

// node_modules/@tanstack/vue-virtual/build/lib/index.mjs
var import_vue = require("vue");
function useVirtualizerBase(options) {
  var virtualizer = new Virtualizer((0, import_vue.unref)(options));
  var state = (0, import_vue.shallowRef)(virtualizer);
  var cleanup = virtualizer._didMount();
  (0, import_vue.watch)(function() {
    return (0, import_vue.unref)(options).getScrollElement();
  }, function(el) {
    if (el) {
      virtualizer._willUpdate();
    }
  }, {
    immediate: true
  });
  (0, import_vue.watch)(function() {
    return (0, import_vue.unref)(options);
  }, function(options2) {
    virtualizer.setOptions(_extends({}, options2, {
      onChange: function onChange(instance) {
        (0, import_vue.triggerRef)(state);
        options2.onChange == null ? void 0 : options2.onChange(instance);
      }
    }));
    virtualizer._willUpdate();
    (0, import_vue.triggerRef)(state);
  }, {
    immediate: true
  });
  (0, import_vue.onScopeDispose)(cleanup);
  return state;
}
function useVirtualizer(options) {
  return useVirtualizerBase((0, import_vue.computed)(function() {
    return _extends({
      observeElementRect,
      observeElementOffset,
      scrollToFn: elementScroll
    }, (0, import_vue.unref)(options));
  }));
}

// src/components/combobox/combobox.ts
var import_vue14 = require("vue");

// src/hooks/use-controllable.ts
var import_vue2 = require("vue");
function useControllable(controlledValue, onChange, defaultValue) {
  let internalValue = (0, import_vue2.ref)(defaultValue == null ? void 0 : defaultValue.value);
  let isControlled = (0, import_vue2.computed)(() => controlledValue.value !== void 0);
  return [
    (0, import_vue2.computed)(() => isControlled.value ? controlledValue.value : internalValue.value),
    function(value) {
      if (isControlled.value) {
        return onChange == null ? void 0 : onChange(value);
      } else {
        internalValue.value = value;
        return onChange == null ? void 0 : onChange(value);
      }
    }
  ];
}

// src/hooks/use-disposables.ts
var import_vue3 = require("vue");

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
      api.add(() => cancelAnimationFrame(raf));
    },
    nextFrame(...args) {
      api.requestAnimationFrame(() => {
        api.requestAnimationFrame(...args);
      });
    },
    setTimeout(...args) {
      let timer = setTimeout(...args);
      api.add(() => clearTimeout(timer));
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
      _disposables.push(cb);
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
  let d = disposables();
  (0, import_vue3.onUnmounted)(() => d.dispose());
  return d;
}

// src/hooks/use-frame-debounce.ts
function useFrameDebounce() {
  let d = useDisposables();
  return (cb) => {
    d.dispose();
    d.nextFrame(cb);
  };
}

// src/hooks/use-id.ts
var id = 0;
function generateId() {
  return ++id;
}
function useId() {
  return generateId();
}

// src/hooks/use-outside-click.ts
var import_vue7 = require("vue");

// src/utils/dom.ts
function dom(ref24) {
  var _a;
  if (ref24 == null)
    return null;
  if (ref24.value == null)
    return null;
  let el = (_a = ref24.value.$el) != null ? _a : ref24.value;
  if (el instanceof Node) {
    return el;
  }
  return null;
}

// src/utils/focus-management.ts
var import_vue4 = require("vue");

// src/utils/match.ts
function match(value, lookup, ...args) {
  if (value in lookup) {
    let returnValue = lookup[value];
    return typeof returnValue === "function" ? returnValue(...args) : returnValue;
  }
  let error = new Error(
    `Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(
      lookup
    ).map((key) => `"${key}"`).join(", ")}.`
  );
  if (Error.captureStackTrace)
    Error.captureStackTrace(error, match);
  throw error;
}

// src/utils/env.ts
var Env = class {
  constructor() {
    __publicField(this, "current", this.detect());
    __publicField(this, "currentId", 0);
  }
  set(env2) {
    if (this.current === env2)
      return;
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
};
var env = new Env();

// src/utils/owner.ts
function getOwnerDocument(element) {
  var _a, _b;
  if (env.isServer)
    return null;
  if (!element)
    return document;
  if ("ownerDocument" in element)
    return element.ownerDocument;
  if ("value" in element)
    return (_b = (_a = dom(element)) == null ? void 0 : _a.ownerDocument) != null ? _b : document;
  return null;
}

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
function getFocusableElements(container = document.body) {
  if (container == null)
    return [];
  return Array.from(container.querySelectorAll(focusableSelector)).sort(
    // We want to move `:tabindex="0"` to the end of the list, this is what the browser does as well.
    (a, z) => Math.sign((a.tabIndex || Number.MAX_SAFE_INTEGER) - (z.tabIndex || Number.MAX_SAFE_INTEGER))
  );
}
function isFocusableElement(element, mode = 0 /* Strict */) {
  var _a;
  if (element === ((_a = getOwnerDocument(element)) == null ? void 0 : _a.body))
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
  (0, import_vue4.nextTick)(() => {
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
  var _a, _b;
  return (_b = (_a = element == null ? void 0 : element.matches) == null ? void 0 : _a.call(element, selectableSelector)) != null ? _b : false;
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
  var _a;
  let ownerDocument = (_a = Array.isArray(container) ? container.length > 0 ? container[0].ownerDocument : document : container == null ? void 0 : container.ownerDocument) != null ? _a : document;
  let elements = Array.isArray(container) ? sorted ? sortByDomNode(container) : container : getFocusableElements(container);
  if (skipElements.length > 0 && elements.length > 1) {
    elements = elements.filter((x) => !skipElements.includes(x));
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
  let offset = 0;
  let total = elements.length;
  let next = void 0;
  do {
    if (offset >= total || offset + total <= 0)
      return 0 /* Error */;
    let nextIdx = startIndex + offset;
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
    offset += direction;
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
var import_vue5 = require("vue");
function useDocumentEvent(enabled, type, listener, options) {
  if (env.isServer)
    return;
  (0, import_vue5.watchEffect)((onInvalidate) => {
    if (!enabled.value)
      return;
    document.addEventListener(type, listener, options);
    onInvalidate(() => document.removeEventListener(type, listener, options));
  });
}

// src/hooks/use-window-event.ts
var import_vue6 = require("vue");
function useWindowEvent(enabled, type, listener, options) {
  if (env.isServer)
    return;
  (0, import_vue6.watchEffect)((onInvalidate) => {
    if (!enabled.value)
      return;
    window.addEventListener(type, listener, options);
    onInvalidate(() => window.removeEventListener(type, listener, options));
  });
}

// src/hooks/use-outside-click.ts
var MOVE_THRESHOLD_PX = 30;
function useOutsideClick(containers, cb, enabled = (0, import_vue7.computed)(() => true)) {
  function handleOutsideClick(event, resolveTarget) {
    if (event.defaultPrevented)
      return;
    let target = resolveTarget(event);
    if (target === null) {
      return;
    }
    if (!target.getRootNode().contains(target))
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
      let domNode = container instanceof HTMLElement ? container : dom(container);
      if (domNode == null ? void 0 : domNode.contains(target)) {
        return;
      }
      if (event.composed && event.composedPath().includes(domNode)) {
        return;
      }
    }
    if (
      // This check allows us to know whether or not we clicked on a "focusable" element like a
      // button or an input. This is a backwards compatibility check so that you can open a <Menu
      // /> and click on another <Menu /> which should close Menu A and open Menu B. We might
      // revisit that so that you will require 2 clicks instead.
      !isFocusableElement(target, 1 /* Loose */) && // This could be improved, but the `Combobox.Button` adds tabIndex={-1} to make it
      // unfocusable via the keyboard so that tabbing to the next item from the input doesn't
      // first go to the button.
      target.tabIndex !== -1
    ) {
      event.preventDefault();
    }
    return cb(event, target);
  }
  let initialClickTarget = (0, import_vue7.ref)(null);
  useDocumentEvent(
    enabled,
    "pointerdown",
    (event) => {
      var _a, _b;
      initialClickTarget.value = ((_b = (_a = event.composedPath) == null ? void 0 : _a.call(event)) == null ? void 0 : _b[0]) || event.target;
    },
    true
  );
  useDocumentEvent(
    enabled,
    "mousedown",
    (event) => {
      var _a, _b;
      initialClickTarget.value = ((_b = (_a = event.composedPath) == null ? void 0 : _a.call(event)) == null ? void 0 : _b[0]) || event.target;
    },
    true
  );
  useDocumentEvent(
    enabled,
    "click",
    (event) => {
      if (isMobile()) {
        return;
      }
      if (!initialClickTarget.value) {
        return;
      }
      handleOutsideClick(event, () => {
        return initialClickTarget.value;
      });
      initialClickTarget.value = null;
    },
    // We will use the `capture` phase so that layers in between with `event.stopPropagation()`
    // don't "cancel" this outside click check. E.g.: A `Menu` inside a `DialogPanel` if the `Menu`
    // is open, and you click outside of it in the `DialogPanel` the `Menu` should close. However,
    // the `DialogPanel` has a `onClick(e) { e.stopPropagation() }` which would cancel this.
    true
  );
  let startPosition = { x: 0, y: 0 };
  useDocumentEvent(
    enabled,
    "touchstart",
    (event) => {
      startPosition.x = event.touches[0].clientX;
      startPosition.y = event.touches[0].clientY;
    },
    true
  );
  useDocumentEvent(
    enabled,
    "touchend",
    (event) => {
      let endPosition = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
      if (Math.abs(endPosition.x - startPosition.x) >= MOVE_THRESHOLD_PX || Math.abs(endPosition.y - startPosition.y) >= MOVE_THRESHOLD_PX) {
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
    enabled,
    "blur",
    (event) => {
      return handleOutsideClick(event, () => {
        return window.document.activeElement instanceof HTMLIFrameElement ? window.document.activeElement : null;
      });
    },
    true
  );
}

// src/hooks/use-resolve-button-type.ts
var import_vue8 = require("vue");
function resolveType(type, as) {
  if (type)
    return type;
  let tag = as != null ? as : "button";
  if (typeof tag === "string" && tag.toLowerCase() === "button")
    return "button";
  return void 0;
}
function useResolveButtonType(data, refElement) {
  let type = (0, import_vue8.ref)(resolveType(data.value.type, data.value.as));
  (0, import_vue8.onMounted)(() => {
    type.value = resolveType(data.value.type, data.value.as);
  });
  (0, import_vue8.watchEffect)(() => {
    var _a;
    if (type.value)
      return;
    if (!dom(refElement))
      return;
    if (dom(refElement) instanceof HTMLButtonElement && !((_a = dom(refElement)) == null ? void 0 : _a.hasAttribute("type"))) {
      type.value = "button";
    }
  });
  return type;
}

// src/hooks/use-tracked-pointer.ts
var import_vue9 = require("vue");
function eventToPosition(evt) {
  return [evt.screenX, evt.screenY];
}
function useTrackedPointer() {
  let lastPos = (0, import_vue9.ref)([-1, -1]);
  return {
    wasMoved(evt) {
      if (typeof process !== "undefined" && false) {
        return true;
      }
      let newPos = eventToPosition(evt);
      if (lastPos.value[0] === newPos[0] && lastPos.value[1] === newPos[1]) {
        return false;
      }
      lastPos.value = newPos;
      return true;
    },
    update(evt) {
      lastPos.value = eventToPosition(evt);
    }
  };
}

// src/hooks/use-tree-walker.ts
var import_vue10 = require("vue");
function useTreeWalker({
  container,
  accept,
  walk,
  enabled
}) {
  (0, import_vue10.watchEffect)(() => {
    let root = container.value;
    if (!root)
      return;
    if (enabled !== void 0 && !enabled.value)
      return;
    let ownerDocument = getOwnerDocument(container);
    if (!ownerDocument)
      return;
    let acceptNode = Object.assign((node) => accept(node), { acceptNode: accept });
    let walker = ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      acceptNode,
      // @ts-expect-error This `false` is a simple small fix for older browsers
      false
    );
    while (walker.nextNode())
      walk(walker.currentNode);
  });
}

// src/internal/hidden.ts
var import_vue12 = require("vue");

// src/utils/render.ts
var import_vue11 = require("vue");
function render({
  visible = true,
  features = 0 /* None */,
  ourProps,
  theirProps,
  ...main
}) {
  var _a;
  let props = mergeProps(theirProps, ourProps);
  let mainWithProps = Object.assign(main, { props });
  if (visible)
    return _render(mainWithProps);
  if (features & 2 /* Static */) {
    if (props.static)
      return _render(mainWithProps);
  }
  if (features & 1 /* RenderStrategy */) {
    let strategy = ((_a = props.unmount) != null ? _a : true) ? 0 /* Unmount */ : 1 /* Hidden */;
    return match(strategy, {
      [0 /* Unmount */]() {
        return null;
      },
      [1 /* Hidden */]() {
        return _render({
          ...main,
          props: { ...props, hidden: true, style: { display: "none" } }
        });
      }
    });
  }
  return _render(mainWithProps);
}
function _render({
  props,
  attrs,
  slots,
  slot,
  name
}) {
  var _a, _b;
  let { as, ...incomingProps } = omit(props, ["unmount", "static"]);
  let children = (_a = slots.default) == null ? void 0 : _a.call(slots, slot);
  let dataAttributes = {};
  if (slot) {
    let exposeState = false;
    let states = [];
    for (let [k, v] of Object.entries(slot)) {
      if (typeof v === "boolean") {
        exposeState = true;
      }
      if (v === true) {
        states.push(k);
      }
    }
    if (exposeState)
      dataAttributes[`data-headlessui-state`] = states.join(" ");
  }
  if (as === "template") {
    children = flattenFragments(children != null ? children : []);
    if (Object.keys(incomingProps).length > 0 || Object.keys(attrs).length > 0) {
      let [firstChild, ...other] = children != null ? children : [];
      if (!isValidElement(firstChild) || other.length > 0) {
        throw new Error(
          [
            'Passing props on "template"!',
            "",
            `The current component <${name} /> is rendering a "template".`,
            `However we need to passthrough the following props:`,
            Object.keys(incomingProps).concat(Object.keys(attrs)).map((name2) => name2.trim()).filter((current, idx, all) => all.indexOf(current) === idx).sort((a, z) => a.localeCompare(z)).map((line) => `  - ${line}`).join("\n"),
            "",
            "You can apply a few solutions:",
            [
              'Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
              "Render a single element as the child so that we can forward the props onto that element."
            ].map((line) => `  - ${line}`).join("\n")
          ].join("\n")
        );
      }
      let mergedProps = mergeProps((_b = firstChild.props) != null ? _b : {}, incomingProps, dataAttributes);
      let cloned = (0, import_vue11.cloneVNode)(firstChild, mergedProps, true);
      for (let prop in mergedProps) {
        if (prop.startsWith("on")) {
          cloned.props || (cloned.props = {});
          cloned.props[prop] = mergedProps[prop];
        }
      }
      return cloned;
    }
    if (Array.isArray(children) && children.length === 1) {
      return children[0];
    }
    return children;
  }
  return (0, import_vue11.h)(as, Object.assign({}, incomingProps, dataAttributes), {
    default: () => children
  });
}
function flattenFragments(children) {
  return children.flatMap((child) => {
    if (child.type === import_vue11.Fragment) {
      return flattenFragments(child.children);
    }
    return [child];
  });
}
function mergeProps(...listOfProps) {
  var _a;
  if (listOfProps.length === 0)
    return {};
  if (listOfProps.length === 1)
    return listOfProps[0];
  let target = {};
  let eventHandlers = {};
  for (let props of listOfProps) {
    for (let prop in props) {
      if (prop.startsWith("on") && typeof props[prop] === "function") {
        (_a = eventHandlers[prop]) != null ? _a : eventHandlers[prop] = [];
        eventHandlers[prop].push(props[prop]);
      } else {
        target[prop] = props[prop];
      }
    }
  }
  if (target.disabled || target["aria-disabled"]) {
    return Object.assign(
      target,
      // Set all event listeners that we collected to `undefined`. This is
      // important because of the `cloneElement` from above, which merges the
      // existing and new props, they don't just override therefore we have to
      // explicitly nullify them.
      Object.fromEntries(Object.keys(eventHandlers).map((eventName) => [eventName, void 0]))
    );
  }
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](event, ...args) {
        let handlers = eventHandlers[eventName];
        for (let handler of handlers) {
          if (event instanceof Event && event.defaultPrevented) {
            return;
          }
          handler(event, ...args);
        }
      }
    });
  }
  return target;
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
function isValidElement(input) {
  if (input == null)
    return false;
  if (typeof input.type === "string")
    return true;
  if (typeof input.type === "object")
    return true;
  if (typeof input.type === "function")
    return true;
  return false;
}

// src/internal/hidden.ts
var Hidden = (0, import_vue12.defineComponent)({
  name: "Hidden",
  props: {
    as: { type: [Object, String], default: "div" },
    features: { type: Number, default: 1 /* None */ }
  },
  setup(props, { slots, attrs }) {
    return () => {
      var _a;
      let { features, ...theirProps } = props;
      let ourProps = {
        "aria-hidden": (features & 2 /* Focusable */) === 2 /* Focusable */ ? true : (
          // @ts-ignore
          (_a = theirProps["aria-hidden"]) != null ? _a : void 0
        ),
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
          ...(features & 4 /* Hidden */) === 4 /* Hidden */ && !((features & 2 /* Focusable */) === 2 /* Focusable */) && { display: "none" }
        }
      };
      return render({
        ourProps,
        theirProps,
        slot: {},
        attrs,
        slots,
        name: "Hidden"
      });
    };
  }
});

// src/internal/open-closed.ts
var import_vue13 = require("vue");
var Context = Symbol("Context");
function hasOpenClosed() {
  return useOpenClosed() !== null;
}
function useOpenClosed() {
  return (0, import_vue13.inject)(Context, null);
}
function useOpenClosedProvider(value) {
  (0, import_vue13.provide)(Context, value);
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
  var _a, _b;
  let form = (_a = elementInForm == null ? void 0 : elementInForm.form) != null ? _a : elementInForm.closest("form");
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
  (_b = form.requestSubmit) == null ? void 0 : _b.call(form);
}

// src/components/combobox/combobox.ts
function defaultComparator(a, z) {
  return a === z;
}
var ComboboxContext = Symbol("ComboboxContext");
function useComboboxContext(component) {
  let context = (0, import_vue14.inject)(ComboboxContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useComboboxContext);
    throw err;
  }
  return context;
}
var VirtualContext = Symbol("VirtualContext");
var VirtualProvider = (0, import_vue14.defineComponent)({
  name: "VirtualProvider",
  setup(_, { slots }) {
    let api = useComboboxContext("VirtualProvider");
    let padding = (0, import_vue14.computed)(() => {
      let el = dom(api.optionsRef);
      if (!el)
        return { start: 0, end: 0 };
      let styles = window.getComputedStyle(el);
      return {
        start: parseFloat(styles.paddingBlockStart || styles.paddingTop),
        end: parseFloat(styles.paddingBlockEnd || styles.paddingBottom)
      };
    });
    let virtualizer = useVirtualizer(
      (0, import_vue14.computed)(() => {
        return {
          scrollPaddingStart: padding.value.start,
          scrollPaddingEnd: padding.value.end,
          count: api.virtual.value.options.length,
          estimateSize() {
            return 40;
          },
          getScrollElement() {
            return dom(api.optionsRef);
          },
          overscan: 12
        };
      })
    );
    let options = (0, import_vue14.computed)(() => {
      var _a;
      return (_a = api.virtual.value) == null ? void 0 : _a.options;
    });
    let baseKey = (0, import_vue14.ref)(0);
    (0, import_vue14.watch)([options], () => {
      baseKey.value += 1;
    });
    (0, import_vue14.provide)(VirtualContext, api.virtual.value ? virtualizer : null);
    return () => {
      return [
        (0, import_vue14.h)(
          "div",
          {
            style: {
              position: "relative",
              width: "100%",
              height: `${virtualizer.value.getTotalSize()}px`
            },
            ref: (el) => {
              if (!el) {
                return;
              }
              if (api.activationTrigger.value === 0 /* Pointer */) {
                return;
              }
              if (api.activeOptionIndex.value !== null && api.virtual.value.options.length > api.activeOptionIndex.value) {
                virtualizer.value.scrollToIndex(api.activeOptionIndex.value);
              }
            }
          },
          virtualizer.value.getVirtualItems().map((item) => {
            return (0, import_vue14.cloneVNode)(
              slots.default({
                option: api.virtual.value.options[item.index],
                open: api.comboboxState.value === 0 /* Open */
              })[0],
              {
                key: `${baseKey.value}-${item.index}`,
                "data-index": item.index,
                "aria-setsize": api.virtual.value.options.length,
                "aria-posinset": item.index + 1,
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translateY(${item.start}px)`,
                  overflowAnchor: "none"
                }
              }
            );
          })
        )
      ];
    };
  }
});
var Combobox = (0, import_vue14.defineComponent)({
  name: "Combobox",
  emits: { "update:modelValue": (_value) => true },
  props: {
    as: { type: [Object, String], default: "template" },
    disabled: { type: [Boolean], default: false },
    by: { type: [String, Function], nullable: true, default: null },
    modelValue: {
      type: [Object, String, Number, Boolean],
      default: void 0
    },
    defaultValue: {
      type: [Object, String, Number, Boolean],
      default: void 0
    },
    form: { type: String, optional: true },
    name: { type: String, optional: true },
    nullable: { type: Boolean, default: false },
    multiple: { type: [Boolean], default: false },
    immediate: { type: [Boolean], default: false },
    virtual: {
      type: Object,
      default: null
    }
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, emit }) {
    let comboboxState = (0, import_vue14.ref)(1 /* Closed */);
    let labelRef = (0, import_vue14.ref)(null);
    let inputRef = (0, import_vue14.ref)(null);
    let buttonRef = (0, import_vue14.ref)(null);
    let optionsRef = (0, import_vue14.ref)(
      null
    );
    let optionsPropsRef = (0, import_vue14.ref)({
      static: false,
      hold: false
    });
    let options = (0, import_vue14.ref)([]);
    let activeOptionIndex = (0, import_vue14.ref)(null);
    let activationTrigger = (0, import_vue14.ref)(
      2 /* Other */
    );
    let defaultToFirstOption = (0, import_vue14.ref)(false);
    function adjustOrderedState(adjustment = (i) => i) {
      let currentActiveOption = activeOptionIndex.value !== null ? options.value[activeOptionIndex.value] : null;
      let list = adjustment(options.value.slice());
      let sortedOptions = list.length > 0 && list[0].dataRef.order.value !== null ? (
        // Prefer sorting based on the `order`
        list.sort((a, z) => a.dataRef.order.value - z.dataRef.order.value)
      ) : (
        // Fallback to much slower DOM order
        sortByDomNode(list, (option) => dom(option.dataRef.domRef))
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
    let mode = (0, import_vue14.computed)(() => props.multiple ? 1 /* Multi */ : 0 /* Single */);
    let nullable = (0, import_vue14.computed)(() => props.nullable);
    let [directValue, theirOnChange] = useControllable(
      (0, import_vue14.computed)(() => props.modelValue),
      (value2) => emit("update:modelValue", value2),
      (0, import_vue14.computed)(() => props.defaultValue)
    );
    let value = (0, import_vue14.computed)(
      () => directValue.value === void 0 ? match(mode.value, {
        [1 /* Multi */]: [],
        [0 /* Single */]: void 0
      }) : directValue.value
    );
    let goToOptionRaf = null;
    let orderOptionsRaf = null;
    function onChange(value2) {
      return match(mode.value, {
        [0 /* Single */]() {
          return theirOnChange == null ? void 0 : theirOnChange(value2);
        },
        [1 /* Multi */]: () => {
          let copy = (0, import_vue14.toRaw)(api.value.value).slice();
          let raw = (0, import_vue14.toRaw)(value2);
          let idx = copy.findIndex((value3) => api.compare(raw, (0, import_vue14.toRaw)(value3)));
          if (idx === -1) {
            copy.push(raw);
          } else {
            copy.splice(idx, 1);
          }
          return theirOnChange == null ? void 0 : theirOnChange(copy);
        }
      });
    }
    let virtualOptions = (0, import_vue14.computed)(() => {
      var _a;
      return (_a = props.virtual) == null ? void 0 : _a.options;
    });
    (0, import_vue14.watch)([virtualOptions], ([newOptions], [oldOptions]) => {
      if (!api.virtual.value)
        return;
      if (!newOptions)
        return;
      if (!oldOptions)
        return;
      if (activeOptionIndex.value !== null) {
        let idx = newOptions.indexOf(oldOptions[activeOptionIndex.value]);
        if (idx !== -1) {
          activeOptionIndex.value = idx;
        } else {
          activeOptionIndex.value = null;
        }
      }
    });
    let api = {
      comboboxState,
      value,
      mode,
      compare(a, z) {
        if (typeof props.by === "string") {
          let property = props.by;
          return (a == null ? void 0 : a[property]) === (z == null ? void 0 : z[property]);
        }
        if (props.by === null) {
          return defaultComparator(a, z);
        }
        return props.by(a, z);
      },
      calculateIndex(value2) {
        if (api.virtual.value) {
          if (props.by === null) {
            return api.virtual.value.options.indexOf(value2);
          } else {
            return api.virtual.value.options.findIndex((other) => api.compare(other, value2));
          }
        } else {
          return options.value.findIndex((other) => api.compare(other.dataRef.value, value2));
        }
      },
      defaultValue: (0, import_vue14.computed)(() => props.defaultValue),
      nullable,
      immediate: (0, import_vue14.computed)(() => props.immediate),
      virtual: (0, import_vue14.computed)(() => {
        var _a;
        return props.virtual ? {
          options: props.virtual.options,
          disabled: (_a = props.virtual.disabled) != null ? _a : () => false
        } : null;
      }),
      inputRef,
      labelRef,
      buttonRef,
      optionsRef,
      disabled: (0, import_vue14.computed)(() => props.disabled),
      // @ts-expect-error dateRef types are incorrect due to unwrapped or wrapped refs
      options,
      change(value2) {
        theirOnChange(value2);
      },
      activeOptionIndex: (0, import_vue14.computed)(() => {
        if (defaultToFirstOption.value && activeOptionIndex.value === null && (api.virtual.value ? api.virtual.value.options.length > 0 : options.value.length > 0)) {
          if (api.virtual.value) {
            let localActiveOptionIndex2 = api.virtual.value.options.findIndex(
              (option) => {
                var _a;
                return !((_a = api.virtual.value) == null ? void 0 : _a.disabled(option));
              }
            );
            if (localActiveOptionIndex2 !== -1) {
              return localActiveOptionIndex2;
            }
          }
          let localActiveOptionIndex = options.value.findIndex((option) => !option.dataRef.disabled);
          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex;
          }
        }
        return activeOptionIndex.value;
      }),
      activationTrigger,
      optionsPropsRef,
      closeCombobox() {
        defaultToFirstOption.value = false;
        if (props.disabled)
          return;
        if (comboboxState.value === 1 /* Closed */)
          return;
        comboboxState.value = 1 /* Closed */;
        activeOptionIndex.value = null;
      },
      openCombobox() {
        defaultToFirstOption.value = true;
        if (props.disabled)
          return;
        if (comboboxState.value === 0 /* Open */)
          return;
        if (api.value.value) {
          let idx = api.calculateIndex(api.value.value);
          if (idx !== -1) {
            activeOptionIndex.value = idx;
          }
        }
        comboboxState.value = 0 /* Open */;
      },
      setActivationTrigger(trigger) {
        activationTrigger.value = trigger;
      },
      goToOption(focus, idx, trigger) {
        defaultToFirstOption.value = false;
        if (goToOptionRaf !== null) {
          cancelAnimationFrame(goToOptionRaf);
        }
        goToOptionRaf = requestAnimationFrame(() => {
          if (props.disabled)
            return;
          if (optionsRef.value && !optionsPropsRef.value.static && comboboxState.value === 1 /* Closed */) {
            return;
          }
          if (api.virtual.value) {
            activeOptionIndex.value = focus === 4 /* Specific */ ? idx : calculateActiveIndex(
              { focus },
              {
                resolveItems: () => api.virtual.value.options,
                resolveActiveIndex: () => {
                  var _a, _b;
                  return (_b = (_a = api.activeOptionIndex.value) != null ? _a : api.virtual.value.options.findIndex(
                    (option) => {
                      var _a2;
                      return !((_a2 = api.virtual.value) == null ? void 0 : _a2.disabled(option));
                    }
                  )) != null ? _b : null;
                },
                resolveDisabled: (item) => api.virtual.value.disabled(item),
                resolveId() {
                  throw new Error("Function not implemented.");
                }
              }
            );
            activationTrigger.value = trigger != null ? trigger : 2 /* Other */;
            return;
          }
          let adjustedState = adjustOrderedState();
          if (adjustedState.activeOptionIndex === null) {
            let localActiveOptionIndex = adjustedState.options.findIndex(
              (option) => !option.dataRef.disabled
            );
            if (localActiveOptionIndex !== -1) {
              adjustedState.activeOptionIndex = localActiveOptionIndex;
            }
          }
          let nextActiveOptionIndex = focus === 4 /* Specific */ ? idx : calculateActiveIndex(
            { focus },
            {
              resolveItems: () => adjustedState.options,
              resolveActiveIndex: () => adjustedState.activeOptionIndex,
              resolveId: (option) => option.id,
              resolveDisabled: (option) => option.dataRef.disabled
            }
          );
          activeOptionIndex.value = nextActiveOptionIndex;
          activationTrigger.value = trigger != null ? trigger : 2 /* Other */;
          options.value = adjustedState.options;
        });
      },
      selectOption(id2) {
        let option = options.value.find((item) => item.id === id2);
        if (!option)
          return;
        let { dataRef } = option;
        onChange(dataRef.value);
      },
      selectActiveOption() {
        if (api.activeOptionIndex.value === null)
          return;
        if (api.virtual.value) {
          onChange(api.virtual.value.options[api.activeOptionIndex.value]);
        } else {
          let { dataRef } = options.value[api.activeOptionIndex.value];
          onChange(dataRef.value);
        }
        api.goToOption(4 /* Specific */, api.activeOptionIndex.value);
      },
      registerOption(id2, dataRef) {
        let option = (0, import_vue14.reactive)({ id: id2, dataRef });
        if (api.virtual.value) {
          options.value.push(option);
          return;
        }
        if (orderOptionsRaf)
          cancelAnimationFrame(orderOptionsRaf);
        let adjustedState = adjustOrderedState((options2) => {
          options2.push(option);
          return options2;
        });
        if (activeOptionIndex.value === null) {
          if (api.isSelected(dataRef.value.value)) {
            adjustedState.activeOptionIndex = adjustedState.options.indexOf(option);
          }
        }
        options.value = adjustedState.options;
        activeOptionIndex.value = adjustedState.activeOptionIndex;
        activationTrigger.value = 2 /* Other */;
        if (adjustedState.options.some((option2) => !dom(option2.dataRef.domRef))) {
          orderOptionsRaf = requestAnimationFrame(() => {
            let adjustedState2 = adjustOrderedState();
            options.value = adjustedState2.options;
            activeOptionIndex.value = adjustedState2.activeOptionIndex;
          });
        }
      },
      unregisterOption(id2, active) {
        if (goToOptionRaf !== null) {
          cancelAnimationFrame(goToOptionRaf);
        }
        if (active) {
          defaultToFirstOption.value = true;
        }
        if (api.virtual.value) {
          options.value = options.value.filter((option) => option.id !== id2);
          return;
        }
        let adjustedState = adjustOrderedState((options2) => {
          let idx = options2.findIndex((option) => option.id === id2);
          if (idx !== -1)
            options2.splice(idx, 1);
          return options2;
        });
        options.value = adjustedState.options;
        activeOptionIndex.value = adjustedState.activeOptionIndex;
        activationTrigger.value = 2 /* Other */;
      },
      isSelected(other) {
        return match(mode.value, {
          [0 /* Single */]: () => api.compare((0, import_vue14.toRaw)(api.value.value), (0, import_vue14.toRaw)(other)),
          [1 /* Multi */]: () => (0, import_vue14.toRaw)(api.value.value).some(
            (option) => api.compare((0, import_vue14.toRaw)(option), (0, import_vue14.toRaw)(other))
          )
        });
      },
      isActive(other) {
        return activeOptionIndex.value === api.calculateIndex(other);
      }
    };
    useOutsideClick(
      [inputRef, buttonRef, optionsRef],
      () => api.closeCombobox(),
      (0, import_vue14.computed)(() => comboboxState.value === 0 /* Open */)
    );
    (0, import_vue14.provide)(ComboboxContext, api);
    useOpenClosedProvider(
      (0, import_vue14.computed)(
        () => match(comboboxState.value, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        })
      )
    );
    let form = (0, import_vue14.computed)(() => {
      var _a;
      return (_a = dom(inputRef)) == null ? void 0 : _a.closest("form");
    });
    (0, import_vue14.onMounted)(() => {
      (0, import_vue14.watch)(
        [form],
        () => {
          if (!form.value)
            return;
          if (props.defaultValue === void 0)
            return;
          function handle() {
            api.change(props.defaultValue);
          }
          form.value.addEventListener("reset", handle);
          return () => {
            var _a;
            (_a = form.value) == null ? void 0 : _a.removeEventListener("reset", handle);
          };
        },
        { immediate: true }
      );
    });
    return () => {
      var _a, _b, _c;
      let { name, disabled, form: form2, ...theirProps } = props;
      let slot = {
        open: comboboxState.value === 0 /* Open */,
        disabled,
        activeIndex: api.activeOptionIndex.value,
        activeOption: api.activeOptionIndex.value === null ? null : api.virtual.value ? api.virtual.value.options[(_a = api.activeOptionIndex.value) != null ? _a : 0] : (_c = (_b = api.options.value[api.activeOptionIndex.value]) == null ? void 0 : _b.dataRef.value) != null ? _c : null,
        value: value.value
      };
      return (0, import_vue14.h)(import_vue14.Fragment, [
        ...name != null && value.value != null ? objectToFormEntries({ [name]: value.value }).map(([name2, value2]) => {
          return (0, import_vue14.h)(
            Hidden,
            compact({
              features: 4 /* Hidden */,
              key: name2,
              as: "input",
              type: "hidden",
              hidden: true,
              readOnly: true,
              form: form2,
              disabled,
              name: name2,
              value: value2
            })
          );
        }) : [],
        render({
          theirProps: {
            ...attrs,
            ...omit(theirProps, [
              "by",
              "defaultValue",
              "immediate",
              "modelValue",
              "multiple",
              "nullable",
              "onUpdate:modelValue",
              "virtual"
            ])
          },
          ourProps: {},
          slot,
          slots,
          attrs,
          name: "Combobox"
        })
      ]);
    };
  }
});
var ComboboxLabel = (0, import_vue14.defineComponent)({
  name: "ComboboxLabel",
  props: {
    as: { type: [Object, String], default: "label" },
    id: { type: String, default: () => `headlessui-combobox-label-${useId()}` }
  },
  setup(props, { attrs, slots }) {
    let api = useComboboxContext("ComboboxLabel");
    function handleClick() {
      var _a;
      (_a = dom(api.inputRef)) == null ? void 0 : _a.focus({ preventScroll: true });
    }
    return () => {
      let slot = {
        open: api.comboboxState.value === 0 /* Open */,
        disabled: api.disabled.value
      };
      let { id: id2, ...theirProps } = props;
      let ourProps = { id: id2, ref: api.labelRef, onClick: handleClick };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "ComboboxLabel"
      });
    };
  }
});
var ComboboxButton = (0, import_vue14.defineComponent)({
  name: "ComboboxButton",
  props: {
    as: { type: [Object, String], default: "button" },
    id: { type: String, default: () => `headlessui-combobox-button-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useComboboxContext("ComboboxButton");
    expose({ el: api.buttonRef, $el: api.buttonRef });
    function handleClick(event) {
      if (api.disabled.value)
        return;
      if (api.comboboxState.value === 0 /* Open */) {
        api.closeCombobox();
      } else {
        event.preventDefault();
        api.openCombobox();
      }
      (0, import_vue14.nextTick)(() => {
        var _a;
        return (_a = dom(api.inputRef)) == null ? void 0 : _a.focus({ preventScroll: true });
      });
    }
    function handleKeydown(event) {
      switch (event.key) {
        case "ArrowDown" /* ArrowDown */:
          event.preventDefault();
          event.stopPropagation();
          if (api.comboboxState.value === 1 /* Closed */) {
            api.openCombobox();
          }
          (0, import_vue14.nextTick)(() => {
            var _a;
            return (_a = api.inputRef.value) == null ? void 0 : _a.focus({ preventScroll: true });
          });
          return;
        case "ArrowUp" /* ArrowUp */:
          event.preventDefault();
          event.stopPropagation();
          if (api.comboboxState.value === 1 /* Closed */) {
            api.openCombobox();
            (0, import_vue14.nextTick)(() => {
              if (!api.value.value) {
                api.goToOption(3 /* Last */);
              }
            });
          }
          (0, import_vue14.nextTick)(() => {
            var _a;
            return (_a = api.inputRef.value) == null ? void 0 : _a.focus({ preventScroll: true });
          });
          return;
        case "Escape" /* Escape */:
          if (api.comboboxState.value !== 0 /* Open */)
            return;
          event.preventDefault();
          if (api.optionsRef.value && !api.optionsPropsRef.value.static) {
            event.stopPropagation();
          }
          api.closeCombobox();
          (0, import_vue14.nextTick)(() => {
            var _a;
            return (_a = api.inputRef.value) == null ? void 0 : _a.focus({ preventScroll: true });
          });
          return;
      }
    }
    let type = useResolveButtonType(
      (0, import_vue14.computed)(() => ({ as: props.as, type: attrs.type })),
      api.buttonRef
    );
    return () => {
      var _a, _b;
      let slot = {
        open: api.comboboxState.value === 0 /* Open */,
        disabled: api.disabled.value,
        value: api.value.value
      };
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        ref: api.buttonRef,
        id: id2,
        type: type.value,
        tabindex: "-1",
        "aria-haspopup": "listbox",
        "aria-controls": (_a = dom(api.optionsRef)) == null ? void 0 : _a.id,
        "aria-expanded": api.comboboxState.value === 0 /* Open */,
        "aria-labelledby": api.labelRef.value ? [(_b = dom(api.labelRef)) == null ? void 0 : _b.id, id2].join(" ") : void 0,
        disabled: api.disabled.value === true ? true : void 0,
        onKeydown: handleKeydown,
        onClick: handleClick
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "ComboboxButton"
      });
    };
  }
});
var ComboboxInput = (0, import_vue14.defineComponent)({
  name: "ComboboxInput",
  props: {
    as: { type: [Object, String], default: "input" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    displayValue: { type: Function },
    defaultValue: { type: String, default: void 0 },
    id: { type: String, default: () => `headlessui-combobox-input-${useId()}` },
    autocomplete: {
      type: String,
      default: "off"
    }
  },
  emits: {
    change: (_value) => true
  },
  setup(props, { emit, attrs, slots, expose }) {
    let api = useComboboxContext("ComboboxInput");
    let ownerDocument = (0, import_vue14.computed)(() => getOwnerDocument(dom(api.inputRef)));
    let isTyping = { value: false };
    expose({ el: api.inputRef, $el: api.inputRef });
    function clear() {
      api.change(null);
      let options = dom(api.optionsRef);
      if (options) {
        options.scrollTop = 0;
      }
      api.goToOption(5 /* Nothing */);
    }
    let currentDisplayValue = (0, import_vue14.computed)(() => {
      var _a;
      let value = api.value.value;
      if (!dom(api.inputRef))
        return "";
      if (typeof props.displayValue !== "undefined" && value !== void 0) {
        return (_a = props.displayValue(value)) != null ? _a : "";
      } else if (typeof value === "string") {
        return value;
      } else {
        return "";
      }
    });
    (0, import_vue14.onMounted)(() => {
      (0, import_vue14.watch)(
        [currentDisplayValue, api.comboboxState, ownerDocument],
        ([currentDisplayValue2, state], [oldCurrentDisplayValue, oldState]) => {
          if (isTyping.value)
            return;
          let input = dom(api.inputRef);
          if (!input)
            return;
          input.autocomplete = props.autocomplete;
          if (oldState === 0 /* Open */ && state === 1 /* Closed */) {
            input.value = currentDisplayValue2;
          } else if (currentDisplayValue2 !== oldCurrentDisplayValue) {
            input.value = currentDisplayValue2;
          }
          requestAnimationFrame(() => {
            var _a;
            if (isTyping.value)
              return;
            if (!input)
              return;
            if (((_a = ownerDocument.value) == null ? void 0 : _a.activeElement) !== input)
              return;
            let { selectionStart, selectionEnd } = input;
            if (Math.abs((selectionEnd != null ? selectionEnd : 0) - (selectionStart != null ? selectionStart : 0)) !== 0)
              return;
            if (selectionStart !== 0)
              return;
            input.setSelectionRange(input.value.length, input.value.length);
          });
        },
        { immediate: true }
      );
      (0, import_vue14.watch)([api.comboboxState], ([newState], [oldState]) => {
        if (newState === 0 /* Open */ && oldState === 1 /* Closed */) {
          if (isTyping.value)
            return;
          let input = dom(api.inputRef);
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
      });
    });
    let isComposing = (0, import_vue14.ref)(false);
    function handleCompositionstart() {
      isComposing.value = true;
    }
    function handleCompositionend() {
      disposables().nextFrame(() => {
        isComposing.value = false;
      });
    }
    let debounce = useFrameDebounce();
    function handleKeyDown(event) {
      isTyping.value = true;
      debounce(() => {
        if (isComposing.value)
          return;
        isTyping.value = false;
      });
      switch (event.key) {
        case "Enter" /* Enter */:
          isTyping.value = false;
          if (api.comboboxState.value !== 0 /* Open */)
            return;
          if (isComposing.value)
            return;
          event.preventDefault();
          event.stopPropagation();
          if (api.activeOptionIndex.value === null) {
            api.closeCombobox();
            return;
          }
          api.selectActiveOption();
          if (api.mode.value === 0 /* Single */) {
            api.closeCombobox();
          }
          break;
        case "ArrowDown" /* ArrowDown */:
          isTyping.value = false;
          event.preventDefault();
          event.stopPropagation();
          return match(api.comboboxState.value, {
            [0 /* Open */]: () => api.goToOption(2 /* Next */),
            [1 /* Closed */]: () => api.openCombobox()
          });
        case "ArrowUp" /* ArrowUp */:
          isTyping.value = false;
          event.preventDefault();
          event.stopPropagation();
          return match(api.comboboxState.value, {
            [0 /* Open */]: () => api.goToOption(1 /* Previous */),
            [1 /* Closed */]: () => {
              api.openCombobox();
              (0, import_vue14.nextTick)(() => {
                if (!api.value.value) {
                  api.goToOption(3 /* Last */);
                }
              });
            }
          });
        case "Home" /* Home */:
          if (event.shiftKey) {
            break;
          }
          isTyping.value = false;
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(0 /* First */);
        case "PageUp" /* PageUp */:
          isTyping.value = false;
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(0 /* First */);
        case "End" /* End */:
          if (event.shiftKey) {
            break;
          }
          isTyping.value = false;
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(3 /* Last */);
        case "PageDown" /* PageDown */:
          isTyping.value = false;
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(3 /* Last */);
        case "Escape" /* Escape */:
          isTyping.value = false;
          if (api.comboboxState.value !== 0 /* Open */)
            return;
          event.preventDefault();
          if (api.optionsRef.value && !api.optionsPropsRef.value.static) {
            event.stopPropagation();
          }
          if (api.nullable.value && api.mode.value === 0 /* Single */) {
            if (api.value.value === null) {
              clear();
            }
          }
          api.closeCombobox();
          break;
        case "Tab" /* Tab */:
          isTyping.value = false;
          if (api.comboboxState.value !== 0 /* Open */)
            return;
          if (api.mode.value === 0 /* Single */ && api.activationTrigger.value !== 1 /* Focus */) {
            api.selectActiveOption();
          }
          api.closeCombobox();
          break;
      }
    }
    function handleInput(event) {
      emit("change", event);
      if (api.nullable.value && api.mode.value === 0 /* Single */) {
        if (event.target.value === "") {
          clear();
        }
      }
      api.openCombobox();
    }
    function handleBlur(event) {
      var _a, _b, _c;
      let relatedTarget = (_a = event.relatedTarget) != null ? _a : history.find((x) => x !== event.currentTarget);
      isTyping.value = false;
      if ((_b = dom(api.optionsRef)) == null ? void 0 : _b.contains(relatedTarget)) {
        return;
      }
      if ((_c = dom(api.buttonRef)) == null ? void 0 : _c.contains(relatedTarget)) {
        return;
      }
      if (api.comboboxState.value !== 0 /* Open */)
        return;
      event.preventDefault();
      if (api.mode.value === 0 /* Single */) {
        if (api.nullable.value && api.value.value === null) {
          clear();
        } else if (api.activationTrigger.value !== 1 /* Focus */) {
          api.selectActiveOption();
        }
      }
      return api.closeCombobox();
    }
    function handleFocus(event) {
      var _a, _b, _c;
      let relatedTarget = (_a = event.relatedTarget) != null ? _a : history.find((x) => x !== event.currentTarget);
      if ((_b = dom(api.buttonRef)) == null ? void 0 : _b.contains(relatedTarget))
        return;
      if ((_c = dom(api.optionsRef)) == null ? void 0 : _c.contains(relatedTarget))
        return;
      if (api.disabled.value)
        return;
      if (!api.immediate.value)
        return;
      if (api.comboboxState.value === 0 /* Open */)
        return;
      api.openCombobox();
      disposables().nextFrame(() => {
        api.setActivationTrigger(1 /* Focus */);
      });
    }
    let defaultValue = (0, import_vue14.computed)(() => {
      var _a, _b, _c, _d;
      return (_d = (_c = (_b = props.defaultValue) != null ? _b : api.defaultValue.value !== void 0 ? (_a = props.displayValue) == null ? void 0 : _a.call(props, api.defaultValue.value) : null) != null ? _c : api.defaultValue.value) != null ? _d : "";
    });
    return () => {
      var _a, _b, _c, _d, _e, _f, _g;
      let slot = { open: api.comboboxState.value === 0 /* Open */ };
      let { id: id2, displayValue, onChange: _onChange, ...theirProps } = props;
      let ourProps = {
        "aria-controls": (_a = api.optionsRef.value) == null ? void 0 : _a.id,
        "aria-expanded": api.comboboxState.value === 0 /* Open */,
        "aria-activedescendant": api.activeOptionIndex.value === null ? void 0 : api.virtual.value ? (_b = api.options.value.find((option) => {
          return !api.virtual.value.disabled(option.dataRef.value) && api.compare(
            option.dataRef.value,
            api.virtual.value.options[api.activeOptionIndex.value]
          );
        })) == null ? void 0 : _b.id : (_c = api.options.value[api.activeOptionIndex.value]) == null ? void 0 : _c.id,
        "aria-labelledby": (_f = (_d = dom(api.labelRef)) == null ? void 0 : _d.id) != null ? _f : (_e = dom(api.buttonRef)) == null ? void 0 : _e.id,
        "aria-autocomplete": "list",
        id: id2,
        onCompositionstart: handleCompositionstart,
        onCompositionend: handleCompositionend,
        onKeydown: handleKeyDown,
        onInput: handleInput,
        onFocus: handleFocus,
        onBlur: handleBlur,
        role: "combobox",
        type: (_g = attrs.type) != null ? _g : "text",
        tabIndex: 0,
        ref: api.inputRef,
        defaultValue: defaultValue.value,
        disabled: api.disabled.value === true ? true : void 0
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        name: "ComboboxInput"
      });
    };
  }
});
var ComboboxOptions = (0, import_vue14.defineComponent)({
  name: "ComboboxOptions",
  props: {
    as: { type: [Object, String], default: "ul" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    hold: { type: [Boolean], default: false }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useComboboxContext("ComboboxOptions");
    let id2 = `headlessui-combobox-options-${useId()}`;
    expose({ el: api.optionsRef, $el: api.optionsRef });
    (0, import_vue14.watchEffect)(() => {
      api.optionsPropsRef.value.static = props.static;
    });
    (0, import_vue14.watchEffect)(() => {
      api.optionsPropsRef.value.hold = props.hold;
    });
    let usesOpenClosedState = useOpenClosed();
    let visible = (0, import_vue14.computed)(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return api.comboboxState.value === 0 /* Open */;
    });
    useTreeWalker({
      container: (0, import_vue14.computed)(() => dom(api.optionsRef)),
      enabled: (0, import_vue14.computed)(() => api.comboboxState.value === 0 /* Open */),
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
    function handleMouseDown(event) {
      event.preventDefault();
    }
    return () => {
      var _a, _b, _c;
      let slot = { open: api.comboboxState.value === 0 /* Open */ };
      let ourProps = {
        "aria-labelledby": (_c = (_a = dom(api.labelRef)) == null ? void 0 : _a.id) != null ? _c : (_b = dom(api.buttonRef)) == null ? void 0 : _b.id,
        id: id2,
        ref: api.optionsRef,
        role: "listbox",
        "aria-multiselectable": api.mode.value === 1 /* Multi */ ? true : void 0,
        onMousedown: handleMouseDown
      };
      let theirProps = omit(props, ["hold"]);
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots: api.virtual.value && api.comboboxState.value === 0 /* Open */ ? {
          ...slots,
          default: () => [(0, import_vue14.h)(VirtualProvider, {}, slots.default)]
        } : slots,
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        visible: visible.value,
        name: "ComboboxOptions"
      });
    };
  }
});
var ComboboxOption = (0, import_vue14.defineComponent)({
  name: "ComboboxOption",
  props: {
    as: { type: [Object, String], default: "li" },
    value: {
      type: [Object, String, Number, Boolean]
    },
    disabled: { type: Boolean, default: false },
    order: { type: [Number], default: null }
  },
  setup(props, { slots, attrs, expose }) {
    let api = useComboboxContext("ComboboxOption");
    let id2 = `headlessui-combobox-option-${useId()}`;
    let internalOptionRef = (0, import_vue14.ref)(null);
    let disabled = (0, import_vue14.computed)(() => {
      var _a;
      return props.disabled || ((_a = api.virtual.value) == null ? void 0 : _a.disabled(props.value));
    });
    expose({ el: internalOptionRef, $el: internalOptionRef });
    let active = (0, import_vue14.computed)(() => {
      var _a;
      return api.virtual.value ? api.activeOptionIndex.value === api.calculateIndex(props.value) : api.activeOptionIndex.value === null ? false : ((_a = api.options.value[api.activeOptionIndex.value]) == null ? void 0 : _a.id) === id2;
    });
    let selected = (0, import_vue14.computed)(() => api.isSelected(props.value));
    let virtualizer = (0, import_vue14.inject)(VirtualContext, null);
    let dataRef = (0, import_vue14.computed)(() => ({
      disabled: props.disabled,
      value: props.value,
      domRef: internalOptionRef,
      order: (0, import_vue14.computed)(() => props.order)
    }));
    (0, import_vue14.onMounted)(() => api.registerOption(id2, dataRef));
    (0, import_vue14.onUnmounted)(() => api.unregisterOption(id2, active.value));
    (0, import_vue14.watchEffect)(() => {
      let el = dom(internalOptionRef);
      if (!el)
        return;
      virtualizer == null ? void 0 : virtualizer.value.measureElement(el);
    });
    (0, import_vue14.watchEffect)(() => {
      if (api.comboboxState.value !== 0 /* Open */)
        return;
      if (!active.value)
        return;
      if (api.virtual.value)
        return;
      if (api.activationTrigger.value === 0 /* Pointer */)
        return;
      (0, import_vue14.nextTick)(() => {
        var _a, _b;
        return (_b = (_a = dom(internalOptionRef)) == null ? void 0 : _a.scrollIntoView) == null ? void 0 : _b.call(_a, { block: "nearest" });
      });
    });
    function handleMouseDown(event) {
      event.preventDefault();
      if (event.button !== 0 /* Left */) {
        return;
      }
      if (disabled.value)
        return;
      api.selectOption(id2);
      if (!isMobile()) {
        requestAnimationFrame(() => {
          var _a;
          return (_a = dom(api.inputRef)) == null ? void 0 : _a.focus({ preventScroll: true });
        });
      }
      if (api.mode.value === 0 /* Single */) {
        api.closeCombobox();
      }
    }
    function handleFocus() {
      var _a;
      if (props.disabled || ((_a = api.virtual.value) == null ? void 0 : _a.disabled(props.value))) {
        return api.goToOption(5 /* Nothing */);
      }
      let idx = api.calculateIndex(props.value);
      api.goToOption(4 /* Specific */, idx);
    }
    let pointer = useTrackedPointer();
    function handleEnter(evt) {
      pointer.update(evt);
    }
    function handleMove(evt) {
      var _a;
      if (!pointer.wasMoved(evt))
        return;
      if (props.disabled || ((_a = api.virtual.value) == null ? void 0 : _a.disabled(props.value)))
        return;
      if (active.value)
        return;
      let idx = api.calculateIndex(props.value);
      api.goToOption(4 /* Specific */, idx, 0 /* Pointer */);
    }
    function handleLeave(evt) {
      var _a;
      if (!pointer.wasMoved(evt))
        return;
      if (props.disabled || ((_a = api.virtual.value) == null ? void 0 : _a.disabled(props.value)))
        return;
      if (!active.value)
        return;
      if (api.optionsPropsRef.value.hold)
        return;
      api.goToOption(5 /* Nothing */);
    }
    return () => {
      let { disabled: disabled2 } = props;
      let slot = { active: active.value, selected: selected.value, disabled: disabled2 };
      let ourProps = {
        id: id2,
        ref: internalOptionRef,
        role: "option",
        tabIndex: disabled2 === true ? void 0 : -1,
        "aria-disabled": disabled2 === true ? true : void 0,
        // According to the WAI-ARIA best practices, we should use aria-checked for
        // multi-select,but Voice-Over disagrees. So we use aria-selected instead for
        // both single and multi-select.
        "aria-selected": selected.value,
        disabled: void 0,
        // Never forward the `disabled` prop
        onMousedown: handleMouseDown,
        onFocus: handleFocus,
        onPointerenter: handleEnter,
        onMouseenter: handleEnter,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave
      };
      let theirProps = omit(props, ["order", "value"]);
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "ComboboxOption"
      });
    };
  }
});

// src/components/dialog/dialog.ts
var import_vue26 = require("vue");

// src/components/focus-trap/focus-trap.ts
var import_vue17 = require("vue");

// src/hooks/use-event-listener.ts
var import_vue15 = require("vue");
function useEventListener(element, type, listener, options) {
  if (env.isServer)
    return;
  (0, import_vue15.watchEffect)((onInvalidate) => {
    element = element != null ? element : window;
    element.addEventListener(type, listener, options);
    onInvalidate(() => element.removeEventListener(type, listener, options));
  });
}

// src/hooks/use-tab-direction.ts
var import_vue16 = require("vue");
function useTabDirection() {
  let direction = (0, import_vue16.ref)(0 /* Forwards */);
  let enabled = (0, import_vue16.ref)(true);
  useWindowEvent(enabled, "keydown", (event) => {
    if (event.key === "Tab") {
      direction.value = event.shiftKey ? 1 /* Backwards */ : 0 /* Forwards */;
    }
  });
  return direction;
}

// src/components/focus-trap/focus-trap.ts
function resolveContainers(containers) {
  if (!containers)
    return /* @__PURE__ */ new Set();
  if (typeof containers === "function")
    return new Set(containers());
  let all = /* @__PURE__ */ new Set();
  for (let container of containers.value) {
    let el = dom(container);
    if (el instanceof HTMLElement) {
      all.add(el);
    }
  }
  return all;
}
var Features3 = /* @__PURE__ */ ((Features4) => {
  Features4[Features4["None"] = 1] = "None";
  Features4[Features4["InitialFocus"] = 2] = "InitialFocus";
  Features4[Features4["TabLock"] = 4] = "TabLock";
  Features4[Features4["FocusLock"] = 8] = "FocusLock";
  Features4[Features4["RestoreFocus"] = 16] = "RestoreFocus";
  Features4[Features4["All"] = 30] = "All";
  return Features4;
})(Features3 || {});
var FocusTrap = Object.assign(
  (0, import_vue17.defineComponent)({
    name: "FocusTrap",
    props: {
      as: { type: [Object, String], default: "div" },
      initialFocus: { type: Object, default: null },
      features: { type: Number, default: 30 /* All */ },
      containers: {
        type: [Object, Function],
        default: (0, import_vue17.ref)(/* @__PURE__ */ new Set())
      }
    },
    inheritAttrs: false,
    setup(props, { attrs, slots, expose }) {
      let container = (0, import_vue17.ref)(null);
      expose({ el: container, $el: container });
      let ownerDocument = (0, import_vue17.computed)(() => getOwnerDocument(container));
      let mounted = (0, import_vue17.ref)(false);
      (0, import_vue17.onMounted)(() => mounted.value = true);
      (0, import_vue17.onUnmounted)(() => mounted.value = false);
      useRestoreFocus(
        { ownerDocument },
        (0, import_vue17.computed)(() => mounted.value && Boolean(props.features & 16 /* RestoreFocus */))
      );
      let previousActiveElement = useInitialFocus(
        { ownerDocument, container, initialFocus: (0, import_vue17.computed)(() => props.initialFocus) },
        (0, import_vue17.computed)(() => mounted.value && Boolean(props.features & 2 /* InitialFocus */))
      );
      useFocusLock(
        {
          ownerDocument,
          container,
          containers: props.containers,
          previousActiveElement
        },
        (0, import_vue17.computed)(() => mounted.value && Boolean(props.features & 8 /* FocusLock */))
      );
      let direction = useTabDirection();
      function handleFocus(e) {
        let el = dom(container);
        if (!el)
          return;
        let wrapper = false ? microTask : (cb) => cb();
        wrapper(() => {
          match(direction.value, {
            [0 /* Forwards */]: () => {
              focusIn(el, 1 /* First */, { skipElements: [e.relatedTarget] });
            },
            [1 /* Backwards */]: () => {
              focusIn(el, 8 /* Last */, { skipElements: [e.relatedTarget] });
            }
          });
        });
      }
      let recentlyUsedTabKey = (0, import_vue17.ref)(false);
      function handleKeyDown(e) {
        if (e.key === "Tab") {
          recentlyUsedTabKey.value = true;
          requestAnimationFrame(() => {
            recentlyUsedTabKey.value = false;
          });
        }
      }
      function handleBlur(e) {
        if (!mounted.value)
          return;
        let allContainers = resolveContainers(props.containers);
        if (dom(container) instanceof HTMLElement)
          allContainers.add(dom(container));
        let relatedTarget = e.relatedTarget;
        if (!(relatedTarget instanceof HTMLElement))
          return;
        if (relatedTarget.dataset.headlessuiFocusGuard === "true") {
          return;
        }
        if (!contains(allContainers, relatedTarget)) {
          if (recentlyUsedTabKey.value) {
            focusIn(
              dom(container),
              match(direction.value, {
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
      return () => {
        let slot = {};
        let ourProps = { ref: container, onKeydown: handleKeyDown, onFocusout: handleBlur };
        let { features, initialFocus, containers: _containers, ...theirProps } = props;
        return (0, import_vue17.h)(import_vue17.Fragment, [
          Boolean(features & 4 /* TabLock */) && (0, import_vue17.h)(Hidden, {
            as: "button",
            type: "button",
            "data-headlessui-focus-guard": true,
            onFocus: handleFocus,
            features: 2 /* Focusable */
          }),
          render({
            ourProps,
            theirProps: { ...attrs, ...theirProps },
            slot,
            attrs,
            slots,
            name: "FocusTrap"
          }),
          Boolean(features & 4 /* TabLock */) && (0, import_vue17.h)(Hidden, {
            as: "button",
            type: "button",
            "data-headlessui-focus-guard": true,
            onFocus: handleFocus,
            features: 2 /* Focusable */
          })
        ]);
      };
    }
  }),
  { features: Features3 }
);
function useRestoreElement(enabled) {
  let localHistory = (0, import_vue17.ref)(history.slice());
  (0, import_vue17.watch)(
    [enabled],
    ([newEnabled], [oldEnabled]) => {
      if (oldEnabled === true && newEnabled === false) {
        microTask(() => {
          localHistory.value.splice(0);
        });
      } else if (oldEnabled === false && newEnabled === true) {
        localHistory.value = history.slice();
      }
    },
    { flush: "post" }
  );
  return () => {
    var _a;
    return (_a = localHistory.value.find((x) => x != null && x.isConnected)) != null ? _a : null;
  };
}
function useRestoreFocus({ ownerDocument }, enabled) {
  let getRestoreElement = useRestoreElement(enabled);
  (0, import_vue17.onMounted)(() => {
    (0, import_vue17.watchEffect)(
      () => {
        var _a, _b;
        if (enabled.value)
          return;
        if (((_a = ownerDocument.value) == null ? void 0 : _a.activeElement) === ((_b = ownerDocument.value) == null ? void 0 : _b.body)) {
          focusElement(getRestoreElement());
        }
      },
      { flush: "post" }
    );
  });
  (0, import_vue17.onUnmounted)(() => {
    if (!enabled.value)
      return;
    focusElement(getRestoreElement());
  });
}
function useInitialFocus({
  ownerDocument,
  container,
  initialFocus
}, enabled) {
  let previousActiveElement = (0, import_vue17.ref)(null);
  let mounted = (0, import_vue17.ref)(false);
  (0, import_vue17.onMounted)(() => mounted.value = true);
  (0, import_vue17.onUnmounted)(() => mounted.value = false);
  (0, import_vue17.onMounted)(() => {
    (0, import_vue17.watch)(
      // Handle initial focus
      [container, initialFocus, enabled],
      (newValues, prevValues) => {
        if (newValues.every((value, idx) => (prevValues == null ? void 0 : prevValues[idx]) === value))
          return;
        if (!enabled.value)
          return;
        let containerElement = dom(container);
        if (!containerElement)
          return;
        microTask(() => {
          var _a, _b;
          if (!mounted.value) {
            return;
          }
          let initialFocusElement = dom(initialFocus);
          let activeElement = (_a = ownerDocument.value) == null ? void 0 : _a.activeElement;
          if (initialFocusElement) {
            if (initialFocusElement === activeElement) {
              previousActiveElement.value = activeElement;
              return;
            }
          } else if (containerElement.contains(activeElement)) {
            previousActiveElement.value = activeElement;
            return;
          }
          if (initialFocusElement) {
            focusElement(initialFocusElement);
          } else {
            if (focusIn(containerElement, 1 /* First */ | 32 /* NoScroll */) === 0 /* Error */) {
              console.warn("There are no focusable elements inside the <FocusTrap />");
            }
          }
          previousActiveElement.value = (_b = ownerDocument.value) == null ? void 0 : _b.activeElement;
        });
      },
      { immediate: true, flush: "post" }
    );
  });
  return previousActiveElement;
}
function useFocusLock({
  ownerDocument,
  container,
  containers,
  previousActiveElement
}, enabled) {
  var _a;
  useEventListener(
    (_a = ownerDocument.value) == null ? void 0 : _a.defaultView,
    "focus",
    (event) => {
      if (!enabled.value)
        return;
      let allContainers = resolveContainers(containers);
      if (dom(container) instanceof HTMLElement)
        allContainers.add(dom(container));
      let previous = previousActiveElement.value;
      if (!previous)
        return;
      let toElement = event.target;
      if (toElement && toElement instanceof HTMLElement) {
        if (!contains(allContainers, toElement)) {
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
    },
    true
  );
}
function contains(containers, element) {
  for (let container of containers) {
    if (container.contains(element))
      return true;
  }
  return false;
}

// src/hooks/document-overflow/use-document-overflow.ts
var import_vue19 = require("vue");

// src/hooks/use-store.ts
var import_vue18 = require("vue");
function useStore(store) {
  let state = (0, import_vue18.shallowRef)(store.getSnapshot());
  (0, import_vue18.onUnmounted)(
    store.subscribe(() => {
      state.value = store.getSnapshot();
    })
  );
  return state;
}

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

// src/hooks/document-overflow/adjust-scrollbar-padding.ts
function adjustScrollbarPadding() {
  let scrollbarWidthBefore;
  return {
    before({ doc }) {
      var _a;
      let documentElement = doc.documentElement;
      let ownerWindow = (_a = doc.defaultView) != null ? _a : window;
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
        var _a;
        if (window.getComputedStyle(doc.documentElement).scrollBehavior !== "auto") {
          let _d = disposables();
          _d.style(doc.documentElement, "scrollBehavior", "auto");
          d.add(() => d.microTask(() => _d.dispose()));
        }
        let scrollPosition = (_a = window.scrollY) != null ? _a : window.pageYOffset;
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
          var _a2;
          let newScrollPosition = (_a2 = window.scrollY) != null ? _a2 : window.pageYOffset;
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
    var _a;
    let entry = (_a = this.get(doc)) != null ? _a : {
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
function useDocumentOverflowLockedEffect(doc, shouldBeLocked, meta) {
  let store = useStore(overflows);
  let locked = (0, import_vue19.computed)(() => {
    let entry = doc.value ? store.value.get(doc.value) : void 0;
    return entry ? entry.count > 0 : false;
  });
  (0, import_vue19.watch)(
    [doc, shouldBeLocked],
    ([doc2, shouldBeLocked2], [oldDoc], onInvalidate) => {
      if (!doc2 || !shouldBeLocked2) {
        return;
      }
      overflows.dispatch("PUSH", doc2, meta);
      let didRunCleanup = false;
      onInvalidate(() => {
        if (didRunCleanup)
          return;
        overflows.dispatch("POP", oldDoc != null ? oldDoc : doc2, meta);
        didRunCleanup = true;
      });
    },
    {
      immediate: true
    }
  );
  return locked;
}

// src/hooks/use-inert.ts
var import_vue20 = require("vue");
var originals = /* @__PURE__ */ new Map();
var counts = /* @__PURE__ */ new Map();
function useInert(node, enabled = (0, import_vue20.ref)(true)) {
  (0, import_vue20.watchEffect)((onInvalidate) => {
    var _a;
    if (!enabled.value)
      return;
    let element = dom(node);
    if (!element)
      return;
    onInvalidate(function cleanup() {
      var _a2;
      if (!element)
        return;
      let count2 = (_a2 = counts.get(element)) != null ? _a2 : 1;
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
    });
    let count = (_a = counts.get(element)) != null ? _a : 0;
    counts.set(element, count + 1);
    if (count !== 0)
      return;
    originals.set(element, {
      "aria-hidden": element.getAttribute("aria-hidden"),
      inert: element.inert
    });
    element.setAttribute("aria-hidden", "true");
    element.inert = true;
  });
}

// src/hooks/use-root-containers.ts
var import_vue21 = require("vue");
function useRootContainers({
  defaultContainers = [],
  portals,
  mainTreeNodeRef: _mainTreeNodeRef
} = {}) {
  let mainTreeNodeRef = (0, import_vue21.ref)(null);
  let ownerDocument = getOwnerDocument(mainTreeNodeRef);
  function resolveContainers2() {
    var _a, _b, _c;
    let containers = [];
    for (let container of defaultContainers) {
      if (container === null)
        continue;
      if (container instanceof HTMLElement) {
        containers.push(container);
      } else if ("value" in container && container.value instanceof HTMLElement) {
        containers.push(container.value);
      }
    }
    if (portals == null ? void 0 : portals.value) {
      for (let portal of portals.value) {
        containers.push(portal);
      }
    }
    for (let container of (_a = ownerDocument == null ? void 0 : ownerDocument.querySelectorAll("html > *, body > *")) != null ? _a : []) {
      if (container === document.body)
        continue;
      if (container === document.head)
        continue;
      if (!(container instanceof HTMLElement))
        continue;
      if (container.id === "headlessui-portal-root")
        continue;
      if (container.contains(dom(mainTreeNodeRef)))
        continue;
      if (container.contains((_c = (_b = dom(mainTreeNodeRef)) == null ? void 0 : _b.getRootNode()) == null ? void 0 : _c.host))
        continue;
      if (containers.some((defaultContainer) => container.contains(defaultContainer)))
        continue;
      containers.push(container);
    }
    return containers;
  }
  return {
    resolveContainers: resolveContainers2,
    contains(element) {
      return resolveContainers2().some((container) => container.contains(element));
    },
    mainTreeNodeRef,
    MainTreeNode() {
      if (_mainTreeNodeRef != null)
        return null;
      return (0, import_vue21.h)(Hidden, { features: 4 /* Hidden */, ref: mainTreeNodeRef });
    }
  };
}
function useMainTreeNode() {
  let mainTreeNodeRef = (0, import_vue21.ref)(null);
  return {
    mainTreeNodeRef,
    MainTreeNode() {
      return (0, import_vue21.h)(Hidden, { features: 4 /* Hidden */, ref: mainTreeNodeRef });
    }
  };
}

// src/internal/portal-force-root.ts
var import_vue22 = require("vue");
var ForcePortalRootContext = Symbol("ForcePortalRootContext");
function usePortalRoot() {
  return (0, import_vue22.inject)(ForcePortalRootContext, false);
}
var ForcePortalRoot = (0, import_vue22.defineComponent)({
  name: "ForcePortalRoot",
  props: {
    as: { type: [Object, String], default: "template" },
    force: { type: Boolean, default: false }
  },
  setup(props, { slots, attrs }) {
    (0, import_vue22.provide)(ForcePortalRootContext, props.force);
    return () => {
      let { force, ...theirProps } = props;
      return render({
        theirProps,
        ourProps: {},
        slot: {},
        slots,
        attrs,
        name: "ForcePortalRoot"
      });
    };
  }
});

// src/internal/stack-context.ts
var import_vue23 = require("vue");
var StackContext = Symbol("StackContext");
function useStackContext() {
  return (0, import_vue23.inject)(StackContext, () => {
  });
}
function useStackProvider({
  type,
  enabled,
  element,
  onUpdate
}) {
  let parentUpdate = useStackContext();
  function notify(...args) {
    onUpdate == null ? void 0 : onUpdate(...args);
    parentUpdate(...args);
  }
  (0, import_vue23.onMounted)(() => {
    (0, import_vue23.watch)(
      enabled,
      (isEnabled, oldIsEnabled) => {
        if (isEnabled) {
          notify(0 /* Add */, type, element);
        } else if (oldIsEnabled === true) {
          notify(1 /* Remove */, type, element);
        }
      },
      { immediate: true, flush: "sync" }
    );
  });
  (0, import_vue23.onUnmounted)(() => {
    if (enabled.value) {
      notify(1 /* Remove */, type, element);
    }
  });
  (0, import_vue23.provide)(StackContext, notify);
}

// src/components/description/description.ts
var import_vue24 = require("vue");
var DescriptionContext = Symbol("DescriptionContext");
function useDescriptionContext() {
  let context = (0, import_vue24.inject)(DescriptionContext, null);
  if (context === null) {
    throw new Error("Missing parent");
  }
  return context;
}
function useDescriptions({
  slot = (0, import_vue24.ref)({}),
  name = "Description",
  props = {}
} = {}) {
  let descriptionIds = (0, import_vue24.ref)([]);
  function register(value) {
    descriptionIds.value.push(value);
    return () => {
      let idx = descriptionIds.value.indexOf(value);
      if (idx === -1)
        return;
      descriptionIds.value.splice(idx, 1);
    };
  }
  (0, import_vue24.provide)(DescriptionContext, { register, slot, name, props });
  return (0, import_vue24.computed)(
    () => descriptionIds.value.length > 0 ? descriptionIds.value.join(" ") : void 0
  );
}
var Description = (0, import_vue24.defineComponent)({
  name: "Description",
  props: {
    as: { type: [Object, String], default: "p" },
    id: { type: String, default: () => `headlessui-description-${useId()}` }
  },
  setup(myProps, { attrs, slots }) {
    let context = useDescriptionContext();
    (0, import_vue24.onMounted)(() => (0, import_vue24.onUnmounted)(context.register(myProps.id)));
    return () => {
      let { name = "Description", slot = (0, import_vue24.ref)({}), props = {} } = context;
      let { id: id2, ...theirProps } = myProps;
      let ourProps = {
        ...Object.entries(props).reduce(
          (acc, [key, value]) => Object.assign(acc, { [key]: (0, import_vue24.unref)(value) }),
          {}
        ),
        id: id2
      };
      return render({
        ourProps,
        theirProps,
        slot: slot.value,
        attrs,
        slots,
        name
      });
    };
  }
});

// src/components/portal/portal.ts
var import_vue25 = require("vue");
function getPortalRoot(contextElement) {
  let ownerDocument = getOwnerDocument(contextElement);
  if (!ownerDocument) {
    if (contextElement === null) {
      return null;
    }
    throw new Error(
      `[Headless UI]: Cannot find ownerDocument for contextElement: ${contextElement}`
    );
  }
  let existingRoot = ownerDocument.getElementById("headlessui-portal-root");
  if (existingRoot)
    return existingRoot;
  let root = ownerDocument.createElement("div");
  root.setAttribute("id", "headlessui-portal-root");
  return ownerDocument.body.appendChild(root);
}
var Portal = (0, import_vue25.defineComponent)({
  name: "Portal",
  props: {
    as: { type: [Object, String], default: "div" }
  },
  setup(props, { slots, attrs }) {
    let element = (0, import_vue25.ref)(null);
    let ownerDocument = (0, import_vue25.computed)(() => getOwnerDocument(element));
    let forcePortalRoot = usePortalRoot();
    let groupContext = (0, import_vue25.inject)(PortalGroupContext, null);
    let myTarget = (0, import_vue25.ref)(
      forcePortalRoot === true ? getPortalRoot(element.value) : groupContext == null ? getPortalRoot(element.value) : groupContext.resolveTarget()
    );
    let ready = (0, import_vue25.ref)(false);
    (0, import_vue25.onMounted)(() => {
      ready.value = true;
    });
    (0, import_vue25.watchEffect)(() => {
      if (forcePortalRoot)
        return;
      if (groupContext == null)
        return;
      myTarget.value = groupContext.resolveTarget();
    });
    let parent = (0, import_vue25.inject)(PortalParentContext, null);
    let didRegister = false;
    let instance = (0, import_vue25.getCurrentInstance)();
    (0, import_vue25.watch)(element, () => {
      if (didRegister)
        return;
      if (!parent)
        return;
      let domElement = dom(element);
      if (!domElement)
        return;
      (0, import_vue25.onUnmounted)(parent.register(domElement), instance);
      didRegister = true;
    });
    (0, import_vue25.onUnmounted)(() => {
      var _a, _b;
      let root = (_a = ownerDocument.value) == null ? void 0 : _a.getElementById("headlessui-portal-root");
      if (!root)
        return;
      if (myTarget.value !== root)
        return;
      if (myTarget.value.children.length <= 0) {
        (_b = myTarget.value.parentElement) == null ? void 0 : _b.removeChild(myTarget.value);
      }
    });
    return () => {
      if (!ready.value)
        return null;
      if (myTarget.value === null)
        return null;
      let ourProps = {
        ref: element,
        "data-headlessui-portal": ""
      };
      return (0, import_vue25.h)(
        // @ts-expect-error Children can be an object, but TypeScript is not happy
        // with it. Once this is fixed upstream we can remove this assertion.
        import_vue25.Teleport,
        { to: myTarget.value },
        render({
          ourProps,
          theirProps: props,
          slot: {},
          attrs,
          slots,
          name: "Portal"
        })
      );
    };
  }
});
var PortalParentContext = Symbol("PortalParentContext");
function useNestedPortals() {
  let parent = (0, import_vue25.inject)(PortalParentContext, null);
  let portals = (0, import_vue25.ref)([]);
  function register(portal) {
    portals.value.push(portal);
    if (parent)
      parent.register(portal);
    return () => unregister(portal);
  }
  function unregister(portal) {
    let idx = portals.value.indexOf(portal);
    if (idx !== -1)
      portals.value.splice(idx, 1);
    if (parent)
      parent.unregister(portal);
  }
  let api = {
    register,
    unregister,
    portals
  };
  return [
    portals,
    (0, import_vue25.defineComponent)({
      name: "PortalWrapper",
      setup(_, { slots }) {
        (0, import_vue25.provide)(PortalParentContext, api);
        return () => {
          var _a;
          return (_a = slots.default) == null ? void 0 : _a.call(slots);
        };
      }
    })
  ];
}
var PortalGroupContext = Symbol("PortalGroupContext");
var PortalGroup = (0, import_vue25.defineComponent)({
  name: "PortalGroup",
  props: {
    as: { type: [Object, String], default: "template" },
    target: { type: Object, default: null }
  },
  setup(props, { attrs, slots }) {
    let api = (0, import_vue25.reactive)({
      resolveTarget() {
        return props.target;
      }
    });
    (0, import_vue25.provide)(PortalGroupContext, api);
    return () => {
      let { target: _, ...theirProps } = props;
      return render({
        theirProps,
        ourProps: {},
        slot: {},
        attrs,
        slots,
        name: "PortalGroup"
      });
    };
  }
});

// src/components/dialog/dialog.ts
var DialogContext = Symbol("DialogContext");
function useDialogContext(component) {
  let context = (0, import_vue26.inject)(DialogContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Dialog /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useDialogContext);
    throw err;
  }
  return context;
}
var Missing = "DC8F892D-2EBD-447C-A4C8-A03058436FF4";
var Dialog = (0, import_vue26.defineComponent)({
  name: "Dialog",
  inheritAttrs: false,
  // Manually handling this
  props: {
    as: { type: [Object, String], default: "div" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    open: { type: [Boolean, String], default: Missing },
    initialFocus: { type: Object, default: null },
    id: { type: String, default: () => `headlessui-dialog-${useId()}` },
    role: { type: String, default: "dialog" }
  },
  emits: { close: (_close) => true },
  setup(props, { emit, attrs, slots, expose }) {
    var _a;
    let ready = (0, import_vue26.ref)(false);
    (0, import_vue26.onMounted)(() => {
      ready.value = true;
    });
    let didWarnOnRole = false;
    let role = (0, import_vue26.computed)(() => {
      if (props.role === "dialog" || props.role === "alertdialog") {
        return props.role;
      }
      if (!didWarnOnRole) {
        didWarnOnRole = true;
        console.warn(
          `Invalid role [${role}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`
        );
      }
      return "dialog";
    });
    let nestedDialogCount = (0, import_vue26.ref)(0);
    let usesOpenClosedState = useOpenClosed();
    let open = (0, import_vue26.computed)(() => {
      if (props.open === Missing && usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return props.open;
    });
    let internalDialogRef = (0, import_vue26.ref)(null);
    let ownerDocument = (0, import_vue26.computed)(() => getOwnerDocument(internalDialogRef));
    expose({ el: internalDialogRef, $el: internalDialogRef });
    let hasOpen = props.open !== Missing || usesOpenClosedState !== null;
    if (!hasOpen) {
      throw new Error(`You forgot to provide an \`open\` prop to the \`Dialog\`.`);
    }
    if (typeof open.value !== "boolean") {
      throw new Error(
        `You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${open.value === Missing ? void 0 : props.open}`
      );
    }
    let dialogState = (0, import_vue26.computed)(
      () => !ready.value ? 1 /* Closed */ : open.value ? 0 /* Open */ : 1 /* Closed */
    );
    let enabled = (0, import_vue26.computed)(() => dialogState.value === 0 /* Open */);
    let hasNestedDialogs = (0, import_vue26.computed)(() => nestedDialogCount.value > 1);
    let hasParentDialog = (0, import_vue26.inject)(DialogContext, null) !== null;
    let [portals, PortalWrapper] = useNestedPortals();
    let {
      resolveContainers: resolveRootContainers,
      mainTreeNodeRef,
      MainTreeNode
    } = useRootContainers({
      portals,
      defaultContainers: [(0, import_vue26.computed)(() => {
        var _a2;
        return (_a2 = api.panelRef.value) != null ? _a2 : internalDialogRef.value;
      })]
    });
    let position = (0, import_vue26.computed)(() => !hasNestedDialogs.value ? "leaf" : "parent");
    let isClosing = (0, import_vue26.computed)(
      () => usesOpenClosedState !== null ? (usesOpenClosedState.value & 4 /* Closing */) === 4 /* Closing */ : false
    );
    let inertOthersEnabled = (0, import_vue26.computed)(() => {
      if (hasParentDialog)
        return false;
      if (isClosing.value)
        return false;
      return enabled.value;
    });
    let resolveRootOfMainTreeNode = (0, import_vue26.computed)(() => {
      var _a2, _b, _c;
      return (_c = Array.from((_b = (_a2 = ownerDocument.value) == null ? void 0 : _a2.querySelectorAll("body > *")) != null ? _b : []).find((root) => {
        if (root.id === "headlessui-portal-root")
          return false;
        return root.contains(dom(mainTreeNodeRef)) && root instanceof HTMLElement;
      })) != null ? _c : null;
    });
    useInert(resolveRootOfMainTreeNode, inertOthersEnabled);
    let inertParentDialogs = (0, import_vue26.computed)(() => {
      if (hasNestedDialogs.value)
        return true;
      return enabled.value;
    });
    let resolveRootOfParentDialog = (0, import_vue26.computed)(() => {
      var _a2, _b, _c;
      return (_c = Array.from(
        (_b = (_a2 = ownerDocument.value) == null ? void 0 : _a2.querySelectorAll("[data-headlessui-portal]")) != null ? _b : []
      ).find((root) => root.contains(dom(mainTreeNodeRef)) && root instanceof HTMLElement)) != null ? _c : null;
    });
    useInert(resolveRootOfParentDialog, inertParentDialogs);
    useStackProvider({
      type: "Dialog",
      enabled: (0, import_vue26.computed)(() => dialogState.value === 0 /* Open */),
      element: internalDialogRef,
      onUpdate: (message, type) => {
        if (type !== "Dialog")
          return;
        return match(message, {
          [0 /* Add */]: () => nestedDialogCount.value += 1,
          [1 /* Remove */]: () => nestedDialogCount.value -= 1
        });
      }
    });
    let describedby = useDescriptions({
      name: "DialogDescription",
      slot: (0, import_vue26.computed)(() => ({ open: open.value }))
    });
    let titleId = (0, import_vue26.ref)(null);
    let api = {
      titleId,
      panelRef: (0, import_vue26.ref)(null),
      dialogState,
      setTitleId(id2) {
        if (titleId.value === id2)
          return;
        titleId.value = id2;
      },
      close() {
        emit("close", false);
      }
    };
    (0, import_vue26.provide)(DialogContext, api);
    let outsideClickEnabled = (0, import_vue26.computed)(() => {
      if (!enabled.value)
        return false;
      if (hasNestedDialogs.value)
        return false;
      return true;
    });
    useOutsideClick(
      resolveRootContainers,
      (event, target) => {
        event.preventDefault();
        api.close();
        (0, import_vue26.nextTick)(() => target == null ? void 0 : target.focus());
      },
      outsideClickEnabled
    );
    let escapeToCloseEnabled = (0, import_vue26.computed)(() => {
      if (hasNestedDialogs.value)
        return false;
      if (dialogState.value !== 0 /* Open */)
        return false;
      return true;
    });
    useEventListener((_a = ownerDocument.value) == null ? void 0 : _a.defaultView, "keydown", (event) => {
      if (!escapeToCloseEnabled.value)
        return;
      if (event.defaultPrevented)
        return;
      if (event.key !== "Escape" /* Escape */)
        return;
      event.preventDefault();
      event.stopPropagation();
      api.close();
    });
    let scrollLockEnabled = (0, import_vue26.computed)(() => {
      if (isClosing.value)
        return false;
      if (dialogState.value !== 0 /* Open */)
        return false;
      if (hasParentDialog)
        return false;
      return true;
    });
    useDocumentOverflowLockedEffect(ownerDocument, scrollLockEnabled, (meta) => {
      var _a2;
      return {
        containers: [...(_a2 = meta.containers) != null ? _a2 : [], resolveRootContainers]
      };
    });
    (0, import_vue26.watchEffect)((onInvalidate) => {
      if (dialogState.value !== 0 /* Open */)
        return;
      let container = dom(internalDialogRef);
      if (!container)
        return;
      let observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          let rect = entry.target.getBoundingClientRect();
          if (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0) {
            api.close();
          }
        }
      });
      observer.observe(container);
      onInvalidate(() => observer.disconnect());
    });
    return () => {
      let { id: id2, open: _, initialFocus, ...theirProps } = props;
      let ourProps = {
        // Manually passthrough the attributes, because Vue can't automatically pass
        // it to the underlying div because of all the wrapper components below.
        ...attrs,
        ref: internalDialogRef,
        id: id2,
        role: role.value,
        "aria-modal": dialogState.value === 0 /* Open */ ? true : void 0,
        "aria-labelledby": titleId.value,
        "aria-describedby": describedby.value
      };
      let slot = { open: dialogState.value === 0 /* Open */ };
      return (0, import_vue26.h)(ForcePortalRoot, { force: true }, () => [
        (0, import_vue26.h)(
          Portal,
          () => (0, import_vue26.h)(
            PortalGroup,
            { target: internalDialogRef.value },
            () => (0, import_vue26.h)(
              ForcePortalRoot,
              { force: false },
              () => (0, import_vue26.h)(
                FocusTrap,
                {
                  initialFocus,
                  containers: resolveRootContainers,
                  features: enabled.value ? match(position.value, {
                    parent: FocusTrap.features.RestoreFocus,
                    leaf: FocusTrap.features.All & ~FocusTrap.features.FocusLock
                  }) : FocusTrap.features.None
                },
                () => (0, import_vue26.h)(
                  PortalWrapper,
                  {},
                  () => render({
                    ourProps,
                    theirProps: { ...theirProps, ...attrs },
                    slot,
                    attrs,
                    slots,
                    visible: dialogState.value === 0 /* Open */,
                    features: 1 /* RenderStrategy */ | 2 /* Static */,
                    name: "Dialog"
                  })
                )
              )
            )
          )
        ),
        (0, import_vue26.h)(MainTreeNode)
      ]);
    };
  }
});
var DialogOverlay = (0, import_vue26.defineComponent)({
  name: "DialogOverlay",
  props: {
    as: { type: [Object, String], default: "div" },
    id: { type: String, default: () => `headlessui-dialog-overlay-${useId()}` }
  },
  setup(props, { attrs, slots }) {
    let api = useDialogContext("DialogOverlay");
    function handleClick(event) {
      if (event.target !== event.currentTarget)
        return;
      event.preventDefault();
      event.stopPropagation();
      api.close();
    }
    return () => {
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        id: id2,
        "aria-hidden": true,
        onClick: handleClick
      };
      return render({
        ourProps,
        theirProps,
        slot: { open: api.dialogState.value === 0 /* Open */ },
        attrs,
        slots,
        name: "DialogOverlay"
      });
    };
  }
});
var DialogBackdrop = (0, import_vue26.defineComponent)({
  name: "DialogBackdrop",
  props: {
    as: { type: [Object, String], default: "div" },
    id: { type: String, default: () => `headlessui-dialog-backdrop-${useId()}` }
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let api = useDialogContext("DialogBackdrop");
    let internalBackdropRef = (0, import_vue26.ref)(null);
    expose({ el: internalBackdropRef, $el: internalBackdropRef });
    (0, import_vue26.onMounted)(() => {
      if (api.panelRef.value === null) {
        throw new Error(
          `A <DialogBackdrop /> component is being used, but a <DialogPanel /> component is missing.`
        );
      }
    });
    return () => {
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        id: id2,
        ref: internalBackdropRef,
        "aria-hidden": true
      };
      return (0, import_vue26.h)(
        ForcePortalRoot,
        { force: true },
        () => (0, import_vue26.h)(
          Portal,
          () => render({
            ourProps,
            theirProps: { ...attrs, ...theirProps },
            slot: { open: api.dialogState.value === 0 /* Open */ },
            attrs,
            slots,
            name: "DialogBackdrop"
          })
        )
      );
    };
  }
});
var DialogPanel = (0, import_vue26.defineComponent)({
  name: "DialogPanel",
  props: {
    as: { type: [Object, String], default: "div" },
    id: { type: String, default: () => `headlessui-dialog-panel-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDialogContext("DialogPanel");
    expose({ el: api.panelRef, $el: api.panelRef });
    function handleClick(event) {
      event.stopPropagation();
    }
    return () => {
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        id: id2,
        ref: api.panelRef,
        onClick: handleClick
      };
      return render({
        ourProps,
        theirProps,
        slot: { open: api.dialogState.value === 0 /* Open */ },
        attrs,
        slots,
        name: "DialogPanel"
      });
    };
  }
});
var DialogTitle = (0, import_vue26.defineComponent)({
  name: "DialogTitle",
  props: {
    as: { type: [Object, String], default: "h2" },
    id: { type: String, default: () => `headlessui-dialog-title-${useId()}` }
  },
  setup(props, { attrs, slots }) {
    let api = useDialogContext("DialogTitle");
    (0, import_vue26.onMounted)(() => {
      api.setTitleId(props.id);
      (0, import_vue26.onUnmounted)(() => api.setTitleId(null));
    });
    return () => {
      let { id: id2, ...theirProps } = props;
      let ourProps = { id: id2 };
      return render({
        ourProps,
        theirProps,
        slot: { open: api.dialogState.value === 0 /* Open */ },
        attrs,
        slots,
        name: "DialogTitle"
      });
    };
  }
});
var DialogDescription = Description;

// src/components/disclosure/disclosure.ts
var import_vue27 = require("vue");
var DisclosureContext = Symbol("DisclosureContext");
function useDisclosureContext(component) {
  let context = (0, import_vue27.inject)(DisclosureContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Disclosure /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useDisclosureContext);
    throw err;
  }
  return context;
}
var DisclosurePanelContext = Symbol("DisclosurePanelContext");
function useDisclosurePanelContext() {
  return (0, import_vue27.inject)(DisclosurePanelContext, null);
}
var Disclosure = (0, import_vue27.defineComponent)({
  name: "Disclosure",
  props: {
    as: { type: [Object, String], default: "template" },
    defaultOpen: { type: [Boolean], default: false }
  },
  setup(props, { slots, attrs }) {
    let disclosureState = (0, import_vue27.ref)(
      props.defaultOpen ? 0 /* Open */ : 1 /* Closed */
    );
    let panelRef = (0, import_vue27.ref)(null);
    let buttonRef = (0, import_vue27.ref)(null);
    let api = {
      buttonId: (0, import_vue27.ref)(`headlessui-disclosure-button-${useId()}`),
      panelId: (0, import_vue27.ref)(`headlessui-disclosure-panel-${useId()}`),
      disclosureState,
      panel: panelRef,
      button: buttonRef,
      toggleDisclosure() {
        disclosureState.value = match(disclosureState.value, {
          [0 /* Open */]: 1 /* Closed */,
          [1 /* Closed */]: 0 /* Open */
        });
      },
      closeDisclosure() {
        if (disclosureState.value === 1 /* Closed */)
          return;
        disclosureState.value = 1 /* Closed */;
      },
      close(focusableElement) {
        api.closeDisclosure();
        let restoreElement = (() => {
          if (!focusableElement)
            return dom(api.button);
          if (focusableElement instanceof HTMLElement)
            return focusableElement;
          if (focusableElement.value instanceof HTMLElement)
            return dom(focusableElement);
          return dom(api.button);
        })();
        restoreElement == null ? void 0 : restoreElement.focus();
      }
    };
    (0, import_vue27.provide)(DisclosureContext, api);
    useOpenClosedProvider(
      (0, import_vue27.computed)(() => {
        return match(disclosureState.value, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        });
      })
    );
    return () => {
      let { defaultOpen: _, ...theirProps } = props;
      let slot = { open: disclosureState.value === 0 /* Open */, close: api.close };
      return render({
        theirProps,
        ourProps: {},
        slot,
        slots,
        attrs,
        name: "Disclosure"
      });
    };
  }
});
var DisclosureButton = (0, import_vue27.defineComponent)({
  name: "DisclosureButton",
  props: {
    as: { type: [Object, String], default: "button" },
    disabled: { type: [Boolean], default: false },
    id: { type: String, default: null }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDisclosureContext("DisclosureButton");
    let panelContext = useDisclosurePanelContext();
    let isWithinPanel = (0, import_vue27.computed)(
      () => panelContext === null ? false : panelContext.value === api.panelId.value
    );
    (0, import_vue27.onMounted)(() => {
      if (isWithinPanel.value)
        return;
      if (props.id !== null) {
        api.buttonId.value = props.id;
      }
    });
    (0, import_vue27.onUnmounted)(() => {
      if (isWithinPanel.value)
        return;
      api.buttonId.value = null;
    });
    let internalButtonRef = (0, import_vue27.ref)(null);
    expose({ el: internalButtonRef, $el: internalButtonRef });
    if (!isWithinPanel.value) {
      (0, import_vue27.watchEffect)(() => {
        api.button.value = internalButtonRef.value;
      });
    }
    let type = useResolveButtonType(
      (0, import_vue27.computed)(() => ({ as: props.as, type: attrs.type })),
      internalButtonRef
    );
    function handleClick() {
      var _a;
      if (props.disabled)
        return;
      if (isWithinPanel.value) {
        api.toggleDisclosure();
        (_a = dom(api.button)) == null ? void 0 : _a.focus();
      } else {
        api.toggleDisclosure();
      }
    }
    function handleKeyDown(event) {
      var _a;
      if (props.disabled)
        return;
      if (isWithinPanel.value) {
        switch (event.key) {
          case " " /* Space */:
          case "Enter" /* Enter */:
            event.preventDefault();
            event.stopPropagation();
            api.toggleDisclosure();
            (_a = dom(api.button)) == null ? void 0 : _a.focus();
            break;
        }
      } else {
        switch (event.key) {
          case " " /* Space */:
          case "Enter" /* Enter */:
            event.preventDefault();
            event.stopPropagation();
            api.toggleDisclosure();
            break;
        }
      }
    }
    function handleKeyUp(event) {
      switch (event.key) {
        case " " /* Space */:
          event.preventDefault();
          break;
      }
    }
    return () => {
      var _a;
      let slot = { open: api.disclosureState.value === 0 /* Open */ };
      let { id: id2, ...theirProps } = props;
      let ourProps = isWithinPanel.value ? {
        ref: internalButtonRef,
        type: type.value,
        onClick: handleClick,
        onKeydown: handleKeyDown
      } : {
        id: (_a = api.buttonId.value) != null ? _a : id2,
        ref: internalButtonRef,
        type: type.value,
        "aria-expanded": api.disclosureState.value === 0 /* Open */,
        "aria-controls": api.disclosureState.value === 0 /* Open */ || dom(api.panel) ? api.panelId.value : void 0,
        disabled: props.disabled ? true : void 0,
        onClick: handleClick,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "DisclosureButton"
      });
    };
  }
});
var DisclosurePanel = (0, import_vue27.defineComponent)({
  name: "DisclosurePanel",
  props: {
    as: { type: [Object, String], default: "div" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    id: { type: String, default: null }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useDisclosureContext("DisclosurePanel");
    (0, import_vue27.onMounted)(() => {
      if (props.id !== null) {
        api.panelId.value = props.id;
      }
    });
    (0, import_vue27.onUnmounted)(() => {
      api.panelId.value = null;
    });
    expose({ el: api.panel, $el: api.panel });
    (0, import_vue27.provide)(DisclosurePanelContext, api.panelId);
    let usesOpenClosedState = useOpenClosed();
    let visible = (0, import_vue27.computed)(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return api.disclosureState.value === 0 /* Open */;
    });
    return () => {
      var _a;
      let slot = { open: api.disclosureState.value === 0 /* Open */, close: api.close };
      let { id: id2, ...theirProps } = props;
      let ourProps = { id: (_a = api.panelId.value) != null ? _a : id2, ref: api.panel };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        visible: visible.value,
        name: "DisclosurePanel"
      });
    };
  }
});

// src/components/listbox/listbox.ts
var import_vue29 = require("vue");

// src/hooks/use-text-value.ts
var import_vue28 = require("vue");

// src/utils/get-text-value.ts
var emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
function getTextContents(element) {
  var _a, _b;
  let currentInnerText = (_a = element.innerText) != null ? _a : "";
  let copy = element.cloneNode(true);
  if (!(copy instanceof HTMLElement)) {
    return currentInnerText;
  }
  let dropped = false;
  for (let child of copy.querySelectorAll('[hidden],[aria-hidden],[role="img"]')) {
    child.remove();
    dropped = true;
  }
  let value = dropped ? (_b = copy.innerText) != null ? _b : "" : currentInnerText;
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
  let cacheKey = (0, import_vue28.ref)("");
  let cacheValue = (0, import_vue28.ref)("");
  return () => {
    let el = dom(element);
    if (!el)
      return "";
    let currentKey = el.innerText;
    if (cacheKey.value === currentKey) {
      return cacheValue.value;
    }
    let value = getTextValue(el).trim().toLowerCase();
    cacheKey.value = currentKey;
    cacheValue.value = value;
    return value;
  };
}

// src/components/listbox/listbox.ts
function defaultComparator2(a, z) {
  return a === z;
}
function nextFrame(cb) {
  requestAnimationFrame(() => requestAnimationFrame(cb));
}
var ListboxContext = Symbol("ListboxContext");
function useListboxContext(component) {
  let context = (0, import_vue29.inject)(ListboxContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useListboxContext);
    throw err;
  }
  return context;
}
var Listbox = (0, import_vue29.defineComponent)({
  name: "Listbox",
  emits: { "update:modelValue": (_value) => true },
  props: {
    as: { type: [Object, String], default: "template" },
    disabled: { type: [Boolean], default: false },
    by: { type: [String, Function], default: () => defaultComparator2 },
    horizontal: { type: [Boolean], default: false },
    modelValue: {
      type: [Object, String, Number, Boolean],
      default: void 0
    },
    defaultValue: {
      type: [Object, String, Number, Boolean],
      default: void 0
    },
    form: { type: String, optional: true },
    name: { type: String, optional: true },
    multiple: { type: [Boolean], default: false }
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, emit }) {
    let listboxState = (0, import_vue29.ref)(1 /* Closed */);
    let labelRef = (0, import_vue29.ref)(null);
    let buttonRef = (0, import_vue29.ref)(null);
    let optionsRef = (0, import_vue29.ref)(null);
    let options = (0, import_vue29.ref)([]);
    let searchQuery = (0, import_vue29.ref)("");
    let activeOptionIndex = (0, import_vue29.ref)(null);
    let activationTrigger = (0, import_vue29.ref)(
      1 /* Other */
    );
    function adjustOrderedState(adjustment = (i) => i) {
      let currentActiveOption = activeOptionIndex.value !== null ? options.value[activeOptionIndex.value] : null;
      let sortedOptions = sortByDomNode(
        adjustment(options.value.slice()),
        (option) => dom(option.dataRef.domRef)
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
    let mode = (0, import_vue29.computed)(() => props.multiple ? 1 /* Multi */ : 0 /* Single */);
    let [directValue, theirOnChange] = useControllable(
      (0, import_vue29.computed)(() => props.modelValue),
      (value2) => emit("update:modelValue", value2),
      (0, import_vue29.computed)(() => props.defaultValue)
    );
    let value = (0, import_vue29.computed)(
      () => directValue.value === void 0 ? match(mode.value, {
        [1 /* Multi */]: [],
        [0 /* Single */]: void 0
      }) : directValue.value
    );
    let api = {
      listboxState,
      value,
      mode,
      compare(a, z) {
        if (typeof props.by === "string") {
          let property = props.by;
          return (a == null ? void 0 : a[property]) === (z == null ? void 0 : z[property]);
        }
        return props.by(a, z);
      },
      orientation: (0, import_vue29.computed)(() => props.horizontal ? "horizontal" : "vertical"),
      labelRef,
      buttonRef,
      optionsRef,
      disabled: (0, import_vue29.computed)(() => props.disabled),
      options,
      searchQuery,
      activeOptionIndex,
      activationTrigger,
      closeListbox() {
        if (props.disabled)
          return;
        if (listboxState.value === 1 /* Closed */)
          return;
        listboxState.value = 1 /* Closed */;
        activeOptionIndex.value = null;
      },
      openListbox() {
        if (props.disabled)
          return;
        if (listboxState.value === 0 /* Open */)
          return;
        listboxState.value = 0 /* Open */;
      },
      goToOption(focus, id2, trigger) {
        if (props.disabled)
          return;
        if (listboxState.value === 1 /* Closed */)
          return;
        let adjustedState = adjustOrderedState();
        let nextActiveOptionIndex = calculateActiveIndex(
          focus === 4 /* Specific */ ? { focus: 4 /* Specific */, id: id2 } : { focus },
          {
            resolveItems: () => adjustedState.options,
            resolveActiveIndex: () => adjustedState.activeOptionIndex,
            resolveId: (option) => option.id,
            resolveDisabled: (option) => option.dataRef.disabled
          }
        );
        searchQuery.value = "";
        activeOptionIndex.value = nextActiveOptionIndex;
        activationTrigger.value = trigger != null ? trigger : 1 /* Other */;
        options.value = adjustedState.options;
      },
      search(value2) {
        if (props.disabled)
          return;
        if (listboxState.value === 1 /* Closed */)
          return;
        let wasAlreadySearching = searchQuery.value !== "";
        let offset = wasAlreadySearching ? 0 : 1;
        searchQuery.value += value2.toLowerCase();
        let reOrderedOptions = activeOptionIndex.value !== null ? options.value.slice(activeOptionIndex.value + offset).concat(options.value.slice(0, activeOptionIndex.value + offset)) : options.value;
        let matchingOption = reOrderedOptions.find(
          (option) => option.dataRef.textValue.startsWith(searchQuery.value) && !option.dataRef.disabled
        );
        let matchIdx = matchingOption ? options.value.indexOf(matchingOption) : -1;
        if (matchIdx === -1 || matchIdx === activeOptionIndex.value)
          return;
        activeOptionIndex.value = matchIdx;
        activationTrigger.value = 1 /* Other */;
      },
      clearSearch() {
        if (props.disabled)
          return;
        if (listboxState.value === 1 /* Closed */)
          return;
        if (searchQuery.value === "")
          return;
        searchQuery.value = "";
      },
      registerOption(id2, dataRef) {
        let adjustedState = adjustOrderedState((options2) => {
          return [...options2, { id: id2, dataRef }];
        });
        options.value = adjustedState.options;
        activeOptionIndex.value = adjustedState.activeOptionIndex;
      },
      unregisterOption(id2) {
        let adjustedState = adjustOrderedState((options2) => {
          let idx = options2.findIndex((a) => a.id === id2);
          if (idx !== -1)
            options2.splice(idx, 1);
          return options2;
        });
        options.value = adjustedState.options;
        activeOptionIndex.value = adjustedState.activeOptionIndex;
        activationTrigger.value = 1 /* Other */;
      },
      theirOnChange(value2) {
        if (props.disabled)
          return;
        theirOnChange(value2);
      },
      select(value2) {
        if (props.disabled)
          return;
        theirOnChange(
          match(mode.value, {
            [0 /* Single */]: () => value2,
            [1 /* Multi */]: () => {
              let copy = (0, import_vue29.toRaw)(api.value.value).slice();
              let raw = (0, import_vue29.toRaw)(value2);
              let idx = copy.findIndex((value3) => api.compare(raw, (0, import_vue29.toRaw)(value3)));
              if (idx === -1) {
                copy.push(raw);
              } else {
                copy.splice(idx, 1);
              }
              return copy;
            }
          })
        );
      }
    };
    useOutsideClick(
      [buttonRef, optionsRef],
      (event, target) => {
        var _a;
        api.closeListbox();
        if (!isFocusableElement(target, 1 /* Loose */)) {
          event.preventDefault();
          (_a = dom(buttonRef)) == null ? void 0 : _a.focus();
        }
      },
      (0, import_vue29.computed)(() => listboxState.value === 0 /* Open */)
    );
    (0, import_vue29.provide)(ListboxContext, api);
    useOpenClosedProvider(
      (0, import_vue29.computed)(
        () => match(listboxState.value, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        })
      )
    );
    let form = (0, import_vue29.computed)(() => {
      var _a;
      return (_a = dom(buttonRef)) == null ? void 0 : _a.closest("form");
    });
    (0, import_vue29.onMounted)(() => {
      (0, import_vue29.watch)(
        [form],
        () => {
          if (!form.value)
            return;
          if (props.defaultValue === void 0)
            return;
          function handle() {
            api.theirOnChange(props.defaultValue);
          }
          form.value.addEventListener("reset", handle);
          return () => {
            var _a;
            (_a = form.value) == null ? void 0 : _a.removeEventListener("reset", handle);
          };
        },
        { immediate: true }
      );
    });
    return () => {
      let { name, modelValue, disabled, form: form2, ...theirProps } = props;
      let slot = { open: listboxState.value === 0 /* Open */, disabled, value: value.value };
      return (0, import_vue29.h)(import_vue29.Fragment, [
        ...name != null && value.value != null ? objectToFormEntries({ [name]: value.value }).map(
          ([name2, value2]) => (0, import_vue29.h)(
            Hidden,
            compact({
              features: 4 /* Hidden */,
              key: name2,
              as: "input",
              type: "hidden",
              hidden: true,
              readOnly: true,
              form: form2,
              disabled,
              name: name2,
              value: value2
            })
          )
        ) : [],
        render({
          ourProps: {},
          theirProps: {
            ...attrs,
            ...omit(theirProps, [
              "defaultValue",
              "onUpdate:modelValue",
              "horizontal",
              "multiple",
              "by"
            ])
          },
          slot,
          slots,
          attrs,
          name: "Listbox"
        })
      ]);
    };
  }
});
var ListboxLabel = (0, import_vue29.defineComponent)({
  name: "ListboxLabel",
  props: {
    as: { type: [Object, String], default: "label" },
    id: { type: String, default: () => `headlessui-listbox-label-${useId()}` }
  },
  setup(props, { attrs, slots }) {
    let api = useListboxContext("ListboxLabel");
    function handleClick() {
      var _a;
      (_a = dom(api.buttonRef)) == null ? void 0 : _a.focus({ preventScroll: true });
    }
    return () => {
      let slot = {
        open: api.listboxState.value === 0 /* Open */,
        disabled: api.disabled.value
      };
      let { id: id2, ...theirProps } = props;
      let ourProps = { id: id2, ref: api.labelRef, onClick: handleClick };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "ListboxLabel"
      });
    };
  }
});
var ListboxButton = (0, import_vue29.defineComponent)({
  name: "ListboxButton",
  props: {
    as: { type: [Object, String], default: "button" },
    id: { type: String, default: () => `headlessui-listbox-button-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useListboxContext("ListboxButton");
    expose({ el: api.buttonRef, $el: api.buttonRef });
    function handleKeyDown(event) {
      switch (event.key) {
        case " " /* Space */:
        case "Enter" /* Enter */:
        case "ArrowDown" /* ArrowDown */:
          event.preventDefault();
          api.openListbox();
          (0, import_vue29.nextTick)(() => {
            var _a;
            (_a = dom(api.optionsRef)) == null ? void 0 : _a.focus({ preventScroll: true });
            if (!api.value.value)
              api.goToOption(0 /* First */);
          });
          break;
        case "ArrowUp" /* ArrowUp */:
          event.preventDefault();
          api.openListbox();
          (0, import_vue29.nextTick)(() => {
            var _a;
            (_a = dom(api.optionsRef)) == null ? void 0 : _a.focus({ preventScroll: true });
            if (!api.value.value)
              api.goToOption(3 /* Last */);
          });
          break;
      }
    }
    function handleKeyUp(event) {
      switch (event.key) {
        case " " /* Space */:
          event.preventDefault();
          break;
      }
    }
    function handleClick(event) {
      if (api.disabled.value)
        return;
      if (api.listboxState.value === 0 /* Open */) {
        api.closeListbox();
        (0, import_vue29.nextTick)(() => {
          var _a;
          return (_a = dom(api.buttonRef)) == null ? void 0 : _a.focus({ preventScroll: true });
        });
      } else {
        event.preventDefault();
        api.openListbox();
        nextFrame(() => {
          var _a;
          return (_a = dom(api.optionsRef)) == null ? void 0 : _a.focus({ preventScroll: true });
        });
      }
    }
    let type = useResolveButtonType(
      (0, import_vue29.computed)(() => ({ as: props.as, type: attrs.type })),
      api.buttonRef
    );
    return () => {
      var _a, _b;
      let slot = {
        open: api.listboxState.value === 0 /* Open */,
        disabled: api.disabled.value,
        value: api.value.value
      };
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        ref: api.buttonRef,
        id: id2,
        type: type.value,
        "aria-haspopup": "listbox",
        "aria-controls": (_a = dom(api.optionsRef)) == null ? void 0 : _a.id,
        "aria-expanded": api.listboxState.value === 0 /* Open */,
        "aria-labelledby": api.labelRef.value ? [(_b = dom(api.labelRef)) == null ? void 0 : _b.id, id2].join(" ") : void 0,
        disabled: api.disabled.value === true ? true : void 0,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        onClick: handleClick
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "ListboxButton"
      });
    };
  }
});
var ListboxOptions = (0, import_vue29.defineComponent)({
  name: "ListboxOptions",
  props: {
    as: { type: [Object, String], default: "ul" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    id: { type: String, default: () => `headlessui-listbox-options-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useListboxContext("ListboxOptions");
    let searchDebounce = (0, import_vue29.ref)(null);
    expose({ el: api.optionsRef, $el: api.optionsRef });
    function handleKeyDown(event) {
      if (searchDebounce.value)
        clearTimeout(searchDebounce.value);
      switch (event.key) {
        case " " /* Space */:
          if (api.searchQuery.value !== "") {
            event.preventDefault();
            event.stopPropagation();
            return api.search(event.key);
          }
        case "Enter" /* Enter */:
          event.preventDefault();
          event.stopPropagation();
          if (api.activeOptionIndex.value !== null) {
            let activeOption = api.options.value[api.activeOptionIndex.value];
            api.select(activeOption.dataRef.value);
          }
          if (api.mode.value === 0 /* Single */) {
            api.closeListbox();
            (0, import_vue29.nextTick)(() => {
              var _a;
              return (_a = dom(api.buttonRef)) == null ? void 0 : _a.focus({ preventScroll: true });
            });
          }
          break;
        case match(api.orientation.value, {
          vertical: "ArrowDown" /* ArrowDown */,
          horizontal: "ArrowRight" /* ArrowRight */
        }):
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(2 /* Next */);
        case match(api.orientation.value, { vertical: "ArrowUp" /* ArrowUp */, horizontal: "ArrowLeft" /* ArrowLeft */ }):
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(1 /* Previous */);
        case "Home" /* Home */:
        case "PageUp" /* PageUp */:
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(0 /* First */);
        case "End" /* End */:
        case "PageDown" /* PageDown */:
          event.preventDefault();
          event.stopPropagation();
          return api.goToOption(3 /* Last */);
        case "Escape" /* Escape */:
          event.preventDefault();
          event.stopPropagation();
          api.closeListbox();
          (0, import_vue29.nextTick)(() => {
            var _a;
            return (_a = dom(api.buttonRef)) == null ? void 0 : _a.focus({ preventScroll: true });
          });
          break;
        case "Tab" /* Tab */:
          event.preventDefault();
          event.stopPropagation();
          break;
        default:
          if (event.key.length === 1) {
            api.search(event.key);
            searchDebounce.value = setTimeout(() => api.clearSearch(), 350);
          }
          break;
      }
    }
    let usesOpenClosedState = useOpenClosed();
    let visible = (0, import_vue29.computed)(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return api.listboxState.value === 0 /* Open */;
    });
    return () => {
      var _a, _b;
      let slot = { open: api.listboxState.value === 0 /* Open */ };
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        "aria-activedescendant": api.activeOptionIndex.value === null ? void 0 : (_a = api.options.value[api.activeOptionIndex.value]) == null ? void 0 : _a.id,
        "aria-multiselectable": api.mode.value === 1 /* Multi */ ? true : void 0,
        "aria-labelledby": (_b = dom(api.buttonRef)) == null ? void 0 : _b.id,
        "aria-orientation": api.orientation.value,
        id: id2,
        onKeydown: handleKeyDown,
        role: "listbox",
        tabIndex: 0,
        ref: api.optionsRef
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        visible: visible.value,
        name: "ListboxOptions"
      });
    };
  }
});
var ListboxOption = (0, import_vue29.defineComponent)({
  name: "ListboxOption",
  props: {
    as: { type: [Object, String], default: "li" },
    value: {
      type: [Object, String, Number, Boolean]
    },
    disabled: { type: Boolean, default: false },
    id: { type: String, default: () => `headlessui-listbox.option-${useId()}` }
  },
  setup(props, { slots, attrs, expose }) {
    let api = useListboxContext("ListboxOption");
    let internalOptionRef = (0, import_vue29.ref)(null);
    expose({ el: internalOptionRef, $el: internalOptionRef });
    let active = (0, import_vue29.computed)(() => {
      return api.activeOptionIndex.value !== null ? api.options.value[api.activeOptionIndex.value].id === props.id : false;
    });
    let selected = (0, import_vue29.computed)(
      () => match(api.mode.value, {
        [0 /* Single */]: () => api.compare((0, import_vue29.toRaw)(api.value.value), (0, import_vue29.toRaw)(props.value)),
        [1 /* Multi */]: () => (0, import_vue29.toRaw)(api.value.value).some(
          (value) => api.compare((0, import_vue29.toRaw)(value), (0, import_vue29.toRaw)(props.value))
        )
      })
    );
    let isFirstSelected = (0, import_vue29.computed)(() => {
      return match(api.mode.value, {
        [1 /* Multi */]: () => {
          var _a;
          let currentValues = (0, import_vue29.toRaw)(api.value.value);
          return ((_a = api.options.value.find(
            (option) => currentValues.some((value) => api.compare((0, import_vue29.toRaw)(value), (0, import_vue29.toRaw)(option.dataRef.value)))
          )) == null ? void 0 : _a.id) === props.id;
        },
        [0 /* Single */]: () => selected.value
      });
    });
    let getTextValue2 = useTextValue(internalOptionRef);
    let dataRef = (0, import_vue29.computed)(() => ({
      disabled: props.disabled,
      value: props.value,
      get textValue() {
        return getTextValue2();
      },
      domRef: internalOptionRef
    }));
    (0, import_vue29.onMounted)(() => api.registerOption(props.id, dataRef));
    (0, import_vue29.onUnmounted)(() => api.unregisterOption(props.id));
    (0, import_vue29.onMounted)(() => {
      (0, import_vue29.watch)(
        [api.listboxState, selected],
        () => {
          if (api.listboxState.value !== 0 /* Open */)
            return;
          if (!selected.value)
            return;
          match(api.mode.value, {
            [1 /* Multi */]: () => {
              if (isFirstSelected.value)
                api.goToOption(4 /* Specific */, props.id);
            },
            [0 /* Single */]: () => {
              api.goToOption(4 /* Specific */, props.id);
            }
          });
        },
        { immediate: true }
      );
    });
    (0, import_vue29.watchEffect)(() => {
      if (api.listboxState.value !== 0 /* Open */)
        return;
      if (!active.value)
        return;
      if (api.activationTrigger.value === 0 /* Pointer */)
        return;
      (0, import_vue29.nextTick)(() => {
        var _a, _b;
        return (_b = (_a = dom(internalOptionRef)) == null ? void 0 : _a.scrollIntoView) == null ? void 0 : _b.call(_a, { block: "nearest" });
      });
    });
    function handleClick(event) {
      if (props.disabled)
        return event.preventDefault();
      api.select(props.value);
      if (api.mode.value === 0 /* Single */) {
        api.closeListbox();
        (0, import_vue29.nextTick)(() => {
          var _a;
          return (_a = dom(api.buttonRef)) == null ? void 0 : _a.focus({ preventScroll: true });
        });
      }
    }
    function handleFocus() {
      if (props.disabled)
        return api.goToOption(5 /* Nothing */);
      api.goToOption(4 /* Specific */, props.id);
    }
    let pointer = useTrackedPointer();
    function handleEnter(evt) {
      pointer.update(evt);
    }
    function handleMove(evt) {
      if (!pointer.wasMoved(evt))
        return;
      if (props.disabled)
        return;
      if (active.value)
        return;
      api.goToOption(4 /* Specific */, props.id, 0 /* Pointer */);
    }
    function handleLeave(evt) {
      if (!pointer.wasMoved(evt))
        return;
      if (props.disabled)
        return;
      if (!active.value)
        return;
      api.goToOption(5 /* Nothing */);
    }
    return () => {
      let { disabled } = props;
      let slot = { active: active.value, selected: selected.value, disabled };
      let { id: id2, value: _value, disabled: _disabled, ...theirProps } = props;
      let ourProps = {
        id: id2,
        ref: internalOptionRef,
        role: "option",
        tabIndex: disabled === true ? void 0 : -1,
        "aria-disabled": disabled === true ? true : void 0,
        // According to the WAI-ARIA best practices, we should use aria-checked for
        // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
        // both single and multi-select.
        "aria-selected": selected.value,
        disabled: void 0,
        // Never forward the `disabled` prop
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerenter: handleEnter,
        onMouseenter: handleEnter,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "ListboxOption"
      });
    };
  }
});

// src/components/menu/menu.ts
var import_vue30 = require("vue");
function nextFrame2(cb) {
  requestAnimationFrame(() => requestAnimationFrame(cb));
}
var MenuContext = Symbol("MenuContext");
function useMenuContext(component) {
  let context = (0, import_vue30.inject)(MenuContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Menu /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useMenuContext);
    throw err;
  }
  return context;
}
var Menu = (0, import_vue30.defineComponent)({
  name: "Menu",
  props: { as: { type: [Object, String], default: "template" } },
  setup(props, { slots, attrs }) {
    let menuState = (0, import_vue30.ref)(1 /* Closed */);
    let buttonRef = (0, import_vue30.ref)(null);
    let itemsRef = (0, import_vue30.ref)(null);
    let items = (0, import_vue30.ref)([]);
    let searchQuery = (0, import_vue30.ref)("");
    let activeItemIndex = (0, import_vue30.ref)(null);
    let activationTrigger = (0, import_vue30.ref)(
      1 /* Other */
    );
    function adjustOrderedState(adjustment = (i) => i) {
      let currentActiveItem = activeItemIndex.value !== null ? items.value[activeItemIndex.value] : null;
      let sortedItems = sortByDomNode(
        adjustment(items.value.slice()),
        (item) => dom(item.dataRef.domRef)
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
    let api = {
      menuState,
      buttonRef,
      itemsRef,
      items,
      searchQuery,
      activeItemIndex,
      activationTrigger,
      closeMenu: () => {
        menuState.value = 1 /* Closed */;
        activeItemIndex.value = null;
      },
      openMenu: () => menuState.value = 0 /* Open */,
      goToItem(focus, id2, trigger) {
        let adjustedState = adjustOrderedState();
        let nextActiveItemIndex = calculateActiveIndex(
          focus === 4 /* Specific */ ? { focus: 4 /* Specific */, id: id2 } : { focus },
          {
            resolveItems: () => adjustedState.items,
            resolveActiveIndex: () => adjustedState.activeItemIndex,
            resolveId: (item) => item.id,
            resolveDisabled: (item) => item.dataRef.disabled
          }
        );
        searchQuery.value = "";
        activeItemIndex.value = nextActiveItemIndex;
        activationTrigger.value = trigger != null ? trigger : 1 /* Other */;
        items.value = adjustedState.items;
      },
      search(value) {
        let wasAlreadySearching = searchQuery.value !== "";
        let offset = wasAlreadySearching ? 0 : 1;
        searchQuery.value += value.toLowerCase();
        let reOrderedItems = activeItemIndex.value !== null ? items.value.slice(activeItemIndex.value + offset).concat(items.value.slice(0, activeItemIndex.value + offset)) : items.value;
        let matchingItem = reOrderedItems.find(
          (item) => item.dataRef.textValue.startsWith(searchQuery.value) && !item.dataRef.disabled
        );
        let matchIdx = matchingItem ? items.value.indexOf(matchingItem) : -1;
        if (matchIdx === -1 || matchIdx === activeItemIndex.value)
          return;
        activeItemIndex.value = matchIdx;
        activationTrigger.value = 1 /* Other */;
      },
      clearSearch() {
        searchQuery.value = "";
      },
      registerItem(id2, dataRef) {
        let adjustedState = adjustOrderedState((items2) => {
          return [...items2, { id: id2, dataRef }];
        });
        items.value = adjustedState.items;
        activeItemIndex.value = adjustedState.activeItemIndex;
        activationTrigger.value = 1 /* Other */;
      },
      unregisterItem(id2) {
        let adjustedState = adjustOrderedState((items2) => {
          let idx = items2.findIndex((a) => a.id === id2);
          if (idx !== -1)
            items2.splice(idx, 1);
          return items2;
        });
        items.value = adjustedState.items;
        activeItemIndex.value = adjustedState.activeItemIndex;
        activationTrigger.value = 1 /* Other */;
      }
    };
    useOutsideClick(
      [buttonRef, itemsRef],
      (event, target) => {
        var _a;
        api.closeMenu();
        if (!isFocusableElement(target, 1 /* Loose */)) {
          event.preventDefault();
          (_a = dom(buttonRef)) == null ? void 0 : _a.focus();
        }
      },
      (0, import_vue30.computed)(() => menuState.value === 0 /* Open */)
    );
    (0, import_vue30.provide)(MenuContext, api);
    useOpenClosedProvider(
      (0, import_vue30.computed)(
        () => match(menuState.value, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        })
      )
    );
    return () => {
      let slot = { open: menuState.value === 0 /* Open */, close: api.closeMenu };
      return render({ ourProps: {}, theirProps: props, slot, slots, attrs, name: "Menu" });
    };
  }
});
var MenuButton = (0, import_vue30.defineComponent)({
  name: "MenuButton",
  props: {
    disabled: { type: Boolean, default: false },
    as: { type: [Object, String], default: "button" },
    id: { type: String, default: () => `headlessui-menu-button-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useMenuContext("MenuButton");
    expose({ el: api.buttonRef, $el: api.buttonRef });
    function handleKeyDown(event) {
      switch (event.key) {
        case " " /* Space */:
        case "Enter" /* Enter */:
        case "ArrowDown" /* ArrowDown */:
          event.preventDefault();
          event.stopPropagation();
          api.openMenu();
          (0, import_vue30.nextTick)(() => {
            var _a;
            (_a = dom(api.itemsRef)) == null ? void 0 : _a.focus({ preventScroll: true });
            api.goToItem(0 /* First */);
          });
          break;
        case "ArrowUp" /* ArrowUp */:
          event.preventDefault();
          event.stopPropagation();
          api.openMenu();
          (0, import_vue30.nextTick)(() => {
            var _a;
            (_a = dom(api.itemsRef)) == null ? void 0 : _a.focus({ preventScroll: true });
            api.goToItem(3 /* Last */);
          });
          break;
      }
    }
    function handleKeyUp(event) {
      switch (event.key) {
        case " " /* Space */:
          event.preventDefault();
          break;
      }
    }
    function handleClick(event) {
      if (props.disabled)
        return;
      if (api.menuState.value === 0 /* Open */) {
        api.closeMenu();
        (0, import_vue30.nextTick)(() => {
          var _a;
          return (_a = dom(api.buttonRef)) == null ? void 0 : _a.focus({ preventScroll: true });
        });
      } else {
        event.preventDefault();
        api.openMenu();
        nextFrame2(() => {
          var _a;
          return (_a = dom(api.itemsRef)) == null ? void 0 : _a.focus({ preventScroll: true });
        });
      }
    }
    let type = useResolveButtonType(
      (0, import_vue30.computed)(() => ({ as: props.as, type: attrs.type })),
      api.buttonRef
    );
    return () => {
      var _a;
      let slot = { open: api.menuState.value === 0 /* Open */ };
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        ref: api.buttonRef,
        id: id2,
        type: type.value,
        "aria-haspopup": "menu",
        "aria-controls": (_a = dom(api.itemsRef)) == null ? void 0 : _a.id,
        "aria-expanded": api.menuState.value === 0 /* Open */,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        onClick: handleClick
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "MenuButton"
      });
    };
  }
});
var MenuItems = (0, import_vue30.defineComponent)({
  name: "MenuItems",
  props: {
    as: { type: [Object, String], default: "div" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    id: { type: String, default: () => `headlessui-menu-items-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useMenuContext("MenuItems");
    let searchDebounce = (0, import_vue30.ref)(null);
    expose({ el: api.itemsRef, $el: api.itemsRef });
    useTreeWalker({
      container: (0, import_vue30.computed)(() => dom(api.itemsRef)),
      enabled: (0, import_vue30.computed)(() => api.menuState.value === 0 /* Open */),
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
    function handleKeyDown(event) {
      var _a;
      if (searchDebounce.value)
        clearTimeout(searchDebounce.value);
      switch (event.key) {
        case " " /* Space */:
          if (api.searchQuery.value !== "") {
            event.preventDefault();
            event.stopPropagation();
            return api.search(event.key);
          }
        case "Enter" /* Enter */:
          event.preventDefault();
          event.stopPropagation();
          if (api.activeItemIndex.value !== null) {
            let activeItem = api.items.value[api.activeItemIndex.value];
            let _activeItem = activeItem;
            (_a = dom(_activeItem.dataRef.domRef)) == null ? void 0 : _a.click();
          }
          api.closeMenu();
          restoreFocusIfNecessary(dom(api.buttonRef));
          break;
        case "ArrowDown" /* ArrowDown */:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(2 /* Next */);
        case "ArrowUp" /* ArrowUp */:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(1 /* Previous */);
        case "Home" /* Home */:
        case "PageUp" /* PageUp */:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(0 /* First */);
        case "End" /* End */:
        case "PageDown" /* PageDown */:
          event.preventDefault();
          event.stopPropagation();
          return api.goToItem(3 /* Last */);
        case "Escape" /* Escape */:
          event.preventDefault();
          event.stopPropagation();
          api.closeMenu();
          (0, import_vue30.nextTick)(() => {
            var _a2;
            return (_a2 = dom(api.buttonRef)) == null ? void 0 : _a2.focus({ preventScroll: true });
          });
          break;
        case "Tab" /* Tab */:
          event.preventDefault();
          event.stopPropagation();
          api.closeMenu();
          (0, import_vue30.nextTick)(
            () => focusFrom(
              dom(api.buttonRef),
              event.shiftKey ? 2 /* Previous */ : 4 /* Next */
            )
          );
          break;
        default:
          if (event.key.length === 1) {
            api.search(event.key);
            searchDebounce.value = setTimeout(() => api.clearSearch(), 350);
          }
          break;
      }
    }
    function handleKeyUp(event) {
      switch (event.key) {
        case " " /* Space */:
          event.preventDefault();
          break;
      }
    }
    let usesOpenClosedState = useOpenClosed();
    let visible = (0, import_vue30.computed)(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return api.menuState.value === 0 /* Open */;
    });
    return () => {
      var _a, _b;
      let slot = { open: api.menuState.value === 0 /* Open */ };
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        "aria-activedescendant": api.activeItemIndex.value === null ? void 0 : (_a = api.items.value[api.activeItemIndex.value]) == null ? void 0 : _a.id,
        "aria-labelledby": (_b = dom(api.buttonRef)) == null ? void 0 : _b.id,
        id: id2,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        role: "menu",
        tabIndex: 0,
        ref: api.itemsRef
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        visible: visible.value,
        name: "MenuItems"
      });
    };
  }
});
var MenuItem = (0, import_vue30.defineComponent)({
  name: "MenuItem",
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: "template" },
    disabled: { type: Boolean, default: false },
    id: { type: String, default: () => `headlessui-menu-item-${useId()}` }
  },
  setup(props, { slots, attrs, expose }) {
    let api = useMenuContext("MenuItem");
    let internalItemRef = (0, import_vue30.ref)(null);
    expose({ el: internalItemRef, $el: internalItemRef });
    let active = (0, import_vue30.computed)(() => {
      return api.activeItemIndex.value !== null ? api.items.value[api.activeItemIndex.value].id === props.id : false;
    });
    let getTextValue2 = useTextValue(internalItemRef);
    let dataRef = (0, import_vue30.computed)(() => ({
      disabled: props.disabled,
      get textValue() {
        return getTextValue2();
      },
      domRef: internalItemRef
    }));
    (0, import_vue30.onMounted)(() => api.registerItem(props.id, dataRef));
    (0, import_vue30.onUnmounted)(() => api.unregisterItem(props.id));
    (0, import_vue30.watchEffect)(() => {
      if (api.menuState.value !== 0 /* Open */)
        return;
      if (!active.value)
        return;
      if (api.activationTrigger.value === 0 /* Pointer */)
        return;
      (0, import_vue30.nextTick)(() => {
        var _a, _b;
        return (_b = (_a = dom(internalItemRef)) == null ? void 0 : _a.scrollIntoView) == null ? void 0 : _b.call(_a, { block: "nearest" });
      });
    });
    function handleClick(event) {
      if (props.disabled)
        return event.preventDefault();
      api.closeMenu();
      restoreFocusIfNecessary(dom(api.buttonRef));
    }
    function handleFocus() {
      if (props.disabled)
        return api.goToItem(5 /* Nothing */);
      api.goToItem(4 /* Specific */, props.id);
    }
    let pointer = useTrackedPointer();
    function handleEnter(evt) {
      pointer.update(evt);
    }
    function handleMove(evt) {
      if (!pointer.wasMoved(evt))
        return;
      if (props.disabled)
        return;
      if (active.value)
        return;
      api.goToItem(4 /* Specific */, props.id, 0 /* Pointer */);
    }
    function handleLeave(evt) {
      if (!pointer.wasMoved(evt))
        return;
      if (props.disabled)
        return;
      if (!active.value)
        return;
      api.goToItem(5 /* Nothing */);
    }
    return () => {
      let { id: id2, disabled, ...theirProps } = props;
      let slot = { active: active.value, disabled, close: api.closeMenu };
      let ourProps = {
        id: id2,
        ref: internalItemRef,
        role: "menuitem",
        tabIndex: disabled === true ? void 0 : -1,
        "aria-disabled": disabled === true ? true : void 0,
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerenter: handleEnter,
        onMouseenter: handleEnter,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave
      };
      return render({
        ourProps,
        theirProps: { ...attrs, ...theirProps },
        slot,
        attrs,
        slots,
        name: "MenuItem"
      });
    };
  }
});

// src/components/popover/popover.ts
var import_vue31 = require("vue");
var PopoverContext = Symbol("PopoverContext");
function usePopoverContext(component) {
  let context = (0, import_vue31.inject)(PopoverContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Popover.name} /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, usePopoverContext);
    throw err;
  }
  return context;
}
var PopoverGroupContext = Symbol("PopoverGroupContext");
function usePopoverGroupContext() {
  return (0, import_vue31.inject)(PopoverGroupContext, null);
}
var PopoverPanelContext = Symbol("PopoverPanelContext");
function usePopoverPanelContext() {
  return (0, import_vue31.inject)(PopoverPanelContext, null);
}
var Popover = (0, import_vue31.defineComponent)({
  name: "Popover",
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: "div" }
  },
  setup(props, { slots, attrs, expose }) {
    var _a;
    let internalPopoverRef = (0, import_vue31.ref)(null);
    expose({ el: internalPopoverRef, $el: internalPopoverRef });
    let popoverState = (0, import_vue31.ref)(1 /* Closed */);
    let button = (0, import_vue31.ref)(null);
    let beforePanelSentinel = (0, import_vue31.ref)(null);
    let afterPanelSentinel = (0, import_vue31.ref)(null);
    let panel = (0, import_vue31.ref)(null);
    let ownerDocument = (0, import_vue31.computed)(() => getOwnerDocument(internalPopoverRef));
    let isPortalled = (0, import_vue31.computed)(() => {
      var _a2, _b;
      if (!dom(button))
        return false;
      if (!dom(panel))
        return false;
      for (let root2 of document.querySelectorAll("body > *")) {
        if (Number(root2 == null ? void 0 : root2.contains(dom(button))) ^ Number(root2 == null ? void 0 : root2.contains(dom(panel)))) {
          return true;
        }
      }
      let elements = getFocusableElements();
      let buttonIdx = elements.indexOf(dom(button));
      let beforeIdx = (buttonIdx + elements.length - 1) % elements.length;
      let afterIdx = (buttonIdx + 1) % elements.length;
      let beforeElement = elements[beforeIdx];
      let afterElement = elements[afterIdx];
      if (!((_a2 = dom(panel)) == null ? void 0 : _a2.contains(beforeElement)) && !((_b = dom(panel)) == null ? void 0 : _b.contains(afterElement))) {
        return true;
      }
      return false;
    });
    let api = {
      popoverState,
      buttonId: (0, import_vue31.ref)(null),
      panelId: (0, import_vue31.ref)(null),
      panel,
      button,
      isPortalled,
      beforePanelSentinel,
      afterPanelSentinel,
      togglePopover() {
        popoverState.value = match(popoverState.value, {
          [0 /* Open */]: 1 /* Closed */,
          [1 /* Closed */]: 0 /* Open */
        });
      },
      closePopover() {
        if (popoverState.value === 1 /* Closed */)
          return;
        popoverState.value = 1 /* Closed */;
      },
      close(focusableElement) {
        api.closePopover();
        let restoreElement = (() => {
          if (!focusableElement)
            return dom(api.button);
          if (focusableElement instanceof HTMLElement)
            return focusableElement;
          if (focusableElement.value instanceof HTMLElement)
            return dom(focusableElement);
          return dom(api.button);
        })();
        restoreElement == null ? void 0 : restoreElement.focus();
      }
    };
    (0, import_vue31.provide)(PopoverContext, api);
    useOpenClosedProvider(
      (0, import_vue31.computed)(
        () => match(popoverState.value, {
          [0 /* Open */]: 1 /* Open */,
          [1 /* Closed */]: 2 /* Closed */
        })
      )
    );
    let registerBag = {
      buttonId: api.buttonId,
      panelId: api.panelId,
      close() {
        api.closePopover();
      }
    };
    let groupContext = usePopoverGroupContext();
    let registerPopover = groupContext == null ? void 0 : groupContext.registerPopover;
    let [portals, PortalWrapper] = useNestedPortals();
    let root = useRootContainers({
      mainTreeNodeRef: groupContext == null ? void 0 : groupContext.mainTreeNodeRef,
      portals,
      defaultContainers: [button, panel]
    });
    function isFocusWithinPopoverGroup() {
      var _a2, _b, _c, _d;
      return (_d = groupContext == null ? void 0 : groupContext.isFocusWithinPopoverGroup()) != null ? _d : ((_a2 = ownerDocument.value) == null ? void 0 : _a2.activeElement) && (((_b = dom(button)) == null ? void 0 : _b.contains(ownerDocument.value.activeElement)) || ((_c = dom(panel)) == null ? void 0 : _c.contains(ownerDocument.value.activeElement)));
    }
    (0, import_vue31.watchEffect)(() => registerPopover == null ? void 0 : registerPopover(registerBag));
    useEventListener(
      (_a = ownerDocument.value) == null ? void 0 : _a.defaultView,
      "focus",
      (event) => {
        var _a2, _b;
        if (event.target === window)
          return;
        if (!(event.target instanceof HTMLElement))
          return;
        if (popoverState.value !== 0 /* Open */)
          return;
        if (isFocusWithinPopoverGroup())
          return;
        if (!button)
          return;
        if (!panel)
          return;
        if (root.contains(event.target))
          return;
        if ((_a2 = dom(api.beforePanelSentinel)) == null ? void 0 : _a2.contains(event.target))
          return;
        if ((_b = dom(api.afterPanelSentinel)) == null ? void 0 : _b.contains(event.target))
          return;
        api.closePopover();
      },
      true
    );
    useOutsideClick(
      root.resolveContainers,
      (event, target) => {
        var _a2;
        api.closePopover();
        if (!isFocusableElement(target, 1 /* Loose */)) {
          event.preventDefault();
          (_a2 = dom(button)) == null ? void 0 : _a2.focus();
        }
      },
      (0, import_vue31.computed)(() => popoverState.value === 0 /* Open */)
    );
    return () => {
      let slot = { open: popoverState.value === 0 /* Open */, close: api.close };
      return (0, import_vue31.h)(import_vue31.Fragment, [
        (0, import_vue31.h)(
          PortalWrapper,
          {},
          () => render({
            theirProps: { ...props, ...attrs },
            ourProps: { ref: internalPopoverRef },
            slot,
            slots,
            attrs,
            name: "Popover"
          })
        ),
        (0, import_vue31.h)(root.MainTreeNode)
      ]);
    };
  }
});
var PopoverButton = (0, import_vue31.defineComponent)({
  name: "PopoverButton",
  props: {
    as: { type: [Object, String], default: "button" },
    disabled: { type: [Boolean], default: false },
    id: { type: String, default: () => `headlessui-popover-button-${useId()}` }
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let api = usePopoverContext("PopoverButton");
    let ownerDocument = (0, import_vue31.computed)(() => getOwnerDocument(api.button));
    expose({ el: api.button, $el: api.button });
    (0, import_vue31.onMounted)(() => {
      api.buttonId.value = props.id;
    });
    (0, import_vue31.onUnmounted)(() => {
      api.buttonId.value = null;
    });
    let groupContext = usePopoverGroupContext();
    let closeOthers = groupContext == null ? void 0 : groupContext.closeOthers;
    let panelContext = usePopoverPanelContext();
    let isWithinPanel = (0, import_vue31.computed)(
      () => panelContext === null ? false : panelContext.value === api.panelId.value
    );
    let elementRef = (0, import_vue31.ref)(null);
    let sentinelId = `headlessui-focus-sentinel-${useId()}`;
    if (!isWithinPanel.value) {
      (0, import_vue31.watchEffect)(() => {
        api.button.value = dom(elementRef);
      });
    }
    let type = useResolveButtonType(
      (0, import_vue31.computed)(() => ({ as: props.as, type: attrs.type })),
      elementRef
    );
    function handleKeyDown(event) {
      var _a, _b, _c, _d, _e;
      if (isWithinPanel.value) {
        if (api.popoverState.value === 1 /* Closed */)
          return;
        switch (event.key) {
          case " " /* Space */:
          case "Enter" /* Enter */:
            event.preventDefault();
            (_b = (_a = event.target).click) == null ? void 0 : _b.call(_a);
            api.closePopover();
            (_c = dom(api.button)) == null ? void 0 : _c.focus();
            break;
        }
      } else {
        switch (event.key) {
          case " " /* Space */:
          case "Enter" /* Enter */:
            event.preventDefault();
            event.stopPropagation();
            if (api.popoverState.value === 1 /* Closed */)
              closeOthers == null ? void 0 : closeOthers(api.buttonId.value);
            api.togglePopover();
            break;
          case "Escape" /* Escape */:
            if (api.popoverState.value !== 0 /* Open */)
              return closeOthers == null ? void 0 : closeOthers(api.buttonId.value);
            if (!dom(api.button))
              return;
            if (((_d = ownerDocument.value) == null ? void 0 : _d.activeElement) && !((_e = dom(api.button)) == null ? void 0 : _e.contains(ownerDocument.value.activeElement)))
              return;
            event.preventDefault();
            event.stopPropagation();
            api.closePopover();
            break;
        }
      }
    }
    function handleKeyUp(event) {
      if (isWithinPanel.value)
        return;
      if (event.key === " " /* Space */) {
        event.preventDefault();
      }
    }
    function handleClick(event) {
      var _a, _b;
      if (props.disabled)
        return;
      if (isWithinPanel.value) {
        api.closePopover();
        (_a = dom(api.button)) == null ? void 0 : _a.focus();
      } else {
        event.preventDefault();
        event.stopPropagation();
        if (api.popoverState.value === 1 /* Closed */)
          closeOthers == null ? void 0 : closeOthers(api.buttonId.value);
        api.togglePopover();
        (_b = dom(api.button)) == null ? void 0 : _b.focus();
      }
    }
    function handleMouseDown(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    let direction = useTabDirection();
    function handleFocus() {
      let el = dom(api.panel);
      if (!el)
        return;
      function run() {
        let result = match(direction.value, {
          [0 /* Forwards */]: () => focusIn(el, 1 /* First */),
          [1 /* Backwards */]: () => focusIn(el, 8 /* Last */)
        });
        if (result === 0 /* Error */) {
          focusIn(
            getFocusableElements().filter((el2) => el2.dataset.headlessuiFocusGuard !== "true"),
            match(direction.value, {
              [0 /* Forwards */]: 4 /* Next */,
              [1 /* Backwards */]: 2 /* Previous */
            }),
            { relativeTo: dom(api.button) }
          );
        }
      }
      if (false) {
        microTask(run);
      } else {
        run();
      }
    }
    return () => {
      let visible = api.popoverState.value === 0 /* Open */;
      let slot = { open: visible };
      let { id: id2, ...theirProps } = props;
      let ourProps = isWithinPanel.value ? {
        ref: elementRef,
        type: type.value,
        onKeydown: handleKeyDown,
        onClick: handleClick
      } : {
        ref: elementRef,
        id: id2,
        type: type.value,
        "aria-expanded": api.popoverState.value === 0 /* Open */,
        "aria-controls": dom(api.panel) ? api.panelId.value : void 0,
        disabled: props.disabled ? true : void 0,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        onClick: handleClick,
        onMousedown: handleMouseDown
      };
      return (0, import_vue31.h)(import_vue31.Fragment, [
        render({
          ourProps,
          theirProps: { ...attrs, ...theirProps },
          slot,
          attrs,
          slots,
          name: "PopoverButton"
        }),
        visible && !isWithinPanel.value && api.isPortalled.value && (0, import_vue31.h)(Hidden, {
          id: sentinelId,
          features: 2 /* Focusable */,
          "data-headlessui-focus-guard": true,
          as: "button",
          type: "button",
          onFocus: handleFocus
        })
      ]);
    };
  }
});
var PopoverOverlay = (0, import_vue31.defineComponent)({
  name: "PopoverOverlay",
  props: {
    as: { type: [Object, String], default: "div" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true }
  },
  setup(props, { attrs, slots }) {
    let api = usePopoverContext("PopoverOverlay");
    let id2 = `headlessui-popover-overlay-${useId()}`;
    let usesOpenClosedState = useOpenClosed();
    let visible = (0, import_vue31.computed)(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return api.popoverState.value === 0 /* Open */;
    });
    function handleClick() {
      api.closePopover();
    }
    return () => {
      let slot = { open: api.popoverState.value === 0 /* Open */ };
      let ourProps = {
        id: id2,
        "aria-hidden": true,
        onClick: handleClick
      };
      return render({
        ourProps,
        theirProps: props,
        slot,
        attrs,
        slots,
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        visible: visible.value,
        name: "PopoverOverlay"
      });
    };
  }
});
var PopoverPanel = (0, import_vue31.defineComponent)({
  name: "PopoverPanel",
  props: {
    as: { type: [Object, String], default: "div" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    focus: { type: Boolean, default: false },
    id: { type: String, default: () => `headlessui-popover-panel-${useId()}` }
  },
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    let { focus } = props;
    let api = usePopoverContext("PopoverPanel");
    let ownerDocument = (0, import_vue31.computed)(() => getOwnerDocument(api.panel));
    let beforePanelSentinelId = `headlessui-focus-sentinel-before-${useId()}`;
    let afterPanelSentinelId = `headlessui-focus-sentinel-after-${useId()}`;
    expose({ el: api.panel, $el: api.panel });
    (0, import_vue31.onMounted)(() => {
      api.panelId.value = props.id;
    });
    (0, import_vue31.onUnmounted)(() => {
      api.panelId.value = null;
    });
    (0, import_vue31.provide)(PopoverPanelContext, api.panelId);
    (0, import_vue31.watchEffect)(() => {
      var _a, _b;
      if (!focus)
        return;
      if (api.popoverState.value !== 0 /* Open */)
        return;
      if (!api.panel)
        return;
      let activeElement = (_a = ownerDocument.value) == null ? void 0 : _a.activeElement;
      if ((_b = dom(api.panel)) == null ? void 0 : _b.contains(activeElement))
        return;
      focusIn(dom(api.panel), 1 /* First */);
    });
    let usesOpenClosedState = useOpenClosed();
    let visible = (0, import_vue31.computed)(() => {
      if (usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return api.popoverState.value === 0 /* Open */;
    });
    function handleKeyDown(event) {
      var _a, _b;
      switch (event.key) {
        case "Escape" /* Escape */:
          if (api.popoverState.value !== 0 /* Open */)
            return;
          if (!dom(api.panel))
            return;
          if (ownerDocument.value && !((_a = dom(api.panel)) == null ? void 0 : _a.contains(ownerDocument.value.activeElement))) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          api.closePopover();
          (_b = dom(api.button)) == null ? void 0 : _b.focus();
          break;
      }
    }
    function handleBlur(event) {
      var _a, _b, _c, _d, _e;
      let el = event.relatedTarget;
      if (!el)
        return;
      if (!dom(api.panel))
        return;
      if ((_a = dom(api.panel)) == null ? void 0 : _a.contains(el))
        return;
      api.closePopover();
      if (((_c = (_b = dom(api.beforePanelSentinel)) == null ? void 0 : _b.contains) == null ? void 0 : _c.call(_b, el)) || ((_e = (_d = dom(api.afterPanelSentinel)) == null ? void 0 : _d.contains) == null ? void 0 : _e.call(_d, el))) {
        el.focus({ preventScroll: true });
      }
    }
    let direction = useTabDirection();
    function handleBeforeFocus() {
      let el = dom(api.panel);
      if (!el)
        return;
      function run() {
        match(direction.value, {
          [0 /* Forwards */]: () => {
            var _a;
            let result = focusIn(el, 1 /* First */);
            if (result === 0 /* Error */) {
              (_a = dom(api.afterPanelSentinel)) == null ? void 0 : _a.focus();
            }
          },
          [1 /* Backwards */]: () => {
            var _a;
            (_a = dom(api.button)) == null ? void 0 : _a.focus({ preventScroll: true });
          }
        });
      }
      if (false) {
        microTask(run);
      } else {
        run();
      }
    }
    function handleAfterFocus() {
      let el = dom(api.panel);
      if (!el)
        return;
      function run() {
        match(direction.value, {
          [0 /* Forwards */]: () => {
            let button = dom(api.button);
            let panel = dom(api.panel);
            if (!button)
              return;
            let elements = getFocusableElements();
            let idx = elements.indexOf(button);
            let before = elements.slice(0, idx + 1);
            let after = elements.slice(idx + 1);
            let combined = [...after, ...before];
            for (let element of combined.slice()) {
              if (element.dataset.headlessuiFocusGuard === "true" || (panel == null ? void 0 : panel.contains(element))) {
                let idx2 = combined.indexOf(element);
                if (idx2 !== -1)
                  combined.splice(idx2, 1);
              }
            }
            focusIn(combined, 1 /* First */, { sorted: false });
          },
          [1 /* Backwards */]: () => {
            var _a;
            let result = focusIn(el, 2 /* Previous */);
            if (result === 0 /* Error */) {
              (_a = dom(api.button)) == null ? void 0 : _a.focus();
            }
          }
        });
      }
      if (false) {
        microTask(run);
      } else {
        run();
      }
    }
    return () => {
      let slot = {
        open: api.popoverState.value === 0 /* Open */,
        close: api.close
      };
      let { id: id2, focus: _focus, ...theirProps } = props;
      let ourProps = {
        ref: api.panel,
        id: id2,
        onKeydown: handleKeyDown,
        onFocusout: focus && api.popoverState.value === 0 /* Open */ ? handleBlur : void 0,
        tabIndex: -1
      };
      return render({
        ourProps,
        theirProps: { ...attrs, ...theirProps },
        attrs,
        slot,
        slots: {
          ...slots,
          default: (...args) => {
            var _a;
            return [
              (0, import_vue31.h)(import_vue31.Fragment, [
                visible.value && api.isPortalled.value && (0, import_vue31.h)(Hidden, {
                  id: beforePanelSentinelId,
                  ref: api.beforePanelSentinel,
                  features: 2 /* Focusable */,
                  "data-headlessui-focus-guard": true,
                  as: "button",
                  type: "button",
                  onFocus: handleBeforeFocus
                }),
                (_a = slots.default) == null ? void 0 : _a.call(slots, ...args),
                visible.value && api.isPortalled.value && (0, import_vue31.h)(Hidden, {
                  id: afterPanelSentinelId,
                  ref: api.afterPanelSentinel,
                  features: 2 /* Focusable */,
                  "data-headlessui-focus-guard": true,
                  as: "button",
                  type: "button",
                  onFocus: handleAfterFocus
                })
              ])
            ];
          }
        },
        features: 1 /* RenderStrategy */ | 2 /* Static */,
        visible: visible.value,
        name: "PopoverPanel"
      });
    };
  }
});
var PopoverGroup = (0, import_vue31.defineComponent)({
  name: "PopoverGroup",
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: "div" }
  },
  setup(props, { attrs, slots, expose }) {
    let groupRef = (0, import_vue31.ref)(null);
    let popovers = (0, import_vue31.shallowRef)([]);
    let ownerDocument = (0, import_vue31.computed)(() => getOwnerDocument(groupRef));
    let root = useMainTreeNode();
    expose({ el: groupRef, $el: groupRef });
    function unregisterPopover(registerBag) {
      let idx = popovers.value.indexOf(registerBag);
      if (idx !== -1)
        popovers.value.splice(idx, 1);
    }
    function registerPopover(registerBag) {
      popovers.value.push(registerBag);
      return () => {
        unregisterPopover(registerBag);
      };
    }
    function isFocusWithinPopoverGroup() {
      var _a;
      let owner = ownerDocument.value;
      if (!owner)
        return false;
      let element = owner.activeElement;
      if ((_a = dom(groupRef)) == null ? void 0 : _a.contains(element))
        return true;
      return popovers.value.some((bag) => {
        var _a2, _b;
        return ((_a2 = owner.getElementById(bag.buttonId.value)) == null ? void 0 : _a2.contains(element)) || ((_b = owner.getElementById(bag.panelId.value)) == null ? void 0 : _b.contains(element));
      });
    }
    function closeOthers(buttonId) {
      for (let popover of popovers.value) {
        if (popover.buttonId.value !== buttonId)
          popover.close();
      }
    }
    (0, import_vue31.provide)(PopoverGroupContext, {
      registerPopover,
      unregisterPopover,
      isFocusWithinPopoverGroup,
      closeOthers,
      mainTreeNodeRef: root.mainTreeNodeRef
    });
    return () => {
      let ourProps = { ref: groupRef };
      return (0, import_vue31.h)(import_vue31.Fragment, [
        render({
          ourProps,
          theirProps: { ...props, ...attrs },
          slot: {},
          attrs,
          slots,
          name: "PopoverGroup"
        }),
        (0, import_vue31.h)(root.MainTreeNode)
      ]);
    };
  }
});

// src/components/radio-group/radio-group.ts
var import_vue33 = require("vue");

// src/components/label/label.ts
var import_vue32 = require("vue");
var LabelContext = Symbol("LabelContext");
function useLabelContext() {
  let context = (0, import_vue32.inject)(LabelContext, null);
  if (context === null) {
    let err = new Error("You used a <Label /> component, but it is not inside a parent.");
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useLabelContext);
    throw err;
  }
  return context;
}
function useLabels({
  slot = {},
  name = "Label",
  props = {}
} = {}) {
  let labelIds = (0, import_vue32.ref)([]);
  function register(value) {
    labelIds.value.push(value);
    return () => {
      let idx = labelIds.value.indexOf(value);
      if (idx === -1)
        return;
      labelIds.value.splice(idx, 1);
    };
  }
  (0, import_vue32.provide)(LabelContext, { register, slot, name, props });
  return (0, import_vue32.computed)(() => labelIds.value.length > 0 ? labelIds.value.join(" ") : void 0);
}
var Label = (0, import_vue32.defineComponent)({
  name: "Label",
  props: {
    as: { type: [Object, String], default: "label" },
    passive: { type: [Boolean], default: false },
    id: { type: String, default: () => `headlessui-label-${useId()}` }
  },
  setup(myProps, { slots, attrs }) {
    let context = useLabelContext();
    (0, import_vue32.onMounted)(() => (0, import_vue32.onUnmounted)(context.register(myProps.id)));
    return () => {
      let { name = "Label", slot = {}, props = {} } = context;
      let { id: id2, passive, ...theirProps } = myProps;
      let ourProps = {
        ...Object.entries(props).reduce(
          (acc, [key, value]) => Object.assign(acc, { [key]: (0, import_vue32.unref)(value) }),
          {}
        ),
        id: id2
      };
      if (passive) {
        delete ourProps["onClick"];
        delete ourProps["htmlFor"];
        delete theirProps["onClick"];
      }
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name
      });
    };
  }
});

// src/components/radio-group/radio-group.ts
function defaultComparator3(a, z) {
  return a === z;
}
var RadioGroupContext = Symbol("RadioGroupContext");
function useRadioGroupContext(component) {
  let context = (0, import_vue33.inject)(RadioGroupContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <RadioGroup /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useRadioGroupContext);
    throw err;
  }
  return context;
}
var RadioGroup = (0, import_vue33.defineComponent)({
  name: "RadioGroup",
  emits: { "update:modelValue": (_value) => true },
  props: {
    as: { type: [Object, String], default: "div" },
    disabled: { type: [Boolean], default: false },
    by: { type: [String, Function], default: () => defaultComparator3 },
    modelValue: { type: [Object, String, Number, Boolean], default: void 0 },
    defaultValue: { type: [Object, String, Number, Boolean], default: void 0 },
    form: { type: String, optional: true },
    name: { type: String, optional: true },
    id: { type: String, default: () => `headlessui-radiogroup-${useId()}` }
  },
  inheritAttrs: false,
  setup(props, { emit, attrs, slots, expose }) {
    let radioGroupRef = (0, import_vue33.ref)(null);
    let options = (0, import_vue33.ref)([]);
    let labelledby = useLabels({ name: "RadioGroupLabel" });
    let describedby = useDescriptions({ name: "RadioGroupDescription" });
    expose({ el: radioGroupRef, $el: radioGroupRef });
    let [value, theirOnChange] = useControllable(
      (0, import_vue33.computed)(() => props.modelValue),
      (value2) => emit("update:modelValue", value2),
      (0, import_vue33.computed)(() => props.defaultValue)
    );
    let api = {
      options,
      value,
      disabled: (0, import_vue33.computed)(() => props.disabled),
      firstOption: (0, import_vue33.computed)(
        () => options.value.find((option) => {
          if (option.propsRef.disabled)
            return false;
          return true;
        })
      ),
      containsCheckedOption: (0, import_vue33.computed)(
        () => options.value.some(
          (option) => api.compare((0, import_vue33.toRaw)(option.propsRef.value), (0, import_vue33.toRaw)(props.modelValue))
        )
      ),
      compare(a, z) {
        if (typeof props.by === "string") {
          let property = props.by;
          return (a == null ? void 0 : a[property]) === (z == null ? void 0 : z[property]);
        }
        return props.by(a, z);
      },
      change(nextValue) {
        var _a;
        if (props.disabled)
          return false;
        if (api.compare((0, import_vue33.toRaw)(value.value), (0, import_vue33.toRaw)(nextValue)))
          return false;
        let nextOption = (_a = options.value.find(
          (option) => api.compare((0, import_vue33.toRaw)(option.propsRef.value), (0, import_vue33.toRaw)(nextValue))
        )) == null ? void 0 : _a.propsRef;
        if (nextOption == null ? void 0 : nextOption.disabled)
          return false;
        theirOnChange(nextValue);
        return true;
      },
      registerOption(action) {
        options.value.push(action);
        options.value = sortByDomNode(options.value, (option) => option.element);
      },
      unregisterOption(id2) {
        let idx = options.value.findIndex((radio) => radio.id === id2);
        if (idx === -1)
          return;
        options.value.splice(idx, 1);
      }
    };
    (0, import_vue33.provide)(RadioGroupContext, api);
    useTreeWalker({
      container: (0, import_vue33.computed)(() => dom(radioGroupRef)),
      accept(node) {
        if (node.getAttribute("role") === "radio")
          return NodeFilter.FILTER_REJECT;
        if (node.hasAttribute("role"))
          return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
      walk(node) {
        node.setAttribute("role", "none");
      }
    });
    function handleKeyDown(event) {
      if (!radioGroupRef.value)
        return;
      if (!radioGroupRef.value.contains(event.target))
        return;
      let all = options.value.filter((option) => option.propsRef.disabled === false).map((radio) => radio.element);
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
              let activeOption = options.value.find(
                (option) => {
                  var _a;
                  return option.element === ((_a = getOwnerDocument(radioGroupRef)) == null ? void 0 : _a.activeElement);
                }
              );
              if (activeOption)
                api.change(activeOption.propsRef.value);
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
              let activeOption = options.value.find(
                (option) => {
                  var _a;
                  return option.element === ((_a = getOwnerDocument(option.element)) == null ? void 0 : _a.activeElement);
                }
              );
              if (activeOption)
                api.change(activeOption.propsRef.value);
            }
          }
          break;
        case " " /* Space */:
          {
            event.preventDefault();
            event.stopPropagation();
            let activeOption = options.value.find(
              (option) => {
                var _a;
                return option.element === ((_a = getOwnerDocument(option.element)) == null ? void 0 : _a.activeElement);
              }
            );
            if (activeOption)
              api.change(activeOption.propsRef.value);
          }
          break;
      }
    }
    let form = (0, import_vue33.computed)(() => {
      var _a;
      return (_a = dom(radioGroupRef)) == null ? void 0 : _a.closest("form");
    });
    (0, import_vue33.onMounted)(() => {
      (0, import_vue33.watch)(
        [form],
        () => {
          if (!form.value)
            return;
          if (props.defaultValue === void 0)
            return;
          function handle() {
            api.change(props.defaultValue);
          }
          form.value.addEventListener("reset", handle);
          return () => {
            var _a;
            (_a = form.value) == null ? void 0 : _a.removeEventListener("reset", handle);
          };
        },
        { immediate: true }
      );
    });
    return () => {
      let { disabled, name, id: id2, form: form2, ...theirProps } = props;
      let ourProps = {
        ref: radioGroupRef,
        id: id2,
        role: "radiogroup",
        "aria-labelledby": labelledby.value,
        "aria-describedby": describedby.value,
        onKeydown: handleKeyDown
      };
      return (0, import_vue33.h)(import_vue33.Fragment, [
        ...name != null && value.value != null ? objectToFormEntries({ [name]: value.value }).map(
          ([name2, value2]) => (0, import_vue33.h)(
            Hidden,
            compact({
              features: 4 /* Hidden */,
              key: name2,
              as: "input",
              type: "hidden",
              hidden: true,
              readOnly: true,
              form: form2,
              disabled,
              name: name2,
              value: value2
            })
          )
        ) : [],
        render({
          ourProps,
          theirProps: { ...attrs, ...omit(theirProps, ["modelValue", "defaultValue", "by"]) },
          slot: {},
          attrs,
          slots,
          name: "RadioGroup"
        })
      ]);
    };
  }
});
var RadioGroupOption = (0, import_vue33.defineComponent)({
  name: "RadioGroupOption",
  props: {
    as: { type: [Object, String], default: "div" },
    value: { type: [Object, String, Number, Boolean] },
    disabled: { type: Boolean, default: false },
    id: { type: String, default: () => `headlessui-radiogroup-option-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useRadioGroupContext("RadioGroupOption");
    let labelledby = useLabels({ name: "RadioGroupLabel" });
    let describedby = useDescriptions({ name: "RadioGroupDescription" });
    let optionRef = (0, import_vue33.ref)(null);
    let propsRef = (0, import_vue33.computed)(() => ({ value: props.value, disabled: props.disabled }));
    let state = (0, import_vue33.ref)(1 /* Empty */);
    expose({ el: optionRef, $el: optionRef });
    let element = (0, import_vue33.computed)(() => dom(optionRef));
    (0, import_vue33.onMounted)(() => api.registerOption({ id: props.id, element, propsRef }));
    (0, import_vue33.onUnmounted)(() => api.unregisterOption(props.id));
    let isFirstOption = (0, import_vue33.computed)(() => {
      var _a;
      return ((_a = api.firstOption.value) == null ? void 0 : _a.id) === props.id;
    });
    let disabled = (0, import_vue33.computed)(() => api.disabled.value || props.disabled);
    let checked = (0, import_vue33.computed)(() => api.compare((0, import_vue33.toRaw)(api.value.value), (0, import_vue33.toRaw)(props.value)));
    let tabIndex = (0, import_vue33.computed)(() => {
      if (disabled.value)
        return -1;
      if (checked.value)
        return 0;
      if (!api.containsCheckedOption.value && isFirstOption.value)
        return 0;
      return -1;
    });
    function handleClick() {
      var _a;
      if (!api.change(props.value))
        return;
      state.value |= 2 /* Active */;
      (_a = dom(optionRef)) == null ? void 0 : _a.focus();
    }
    function handleFocus() {
      state.value |= 2 /* Active */;
    }
    function handleBlur() {
      state.value &= ~2 /* Active */;
    }
    return () => {
      let { id: id2, value: _value, disabled: _disabled, ...theirProps } = props;
      let slot = {
        checked: checked.value,
        disabled: disabled.value,
        active: Boolean(state.value & 2 /* Active */)
      };
      let ourProps = {
        id: id2,
        ref: optionRef,
        role: "radio",
        "aria-checked": checked.value ? "true" : "false",
        "aria-labelledby": labelledby.value,
        "aria-describedby": describedby.value,
        "aria-disabled": disabled.value ? true : void 0,
        tabIndex: tabIndex.value,
        onClick: disabled.value ? void 0 : handleClick,
        onFocus: disabled.value ? void 0 : handleFocus,
        onBlur: disabled.value ? void 0 : handleBlur
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "RadioGroupOption"
      });
    };
  }
});
var RadioGroupLabel = Label;
var RadioGroupDescription = Description;

// src/components/switch/switch.ts
var import_vue34 = require("vue");
var GroupContext = Symbol("GroupContext");
var SwitchGroup = (0, import_vue34.defineComponent)({
  name: "SwitchGroup",
  props: {
    as: { type: [Object, String], default: "template" }
  },
  setup(props, { slots, attrs }) {
    let switchRef = (0, import_vue34.ref)(null);
    let labelledby = useLabels({
      name: "SwitchLabel",
      props: {
        htmlFor: (0, import_vue34.computed)(() => {
          var _a;
          return (_a = switchRef.value) == null ? void 0 : _a.id;
        }),
        onClick(event) {
          if (!switchRef.value)
            return;
          if (event.currentTarget.tagName === "LABEL") {
            event.preventDefault();
          }
          switchRef.value.click();
          switchRef.value.focus({ preventScroll: true });
        }
      }
    });
    let describedby = useDescriptions({ name: "SwitchDescription" });
    let api = { switchRef, labelledby, describedby };
    (0, import_vue34.provide)(GroupContext, api);
    return () => render({ theirProps: props, ourProps: {}, slot: {}, slots, attrs, name: "SwitchGroup" });
  }
});
var Switch = (0, import_vue34.defineComponent)({
  name: "Switch",
  emits: { "update:modelValue": (_value) => true },
  props: {
    as: { type: [Object, String], default: "button" },
    modelValue: { type: Boolean, default: void 0 },
    defaultChecked: { type: Boolean, optional: true },
    form: { type: String, optional: true },
    name: { type: String, optional: true },
    value: { type: String, optional: true },
    id: { type: String, default: () => `headlessui-switch-${useId()}` },
    disabled: { type: Boolean, default: false },
    tabIndex: { type: Number, default: 0 }
  },
  inheritAttrs: false,
  setup(props, { emit, attrs, slots, expose }) {
    let api = (0, import_vue34.inject)(GroupContext, null);
    let [checked, theirOnChange] = useControllable(
      (0, import_vue34.computed)(() => props.modelValue),
      (value) => emit("update:modelValue", value),
      (0, import_vue34.computed)(() => props.defaultChecked)
    );
    function toggle() {
      theirOnChange(!checked.value);
    }
    let internalSwitchRef = (0, import_vue34.ref)(null);
    let switchRef = api === null ? internalSwitchRef : api.switchRef;
    let type = useResolveButtonType(
      (0, import_vue34.computed)(() => ({ as: props.as, type: attrs.type })),
      switchRef
    );
    expose({ el: switchRef, $el: switchRef });
    function handleClick(event) {
      event.preventDefault();
      toggle();
    }
    function handleKeyUp(event) {
      if (event.key === " " /* Space */) {
        event.preventDefault();
        toggle();
      } else if (event.key === "Enter" /* Enter */) {
        attemptSubmit(event.currentTarget);
      }
    }
    function handleKeyPress(event) {
      event.preventDefault();
    }
    let form = (0, import_vue34.computed)(() => {
      var _a, _b;
      return (_b = (_a = dom(switchRef)) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "form");
    });
    (0, import_vue34.onMounted)(() => {
      (0, import_vue34.watch)(
        [form],
        () => {
          if (!form.value)
            return;
          if (props.defaultChecked === void 0)
            return;
          function handle() {
            theirOnChange(props.defaultChecked);
          }
          form.value.addEventListener("reset", handle);
          return () => {
            var _a;
            (_a = form.value) == null ? void 0 : _a.removeEventListener("reset", handle);
          };
        },
        { immediate: true }
      );
    });
    return () => {
      let { id: id2, name, value, form: form2, tabIndex, ...theirProps } = props;
      let slot = { checked: checked.value };
      let ourProps = {
        id: id2,
        ref: switchRef,
        role: "switch",
        type: type.value,
        tabIndex: tabIndex === -1 ? 0 : tabIndex,
        "aria-checked": checked.value,
        "aria-labelledby": api == null ? void 0 : api.labelledby.value,
        "aria-describedby": api == null ? void 0 : api.describedby.value,
        onClick: handleClick,
        onKeyup: handleKeyUp,
        onKeypress: handleKeyPress
      };
      return (0, import_vue34.h)(import_vue34.Fragment, [
        name != null && checked.value != null ? (0, import_vue34.h)(
          Hidden,
          compact({
            features: 4 /* Hidden */,
            as: "input",
            type: "checkbox",
            hidden: true,
            readOnly: true,
            checked: checked.value,
            form: form2,
            disabled: theirProps.disabled,
            name,
            value
          })
        ) : null,
        render({
          ourProps,
          theirProps: { ...attrs, ...omit(theirProps, ["modelValue", "defaultChecked"]) },
          slot,
          attrs,
          slots,
          name: "Switch"
        })
      ]);
    };
  }
});
var SwitchLabel = Label;
var SwitchDescription = Description;

// src/components/tabs/tabs.ts
var import_vue36 = require("vue");

// src/internal/focus-sentinel.ts
var import_vue35 = require("vue");
var FocusSentinel = (0, import_vue35.defineComponent)({
  props: {
    onFocus: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    let enabled = (0, import_vue35.ref)(true);
    return () => {
      if (!enabled.value)
        return null;
      return (0, import_vue35.h)(Hidden, {
        as: "button",
        type: "button",
        features: 2 /* Focusable */,
        onFocus(event) {
          event.preventDefault();
          let frame;
          let tries = 50;
          function forwardFocus() {
            var _a;
            if (tries-- <= 0) {
              if (frame)
                cancelAnimationFrame(frame);
              return;
            }
            if ((_a = props.onFocus) == null ? void 0 : _a.call(props)) {
              enabled.value = false;
              cancelAnimationFrame(frame);
              return;
            }
            frame = requestAnimationFrame(forwardFocus);
          }
          frame = requestAnimationFrame(forwardFocus);
        }
      });
    };
  }
});

// src/components/tabs/tabs.ts
var TabsContext = Symbol("TabsContext");
function useTabsContext(component) {
  let context = (0, import_vue36.inject)(TabsContext, null);
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <TabGroup /> component.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, useTabsContext);
    throw err;
  }
  return context;
}
var TabsSSRContext = Symbol("TabsSSRContext");
var TabGroup = (0, import_vue36.defineComponent)({
  name: "TabGroup",
  emits: {
    change: (_index) => true
  },
  props: {
    as: { type: [Object, String], default: "template" },
    selectedIndex: { type: [Number], default: null },
    defaultIndex: { type: [Number], default: 0 },
    vertical: { type: [Boolean], default: false },
    manual: { type: [Boolean], default: false }
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, emit }) {
    var _a;
    let selectedIndex = (0, import_vue36.ref)(
      (_a = props.selectedIndex) != null ? _a : props.defaultIndex
    );
    let tabs = (0, import_vue36.ref)([]);
    let panels = (0, import_vue36.ref)([]);
    let isControlled = (0, import_vue36.computed)(() => props.selectedIndex !== null);
    let realSelectedIndex = (0, import_vue36.computed)(
      () => isControlled.value ? props.selectedIndex : selectedIndex.value
    );
    function setSelectedIndex(indexToSet) {
      var _a2;
      let tabs2 = sortByDomNode(api.tabs.value, dom);
      let panels2 = sortByDomNode(api.panels.value, dom);
      let focusableTabs = tabs2.filter((tab) => {
        var _a3;
        return !((_a3 = dom(tab)) == null ? void 0 : _a3.hasAttribute("disabled"));
      });
      if (
        // Underflow
        indexToSet < 0 || // Overflow
        indexToSet > tabs2.length - 1
      ) {
        let direction = match(
          selectedIndex.value === null ? 0 /* Equal */ : Math.sign(indexToSet - selectedIndex.value),
          {
            [-1 /* Less */]: () => 1 /* Backwards */,
            [0 /* Equal */]: () => {
              return match(Math.sign(indexToSet), {
                [-1 /* Less */]: () => 0 /* Forwards */,
                [0 /* Equal */]: () => 0 /* Forwards */,
                [1 /* Greater */]: () => 1 /* Backwards */
              });
            },
            [1 /* Greater */]: () => 0 /* Forwards */
          }
        );
        let nextSelectedIndex = match(direction, {
          [0 /* Forwards */]: () => tabs2.indexOf(focusableTabs[0]),
          [1 /* Backwards */]: () => tabs2.indexOf(focusableTabs[focusableTabs.length - 1])
        });
        if (nextSelectedIndex !== -1) {
          selectedIndex.value = nextSelectedIndex;
        }
        api.tabs.value = tabs2;
        api.panels.value = panels2;
      } else {
        let before = tabs2.slice(0, indexToSet);
        let after = tabs2.slice(indexToSet);
        let next = [...after, ...before].find((tab) => focusableTabs.includes(tab));
        if (!next)
          return;
        let localSelectedIndex = (_a2 = tabs2.indexOf(next)) != null ? _a2 : api.selectedIndex.value;
        if (localSelectedIndex === -1)
          localSelectedIndex = api.selectedIndex.value;
        selectedIndex.value = localSelectedIndex;
        api.tabs.value = tabs2;
        api.panels.value = panels2;
      }
    }
    let api = {
      selectedIndex: (0, import_vue36.computed)(() => {
        var _a2, _b;
        return (_b = (_a2 = selectedIndex.value) != null ? _a2 : props.defaultIndex) != null ? _b : null;
      }),
      orientation: (0, import_vue36.computed)(() => props.vertical ? "vertical" : "horizontal"),
      activation: (0, import_vue36.computed)(() => props.manual ? "manual" : "auto"),
      tabs,
      panels,
      setSelectedIndex(index) {
        if (realSelectedIndex.value !== index) {
          emit("change", index);
        }
        if (!isControlled.value) {
          setSelectedIndex(index);
        }
      },
      registerTab(tab) {
        var _a2;
        if (tabs.value.includes(tab))
          return;
        let activeTab = tabs.value[selectedIndex.value];
        tabs.value.push(tab);
        tabs.value = sortByDomNode(tabs.value, dom);
        if (!isControlled.value) {
          let localSelectedIndex = (_a2 = tabs.value.indexOf(activeTab)) != null ? _a2 : selectedIndex.value;
          if (localSelectedIndex !== -1) {
            selectedIndex.value = localSelectedIndex;
          }
        }
      },
      unregisterTab(tab) {
        let idx = tabs.value.indexOf(tab);
        if (idx !== -1)
          tabs.value.splice(idx, 1);
      },
      registerPanel(panel) {
        if (panels.value.includes(panel))
          return;
        panels.value.push(panel);
        panels.value = sortByDomNode(panels.value, dom);
      },
      unregisterPanel(panel) {
        let idx = panels.value.indexOf(panel);
        if (idx !== -1)
          panels.value.splice(idx, 1);
      }
    };
    (0, import_vue36.provide)(TabsContext, api);
    let SSRCounter = (0, import_vue36.ref)({ tabs: [], panels: [] });
    let mounted = (0, import_vue36.ref)(false);
    (0, import_vue36.onMounted)(() => {
      mounted.value = true;
    });
    (0, import_vue36.provide)(
      TabsSSRContext,
      (0, import_vue36.computed)(() => mounted.value ? null : SSRCounter.value)
    );
    let incomingSelectedIndex = (0, import_vue36.computed)(() => props.selectedIndex);
    (0, import_vue36.onMounted)(() => {
      (0, import_vue36.watch)(
        [
          incomingSelectedIndex
          /* Deliberately skipping defaultIndex */
        ],
        () => {
          var _a2;
          return setSelectedIndex((_a2 = props.selectedIndex) != null ? _a2 : props.defaultIndex);
        },
        { immediate: true }
      );
    });
    (0, import_vue36.watchEffect)(() => {
      if (!isControlled.value)
        return;
      if (realSelectedIndex.value == null)
        return;
      if (api.tabs.value.length <= 0)
        return;
      let sorted = sortByDomNode(api.tabs.value, dom);
      let didOrderChange = sorted.some((tab, i) => dom(api.tabs.value[i]) !== dom(tab));
      if (didOrderChange) {
        api.setSelectedIndex(
          sorted.findIndex((x) => dom(x) === dom(api.tabs.value[realSelectedIndex.value]))
        );
      }
    });
    return () => {
      let slot = { selectedIndex: selectedIndex.value };
      return (0, import_vue36.h)(import_vue36.Fragment, [
        tabs.value.length <= 0 && (0, import_vue36.h)(FocusSentinel, {
          onFocus: () => {
            for (let tab of tabs.value) {
              let el = dom(tab);
              if ((el == null ? void 0 : el.tabIndex) === 0) {
                el.focus();
                return true;
              }
            }
            return false;
          }
        }),
        render({
          theirProps: {
            ...attrs,
            ...omit(props, ["selectedIndex", "defaultIndex", "manual", "vertical", "onChange"])
          },
          ourProps: {},
          slot,
          slots,
          attrs,
          name: "TabGroup"
        })
      ]);
    };
  }
});
var TabList = (0, import_vue36.defineComponent)({
  name: "TabList",
  props: {
    as: { type: [Object, String], default: "div" }
  },
  setup(props, { attrs, slots }) {
    let api = useTabsContext("TabList");
    return () => {
      let slot = { selectedIndex: api.selectedIndex.value };
      let ourProps = {
        role: "tablist",
        "aria-orientation": api.orientation.value
      };
      let theirProps = props;
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "TabList"
      });
    };
  }
});
var Tab = (0, import_vue36.defineComponent)({
  name: "Tab",
  props: {
    as: { type: [Object, String], default: "button" },
    disabled: { type: [Boolean], default: false },
    id: { type: String, default: () => `headlessui-tabs-tab-${useId()}` }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useTabsContext("Tab");
    let internalTabRef = (0, import_vue36.ref)(null);
    expose({ el: internalTabRef, $el: internalTabRef });
    (0, import_vue36.onMounted)(() => api.registerTab(internalTabRef));
    (0, import_vue36.onUnmounted)(() => api.unregisterTab(internalTabRef));
    let SSRContext = (0, import_vue36.inject)(TabsSSRContext);
    let mySSRIndex = (0, import_vue36.computed)(() => {
      if (SSRContext.value) {
        let mySSRIndex2 = SSRContext.value.tabs.indexOf(props.id);
        if (mySSRIndex2 === -1)
          return SSRContext.value.tabs.push(props.id) - 1;
        return mySSRIndex2;
      }
      return -1;
    });
    let myIndex = (0, import_vue36.computed)(() => {
      let myIndex2 = api.tabs.value.indexOf(internalTabRef);
      if (myIndex2 === -1)
        return mySSRIndex.value;
      return myIndex2;
    });
    let selected = (0, import_vue36.computed)(() => myIndex.value === api.selectedIndex.value);
    function activateUsing(cb) {
      var _a;
      let result = cb();
      if (result === 2 /* Success */ && api.activation.value === "auto") {
        let newTab = (_a = getOwnerDocument(internalTabRef)) == null ? void 0 : _a.activeElement;
        let idx = api.tabs.value.findIndex((tab) => dom(tab) === newTab);
        if (idx !== -1)
          api.setSelectedIndex(idx);
      }
      return result;
    }
    function handleKeyDown(event) {
      let list = api.tabs.value.map((tab) => dom(tab)).filter(Boolean);
      if (event.key === " " /* Space */ || event.key === "Enter" /* Enter */) {
        event.preventDefault();
        event.stopPropagation();
        api.setSelectedIndex(myIndex.value);
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
      let result = activateUsing(
        () => match(api.orientation.value, {
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
        })
      );
      if (result === 2 /* Success */) {
        return event.preventDefault();
      }
    }
    let ready = (0, import_vue36.ref)(false);
    function handleSelection() {
      var _a;
      if (ready.value)
        return;
      ready.value = true;
      if (props.disabled)
        return;
      (_a = dom(internalTabRef)) == null ? void 0 : _a.focus({ preventScroll: true });
      api.setSelectedIndex(myIndex.value);
      microTask(() => {
        ready.value = false;
      });
    }
    function handleMouseDown(event) {
      event.preventDefault();
    }
    let type = useResolveButtonType(
      (0, import_vue36.computed)(() => ({ as: props.as, type: attrs.type })),
      internalTabRef
    );
    return () => {
      var _a, _b;
      let slot = { selected: selected.value, disabled: (_a = props.disabled) != null ? _a : false };
      let { id: id2, ...theirProps } = props;
      let ourProps = {
        ref: internalTabRef,
        onKeydown: handleKeyDown,
        onMousedown: handleMouseDown,
        onClick: handleSelection,
        id: id2,
        role: "tab",
        type: type.value,
        "aria-controls": (_b = dom(api.panels.value[myIndex.value])) == null ? void 0 : _b.id,
        "aria-selected": selected.value,
        tabIndex: selected.value ? 0 : -1,
        disabled: props.disabled ? true : void 0
      };
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: "Tab"
      });
    };
  }
});
var TabPanels = (0, import_vue36.defineComponent)({
  name: "TabPanels",
  props: {
    as: { type: [Object, String], default: "div" }
  },
  setup(props, { slots, attrs }) {
    let api = useTabsContext("TabPanels");
    return () => {
      let slot = { selectedIndex: api.selectedIndex.value };
      return render({
        theirProps: props,
        ourProps: {},
        slot,
        attrs,
        slots,
        name: "TabPanels"
      });
    };
  }
});
var TabPanel = (0, import_vue36.defineComponent)({
  name: "TabPanel",
  props: {
    as: { type: [Object, String], default: "div" },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    id: { type: String, default: () => `headlessui-tabs-panel-${useId()}` },
    tabIndex: { type: Number, default: 0 }
  },
  setup(props, { attrs, slots, expose }) {
    let api = useTabsContext("TabPanel");
    let internalPanelRef = (0, import_vue36.ref)(null);
    expose({ el: internalPanelRef, $el: internalPanelRef });
    (0, import_vue36.onMounted)(() => api.registerPanel(internalPanelRef));
    (0, import_vue36.onUnmounted)(() => api.unregisterPanel(internalPanelRef));
    let SSRContext = (0, import_vue36.inject)(TabsSSRContext);
    let mySSRIndex = (0, import_vue36.computed)(() => {
      if (SSRContext.value) {
        let mySSRIndex2 = SSRContext.value.panels.indexOf(props.id);
        if (mySSRIndex2 === -1)
          return SSRContext.value.panels.push(props.id) - 1;
        return mySSRIndex2;
      }
      return -1;
    });
    let myIndex = (0, import_vue36.computed)(() => {
      let myIndex2 = api.panels.value.indexOf(internalPanelRef);
      if (myIndex2 === -1)
        return mySSRIndex.value;
      return myIndex2;
    });
    let selected = (0, import_vue36.computed)(() => myIndex.value === api.selectedIndex.value);
    return () => {
      var _a;
      let slot = { selected: selected.value };
      let { id: id2, tabIndex, ...theirProps } = props;
      let ourProps = {
        ref: internalPanelRef,
        id: id2,
        role: "tabpanel",
        "aria-labelledby": (_a = dom(api.tabs.value[myIndex.value])) == null ? void 0 : _a.id,
        tabIndex: selected.value ? tabIndex : -1
      };
      if (!selected.value && props.unmount && !props.static) {
        return (0, import_vue36.h)(Hidden, { as: "span", "aria-hidden": true, ...ourProps });
      }
      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        features: 2 /* Static */ | 1 /* RenderStrategy */,
        visible: selected.value,
        name: "TabPanel"
      });
    };
  }
});

// src/components/transitions/transition.ts
var import_vue37 = require("vue");

// src/utils/once.ts
function once(cb) {
  let state = { called: false };
  return (...args) => {
    if (state.called)
      return;
    state.called = true;
    return cb(...args);
  };
}

// src/components/transitions/utils/transition.ts
function addClasses(node, ...classes) {
  node && classes.length > 0 && node.classList.add(...classes);
}
function removeClasses(node, ...classes) {
  node && classes.length > 0 && node.classList.remove(...classes);
}
function waitForTransition(node, done) {
  let d = disposables();
  if (!node)
    return d.dispose;
  let { transitionDuration, transitionDelay } = getComputedStyle(node);
  let [durationMs, delaysMs] = [transitionDuration, transitionDelay].map((value) => {
    let [resolvedValue = 0] = value.split(",").filter(Boolean).map((v) => v.includes("ms") ? parseFloat(v) : parseFloat(v) * 1e3).sort((a, z) => z - a);
    return resolvedValue;
  });
  if (durationMs !== 0) {
    d.setTimeout(() => done("finished" /* Finished */), durationMs + delaysMs);
  } else {
    done("finished" /* Finished */);
  }
  d.add(() => done("cancelled" /* Cancelled */));
  return d.dispose;
}
function transition(node, base, from, to, entered, done) {
  let d = disposables();
  let _done = done !== void 0 ? once(done) : () => {
  };
  removeClasses(node, ...entered);
  addClasses(node, ...base, ...from);
  d.nextFrame(() => {
    removeClasses(node, ...from);
    addClasses(node, ...to);
    d.add(
      waitForTransition(node, (reason) => {
        removeClasses(node, ...to, ...base);
        addClasses(node, ...entered);
        return _done(reason);
      })
    );
  });
  d.add(() => removeClasses(node, ...base, ...from, ...to, ...entered));
  d.add(() => _done("cancelled" /* Cancelled */));
  return d.dispose;
}

// src/components/transitions/transition.ts
function splitClasses(classes = "") {
  return classes.split(/\s+/).filter((className) => className.length > 1);
}
var TransitionContext = Symbol("TransitionContext");
function hasTransitionContext() {
  return (0, import_vue37.inject)(TransitionContext, null) !== null;
}
function useTransitionContext() {
  let context = (0, import_vue37.inject)(TransitionContext, null);
  if (context === null) {
    throw new Error("A <TransitionChild /> is used but it is missing a parent <TransitionRoot />.");
  }
  return context;
}
function useParentNesting() {
  let context = (0, import_vue37.inject)(NestingContext, null);
  if (context === null) {
    throw new Error("A <TransitionChild /> is used but it is missing a parent <TransitionRoot />.");
  }
  return context;
}
var NestingContext = Symbol("NestingContext");
function hasChildren(bag) {
  if ("children" in bag)
    return hasChildren(bag.children);
  return bag.value.filter(({ state }) => state === "visible" /* Visible */).length > 0;
}
function useNesting(done) {
  let transitionableChildren = (0, import_vue37.ref)([]);
  let mounted = (0, import_vue37.ref)(false);
  (0, import_vue37.onMounted)(() => mounted.value = true);
  (0, import_vue37.onUnmounted)(() => mounted.value = false);
  function unregister(childId, strategy = 1 /* Hidden */) {
    let idx = transitionableChildren.value.findIndex(({ id: id2 }) => id2 === childId);
    if (idx === -1)
      return;
    match(strategy, {
      [0 /* Unmount */]() {
        transitionableChildren.value.splice(idx, 1);
      },
      [1 /* Hidden */]() {
        transitionableChildren.value[idx].state = "hidden" /* Hidden */;
      }
    });
    if (!hasChildren(transitionableChildren) && mounted.value) {
      done == null ? void 0 : done();
    }
  }
  function register(childId) {
    let child = transitionableChildren.value.find(({ id: id2 }) => id2 === childId);
    if (!child) {
      transitionableChildren.value.push({ id: childId, state: "visible" /* Visible */ });
    } else if (child.state !== "visible" /* Visible */) {
      child.state = "visible" /* Visible */;
    }
    return () => unregister(childId, 0 /* Unmount */);
  }
  return {
    children: transitionableChildren,
    register,
    unregister
  };
}
var TransitionChildRenderFeatures = 1 /* RenderStrategy */;
var TransitionChild = (0, import_vue37.defineComponent)({
  props: {
    as: { type: [Object, String], default: "div" },
    show: { type: [Boolean], default: null },
    unmount: { type: [Boolean], default: true },
    appear: { type: [Boolean], default: false },
    enter: { type: [String], default: "" },
    enterFrom: { type: [String], default: "" },
    enterTo: { type: [String], default: "" },
    entered: { type: [String], default: "" },
    leave: { type: [String], default: "" },
    leaveFrom: { type: [String], default: "" },
    leaveTo: { type: [String], default: "" }
  },
  emits: {
    beforeEnter: () => true,
    afterEnter: () => true,
    beforeLeave: () => true,
    afterLeave: () => true
  },
  setup(props, { emit, attrs, slots, expose }) {
    let transitionStateFlags = (0, import_vue37.ref)(0);
    function beforeEnter() {
      transitionStateFlags.value |= 8 /* Opening */;
      emit("beforeEnter");
    }
    function afterEnter() {
      transitionStateFlags.value &= ~8 /* Opening */;
      emit("afterEnter");
    }
    function beforeLeave() {
      transitionStateFlags.value |= 4 /* Closing */;
      emit("beforeLeave");
    }
    function afterLeave() {
      transitionStateFlags.value &= ~4 /* Closing */;
      emit("afterLeave");
    }
    if (!hasTransitionContext() && hasOpenClosed()) {
      return () => (0, import_vue37.h)(
        TransitionRoot,
        {
          ...props,
          onBeforeEnter: beforeEnter,
          onAfterEnter: afterEnter,
          onBeforeLeave: beforeLeave,
          onAfterLeave: afterLeave
        },
        slots
      );
    }
    let container = (0, import_vue37.ref)(null);
    let strategy = (0, import_vue37.computed)(() => props.unmount ? 0 /* Unmount */ : 1 /* Hidden */);
    expose({ el: container, $el: container });
    let { show, appear } = useTransitionContext();
    let { register, unregister } = useParentNesting();
    let state = (0, import_vue37.ref)(show.value ? "visible" /* Visible */ : "hidden" /* Hidden */);
    let initial = { value: true };
    let id2 = useId();
    let isTransitioning = { value: false };
    let nesting = useNesting(() => {
      if (!isTransitioning.value && state.value !== "hidden" /* Hidden */) {
        state.value = "hidden" /* Hidden */;
        unregister(id2);
        afterLeave();
      }
    });
    (0, import_vue37.onMounted)(() => {
      let unregister2 = register(id2);
      (0, import_vue37.onUnmounted)(unregister2);
    });
    (0, import_vue37.watchEffect)(() => {
      if (strategy.value !== 1 /* Hidden */)
        return;
      if (!id2)
        return;
      if (show.value && state.value !== "visible" /* Visible */) {
        state.value = "visible" /* Visible */;
        return;
      }
      match(state.value, {
        ["hidden" /* Hidden */]: () => unregister(id2),
        ["visible" /* Visible */]: () => register(id2)
      });
    });
    let enterClasses = splitClasses(props.enter);
    let enterFromClasses = splitClasses(props.enterFrom);
    let enterToClasses = splitClasses(props.enterTo);
    let enteredClasses = splitClasses(props.entered);
    let leaveClasses = splitClasses(props.leave);
    let leaveFromClasses = splitClasses(props.leaveFrom);
    let leaveToClasses = splitClasses(props.leaveTo);
    (0, import_vue37.onMounted)(() => {
      (0, import_vue37.watchEffect)(() => {
        if (state.value === "visible" /* Visible */) {
          let domElement = dom(container);
          let isEmptyDOMNode = domElement instanceof Comment && domElement.data === "";
          if (isEmptyDOMNode) {
            throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?");
          }
        }
      });
    });
    function executeTransition(onInvalidate) {
      let skip = initial.value && !appear.value;
      let node = dom(container);
      if (!node || !(node instanceof HTMLElement))
        return;
      if (skip)
        return;
      isTransitioning.value = true;
      if (show.value)
        beforeEnter();
      if (!show.value)
        beforeLeave();
      onInvalidate(
        show.value ? transition(
          node,
          enterClasses,
          enterFromClasses,
          enterToClasses,
          enteredClasses,
          (reason) => {
            isTransitioning.value = false;
            if (reason === "finished" /* Finished */)
              afterEnter();
          }
        ) : transition(
          node,
          leaveClasses,
          leaveFromClasses,
          leaveToClasses,
          enteredClasses,
          (reason) => {
            isTransitioning.value = false;
            if (reason !== "finished" /* Finished */)
              return;
            if (!hasChildren(nesting)) {
              state.value = "hidden" /* Hidden */;
              unregister(id2);
              afterLeave();
            }
          }
        )
      );
    }
    (0, import_vue37.onMounted)(() => {
      (0, import_vue37.watch)(
        [show],
        (_oldValues, _newValues, onInvalidate) => {
          executeTransition(onInvalidate);
          initial.value = false;
        },
        { immediate: true }
      );
    });
    (0, import_vue37.provide)(NestingContext, nesting);
    useOpenClosedProvider(
      (0, import_vue37.computed)(
        () => match(state.value, {
          ["visible" /* Visible */]: 1 /* Open */,
          ["hidden" /* Hidden */]: 2 /* Closed */
        }) | transitionStateFlags.value
      )
    );
    return () => {
      let {
        appear: _appear,
        show: _show,
        // Class names
        enter,
        enterFrom,
        enterTo,
        entered,
        leave,
        leaveFrom,
        leaveTo,
        ...rest
      } = props;
      let ourProps = { ref: container };
      let theirProps = {
        ...rest,
        ...appear.value && show.value && env.isServer ? {
          // Already apply the `enter` and `enterFrom` on the server if required
          class: (0, import_vue37.normalizeClass)([
            attrs.class,
            // @ts-expect-error not explicitly defined
            rest.class,
            ...enterClasses,
            ...enterFromClasses
          ])
        } : {}
      };
      return render({
        theirProps,
        ourProps,
        slot: {},
        slots,
        attrs,
        features: TransitionChildRenderFeatures,
        visible: state.value === "visible" /* Visible */,
        name: "TransitionChild"
      });
    };
  }
});
var _TransitionChild = TransitionChild;
var TransitionRoot = (0, import_vue37.defineComponent)({
  inheritAttrs: false,
  props: {
    as: { type: [Object, String], default: "div" },
    show: { type: [Boolean], default: null },
    unmount: { type: [Boolean], default: true },
    appear: { type: [Boolean], default: false },
    enter: { type: [String], default: "" },
    enterFrom: { type: [String], default: "" },
    enterTo: { type: [String], default: "" },
    entered: { type: [String], default: "" },
    leave: { type: [String], default: "" },
    leaveFrom: { type: [String], default: "" },
    leaveTo: { type: [String], default: "" }
  },
  emits: {
    beforeEnter: () => true,
    afterEnter: () => true,
    beforeLeave: () => true,
    afterLeave: () => true
  },
  setup(props, { emit, attrs, slots }) {
    let usesOpenClosedState = useOpenClosed();
    let show = (0, import_vue37.computed)(() => {
      if (props.show === null && usesOpenClosedState !== null) {
        return (usesOpenClosedState.value & 1 /* Open */) === 1 /* Open */;
      }
      return props.show;
    });
    (0, import_vue37.watchEffect)(() => {
      if (![true, false].includes(show.value)) {
        throw new Error('A <Transition /> is used but it is missing a `:show="true | false"` prop.');
      }
    });
    let state = (0, import_vue37.ref)(show.value ? "visible" /* Visible */ : "hidden" /* Hidden */);
    let nestingBag = useNesting(() => {
      state.value = "hidden" /* Hidden */;
    });
    let initial = (0, import_vue37.ref)(true);
    let transitionBag = {
      show,
      appear: (0, import_vue37.computed)(() => props.appear || !initial.value)
    };
    (0, import_vue37.onMounted)(() => {
      (0, import_vue37.watchEffect)(() => {
        initial.value = false;
        if (show.value) {
          state.value = "visible" /* Visible */;
        } else if (!hasChildren(nestingBag)) {
          state.value = "hidden" /* Hidden */;
        }
      });
    });
    (0, import_vue37.provide)(NestingContext, nestingBag);
    (0, import_vue37.provide)(TransitionContext, transitionBag);
    return () => {
      let theirProps = omit(props, [
        "show",
        "appear",
        "unmount",
        "onBeforeEnter",
        "onBeforeLeave",
        "onAfterEnter",
        "onAfterLeave"
      ]);
      let sharedProps = { unmount: props.unmount };
      return render({
        ourProps: {
          ...sharedProps,
          as: "template"
        },
        theirProps: {},
        slot: {},
        slots: {
          ...slots,
          default: () => [
            (0, import_vue37.h)(
              _TransitionChild,
              {
                onBeforeEnter: () => emit("beforeEnter"),
                onAfterEnter: () => emit("afterEnter"),
                onBeforeLeave: () => emit("beforeLeave"),
                onAfterLeave: () => emit("afterLeave"),
                ...attrs,
                ...sharedProps,
                ...theirProps
              },
              slots.default
            )
          ]
        },
        attrs: {},
        features: TransitionChildRenderFeatures,
        visible: state.value === "visible" /* Visible */,
        name: "Transition"
      });
    };
  }
});
/*! Bundled license information:

@tanstack/vue-virtual/build/lib/_virtual/_rollupPluginBabelHelpers.mjs:
  (**
   * vue-virtual
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@tanstack/virtual-core/build/lib/_virtual/_rollupPluginBabelHelpers.mjs:
  (**
   * virtual-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@tanstack/virtual-core/build/lib/utils.mjs:
  (**
   * virtual-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@tanstack/virtual-core/build/lib/index.mjs:
  (**
   * virtual-core
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@tanstack/vue-virtual/build/lib/index.mjs:
  (**
   * vue-virtual
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
