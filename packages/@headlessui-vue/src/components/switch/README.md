## Switch (Toggle)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuivue-switch-example-8ycp6?file=/src/App.vue)

The `Switch` component and related child components are used to quickly build custom switch/toggle components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard support.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Using a custom label](#using-a-custom-label)
- [Component API](#component-api)

## Installation

Please note that **this library only supports Vue 3**.

```sh
# npm
npm install @headlessui/vue

# Yarn
yarn add @headlessui/vue
```

### Basic example

Switches are built using the `Switch` component. Optionally you can also use the `SwitchGroup`, `SwitchLabel` and `SwitchDescription` components.

```vue
<template>
  <Switch
    as="button"
    v-model="switchValue"
    class="relative inline-flex items-center h-6 rounded-full w-11"
    :class="switchValue ? 'bg-blue-600' : 'bg-gray-200'"
    v-slot="{ checked }"
  >
    <span
      class="inline-block w-4 h-4 transform bg-white rounded-full"
      :class="{ 'translate-x-6': checked, 'translate-x-1': !checked }"
    />
  </Switch>
</template>

<script>
import { ref } from 'vue'
import { SwitchGroup, Switch, SwitchLabel, SwitchDescription } from '@headlessui/vue'

export default {
  components: {
    SwitchGroup,
    Switch,
    SwitchLabel,
    SwitchDescription,
  },
  setup() {
    const switchValue = ref(false)

    return {
      switchValue,
    }
  },
}
</script>
```

### Using a custom label

By default the `Switch` will use the contents as the label for screenreaders. If you need more control, you can render a `SwitchLabel` outside of the `Switch`, as long as both the switch and label are within a parent `SwitchGroup`.

Clicking the label will toggle the switch state, like you'd expect from a native checkbox.

```vue
<template>
  <SwitchGroup as="div" class="flex items-center space-x-4">
    <SwitchLabel>Enable notifications</SwitchLabel>

    <Switch
      as="button"
      v-model="switchValue"
      class="relative inline-flex items-center h-6 rounded-full w-11"
      :class="switchValue ? 'bg-blue-600' : 'bg-gray-200'"
      v-slot="{ checked }"
    >
      <span
        class="inline-block w-4 h-4 transform bg-white rounded-full"
        :class="{ 'translate-x-6': checked, 'translate-x-1': !checked }"
      />
    </Switch>
  </SwitchGroup>
</template>

<script>
import { ref } from 'vue'
import { SwitchGroup, Switch, SwitchLabel } from '@headlessui/vue'

export default {
  components: {
    SwitchGroup,
    Switch,
    SwitchLabel,
  },
  setup() {
    const switchValue = ref(false)

    return {
      switchValue,
    }
  },
}
</script>
```

### Component API

#### Switch

```html
<Switch v-model="switchState">
  <span class="sr-only">Enable notifications</span>
  <!-- ... -->
</Switch>
```

##### Props

| Prop      | Type                | Default  | Description                                             |
| :-------- | :------------------ | :------- | :------------------------------------------------------ |
| `as`      | String \| Component | `button` | The element or component the `Switch` should render as. |
| `v-model` | `T`                 | -        | The switch value.                                       |

##### Slot props

| Prop      | Type    | Description                           |
| :-------- | :------ | :------------------------------------ |
| `checked` | Boolean | Whether or not the switch is checked. |

#### SwitchLabel

```html
<SwitchGroup>
  <SwitchLabel>Enable notifications</SwitchLabel>
  <Switch v-model="switchState">
    <!-- ... -->
  </Switch>
</SwitchGroup>
```

##### Props

| Prop      | Type                | Default | Description                                                                         |
| :-------- | :------------------ | :------ | :---------------------------------------------------------------------------------- |
| `as`      | String \| Component | `label` | The element or component the `SwitchLabel` should render as.                        |
| `passive` | Boolean             | `false` | When `passive` is `false`, clicking the `SwitchLabel` will not toggle the `Switch`. |

#### SwitchDescription

```html
<SwitchGroup>
  <SwitchDescription>Enable notifications</SwitchDescription>
  <Switch v-model="switchState">
    <!-- ... -->
  </Switch>
</SwitchGroup>
```

##### Props

| Prop | Type                | Default | Description                                                        |
| :--- | :------------------ | :------ | :----------------------------------------------------------------- |
| `as` | String \| Component | `p`     | The element or component the `SwitchDescription` should render as. |

#### SwitchGroup

```html
<SwitchGroup>
  <SwitchLabel>Enable notifications</SwitchLabel>
  <Switch v-model="switchState">
    <!-- ... -->
  </Switch>
</SwitchGroup>
```

##### Props

| Prop | Type                | Default                           | Description                                                  |
| :--- | :------------------ | :-------------------------------- | :----------------------------------------------------------- |
| `as` | String \| Component | `template` _(no wrapper element)_ | The element or component the `SwitchGroup` should render as. |
