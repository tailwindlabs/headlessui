import { objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose, extends as _extends } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useMemo, useCallback, createContext, useState, useContext } from 'react';
import { render } from '../../utils/render.esm.js';
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect.esm.js';
import { useId } from '../../hooks/use-id.esm.js';

var LabelContext = /*#__PURE__*/createContext(null);

function useLabelContext() {
  var context = useContext(LabelContext);

  if (context === null) {
    var err = new Error('You used a <Label /> component, but it is not inside a relevant parent.');
    if (Error.captureStackTrace) Error.captureStackTrace(err, useLabelContext);
    throw err;
  }

  return context;
}

function useLabels() {
  var _useState = useState([]),
      labelIds = _useState[0],
      setLabelIds = _useState[1];

  return [// The actual id's as string or undefined.
  labelIds.length > 0 ? labelIds.join(' ') : undefined, // The provider component
  useMemo(function () {
    return function LabelProvider(props) {
      var register = useCallback(function (value) {
        setLabelIds(function (existing) {
          return [].concat(existing, [value]);
        });
        return function () {
          return setLabelIds(function (existing) {
            var clone = existing.slice();
            var idx = clone.indexOf(value);
            if (idx !== -1) clone.splice(idx, 1);
            return clone;
          });
        };
      }, []);
      var contextBag = useMemo(function () {
        return {
          register: register,
          slot: props.slot,
          name: props.name,
          props: props.props
        };
      }, [register, props.slot, props.name, props.props]);
      return React.createElement(LabelContext.Provider, {
        value: contextBag
      }, props.children);
    };
  }, [setLabelIds])];
} // ---

var DEFAULT_LABEL_TAG = 'label';
function Label(props) {
  var _props$passive = props.passive,
      passive = _props$passive === void 0 ? false : _props$passive,
      passThroughProps = _objectWithoutPropertiesLoose(props, ["passive"]);

  var context = useLabelContext();
  var id = "headlessui-label-" + useId();
  useIsoMorphicEffect(function () {
    return context.register(id);
  }, [id, context.register]);

  var propsWeControl = _extends({}, context.props, {
    id: id
  });

  var allProps = _extends({}, passThroughProps, propsWeControl); // @ts-expect-error props are dynamic via context, some components will
  //                  provide an onClick then we can delete it.


  if (passive) delete allProps['onClick'];
  return render({
    props: allProps,
    slot: context.slot || {},
    defaultTag: DEFAULT_LABEL_TAG,
    name: context.name || 'Label'
  });
}

export { Label, useLabels };
//# sourceMappingURL=label.esm.js.map
