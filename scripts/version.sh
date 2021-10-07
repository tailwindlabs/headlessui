#!/bin/bash
set -e

args=()

# Prevent creating a commit / tag
args+=("--no-git-tag-version")

# Force it, because working directory could be dirty
args+=("--force")

# Passthrough arguments and flags
args+=($@)

# Execute
npm version "${args[@]}"
