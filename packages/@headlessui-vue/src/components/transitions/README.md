## Transition

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
npm install @headlessui/vue

# Yarn
yarn add @headlessui/vue
```

### Basic example

The `Transition` accepts a `show` prop that controls whether the children should be shown or hidden, and a set of lifecycle props (like `enterFrom`, and `leaveTo`) that let you add CSS classes at specific phases of a transition.

```vue
<template>
  <button @click="open = !open">Toggle</button>
  <TransitionRoot
    :show="open"
    enter="transition-opacity duration-75"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-150"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    I will fade in and out
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

### Showing and hiding content

Wrap the content that should be conditionally rendered in a `<Transition>` component, and use the `show` prop to control whether the content should be visible or hidden.

```vue
<template>
  <button @click="open = !open">Toggle</button>
  <TransitionRoot :show="open">
    I will fade in and out
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

The `Transition` component will render a `div` by default, but you can use the `as` prop to render a different element instead if needed. Any other HTML attributes (like `className`) can be added directly to the `Transition` the same way they would be to regular elements.

```vue
<template>
  <button @click="open = !open">Toggle</button>
  <TransitionRoot :show="open" as="a" href="/my-url" class="font-bold">
    I will fade in and out
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
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

```vue
<template>
  <button @click="open = !open">Toggle</button>
  <TransitionRoot
    :show="open"
    enter="transition-opacity duration-75"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-150"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    I will fade in and out
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

In this example, the transitioning element will take 75ms to enter (that's the `duration-75` class), and will transition the opacity property during that time (that's `transition-opacity`).

It will start completely transparent before entering (that's `opacity-0` in the `enterFrom` phase), and fade in to completely opaque (`opacity-100`) when finished (that's the `enterTo` phase).

When the element is being removed (the `leave` phase), it will transition the opacity property, and spend 150ms doing it (`transition-opacity duration-150`).

It will start as completely opaque (the `opacity-100` in the `leaveFrom` phase), and finish as completely transparent (the `opacity-0` in the `leaveTo` phase).

All of these props are optional, and will default to just an empty string.

### Co-ordinating multiple transitions

Sometimes you need to transition multiple elements with different animations but all based on the same state. For example, say the user clicks a button to open a sidebar that slides over the screen, and you also need to fade-in a background overlay at the same time.

You can do this by wrapping the related elements with a parent `Transition` component, and wrapping each child that needs its own transition styles with a `TransitionChild` component, which will automatically communicate with the parent `Transition` and inherit the parent's `show` state.

```vue
<template>
  <TransitionRoot :show="open">
    <!-- Background overlay -->
    <TransitionChild
      enter="transition-opacity ease-linear duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-linear duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <!-- ... -->
    </TransitionChild>

    <!-- Sliding sidebar -->
    <TransitionChild
      enter="transition ease-in-out duration-300 transform"
      enterFrom="-translate-x-full"
      enterTo="translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="translate-x-0"
      leaveTo="-translate-x-full"
    >
      <!-- ... -->
    </TransitionChild>
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition, TransitionChild } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition, TransitionChild },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

The `TransitionChild` component has the exact same API as the `Transition` component, but with no `show` prop, since the `show` value is controlled by the parent.

Parent `Transition` components will always automatically wait for all children to finish transitioning before unmounting, so you don't need to manage any of that timing yourself.

### Transitioning on initial mount

If you want an element to transition the very first time it's rendered, set the `appear` prop to `true`.

This is useful if you want something to transition in on initial page load, or when its parent is conditionally rendered.

```vue
<template>
  <TransitionRoot
    :show="open"
    enter="transition-opacity duration-75"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-150"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    <!-- Your content goes here -->
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

### Component API

#### Transition

```vue
<template>
  <TransitionRoot
    :show="open"
    :appear="true"
    enter="transition-opacity duration-75"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-150"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    <!-- Your content goes here -->
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

##### Props

| Prop        | Type                | Default | Description                                                                           |
| :---------- | :------------------ | :------ | :------------------------------------------------------------------------------------ |
| `show`      | Boolean             | -       | Whether the children should be shown or hidden.                                       |
| `as`        | String \| Component | `div`   | The element or component to render in place of the `Transition` itself.               |
| `appear`    | Boolean             | `false` | Whether the transition should run on initial mount.                                   |
| `unmount`   | Boolean             | `true`  | Whether the element should be `unmounted` or `hidden` based on the show state.        |
| `enter`     | String              | `''`    | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom` | String              | `''`    | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`   | String              | `''`    | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`     | String              | `''`    | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom` | String              | `''`    | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`   | String              | `''`    | Classes to add to the transitioning element immediately after the leave phase starts. |

##### Events

| Event         | Description                                                      |
| :------------ | :--------------------------------------------------------------- |
| `beforeEnter` | Callback which is called before we start the enter transition.   |
| `afterEnter`  | Callback which is called after we finished the enter transition. |
| `beforeLeave` | Callback which is called before we start the leave transition.   |
| `afterLeave`  | Callback which is called after we finished the leave transition. |

##### Render prop object

- None

#### TransitionChild

```vue
<template>
  <TransitionRoot :show="open">
    <TransitionChild
      enter="transition-opacity ease-linear duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-linear duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <!-- Your content goes here -->
    </TransitionChild>
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Transition, TransitionChild } from '@headlessui/vue'

export default {
  components: { TranitionRoot: Transition, TransitionChild },
  setup() {
    let open = ref(false)
    return { open }
  },
}
</script>
```

##### Props

| Prop        | Type                | Default | Description                                                                           |
| :---------- | :------------------ | :------ | :------------------------------------------------------------------------------------ |
| `as`        | String \| Component | `div`   | The element or component to render in place of the `TransitionChild` itself.          |
| `appear`    | Boolean             | `false` | Whether the transition should run on initial mount.                                   |
| `unmount`   | Boolean             | `true`  | Whether the element should be `unmounted` or `hidden` based on the show state.        |
| `enter`     | String              | `''`    | Classes to add to the transitioning element during the entire enter phase.            |
| `enterFrom` | String              | `''`    | Classes to add to the transitioning element before the enter phase starts.            |
| `enterTo`   | String              | `''`    | Classes to add to the transitioning element immediately after the enter phase starts. |
| `leave`     | String              | `''`    | Classes to add to the transitioning element during the entire leave phase.            |
| `leaveFrom` | String              | `''`    | Classes to add to the transitioning element before the leave phase starts.            |
| `leaveTo`   | String              | `''`    | Classes to add to the transitioning element immediately after the leave phase starts. |

##### Events

| Event         | Description                                                      |
| :------------ | :--------------------------------------------------------------- |
| `beforeEnter` | Callback which is called before we start the enter transition.   |
| `afterEnter`  | Callback which is called after we finished the enter transition. |
| `beforeLeave` | Callback which is called before we start the leave transition.   |
| `afterLeave`  | Callback which is called after we finished the leave transition. |

##### Render prop object

- None
