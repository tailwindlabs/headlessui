## RadioGroup

A component for grouping radio options.

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
import React, { useState } from 'react'
import { RadioGroup } from '@headlessui/react'

function Example() {
  let [deliveryMethod, setDeliveryMethod] = useState(undefined)

  return (
    <RadioGroup value={deliveryMethod} onChange={setDeliveryMethod}>
      <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
      <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
      <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
      <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
    </RadioGroup>
  )
}
```

### Component API

#### RadioGroup

```jsx
let [deliveryMethod, setDeliveryMethod] = useState(undefined)

<RadioGroup value={deliveryMethod} onChange={setDeliveryMethod}>
  <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
  <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
  <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
</RadioGroup>
```

##### Props

| Prop       | Type                | Default     | Description                                                 |
| :--------- | :------------------ | :---------- | :---------------------------------------------------------- |
| `as`       | String \| Component | `div`       | The element or component the `RadioGroup` should render as. |
| `value`    | `T` \| undefined    | `undefined` | The current selected value in the `RadioGroup`.             |
| `onChange` | Function            | `undefined` | The function called to update the `RadioGroup` value.       |

##### Render prop object

- None

#### RadioGroup.Option

```jsx
let [deliveryMethod, setDeliveryMethod] = useState(undefined)

<RadioGroup value={deliveryMethod} onChange={setDeliveryMethod}>
  <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
  <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
  <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
</RadioGroup>
```

##### Props

| Prop    | Type                | Default     | Description                                                                                                                |
| :------ | :------------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------- |
| `as`    | String \| Component | `div`       | The element or component the `RadioGroup` should render as.                                                                |
| `value` | `T` \| undefined    | `undefined` | The value of the current `RadioGroup.Option`. The type should match the type of the `value` in the `RadioGroup` component. |

##### Render prop object

| Prop      | Type    | Description                                                        |
| :-------- | :------ | :----------------------------------------------------------------- |
| `active`  | Boolean | Whether or not the option is active (using the mouse or keyboard). |
| `checked` | Boolean | Whether or not the current option is the checked value.            |
