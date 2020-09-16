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

```shell
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

## Components

This project is still in early development, but the plan is to build out all of the primitives we need to provide interactive React examples of all of the components included in [Tailwind UI](https://tailwindui.com), the commercial component directory that helps us fund the development of our open-source work like [Tailwind CSS](https://tailwindcss.com).

This includes things like:

- Dropdowns
- Toggles
- Modals
- Tabs
- Slide-overs
- Mobile menus
- Listboxes
- Accordions

...and more in the future.

We decided to start with an enter/leave [Transition](#transition) component that is tailor-made for Tailwind's utility-first CSS approach, to help bring the React experience up to parity with what's already possible in the Vue ecosystem.

We'll be continuing to develop new components on an on-going basis, with a goal of reaching a pretty fleshed out v1.0 by the end of the year.

### Transition

The `Transition` component lets you add enter/leave transitions to conditionally rendered elements, using CSS classes to control the actual transition styles in the different stages of the transition.

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
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
  )
}
```

#### Showing and hiding the Transition content

Wrap the content that should be conditionally rendered in a `<Transition>` component, and use the `show` prop to control whether the content should be visible or hidden.

```tsx
import { Transition } from '@headlessui/react'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      Toggle
    </button>
    <Transition
      show={isOpen}
      // ...
    >
      I will fade in and out
    </Transition>
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
    <button onClick={() => setIsOpen(!isOpen)}>
      Toggle
    </button>
    <Transition
      show={isOpen}
      // ...
    >
      {ref => <div ref={ref}>{/* Your content goes here*/}</div>}
    </Transition>
  )
}
```

Be sure to attach the `ref` or your transitions will not work correctly.

#### Animating transitions

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
  )
}
```

In this example, the transitioning element will take 75ms to enter (that's the `duration-75` class), and will transition the opacity property during that time (that's `transition-opacity`).

It will start completely transparent before entering (that's `opacity-0` in the `enterFrom` phase), and fade in to completely opaque (`opacity-100`) when finished (that's the `enterTo` phase).

When the element is being removed (the `leave` phase), it will transition the opacity property, and spend 150ms doing it (`transition-opacity duration-150`).

It will start as completely opaque (the `opacity-100` in the `leaveFrom` phase), and finish as completely transparent (the `opacity-0` in the `leaveTo` phase).

All of these props are optional, and will default to just an empty string.

#### Co-ordinating multiple transitions

Sometimes you need to transition multiple elements with different animations but all based on the same state. For example, say the user clicks a button to open a sidebar that slides over the screen, and you also need to fade-in a background overlay at the same time.

You can do this by wrapping the related elements with a parent `Transition` component, and wrapping each child that needs its own transition styles with a `Transition.Child` component, which will automatically communicate with the parent `Transition` and inherit the parent's `show` state.

```tsx
import { Transition } from '@headlessui/react'

function Sidebar({ isOpen }) {
  return (
    <Transition show={isOpen}>
      {/* Shared parent */}
      <div>
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
      </div>
    </Transition>
  )
}
```

The `Transition.Child` component has the exact same API as the `Transition` component, but with no `show` prop, since the `show` value is controlled by the parent.

Parent `Transition` components will always automatically wait for all children to finish transitioning before unmounting, so you don't need to manage any of that timing yourself.

#### Transitioning on initial mount

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
