import { createForOfIteratorHelperLoose as _createForOfIteratorHelperLoose } from '../_virtual/_rollupPluginBabelHelpers.js';
import { useCallback, useRef, useEffect } from 'react';

function useSyncRefs() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }

  var cache = useRef(refs);
  useEffect(function () {
    cache.current = refs;
  }, [refs]);
  return useCallback(function (value) {
    for (var _iterator = _createForOfIteratorHelperLoose(cache.current), _step; !(_step = _iterator()).done;) {
      var ref = _step.value;
      if (ref == null) continue;
      if (typeof ref === 'function') ref(value);else ref.current = value;
    }
  }, [cache]);
}

export { useSyncRefs };
//# sourceMappingURL=use-sync-refs.esm.js.map
