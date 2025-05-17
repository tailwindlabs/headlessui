# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the `@headlessui-astro` package in this repository.

## Project Overview

`@headlessui-astro` is a package that brings the completely unstyled, fully accessible UI components of HeadlessUI to Astro projects. It is based on and leverages `@headlessui/vue`, adapting its components for the Astro environment.

The primary goal is to provide Astro developers with the same powerful UI primitives (menus, dialogs, etc.) that handle complex accessibility and interaction patterns, while allowing complete styling freedom, typically with Tailwind CSS.

Key reference documents for this package are:
- `packages/@headlessui-astro/README.md`
- `packages/@headlessui-astro/ROADMAP.md`

## Development Commands

The following standard npm scripts are available in the monorepo. When working on `@headlessui-astro`, ensure you are in the correct package directory or use Lerna/Nx commands if applicable to scope tasks.

### Build and Watch

```bash
# Build the @headlessui-astro package (or all packages)
npm run build

# Watch for changes during development
npm run watch

# Clean dist directory
npm run clean

# Run the playground (if configured for Astro components)
npm run playground
```

### Testing

```bash
# Run all tests (ensure tests for @headlessui-astro are included)
npm run test

# Run a specific test file within @headlessui-astro
# Example: npm run test -- packages/@headlessui-astro/src/components/menu/menu.test.ts
npm run test -- <path_to_astro_test_file>

# Run tests with specific pattern
npm run test -- -t "should render correctly in Astro"

# Run tests in watch mode
npm run test -- --watch
```

### Linting

```bash
# Run linter (ensure it covers .astro files)
npm run lint

# Run type checking (ensure it covers .astro files and setup)
npm run lint-types
```

## Architecture and Code Structure (@headlessui-astro)

### Component Architecture

`@headlessui-astro` components are Astro components (`.astro` files) that typically wrap or adapt the corresponding `@headlessui/vue` components.

1.  **Astro Component Definition**: Components are defined as `.astro` files (e.g., `Menu.astro`, `Dialog.astro`).
2.  **Vue Interoperability**: They rely on `@astrojs/vue` integration and use `@headlessui/vue` components internally.
3.  **Hydration Strategies**: Components utilize Astro's `client:` directives (e.g., `client:visible` by default, `client:load` for `*Load.astro` variants) to control client-side JavaScript hydration.
4.  **Props and Slots**:
    *   Props are passed to the underlying Vue components.
    *   Astro's `class:list` directive is used for conditional classes: `class:list={[active && 'bg-blue-500']}`.
    *   Slot props are handled using the function-as-child pattern: `{({active}) => (<a class:list={...}>...</a>)}`.
5.  **Accessibility**: Inherits WAI-ARIA patterns and keyboard navigation from `@headlessui/vue`, ensuring they function correctly within Astro's partial hydration model.

### Directory Structure (within `packages/@headlessui-astro`)

- `src/components/`: Contains all Astro UI components (e.g., `Menu.astro`, `Dialog.astro`, `MenuButton.astro`).
    - `*.load.astro`: Variants of components that use `client:load` for eager hydration (e.g., `Dialog.load.astro`).
- `src/utils/` or `src/core/`: May contain Astro-specific utilities, particularly for managing hydration or adapting Vue logic.
- `src/`: Other necessary files for the package.

### Key Files and Concepts

- **Astro Components**: Files like `Menu.astro`, `MenuButton.astro`, `MenuItems.astro`, `MenuItem.astro`.
- **`*.load.astro` Variants**: E.g., `Dialog.load.astro`, for components that need to be interactive immediately on page load.
- **Dependencies**: `@headlessui/vue`, `vue`, and `@astrojs/vue` are crucial.
- **Configuration**: Users must configure `astro.config.mjs` with the `@astrojs/vue` integration.
- **Re-exporting**: The main entry point of the package (e.g., `index.ts` or `index.js`) exports all available Astro components.

### Component Development Pattern

Components follow the compound component model established by HeadlessUI:
1.  A parent Astro component (e.g., `Menu.astro`) wraps the main Vue component and manages overall state/context.
2.  Child Astro components (e.g., `MenuButton.astro`, `MenuItems.astro`) consume this context or pass props to their corresponding Vue child components.
3.  Common props like `as` (to control the rendered element) are supported.
4.  Keyboard navigation and focus management are primarily handled by the underlying Vue components, but testing in Astro is crucial.

### Important Utilities

- **Hydration Utilities**: Core logic for implementing `client:visible` and `client:load` strategies effectively for HeadlessUI patterns.
- **Focus Management & Keyboard Handling**: While largely inherited from `@headlessui/vue`, ensure these work seamlessly post-hydration in Astro.
- **Rendering Utilities**: Adapters or wrappers to ensure Vue's render functions or templates integrate correctly with Astro's templating and slot mechanisms.

## Development Guidelines for @headlessui-astro

1.  **Maintain Accessibility**: Ensure all components are fully accessible and adhere to WAI-ARIA standards within the Astro context.
2.  **API Consistency (with Adaptation)**: Strive for API consistency with `@headlessui/vue`, adapting syntax where necessary for Astro (e.g., `class:list`, slot props). Clearly document any differences.
3.  **Hydration Awareness**: Develop and test components with Astro's hydration strategies in mind. Provide `*.load.astro` variants where sensible.
4.  **Thorough Testing**:
    *   Unit tests for individual Astro components.
    *   Integration tests demonstrating components working together.
    *   Accessibility assertions.
    *   Keyboard interaction tests post-hydration.
    *   Tests for different hydration strategies (`client:visible`, `client:load`).
5.  **Documentation**:
    *   Provide clear usage examples in `.astro` syntax.
    *   Explain hydration strategies and when to use each.
    *   Document any Astro-specific considerations or limitations.
6.  **Performance**: Be mindful of the client-side JavaScript footprint. Leverage Astro's partial hydration to keep it minimal.
7.  **Refer to Core Documents**: Always consult `packages/@headlessui-astro/README.md` for usage and `packages/@headlessui-astro/ROADMAP.md` for development progress and plans.