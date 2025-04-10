#!/usr/bin/env bash
set -e

# Known variables
outdir="./dist"
name="headlessui"
input="./src/index.ts"

# Setup shared options for esbuild
sharedOptions=()
sharedOptions+=("--bundle")
sharedOptions+=("--platform=browser")
sharedOptions+=("--target=es2020")


# Generate actual builds
NODE_ENV=development npx esbuild $input --format=esm  --outfile=$outdir/$name.esm.js --sourcemap ${sharedOptions[@]} $@ --watch

