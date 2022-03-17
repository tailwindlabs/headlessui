#!/usr/bin/env bash
set -e

node="yarn node"
jestArgs=()

# Add default arguments
jestArgs+=("--passWithNoTests")

# Add arguments based on environment variables
if ! [ -z "$CI" ]; then
  jestArgs+=("--maxWorkers=4")
  jestArgs+=("--ci")
fi

# Passthrough arguments and flags
jestArgs+=($@)

# Execute
$node "$(yarn bin jest)" "${jestArgs[@]}"

