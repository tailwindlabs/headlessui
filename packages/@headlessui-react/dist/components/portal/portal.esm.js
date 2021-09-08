import { objectWithoutPropertiesLoose as _objectWithoutPropertiesLoose } from '../../_virtual/_rollupPluginBabelHelpers.js';
import React, { useState, useContext, useEffect, createContext, Fragment } from 'react';
import { render } from '../../utils/render.esm.js';
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect.esm.js';
import { useServerHandoffComplete } from '../../hooks/use-server-handoff-complete.esm.js';
import { createPortal } from 'react-dom';
import { usePortalRoot } from '../../internal/portal-force-root.esm.js';

function usePortalTarget() {
  var forceInRoot = usePortalRoot();
  var groupTarget = useContext(PortalGroupContext);

  var _useState = useState(function () {
    // Group context is used, but still null
    if (!forceInRoot && groupTarget !== null) return null; // No group context is used, let's create a default portal root

    if (typeof window === 'undefined') return null;
    var existingRoot = document.getElementById('headlessui-portal-root');
    if (existingRoot) return existingRoot;
    var root = document.createElement('div');
    root.setAttribute('id', 'headlessui-portal-root');
    return document.body.appendChild(root);
  }),
      target = _useState[0],
      setTarget = _useState[1];

  useEffect(function () {
    if (forceInRoot) return;
    if (groupTarget === null) return;
    setTarget(groupTarget.current);
  }, [groupTarget, setTarget, forceInRoot]);
  return target;
} // ---


var DEFAULT_PORTAL_TAG = Fragment;
function Portal(props) {
  var passthroughProps = props;
  var target = usePortalTarget();

  var _useState2 = useState(function () {
    return typeof window === 'undefined' ? null : document.createElement('div');
  }),
      element = _useState2[0];

  var ready = useServerHandoffComplete();
  useIsoMorphicEffect(function () {
    if (!target) return;
    if (!element) return;
    target.appendChild(element);
    return function () {
      if (!target) return;
      if (!element) return;
      target.removeChild(element);

      if (target.childNodes.length <= 0) {
        var _target$parentElement;

        (_target$parentElement = target.parentElement) == null ? void 0 : _target$parentElement.removeChild(target);
      }
    };
  }, [target, element]);
  if (!ready) return null;
  return !target || !element ? null : createPortal(render({
    props: passthroughProps,
    defaultTag: DEFAULT_PORTAL_TAG,
    name: 'Portal'
  }), element);
} // ---

var DEFAULT_GROUP_TAG = Fragment;
var PortalGroupContext = /*#__PURE__*/createContext(null);

function Group(props) {
  var target = props.target,
      passthroughProps = _objectWithoutPropertiesLoose(props, ["target"]);

  return React.createElement(PortalGroupContext.Provider, {
    value: target
  }, render({
    props: passthroughProps,
    defaultTag: DEFAULT_GROUP_TAG,
    name: 'Popover.Group'
  }));
} // ---


Portal.Group = Group;

export { Portal };
//# sourceMappingURL=portal.esm.js.map
