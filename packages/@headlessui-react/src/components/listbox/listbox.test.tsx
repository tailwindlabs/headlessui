import React from 'react'
import { render } from '@testing-library/react'

import { Listbox } from './listbox'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  click,
  focus,
  mouseMove,
  mouseLeave,
  press,
  shift,
  type,
  word,
  Keys,
} from '../../test-utils/interactions'
import {
  assertActiveElement,
  assertActiveListboxOption,
  assertListbox,
  assertListboxButton,
  assertListboxButtonLinkedWithListbox,
  assertListboxButtonLinkedWithListboxLabel,
  assertListboxOption,
  assertListboxLabel,
  assertListboxLabelLinkedWithListbox,
  assertNoActiveListboxOption,
  assertNoSelectedListboxOption,
  getListbox,
  getListboxButton,
  getListboxButtons,
  getListboxes,
  getListboxOptions,
  getListboxLabel,
  ListboxState,
} from '../../test-utils/accessibility-assertions'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

describe('safeguards', () => {
  it.each([
    ['Listbox.Button', Listbox.Button],
    ['Listbox.Label', Listbox.Label],
    ['Listbox.Options', Listbox.Options],
    ['Listbox.Option', Listbox.Option],
  ])(
    'should error when we are using a <%s /> without a parent <Listbox />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(React.createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Listbox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Listbox without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })
    })
  )
})

