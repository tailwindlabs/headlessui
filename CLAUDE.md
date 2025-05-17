# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

@headlessui/vue is a set of completely unstyled, fully accessible UI components for Vue 3, designed to integrate with Tailwind CSS. It provides a collection of UI primitives like menus, dialogs, tabs, and more that handle complex accessibility and interaction patterns while allowing complete styling freedom.

## Development Commands

### Build and Watch

```bash
# Build the package
npm run build

# Watch for changes during development
npm run watch

# Clean dist directory
npm run clean

# Run the playground (found in parent directory)
npm run playground
```

### Testing

```bash
# Run all tests
npm run test

# Run a specific test file
npm run test -- src/components/menu/menu.test.ts

# Run tests with specific pattern
npm run test -- -t "should focus the first focusable element"

# Run tests in watch mode
npm run test -- --watch
```

### Linting

```bash
# Run linter
npm run lint

# Run type checking
npm run lint-types
```

## Architecture and Code Structure

### Component Architecture

Each UI component in HeadlessUI follows a similar pattern:

1. **Component Definition**: Each component is defined using Vue's `defineComponent` with a consistent API pattern.
2. **State Management**: Complex state is managed via Vue's reactivity system with `ref`, `computed`, and `watchEffect`.
3. **Context Providers**: Components use Vue's provide/inject system to share state between parent and child components.
4. **Render Functions**: Components use render functions rather than templates for maximum flexibility.
5. **Accessibility Patterns**: Each component implements WAI-ARIA patterns and keyboard navigation.

### Directory Structure

- `src/components/`: Contains all UI components, each in its own directory
- `src/hooks/`: Custom Vue composition hooks shared across components
- `src/internal/`: Internal utilities for context management
- `src/utils/`: Utility functions for DOM manipulation, focus management, etc.
- `src/test-utils/`: Testing utilities and helpers

### Key Files and Concepts

- Each component implements its own state machine to manage different states
- Components expose a variety of props including:
  - `as`: To control the rendered element
  - `static`/`unmount`: To control rendering strategy
  - Components provide appropriate ARIA attributes automatically
  
- Testing approach combines:
  - Component unit tests
  - Accessibility assertions
  - Keyboard interaction tests
  - Server-side rendering tests when applicable

### Component Development Pattern

Components are organized as compound components:
1. A parent component provides state and context
2. Child components consume context to render specific parts
3. Components have common props patterns (as, static, unmount, id)
4. Keyboard navigation is handled consistently

For example, the Menu component consists of Menu, MenuButton, MenuItems, and MenuItem sub-components that work together.

### Important Utilities

- **Focus Management**: The library includes comprehensive focus management utilities
- **Keyboard Handling**: Consistent keyboard navigation patterns across components
- **Accessibility**: All components adhere to WAI-ARIA design patterns
- **Rendering Utilities**: Flexible rendering system that preserves forwarded refs and props

## Development Guidelines

1. Maintain accessibility support for all components
2. Follow the established patterns for component APIs
3. Ensure all components work with both mouse and keyboard interactions
4. Write thorough tests for both functionality and accessibility
5. Keep bundle size minimal by avoiding unnecessary dependencies