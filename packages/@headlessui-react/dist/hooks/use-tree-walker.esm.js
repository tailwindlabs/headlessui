import { useRef, useEffect } from 'react';
import { useIsoMorphicEffect } from './use-iso-morphic-effect.esm.js';

function useTreeWalker(_ref) {
  var container = _ref.container,
      accept = _ref.accept,
      walk = _ref.walk,
      _ref$enabled = _ref.enabled,
      enabled = _ref$enabled === void 0 ? true : _ref$enabled;
  var acceptRef = useRef(accept);
  var walkRef = useRef(walk);
  useEffect(function () {
    acceptRef.current = accept;
    walkRef.current = walk;
  }, [accept, walk]);
  useIsoMorphicEffect(function () {
    if (!container) return;
    if (!enabled) return;
    var accept = acceptRef.current;
    var walk = walkRef.current;
    var acceptNode = Object.assign(function (node) {
      return accept(node);
    }, {
      acceptNode: accept
    });
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, acceptNode, false);

    while (walker.nextNode()) {
      walk(walker.currentNode);
    }
  }, [container, enabled, acceptRef, walkRef]);
}

export { useTreeWalker };
//# sourceMappingURL=use-tree-walker.esm.js.map
