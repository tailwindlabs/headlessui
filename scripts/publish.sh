#!/bin/bash
set -e

args=()

# Passthrough arguments and flags
args+=($@)

# Execute
npm publish "${args[@]}"
