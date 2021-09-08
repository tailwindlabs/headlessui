import { extends as _extends } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useMemo, useCallback, createContext, useState, useContext } from 'react';
import { render } from '../../utils/render.esm.js';
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect.esm.js';
import { useId } from '../../hooks/use-id.esm.js';

var DescriptionContext = /*#__PURE__*/createContext(null);

function useDescriptionContext() {
  var context = useContext(DescriptionContext);

  if (context === null) {
    var err = new Error('You used a <Description /> component, but it is not inside a relevant parent.');
    if (Error.captureStackTrace) Error.captureStackTrace(err, useDescriptionContext);
    throw err;
  }

  return context;
}

function useDescriptions() {
  var _useState = useState([]),
      descriptionIds = _useState[0],
      setDescriptionIds = _useState[1];

  return [// The actual id's as string or undefined
  descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined, // The provider component
  useMemo(function () {
    return function DescriptionProvider(props) {
      var register = useCallback(function (value) {
        setDescriptionIds(function (existing) {
          return [].concat(existing, [value]);
        });
        return function () {
          return setDescriptionIds(function (existing) {
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
      return React.createElement(DescriptionContext.Provider, {
        value: contextBag
      }, props.children);
    };
  }, [setDescriptionIds])];
} // ---

var DEFAULT_DESCRIPTION_TAG = 'p';
function Description(props) {
  var context = useDescriptionContext();
  var id = "headlessui-description-" + useId();
  useIsoMorphicEffect(function () {
    return context.register(id);
  }, [id, context.register]);
  var passThroughProps = props;

  var propsWeControl = _extends({}, context.props, {
    id: id
  });

  return render({
    props: _extends({}, passThroughProps, propsWeControl),
    slot: context.slot || {},
    defaultTag: DEFAULT_DESCRIPTION_TAG,
    name: context.name || 'Description'
  });
}

export { Description, useDescriptions };
//# sourceMappingURL=description.esm.js.map