describe('Rendering', () => {
  describe('Listbox', () => {
    it(
      'should be possible to render a Listbox using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            {({ open }) => (
              <>
                <Listbox.Button>Trigger</Listbox.Button>
                {open && (
                  <Listbox.Options>
                    <Listbox.Option value="a">Option A</Listbox.Option>
                    <Listbox.Option value="b">Option B</Listbox.Option>
                    <Listbox.Option value="c">Option C</Listbox.Option>
                  </Listbox.Options>
                )}
              </>
            )}
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Open })
      })
    )
  })

  describe('Listbox.Label', () => {
    it(
      'should be possible to render a Listbox.Label using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Label>{JSON.stringify}</Listbox.Label>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertListbox({ state: ListboxState.Open })
        assertListboxLabelLinkedWithListbox()
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    it(
      'should be possible to render a Listbox.Label using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Label as="p">{JSON.stringify}</Listbox.Label>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Open })
      })
    )
  })

  describe('Listbox.Button', () => {
    it(
      'should be possible to render a Listbox.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>{JSON.stringify}</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, focused: false }),
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, focused: false }),
        })
        assertListbox({ state: ListboxState.Open })
      })
    )

    it(
      'should be possible to render a Listbox.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button as="div" role="button">
              {JSON.stringify}
            </Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, focused: false }),
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, focused: false }),
        })
        assertListbox({ state: ListboxState.Open })
      })
    )

    it(
      'should be possible to render a Listbox.Button and a Listbox.Label and see them linked together',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Label>Label</Listbox.Label>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // TODO: Needed to make it similar to vue test implementation?
        // await new Promise(requestAnimationFrame)

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListbox({ state: ListboxState.Closed })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )
  })

  describe('Listbox.Options', () => {
    it(
      'should be possible to render Listbox.Options using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              {data => (
                <>
                  <Listbox.Option value="a">{JSON.stringify(data)}</Listbox.Option>
                </>
              )}
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Open,
          textContent: JSON.stringify({ open: true }),
        })
        assertActiveElement(getListbox())
      })
    )

    it('should be possible to always render the Listbox.Options if we provide it a `static` prop', () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options static>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Let's verify that the Listbox is already there
      expect(getListbox()).not.toBe(null)
    })
  })

  describe('Listbox.Option', () => {
    it(
      'should be possible to render a Listbox.Option using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">{JSON.stringify}</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Open,
          textContent: JSON.stringify({ active: false, selected: false, disabled: false }),
        })
      })
    )
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka className can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a" className={bag => JSON.stringify(bag)}>
              Option A
            </Listbox.Option>
            <Listbox.Option value="b" disabled className={bag => JSON.stringify(bag)}>
              Option B
            </Listbox.Option>
            <Listbox.Option value="c" className="no-special-treatment">
              Option C
            </Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      // Open Listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      // Verify correct classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that nothing is active
      assertNoActiveListboxOption(getListbox())

      // Make the first option active
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: true, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the first option is the active one
      assertActiveListboxOption(options[0])

      // Let's go down, this should go to the third option since the second option is disabled!
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the last option is the active one
      assertActiveListboxOption(options[2])
    })
  )

  it(
    'should be possible to swap the Listbox option with a button for example',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option as="button" value="a">
              Option A
            </Listbox.Option>
            <Listbox.Option as="button" value="b">
              Option B
            </Listbox.Option>
            <Listbox.Option as="button" value="c">
              Option C
            </Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      // Open Listbox
      await click(getListboxButton())

      // Verify options are buttons now
      getListboxOptions().forEach(option => assertListboxOption(option, { tag: 'button' }))
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the listbox with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option, { selected: false }))

        // Verify that the first listbox option is active
        assertActiveListboxOption(options[0])
        assertNoSelectedListboxOption()
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        const options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        const options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should have no active listbox option upon Enter key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to close the listbox with Enter when there is no active listboxoption',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })

        // Close listbox
        await press(Keys.Enter)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.Closed })
        assertListbox({ state: ListboxState.Closed })
      })
    )

    it(
      'should be possible to close the listbox with Enter and choose the active listbox option',
      suppressConsoleLogs(async () => {
        const handleChange = jest.fn()

        function Example() {
          const [value, setValue] = React.useState(undefined)

          return (
            <Listbox
              value={value}
              onChange={value => {
                setValue(value)
                handleChange(value)
              }}
            >
              <Listbox.Button>Trigger</Listbox.Button>
              <Listbox.Options>
                <Listbox.Option value="a">Option A</Listbox.Option>
                <Listbox.Option value="b">Option B</Listbox.Option>
                <Listbox.Option value="c">Option C</Listbox.Option>
              </Listbox.Options>
            </Listbox>
          )
        }

        render(<Example />)

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })

        // Activate the first listbox option
        const options = getListboxOptions()
        await mouseMove(options[0])

        // Choose option, and close listbox
        await press(Keys.Enter)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.Closed })
        assertListbox({ state: ListboxState.Closed })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Open listbox again
        await click(getListboxButton())

        // Verify the active option is the previously selected one
        assertActiveListboxOption(getListboxOptions()[0])
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the listbox with Space',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should be possible to open the listbox with Space, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Space',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        const options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        const options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should have no active listbox option upon Space key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to close the listbox with Space and choose the active listbox option',
      suppressConsoleLogs(async () => {
        const handleChange = jest.fn()

        function Example() {
          const [value, setValue] = React.useState(undefined)

          return (
            <Listbox
              value={value}
              onChange={value => {
                setValue(value)
                handleChange(value)
              }}
            >
              <Listbox.Button>Trigger</Listbox.Button>
              <Listbox.Options>
                <Listbox.Option value="a">Option A</Listbox.Option>
                <Listbox.Option value="b">Option B</Listbox.Option>
                <Listbox.Option value="c">Option C</Listbox.Option>
              </Listbox.Options>
            </Listbox>
          )
        }

        render(<Example />)

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })

        // Activate the first listbox option
        const options = getListboxOptions()
        await mouseMove(options[0])

        // Choose option, and close listbox
        await press(Keys.Space)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.Closed })
        assertListbox({ state: ListboxState.Closed })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Open listbox again
        await click(getListboxButton())

        // Verify the active option is the previously selected one
        assertActiveListboxOption(getListboxOptions()[0])
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should be possible to close an open listbox with Escape',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Close listbox
        await press(Keys.Escape)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.Closed })
        assertListbox({ state: ListboxState.Closed })
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should focus trap when we use Tab',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // Try to tab
        await press(Keys.Tab)

        // Verify it is still open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())
      })
    )

    it(
      'should focus trap when we use Shift+Tab',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // Try to Shift+Tab
        await press(shift(Keys.Tab))

        // Verify it is still open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should be possible to open the listbox with ArrowDown',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))

        // Verify that the first listbox option is active
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should be possible to open the listbox with ArrowDown, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[1])

        // We should be able to go down again
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])

        // We should NOT be able to go down again (because last option). Current implementation won't go around.
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options and skip the first disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[1])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should be possible to open the listbox with ArrowUp and the last option should be active',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))

        // ! ALERT: The LAST option should now be active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to open the listbox with ArrowUp, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should have no active listbox option when there are no listbox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the listbox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])

        // We should not be able to go up (because those are disabled)
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[2])

        // We should not be able to go down (because this is the last option)
        await press(Keys.ArrowDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
        assertActiveListboxOption(options[2])

        // We should be able to go down once
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[1])

        // We should be able to go down again
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[0])

        // We should NOT be able to go up again (because first option). Current implementation won't go around.
        await press(Keys.ArrowUp)
        assertActiveListboxOption(options[0])
      })
    )
  })

  describe('`End` key', () => {
    it(
      'should be possible to use the End key to go to the last listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        const options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await press(Keys.End)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the End key to go to the last non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        const options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last non-disabled option
        await press(Keys.End)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to use the End key to go to the first listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.End)

        const options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon End key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.End)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`PageDown` key', () => {
    it(
      'should be possible to use the PageDown key to go to the last listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        const options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await press(Keys.PageDown)
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the last non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        const options = getListboxOptions()

        // We should be on the first option
        assertActiveListboxOption(options[0])

        // We should be able to go to the last non-disabled option
        await press(Keys.PageDown)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the first listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        const options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon PageDown key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`Home` key', () => {
    it(
      'should be possible to use the Home key to go to the first listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        const options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the first option
        await press(Keys.Home)
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should be possible to use the Home key to go to the first non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
              <Listbox.Option value="d">Option D</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        const options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the Home key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option value="d">Option D</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        const options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon Home key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`PageUp` key', () => {
    it(
      'should be possible to use the PageUp key to go to the first listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        const options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the first option
        await press(Keys.PageUp)
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the first non disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
              <Listbox.Option value="d">Option D</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        const options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option value="d">Option D</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        const options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon PageUp key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option disabled value="a">
                Option A
              </Listbox.Option>
              <Listbox.Option disabled value="b">
                Option B
              </Listbox.Option>
              <Listbox.Option disabled value="c">
                Option C
              </Listbox.Option>
              <Listbox.Option disabled value="d">
                Option D
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveListboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        assertNoActiveListboxOption()
      })
    )
  })

  describe('`Any` key aka search', () => {
    it(
      'should be possible to type a full word that has a perfect match',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()

        // We should be able to go to the second option
        await type(word('bob'))
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await type(word('alice'))
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await type(word('charlie'))
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to type a partial of a word',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        const options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the second option
        await type(word('bo'))
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await type(word('ali'))
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await type(word('char'))
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">value a</Listbox.Option>
              <Listbox.Option value="b">value b</Listbox.Option>
              <Listbox.Option value="c">value c</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        const options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should be able to go to the second option
        await type(word('value b'))
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await type(word('value a'))
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await type(word('value c'))
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should not be possible to search for a disabled option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option disabled value="bob">
                bob
              </Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        const options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should not be able to go to the disabled option
        await type(word('bo'))

        // We should still be on the last option
        assertActiveListboxOption(options[2])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should focus the Listbox.Button when we click the Listbox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Label>Label</Listbox.Label>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getListboxLabel())

      // Ensure that the actual button is focused instead
      assertActiveElement(getListboxButton())
    })
  )

  it(
    'should be possible to open a listbox on click',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      // Open listbox
      await click(getListboxButton())

      // Verify it is open
      assertListboxButton({ state: ListboxState.Open })
      assertListbox({
        state: ListboxState.Open,
        attributes: { id: 'headlessui-listbox-options-2' },
      })
      assertActiveElement(getListbox())
      assertListboxButtonLinkedWithListbox()

      // Verify we have listbox options
      const options = getListboxOptions()
      expect(options).toHaveLength(3)
      options.forEach(option => assertListboxOption(option))
    })
  )

  it(
    'should be possible to open a listbox on click, and focus the selected option',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value="b" onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      // Open listbox
      await click(getListboxButton())

      // Verify it is open
      assertListboxButton({ state: ListboxState.Open })
      assertListbox({
        state: ListboxState.Open,
        attributes: { id: 'headlessui-listbox-options-2' },
      })
      assertActiveElement(getListbox())
      assertListboxButtonLinkedWithListbox()

      // Verify we have listbox options
      const options = getListboxOptions()
      expect(options).toHaveLength(3)
      options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

      // Verify that the second listbox option is active (because it is already selected)
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be possible to close a listbox on click',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      // Verify it is open
      assertListboxButton({ state: ListboxState.Open })

      // Click to close
      await click(getListboxButton())

      // Verify it is closed
      assertListboxButton({ state: ListboxState.Closed })
      assertListbox({ state: ListboxState.Closed })
    })
  )

  it('should focus the listbox when you try to focus the button again (when the listbox is already open)', async () => {
    render(
      <Listbox value={undefined} onChange={console.log}>
        <Listbox.Button>Trigger</Listbox.Button>
        <Listbox.Options>
          <Listbox.Option value="a">Option A</Listbox.Option>
          <Listbox.Option value="b">Option B</Listbox.Option>
          <Listbox.Option value="c">Option C</Listbox.Option>
        </Listbox.Options>
      </Listbox>
    )

    // Open listbox
    await click(getListboxButton())

    // Verify listbox is focused
    assertActiveElement(getListbox())

    // Try to Re-focus the button
    getListboxButton()?.focus()

    // Verify listbox is still focused
    assertActiveElement(getListbox())
  })

  it(
    'should be a no-op when we click outside of a closed listbox',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Verify that the window is closed
      assertListbox({ state: ListboxState.Closed })

      // Click something that is not related to the listbox
      await click(document.body)

      // Should still be closed
      assertListbox({ state: ListboxState.Closed })
    })
  )

  it(
    'should be possible to click outside of the listbox which should close the listbox',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())

      // Click something that is not related to the listbox
      await click(document.body)

      // Should be closed now
      assertListbox({ state: ListboxState.Closed })
    })
  )

  it(
    'should be possible to click outside of the listbox on another listbox button which should close the current listbox and open the new listbox',
    suppressConsoleLogs(async () => {
      render(
        <div>
          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>

          <Listbox value={undefined} onChange={console.log}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        </div>
      )

      const [button1, button2] = getListboxButtons()

      // Click the first menu button
      await click(button1)
      expect(getListboxes()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the first button
      assertListboxButtonLinkedWithListbox(button1, getListbox())

      // Click the second menu button
      await click(button2)

      expect(getListboxes()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the second button
      assertListboxButtonLinkedWithListbox(button2, getListbox())
    })
  )

  it(
    'should be possible to click outside of the listbox which should close the listbox (even if we press the listbox button)',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())

      // Click the listbox button again
      await click(getListboxButton())

      // Should be closed now
      assertListbox({ state: ListboxState.Closed })
    })
  )

  it(
    'should be possible to hover an option and make it active',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])

      // We should be able to go to the first option
      await mouseMove(options[0])
      assertActiveListboxOption(options[0])

      // We should be able to go to the last option
      await mouseMove(options[2])
      assertActiveListboxOption(options[2])
    })
  )

  it(
    'should make a listbox option active when you move the mouse over it',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the listbox option is already active',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])

      await mouseMove(options[1])

      // Nothing should be changed
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the listbox option is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option disabled value="bob">
              bob
            </Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      await mouseMove(options[1])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should not be possible to hover an option that is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option disabled value="bob">
              bob
            </Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1])

      // We should not have an active option now
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible to mouse leave an option and make it inactive',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])

      await mouseLeave(options[1])
      assertNoActiveListboxOption()

      // We should be able to go to the first option
      await mouseMove(options[0])
      assertActiveListboxOption(options[0])

      await mouseLeave(options[0])
      assertNoActiveListboxOption()

      // We should be able to go to the last option
      await mouseMove(options[2])
      assertActiveListboxOption(options[2])

      await mouseLeave(options[2])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible to mouse leave a disabled option and be a no-op',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option disabled value="bob">
              bob
            </Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1])
      assertNoActiveListboxOption()

      await mouseLeave(options[1])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible to click a listbox option, which closes the listbox',
    suppressConsoleLogs(async () => {
      const handleChange = jest.fn()
      function Example() {
        const [value, setValue] = React.useState(undefined)

        return (
          <Listbox
            value={value}
            onChange={value => {
              setValue(value)
              handleChange(value)
            }}
          >
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )
      }

      render(<Example />)

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())

      const options = getListboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertListbox({ state: ListboxState.Closed })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('bob')

      // Open listbox again
      await click(getListboxButton())

      // Verify the active option is the previously selected one
      assertActiveListboxOption(getListboxOptions()[1])
    })
  )

  it(
    'should be possible to click a disabled listbox option, which is a no-op',
    suppressConsoleLogs(async () => {
      const handleChange = jest.fn()
      function Example() {
        const [value, setValue] = React.useState(undefined)

        return (
          <Listbox
            value={value}
            onChange={value => {
              setValue(value)
              handleChange(value)
            }}
          >
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option disabled value="bob">
                bob
              </Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )
      }

      render(<Example />)

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())

      const options = getListboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())
      expect(handleChange).toHaveBeenCalledTimes(0)

      // Close the listbox
      await click(getListboxButton())

      // Open listbox again
      await click(getListboxButton())

      // Verify the active option is non existing
      assertNoActiveListboxOption()
    })
  )

  it(
    'should be possible focus a listbox option, so that it becomes active',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())

      const options = getListboxOptions()

      // Verify that nothing is active yet
      assertNoActiveListboxOption()

      // We should be able to focus the first option
      await focus(options[1])
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should not be possible to focus a listbox option which is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={console.log}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option disabled value="bob">
              bob
            </Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())
      assertListbox({ state: ListboxState.Open })
      assertActiveElement(getListbox())

      const options = getListboxOptions()

      // We should not be able to focus the first option
      await focus(options[1])
      assertNoActiveListboxOption()
    })
  )
})
