import React, { createElement, useState } from 'react'

import { render } from '@testing-library/react'

import { RadioGroup } from './radio-group'

import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { press, focus, Keys, shift, click } from '../../test-utils/interactions'
import {
  getByText,
  assertRadioGroupLabel,
  getRadioGroupOptions,
  assertFocusable,
  assertNotFocusable,
  assertActiveElement,
} from '../../test-utils/accessibility-assertions'

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
      expect(() => render(createElement(Component))).toThrowError(
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
                {JSON.stringify}
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
                {JSON.stringify}
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
      expect(submits).lastCalledWith([]) // no data

      // Choose home delivery
      await click(getByText('Home delivery'))

      // Submit the form again
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).lastCalledWith([['delivery', 'home-delivery']])

      // Choose pickup
      await click(getByText('Pickup'))

      // Submit the form again
      await click(getByText('Submit'))

      // Verify that the form has been submitted
      expect(submits).lastCalledWith([['delivery', 'pickup']])
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
      expect(submits).lastCalledWith([
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
      expect(submits).lastCalledWith([
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
      expect(submits).lastCalledWith([
        ['delivery[id]', '1'],
        ['delivery[value]', 'pickup'],
        ['delivery[label]', 'Pickup'],
        ['delivery[extra][info]', 'Some extra info'],
      ])
    })
  )
})
