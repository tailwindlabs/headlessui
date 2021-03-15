## Alert

A component for announcing information to screenreader/assistive technology users.

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
<Alert>Notifications have been enabled</Alert>
```

### Component API

#### Alert

```jsx
<Alert>Notifications have been enabled</Alert>
```

##### Props

| Prop         | Type                    | Default  | Description                                                                     |
| :----------- | :---------------------- | :------- | :------------------------------------------------------------------------------ |
| `as`         | String \| Component     | `div`    | The element or component the `Alert` should render as.                          |
| `importance` | `polite` \| `assertive` | `polite` | The importance of the alert message when it is announced to screenreader users. |

| Importance  | Description                                                                                                                                                                    |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `polite`    | Indicates that updates to the region should be presented at the next graceful opportunity, such as at the end of speaking the current sentence or when the user pauses typing. |
| `assertive` | Indicates that updates to the region have the highest priority and should be presented the user immediately.                                                                   |

Source: https://www.w3.org/TR/wai-aria-1.2/#aria-live

##### Render prop object

- None
