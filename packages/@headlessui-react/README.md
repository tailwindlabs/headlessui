<h3 align="center">
  @headlessui/react
</h3>

<p align="center">
  A set of completely unstyled, fully accessible UI components for React, designed to integrate
  beautifully with Tailwind CSS.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@headlessui/react"><img src="https://img.shields.io/npm/dt/@headlessui/react.svg" alt="Total Downloads"></a>
  <a href="https://github.com/tailwindlabs/headlessui/releases"><img src="https://img.shields.io/npm/v/@headlessui/react.svg" alt="Latest Release"></a>
  <a href="https://github.com/tailwindlabs/headlessui/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@headlessui/react.svg" alt="License"></a>
</p>

## Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

## Components

_This project is still in early development. New components will be added regularly over the coming months._

- [Transition](#transition)
- [Menu Button (Dropdown)](#menu-button-dropdown)

### Roadmap

This project is still in early development, but the plan is to build out all of the primitives we need to provide interactive React examples of all of the components included in [Tailwind UI](https://tailwindui.com), the commercial component directory that helps us fund the development of our open-source work like [Tailwind CSS](https://tailwindcss.com).

This includes things like:

- Listboxes
- Toggles
- Modals
- Tabs
- Slide-overs
- Mobile menus
- Accordions

...and more in the future.

We'll be continuing to develop new components on an on-going basis, with a goal of reaching a pretty fleshed out v1.0 by the end of the year.

---

## Transition

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-menu-example-b6xje?file=/src/App.js)

The `Transition` component lets you add enter/leave transitions to conditionally rendered elements, using CSS classes to control the actual transition styles in the different stages of the transition.

- [Basic example](#basic-example)
- [Showing and hiding content](#showing-and-hiding-content)
- [Animating transitions](#animating-transitions)
- [Co-ordinating multiple transitions](#co-ordinating-multiple-transitions)
- [Transitioning on initial mount](#transitioning-on-initial-mount)
- [Component API](#component-api)

### Basic example

The `Transition` accepts a `show` prop that controls whether the children should be shown or hidden, and a set of lifecycle props (like `enterFrom`, and `leaveTo`) that let you add CSS classes at specific phases of a transition.

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <Transition
        show={isOpen}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        I will fade in and out
      </Transition>
    </>
  )
}
```

### Showing and hiding content

Wrap the content that should be conditionally rendered in a `<Transition>` component, and use the `show` prop to control whether the content should be visible or hidden.

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <Transition
        show={isOpen}
        // ...
      >
        I will fade in and out
      </Transition>
    </>
  )
}
```

The `Transition` component will render a `div` by default, but you can use the `as` prop to render a different element instead if needed. Any other HTML attributes (like `className`) can be added directly to the `Transition` the same way they would be to regular elements.

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <Transition
        show={isOpen}
        as="a"
        href="/my-url"
        className="font-bold"
        // ...
      >
        I will fade in and out
      </Transition>
    </>
  )
}
```

If you'd prefer not to render an additional element at all, you can pass your children as a function instead which will receive a `ref` that you need to attach to your root node:

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <Transition
        show={isOpen}
        // ...
      >
        {(ref) => <div ref={ref}>{/* Your content goes here*/}</div>}
      </Transition>
    </>
  )
}
```

Be sure to attach the `ref` or your transitions will not work correctly.

### Animating transitions

By default, a `Transition` will enter and leave instantly, which is probably not what you're looking for if you're using this library.

To animate your enter/leave transitions, add classes that provide the styling for each phase of the transitions using these props:

- **enter**: Applied the entire time an element is entering. Usually you define your duration and what properties you want to transition here, for example `transition-opacity duration-75`.
- **enterFrom**: The starting point to enter from, for example `opacity-0` if something should fade in.
- **enterTo**: The ending point to enter to, for example `opacity-100` after fading in.
- **leave**: Applied the entire time an element is leaving. Usually you define your duration and what properties you want to transition here, for example `transition-opacity duration-75`.
- **leaveFrom**: The starting point to leave from, for example `opacity-100` if something should fade out.
- **leaveTo**: The ending point to leave to, for example `opacity-0` after fading out.

Here's an example:

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      <Transition
        show={isOpen}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        I will fade in and out
      </Transition>
    </>
  )
}
```

In this example, the transitioning element will take 75ms to enter (that's the `duration-75` class), and will transition the opacity property during that time (that's `transition-opacity`).

It will start completely transparent before entering (that's `opacity-0` in the `enterFrom` phase), and fade in to completely opaque (`opacity-100`) when finished (that's the `enterTo` phase).

When the element is being removed (the `leave` phase), it will transition the opacity property, and spend 150ms doing it (`transition-opacity duration-150`).

It will start as completely opaque (the `opacity-100` in the `leaveFrom` phase), and finish as completely transparent (the `opacity-0` in the `leaveTo` phase).

All of these props are optional, and will default to just an empty string.

### Co-ordinating multiple transitions

Sometimes you need to transition multiple elements with different animations but all based on the same state. For example, say the user clicks a button to open a sidebar that slides over the screen, and you also need to fade-in a background overlay at the same time.

You can do this by wrapping the related elements with a parent `Transition` component, and wrapping each child that needs its own transition styles with a `Transition.Child` component, which will automatically communicate with the parent `Transition` and inherit the parent's `show` state.

```tsx
import { Transition } from '@headlessui/react'

function Sidebar({ isOpen }) {
  return (
    <Transition show={isOpen}>
      {/* Background overlay */}
      <Transition.Child
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {/* ... */}
      </Transition.Child>

      {/* Sliding sidebar */}
      <Transition.Child
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        {/* ... */}
      </Transition.Child>
    </Transition>
  )
}
```

The `Transition.Child` component has the exact same API as the `Transition` component, but with no `show` prop, since the `show` value is controlled by the parent.

Parent `Transition` components will always automatically wait for all children to finish transitioning before unmounting, so you don't need to manage any of that timing yourself.

### Transitioning on initial mount

If you want an element to transition the very first time it's rendered, set the `appear` prop to `true`.

This is useful if you want something to transition in on initial page load, or when its parent is conditionally rendered.

```tsx
import { Transition } from '@headlessui/react'

function MyComponent({ isShowing }) {
  return (
    <Transition
      appear={true}
      show={isShowing}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {/* Your content goes here*/}
    </Transition>
  )
}
```

### Component API

#### Transition

```jsx
<Transition
  appear={true}
  show={isOpen}
  enter="transition-opacity duration-75"
  enterFrom="opacity-0"
  enterTo="opacity-100"
  leave="transition-opacity duration-150"
  leaveFrom="opacity-100"
  leaveTo="opacity-0"
>
  {/* Your content goes here*/}
</Transition>
```

##### Props

| Prop        | Type                                  | Description                                                                           |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `show`      | Boolean                               | Whether the children should be shown or hidden.                                       |
| `as`        | String Component _(Default: `'div'`)_ | The element or component to render in place of the `Transition` itself.               |
| `appear`    | Boolean _(Default: `false`)_          | Whether the transition should run on initial mount.                                   |
| `enter`     | String _(Default: '')_                | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom` | String _(Default: '')_                | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`   | String _(Default: '')_                | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`     | String _(Default: '')_                | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom` | String _(Default: '')_                | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`   | String _(Default: '')_                | Classes to add to the transitioning element immediately after the leave phase starts. |

##### Render prop arguments

| Prop  | Type                   | Description                                                                         |
| ----- | ---------------------- | ----------------------------------------------------------------------------------- |
| `ref` | React.MutableRefObject | A ref that needs to be manually added to the child node when using the render prop. |

#### Transition.Child

```jsx
<Transition show={isOpen}>
  <Transition.Child
    enter="transition-opacity ease-linear duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity ease-linear duration-300"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    {/* ... */}
  </Transition.Child>
  {/* ... */}
</Transition>
```

##### Props

| Prop        | Type                                  | Description                                                                           |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `as`        | String Component _(Default: `'div'`)_ | The element or component to render in place of the `Transition.Child` itself.         |
| `appear`    | Boolean _(Default: `false`)_          | Whether the transition should run on initial mount.                                   |
| `enter`     | String _(Default: '')_                | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom` | String _(Default: '')_                | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`   | String _(Default: '')_                | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`     | String _(Default: '')_                | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom` | String _(Default: '')_                | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`   | String _(Default: '')_                | Classes to add to the transitioning element immediately after the leave phase starts. |

##### Render prop arguments

| Prop  | Type                   | Description                                                                         |
| ----- | ---------------------- | ----------------------------------------------------------------------------------- |
| `ref` | React.MutableRefObject | A ref that needs to be manually added to the child node when using the render prop. |

---

## Menu Button (Dropdown)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-menu-example-b6xje?file=/src/App.js)

The `Menu` component and related child components are used to quickly build custom dropdown components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard navigation support.

- [Basic example](#basic-example-1)
- [Styling the active item](#styling-the-active-item)
- [Showing/hiding the menu](#showinghiding-the-menu)
- [Disabling an item](#disabling-an-item)
- [Transitions](#transitions)
- [Rendering additional content](#rendering-additional-content)
- [Rendering a different element for a component](#rendering-a-different-element-for-a-component)
- [Component API](#component-api-1)

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
        <div class="px-4 py-3">
          <p class="text-sm leading-5">Signed in as</p>
          <p class="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
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
| ---- | ------------------- | --------------------------------------- | ----------------------------------------------------- |
| `as` | String \| Component | `React.Fragment` _(no wrapper element_) | The element or component the `Menu` should render as. |

##### Render prop object

| Prop   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
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
| ---- | ------------------- | -------- | ------------------------------------------------------------ |
| `as` | String \| Component | `button` | The element or component the `Menu.Button` should render as. |

##### Render prop object

| Prop   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| `open` | Boolean | Whether or not the menu is open. |

#### Menu.Items

```jsx
<Menu.Items>
  <Menu.Item>{/* ... */}></Menu.Item>
  {/* ... */}>
</Menu.Item>
```

##### Props

| Prop     | Type                | Default | Description                                                                 |
| -------- | ------------------- | ------- | --------------------------------------------------------------------------- |
| `as`     | String \| Component | `div`   | The element or component the `Menu.Items` should render as.                 |
| `static` | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state. |

##### Render prop object

| Prop   | Type    | Description                      |
| ------ | ------- | -------------------------------- |
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
| ---------- | ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| `as`       | String \| Component | `React.Fragment` _(no wrapper element)_ | The element or component the `Menu.Item` should render as.                            |
| `disabled` | Boolean             | `false`                                 | Whether or not the item should be disabled for keyboard navigation and ARIA purposes. |

##### Render prop object

| Prop       | Type    | Description                                                                        |
| ---------- | ------- | ---------------------------------------------------------------------------------- |
| `active`   | Boolean | Whether or not the item is the active/focused item in the list.                    |
| `disabled` | Boolean | Whether or not the item is the disabled for keyboard navigation and ARIA purposes. |
