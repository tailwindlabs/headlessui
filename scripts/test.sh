#!/bin/bash
set -e

ROOT_DIR="$(git rev-parse --show-toplevel)/"
TARGET_DIR="$(pwd)"
RELATIVE_TARGET_DIR="${TARGET_DIR/$ROOT_DIR/}"

# INFO: This script is always run from the root of the repository. If we execute this script from a
# package then the filters (in this case a path to $RELATIVE_TARGET_DIR) will be applied.

pushd $ROOT_DIR > /dev/null

node="yarn node"
tsdxArgs=()

# Add script name
tsdxArgs+=("test")

# Add default arguments
tsdxArgs+=("--passWithNoTests" $RELATIVE_TARGET_DIR)

# Add arguments based on environment variabls
if [ -n "$CI" ]; then
  jestArgs+=("--maxWorkers=4")
  jestArgs+=("--ci")
fi

# Passthrough arguments and flags
tsdxArgs+=($@)

# Execute
$node "$(yarn bin tsdx)" "${tsdxArgs[@]}"

popd > /dev/null
