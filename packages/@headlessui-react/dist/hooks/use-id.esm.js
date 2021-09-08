import { useState } from 'react';
import { useIsoMorphicEffect } from './use-iso-morphic-effect.esm.js';
import { useServerHandoffComplete } from './use-server-handoff-complete.esm.js';

// didn't take care of the Suspense case. To fix this we used the approach the @reach-ui/auto-id
// uses.
//
// Credits: https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx

var id = 0;

function generateId() {
  return ++id;
}

function useId() {
  var ready = useServerHandoffComplete();

  var _useState = useState(ready ? generateId : null),
      id = _useState[0],
      setId = _useState[1];

  useIsoMorphicEffect(function () {
    if (id === null) setId(generateId());
  }, [id]);
  return id != null ? '' + id : undefined;
}

export { useId };
//# sourceMappingURL=use-id.esm.js.map
