import { objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose, extends as _extends } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useRef } from 'react';
import { render } from '../../utils/render.esm.js';
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete.esm.js';
import { useFocusTrap, Features } from '../../hooks/use-focus-trap.esm.js';

var DEFAULT_FOCUS_TRAP_TAG = 'div';
function FocusTrap(props) {
  var container = useRef(null);

  var initialFocus = props.initialFocus,
      passthroughProps = _objectWithoutPropertiesLoose(props, ["initialFocus"]);

  var ready = useServerHandoffComplete();
  useFocusTrap(container, ready ? Features.All : Features.None, {
    initialFocus: initialFocus
  });
  var propsWeControl = {
    ref: container
  };
  return render({
    props: _extends({}, passthroughProps, propsWeControl),
    defaultTag: DEFAULT_FOCUS_TRAP_TAG,
    name: 'FocusTrap'
  });
}

export { FocusTrap };
//# sourceMappingURL=focus-trap.esm.js.map
