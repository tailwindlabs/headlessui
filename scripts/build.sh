#!/bin/bash
set -e

node="yarn node"
tsdxArgs=()

# Add script name
tsdxArgs+=("build" "--name" "headlessui" "--format" "cjs,esm,umd" "--tsconfig" "./tsconfig.tsdx.json")

# Passthrough arguments and flags
tsdxArgs+=($@)

# Execute
$node "$(yarn bin tsdx)" "${tsdxArgs[@]}"
