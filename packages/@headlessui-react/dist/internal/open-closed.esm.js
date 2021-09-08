import React, { useContext, createContext } from 'react';

var Context = /*#__PURE__*/createContext(null);
Context.displayName = 'OpenClosedContext';
var State;

(function (State) {
  State[State["Open"] = 0] = "Open";
  State[State["Closed"] = 1] = "Closed";
})(State || (State = {}));

function useOpenClosed() {
  return useContext(Context);
}
function OpenClosedProvider(_ref) {
  var value = _ref.value,
      children = _ref.children;
  return React.createElement(Context.Provider, {
    value: value
  }, children);
}

export { OpenClosedProvider, State, useOpenClosed };
//# sourceMappingURL=open-closed.esm.js.map
