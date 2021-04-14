## Popover

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

This component can be used for navigation menu's, mobile menu's and flyout menu's.

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

### Basic example

```jsx
<Popover.Group>
  <Popover>
    <Popover.Button>Solutions</Popover.Button>
    <Popover.Panel>
      <a href="#">Analytics</a>
      <a href="#">Engagement</a>
      <a href="#">Security</a>
      <a href="#">Integrations</a>
      <a href="#">Automations</a>
    </Popover.Panel>
  </Popover>

  <a href="#">Pricing</a>
  <a href="#">Docs</a>

  <Popover>
    <Popover.Button>More</Popover.Button>
    <Popover.Panel focus>
      <a href="#">Help Center</a>
      <a href="#">Guides</a>
      <a href="#">Events</a>
      <a href="#">Security</a>
    </Popover.Panel>
  </Popover>
</Popover.Group>
```

### Component API

#### Popover

```jsx
<Popover.Group>
  <Popover>
    <Popover.Button>Solutions</Popover.Button>
    <Popover.Panel>
      <a href="#">Analytics</a>
      <a href="#">Engagement</a>
      <a href="#">Security</a>
      <a href="#">Integrations</a>
      <a href="#">Automations</a>
    </Popover.Panel>
  </Popover>

  <a href="#">Pricing</a>
  <a href="#">Docs</a>

  <Popover>
    <Popover.Button>More</Popover.Button>
    <Popover.Panel focus>
      <a href="#">Help Center</a>
      <a href="#">Guides</a>
      <a href="#">Events</a>
      <a href="#">Security</a>
    </Popover.Panel>
  </Popover>
</Popover.Group>
```

##### Props

| Prop | Type                | Default | Description                                              |
| :--- | :------------------ | :------ | :------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `Popover` should render as. |

##### Render prop object

| Prop   | Type    | Description                        |
| :----- | :------ | :--------------------------------- |
| `open` | Boolean | Whether or not the dialog is open. |

#### Popover.Overlay

This can be used to create an overlay for your Popover component. Clicking on the overlay will close the Popover.

##### Props

| Prop | Type                | Default | Description                                                      |
| :--- | :------------------ | :------ | :--------------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `Popover.Overlay` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### Popover.Button

This is the trigger component to open a Popover. You can also use this
`Popover.Button` component inside a `Popover.Panel`, if you do so, then it will
behave as a `close` button. We will also make sure to provide the correct
`aria-*` attributes onto the button.

##### Props

| Prop | Type                | Default  | Description                                                     |
| :--- | :------------------ | :------- | :-------------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `Popover.Button` should render as. |

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### Popover.Panel

This component contains the contents of your Popover.

##### Props

| Prop      | Type                | Default | Description                                                                                                                                 |
| :-------- | :------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`      | String \| Component | `div`   | The element or component the `Popover.Panel` should render as.                                                                              |
| `focus`   | Boolean             | `false` | This will force focus inside the `Popover.Panel` when the `Popover` is open. It will also close the `Popover` if focus left this component. |
| `static`  | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state.                                                                 |
| `unmount` | Boolean             | `true`  | Whether the element should be unmounted or hidden based on the open/closed state.                                                           |

> **note**: `static` and `unmount` can not be used at the same time. You will get a TypeScript error if you try to do it.

##### Render prop object

| Prop   | Type    | Description                            |
| :----- | :------ | :------------------------------------- |
| `open` | Boolean | Whether or not the disclosure is open. |

#### Popover.Group

This allows you to wrap multiple elements and Popover's inside a group.

- When you tab out of a `Popover.Panel`, it will focus the next `Popover.Button` in line.
- If focus left the `Popover.Group` it will close all the `Popover`'s.

##### Props

| Prop | Type                | Default | Description                                                    |
| :--- | :------------------ | :------ | :------------------------------------------------------------- |
| `as` | String \| Component | `div`   | The element or component the `Popover.Group` should render as. |

##### Render prop object

- None
