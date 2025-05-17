# HeadlessUI for Astro

Completely unstyled, fully accessible UI components for Astro.

## Installation

```bash
npm install @headlessui-astro
```

No additional integrations are required. HeadlessUI Astro is a standalone package designed specifically for Astro's partial hydration system.

## Usage

### Menu Component

```astro
---
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui-astro';
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
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui-astro';
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
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui-astro';
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

### Disclosure Component

```astro
---
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui-astro';
---

<Disclosure as="div" class="w-full max-w-md mx-auto">
  <DisclosureButton class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
    <span>What is HeadlessUI?</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </DisclosureButton>
  <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
    HeadlessUI is a set of completely unstyled, fully accessible UI components for building user interfaces with complete styling freedom.
  </DisclosurePanel>
</Disclosure>
```

You can use Tailwind's plugin for headlessUI for active states:

```astro
<Disclosure as="div" class="w-full max-w-md mx-auto">
  <DisclosureButton class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-purple-100 rounded-lg ui-open:bg-purple-200">
    <span>What is HeadlessUI?</span>
    <svg class="w-5 h-5 ui-open:transform ui-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </DisclosureButton>
  <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
    HeadlessUI is a set of completely unstyled, fully accessible UI components.
  </DisclosurePanel>
</Disclosure>
```

### Listbox Component

```astro
---
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel } from '@headlessui-astro';

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false },
];

const selectedPerson = { id: 1, name: 'Durward Reynolds', unavailable: false };
---

<Listbox as="div" class="relative w-72" value={selectedPerson}>
  <ListboxLabel class="block text-sm font-medium text-gray-700">
    Assigned to
  </ListboxLabel>
  
  <div class="relative mt-1">
    <ListboxButton class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
      <span class="block truncate" id="selected-person">{selectedPerson.name}</span>
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </span>
    </ListboxButton>

    <ListboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
      {people.map((person) => (
        <ListboxOption
          value={person}
          disabled={person.unavailable}
          class:list={[
            "relative cursor-default select-none py-2 pl-10 pr-4",
            "ui-active:bg-amber-100 ui-active:text-amber-900",
            "ui-disabled:opacity-50 ui-disabled:cursor-not-allowed",
          ]}
        >
          {({ active, selected }) => (
            <>
              <span class:list={["block truncate", selected ? "font-medium" : "font-normal"]}>
                {person.name}
              </span>
              {selected && (
                <span class:list={["absolute inset-y-0 left-0 flex items-center pl-3", active ? "text-amber-600" : "text-amber-600"]}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              )}
            </>
          )}
        </ListboxOption>
      ))}
    </ListboxOptions>
  </div>
</Listbox>

<script>
  // Handle selection change
  document.addEventListener('listbox:change', (event) => {
    if (event.target) {
      // Get the selected value from the custom event
      const selectedValue = event.detail?.value;
      
      // Update the display (in a real app you might want to use a reactive framework)
      if (selectedValue && selectedValue.name) {
        const displayElement = document.getElementById('selected-person');
        if (displayElement) {
          displayElement.textContent = selectedValue.name;
        }
      }
    }
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
- Disclosure (Accordion)
  - Disclosure
  - DisclosureButton
  - DisclosurePanel
- Listbox (Select)
  - Listbox
  - ListboxButton
  - ListboxOptions
  - ListboxOption
  - ListboxLabel
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