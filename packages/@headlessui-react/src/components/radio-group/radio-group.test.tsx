import { render } from '@testing-library/react'
import React, { createElement, useState } from 'react'
import {
  assertActiveElement,
  assertFocusable,
  assertNotFocusable,
  assertRadioGroupLabel,
  getByText,
  getRadioGroupOptions,
} from '../../test-utils/accessibility-assertions'
import { Keys, click, focus, press, shift } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { RadioGroup } from './radio-group'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

describe('Safe guards', () => {
  it.each([['RadioGroup.Option', RadioGroup.Option]])(
    'should error when we are using a <%s /> without a parent <RadioGroup />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrow(
        `<${name} /> is missing a parent <RadioGroup /> component.`
      )
    })
  )

  it(
    'should be possible to render a RadioGroup without crashing',
    suppressConsoleLogs(async () => {
      render(
        <RadioGroup value={undefined} onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      assertRadioGroupLabel({ textContent: 'Pizza Delivery' })
    })
  )

  it('should be possible to render a RadioGroup without options and without crashing', () => {
    render(<RadioGroup value={undefined} onChange={console.log} />)
  })
})

describe('Rendering', () => {
  it(
    'should be possible to render a RadioGroup, where the first element is tabbable (value is undefined)',
    suppressConsoleLogs(async () => {
      render(
        <RadioGroup value={undefined} onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      expect(getRadioGroupOptions()).toHaveLength(3)

      assertFocusable(getByText('Pickup'))
      assertNotFocusable(getByText('Home delivery'))
      assertNotFocusable(getByText('Dine in'))
    })
  )

  it(
    'should be possible to render a RadioGroup, where the first element is tabbable (value is null)',
    suppressConsoleLogs(async () => {
      render(
        <RadioGroup value={null} onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      expect(getRadioGroupOptions()).toHaveLength(3)

      assertFocusable(getByText('Pickup'))
      assertNotFocusable(getByText('Home delivery'))
      assertNotFocusable(getByText('Dine in'))
    })
  )

  it(
    'should be possible to render a RadioGroup with an active value',
    suppressConsoleLogs(async () => {
      render(
        <RadioGroup value="home-delivery" onChange={console.log}>
          <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
          <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
          <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
          <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
        </RadioGroup>
      )

      expect(getRadioGroupOptions()).toHaveLength(3)

      assertNotFocusable(getByText('Pickup'))
      assertFocusable(getByText('Home delivery'))
      assertNotFocusable(getByText('Dine in'))
    })
  )

  it(
    'should guarantee the radio option order after a few unmounts',
    suppressConsoleLogs(async () => {
      function Example() {
        let [showFirst, setShowFirst] = useState(false)
        let [active, setActive] = useState()

        return (
          <>
            <button onClick={() => setShowFirst((v) => !v)}>Toggle</button>
            <RadioGroup value={active} onChange={setActive}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              {showFirst && <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>}
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
          </>
        )
      }

      render(<Example />)

      await click(getByText('Toggle')) // Render the pickup again

      await press(Keys.Tab) // Focus first element
      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowUp) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowUp) // Up again
      assertActiveElement(getByText('Home delivery'))
    })
  )

  it(
    'should be possible to disable a RadioGroup',
    suppressConsoleLogs(async () => {
      let changeFn = jest.fn()

      function Example() {
        let [disabled, setDisabled] = useState(true)
        return (
          <>
            <button onClick={() => setDisabled((v) => !v)}>Toggle</button>
            <RadioGroup value={undefined} onChange={changeFn} disabled={disabled}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
              <RadioGroup.Option value="render-prop" data-value="render-prop">
                {(slot) => <>{JSON.stringify(slot)}</>}
              </RadioGroup.Option>
            </RadioGroup>
          </>
        )
      }

      render(<Example />)

      // Try to click one a few options
      await click(getByText('Pickup'))
      await click(getByText('Dine in'))

      // Verify that the RadioGroup.Option gets the disabled state
      expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
        JSON.stringify({
          checked: false,
          disabled: true,
          active: false,
          hover: false,
          focus: false,
          autofocus: false,
        })
      )

      // Make sure that the onChange handler never got called
      expect(changeFn).toHaveBeenCalledTimes(0)

      // Make sure that all the options get an `aria-disabled`
      let options = getRadioGroupOptions()
      expect(options).toHaveLength(4)
      for (let option of options) expect(option).toHaveAttribute('aria-disabled', 'true')

      // Toggle the disabled state
      await click(getByText('Toggle'))

      // Verify that the RadioGroup.Option gets the disabled state
      expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
        JSON.stringify({
          checked: false,
          disabled: false,
          active: false,
          hover: false,
          focus: false,
          autofocus: false,
        })
      )

      // Try to click one a few options
      await click(getByText('Pickup'))

      // Make sure that the onChange handler got called
      expect(changeFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to disable a RadioGroup.Option',
    suppressConsoleLogs(async () => {
      let changeFn = jest.fn()

      function Example() {
        let [disabled, setDisabled] = useState(true)
        return (
          <>
            <button onClick={() => setDisabled((v) => !v)}>Toggle</button>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
              <RadioGroup.Option value="render-prop" disabled={disabled} data-value="render-prop">
                {(slot) => <>{JSON.stringify(slot)}</>}
              </RadioGroup.Option>
            </RadioGroup>
          </>
        )
      }

      render(<Example />)

      // Try to click the disabled option
      await click(document.querySelector('[data-value="render-prop"]'))

      // Verify that the RadioGroup.Option gets the disabled state
      expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
        JSON.stringify({
          checked: false,
          disabled: true,
          active: false,
          hover: false,
          focus: false,
          autofocus: false,
        })
      )

      // Make sure that the onChange handler never got called
      expect(changeFn).toHaveBeenCalledTimes(0)

      // Make sure that the option with value "render-prop" gets an `aria-disabled`
      let options = getRadioGroupOptions()
      expect(options).toHaveLength(4)
      for (let option of options) {
        if (option.dataset.value) {
          expect(option).toHaveAttribute('aria-disabled', 'true')
        } else {
          expect(option).not.toHaveAttribute('aria-disabled')
        }
      }

      // Toggle the disabled state
      await click(getByText('Toggle'))

      // Verify that the RadioGroup.Option gets the disabled state
      expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
        JSON.stringify({
          checked: false,
          disabled: false,
          active: false,
          hover: false,
          focus: false,
          autofocus: false,
        })
      )

      // Try to click one a few options
      await click(document.querySelector('[data-value="render-prop"]'))

      // Make sure that the onChange handler got called
      expect(changeFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should guarantee the order of DOM nodes when performing actions',
    suppressConsoleLogs(async () => {
      function Example({ hide = false }) {
        return (
          <RadioGroup value={undefined} onChange={() => {}}>
            <RadioGroup.Option value="a">Option 1</RadioGroup.Option>
            {!hide && <RadioGroup.Option value="b">Option 2</RadioGroup.Option>}
            <RadioGroup.Option value="c">Option 3</RadioGroup.Option>
          </RadioGroup>
        )
      }

      let { rerender } = render(<Example />)

      // Focus the RadioGroup
      await press(Keys.Tab)

      rerender(<Example hide={true} />) // Remove RadioGroup.Option 2
      rerender(<Example hide={false} />) // Re-add RadioGroup.Option 2

      // Verify that the first radio group option is active
      assertActiveElement(getByText('Option 1'))

      await press(Keys.ArrowDown)
      // Verify that the second radio group option is active
      assertActiveElement(getByText('Option 2'))

      await press(Keys.ArrowDown)
      // Verify that the third radio group option is active
      assertActiveElement(getByText('Option 3'))
    })
  )

  it(
    'should expose internal data as a render prop',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState(null)

        return (
          <RadioGroup value={value} onChange={setValue}>
            <RadioGroup.Option value="a">Option 1</RadioGroup.Option>
            <RadioGroup.Option value="b">Option 2</RadioGroup.Option>
            <RadioGroup.Option value="c">Option 3</RadioGroup.Option>
          </RadioGroup>
        )
      }

      render(<Example />)

      let options = getRadioGroupOptions()

      // Nothing is active yet
      expect(options[0]).toHaveAttribute('data-headlessui-state', '')
      expect(options[1]).toHaveAttribute('data-headlessui-state', '')
      expect(options[2]).toHaveAttribute('data-headlessui-state', '')

      // Focus the RadioGroup
      await press(Keys.Tab)

      // The first one should be active, but not checked yet
      expect(options[0]).toHaveAttribute('data-headlessui-state', 'active focus')
      expect(options[1]).toHaveAttribute('data-headlessui-state', '')
      expect(options[2]).toHaveAttribute('data-headlessui-state', '')

      // Select the first one
      await press(Keys.Space)

      // The first one should be active and checked
      expect(options[0]).toHaveAttribute('data-headlessui-state', 'checked active focus')
      expect(options[1]).toHaveAttribute('data-headlessui-state', '')
      expect(options[2]).toHaveAttribute('data-headlessui-state', '')

      // Go to the next option
      await press(Keys.ArrowDown)

      // The second one should be active and checked
      expect(options[0]).toHaveAttribute('data-headlessui-state', '')
      expect(options[1]).toHaveAttribute('data-headlessui-state', 'checked active focus')
      expect(options[2]).toHaveAttribute('data-headlessui-state', '')
    })
  )

  describe('Equality', () => {
    let options = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]

    it(
      'should use object equality by default',
      suppressConsoleLogs(async () => {
        render(
          <RadioGroup value={options[1]} onChange={console.log}>
            {options.map((option) => (
              <RadioGroup.Option
                key={option.id}
                value={option}
                className={(info) => JSON.stringify(info)}
              >
                {option.name}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )

        let bob = getRadioGroupOptions()[1]
        expect(bob).toHaveAttribute(
          'class',
          JSON.stringify({
            checked: true,
            disabled: false,
            active: false,
            hover: false,
            focus: false,
            autofocus: false,
          })
        )
      })
    )

    it(
      'should be possible to compare null values by a field',
      suppressConsoleLogs(async () => {
        render(
          <RadioGroup value={null} onChange={console.log} by="id">
            {options.map((option) => (
              <RadioGroup.Option
                key={option.id}
                value={option}
                className={(info) => JSON.stringify(info)}
              >
                {option.name}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )

        let [alice, bob, charlie] = getRadioGroupOptions()
        expect(alice).toHaveAttribute(
          'class',
          JSON.stringify({
            checked: false,
            disabled: false,
            active: false,
            hover: false,
            focus: false,
            autofocus: false,
          })
        )
        expect(bob).toHaveAttribute(
          'class',
          JSON.stringify({
            checked: false,
            disabled: false,
            active: false,
            hover: false,
            focus: false,
            autofocus: false,
          })
        )
        expect(charlie).toHaveAttribute(
          'class',
          JSON.stringify({
            checked: false,
            disabled: false,
            active: false,
            hover: false,
            focus: false,
            autofocus: false,
          })
        )
      })
    )

    it(
      'should be possible to compare objects by a field',
      suppressConsoleLogs(async () => {
        render(
          <RadioGroup value={{ id: 2, name: 'Bob' }} onChange={console.log} by="id">
            {options.map((option) => (
              <RadioGroup.Option
                key={option.id}
                value={option}
                className={(info) => JSON.stringify(info)}
              >
                {option.name}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )

        let bob = getRadioGroupOptions()[1]
        expect(bob).toHaveAttribute(
          'class',
          JSON.stringify({
            checked: true,
            disabled: false,
            active: false,
            hover: false,
            focus: false,
            autofocus: false,
          })
        )
      })
    )

    it(
      'should be possible to compare objects by a comparator function',
      suppressConsoleLogs(async () => {
        render(
          <RadioGroup
            value={{ id: 2, name: 'Bob' }}
            onChange={console.log}
            by={(a, z) => a.id === z.id}
          >
            {options.map((option) => (
              <RadioGroup.Option
                key={option.id}
                value={option}
                className={(info) => JSON.stringify(info)}
              >
                {option.name}
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        )

        let bob = getRadioGroupOptions()[1]
        expect(bob).toHaveAttribute(
          'class',
          JSON.stringify({
            checked: true,
            disabled: false,
            active: false,
            hover: false,
            focus: false,
            autofocus: false,
          })
        )
      })
    )
  })

  describe('Uncontrolled', () => {
    it(
      'should be possible to use in an uncontrolled way',
      suppressConsoleLogs(async () => {
        let handleSubmission = jest.fn()

        render(
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
            }}
          >
            <RadioGroup name="assignee">
              <RadioGroup.Option value="alice">Alice</RadioGroup.Option>
              <RadioGroup.Option value="bob">Bob</RadioGroup.Option>
              <RadioGroup.Option value="charlie">Charlie</RadioGroup.Option>
            </RadioGroup>
            <button id="submit">submit</button>
          </form>
        )

        await click(document.getElementById('submit'))

        // No values
        expect(handleSubmission).toHaveBeenLastCalledWith({})

        // Choose alice
        await click(getRadioGroupOptions()[0])

        // Submit
        await click(document.getElementById('submit'))

        // Alice should be submitted
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

        // Choose charlie
        await click(getRadioGroupOptions()[2])

        // Submit
        await click(document.getElementById('submit'))

        // Charlie should be submitted
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'charlie' })
      })
    )

    it(
      'should be possible to provide a default value',
      suppressConsoleLogs(async () => {
        let handleSubmission = jest.fn()

        render(
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
            }}
          >
            <RadioGroup name="assignee" defaultValue="bob">
              <RadioGroup.Option value="alice">Alice</RadioGroup.Option>
              <RadioGroup.Option value="bob">Bob</RadioGroup.Option>
              <RadioGroup.Option value="charlie">Charlie</RadioGroup.Option>
            </RadioGroup>
            <button id="submit">submit</button>
          </form>
        )

        await click(document.getElementById('submit'))

        // Bob is the defaultValue
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

        // Choose alice
        await click(getRadioGroupOptions()[0])

        // Submit
        await click(document.getElementById('submit'))

        // Alice should be submitted
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })
      })
    )

    it(
      'should be possible to reset to the default value if the form is reset',
      suppressConsoleLogs(async () => {
        let handleSubmission = jest.fn()

        render(
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
            }}
          >
            <RadioGroup name="assignee" defaultValue="bob">
              <RadioGroup.Option value="alice">Alice</RadioGroup.Option>
              <RadioGroup.Option value="bob">Bob</RadioGroup.Option>
              <RadioGroup.Option value="charlie">Charlie</RadioGroup.Option>
            </RadioGroup>
            <button id="submit">submit</button>
            <button type="reset" id="reset">
              reset
            </button>
          </form>
        )

        // Bob is the defaultValue
        await click(document.getElementById('submit'))
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

        // Choose alice
        await click(getRadioGroupOptions()[0])

        // Alice is now chosen
        await click(document.getElementById('submit'))
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

        // Reset
        await click(document.getElementById('reset'))

        // Bob should be submitted again
        await click(document.getElementById('submit'))
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })
      })
    )

    it(
      'should be possible to reset to the default value if the form is reset (using objects)',
      suppressConsoleLogs(async () => {
        let handleSubmission = jest.fn()

        let data = [
          { id: 1, name: 'alice', label: 'Alice' },
          { id: 2, name: 'bob', label: 'Bob' },
          { id: 3, name: 'charlie', label: 'Charlie' },
        ]

        render(
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
            }}
          >
            <RadioGroup name="assignee" defaultValue={{ id: 2, name: 'bob', label: 'Bob' }} by="id">
              {data.map((person) => (
                <RadioGroup.Option key={person.id} value={person}>
                  {person.label}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
            <button id="submit">submit</button>
            <button type="reset" id="reset">
              reset
            </button>
          </form>
        )

        await click(document.getElementById('submit'))

        // Bob is the defaultValue
        await click(document.getElementById('submit'))
        expect(handleSubmission).toHaveBeenLastCalledWith({
          'assignee[id]': '2',
          'assignee[name]': 'bob',
          'assignee[label]': 'Bob',
        })

        // Choose alice
        await click(getRadioGroupOptions()[0])

        // Alice is now chosen
        await click(document.getElementById('submit'))
        expect(handleSubmission).toHaveBeenLastCalledWith({
          'assignee[id]': '1',
          'assignee[name]': 'alice',
          'assignee[label]': 'Alice',
        })

        // Reset
        await click(document.getElementById('reset'))

        // Bob should be submitted again
        await click(document.getElementById('submit'))
        expect(handleSubmission).toHaveBeenLastCalledWith({
          'assignee[id]': '2',
          'assignee[name]': 'bob',
          'assignee[label]': 'Bob',
        })
      })
    )

    it(
      'should still call the onChange listeners when choosing new values',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()

        render(
          <RadioGroup name="assignee" onChange={handleChange}>
            <RadioGroup.Option value="alice">Alice</RadioGroup.Option>
            <RadioGroup.Option value="bob">Bob</RadioGroup.Option>
            <RadioGroup.Option value="charlie">Charlie</RadioGroup.Option>
          </RadioGroup>
        )

        // Choose alice
        await click(getRadioGroupOptions()[0])

        // Choose bob
        await click(getRadioGroupOptions()[1])

        // Change handler should have been called twice
        expect(handleChange).toHaveBeenNthCalledWith(1, 'alice')
        expect(handleChange).toHaveBeenNthCalledWith(2, 'bob')
      })
    )
  })
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it(
      'should be possible to tab to the first item',
      suppressConsoleLogs(async () => {
        render(
          <RadioGroup value={undefined} onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
        )

        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))
      })
    )

    it(
      'should not change the selected element on focus',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
        )

        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        expect(changeFn).toHaveBeenCalledTimes(0)
      })
    )

    it(
      'should be possible to tab to the active item',
      suppressConsoleLogs(async () => {
        render(
          <RadioGroup value="home-delivery" onChange={console.log}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
        )

        await press(Keys.Tab)

        assertActiveElement(getByText('Home delivery'))
      })
    )

    it(
      'should not change the selected element on focus (when selecting the active item)',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <RadioGroup value="home-delivery" onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
        )

        await press(Keys.Tab)

        assertActiveElement(getByText('Home delivery'))

        expect(changeFn).toHaveBeenCalledTimes(0)
      })
    )

    it(
      'should be possible to tab out of the radio group (no selected value)',
      suppressConsoleLogs(async () => {
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={console.log}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await press(Keys.Tab)
        assertActiveElement(getByText('Before'))

        await press(Keys.Tab)
        assertActiveElement(getByText('Pickup'))

        await press(Keys.Tab)
        assertActiveElement(getByText('After'))
      })
    )

    it(
      'should be possible to tab out of the radio group (selected value)',
      suppressConsoleLogs(async () => {
        render(
          <>
            <button>Before</button>
            <RadioGroup value="home-delivery" onChange={console.log}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await press(Keys.Tab)
        assertActiveElement(getByText('Before'))

        await press(Keys.Tab)
        assertActiveElement(getByText('Home delivery'))

        await press(Keys.Tab)
        assertActiveElement(getByText('After'))
      })
    )
  })

  describe('`Shift+Tab` key', () => {
    it(
      'should be possible to tab to the first item',
      suppressConsoleLogs(async () => {
        render(
          <>
            <RadioGroup value={undefined} onChange={console.log}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await focus(getByText('After'))

        await press(shift(Keys.Tab))

        assertActiveElement(getByText('Pickup'))
      })
    )

    it(
      'should not change the selected element on focus',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await focus(getByText('After'))

        await press(shift(Keys.Tab))

        assertActiveElement(getByText('Pickup'))

        expect(changeFn).toHaveBeenCalledTimes(0)
      })
    )

    it(
      'should be possible to tab to the active item',
      suppressConsoleLogs(async () => {
        render(
          <>
            <RadioGroup value="home-delivery" onChange={console.log}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await focus(getByText('After'))

        await press(shift(Keys.Tab))

        assertActiveElement(getByText('Home delivery'))
      })
    )

    it(
      'should not change the selected element on focus (when selecting the active item)',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <RadioGroup value="home-delivery" onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await focus(getByText('After'))

        await press(shift(Keys.Tab))

        assertActiveElement(getByText('Home delivery'))

        expect(changeFn).toHaveBeenCalledTimes(0)
      })
    )

    it(
      'should be possible to tab out of the radio group (no selected value)',
      suppressConsoleLogs(async () => {
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={console.log}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await focus(getByText('After'))

        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Pickup'))

        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Before'))
      })
    )

    it(
      'should be possible to tab out of the radio group (selected value)',
      suppressConsoleLogs(async () => {
        render(
          <>
            <button>Before</button>
            <RadioGroup value="home-delivery" onChange={console.log}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        await focus(getByText('After'))

        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Home delivery'))

        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Before'))
      })
    )
  })

  describe('`ArrowLeft` key', () => {
    it(
      'should go to the previous item when pressing the ArrowLeft key',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        // Focus the "Before" button
        await press(Keys.Tab)

        // Focus the RadioGroup
        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        await press(Keys.ArrowLeft) // Loop around
        assertActiveElement(getByText('Dine in'))

        await press(Keys.ArrowLeft)
        assertActiveElement(getByText('Home delivery'))

        expect(changeFn).toHaveBeenCalledTimes(2)
        expect(changeFn).toHaveBeenNthCalledWith(1, 'dine-in')
        expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should go to the previous item when pressing the ArrowUp key',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        // Focus the "Before" button
        await press(Keys.Tab)

        // Focus the RadioGroup
        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        await press(Keys.ArrowUp) // Loop around
        assertActiveElement(getByText('Dine in'))

        await press(Keys.ArrowUp)
        assertActiveElement(getByText('Home delivery'))

        expect(changeFn).toHaveBeenCalledTimes(2)
        expect(changeFn).toHaveBeenNthCalledWith(1, 'dine-in')
        expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
      })
    )
  })

  describe('`ArrowRight` key', () => {
    it(
      'should go to the next item when pressing the ArrowRight key',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        // Focus the "Before" button
        await press(Keys.Tab)

        // Focus the RadioGroup
        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        await press(Keys.ArrowRight)
        assertActiveElement(getByText('Home delivery'))

        await press(Keys.ArrowRight)
        assertActiveElement(getByText('Dine in'))

        await press(Keys.ArrowRight) // Loop around
        assertActiveElement(getByText('Pickup'))

        expect(changeFn).toHaveBeenCalledTimes(3)
        expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
        expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
        expect(changeFn).toHaveBeenNthCalledWith(3, 'pickup')
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should go to the next item when pressing the ArrowDown key',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        // Focus the "Before" button
        await press(Keys.Tab)

        // Focus the RadioGroup
        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        await press(Keys.ArrowDown)
        assertActiveElement(getByText('Home delivery'))

        await press(Keys.ArrowDown)
        assertActiveElement(getByText('Dine in'))

        await press(Keys.ArrowDown) // Loop around
        assertActiveElement(getByText('Pickup'))

        expect(changeFn).toHaveBeenCalledTimes(3)
        expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
        expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
        expect(changeFn).toHaveBeenNthCalledWith(3, 'pickup')
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should select the current option when pressing space',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        render(
          <>
            <button>Before</button>
            <RadioGroup value={undefined} onChange={changeFn}>
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )

        // Focus the "Before" button
        await press(Keys.Tab)

        // Focus the RadioGroup
        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        await press(Keys.Space)
        assertActiveElement(getByText('Pickup'))

        expect(changeFn).toHaveBeenCalledTimes(1)
        expect(changeFn).toHaveBeenNthCalledWith(1, 'pickup')
      })
    )

    it(
      'should select the current option only once when pressing space',
      suppressConsoleLogs(async () => {
        let changeFn = jest.fn()
        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <>
              <button>Before</button>
              <RadioGroup
                value={value}
                onChange={(v) => {
                  setValue(v)
                  changeFn(v)
                }}
              >
                <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
                <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
                <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
                <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
              </RadioGroup>
              <button>After</button>
            </>
          )
        }
        render(<Example />)

        // Focus the "Before" button
        await press(Keys.Tab)

        // Focus the RadioGroup
        await press(Keys.Tab)

        assertActiveElement(getByText('Pickup'))

        await press(Keys.Space)
        await press(Keys.Space)
        await press(Keys.Space)
        await press(Keys.Space)
        await press(Keys.Space)
        assertActiveElement(getByText('Pickup'))

        expect(changeFn).toHaveBeenCalledTimes(1)
        expect(changeFn).toHaveBeenNthCalledWith(1, 'pickup')
      })
    )
  })

  describe('`Enter`', () => {
    it(
      'should submit the form on `Enter`',
      suppressConsoleLogs(async () => {
        let submits = jest.fn()

        function Example() {
          let [value, setValue] = useState('bob')

          return (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                submits([...new FormData(event.currentTarget).entries()])
              }}
            >
              <RadioGroup value={value} onChange={setValue} name="option">
                <RadioGroup.Option value="alice">Alice</RadioGroup.Option>
                <RadioGroup.Option value="bob">Bob</RadioGroup.Option>
                <RadioGroup.Option value="charlie">Charlie</RadioGroup.Option>
              </RadioGroup>
              <button>Submit</button>
            </form>
          )
        }

        render(<Example />)

        // Focus the RadioGroup
        await press(Keys.Tab)

        // Press enter (which should submit the form)
        await press(Keys.Enter)

        // Verify the form was submitted
        expect(submits).toHaveBeenCalledTimes(1)
        expect(submits).toHaveBeenCalledWith([['option', 'bob']])
      })
    )

    it(
      'should submit the form on `Enter` (when no submit button was found)',
      suppressConsoleLogs(async () => {
        let submits = jest.fn()

        function Example() {
          let [value, setValue] = useState('bob')

          return (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                submits([...new FormData(event.currentTarget).entries()])
              }}
            >
              <RadioGroup value={value} onChange={setValue} name="option">
                <RadioGroup.Option value="alice">Alice</RadioGroup.Option>
                <RadioGroup.Option value="bob">Bob</RadioGroup.Option>
                <RadioGroup.Option value="charlie">Charlie</RadioGroup.Option>
              </RadioGroup>
            </form>
          )
        }

        render(<Example />)

        // Focus the RadioGroup
        await press(Keys.Tab)

        // Press enter (which should submit the form)
        await press(Keys.Enter)

        // Verify the form was submitted
        expect(submits).toHaveBeenCalledTimes(1)
        expect(submits).toHaveBeenCalledWith([['option', 'bob']])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to change the current radio group value when clicking on a radio option',
    suppressConsoleLogs(async () => {
      let changeFn = jest.fn()
      render(
        <>
          <button>Before</button>
          <RadioGroup value={undefined} onChange={changeFn}>
            <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
            <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
            <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
            <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
          </RadioGroup>
          <button>After</button>
        </>
      )

      await click(getByText('Home delivery'))

      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
    })
  )

  it(
    'should be a no-op when clicking on the same item',
    suppressConsoleLogs(async () => {
      let changeFn = jest.fn()
      function Example() {
        let [value, setValue] = useState(undefined)

        return (
          <>
            <button>Before</button>
            <RadioGroup
              value={value}
              onChange={(v) => {
                setValue(v)
                changeFn(v)
              }}
            >
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>After</button>
          </>
        )
      }
      render(<Example />)

      await click(getByText('Home delivery'))
      await click(getByText('Home delivery'))
      await click(getByText('Home delivery'))
      await click(getByText('Home delivery'))

      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(1)
    })
  )
})

