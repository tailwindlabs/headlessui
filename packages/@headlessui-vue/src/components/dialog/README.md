## Dialog

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

This component can be used to render content inside a Dialog/Modal. This contains a ton of features:

1. Renders inside a `Portal`
2. Controlled component
3. Uses `FocusTrap` with its features (Focus first focusable element, `autoFocus` or `initialFocus` ref)
   > **NOTE:** This component will throw when there are no focusable elements.
   > This is an accessibility feature. At least try to provide a close button or
   > similar so that users don't get stuck.
4. Adds a scroll lock
5. Prevents content jumps by faking your scrollbar width
6. Marks other elements as `inert` (hides other elements from screen readers)
7. Closes on `escape`
8. Closes on click outside
9. Once the Dialog becomes hidden (e.g.: `md:hidden`) it will also trigger the `onClose`

### Installation

```sh
# npm
npm install @headlessui/vue

# Yarn
yarn add @headlessui/vue
```

### Basic example

```vue
<template>
  <Dialog :open="isOpen" :onClose="setIsOpen">
    <DialogOverlay />

    <DialogTitle>Deactivate account</DialogTitle>
    <DialogDescription>This will permanently deactivate your account</DialogDescription>

    <p>
      Are you sure you want to deactivate your account? All of your data will be permanently
      removed. This action cannot be undone.
    </p>

    <button @click="setIsOpen(false)">Deactivate</button>
    <button @click="setIsOpen(false)">Cancel</button>
  </Dialog>
</template>

<script>
import { ref } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from '@headlessui/vue'

export default {
  components: { Dialog, DialogOverlay, DialogTitle, DialogDescription },
  setup() {
    let isOpen = ref(true)

    return {
      isOpen,
      setIsOpen(value) {
        isOpen.value = value
      },
    }
  },
}
</script>
```

### Component API

#### Dialog

```vue
<template>
  <Dialog :open="isOpen" :onClose="setIsOpen">
    <DialogOverlay />

    <DialogTitle>Deactivate account</DialogTitle>
    <DialogDescription>This will permanently deactivate your account</DialogDescription>

    <p>
      Are you sure you want to deactivate your account? All of your data will be permanently
      removed. This action cannot be undone.
    </p>

    <button @click="setIsOpen(false)">Deactivate</button>
    <button @click="setIsOpen(false)">Cancel</button>
  </Dialog>
</template>

<script>
import { ref } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from '@headlessui/vue'

export default {
  components: { Dialog, DialogOverlay, DialogTitle, DialogDescription },
  setup() {
    let isOpen = ref(true)

    return {
      isOpen,
      setIsOpen(value) {
        isOpen.value = value
      },
    }
  },
}
</script>
```

##### Props

| Prop           | Type                | Default | Description                                                                                                                       |
| :------------- | :------------------ | :------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | Boolean             | /       | Wether the `Dialog` is open or not.                                                                                               |
| `onClose`      | Function            | /       | Called when the `Dialog` should close. For convenience we pass in a `onClose(false)` so that you can use: `:onClose="setIsOpen"`. |
| `initialFocus` | HTMLElement         | /       | A ref to an element that should receive focus first.                                                                              |
| `as`           | String \| Component | `div`   | The element or component the `Dialog` should render as.                                                                           |
| `static`       | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state.                                                       |
| `unmount`      | Boolean             | `true`  | Whether the element should be unmounted or hidden based on the open/closed state.                                                 |

> **note**: `static` and `unmount` can not be used at the same time. You will get a TypeScript error if you try to do it.

##### Render prop object

| Prop   | Type    | Description                        |
| :----- | :------ | :--------------------------------- |
| `open` | Boolean | Whether or not the dialog is open. |

#### DialogOverlay

This can be used to create an overlay for your Dialog component. Clicking on the overlay will close the Dialog.

##### Props

| Prop | Type                | Default | Description                                                    |
| :--- | :------------------ | :------ | :------------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `DialogOverlay` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the dialog is open. |

#### DialogTitle

This is the title for your Dialog. When this is used, it will set the `aria-labelledby` on the Dialog.

##### Props

| Prop | Type                | Default | Description                                                  |
| :--- | :------------------ | :------ | :----------------------------------------------------------- |
| `as` | String \| Component | `h2`    | The element or component the `DialogTitle` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the dialog is open. |

#### DialogDescription

This is the description for your Dialog. When this is used, it will set the `aria-describedby` on the Dialog.

##### Props

| Prop | Type                | Default | Description                                                        |
| :--- | :------------------ | :------ | :----------------------------------------------------------------- |
| `as` | String \| Component | `p`     | The element or component the `DialogDescription` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the dialog is open. |
