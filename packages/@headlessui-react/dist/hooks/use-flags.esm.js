import { useState, useCallback } from 'react';

function useFlags(initialFlags) {
  if (initialFlags === void 0) {
    initialFlags = 0;
  }

  var _useState = useState(initialFlags),
      flags = _useState[0],
      setFlags = _useState[1];

  var addFlag = useCallback(function (flag) {
    return setFlags(function (flags) {
      return flags | flag;
    });
  }, [setFlags]);
  var hasFlag = useCallback(function (flag) {
    return Boolean(flags & flag);
  }, [flags]);
  var removeFlag = useCallback(function (flag) {
    return setFlags(function (flags) {
      return flags & ~flag;
    });
  }, [setFlags]);
  var toggleFlag = useCallback(function (flag) {
    return setFlags(function (flags) {
      return flags ^ flag;
    });
  }, [setFlags]);
  return {
    addFlag: addFlag,
    hasFlag: hasFlag,
    removeFlag: removeFlag,
    toggleFlag: toggleFlag
  };
}

export { useFlags };
//# sourceMappingURL=use-flags.esm.js.map
