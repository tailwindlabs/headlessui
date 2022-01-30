#!/bin/bash
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
NODE_ENV=production  $esbuild $input --format=esm  --outfile=$outdir/$name.esm.js    --minify ${sharedOptions[@]} $@ &
NODE_ENV=production  $esbuild $input --format=cjs  --outfile=$outdir/$name.prod.cjs  --minify ${sharedOptions[@]} $@ &
NODE_ENV=development $esbuild $input --format=cjs  --outfile=$outdir/$name.dev.cjs            ${sharedOptions[@]} $@ &

# Generate types
tsc --emitDeclarationOnly --outDir $outdir &

# Copy build files over
cp -rf ./build/ $outdir

# Wait for all the scripts to finish
wait

