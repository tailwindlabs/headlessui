import React, { createElement, useState, useEffect } from 'react'
import { render, screen } from '@testing-library/react'

import { Combobox } from './combobox'
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
  MouseButton,
} from '../../test-utils/interactions'
import {
  assertActiveElement,
  assertActiveComboboxOption,
  assertCombobox,
  assertComboboxButton,
  assertComboboxButtonLinkedWithCombobox,
  assertComboboxButtonLinkedWithComboboxLabel,
  assertComboboxOption,
  assertComboboxLabel,
  assertComboboxLabelLinkedWithCombobox,
  assertNoActiveComboboxOption,
  assertNoSelectedComboboxOption,
  getCombobox,
  getComboboxButton,
  getComboboxButtons,
  getComboboxes,
  getComboboxOptions,
  getComboboxLabel,
  ComboboxState,
  getByText,
} from '../../test-utils/accessibility-assertions'
import { Transition } from '../transitions/transition'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

describe('safeguards', () => {
  it.each([
    ['Combobox.Button', Combobox.Button],
    ['Combobox.Label', Combobox.Label],
    ['Combobox.Options', Combobox.Options],
    ['Combobox.Option', Combobox.Option],
  ])(
    'should error when we are using a <%s /> without a parent <Combobox />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Combobox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Combobox without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Combobox', () => {
    it(
      'should be possible to render a Combobox using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            {({ open }) => (
              <>
                <Combobox.Input />
                <Combobox.Button>Trigger</Combobox.Button>
                {open && (
                  <Combobox.Options>
                    <Combobox.Option value="a">Option A</Combobox.Option>
                    <Combobox.Option value="b">Option B</Combobox.Option>
                    <Combobox.Option value="c">Option C</Combobox.Option>
                  </Combobox.Options>
                )}
              </>
            )}
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to disable a Combobox',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} disabled>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await press(Keys.Enter, getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
      })
    )
  })

  describe('Combobox.Label', () => {
    it(
      'should be possible to render a Combobox.Label using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Label>{JSON.stringify}</Combobox.Label>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertCombobox({ state: ComboboxState.Visible })
        assertComboboxLabelLinkedWithCombobox()
        assertComboboxButtonLinkedWithComboboxLabel()
      })
    )

    it(
      'should be possible to render a Combobox.Label using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Label as="p">{JSON.stringify}</Combobox.Label>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
          tag: 'p',
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())
        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
          tag: 'p',
        })
        assertCombobox({ state: ComboboxState.Visible })
      })
    )
  })

  describe('Combobox.Button', () => {
    it(
      'should be possible to render a Combobox.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Button>{JSON.stringify}</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertCombobox({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to render a Combobox.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Button as="div" role="button">
              {JSON.stringify}
            </Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertCombobox({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to render a Combobox.Button and a Combobox.Label and see them linked together',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Label>Label</Combobox.Label>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // TODO: Needed to make it similar to vue test implementation?
        // await new Promise(requestAnimationFrame)

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
        assertComboboxButtonLinkedWithComboboxLabel()
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Button type="submit">Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).toHaveAttribute('type', 'submit')
      })

      it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
        let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
          <button ref={ref} {...props} />
        ))

        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Button as={CustomButton}>Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Button as="div">Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).not.toHaveAttribute('type')
      })

      it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
        let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
          <div ref={ref} {...props} />
        ))

        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Button as={CustomButton}>Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).not.toHaveAttribute('type')
      })
    })
  })

  describe('Combobox.Options', () => {
    it(
      'should be possible to render Combobox.Options using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              {data => (
                <>
                  <Combobox.Option value="a">{JSON.stringify(data)}</Combobox.Option>
                </>
              )}
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({
          state: ComboboxState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
        assertActiveElement(getCombobox())
      })
    )

    it('should be possible to always render the Combobox.Options if we provide it a `static` prop', () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options static>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Let's verify that the Combobox is already there
      expect(getCombobox()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Combobox.Options', async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options unmount={false}>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertCombobox({ state: ComboboxState.InvisibleHidden })

      // Let's open the Combobox, to see if it is not hidden anymore
      await click(getComboboxButton())

      assertCombobox({ state: ComboboxState.Visible })
    })
  })

  describe('Combobox.Option', () => {
    it(
      'should be possible to render a Combobox.Option using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">{JSON.stringify}</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({
          state: ComboboxState.Visible,
          textContent: JSON.stringify({ active: false, selected: false, disabled: false }),
        })
      })
    )
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    function Example({ hide = false }) {
      return (
        <>
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option 1</Combobox.Option>
              {!hide && <Combobox.Option value="b">Option 2</Combobox.Option>}
              <Combobox.Option value="c">Option 3</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        </>
      )
    }

    let { rerender } = render(<Example />)

    // Open the Combobox
    await click(getByText('Trigger'))

    rerender(<Example hide={true} />) // Remove Combobox.Option 2
    rerender(<Example hide={false} />) // Re-add Combobox.Option 2

    screen.debug()

    assertCombobox({ state: ComboboxState.Visible })

    let options = getComboboxOptions()

    // Focus the first item
    await press(Keys.ArrowDown)

    // Verify that the first menu item is active
    assertActiveComboboxOption(options[0])

    await press(Keys.ArrowDown)
    // Verify that the second menu item is active
    assertActiveComboboxOption(options[1])

    await press(Keys.ArrowDown)
    // Verify that the third menu item is active
    assertActiveComboboxOption(options[2])
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka className can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a" className={bag => JSON.stringify(bag)}>
              Option A
            </Combobox.Option>
            <Combobox.Option value="b" disabled className={bag => JSON.stringify(bag)}>
              Option B
            </Combobox.Option>
            <Combobox.Option value="c" className="no-special-treatment">
              Option C
            </Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Open Combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      // Verify correct classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that nothing is active
      assertNoActiveComboboxOption(getCombobox())

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
      assertActiveComboboxOption(options[0])

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
      assertActiveComboboxOption(options[2])
    })
  )

  it(
    'should be possible to swap the Combobox option with a button for example',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option as="button" value="a">
              Option A
            </Combobox.Option>
            <Combobox.Option as="button" value="b">
              Option B
            </Combobox.Option>
            <Combobox.Option as="button" value="c">
              Option C
            </Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Open Combobox
      await click(getComboboxButton())

      // Verify options are buttons now
      getComboboxOptions().forEach(option => assertComboboxOption(option, { tag: 'button' }))
    })
  )
})

