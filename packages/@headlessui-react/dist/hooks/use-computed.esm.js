import { useState, useRef } from 'react';
import { useIsoMorphicEffect } from './use-iso-morphic-effect.esm.js';

function useComputed(cb, dependencies) {
  var _useState = useState(cb),
      value = _useState[0],
      setValue = _useState[1];

  var cbRef = useRef(cb);
  useIsoMorphicEffect(function () {
    cbRef.current = cb;
  }, [cb]);
  useIsoMorphicEffect(function () {
    return setValue(cbRef.current);
  }, [cbRef, setValue].concat(dependencies));
  return value;
}

export { useComputed };
//# sourceMappingURL=use-computed.esm.js.map
