# HeadlessUI for Astro

Completely unstyled, fully accessible UI components for Astro, based on HeadlessUI Vue.

## Installation

```bash
npm install @headlessui/astro @headlessui/vue vue
```

Make sure to configure the Astro Vue integration in your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [vue()],
});
```

## Usage

### Menu Component

```astro
---
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/astro';
---

<Menu as="div" class="relative">
  <MenuButton class="px-4 py-2 bg-blue-500 text-white rounded">
    Options
  </MenuButton>
  
  <MenuItems class="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg">
    <MenuItem>
      {({active}) => (
        <a href="#" class:list={[active && 'bg-blue-500 text-white', 'block px-4 py-2']}>
          Account settings
        </a>
      )}
    </MenuItem>
    <MenuItem disabled>
      <span class="block px-4 py-2 opacity-50">Invite a friend (coming soon!)</span>
    </MenuItem>
  </MenuItems>
</Menu>
```

### Dialog Component

```astro
---
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/astro';
---

<Dialog client:load>
  <div class="fixed inset-0 flex items-center justify-center p-4 bg-black/30">
    <DialogPanel class="w-full max-w-md p-6 bg-white rounded-lg">
      <DialogTitle class="text-lg font-medium text-gray-900">
        Payment successful
      </DialogTitle>
      <DialogDescription class="mt-2 text-sm text-gray-500">
        Your payment has been successfully processed.
      </DialogDescription>

      <div class="mt-4">
        <button class="px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md">
          Got it, thanks!
        </button>
      </div>
    </DialogPanel>
  </div>
</Dialog>
```

Note: For a fully functional dialog, you'll need to manage the open state using client-side JavaScript.

### Hydration Strategies

HeadlessUI Astro provides different hydration strategies to optimize performance:

- Default components use `client:visible` (hydrated when visible in viewport)
- `*Load` variants use `client:load` (hydrated immediately)

Example:

```astro
<Menu client:visible>
  {/* Component hydrates when visible */}
</Menu>

<MenuLoad>
  {/* Component hydrates immediately */}
</MenuLoad>
```

## Compatibility with Vue HeadlessUI

HeadlessUI Astro maintains the same API as HeadlessUI Vue with some Astro-specific adaptations:

| Vue Syntax | Astro Syntax |
|------------|--------------|
| `:class="[active ? 'bg-blue-500' : '']"` | `class:list={[active ? 'bg-blue-500' : '']}` |
| `v-slot="{ active }"` | `{({active}) => (...)}` |
| `@click="doSomething"` | Use Vue component with client directive |

## Components

- Menu (Dropdown)
  - Menu
  - MenuButton
  - MenuItems
  - MenuItem
- Dialog (Modal)
  - Dialog
  - DialogPanel
  - DialogTitle
  - DialogDescription
- More components coming soon...

## License

MIT