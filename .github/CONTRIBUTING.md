# Contributing

Thanks for your interest in contributing to Headless UI! Please take a moment to review this document **before submitting a pull request**.

## Pull requests

**Please ask first before starting work on any significant new features.**

It's never a fun experience to have your pull request declined after investing a lot of time and effort into a new feature. To avoid this from happening, we request that contributors create [an issue](https://github.com/tailwindlabs/headlessui/issues) to first discuss any significant new features. This includes things like adding new components, exposing internal information, etc.
Also make sure that you are making changes to both the `React` and `Vue` versions so that we can ensure feature parity.

## Monorepo

The Headless UI repo is a monorepo using `yarn` workspaces. Note that we are using `yarn` version 1.

## Coding standards

Our code formatting rules are defined by TSDX, which uses `eslint` and we also use `prettier`. You can check your code against these standards by running:

```sh
yarn lint
```

To automatically fix any style violations in your code, you can run:

```sh
yarn lint --fix
```

## Running tests

You can run the test suite using the following commands:

```sh
yarn test
```

You can also run them for React of Vue individually:

```sh
yarn react test

# or

yarn vue test
```

Please ensure that the tests are passing when submitting a pull request. If you're adding new features to Headless UI, please include tests.

