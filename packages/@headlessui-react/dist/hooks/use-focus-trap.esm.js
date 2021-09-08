import { createForOfIteratorHelperLoose as _createForOfIteratorHelperLoose } from '../_virtual/_rollupPluginBabelHelpers.js';
import { useRef, useEffect } from 'react';
import { Keys } from '../components/keyboard.esm.js';
import { focusElement, focusIn, Focus, FocusResult } from '../utils/focus-management.esm.js';
import { useWindowEvent } from './use-window-event.esm.js';
import { useIsMounted } from './use-is-mounted.esm.js';

var Features;

(function (Features) {
  /** No features enabled for the `useFocusTrap` hook. */
  Features[Features["None"] = 1] = "None";
  /** Ensure that we move focus initially into the container. */

  Features[Features["InitialFocus"] = 2] = "InitialFocus";
  /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */

  Features[Features["TabLock"] = 4] = "TabLock";
  /** Ensure that programmatically moving focus outside of the container is disallowed. */

  Features[Features["FocusLock"] = 8] = "FocusLock";
  /** Ensure that we restore the focus when unmounting the component that uses this `useFocusTrap` hook. */

  Features[Features["RestoreFocus"] = 16] = "RestoreFocus";
  /** Enable all features. */

  Features[Features["All"] = 30] = "All";
})(Features || (Features = {}));

function useFocusTrap(container, features, _temp) {
  if (features === void 0) {
    features = Features.All;
  }

  var _ref = _temp === void 0 ? {} : _temp,
      initialFocus = _ref.initialFocus,
      containers = _ref.containers;

  var restoreElement = useRef(typeof window !== 'undefined' ? document.activeElement : null);
  var previousActiveElement = useRef(null);
  var mounted = useIsMounted();
  var featuresRestoreFocus = Boolean(features & Features.RestoreFocus);
  var featuresInitialFocus = Boolean(features & Features.InitialFocus); // Capture the currently focused element, before we enable the focus trap.

  useEffect(function () {
    if (!featuresRestoreFocus) return;
    restoreElement.current = document.activeElement;
  }, [featuresRestoreFocus]); // Restore the focus when we unmount the component.

  useEffect(function () {
    if (!featuresRestoreFocus) return;
    return function () {
      focusElement(restoreElement.current);
      restoreElement.current = null;
    };
  }, [featuresRestoreFocus]); // Handle initial focus

  useEffect(function () {
    if (!featuresInitialFocus) return;
    if (!container.current) return;
    var activeElement = document.activeElement;

    if (initialFocus == null ? void 0 : initialFocus.current) {
      if ((initialFocus == null ? void 0 : initialFocus.current) === activeElement) {
        previousActiveElement.current = activeElement;
        return; // Initial focus ref is already the active element
      }
    } else if (container.current.contains(activeElement)) {
      previousActiveElement.current = activeElement;
      return; // Already focused within Dialog
    } // Try to focus the initialFocus ref


    if (initialFocus == null ? void 0 : initialFocus.current) {
      focusElement(initialFocus.current);
    } else {
      if (focusIn(container.current, Focus.First) === FocusResult.Error) {
        console.warn('There are no focusable elements inside the <FocusTrap />');
      }
    }

    previousActiveElement.current = document.activeElement;
  }, [container, initialFocus, featuresInitialFocus]); // Handle `Tab` & `Shift+Tab` keyboard events

  useWindowEvent('keydown', function (event) {
    if (!(features & Features.TabLock)) return;
    if (!container.current) return;
    if (event.key !== Keys.Tab) return;
    event.preventDefault();

    if (focusIn(container.current, (event.shiftKey ? Focus.Previous : Focus.Next) | Focus.WrapAround) === FocusResult.Success) {
      previousActiveElement.current = document.activeElement;
    }
  }); // Prevent programmatically escaping the container

  useWindowEvent('focus', function (event) {
    if (!(features & Features.FocusLock)) return;
    var allContainers = new Set(containers == null ? void 0 : containers.current);
    allContainers.add(container);
    if (!allContainers.size) return;
    var previous = previousActiveElement.current;
    if (!previous) return;
    if (!mounted.current) return;
    var toElement = event.target;

    if (toElement && toElement instanceof HTMLElement) {
      if (!contains(allContainers, toElement)) {
        event.preventDefault();
        event.stopPropagation();
        focusElement(previous);
      } else {
        previousActiveElement.current = toElement;
        focusElement(toElement);
      }
    } else {
      focusElement(previousActiveElement.current);
    }
  }, true);
}

function contains(containers, element) {
  for (var _iterator = _createForOfIteratorHelperLoose(containers), _step; !(_step = _iterator()).done;) {
    var _container$current;

    var container = _step.value;
    if ((_container$current = container.current) == null ? void 0 : _container$current.contains(element)) return true;
  }

  return false;
}

export { Features, useFocusTrap };
//# sourceMappingURL=use-focus-trap.esm.js.map
