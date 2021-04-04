## Popover

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

This component can be used for navigation menu's, mobile menu's and flyout menu's.

### Installation

```sh
# npm
npm install @headlessui/vue

# Yarn
yarn add @headlessui/vue
```

### Basic example

```jsx
<PopoverGroup>
  <Popover>
    <PopoverButton>Solutions</PopoverButton>
    <PopoverPanel>
      <a href="#">Analytics</a>
      <a href="#">Engagement</a>
      <a href="#">Security</a>
      <a href="#">Integrations</a>
      <a href="#">Automations</a>
    </PopoverPanel>
  </Popover>

  <a href="#">Pricing</a>
  <a href="#">Docs</a>

  <Popover>
    <PopoverButton>More</PopoverButton>
    <PopoverPanel focus>
      <a href="#">Help Center</a>
      <a href="#">Guides</a>
      <a href="#">Events</a>
      <a href="#">Security</a>
    </PopoverPanel>
  </Popover>
</PopoverGroup>
```

### Component API

#### Popover

```jsx
<PopoverGroup>
  <Popover>
    <PopoverButton>Solutions</PopoverButton>
    <PopoverPanel>
      <a href="#">Analytics</a>
      <a href="#">Engagement</a>
      <a href="#">Security</a>
      <a href="#">Integrations</a>
      <a href="#">Automations</a>
    </PopoverPanel>
  </Popover>

  <a href="#">Pricing</a>
  <a href="#">Docs</a>

  <Popover>
    <PopoverButton>More</PopoverButton>
    <PopoverPanel focus>
      <a href="#">Help Center</a>
      <a href="#">Guides</a>
      <a href="#">Events</a>
      <a href="#">Security</a>
    </PopoverPanel>
  </Popover>
</PopoverGroup>
```

##### Props

| Prop | Type                | Default | Description                                              |
| :--- | :------------------ | :------ | :------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `Popover` should render as. |

##### Render prop object

| Prop   | Type    | Description                        |
| :----- | :------ | :--------------------------------- |
| `open` | Boolean | Whether or not the dialog is open. |

#### PopoverOverlay

This can be used to create an overlay for your Popover component. Clicking on the overlay will close the Popover

##### Props

| Prop | Type                | Default | Description                                                      |
| :--- | :------------------ | :------ | :--------------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `PopoverOverlay` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### PopoverButton

This is the trigger component to open a Popover You can also use this
`PopoverButton` component inside a `PopoverPanel`, if you do so, then it will
behave as a `close` button. We will also make sure to provide the correct
`aria-*` attributes onto the button.

##### Props

| Prop | Type                | Default  | Description                                                     |
| :--- | :------------------ | :------- | :-------------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `PopoverButton` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### PopoverPanel

This component contains the contents of your Popover

##### Props

| Prop      | Type                | Default | Description                                                                                                                                 |
| :-------- | :------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`      | String \| Component | `div`   | The element or component the `PopoverPanel` should render as.                                                                              |
| `focus`   | Boolean             | `false` | This will force focus inside the `PopoverPanel` when the `Popover` is open. It will also close the `Popover` if focus left this component. |
| `static`  | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state.                                                                 |
| `unmount` | Boolean             | `true`  | Whether the element should be unmounted or hidden based on the open/closed state.                                                           |

> **note**: `static` and `unmount` can not be used at the same time. You will get a TypeScript error if you try to do it.

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### PopoverGroup

This allows you to wrap multiple elements and Popover's inside a group.

- When you tab out of a `PopoverPanel`, it will focus the next `PopoverButton` in line.
- If focus left the `PopoverGroup` it will close all the `Popover`'s.

##### Props

| Prop | Type                | Default | Description                                                    |
| :--- | :------------------ | :------ | :------------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `PopoverGroup` should render as. |

##### Render prop object

- None
