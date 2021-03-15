## Listbox (Select)

[View live demo on CodeSandbox](https://codesandbox.io/s/headlessuireact-listbox-example-57eoj?file=/src/App.js)

The `Listbox` component and related child components are used to quickly build custom listbox components that are fully accessible out of the box, including correct ARIA attribute management and robust keyboard navigation support.

- [Installation](#installation)
- [Basic example](#basic-example)
- [Styling the active and selected option](#styling-the-active-and-selected-option)
- [Showing/hiding the listbox](#showinghiding-the-listbox)
- [Using a custom label](#using-a-custom-label)
- [Disabling an option](#disabling-an-option)
- [Transitions](#transitions)
- [Rendering additional content](#rendering-additional-content)
- [Rendering a different element for a component](#rendering-a-different-element-for-a-component)
- [Component API](#component-api)

### Installation

```sh
# npm
npm install @headlessui/react

# Yarn
yarn add @headlessui/react
```

### Basic example

Listboxes are built using the `Listbox`, `Listbox.Button`, `Listbox.Options`, `Listbox.Option` and `Listbox.Label` components.

The `Listbox.Button` will automatically open/close the `Listbox.Options` when clicked, and when the menu is open, the list of items receives focus and is automatically navigable via the keyboard.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Styling the active and selected option

This is a headless component so there are no styles included by default. Instead, the components expose useful information via [render props](https://reactjs.org/docs/render-props.html) that you can use to apply the styles you'd like to apply yourself.

To style the active `Listbox.Option` you can read the `active` render prop argument, which tells you whether or not that listbox option is the option that is currently focused via the mouse or keyboard.

To style the selected `Listbox.Option` you can read the `selected` render prop argument, which tells you whether or not that listbox option is the option that is currently the `value` passed to the `Listbox`.

> Note: An option can be both **active** and **selected** at the same time!

You can use this state to conditionally apply whatever active/focus styles you like, for instance a blue background like is typical in most operating systems. For the selected state, a checkmark is also common.

```jsx
import { useState, Fragment } from 'react'
import { Listbox } from '@headlessui/react'
import CheckmarkIcon from './CheckmarkIcon'

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          /* Use the `active` state to conditionally style the active option. */
          /* Use the `selected` state to conditionally style the selected option. */
          <Listbox.Option as={Fragment} key={person.id} value={person}>
            {({ active, selected }) => (
              <li className={`${active ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                {selected && <CheckmarkIcon />}
                {person.name}
              </li>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Using a custom label

By default the `Listbox` will use the button contents as the label for screenreaders. However you can also render a custom `Listbox.Label`.

```jsx
import { useState, Fragment } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Label>Assignee:</Listbox.Label>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option as={Fragment} key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Showing/hiding the listbox

By default, your `Listbox.Options` instance will be shown/hidden automatically based on the internal `open` state tracked within the `Listbox` component itself.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>

      {/* By default, this will automatically show/hide when the Listbox.Button is pressed. */}
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

If you'd rather handle this yourself (perhaps because you need to add an extra wrapper element for one reason or another), you can add a `static` prop to the `Listbox.Options` instance to tell it to always render, and inspect the `open` slot prop provided by the `Listbox` to control which element is shown/hidden yourself.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      {({ open }) => (
        <>
          <Listbox.Button>{selectedPerson.name}</Listbox.Button>
          {open && (
            <div>
              {/* Using `static`, `Listbox.Options` is always rendered and ignores the `open` state. */}
              <Listbox.Options static>
                {people.map(person => (
                  <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
                    {person.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          )}
        </>
      )}
    </Listbox>
  )
}
```

### Disabling an option

Use the `disabled` prop to disable a `Listbox.Option`. This will make it unselectable via keyboard navigation, and it will be skipped when pressing the up/down arrows.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          /* Disabled options will be skipped by keyboard navigation. */
          <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
            <span className={person.unavailable ? 'opacity-75' : ''}>{person.name}</span>
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Transitions

To animate the opening/closing of the listbox panel, use the provided `Transition` component. All you need to do is mark your `Listbox.Options` as `static`, wrap it in a `<Transition>`, and the transition will be applied automatically.

```jsx
import { useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      {({ open }) => (
        <>
          <Listbox.Button>{selectedPerson.name}</Listbox.Button>
          {/* Use the Transition + open render prop argument to add transitions. */}
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Listbox.Options static>
              {people.map(person => (
                <Listbox.Option key={person.id} value={person} disabled={person.unavailable}>
                  {person.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  )
}
```

### Rendering a different element for a component

By default, the `Listbox` and its subcomponents each render a default element that is sensible for that component.

For example, `Listbox.Label` renders a `label` by default, `Listbox.Button` renders a `button` by default, `Listbox.Options` renders a `ul` and `Listbox.Option` renders a `li` by default. `Listbox` interestingly _does not render an extra element_, and instead renders its children directly by default.

This is easy to change using the `as` prop, which exists on every component.

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox as="div" value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options as="div">
        {people.map(person => (
          <Listbox.Option as="span" key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

To tell an element to render its children directly with no wrapper element, use `as={React.Fragment}`.

```jsx
import { useState, Fragment } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button as={Fragment}>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

### Component API

#### Listbox

```jsx
import { useState } from 'react'
import { Listbox } from '@headlessui/react'

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

function MyListbox() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])

  return (
    <Listbox value={selectedPerson} onChange={setSelectedPerson}>
      <Listbox.Button>{selectedPerson.name}</Listbox.Button>
      <Listbox.Options>
        {people.map(person => (
          <Listbox.Option key={person.id} value={person}>
            {person.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
```

##### Props

| Prop       | Type                | Default                                 | Description                                              |
| :--------- | :------------------ | :-------------------------------------- | :------------------------------------------------------- |
| `as`       | String \| Component | `React.Fragment` _(no wrapper element_) | The element or component the `Listbox` should render as. |
| `disabled` | Boolean             | `false`                                 | Enable/Disable the `Listbox` component.                  |
| `value`    | `T`                 | -                                       | The selected value.                                      |
| `onChange` | `(value: T): void`  | -                                       | The function to call when a new option is selected.      |

##### Render prop object

| Prop       | Type    | Description                             |
| :--------- | :------ | :-------------------------------------- |
| `open`     | Boolean | Whether or not the listbox is open.     |
| `disabled` | Boolean | Whether or not the listbox is disabled. |

#### Listbox.Button

```jsx
<Listbox.Button>
  {({ open }) => (
    <>
      <span>More options</span>
      <ChevronRightIcon className={`${open ? 'transform rotate-90' : ''}`} />
    </>
  )}
</Listbox.Button>
```

##### Props

| Prop | Type                | Default  | Description                                                     |
| :--- | :------------------ | :------- | :-------------------------------------------------------------- |
| `as` | String \| Component | `button` | The element or component the `Listbox.Button` should render as. |

##### Render prop object

| Prop       | Type    | Description                             |
| :--------- | :------ | :-------------------------------------- |
| `open`     | Boolean | Whether or not the listbox is open.     |
| `disabled` | Boolean | Whether or not the listbox is disabled. |

#### Listbox.Label

```jsx
<Listbox.Label>Enable notifications</Listbox.Label>
```

##### Props

| Prop | Type                | Default | Description                                                    |
| :--- | :------------------ | :------ | :------------------------------------------------------------- |
| `as` | String \| Component | `label` | The element or component the `Listbox.Label` should render as. |

##### Render prop object

| Prop       | Type    | Description                             |
| :--------- | :------ | :-------------------------------------- |
| `open`     | Boolean | Whether or not the listbox is open.     |
| `disabled` | Boolean | Whether or not the listbox is disabled. |

#### Listbox.Options

```jsx
<Listbox.Options>
  <Listbox.Option value="option-a">{/* ... */}></Listbox.Option>
  {/* ... */}>
</Listbox.Options>
```

##### Props

| Prop      | Type                | Default | Description                                                                       |
| :-------- | :------------------ | :------ | :-------------------------------------------------------------------------------- |
| `as`      | String \| Component | `ul`    | The element or component the `Listbox.Options` should render as.                  |
| `static`  | Boolean             | `false` | Whether the element should ignore the internally managed open/closed state.       |
| `unmount` | Boolean             | `true`  | Whether the element should be unmounted or hidden based on the open/closed state. |

> **note**: `static` and `unmount` can not be used at the same time. You will get a TypeScript error if you try to do it.

##### Render prop object

| Prop   | Type    | Description                         |
| :----- | :------ | :---------------------------------- |
| `open` | Boolean | Whether or not the listbox is open. |

#### Listbox.Option

```jsx
<Listbox.Option value="option-a">Option A</Listbox.Option>
```

##### Props

| Prop       | Type                | Default | Description                                                                             |
| :--------- | :------------------ | :------ | :-------------------------------------------------------------------------------------- |
| `as`       | String \| Component | `li`    | The element or component the `Listbox.Option` should render as.                         |
| `value`    | `T`                 | -       | The option value.                                                                       |
| `disabled` | Boolean             | `false` | Whether or not the option should be disabled for keyboard navigation and ARIA purposes. |

##### Render prop object

| Prop       | Type    | Description                                                                          |
| :--------- | :------ | :----------------------------------------------------------------------------------- |
| `active`   | Boolean | Whether or not the option is the active/focused option in the list.                  |
| `selected` | Boolean | Whether or not the option is the selected option in the list.                        |
| `disabled` | Boolean | Whether or not the option is the disabled for keyboard navigation and ARIA purposes. |
