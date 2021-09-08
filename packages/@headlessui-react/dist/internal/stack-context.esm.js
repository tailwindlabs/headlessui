import React, { createContext, useContext, useCallback } from 'react';
import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect.esm.js';

var StackContext = /*#__PURE__*/createContext(function () {});
StackContext.displayName = 'StackContext';
var StackMessage;

(function (StackMessage) {
  StackMessage[StackMessage["Add"] = 0] = "Add";
  StackMessage[StackMessage["Remove"] = 1] = "Remove";
})(StackMessage || (StackMessage = {}));

function useStackContext() {
  return useContext(StackContext);
}
function StackProvider(_ref) {
  var children = _ref.children,
      onUpdate = _ref.onUpdate,
      type = _ref.type,
      element = _ref.element;
  var parentUpdate = useStackContext();
  var notify = useCallback(function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // Notify our layer
    onUpdate == null ? void 0 : onUpdate.apply(void 0, args); // Notify the parent

    parentUpdate.apply(void 0, args);
  }, [parentUpdate, onUpdate]);
  useIsoMorphicEffect(function () {
    notify(StackMessage.Add, type, element);
    return function () {
      return notify(StackMessage.Remove, type, element);
    };
  }, [notify, type, element]);
  return React.createElement(StackContext.Provider, {
    value: notify
  }, children);
}

export { StackMessage, StackProvider, useStackContext };
//# sourceMappingURL=stack-context.esm.js.map
