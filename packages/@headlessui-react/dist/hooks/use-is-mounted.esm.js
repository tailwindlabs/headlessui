import { useRef, useEffect } from 'react';

function useIsMounted() {
  var mounted = useRef(false);
  useEffect(function () {
    mounted.current = true;
    return function () {
      mounted.current = false;
    };
  }, []);
  return mounted;
}

export { useIsMounted };
//# sourceMappingURL=use-is-mounted.esm.js.map
