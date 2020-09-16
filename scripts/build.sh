#!/bin/bash
set -e

TARGET_DIR="$(pwd)"

# INFO: This script is always run from the individual package.

node="yarn node"
tsdxArgs=()

# Add script name
tsdxArgs+=("build" "--name" "headlessui" "--tsconfig" "./tsconfig.tsdx.json")

# Passthrough arguments and flags
tsdxArgs+=($@)

# Execute
$node "$(yarn bin tsdx)" "${tsdxArgs[@]}"
