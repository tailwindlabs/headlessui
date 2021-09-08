import { useState, useEffect } from 'react';
import { disposables } from '../utils/disposables.esm.js';

function useDisposables() {
  // Using useState instead of useRef so that we can use the initializer function.
  var _useState = useState(disposables),
      d = _useState[0];

  useEffect(function () {
    return function () {
      return d.dispose();
    };
  }, [d]);
  return d;
}

export { useDisposables };
//# sourceMappingURL=use-disposables.esm.js.map
