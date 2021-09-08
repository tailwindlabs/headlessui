import { extends as _extends, objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useReducer, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import { match } from '../../utils/match.esm.js';
import { render } from '../../utils/render.esm.js';
import { Keys } from '../keyboard.esm.js';
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { focusIn, FocusResult, Focus } from '../../utils/focus-management.esm.js';
import { useDescriptions, Description } from '../description/description.esm.js';
import { useTreeWalker } from '../../hooks/use-tree-walker.esm.js';
import { useFlags } from '../../hooks/use-flags.esm.js';
import { useLabels, Label } from '../label/label.esm.js';

var _reducers;
var ActionTypes;

(function (ActionTypes) {
  ActionTypes[ActionTypes["RegisterOption"] = 0] = "RegisterOption";
  ActionTypes[ActionTypes["UnregisterOption"] = 1] = "UnregisterOption";
})(ActionTypes || (ActionTypes = {}));

var reducers = (_reducers = {}, _reducers[ActionTypes.RegisterOption] = function (state, action) {
  return _extends({}, state, {
    options: [].concat(state.options, [{
      id: action.id,
      element: action.element,
      propsRef: action.propsRef
    }])
  });
}, _reducers[ActionTypes.UnregisterOption] = function (state, action) {
  var options = state.options.slice();
  var idx = state.options.findIndex(function (radio) {
    return radio.id === action.id;
  });
  if (idx === -1) return state;
  options.splice(idx, 1);
  return _extends({}, state, {
    options: options
  });
}, _reducers);
var RadioGroupContext = /*#__PURE__*/createContext(null);
RadioGroupContext.displayName = 'RadioGroupContext';

function useRadioGroupContext(component) {
  var context = useContext(RadioGroupContext);

  if (context === null) {
    var err = new Error("<" + component + " /> is missing a parent <" + RadioGroup.name + " /> component.");
    if (Error.captureStackTrace) Error.captureStackTrace(err, useRadioGroupContext);
    throw err;
  }

  return context;
}

function stateReducer(state, action) {
  return match(action.type, reducers, state, action);
} // ---


var DEFAULT_RADIO_GROUP_TAG = 'div';
function RadioGroup(props) {
  var value = props.value,
      onChange = props.onChange,
      _props$disabled = props.disabled,
      disabled = _props$disabled === void 0 ? false : _props$disabled,
      passThroughProps = _objectWithoutPropertiesLoose(props, ["value", "onChange", "disabled"]);

  var _useReducer = useReducer(stateReducer, {
    options: []
  }),
      options = _useReducer[0].options,
      dispatch = _useReducer[1];

  var _useLabels = useLabels(),
      labelledby = _useLabels[0],
      LabelProvider = _useLabels[1];

  var _useDescriptions = useDescriptions(),
      describedby = _useDescriptions[0],
      DescriptionProvider = _useDescriptions[1];

  var id = "headlessui-radiogroup-" + useId();
  var radioGroupRef = useRef(null);
  var firstOption = useMemo(function () {
    return options.find(function (option) {
      if (option.propsRef.current.disabled) return false;
      return true;
    });
  }, [options]);
  var containsCheckedOption = useMemo(function () {
    return options.some(function (option) {
      return option.propsRef.current.value === value;
    });
  }, [options, value]);
  var triggerChange = useCallback(function (nextValue) {
    var _options$find;

    if (disabled) return false;
    if (nextValue === value) return false;
    var nextOption = (_options$find = options.find(function (option) {
      return option.propsRef.current.value === nextValue;
    })) == null ? void 0 : _options$find.propsRef.current;
    if (nextOption == null ? void 0 : nextOption.disabled) return false;
    onChange(nextValue);
    return true;
  }, [onChange, value, disabled, options]);
  useTreeWalker({
    container: radioGroupRef.current,
    accept: function accept(node) {
      if (node.getAttribute('role') === 'radio') return NodeFilter.FILTER_REJECT;
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
    walk: function walk(node) {
      node.setAttribute('role', 'none');
    }
  });
  var handleKeyDown = useCallback(function (event) {
    var container = radioGroupRef.current;
    if (!container) return;
    var all = options.filter(function (option) {
      return option.propsRef.current.disabled === false;
    }).map(function (radio) {
      return radio.element.current;
    });

    switch (event.key) {
      case Keys.ArrowLeft:
      case Keys.ArrowUp:
        {
          event.preventDefault();
          event.stopPropagation();
          var result = focusIn(all, Focus.Previous | Focus.WrapAround);

          if (result === FocusResult.Success) {
            var activeOption = options.find(function (option) {
              return option.element.current === document.activeElement;
            });
            if (activeOption) triggerChange(activeOption.propsRef.current.value);
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
            var _activeOption = options.find(function (option) {
              return option.element.current === document.activeElement;
            });

            if (_activeOption) triggerChange(_activeOption.propsRef.current.value);
          }
        }
        break;

      case Keys.Space:
        {
          event.preventDefault();
          event.stopPropagation();

          var _activeOption2 = options.find(function (option) {
            return option.element.current === document.activeElement;
          });

          if (_activeOption2) triggerChange(_activeOption2.propsRef.current.value);
        }
        break;
    }
  }, [radioGroupRef, options, triggerChange]);
  var registerOption = useCallback(function (option) {
    dispatch(_extends({
      type: ActionTypes.RegisterOption
    }, option));
    return function () {
      return dispatch({
        type: ActionTypes.UnregisterOption,
        id: option.id
      });
    };
  }, [dispatch]);
  var api = useMemo(function () {
    return {
      registerOption: registerOption,
      firstOption: firstOption,
      containsCheckedOption: containsCheckedOption,
      change: triggerChange,
      disabled: disabled,
      value: value
    };
  }, [registerOption, firstOption, containsCheckedOption, triggerChange, disabled, value]);
  var propsWeControl = {
    ref: radioGroupRef,
    id: id,
    role: 'radiogroup',
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    onKeyDown: handleKeyDown
  };
  return React.createElement(DescriptionProvider, {
    name: "RadioGroup.Description"
  }, React.createElement(LabelProvider, {
    name: "RadioGroup.Label"
  }, React.createElement(RadioGroupContext.Provider, {
    value: api
  }, render({
    props: _extends({}, passThroughProps, propsWeControl),
    defaultTag: DEFAULT_RADIO_GROUP_TAG,
    name: 'RadioGroup'
  }))));
} // ---

var OptionState;

(function (OptionState) {
  OptionState[OptionState["Empty"] = 1] = "Empty";
  OptionState[OptionState["Active"] = 2] = "Active";
})(OptionState || (OptionState = {}));

var DEFAULT_OPTION_TAG = 'div';

function Option(props) {
  var optionRef = useRef(null);
  var id = "headlessui-radiogroup-option-" + useId();

  var _useLabels2 = useLabels(),
      labelledby = _useLabels2[0],
      LabelProvider = _useLabels2[1];

  var _useDescriptions2 = useDescriptions(),
      describedby = _useDescriptions2[0],
      DescriptionProvider = _useDescriptions2[1];

  var _useFlags = useFlags(OptionState.Empty),
      addFlag = _useFlags.addFlag,
      removeFlag = _useFlags.removeFlag,
      hasFlag = _useFlags.hasFlag;

  var value = props.value,
      _props$disabled2 = props.disabled,
      disabled = _props$disabled2 === void 0 ? false : _props$disabled2,
      passThroughProps = _objectWithoutPropertiesLoose(props, ["value", "disabled"]);

  var propsRef = useRef({
    value: value,
    disabled: disabled
  });
  useIsoMorphicEffect(function () {
    propsRef.current.value = value;
  }, [value, propsRef]);
  useIsoMorphicEffect(function () {
    propsRef.current.disabled = disabled;
  }, [disabled, propsRef]);

  var _useRadioGroupContext = useRadioGroupContext([RadioGroup.name, Option.name].join('.')),
      registerOption = _useRadioGroupContext.registerOption,
      radioGroupDisabled = _useRadioGroupContext.disabled,
      change = _useRadioGroupContext.change,
      firstOption = _useRadioGroupContext.firstOption,
      containsCheckedOption = _useRadioGroupContext.containsCheckedOption,
      radioGroupValue = _useRadioGroupContext.value;

  useIsoMorphicEffect(function () {
    return registerOption({
      id: id,
      element: optionRef,
      propsRef: propsRef
    });
  }, [id, registerOption, optionRef, props]);
  var handleClick = useCallback(function () {
    var _optionRef$current;

    if (!change(value)) return;
    addFlag(OptionState.Active);
    (_optionRef$current = optionRef.current) == null ? void 0 : _optionRef$current.focus();
  }, [addFlag, change, value]);
  var handleFocus = useCallback(function () {
    return addFlag(OptionState.Active);
  }, [addFlag]);
  var handleBlur = useCallback(function () {
    return removeFlag(OptionState.Active);
  }, [removeFlag]);
  var isFirstOption = (firstOption == null ? void 0 : firstOption.id) === id;
  var isDisabled = radioGroupDisabled || disabled;
  var checked = radioGroupValue === value;
  var propsWeControl = {
    ref: optionRef,
    id: id,
    role: 'radio',
    'aria-checked': checked ? 'true' : 'false',
    'aria-labelledby': labelledby,
    'aria-describedby': describedby,
    'aria-disabled': isDisabled ? true : undefined,
    tabIndex: function () {
      if (isDisabled) return -1;
      if (checked) return 0;
      if (!containsCheckedOption && isFirstOption) return 0;
      return -1;
    }(),
    onClick: isDisabled ? undefined : handleClick,
    onFocus: isDisabled ? undefined : handleFocus,
    onBlur: isDisabled ? undefined : handleBlur
  };
  var slot = useMemo(function () {
    return {
      checked: checked,
      disabled: isDisabled,
      active: hasFlag(OptionState.Active)
    };
  }, [checked, isDisabled, hasFlag]);
  return React.createElement(DescriptionProvider, {
    name: "RadioGroup.Description"
  }, React.createElement(LabelProvider, {
    name: "RadioGroup.Label"
  }, render({
    props: _extends({}, passThroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'RadioGroup.Option'
  })));
} // ---


RadioGroup.Option = Option;
RadioGroup.Label = Label;
RadioGroup.Description = Description;

export { RadioGroup };
//# sourceMappingURL=radio-group.esm.js.map
