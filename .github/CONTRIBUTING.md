# Contributing

Thanks for your interest in contributing to Headless UI! Please take a moment to review this document **before submitting a pull request**.

- [Pull requests](#pull-requests)
- [Monorepo](#monorepo)
- [Installation](#installation)
- [Coding standards](#coding-standards)
- [Running tests](#running-tests)
- [Running playgrounds](#running-playgrounds)
- [Scripts summary](#scripts-summary)

## Pull requests

**Please ask first before starting work on any significant new features.**

It's never a fun experience to have your pull request declined after investing a lot of time and effort into a new feature. To avoid this from happening, we request that contributors create [an issue](https://github.com/tailwindlabs/headlessui/issues) to first discuss any significant new features. This includes things like adding new components, exposing internal information, etc.
Also make sure that you are making changes to both the `React` and `Vue` versions so that we can ensure feature parity.

## Monorepo

The Headless UI repo is a monorepo using `yarn` workspaces. Note that we are using `yarn` **version 1**.

## Installation

You only require a `yarn install` in the root directory to install everything you need.

```sh
yarn install
```

## Coding standards

We use `prettier` for making sure that the codebase is formatted consistently.
To automatically fix any style violations in your code, you can run:

```sh
yarn lint
```

**Note**: Whenever you commit, the lint check will run on all staged files.
**Note**: In CI, we will only check your code, and not write with the formatted files. If you want to just check, then you can either run `yarn lint-check` or `CI=true yarn lint`

## Running tests

You can run the test suite using the following commands:

```sh
yarn test
```

You can also run them for React or Vue individually:

```sh
yarn react test

# or

yarn vue test
```

Please ensure that the tests are passing when submitting a pull request. If you're adding new features to Headless UI, please include tests.

## Running playgrounds

Currently the `React` playground (located in `packages/playground-react`) is a Next.js app that contains some examples which you can find in the `pages` directory. The `Vue` playground (located in `packages/playground-vue`) is a Vite app that contains some examples which you can find in the `src/components` directory.

You can launch them by running:

```sh
yarn react playground

# or

yarn vue playground
```

This will also start the necessary watchers so that you don't have to care about them.

## Scripts summary

Global scripts, and some aliases:

- `yarn install`: install all dependencies for all packages
- `yarn clean`: this will call all `yarn {package} clean` commands
- `yarn build`: this will call all `yarn {package} build` commands
- `yarn lint`: this will `lint` all packages
- `yarn test`: this will `test` all packages
  - `yarn test`: run all jest tests
  - `yarn test --watch`: run all jest tests in interactive mode
  - `yarn test tabs`: run all jest tests filtered by `tabs`
  - `yarn test tabs --watch`: run all jest tests in interactive mode filtered by `tabs`

Scripts per package:

- `yarn react`: Prefix to run anything in the `@headlessui/react` package
  - `yarn react test`: run all jest tests
  - `yarn react test --watch`: run all jest tests in interactive mode
  - `yarn react test tabs`: run all jest tests filtered by `tabs`
  - `yarn react test tabs --watch`: run all jest tests in interactive mode filtered by `tabs`
  - `yarn react build`: build the final artefacts
  - `yarn react lint`: validate and fix the react codebase using prettier
  - `yarn react watch`: start a watcher for the react esm build
    - **Note**: this will be executed for you when using the `yarn react playground`
    - **Note**: this is not required for jest. You will probably never need this
  - `yarn react playground`: (alias) start a development server in the `playground-react` package
    - **Note**: this will also run `yarn react watch` for you, which means that you only need to execute `yarn react playground`
  - `yarn react clean`: this will remove `dist` files
- `yarn vue`: Prefix to run anything in the `@headlessui/vue` package
  - `yarn vue test`: run all jest tests
  - `yarn vue test --watch`: run all jest tests in interactive mode
  - `yarn vue test tabs`: run all jest tests filtered by `tabs`
  - `yarn vue test tabs --watch`: run all jest tests in interactive mode filtered by `tabs`
  - `yarn vue build`: build the final artefacts
  - `yarn vue lint`: validate and fix the vue codebase using prettier
  - `yarn vue watch`: start a watcher for the vue esm build
    - **Note**: this will be executed for you when using the `yarn vue playground`
    - **Note**: this is not required for jest. You will probably never need this
  - `yarn vue playground`: (alias) start a development server in the `playground-vue` package
    - **Note**: this will also run `yarn vue watch` for you, which means that you only need to execute `yarn react playground`
  - `yarn vue clean`: this will remove `dist` files