describe('Composition', () => {
  function Debug({ fn, name }: { fn: (text: string) => void; name: string }) {
    useEffect(() => {
      fn(`Mounting - ${name}`)
      return () => {
        fn(`Unmounting - ${name}`)
      }
    }, [fn, name])
    return null
  }

  it(
    'should be possible to wrap the Combobox.Options with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Debug name="Combobox" fn={orderFn} />
          <Transition>
            <Debug name="Transition" fn={orderFn} />
            <Combobox.Options>
              <Combobox.Option value="a">
                {data => (
                  <>
                    {JSON.stringify(data)}
                    <Debug name="Combobox.Option" fn={orderFn} />
                  </>
                )}
              </Combobox.Option>
            </Combobox.Options>
          </Transition>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      await click(getComboboxButton())

      assertComboboxButton({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({
        state: ComboboxState.Visible,
        textContent: JSON.stringify({ active: false, selected: false, disabled: false }),
      })

      await click(getComboboxButton())

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Combobox'],
        ['Mounting - Transition'],
        ['Mounting - Combobox.Option'],
        ['Unmounting - Transition'],
        ['Unmounting - Combobox.Option'],
      ])
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the combobox with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option, { selected: false }))

        // Verify that the first combobox option is active
        assertActiveComboboxOption(options[0])
        assertNoSelectedComboboxOption()
      })
    )

    it(
      'should not be possible to open the combobox with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} disabled>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the combobox
        await press(Keys.Enter)

        // Verify it is still closed
        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the combobox with Enter, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="b" onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should be possible to open the combobox with Enter, and focus the selected option (when using the `hidden` render strategy)',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="b" onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options unmount={false}>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleHidden,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleHidden })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        let options = getComboboxOptions()

        // Hover over Option A
        await mouseMove(options[0])

        // Verify that Option A is active
        assertActiveComboboxOption(options[0])

        // Verify that Option B is still selected
        assertComboboxOption(options[1], { selected: true })

        // Close/Hide the combobox
        await press(Keys.Escape)

        // Re-open the combobox
        await click(getComboboxButton())

        // Verify we have combobox options
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should be possible to open the combobox with Enter, and focus the selected option (with a list of objects)',
      suppressConsoleLogs(async () => {
        let myOptions = [
          { id: 'a', name: 'Option A' },
          { id: 'b', name: 'Option B' },
          { id: 'c', name: 'Option C' },
        ]
        let selectedOption = myOptions[1]
        render(
          <Combobox value={selectedOption} onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              {myOptions.map(myOption => (
                <Combobox.Option key={myOption.id} value={myOption}>
                  {myOption.name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active combobox option when there are no combobox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options />
          </Combobox>
        )

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should focus the first non disabled combobox option when opening with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // Verify that the first non-disabled combobox option is active
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled combobox option when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // Verify that the first non-disabled combobox option is active
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should have no active combobox option upon Enter key press, when there are no non-disabled combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to close the combobox with Enter when there is no active comboboxoption',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Open combobox
        await click(getComboboxButton())

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })

        // Close combobox
        await press(Keys.Enter)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())
      })
    )

    it(
      'should be possible to close the combobox with Enter and choose the active combobox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()

        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <Combobox
              value={value}
              onChange={value => {
                setValue(value)
                handleChange(value)
              }}
            >
              <Combobox.Input />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="a">Option A</Combobox.Option>
                <Combobox.Option value="b">Option B</Combobox.Option>
                <Combobox.Option value="c">Option C</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )
        }

        render(<Example />)

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Open combobox
        await click(getComboboxButton())

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })

        // Activate the first combobox option
        let options = getComboboxOptions()
        await mouseMove(options[0])

        // Choose option, and close combobox
        await press(Keys.Enter)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())

        // Open combobox again
        await click(getComboboxButton())

        // Verify the active option is the previously selected one
        assertActiveComboboxOption(getComboboxOptions()[0])
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the combobox with Space',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the combobox with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} disabled>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the combobox
        await press(Keys.Space)

        // Verify it is still closed
        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the combobox with Space, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="b" onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active combobox option when there are no combobox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options />
          </Combobox>
        )

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should focus the first non disabled combobox option when opening with Space',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)

        let options = getComboboxOptions()

        // Verify that the first non-disabled combobox option is active
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled combobox option when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)

        let options = getComboboxOptions()

        // Verify that the first non-disabled combobox option is active
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should have no active combobox option upon Space key press, when there are no non-disabled combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to close the combobox with Space and choose the active combobox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()

        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <Combobox
              value={value}
              onChange={value => {
                setValue(value)
                handleChange(value)
              }}
            >
              <Combobox.Input />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="a">Option A</Combobox.Option>
                <Combobox.Option value="b">Option B</Combobox.Option>
                <Combobox.Option value="c">Option C</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )
        }

        render(<Example />)

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Open combobox
        await click(getComboboxButton())

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })

        // Activate the first combobox option
        let options = getComboboxOptions()
        await mouseMove(options[0])

        // Choose option, and close combobox
        await press(Keys.Space)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())

        // Open combobox again
        await click(getComboboxButton())

        // Verify the active option is the previously selected one
        assertActiveComboboxOption(getComboboxOptions()[0])
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should be possible to close an open combobox with Escape',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Space)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Close combobox
        await press(Keys.Escape)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should focus trap when we use Tab',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])

        // Try to tab
        await press(Keys.Tab)

        // Verify it is still open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())
      })
    )

    it(
      'should focus trap when we use Shift+Tab',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])

        // Try to Shift+Tab
        await press(shift(Keys.Tab))

        // Verify it is still open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should be possible to open the combobox with ArrowDown',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowDown)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))

        // Verify that the first combobox option is active
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the combobox with ArrowDown when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} disabled>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the combobox
        await press(Keys.ArrowDown)

        // Verify it is still closed
        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the combobox with ArrowDown, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="b" onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowDown)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active combobox option when there are no combobox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options />
          </Combobox>
        )

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowDown)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertActiveComboboxOption(options[1])

        // We should be able to go down again
        await press(Keys.ArrowDown)
        assertActiveComboboxOption(options[2])

        // We should NOT be able to go down again (because last option). Current implementation won't go around.
        await press(Keys.ArrowDown)
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the combobox options and skip the first disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[1])

        // We should be able to go down once
        await press(Keys.ArrowDown)
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the combobox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[2])
      })
    )
  })

  describe('`ArrowRight` key', () => {
    it(
      'should be possible to use ArrowRight to navigate the combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} horizontal>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])

        // We should be able to go right once
        await press(Keys.ArrowRight)
        assertActiveComboboxOption(options[1])

        // We should be able to go right again
        await press(Keys.ArrowRight)
        assertActiveComboboxOption(options[2])

        // We should NOT be able to go right again (because last option). Current implementation won't go around.
        await press(Keys.ArrowRight)
        assertActiveComboboxOption(options[2])
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should be possible to open the combobox with ArrowUp and the last option should be active',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))

        // ! ALERT: The LAST option should now be active
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should not be possible to open the combobox with ArrowUp and the last option should be active when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} disabled>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the combobox
        await press(Keys.ArrowUp)

        // Verify it is still closed
        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the combobox with ArrowUp, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="b" onChange={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active combobox option when there are no combobox options at all',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options />
          </Combobox>
        )

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the combobox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[2])

        // We should not be able to go up (because those are disabled)
        await press(Keys.ArrowUp)
        assertActiveComboboxOption(options[2])

        // We should not be able to go down (because this is the last option)
        await press(Keys.ArrowDown)
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[2])

        // We should be able to go down once
        await press(Keys.ArrowUp)
        assertActiveComboboxOption(options[1])

        // We should be able to go down again
        await press(Keys.ArrowUp)
        assertActiveComboboxOption(options[0])

        // We should NOT be able to go up again (because first option). Current implementation won't go around.
        await press(Keys.ArrowUp)
        assertActiveComboboxOption(options[0])
      })
    )
  })

  describe('`ArrowLeft` key', () => {
    it(
      'should be possible to use ArrowLeft to navigate the combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} horizontal>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
          orientation: 'horizontal',
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[2])

        // We should be able to go left once
        await press(Keys.ArrowLeft)
        assertActiveComboboxOption(options[1])

        // We should be able to go left again
        await press(Keys.ArrowLeft)
        assertActiveComboboxOption(options[0])

        // We should NOT be able to go left again (because first option). Current implementation won't go around.
        await press(Keys.ArrowLeft)
        assertActiveComboboxOption(options[0])
      })
    )
  })

  describe('`End` key', () => {
    it(
      'should be possible to use the End key to go to the last combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // We should be on the first option
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last option
        await press(Keys.End)
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use the End key to go to the last non disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // We should be on the first option
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last non-disabled option
        await press(Keys.End)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should be possible to use the End key to go to the first combobox option if that is the only non-disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.End)

        let options = getComboboxOptions()
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should have no active combobox option upon End key press, when there are no non-disabled combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.End)

        assertNoActiveComboboxOption()
      })
    )
  })

  describe('`PageDown` key', () => {
    it(
      'should be possible to use the PageDown key to go to the last combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // We should be on the first option
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last option
        await press(Keys.PageDown)
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the last non disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // We should be on the first option
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last non-disabled option
        await press(Keys.PageDown)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should be possible to use the PageDown key to go to the first combobox option if that is the only non-disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        let options = getComboboxOptions()
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should have no active combobox option upon PageDown key press, when there are no non-disabled combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        assertNoActiveComboboxOption()
      })
    )
  })

  describe('`Home` key', () => {
    it(
      'should be possible to use the Home key to go to the first combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        let options = getComboboxOptions()

        // We should be on the last option
        assertActiveComboboxOption(options[2])

        // We should be able to go to the first option
        await press(Keys.Home)
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should be possible to use the Home key to go to the first non disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
              <Combobox.Option value="d">Option D</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        let options = getComboboxOptions()

        // We should be on the first non-disabled option
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use the Home key to go to the last combobox option if that is the only non-disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option value="d">Option D</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        let options = getComboboxOptions()
        assertActiveComboboxOption(options[3])
      })
    )

    it(
      'should have no active combobox option upon Home key press, when there are no non-disabled combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.Home)

        assertNoActiveComboboxOption()
      })
    )
  })

  describe('`PageUp` key', () => {
    it(
      'should be possible to use the PageUp key to go to the first combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">Option A</Combobox.Option>
              <Combobox.Option value="b">Option B</Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        let options = getComboboxOptions()

        // We should be on the last option
        assertActiveComboboxOption(options[2])

        // We should be able to go to the first option
        await press(Keys.PageUp)
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the first non disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option value="c">Option C</Combobox.Option>
              <Combobox.Option value="d">Option D</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let options = getComboboxOptions()

        // We should be on the first non-disabled option
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the last combobox option if that is the only non-disabled combobox option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option value="d">Option D</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let options = getComboboxOptions()
        assertActiveComboboxOption(options[3])
      })
    )

    it(
      'should have no active combobox option upon PageUp key press, when there are no non-disabled combobox options',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option disabled value="a">
                Option A
              </Combobox.Option>
              <Combobox.Option disabled value="b">
                Option B
              </Combobox.Option>
              <Combobox.Option disabled value="c">
                Option C
              </Combobox.Option>
              <Combobox.Option disabled value="d">
                Option D
              </Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        // We opened via click, we don't have an active option
        assertNoActiveComboboxOption()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        assertNoActiveComboboxOption()
      })
    )
  })

  describe('`Any` key aka search', () => {
    it(
      'should be possible to type a full word that has a perfect match',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Open combobox
        await click(getComboboxButton())

        let options = getComboboxOptions()

        // We should be able to go to the second option
        await type(word('bob'))
        assertActiveComboboxOption(options[1])

        // We should be able to go to the first option
        await type(word('alice'))
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last option
        await type(word('charlie'))
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to type a partial of a word',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        let options = getComboboxOptions()

        // We should be on the last option
        assertActiveComboboxOption(options[2])

        // We should be able to go to the second option
        await type(word('bo'))
        assertActiveComboboxOption(options[1])

        // We should be able to go to the first option
        await type(word('ali'))
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last option
        await type(word('char'))
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">value a</Combobox.Option>
              <Combobox.Option value="b">value b</Combobox.Option>
              <Combobox.Option value="c">value c</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        let options = getComboboxOptions()

        // We should be on the last option
        assertActiveComboboxOption(options[2])

        // We should be able to go to the second option
        await type(word('value b'))
        assertActiveComboboxOption(options[1])

        // We should be able to go to the first option
        await type(word('value a'))
        assertActiveComboboxOption(options[0])

        // We should be able to go to the last option
        await type(word('value c'))
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should not be possible to search for a disabled option',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option disabled value="bob">
                bob
              </Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        let options = getComboboxOptions()

        // We should be on the last option
        assertActiveComboboxOption(options[2])

        // We should not be able to go to the disabled option
        await type(word('bo'))

        // We should still be on the last option
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should be possible to search for a word (case insensitive)',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        // Focus the button
        getComboboxButton()?.focus()

        // Open combobox
        await press(Keys.ArrowUp)

        let options = getComboboxOptions()

        // We should be on the last option
        assertActiveComboboxOption(options[2])

        // Search for bob in a different casing
        await type(word('BO'))

        // We should be on `bob`
        assertActiveComboboxOption(options[1])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should focus the Combobox.Button when we click the Combobox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Label>Label</Combobox.Label>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getComboboxLabel())

      // Ensure that the actual button is focused instead
      assertActiveElement(getComboboxButton())
    })
  )

  it(
    'should not focus the Combobox.Button when we right click the Combobox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Label>Label</Combobox.Label>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getComboboxLabel(), MouseButton.Right)

      // Ensure that the body is still active
      assertActiveElement(document.body)
    })
  )

  it(
    'should be possible to open the combobox on click',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Open combobox
      await click(getComboboxButton())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })
      assertCombobox({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-options-2' },
      })
      assertActiveElement(getCombobox())
      assertComboboxButtonLinkedWithCombobox()

      // Verify we have combobox options
      let options = getComboboxOptions()
      expect(options).toHaveLength(3)
      options.forEach(option => assertComboboxOption(option))
    })
  )

  it(
    'should not be possible to open the combobox on right click',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Item A</Combobox.Option>
            <Combobox.Option value="b">Item B</Combobox.Option>
            <Combobox.Option value="c">Item C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Try to open the combobox
      await click(getComboboxButton(), MouseButton.Right)

      // Verify it is still closed
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open the combobox on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={undefined} onChange={console.log} disabled>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Try to open the combobox
      await click(getComboboxButton())

      // Verify it is still closed
      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to open the combobox on click, and focus the selected option',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="b" onChange={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Open combobox
      await click(getComboboxButton())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })
      assertCombobox({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-options-2' },
      })
      assertActiveElement(getCombobox())
      assertComboboxButtonLinkedWithCombobox()

      // Verify we have combobox options
      let options = getComboboxOptions()
      expect(options).toHaveLength(3)
      options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

      // Verify that the second combobox option is active (because it is already selected)
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should be possible to close a combobox on click',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })

      // Click to close
      await click(getComboboxButton())

      // Verify it is closed
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be a no-op when we click outside of a closed combobox',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Verify that the window is closed
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Click something that is not related to the combobox
      await click(document.body)

      // Should still be closed
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click outside of the combobox which should close the combobox',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      // Click something that is not related to the combobox
      await click(document.body)

      // Should be closed now
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getComboboxButton())
    })
  )

  it(
    'should be possible to click outside of the combobox on another combobox button which should close the current combobox and open the new combobox',
    suppressConsoleLogs(async () => {
      render(
        <div>
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>

          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        </div>
      )

      let [button1, button2] = getComboboxButtons()

      // Click the first combobox button
      await click(button1)
      expect(getComboboxes()).toHaveLength(1) // Only 1 combobox should be visible

      // Ensure the open combobox is linked to the first button
      assertComboboxButtonLinkedWithCombobox(button1, getCombobox())

      // Click the second combobox button
      await click(button2)

      expect(getComboboxes()).toHaveLength(1) // Only 1 combobox should be visible

      // Ensure the open combobox is linked to the second button
      assertComboboxButtonLinkedWithCombobox(button2, getCombobox())
    })
  )

  it(
    'should be possible to click outside of the combobox which should close the combobox (even if we press the combobox button)',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      // Click the combobox button again
      await click(getComboboxButton())

      // Should be closed now
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getComboboxButton())
    })
  )

  it(
    'should be possible to click outside of the combobox, on an element which is within a focusable element, which closes the combobox',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(
        <div>
          <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
            <Combobox.Button onFocus={focusFn}>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>

          <button id="btn">
            <span>Next</span>
          </button>
        </div>
      )

      // Click the combobox button
      await click(getComboboxButton())

      // Ensure the combobox is open
      assertCombobox({ state: ComboboxState.Visible })

      // Click the span inside the button
      await click(getByText('Next'))

      // Ensure the combobox is closed
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Ensure the outside button is focused
      assertActiveElement(document.getElementById('btn'))

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to hover an option and make it active',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveComboboxOption(options[1])

      // We should be able to go to the first option
      await mouseMove(options[0])
      assertActiveComboboxOption(options[0])

      // We should be able to go to the last option
      await mouseMove(options[2])
      assertActiveComboboxOption(options[2])
    })
  )

  it(
    'should make a combobox option active when you move the mouse over it',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the combobox option is already active',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveComboboxOption(options[1])

      await mouseMove(options[1])

      // Nothing should be changed
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the combobox option is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option disabled value="bob">
              bob
            </Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      await mouseMove(options[1])
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should not be possible to hover an option that is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option disabled value="bob">
              bob
            </Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1])

      // We should not have an active option now
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should be possible to mouse leave an option and make it inactive',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveComboboxOption(options[1])

      await mouseLeave(options[1])
      assertNoActiveComboboxOption()

      // We should be able to go to the first option
      await mouseMove(options[0])
      assertActiveComboboxOption(options[0])

      await mouseLeave(options[0])
      assertNoActiveComboboxOption()

      // We should be able to go to the last option
      await mouseMove(options[2])
      assertActiveComboboxOption(options[2])

      await mouseLeave(options[2])
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should be possible to mouse leave a disabled option and be a no-op',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option disabled value="bob">
              bob
            </Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      // Try to hover over option 1, which is disabled
      await mouseMove(options[1])
      assertNoActiveComboboxOption()

      await mouseLeave(options[1])
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should be possible to click a combobox option, which closes the combobox',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      function Example() {
        let [value, setValue] = useState(undefined)

        return (
          <Combobox
            value={value}
            onChange={value => {
              setValue(value)
              handleChange(value)
            }}
          >
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )
      }

      render(<Example />)

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      let options = getComboboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('bob')

      // Verify the button is focused again
      assertActiveElement(getComboboxButton())

      // Open combobox again
      await click(getComboboxButton())

      // Verify the active option is the previously selected one
      assertActiveComboboxOption(getComboboxOptions()[1])
    })
  )

  it(
    'should be possible to click a disabled combobox option, which is a no-op',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      function Example() {
        let [value, setValue] = useState(undefined)

        return (
          <Combobox
            value={value}
            onChange={value => {
              setValue(value)
              handleChange(value)
            }}
          >
            <Combobox.Input />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option disabled value="bob">
                bob
              </Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )
      }

      render(<Example />)

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      let options = getComboboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())
      expect(handleChange).toHaveBeenCalledTimes(0)

      // Close the combobox
      await click(getComboboxButton())

      // Open combobox again
      await click(getComboboxButton())

      // Verify the active option is non existing
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should be possible focus a combobox option, so that it becomes active',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      let options = getComboboxOptions()

      // Verify that nothing is active yet
      assertNoActiveComboboxOption()

      // We should be able to focus the first option
      await focus(options[1])
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should not be possible to focus a combobox option which is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value={'test'} onChange={console.log} onSearch={console.log}>
          <Combobox.Input />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option disabled value="bob">
              bob
            </Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      let options = getComboboxOptions()

      // We should not be able to focus the first option
      await focus(options[1])
      assertNoActiveComboboxOption()
    })
  )
})
