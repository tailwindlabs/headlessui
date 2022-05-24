<h3 align="center">
  @headlessui/tailwindcss
</h3>

<p align="center">
  A complementary Tailwind CSS plugin for Headless UI
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@headlessui/tailwindcss"><img src="https://img.shields.io/npm/dt/@headlessui/tailwindcss.svg" alt="Total Downloads"></a>
  <a href="https://github.com/tailwindlabs/headlessui/releases"><img src="https://img.shields.io/npm/v/@headlessui/tailwindcss.svg" alt="Latest Release"></a>
  <a href="https://github.com/tailwindlabs/headlessui/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@headlessui/tailwindcss.svg" alt="License"></a>
</p>

## Installation

```sh
npm install @headlessui/tailwindcss
```

```js
// tailwind.config.js
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
    require('@headlessui/tailwindcss')

    // Or with a custom prefix:
    require('@headlessui/tailwindcss')({ prefix: 'ui' })
  ],
}
```

## Documentation

Use Tailwind CSS utilities for styling the components based on their state. You can use the
following variants:

| Variant       | Inverse variant   |
| ------------- | ----------------- |
| `ui-open`     | `ui-not-open`     |
| `ui-checked`  | `ui-not-checked`  |
| `ui-selected` | `ui-not-selected` |
| `ui-active`   | `ui-not-active`   |
| `ui-disabled` | `ui-not-disabled` |

Example:

```js
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>
      <Menu.Items>
        <Menu.Item>
          <a
            className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
            href="/account-settings"
          >
            Account settings
          </a>
        </Menu.Item>
        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discuss Headless UI on GitHub](https://github.com/tailwindlabs/headlessui/discussions)

For casual chit-chat with others using the library:

[Join the Tailwind CSS Discord Server](https://discord.gg/7NF8GNe)
