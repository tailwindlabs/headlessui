#!/usr/bin/env bash
set -e

# Known variables
outdir="./dist"
name="headlessui"
input="./src/index.ts"

# Find executables
esbuild=$(yarn bin esbuild)
tsc=$(yarn bin tsc)

# Setup shared options for esbuild
sharedOptions=()
sharedOptions+=("--bundle")
sharedOptions+=("--platform=browser")
sharedOptions+=("--target=es2020")

# Generate actual builds
$esbuild $input --format=esm  --outfile=$outdir/$name.esm.js --sourcemap ${sharedOptions[@]} $@ --watch

