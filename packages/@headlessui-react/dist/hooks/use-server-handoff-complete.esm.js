import { useState, useEffect } from 'react';

var state = {
  serverHandoffComplete: false
};
function useServerHandoffComplete() {
  var _useState = useState(state.serverHandoffComplete),
      serverHandoffComplete = _useState[0],
      setServerHandoffComplete = _useState[1];

  useEffect(function () {
    if (serverHandoffComplete === true) return;
    setServerHandoffComplete(true);
  }, [serverHandoffComplete]);
  useEffect(function () {
    if (state.serverHandoffComplete === false) state.serverHandoffComplete = true;
  }, []);
  return serverHandoffComplete;
}

export { useServerHandoffComplete };
//# sourceMappingURL=use-server-handoff-complete.esm.js.map
