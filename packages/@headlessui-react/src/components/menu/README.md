## Menu Button (Dropdown)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-menu-example-b6xje?file=/src/App.js)

The `Menu` component and related child components are used to quickly build custom dropdown components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard navigation support.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Styling the active item](#styling-the-active-item)
- [Showing/hiding the menu](#showinghiding-the-menu)
- [Disabling an item](#disabling-an-item)
- [Transitions](#transitions)
- [Rendering additional content](#rendering-additional-content)
- [Rendering a different element for a component](#rendering-a-different-element-for-a-component)
- [Component API](#component-api)

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

### Basic example

Menu Buttons are built using the `Menu`, `Menu.Button`, `Menu.Items`, and `Menu.Item` components.

The `Menu.Button` will automatically open/close the `Menu.Items` when clicked, and when the menu is open, the list of items receives focus and is automatically navigable via the keyboard.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>
      <Menu.Items>
        <Menu.Item>
          {({ active }) => (
            <a className={`${active && 'bg-blue-500'}`} href="/account-settings">
              Account settings
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a className={`${active && 'bg-blue-500'}`} href="/account-settings">
              Documentation
            </a>
          )}
        </Menu.Item>
        <Menu.Item disabled>
          <span className="opacity-75">Invite a friend (coming soon!)</span>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  )
}
```

### Styling the active item

This is a headless component so there are no styles included by default. Instead, the components expose useful information via [render props](https://reactjs.org/docs/render-props.html) that you can use to apply the styles you'd like to apply yourself.

To style the active `Menu.Item` you can read the `active` render prop argument, which tells you whether or not that menu item is the item that is currently focused via the mouse or keyboard.

You can use this state to conditionally apply whatever active/focus styles you like, for instance a blue background like is typical in most operating systems.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>
      <Menu.Items>
        {/* Use the `active` state to conditionally style the active item. */}
        <Menu.Item>
          {({ active }) => (
            <a
              className={`${active ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              href="/account-settings"
            >
              Account settings
            </a>
          )}
        </Menu.Item>
        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

### Showing/hiding the menu

By default, your `Menu.Items` instance will be shown/hidden automatically based on the internal `open` state tracked within the `Menu` component itself.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>

      {/* By default, this will automatically show/hide when the Menu.Button is pressed. */}
      <Menu.Items>
        <Menu.Item>{/* ... */}</Menu.Item>
        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

If you'd rather handle this yourself (perhaps because you need to add an extra wrapper element for one reason or another), you can add a `static` prop to the `Menu.Items` instance to tell it to always render, and inspect the `open` slot prop provided by the `Menu` to control which element is shown/hidden yourself.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      {({ open }) => (
        <Menu.Button>More</Menu.Button>
        {open && (
          <div>
            {/* Using `static`, `Menu.Items` is always rendered and ignores the `open` state. */}
            <Menu.Items static>
              <Menu.Item>{/* ... */}</Menu.Item>
              {/* ... */}
            </Menu.Items>
          </div>
        )}
      )}
    </Menu>
  )
}
```

### Disabling an item

Use the `disabled` prop to disable a `Menu.Item`. This will make it unselectable via keyboard navigation, and it will be skipped when pressing the up/down arrows.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>
      <Menu.Items>
        {/* ... */}

        {/* This item will be skipped by keyboard navigation. */}
        <Menu.Item disabled>
          <span className="opacity-75">Invite a friend (coming soon!)</span>
        </Menu.Item>

        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

### Transitions

To animate the opening/closing of the menu panel, use the provided `Transition` component. All you need to do is mark your `Menu.Items` as `static`, wrap it in a `<Transition>`, and the transition will be applied automatically.

```jsx
import { Menu, Transition } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button>More</Menu.Button>

          {/* Use the Transition + open render prop argument to add transitions. */}
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items static>
              <Menu.Item>{/* ... */}</Menu.Item>
              {/* ... */}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}
