# HeadlessUI for Astro

Completely unstyled, fully accessible UI components for Astro.

## Installation

```bash
npm install @headlessui/astro
```

No additional integrations are required. HeadlessUI Astro is a standalone package designed specifically for Astro's partial hydration system.

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
    <MenuItem as="a" href="#" class="block px-4 py-2 ui-active:bg-blue-500 ui-active:text-white">
      Account settings
    </MenuItem>
    <MenuItem disabled>
      <span class="block px-4 py-2 opacity-50">Invite a friend (coming soon!)</span>
    </MenuItem>
  </MenuItems>
</Menu>
```

With Tailwind, you can use data attribute selectors to style active states:

```astro
<style global>
  [data-headlessui-menu-item][data-active="true"] {
    @apply bg-blue-500 text-white;
  }
</style>
```

Or with Tailwind's plugin for headlessUI:

```js
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@headlessui/tailwindcss')
  ],
}
```

```astro
<MenuItem as="a" href="#" class="block px-4 py-2 ui-active:bg-blue-500 ui-active:text-white">
  Account settings
</MenuItem>
```

### Dialog Component

```astro
---
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/astro';
---

<script>
  // Client-side JavaScript to control dialog
  let isOpen = false;
  
  function openDialog() {
    const dialog = document.querySelector('[data-headlessui-dialog]');
    if (dialog) {
      dialog.dataset.headlessuiState = 'open';
      // The dialog component's client-side script will handle focus management
    }
  }
  
  function closeDialog() {
    const dialog = document.querySelector('[data-headlessui-dialog]');
    if (dialog) {
      dialog.dataset.headlessuiState = '';
    }
  }
</script>

<button onclick="openDialog()" class="px-4 py-2 bg-blue-500 text-white rounded">
  Open Dialog
</button>

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
        <button onclick="closeDialog()" class="px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md">
          Got it, thanks!
        </button>
      </div>
    </DialogPanel>
  </div>
</Dialog>
```

For a more integrated solution, you can use Astro's client directives to manage dialog state:

```astro
---
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/astro';
---

<button id="openDialog" class="px-4 py-2 bg-blue-500 text-white rounded" client:load>
  Open Dialog
</button>

<Dialog id="myDialog" client:load>
  <!-- Dialog content -->
</Dialog>

<script>
  // More robust state management
  document.getElementById('openDialog')?.addEventListener('click', () => {
    const dialog = document.getElementById('myDialog');
    if (dialog) dialog.dataset.headlessuiState = 'open';
  });
</script>
```

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

## Component Architecture

HeadlessUI Astro components are built with a focus on performance and accessibility:

- **Native Implementation**: Components are implemented in pure TypeScript with no framework dependencies
- **Partial Hydration**: Designed to work optimally with Astro's partial hydration system
- **Accessibility**: Following WAI-ARIA patterns and keyboard navigation standards
- **Performance**: Minimal client-side JavaScript, hydrated only when needed

## Component API

HeadlessUI Astro provides components with a consistent API that's designed specifically for Astro:

- `as` prop to control the rendered element (e.g., `<Menu as="div">`)
- Data attributes for CSS styling (e.g., `[data-headlessui-state="open"]`)
- Automatic ARIA attributes for accessibility
- Slot-based composition pattern

### Active States

Active states for items are exposed via data attributes that you can style with CSS:

```css
/* Style active menu items */
[data-headlessui-menu-item][data-active="true"] {
  background-color: #3b82f6;
  color: white;
}
```

You can also access active states in your templates:

```astro
<MenuItem class="group">
  <button class:list={["block px-4 py-2 w-full text-left", "group-data-[active=true]:bg-blue-500 group-data-[active=true]:text-white"]}>
    Account settings
  </button>
</MenuItem>
```

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

## Technical Details

HeadlessUI Astro is built as a standalone package with these features:

- Custom state management system
- Focus management utilities
- Keyboard navigation handlers
- Accessible HTML structure with proper ARIA attributes
- Client-side hydration through Astro's partial hydration system

## License

MIT