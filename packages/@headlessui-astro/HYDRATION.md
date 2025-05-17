# Hydration Guide for HeadlessUI Astro Components

This document provides guidance on how to properly use hydration with HeadlessUI Astro components to avoid common errors and ensure optimal performance.

## Understanding Astro's Hydration Model

Astro uses a partial hydration model with "islands of interactivity," where only the interactive parts of your page are hydrated with JavaScript. This approach offers significant performance benefits but requires understanding when and how to use hydration directives.

## Common Hydration Error in HeadlessUI Astro

You might encounter this error when using HeadlessUI Astro components:

```
You are attempting to render <Dialog client:load />, but Dialog is an Astro component. 
Astro components do not render in the client and should not have a hydration directive. 
Please use a framework component for client rendering.
```

This error occurs because HeadlessUI Astro components already include their own internal hydration directives. Applying an additional directive at the component usage level leads to conflicts.

## The `client` Prop Solution

To solve this issue, HeadlessUI Astro components accept a `client` prop instead of using direct hydration directives:

```astro
<!-- ❌ INCORRECT - Don't use hydration directives directly -->
<Menu client:visible>
  <!-- component content -->
</Menu>

<!-- ✅ CORRECT - Use the client prop instead -->
<Menu client="visible">
  <!-- component content -->
</Menu>
```

## Available Hydration Strategies

The `client` prop accepts the following values:

- `"visible"` (DEFAULT): Hydrates the component when it becomes visible in the viewport
- `"load"`: Hydrates the component immediately on page load
- `"idle"`: Hydrates the component during browser idle time
- `"media"`: Hydrates the component based on a media query

## Component-Specific Defaults

Each component type has a default hydration strategy based on its usage patterns:

- **Dialog**: Uses `"load"` by default (always eager hydration)
- **Other components**: Use `"visible"` by default

These defaults can be overridden using the `client` prop.

## Component Variants

For convenience, some components offer specific variants with different hydration strategies:

```astro
<!-- Standard version with client:visible -->
<Menu>
  <!-- component content -->
</Menu>

<!-- Eager hydration version with client:load -->
<Menu.load>
  <!-- component content -->
</Menu.load>
```

## Examples

### Basic Usage with Default Hydration

```astro
<Menu as="div" class="relative inline-block text-left">
  <MenuButton>Options</MenuButton>
  <MenuItems>
    <MenuItem>Edit</MenuItem>
    <MenuItem>Delete</MenuItem>
  </MenuItems>
</Menu>
```

### Overriding Hydration Strategy

```astro
<Menu client="load" as="div" class="relative inline-block text-left">
  <MenuButton>Options</MenuButton>
  <MenuItems>
    <MenuItem>Edit</MenuItem>
    <MenuItem>Delete</MenuItem>
  </MenuItems>
</Menu>
```

### Using Component Variants

```astro
<Menu.load as="div" class="relative inline-block text-left">
  <MenuButton>Options</MenuButton>
  <MenuItems>
    <MenuItem>Edit</MenuItem>
    <MenuItem>Delete</MenuItem>
  </MenuItems>
</Menu.load>
```

## Best Practices

1. **Use Default Hydration When Possible**: The default hydration strategies are optimized for each component type.

2. **Choose Eager Hydration for Critical UI**: Use `client="load"` or the `.load` variant for components that need to be interactive immediately.

3. **Never Use Both**: Never apply both a direct hydration directive AND the `client` prop:
   ```astro
   <!-- ❌ INCORRECT -->
   <Menu client="load" client:load>
     <!-- component content -->
   </Menu>
   ```

4. **Consistent Strategy Across Components**: Use the same hydration strategy for related components in a UI region.

5. **Consider Performance Impact**: Eager hydration increases initial load time. Use it only when necessary.

## Troubleshooting

### Component Not Interactive

If a component isn't interactive, check:

1. Is the component being hydrated? Check for the proper `client` prop.
2. Does the component have `client:only` in its ancestry? This can prevent proper initialization.
3. Are there any console errors related to hydration?

### Multiple Hydration Errors

If you're seeing hydration-related errors, ensure:

1. You're using the `client` prop, not direct hydration directives.
2. You're not mixing direct hydration directives with the `client` prop.
3. The component is correctly imported from `@headlessui-astro`.

## Advanced: Creating Custom Hydration Strategies

If you need a custom hydration strategy, you can create your own utility:

```typescript
// myHydration.ts
import { DEFAULT_HYDRATION } from '@headlessui-astro/core/hydration';

export const CUSTOM_HYDRATION = 'media:(max-width: 768px)';

export function getMyComponentHydration(isImportant = false) {
  return isImportant ? 'load' : DEFAULT_HYDRATION;
}
```

Then use it in your components:

```astro
---
import { getMyComponentHydration } from './myHydration';

const { client = getMyComponentHydration(true) } = Astro.props;
---

<div client={client}>
  <!-- component content -->
</div>
```

## Further Reading

- [Astro Documentation on Partial Hydration](https://docs.astro.build/en/core-concepts/framework-components/#hydrating-interactive-components)
- [HeadlessUI Astro API Reference](https://github.com/tailwindlabs/headlessui/tree/main/packages/@headlessui-astro)