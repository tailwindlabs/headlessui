## Portal

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

A component for rendering your contents within a Portal (at the end of `document.body`).

### Installation

```sh
# npm
npm install @headlessui/vue

# Yarn
yarn add @headlessui/vue
```

### Basic example

```jsx
<Portal>
  <p>This will be rendered inside a Portal, at the end of `document.body`</p>
</Portal>
```

### Component API

#### Portal

```jsx
<Portal>
  <p>This will be rendered inside a Portal, at the end of `document.body`</p>
</Portal>
```

##### Props

| Prop | Type                | Default                           | Description                                             |
| :--- | :------------------ | :-------------------------------- | :------------------------------------------------------ |
| `as` | String \| Component | `template` _(no wrapper element_) | The element or component the `Portal` should render as. |

##### Render prop object

- None
