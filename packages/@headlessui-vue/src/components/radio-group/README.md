## RadioGroup

A component for grouping radio options.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

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
  <RadioGroup v-model="deliveryMethod">
    <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
    <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
    <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
    <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
  </RadioGroup>
</template>

<script>
import { ref } from 'vue'
import { RadioGroup } from '@headlessui/vue'

export default {
  components: { RadioGroup, RadioGroupLabel, RadioGroupOption },
  setup() {
    let deliveryMethod = ref(undefined)
    return { deliveryMethod }
  },
}
</script>
```

### Component API

#### RadioGroup

```html
<RadioGroup v-model="deliveryMethod">
  <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
  <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
  <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
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

#### RadioGroupOption

```html
<RadioGroup v-model="deliveryMethod">
  <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
  <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
  <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
</RadioGroup>
```

##### Props

| Prop    | Type                | Default     | Description                                                                                                               |
| :------ | :------------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------ |
| `as`    | String \| Component | `div`       | The element or component the `RadioGroup` should render as.                                                               |
| `value` | `T` \| undefined    | `undefined` | The value of the current `RadioGroupOption`. The type should match the type of the `value` in the `RadioGroup` component. |

##### Render prop object

| Prop      | Type    | Description                                                        |
| :-------- | :------ | :----------------------------------------------------------------- |
| `active`  | Boolean | Whether or not the option is active (using the mouse or keyboard). |
| `checked` | Boolean | Whether or not the current option is the checked value.            |
