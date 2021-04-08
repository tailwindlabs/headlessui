## Switch (Toggle)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-switch-example-y40i1?file=/src/App.js)

The `Switch` component and related child components are used to quickly build custom switch/toggle components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard support.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Using a custom label](#using-a-custom-label)
- [Component API](#component-api)

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

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
      className={`${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex items-center h-6 rounded-full w-11`}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full`}
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
        className={`${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex items-center h-6 rounded-full w-11`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full`}
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

| Prop       | Type                     | Default  | Description                                             |
| :--------- | :----------------------- | :------- | :------------------------------------------------------ |
| `as`       | String \| Component      | `button` | The element or component the `Switch` should render as. |
| `checked`  | Boolean                  | -        | Whether or not the switch is checked.                   |
| `onChange` | `(value: boolean): void` | -        | The function to call when the switch is toggled.        |

##### Render prop object

| Prop      | Type    | Description                           |
| :-------- | :------ | :------------------------------------ |
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

| Prop        | Type                | Default | Description                                                       |
| :---------- | :------------------ | :------ | :---------------------------------------------------------------- |
| `as`        | String \| Component | `label` | The element or component the `Switch.Label` should render as.     |
| `clickable` | Boolean             | `false` | Wether or not to toggle the `Switch` when you click on the label. |

#### Switch.Description

```jsx
<Switch.Group>
  <Switch.Description>Enable notifications</Switch.Description>
  <Switch checked={enabled} onChange={setEnabled} className="...">
    {/* ... */}
  </Switch>
</Switch.Group>
```

##### Props

| Prop | Type                | Default | Description                                                         |
| :--- | :------------------ | :------ | :------------------------------------------------------------------ |
| `as` | String \| Component | `label` | The element or component the `Switch.Description` should render as. |

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

| Prop | Type                | Default                                 | Description                                                   |
| :--- | :------------------ | :-------------------------------------- | :------------------------------------------------------------ |
| `as` | String \| Component | `React.Fragment` _(no wrapper element)_ | The element or component the `Switch.Group` should render as. |
