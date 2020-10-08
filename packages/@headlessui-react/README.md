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
- [Listbox (Select)](#listbox-select)
- [Switch (Toggle)](#switch-toggle)

### Roadmap

This project is still in early development, but the plan is to build out all of the primitives we need to provide interactive React examples of all of the components included in [Tailwind UI](https://tailwindui.com), the commercial component directory that helps us fund the development of our open-source work like [Tailwind CSS](https://tailwindcss.com).

This includes things like:

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
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
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
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
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
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
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
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      <Transition
        show={isOpen}
        // ...
      >
        {ref => <div ref={ref}>{/* Your content goes here*/}</div>}
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
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
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

| Prop          | Type                                  | Description                                                                           |
| ------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `show`        | Boolean                               | Whether the children should be shown or hidden.                                       |
| `as`          | String Component _(Default: `'div'`)_ | The element or component to render in place of the `Transition` itself.               |
| `appear`      | Boolean _(Default: `false`)_          | Whether the transition should run on initial mount.                                   |
| `enter`       | String _(Default: '')_                | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom`   | String _(Default: '')_                | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`     | String _(Default: '')_                | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`       | String _(Default: '')_                | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom`   | String _(Default: '')_                | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`     | String _(Default: '')_                | Classes to add to the transitioning element immediately after the leave phase starts. |
| `beforeEnter` | Function                              | Callback which is called before we start the enter transition.                        |
| `afterEnter`  | Function                              | Callback which is called after we finished the enter transition.                      |
| `beforeLeave` | Function                              | Callback which is called before we start the leave transition.                        |
| `afterLeave`  | Function                              | Callback which is called after we finished the leave transition.                      |

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
</Menu.Items>
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

## Listbox (Select)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-listbox-example-57eoj?file=/src/App.js)

The `Listbox` component and related child components are used to quickly build custom listbox components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard navigation support.

- [Basic example](#basic-example-2)
- [Styling the active and selected option](#styling-the-active-and-selected-option)
- [Showing/hiding the listbox](#showinghiding-the-listbox)
- [Using a custom label](#using-a-custom-label)
- [Disabling an option](#disabling-an-option)
- [Transitions](#transitions-1)
- [Rendering additional content](#rendering-additional-content-1)
- [Rendering a different element for a component](#rendering-a-different-element-for-a-component-1)
- [Component API](#component-api-2)

### Basic example

Listboxes are built using the `Listbox`, `Listbox.Button`, `Listbox.Options`, `Listbox.Option` and `Listbox.Label` components.

The `Listbox.Button` will automatically open/close the `Listbox.Options` when clicked, and when the menu is open, the list of items receives focus and is automatically navigable via the keyboard.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds', unavailable: false },
    { id: 2, name: 'Kenton Towne', unavailable: false },
    { id: 3, name: 'Therese Wunsch', unavailable: false },
    { id: 4, name: 'Benedict Kessler', unavailable: true },
    { id: 5, name: 'Katelyn Rohan', unavailable: false },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Styling the active and selected option

This is a headless component so there are no styles included by default. Instead, the components expose useful information via [render props](https://reactjs.org/docs/render-props.html) that you can use to apply the styles you'd like to apply yourself.

To style the active `Listbox.Option` you can read the `active` render prop argument, which tells you whether or not that listbox option is the option that is currently focused via the mouse or keyboard.

To style the selected `Listbox.Option` you can read the `selected` render prop argument, which tells you whether or not that listbox option is the option that is currently the `value` passed to the `Listbox`.

> Note: An option can be both **active** and **selected** at the same time!

You can use this state to conditionally apply whatever active/focus styles you like, for instance a blue background like is typical in most operating systems. For the selected state, a checkmark is also common.

```jsx
import { useState, Fragment } from 'react'
import { Listbox } from '@headlessui/react'
import CheckmarkIcon from './CheckmarkIcon'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          {/* Use the `active` state to conditionally style the active option. */}
          {/* Use the `selected` state to conditionally style the selected option. */}
          <Listbox.Option as={Fragment} key={person.id} value={person}>
            {({ active, selected }) => (
              <li className={`${active ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                {selected && <CheckmarkIcon />}
                {person.name}
              </li>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Using a custom label

By default the `Listbox` will use the button contents as the label for screenreaders. However you can also render a custom `Listbox.Label`.

```jsx
import { useState, Fragment } from 'react'
import { Listbox } from '@headlessui/react'
import CheckmarkIcon from './CheckmarkIcon'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Label>Assignee:</Listbox.Label>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option as={Fragment} key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Showing/hiding the listbox

By default, your `Listbox.Options` instance will be shown/hidden automatically based on the internal `open` state tracked within the `Listbox` component itself.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds', unavailable: false },
    { id: 2, name: 'Kenton Towne', unavailable: false },
    { id: 3, name: 'Therese Wunsch', unavailable: false },
    { id: 4, name: 'Benedict Kessler', unavailable: true },
    { id: 5, name: 'Katelyn Rohan', unavailable: false },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>

      {/* By default, this will automatically show/hide when the Listbox.Button is pressed. */}
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

If you'd rather handle this yourself (perhaps because you need to add an extra wrapper element for one reason or another), you can add a `static` prop to the `Listbox.Options` instance to tell it to always render, and inspect the `open` slot prop provided by the `Listbox` to control which element is shown/hidden yourself.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds', unavailable: false },
    { id: 2, name: 'Kenton Towne', unavailable: false },
    { id: 3, name: 'Therese Wunsch', unavailable: false },
    { id: 4, name: 'Benedict Kessler', unavailable: true },
    { id: 5, name: 'Katelyn Rohan', unavailable: false },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      {({ open }) => (
        <>
          <Listbox.Button>{selectedPerson.name}</Listbox.Button>
          {open && (
            <div>
              {/* Using `static`, `Listbox.Options` is always rendered and ignores the `open` state. */}
              <Listbox.Options static>
                {people.map(person => (
                  <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
                    {person.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          )}
        </>
      )}
    </Listbox>
  )
}
```

### Disabling an option

Use the `disabled` prop to disable a `Listbox.Option`. This will make it unselectable via keyboard navigation, and it will be skipped when pressing the up/down arrows.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds', unavailable: false },
    { id: 2, name: 'Kenton Towne', unavailable: false },
    { id: 3, name: 'Therese Wunsch', unavailable: false },
    { id: 4, name: 'Benedict Kessler', unavailable: true },
    { id: 5, name: 'Katelyn Rohan', unavailable: false },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          {/* Disabled options will be skipped by keyboard navigation. */}
          <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
            <span className={person.unavailable ? 'opacity-75' : ''}>{person.name}</span>
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Transitions

To animate the opening/closing of the listbox panel, use the provided `Transition` component. All you need to do is mark your `Listbox.Options` as `static`, wrap it in a `<Transition>`, and the transition will be applied automatically.

```jsx
import { useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds', unavailable: false },
    { id: 2, name: 'Kenton Towne', unavailable: false },
    { id: 3, name: 'Therese Wunsch', unavailable: false },
    { id: 4, name: 'Benedict Kessler', unavailable: true },
    { id: 5, name: 'Katelyn Rohan', unavailable: false },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      {({ open }) => (
        <>
          <Listbox.Button>{selectedPerson.name}</Listbox.Button>
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
            <Listbox.Options static>
              {people.map(person => (
                <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
                  {person.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  )
}
```

### Rendering a different element for a component

By default, the `Listbox` and its subcomponents each render a default element that is sensible for that component.

For example, `Listbox.Label` renders a `label` by default, `Listbox.Button` renders a `button` by default, `Listbox.Options` renders a `ul` and `Listbox.Option` renders a `li` by default. `Listbox` interestingly _does not render an extra element_, and instead renders its children directly by default.

This is easy to change using the `as` prop, which exists on every component.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox as="div" value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options as="div">
        {people.map(person => (
          <Listbox.Option as="span" key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

To tell an element to render its children directly with no wrapper element, use `as={React.Fragment}`.

```jsx
import { useState, Fragment } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button as={Fragment}>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Component API

#### Listbox

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

function MyListbox() {
  const people = [
    { id: 1, name: 'Durward Reynolds' },
    { id: 2, name: 'Kenton Towne' },
    { id: 3, name: 'Therese Wunsch' },
    { id: 4, name: 'Benedict Kessler' },
    { id: 5, name: 'Katelyn Rohan' },
  ]
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

##### Props

| Prop       | Type                    | Default                                 | Description                                              |
| ---------- | ----------------------- | --------------------------------------- | -------------------------------------------------------- |
| `as`       | String \| Component     | `React.Fragment` _(no wrapper element_) | The element or component the `Listbox` should render as. |
| `value`    | `T` |                              | The selected value.                                      |
| `onChange` | `(value: T): void`      |                              | The function to call when a new option is selected.      |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### Listbox.Button

```jsx
<Listbox.Button>
  {({ open }) => (
    <>
      <span>More options</span>
      <ChevronRightIcon className={`${open ? 'transform rotate-90' : ''}`} />
    </>
  )}
</Listbox.Button>
```

##### Props

| Prop | Type                | Default  | Description                                                     |
| ---- | ------------------- | -------- | --------------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `Listbox.Button` should render as. |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### Listbox.Label

```jsx
<Listbox.Label>Enable notifications</Listbox.Label>
```

##### Props

| Prop | Type                | Default | Description                                                    |
| ---- | ------------------- | ------- | -------------------------------------------------------------- |
| `as` | String \| Component | `label` | The element or component the `Listbox.Label` should render as. |

#### Listbox.Options

```jsx
<Listbox.Options>
  <Listbox.Option value="option-a">{/* ... */}></Listbox.Option>
  {/* ... */}>
</Listbox.Options>
```

##### Props

| Prop     | Type                | Default | Description                                                                 |
| -------- | ------------------- | ------- | --------------------------------------------------------------------------- |
| `as`     | String \| Component | `ul`    | The element or component the `Listbox.Options` should render as.            |
| `static` | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state. |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### Listbox.Option

```jsx
<Listbox.Option value="option-a">Option A</Listbox.Option>
```

##### Props

| Prop       | Type                    | Default     | Description                                                                             |
| ---------- | ----------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `as`       | String \| Component     | `li`        | The element or component the `Listbox.Option` should render as.                         |
| `value`    | `T` |  | The option value. |
| `disabled` | Boolean                 | `false`     | Whether or not the option should be disabled for keyboard navigation and ARIA purposes. |

##### Render prop object

| Prop       | Type    | Description                                                                          |
| ---------- | ------- | ------------------------------------------------------------------------------------ |
| `active`   | Boolean | Whether or not the option is the active/focused option in the list.                  |
| `selected` | Boolean | Whether or not the option is the selected option in the list.                        |
| `disabled` | Boolean | Whether or not the option is the disabled for keyboard navigation and ARIA purposes. |

## Switch (Toggle)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-switch-example-y40i1?file=/src/App.js)

The `Switch` component and related child components are used to quickly build custom switch/toggle components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard support.

- [Basic example](#basic-example-3)
- [Using a custom label](#using-a-custom-label-1)
- [Component API](#component-api-3)

### Basic example

Switches are built using the `Switch` component. Optionally you can also use the `Switch.Group` and `Switch.Label` components.

```jsx
import { useState } from 'react'
import { Switch } from '@headlessui/react'

function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false)

  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={`${enabled ? "bg-blue-600" : "bg-gray-200"} relative inline-flex h-6 rounded-full w-8`}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={`${enabled ? "translate-x-4" : "translate-x-0"} inline-block w-4 h-4 transform bg-white rounded-full`}
      />
    </Switch>
  )
}
```

### Using a custom label

By default the `Switch` will use the contents as the label for screenreaders. If you need more control, you can render a `Switch.Label` outside of the `Switch`, as long as both the switch and label are within a parent `Switch.Group`.

Clicking the label will toggle the switch state, like you'd expect from a native checkbox.

```jsx
import { useState } from 'react'
import { Switch } from '@headlessui/react'

function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false)

  return (
    <Switch.Group>
      <Switch.Label>Enable notifications</Switch.Label>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${enabled ? "bg-blue-600" : "bg-gray-200"} relative inline-flex h-6 rounded-full w-8`}
      >
        <span
          className={`${enabled ? "translate-x-4" : "translate-x-0"} inline-block w-4 h-4 transform bg-white rounded-full`}
        />
      </Switch>
    </Switch.Group>
  )
}
```

### Component API

#### Switch

```jsx
<Switch checked={checkedState} onChange={setCheckedState}>
  <span className="sr-only">Enable notifications</span>
  {/* ... */}
</Switch>
```

##### Props

| Prop       | Type                    | Default                                 | Description                                              |
| ---------- | ----------------------- | --------------------------------------- | -------------------------------------------------------- |
| `as`       | String \| Component     | `button` | The element or component the `Switch` should render as. |
| `checked`    | Boolean |                              | Whether or not the switch is checked.                                      |
| `onChange` | `(value: boolean): void`      |                              | The function to call when the switch is toggled.      |

##### Render prop object

| Prop   | Type    | Description                         |
| ------ | ------- | ----------------------------------- |
| `checked` | Boolean | Whether or not the switch is checked. |


#### Switch.Label

```jsx
<Switch.Group>
  <Switch.Label>Enable notifications</Switch.Label>
  <Switch checked={enabled} onChange={setEnabled} className="...">
    {/* ... */}
  </Switch>
</Switch.Group>
```

##### Props

| Prop       | Type                    | Default                                 | Description                                              |
| ---------- | ----------------------- | --------------------------------------- | -------------------------------------------------------- |
| `as`       | String \| Component     | `label` | The element or component the `Switch.Label` should render as. |

#### Switch.Group

```jsx
<Switch.Group>
  <Switch.Label>Enable notifications</Switch.Label>
  <Switch checked={enabled} onChange={setEnabled} className="...">
    {/* ... */}
  </Switch>
</Switch.Group>
```

##### Props

| Prop       | Type                    | Default                                 | Description                                              |
| ---------- | ----------------------- | --------------------------------------- | -------------------------------------------------------- |
| `as`       | String \| Component     | `React.Fragment` _(no wrapper element)_| The element or component the `Switch.Group` should render as. |
