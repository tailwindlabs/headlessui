#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd ${0%/*} && pwd -P)

# Known variables
SRC='./src'
DST='./dist'
name="headlessui"
input="./${SRC}/index.ts"

# Find executables
esbuild=$(yarn bin esbuild)
tsc=$(yarn bin tsc)
resolver="${SCRIPT_DIR}/resolve-files.js"
rewriteImports="${SCRIPT_DIR}/rewrite-imports.js"

# Setup shared options for esbuild
sharedOptions=()
sharedOptions+=("--platform=browser")
sharedOptions+=("--target=es2019")

# Generate actual builds
# ESM
resolverOptions=()
resolverOptions+=($SRC)
resolverOptions+=('/**/*.{ts,tsx}')
resolverOptions+=('--ignore=.test.,__mocks__')
INPUT_FILES=$($resolver ${resolverOptions[@]})

NODE_ENV=production  $esbuild $INPUT_FILES --format=esm --outdir=$DST               --outbase=$SRC --minify --pure:React.createElement --define:process.env.TEST_BYPASS_TRACKED_POINTER="false" --define:__DEV__="false" ${sharedOptions[@]} &
NODE_ENV=production  $esbuild $input       --format=esm --outfile=$DST/$name.esm.js --outbase=$SRC --minify --pure:React.createElement --define:process.env.TEST_BYPASS_TRACKED_POINTER="false" --define:__DEV__="false" ${sharedOptions[@]} &

# Common JS
NODE_ENV=production  $esbuild $input --format=cjs --outfile=$DST/$name.prod.cjs --minify --bundle --pure:React.createElement --define:process.env.TEST_BYPASS_TRACKED_POINTER="false" --define:__DEV__="false" ${sharedOptions[@]} $@ &
NODE_ENV=development $esbuild $input --format=cjs --outfile=$DST/$name.dev.cjs           --bundle --pure:React.createElement --define:process.env.TEST_BYPASS_TRACKED_POINTER="false" --define:__DEV__="true" ${sharedOptions[@]} $@ &

# Generate types
tsc --emitDeclarationOnly --outDir $DST &

# Copy build files over
cp -rf ./build/ $DST

# Wait for all the scripts to finish
wait

# Rewrite ESM imports 😤
$rewriteImports "$DST" '/**/*.js'
$rewriteImports "$DST" '/**/*.d.ts'

# Remove test related files
rm -rf `$resolver "$DST" '/**/*.{test,__mocks__,}.*'`
rm -rf `$resolver "$DST" '/**/test-utils/*'`
