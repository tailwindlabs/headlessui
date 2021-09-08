import { useState } from 'react';
import { useIsoMorphicEffect } from './use-iso-morphic-effect.esm.js';

function resolveType(props) {
  var _props$as;

  if (props.type) return props.type;
  var tag = (_props$as = props.as) != null ? _props$as : 'button';
  if (typeof tag === 'string' && tag.toLowerCase() === 'button') return 'button';
  return undefined;
}

function useResolveButtonType(props, ref) {
  var _useState = useState(function () {
    return resolveType(props);
  }),
      type = _useState[0],
      setType = _useState[1];

  useIsoMorphicEffect(function () {
    setType(resolveType(props));
  }, [props.type, props.as]);
  useIsoMorphicEffect(function () {
    if (type) return;
    if (!ref.current) return;

    if (ref.current instanceof HTMLButtonElement && !ref.current.hasAttribute('type')) {
      setType('button');
    }
  }, [type, ref]);
  return type;
}

export { useResolveButtonType };
//# sourceMappingURL=use-resolve-button-type.esm.js.map
