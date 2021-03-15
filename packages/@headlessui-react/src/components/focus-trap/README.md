## FocusTrap

- [Installation](#installation)
- [Basic example](#basic-example)
- [Component API](#component-api)

A component for making sure that you can't Tab out of the contents of this
component.

Focus strategy:

- An `initialFocus` prop can be passed in, this is a `ref` object, which is a ref to the element that should receive initial focus.
- If an input element exists with an `autoFocus` prop, it will receive initial focus.
- If none of those exists, it will try and focus the first focusable element.
- If that doesn't exist, it will throw an error.

Once the `FocusTrap` will unmount, the focus will be restored to the element that was focused _before_ the `FocusTrap` was rendered.

> **NOTE:** This component will throw when there are no focusable elements.
> This is an accessibility feature. At least try to provide a close button or
> similar so that users don't get stuck.

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

### Basic example

```jsx
<FocusTrap>
  <form>
    <input type="email" name="Email" />
    <input type="password" name="password" />
    <button>Submit</button>
  </form>
</FocusTrap>
```

### Component API

#### FocusTrap

```jsx
<FocusTrap>
  <form>
    <input type="email" name="Email" />
    <input type="password" name="password" />
    <button>Submit</button>
  </form>
</FocusTrap>
```

##### Props

| Prop           | Type                   | Default     | Description                                                |
| :------------- | :--------------------- | :---------- | :--------------------------------------------------------- |
| `as`           | String \| Component    | `div`       | The element or component the `FocusTrap` should render as. |
| `initialFocus` | React.MutableRefObject | `undefined` | A ref to an element that should receive focus first.       |
