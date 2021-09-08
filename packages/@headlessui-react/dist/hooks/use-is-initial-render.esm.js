import { useRef, useEffect } from 'react';

function useIsInitialRender() {
  var initial = useRef(true);
  useEffect(function () {
    initial.current = false;
  }, []);
  return initial.current;
}

export { useIsInitialRender };
//# sourceMappingURL=use-is-initial-render.esm.js.map
