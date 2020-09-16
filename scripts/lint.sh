#!/bin/bash
set -e

SCRIPTS_DIR="$(dirname "${BASH_SOURCE[0]}")"
ROOT_DIR="$(realpath $SCRIPTS_DIR/..)/"
TARGET_DIR="$(pwd)"
RELATIVE_TARGET_DIR="${TARGET_DIR/$ROOT_DIR/}"

# INFO: This script is always run from the root of the repository. If we execute this script from a
# package then the filters (in this case a path to $RELATIVE_TARGET_DIR) will be applied.

pushd $ROOT_DIR > /dev/null

node="yarn node"
tsdxArgs=()

# Add script name
tsdxArgs+=("lint")

# Add default arguments
tsdxArgs+=($RELATIVE_TARGET_DIR)

# Passthrough arguments and flags
tsdxArgs+=($@)

# Execute
$node "$(yarn bin tsdx)" "${tsdxArgs[@]}"

popd > /dev/null