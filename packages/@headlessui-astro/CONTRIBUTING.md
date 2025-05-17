# Contributing to HeadlessUI Astro

Thank you for your interest in contributing to HeadlessUI Astro! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/tailwindlabs/headlessui.git
   cd headlessui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Navigate to the Astro package:
   ```bash
   cd packages/@headlessui-astro
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components/` - All Astro component wrappers
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `examples/` - Example usage patterns

## Component Implementation Guidelines

When implementing new components:

1. Create a new directory in `src/components/` for the component
2. Implement the main component and any subcomponents
3. Follow the same pattern as existing components:
   - Import the corresponding Vue component
   - Define properly typed props
   - Include client hydration directives
   - Handle slots appropriately

## Testing

All new components should include tests. We use Astro's testing framework.

To run tests:
```bash
npm test
```

## Documentation

When adding new components or features, please update the documentation:

- Update README.md with new component examples
- Add TypeScript types and JSDoc comments
- Include usage examples in the examples directory

## Code Style

This project follows the Astro coding style guidelines:

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Include proper TypeScript types
- Follow component naming conventions

## Pull Request Process

1. Create a feature branch from the `main` branch
2. Make your changes
3. Ensure tests pass
4. Update documentation as necessary
5. Submit a pull request

## License

By contributing to HeadlessUI Astro, you agree that your contributions will be licensed under the project's MIT license.