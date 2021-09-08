import { objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose, extends as _extends } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useContext, useRef, useCallback, useMemo, createContext, useState, Fragment } from 'react';
import { render } from '../../utils/render.esm.js';
import { useSyncRefs } from '../../hooks/use-sync-refs.esm.js';
import { Keys } from '../keyboard.esm.js';
import { isDisabledReactIssue7711 } from '../../utils/bugs.esm.js';
import { useId } from '../../hooks/use-id.esm.js';
import { Description, useDescriptions } from '../description/description.esm.js';
import { useResolveButtonType } from '../../hooks/use-resolve-button-type.esm.js';
import { Label, useLabels } from '../label/label.esm.js';

var GroupContext = /*#__PURE__*/createContext(null);
GroupContext.displayName = 'GroupContext'; // ---

var DEFAULT_GROUP_TAG = Fragment;

function Group(props) {
  var _useState = useState(null),
      switchElement = _useState[0],
      setSwitchElement = _useState[1];

  var _useLabels = useLabels(),
      labelledby = _useLabels[0],
      LabelProvider = _useLabels[1];

  var _useDescriptions = useDescriptions(),
      describedby = _useDescriptions[0],
      DescriptionProvider = _useDescriptions[1];

  var context = useMemo(function () {
    return {
      "switch": switchElement,
      setSwitch: setSwitchElement,
      labelledby: labelledby,
      describedby: describedby
    };
  }, [switchElement, setSwitchElement, labelledby, describedby]);
  return React.createElement(DescriptionProvider, {
    name: "Switch.Description"
  }, React.createElement(LabelProvider, {
    name: "Switch.Label",
    props: {
      onClick: function onClick() {
        if (!switchElement) return;
        switchElement.click();
        switchElement.focus({
          preventScroll: true
        });
      }
    }
  }, React.createElement(GroupContext.Provider, {
    value: context
  }, render({
    props: props,
    defaultTag: DEFAULT_GROUP_TAG,
    name: 'Switch.Group'
  }))));
} // ---


var DEFAULT_SWITCH_TAG = 'button';
function Switch(props) {
  var checked = props.checked,
      onChange = props.onChange,
      passThroughProps = _objectWithoutPropertiesLoose(props, ["checked", "onChange"]);

  var id = "headlessui-switch-" + useId();
  var groupContext = useContext(GroupContext);
  var internalSwitchRef = useRef(null);
  var switchRef = useSyncRefs(internalSwitchRef, groupContext === null ? null : groupContext.setSwitch);
  var toggle = useCallback(function () {
    return onChange(!checked);
  }, [onChange, checked]);
  var handleClick = useCallback(function (event) {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault();
    event.preventDefault();
    toggle();
  }, [toggle]);
  var handleKeyUp = useCallback(function (event) {
    if (event.key !== Keys.Tab) event.preventDefault();
    if (event.key === Keys.Space) toggle();
  }, [toggle]); // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.

  var handleKeyPress = useCallback(function (event) {
    return event.preventDefault();
  }, []);
  var slot = useMemo(function () {
    return {
      checked: checked
    };
  }, [checked]);
  var propsWeControl = {
    id: id,
    ref: switchRef,
    role: 'switch',
    type: useResolveButtonType(props, internalSwitchRef),
    tabIndex: 0,
    'aria-checked': checked,
    'aria-labelledby': groupContext == null ? void 0 : groupContext.labelledby,
    'aria-describedby': groupContext == null ? void 0 : groupContext.describedby,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    onKeyPress: handleKeyPress
  };
  return render({
    props: _extends({}, passThroughProps, propsWeControl),
    slot: slot,
    defaultTag: DEFAULT_SWITCH_TAG,
    name: 'Switch'
  });
} // ---

Switch.Group = Group;
Switch.Label = Label;
Switch.Description = Description;

export { Switch };
//# sourceMappingURL=switch.esm.js.map
