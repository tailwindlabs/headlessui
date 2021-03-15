## Disclosure

A component for showing/hiding content.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

### Basic example

```jsx
<Disclosure>
  <Disclosure.Button>Toggle</Disclosure.Button>
  <Disclosure.Panel>Contents</Disclosure.Panel>
</Disclosure>
```

### Component API

#### Disclosure

```jsx
<Disclosure>
  <Disclosure.Button>Toggle</Disclosure.Button>
  <Disclosure.Panel>Contents</Disclosure.Panel>
</Disclosure>
```

##### Props

| Prop | Type                | Default                                 | Description                                                 |
| :--- | :------------------ | :-------------------------------------- | :---------------------------------------------------------- |
| `as` | String \| Component | `React.Fragment` _(no wrapper element_) | The element or component the `Disclosure` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### Disclosure.Button

##### Props

| Prop | Type                | Default  | Description                                                        |
| :--- | :------------------ | :------- | :----------------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `Disclosure.Button` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### Disclosure.Panel

##### Props

| Prop      | Type                | Default | Description                                                                       |
| :-------- | :------------------ | :------ | :-------------------------------------------------------------------------------- |
| `as`      | String \| Component | `div`   | The element or component the `Disclosure.Panel` should render as.                 |
| `static`  | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state.       |
| `unmount` | Boolean             | `true`  | Whether the element should be unmounted or hidden based on the open/closed state. |

> **note**: `static` and `unmount` can not be used at the same time. You will get a TypeScript error if you try to do it.

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |
