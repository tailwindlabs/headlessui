## Transition

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-menu-example-b6xje?file=/src/App.js)

The `Transition` component lets you add enter/leave transitions to conditionally rendered elements, using CSS classes to control the actual transition styles in the different stages of the transition.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Showing and hiding content](#showing-and-hiding-content)
- [Animating transitions](#animating-transitions)
- [Co-ordinating multiple transitions](#co-ordinating-multiple-transitions)
- [Transitioning on initial mount](#transitioning-on-initial-mount)
- [Component API](#component-api)

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

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

| Prop          | Type                | Default | Description                                                                           |
| :------------ | :------------------ | :------ | :------------------------------------------------------------------------------------ |
| `show`        | Boolean             | -       | Whether the children should be shown or hidden.                                       |
| `as`          | String \| Component | `div`   | The element or component to render in place of the `Transition` itself.               |
| `appear`      | Boolean             | `false` | Whether the transition should run on initial mount.                                   |
| `unmount`     | Boolean             | `true`  | Whether the element should be `unmounted` or `hidden` based on the show state.        |
| `enter`       | String              | `''`    | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom`   | String              | `''`    | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`     | String              | `''`    | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`       | String              | `''`    | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom`   | String              | `''`    | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`     | String              | `''`    | Classes to add to the transitioning element immediately after the leave phase starts. |
| `beforeEnter` | Function            | -       | Callback which is called before we start the enter transition.                        |
| `afterEnter`  | Function            | -       | Callback which is called after we finished the enter transition.                      |
| `beforeLeave` | Function            | -       | Callback which is called before we start the leave transition.                        |
| `afterLeave`  | Function            | -       | Callback which is called after we finished the leave transition.                      |

##### Render prop object

- None

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

| Prop          | Type                | Default | Description                                                                           |
| :------------ | :------------------ | :------ | :------------------------------------------------------------------------------------ |
| `as`          | String \| Component | `div`   | The element or component to render in place of the `Transition.Child` itself.         |
| `appear`      | Boolean             | `false` | Whether the transition should run on initial mount.                                   |
| `unmount`     | Boolean             | `true`  | Whether the element should be `unmounted` or `hidden` based on the show state.        |
| `enter`       | String              | `''`    | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom`   | String              | `''`    | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`     | String              | `''`    | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`       | String              | `''`    | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom`   | String              | `''`    | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`     | String              | `''`    | Classes to add to the transitioning element immediately after the leave phase starts. |
| `beforeEnter` | Function            | -       | Callback which is called before we start the enter transition.                        |
| `afterEnter`  | Function            | -       | Callback which is called after we finished the enter transition.                      |
| `beforeLeave` | Function            | -       | Callback which is called before we start the leave transition.                        |
| `afterLeave`  | Function            | -       | Callback which is called after we finished the leave transition.                      |

##### Render prop object

- None