describe('Form compatibility', () => {
  it(
    'should be possible to set the `form`, which is forwarded to the hidden inputs',
    suppressConsoleLogs(async () => {
      let submits = jest.fn()

      function Example() {
        let [value, setValue] = useState(null)
        return (
          <div>
            <RadioGroup form="my-form" value={value} onChange={setValue} name="delivery">
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>

            <form
              id="my-form"
              onSubmit={(event) => {
                event.preventDefault()
                submits([...new FormData(event.currentTarget).entries()])
              }}
            >
              <button>Submit</button>
            </form>
          </div>
        )
      }

      render(<Example />)

      // Choose pickup
      await click(getByText('Pickup'))

      // Submit the form
      await click(getByText('Submit'))

      expect(submits).toHaveBeenLastCalledWith([['delivery', 'pickup']])
    })
  )

  it(
    'should be possible to submit a form with a value',
    suppressConsoleLogs(async () => {
      let submits = jest.fn()

      function Example() {
        let [value, setValue] = useState(null)
        return (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submits([...new FormData(event.currentTarget).entries()])
            }}
          >
            <RadioGroup value={value} onChange={setValue} name="delivery">
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              <RadioGroup.Option value="pickup">Pickup</RadioGroup.Option>
              <RadioGroup.Option value="home-delivery">Home delivery</RadioGroup.Option>
              <RadioGroup.Option value="dine-in">Dine in</RadioGroup.Option>
            </RadioGroup>
            <button>Submit</button>
          </form>
        )
      }

      render(<Example />)

      // Submit the form
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).toHaveBeenLastCalledWith([]) // no data

      // Choose home delivery
      await click(getByText('Home delivery'))

      // Submit the form again
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).toHaveBeenLastCalledWith([['delivery', 'home-delivery']])

      // Choose pickup
      await click(getByText('Pickup'))

      // Submit the form again
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).toHaveBeenLastCalledWith([['delivery', 'pickup']])
    })
  )

  it(
    'should be possible to submit a form with a complex value object',
    suppressConsoleLogs(async () => {
      let submits = jest.fn()
      let options = [
        {
          id: 1,
          value: 'pickup',
          label: 'Pickup',
          extra: { info: 'Some extra info' },
        },
        {
          id: 2,
          value: 'home-delivery',
          label: 'Home delivery',
          extra: { info: 'Some extra info' },
        },
        {
          id: 3,
          value: 'dine-in',
          label: 'Dine in',
          extra: { info: 'Some extra info' },
        },
      ]

      function Example() {
        let [value, setValue] = useState(options[0])

        return (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submits([...new FormData(event.currentTarget).entries()])
            }}
          >
            <RadioGroup value={value} onChange={setValue} name="delivery">
              <RadioGroup.Label>Pizza Delivery</RadioGroup.Label>
              {options.map((option) => (
                <RadioGroup.Option key={option.id} value={option}>
                  {option.label}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
            <button>Submit</button>
          </form>
        )
      }

      render(<Example />)

      // Submit the form
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).toHaveBeenLastCalledWith([
        ['delivery[id]', '1'],
        ['delivery[value]', 'pickup'],
        ['delivery[label]', 'Pickup'],
        ['delivery[extra][info]', 'Some extra info'],
      ])

      // Choose home delivery
      await click(getByText('Home delivery'))

      // Submit the form again
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).toHaveBeenLastCalledWith([
        ['delivery[id]', '2'],
        ['delivery[value]', 'home-delivery'],
        ['delivery[label]', 'Home delivery'],
        ['delivery[extra][info]', 'Some extra info'],
      ])

      // Choose pickup
      await click(getByText('Pickup'))

      // Submit the form again
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).toHaveBeenLastCalledWith([
        ['delivery[id]', '1'],
        ['delivery[value]', 'pickup'],
        ['delivery[label]', 'Pickup'],
        ['delivery[extra][info]', 'Some extra info'],
      ])
    })
  )
})