```

### Rendering additional content

The `Menu` component is not limited to rendering only its related subcomponents. You can render anything you like within a menu, which gives you complete control over exactly what you are building.

For example, if you'd like to add a little header section to the menu with some extra information in it, just render an extra `div` with your content in it.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      <Menu.Button>More</Menu.Button>
      <Menu.Items>
        <div className="px-4 py-3">
          <p className="text-sm leading-5">Signed in as</p>
          <p className="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
        </div>
        <Menu.Item>
          {({ active }) => (
            <a className={`${active && 'bg-blue-500'}`} href="/account-settings">
              Account settings
            </a>
          )}
        </Menu.Item>

        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

Note that only `Menu.Item` instances will be navigable via the keyboard.

### Rendering a different element for a component

By default, the `Menu` and its subcomponents each render a default element that is sensible for that component.

For example, `Menu.Button` renders a `button` by default, and `Menu.Items` renders a `div`. `Menu` and `Menu.Item` interestingly _do not render an extra element_, and instead render their children directly by default.

This is easy to change using the `as` prop, which exists on every component.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    {/* Render a `div` instead of no wrapper element */}
    <Menu as="div">
      <Menu.Button>More</Menu.Button>
      {/* Render a `ul` instead of a `div` */}
      <Menu.Items as="ul">
        {/* Render an `li` instead of no wrapper element */}
        <Menu.Item as="li">
          {({ active }) => (
            <a className={`${active && 'bg-blue-500'}`} href="/account-settings">
              Account settings
            </a>
          )}
        </Menu.Item>

        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

To tell an element to render its children directly with no wrapper element, use `as={React.Fragment}`.

```jsx
import { Menu } from '@headlessui/react'

function MyDropdown() {
  return (
    <Menu>
      {/* Render no wrapper, instead pass in a button manually. */}
      <Menu.Button as={React.Fragment}>
        <button>More</button>
      </Menu.Button>
      <Menu.Items>
        <Menu.Item>
          {({ active }) => (
            <a className={`${active && 'bg-blue-500'}`} href="/account-settings">
              Account settings
            </a>
          )}
        </Menu.Item>
        {/* ... */}
      </Menu.Items>
    </Menu>
  )
}
```

### Component API

#### Menu

```jsx
<Menu>
  <Menu.Button>More</Menu.Button>
  <Menu.Items>
    <Menu.Item>{/* ... */}</Menu.Item>
    {/* ... */}
  </Menu.Items>
</Menu>
```

##### Props

| Prop | Type                | Default                                 | Description                                           |
| :--- | :------------------ | :-------------------------------------- | :---------------------------------------------------- |
| `as` | String \| Component | `React.Fragment` _(no wrapper element_) | The element or component the `Menu` should render as. |

##### Render prop object

| Prop   | Type    | Description                      |
| :----- | :------ | :------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### Menu.Button

```jsx
<Menu.Button>
  {({ open }) => (
    <>
      <span>More options</span>
      <ChevronRightIcon className={`${open ? 'transform rotate-90' : ''}`} />
    </>
  )}
</Menu.Button>
```

##### Props

| Prop | Type                | Default  | Description                                                  |
| :--- | :------------------ | :------- | :----------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `Menu.Button` should render as. |

##### Render prop object

| Prop   | Type    | Description                      |
| :----- | :------ | :------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### Menu.Items

```jsx
<Menu.Items>
  <Menu.Item>{/* ... */}></Menu.Item>
  {/* ... */}>
</Menu.Items>
```

##### Props

| Prop      | Type                | Default | Description                                                                       |
| :-------- | :------------------ | :------ | :-------------------------------------------------------------------------------- |
| `as`      | String \| Component | `div`   | The element or component the `Menu.Items` should render as.                       |
| `static`  | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state.       |
| `unmount` | Boolean             | `true`  | Whether the element should be unmounted or hidden based on the open/closed state. |

> **note**: `static` and `unmount` can not be used at the same time. You will get a TypeScript error if you try to do it.

##### Render prop object

| Prop   | Type    | Description                      |
| :----- | :------ | :------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### Menu.Item

```jsx
<Menu.Item>
  {({ active }) => (
    <a
      className={`${active ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
      href="/account-settings"
    >
      Account settings
    </a>
  )}
</Menu.Item>
```

##### Props

| Prop       | Type                | Default                                 | Description                                                                           |
| :--------- | :------------------ | :-------------------------------------- | :------------------------------------------------------------------------------------ |
| `as`       | String \| Component | `React.Fragment` _(no wrapper element)_ | The element or component the `Menu.Item` should render as.                            |
| `disabled` | Boolean             | `false`                                 | Whether or not the item should be disabled for keyboard navigation and ARIA purposes. |

##### Render prop object

| Prop       | Type    | Description                                                                        |
| :--------- | :------ | :--------------------------------------------------------------------------------- |
| `active`   | Boolean | Whether or not the item is the active/focused item in the list.                    |
| `disabled` | Boolean | Whether or not the item is the disabled for keyboard navigation and ARIA purposes. |
