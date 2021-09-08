import { useRef, useEffect } from 'react';

function useWindowEvent(type, listener, options) {
  var listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(function () {
    function handler(event) {
      listenerRef.current.call(window, event);
    }

    window.addEventListener(type, handler, options);
    return function () {
      return window.removeEventListener(type, handler, options);
    };
  }, [type, options]);
}

export { useWindowEvent };
//# sourceMappingURL=use-window-event.esm.js.map
