#!/usr/bin/env bash
set -e

ROOT_DIR="$(git rev-parse --show-toplevel)/"
TARGET_DIR="$(pwd)"
RELATIVE_TARGET_DIR="${TARGET_DIR/$ROOT_DIR/}"

# INFO: This script is always run from the root of the repository. If we execute this script from a
# package then the filters (in this case a path to $RELATIVE_TARGET_DIR) will be applied.

pushd $ROOT_DIR > /dev/null

prettierArgs=()

if ! [ -z "$CI" ]; then
  prettierArgs+=("--check")
else
  prettierArgs+=("--write")
fi

# Add default arguments
prettierArgs+=('--ignore-unknown')

# Passthrough arguments and flags
prettierArgs+=($@)

# Ensure that a path is passed, otherwise default to the current directory
if [ -z "$@" ]; then
  prettierArgs+=("$RELATIVE_TARGET_DIR")
fi

# Execute
yarn prettier "${prettierArgs[@]}"

popd > /dev/null
