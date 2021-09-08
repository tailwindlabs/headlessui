import React, { useContext, createContext } from 'react';

var ForcePortalRootContext = /*#__PURE__*/createContext(false);
function usePortalRoot() {
  return useContext(ForcePortalRootContext);
}
function ForcePortalRoot(props) {
  return React.createElement(ForcePortalRootContext.Provider, {
    value: props.force
  }, props.children);
}

export { ForcePortalRoot, usePortalRoot };
//# sourceMappingURL=portal-force-root.esm.js.map
