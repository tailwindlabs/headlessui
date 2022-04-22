import React, { createElement, useState, useEffect } from 'react'
import { render } from '@testing-library/react'

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
  assertComboboxList,
  assertComboboxButton,
  assertComboboxButtonLinkedWithCombobox,
  assertComboboxButtonLinkedWithComboboxLabel,
  assertComboboxOption,
  assertComboboxLabel,
  assertComboboxLabelLinkedWithCombobox,
  assertNoActiveComboboxOption,
  assertNoSelectedComboboxOption,
  getComboboxInput,
  getComboboxButton,
  getComboboxButtons,
  getComboboxInputs,
  getComboboxOptions,
  getComboboxLabel,
  ComboboxState,
  getByText,
  getComboboxes,
  assertCombobox,
  ComboboxMode,
  assertNotActiveComboboxOption,
} from '../../test-utils/accessibility-assertions'
import { Transition } from '../transitions/transition'

let NOOP = () => {}

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
      // @ts-expect-error This is fine
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Combobox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Combobox without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Combobox', () => {
    it(
      'should be possible to render a Combobox using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            {({ open }) => (
              <>
                <Combobox.Input onChange={NOOP} />
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
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to disable a Combobox',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value={undefined} onChange={console.log} disabled>
            <Combobox.Input onChange={NOOP} />
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
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await press(Keys.Enter, getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      })
    )
  })

  describe('Combobox.Input', () => {
    it(
      'selecting an option puts the value into Combobox.Input when displayValue is not provided',
      suppressConsoleLogs(async () => {
        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <Combobox value={value} onChange={setValue}>
              <Combobox.Input onChange={NOOP} />
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

        await click(getComboboxButton())

        assertComboboxList({ state: ComboboxState.Visible })

        await click(getComboboxOptions()[1])

        expect(getComboboxInput()).toHaveValue('b')
      })
    )

    it(
      'selecting an option puts the display value into Combobox.Input when displayValue is provided',
      suppressConsoleLogs(async () => {
        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <Combobox value={value} onChange={setValue}>
              <Combobox.Input
                onChange={NOOP}
                displayValue={(str?: string) => str?.toUpperCase() ?? ''}
              />
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

        await click(getComboboxButton())

        assertComboboxList({ state: ComboboxState.Visible })

        await click(getComboboxOptions()[1])

        expect(getComboboxInput()).toHaveValue('B')
      })
    )
  })

  describe('Combobox.Label', () => {
    it(
      'should be possible to render a Combobox.Label using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            <Combobox.Label>{JSON.stringify}</Combobox.Label>
            <Combobox.Input onChange={NOOP} />
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
          attributes: { id: 'headlessui-combobox-button-3' },
        })
        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertComboboxList({ state: ComboboxState.Visible })
        assertComboboxLabelLinkedWithCombobox()
        assertComboboxButtonLinkedWithComboboxLabel()
      })
    )

    it(
      'should be possible to render a Combobox.Label using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            <Combobox.Label as="p">{JSON.stringify}</Combobox.Label>
            <Combobox.Input onChange={NOOP} />
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
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())
        assertComboboxLabel({
          attributes: { id: 'headlessui-combobox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
          tag: 'p',
        })
        assertComboboxList({ state: ComboboxState.Visible })
      })
    )
  })

  describe('Combobox.Button', () => {
    it(
      'should be possible to render a Combobox.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
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
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertComboboxList({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to render a Combobox.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
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
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertComboboxList({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to render a Combobox.Button and a Combobox.Label and see them linked together',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            <Combobox.Label>Label</Combobox.Label>
            <Combobox.Input onChange={NOOP} />
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
          attributes: { id: 'headlessui-combobox-button-3' },
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        assertComboboxButtonLinkedWithComboboxLabel()
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
            <Combobox.Button>Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
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
            <Combobox.Input onChange={NOOP} />
            <Combobox.Button as={CustomButton}>Trigger</Combobox.Button>
          </Combobox>
        )

        expect(getComboboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Combobox value={null} onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
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
            <Combobox.Input onChange={NOOP} />
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
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              {(data) => (
                <>
                  <Combobox.Option value="a">{JSON.stringify(data)}</Combobox.Option>
                </>
              )}
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({
          state: ComboboxState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
        assertActiveElement(getComboboxInput())
      })
    )

    it('should be possible to always render the Combobox.Options if we provide it a `static` prop', () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options static>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Let's verify that the Combobox is already there
      expect(getComboboxInput()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Combobox.Options', async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options unmount={false}>
            <Combobox.Option value="a">Option A</Combobox.Option>
            <Combobox.Option value="b">Option B</Combobox.Option>
            <Combobox.Option value="c">Option C</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      assertComboboxList({ state: ComboboxState.InvisibleHidden })

      // Let's open the Combobox, to see if it is not hidden anymore
      await click(getComboboxButton())

      assertComboboxList({ state: ComboboxState.Visible })
    })
  })

  describe('Combobox.Option', () => {
    it(
      'should be possible to render a Combobox.Option using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="a">{JSON.stringify}</Combobox.Option>
            </Combobox.Options>
          </Combobox>
        )

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertComboboxList({
          state: ComboboxState.Visible,
          textContent: JSON.stringify({ active: true, selected: false, disabled: false }),
        })
      })
    )
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    function Example({ hide = false }) {
      return (
        <>
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
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

    assertComboboxList({ state: ComboboxState.Visible })

    let options = getComboboxOptions()

    // Verify that the first combobox option is active
    assertActiveComboboxOption(options[0])

    await press(Keys.ArrowDown)

    // Verify that the second combobox option is active
    assertActiveComboboxOption(options[1])

    await press(Keys.ArrowDown)

    // Verify that the third combobox option is active
    assertActiveComboboxOption(options[2])
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka className can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="a" className={(bag) => JSON.stringify(bag)}>
              Option A
            </Combobox.Option>
            <Combobox.Option value="b" disabled className={(bag) => JSON.stringify(bag)}>
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
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Open Combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      // Verify that the first combobox option is active
      assertActiveComboboxOption(options[0])

      // Verify correct classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: true, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Open Combobox
      await click(getComboboxButton())

      // Verify options are buttons now
      getComboboxOptions().forEach((option) => assertComboboxOption(option, { tag: 'button' }))
    })
  )

  it(
    'should mark all the elements between Combobox.Options and Combobox.Option with role none',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button />
          <div className="outer">
            <Combobox.Options>
              <div className="inner py-1">
                <Combobox.Option value="a">Option A</Combobox.Option>
                <Combobox.Option value="b">Option B</Combobox.Option>
              </div>
              <div className="inner py-1">
                <Combobox.Option value="c">Option C</Combobox.Option>
                <Combobox.Option value="d">
                  <div>
                    <div className="outer">Option D</div>
                  </div>
                </Combobox.Option>
              </div>
              <div className="inner py-1">
                <form className="inner">
                  <Combobox.Option value="e">Option E</Combobox.Option>
                </form>
              </div>
            </Combobox.Options>
          </div>
        </Combobox>
      )

      // Open combobox
      await click(getComboboxButton())

      expect.hasAssertions()

      document.querySelectorAll('.outer').forEach((element) => {
        expect(element).not.toHaveAttribute('role', 'none')
      })

      document.querySelectorAll('.inner').forEach((element) => {
        expect(element).toHaveAttribute('role', 'none')
      })
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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Debug name="Combobox" fn={orderFn} />
          <Transition>
            <Debug name="Transition" fn={orderFn} />
            <Combobox.Options>
              <Combobox.Option value="a">
                {(data) => (
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
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      await click(getComboboxButton())

      assertComboboxButton({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({
        state: ComboboxState.Visible,
        textContent: JSON.stringify({ active: true, selected: false, disabled: false }),
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
  describe('Button', () => {
    describe('`Enter` key', () => {
      it(
        'should be possible to open the combobox with Enter',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Enter)

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option, { selected: false }))

          assertActiveComboboxOption(options[0])
          assertNoSelectedComboboxOption()
        })
      )

      it(
        'should not be possible to open the combobox with Enter when the button is disabled',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log} disabled>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Try to focus the button
          await focus(getComboboxButton())

          // Try to open the combobox
          await press(Keys.Enter)

          // Verify it is still closed
          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        })
      )

      it(
        'should be possible to open the combobox with Enter, and focus the selected option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Enter)

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleHidden })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Enter)

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                {myOptions.map((myOption) => (
                  <Combobox.Option key={myOption.id} value={myOption}>
                    {myOption.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox>
          )

          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Enter)

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options />
            </Combobox>
          )

          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Enter)

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())

          assertComboboxList({ state: ComboboxState.Visible })
          assertActiveElement(getComboboxInput())

          assertNoActiveComboboxOption()
        })
      )
    })

    describe('`Space` key', () => {
      it(
        'should be possible to open the combobox with Space',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Space)

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should not be possible to open the combobox with Space when the button is disabled',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log} disabled>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Try to open the combobox
          await press(Keys.Space)

          // Verify it is still closed
          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        })
      )

      it(
        'should be possible to open the combobox with Space, and focus the selected option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({
            state: ComboboxState.InvisibleUnmounted,
          })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Space)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options />
            </Combobox>
          )

          assertComboboxList({
            state: ComboboxState.InvisibleUnmounted,
          })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Space)
          assertComboboxList({ state: ComboboxState.Visible })
          assertActiveElement(getComboboxInput())

          assertNoActiveComboboxOption()
        })
      )

      it(
        'should have no active combobox option upon Space key press, when there are no non-disabled combobox options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({
            state: ComboboxState.InvisibleUnmounted,
          })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.Space)

          assertNoActiveComboboxOption()
        })
      )
    })

    describe('`Escape` key', () => {
      it(
        'should be possible to close an open combobox with Escape',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Re-focus the button
          await focus(getComboboxButton())
          assertActiveElement(getComboboxButton())

          // Close combobox
          await press(Keys.Escape)

          // Verify it is closed
          assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Verify the input is focused again
          assertActiveElement(getComboboxInput())
        })
      )
    })

    describe('`ArrowDown` key', () => {
      it(
        'should be possible to open the combobox with ArrowDown',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowDown)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))

          // Verify that the first combobox option is active
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should not be possible to open the combobox with ArrowDown when the button is disabled',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log} disabled>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Try to open the combobox
          await press(Keys.ArrowDown)

          // Verify it is still closed
          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        })
      )

      it(
        'should be possible to open the combobox with ArrowDown, and focus the selected option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowDown)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options />
            </Combobox>
          )

          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowDown)
          assertComboboxList({ state: ComboboxState.Visible })
          assertActiveElement(getComboboxInput())

          assertNoActiveComboboxOption()
        })
      )
    })

    describe('`ArrowUp` key', () => {
      it(
        'should be possible to open the combobox with ArrowUp and the last option should be active',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))

          // ! ALERT: The LAST option should now be active
          assertActiveComboboxOption(options[2])
        })
      )

      it(
        'should not be possible to open the combobox with ArrowUp and the last option should be active when the button is disabled',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log} disabled>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Try to open the combobox
          await press(Keys.ArrowUp)

          // Verify it is still closed
          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        })
      )

      it(
        'should be possible to open the combobox with ArrowUp, and focus the selected option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options />
            </Combobox>
          )

          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowUp)
          assertComboboxList({ state: ComboboxState.Visible })
          assertActiveElement(getComboboxInput())

          assertNoActiveComboboxOption()
        })
      )

      it(
        'should be possible to use ArrowUp to navigate the combobox options and jump to the first non-disabled one',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the button
          await focus(getComboboxButton())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
          assertActiveComboboxOption(options[0])
        })
      )
    })
  })

  describe('`Backspace` key', () => {
    it(
      'should reset the value when the last character is removed, when in `nullable` mode',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()
        function Example() {
          let [value, setValue] = useState<string>('bob')
          let [, setQuery] = useState<string>('')

          return (
            <Combobox
              value={value}
              onChange={(value) => {
                setValue(value)
                handleChange(value)
              }}
              nullable
            >
              <Combobox.Input onChange={(event) => setQuery(event.target.value)} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="alice">Alice</Combobox.Option>
                <Combobox.Option value="bob">Bob</Combobox.Option>
                <Combobox.Option value="charlie">Charlie</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )
        }

        render(<Example />)

        // Open combobox
        await click(getComboboxButton())

        let options: ReturnType<typeof getComboboxOptions>

        // Bob should be active
        options = getComboboxOptions()
        expect(getComboboxInput()).toHaveValue('bob')
        assertActiveComboboxOption(options[1])

        assertActiveElement(getComboboxInput())

        // Delete a character
        await press(Keys.Backspace)
        expect(getComboboxInput()?.value).toBe('bo')
        assertActiveComboboxOption(options[1])

        // Delete a character
        await press(Keys.Backspace)
        expect(getComboboxInput()?.value).toBe('b')
        assertActiveComboboxOption(options[1])

        // Delete a character
        await press(Keys.Backspace)
        expect(getComboboxInput()?.value).toBe('')

        // Verify that we don't have an active option anymore since we are in `nullable` mode
        assertNotActiveComboboxOption(options[1])
        assertNoActiveComboboxOption()

        // Verify that we saw the `null` change coming in
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith(null)
      })
    )
  })

  describe('Input', () => {
    describe('`Enter` key', () => {
      it(
        'should be possible to close the combobox with Enter and choose the active combobox option',
        suppressConsoleLogs(async () => {
          let handleChange = jest.fn()

          function Example() {
            let [value, setValue] = useState<string | undefined>(undefined)

            return (
              <Combobox
                value={value}
                onChange={(value) => {
                  setValue(value)
                  handleChange(value)
                }}
              >
                <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Verify we got the change event
          expect(handleChange).toHaveBeenCalledTimes(1)
          expect(handleChange).toHaveBeenCalledWith('a')

          // Verify the button is focused again
          assertActiveElement(getComboboxInput())

          // Open combobox again
          await click(getComboboxButton())

          // Verify the active option is the previously selected one
          assertActiveComboboxOption(getComboboxOptions()[0])
        })
      )

      it(
        'should submit the form on `Enter`',
        suppressConsoleLogs(async () => {
          let submits = jest.fn()

          function Example() {
            let [value, setValue] = useState<string>('b')

            return (
              <form
                onKeyUp={(event) => {
                  // JSDom doesn't automatically submit the form but if we can
                  // catch an `Enter` event, we can assume it was a submit.
                  if (event.key === 'Enter') event.currentTarget.submit()
                }}
                onSubmit={(event) => {
                  event.preventDefault()
                  submits([...new FormData(event.currentTarget).entries()])
                }}
              >
                <Combobox value={value} onChange={setValue} name="option">
                  <Combobox.Input onChange={NOOP} />
                  <Combobox.Button>Trigger</Combobox.Button>
                  <Combobox.Options>
                    <Combobox.Option value="a">Option A</Combobox.Option>
                    <Combobox.Option value="b">Option B</Combobox.Option>
                    <Combobox.Option value="c">Option C</Combobox.Option>
                  </Combobox.Options>
                </Combobox>

                <button>Submit</button>
              </form>
            )
          }

          render(<Example />)

          // Focus the input field
          await focus(getComboboxInput())
          assertActiveElement(getComboboxInput())

          // Press enter (which should submit the form)
          await press(Keys.Enter)

          // Verify the form was submitted
          expect(submits).toHaveBeenCalledTimes(1)
          expect(submits).toHaveBeenCalledWith([['option', 'b']])
        })
      )
    })

    describe('`Tab` key', () => {
      it(
        'pressing Tab should select the active item and move to the next DOM node',
        suppressConsoleLogs(async () => {
          function Example() {
            let [value, setValue] = useState<string | undefined>(undefined)

            return (
              <>
                <input id="before-combobox" />
                <Combobox value={value} onChange={setValue}>
                  <Combobox.Input onChange={NOOP} />
                  <Combobox.Button>Trigger</Combobox.Button>
                  <Combobox.Options>
                    <Combobox.Option value="a">Option A</Combobox.Option>
                    <Combobox.Option value="b">Option B</Combobox.Option>
                    <Combobox.Option value="c">Option C</Combobox.Option>
                  </Combobox.Options>
                </Combobox>
                <input id="after-combobox" />
              </>
            )
          }

          render(<Example />)

          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          // Select the 2nd option
          await press(Keys.ArrowDown)

          // Tab to the next DOM node
          await press(Keys.Tab)

          // Verify it is closed
          assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // That the selected value was the highlighted one
          expect(getComboboxInput()?.value).toBe('b')

          // And focus has moved to the next element
          assertActiveElement(document.querySelector('#after-combobox'))
        })
      )

      it(
        'pressing Shift+Tab should select the active item and move to the previous DOM node',
        suppressConsoleLogs(async () => {
          function Example() {
            let [value, setValue] = useState<string | undefined>(undefined)

            return (
              <>
                <input id="before-combobox" />
                <Combobox value={value} onChange={setValue}>
                  <Combobox.Input onChange={NOOP} />
                  <Combobox.Button>Trigger</Combobox.Button>
                  <Combobox.Options>
                    <Combobox.Option value="a">Option A</Combobox.Option>
                    <Combobox.Option value="b">Option B</Combobox.Option>
                    <Combobox.Option value="c">Option C</Combobox.Option>
                  </Combobox.Options>
                </Combobox>
                <input id="after-combobox" />
              </>
            )
          }

          render(<Example />)

          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          // Select the 2nd option
          await press(Keys.ArrowDown)

          // Tab to the next DOM node
          await press(shift(Keys.Tab))

          // Verify it is closed
          assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // That the selected value was the highlighted one
          expect(getComboboxInput()?.value).toBe('b')

          // And focus has moved to the next element
          assertActiveElement(document.querySelector('#before-combobox'))
        })
      )
    })

    describe('`Escape` key', () => {
      it(
        'should be possible to close an open combobox with Escape',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Close combobox
          await press(Keys.Escape)

          // Verify it is closed
          assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Verify the button is focused again
          assertActiveElement(getComboboxInput())
        })
      )

      it(
        'should bubble escape when using `static` on Combobox.Options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options static>
                <Combobox.Option value="a">Option A</Combobox.Option>
                <Combobox.Option value="b">Option B</Combobox.Option>
                <Combobox.Option value="c">Option C</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )

          let spy = jest.fn()

          window.addEventListener(
            'keydown',
            (evt) => {
              if (evt.key === 'Escape') {
                spy()
              }
            },
            { capture: true }
          )

          window.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
              spy()
            }
          })

          // Open combobox
          await click(getComboboxButton())

          // Verify the input is focused
          assertActiveElement(getComboboxInput())

          // Close combobox
          await press(Keys.Escape)

          // Verify the input is still focused
          assertActiveElement(getComboboxInput())

          // The external event handler should've been called twice
          // Once in the capture phase and once in the bubble phase
          expect(spy).toHaveBeenCalledTimes(2)
        })
      )

      it(
        'should bubble escape when not using Combobox.Options at all',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
            </Combobox>
          )

          let spy = jest.fn()

          window.addEventListener(
            'keydown',
            (evt) => {
              if (evt.key === 'Escape') {
                spy()
              }
            },
            { capture: true }
          )

          window.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
              spy()
            }
          })

          // Open combobox
          await click(getComboboxButton())

          // Verify the input is focused
          assertActiveElement(getComboboxInput())

          // Close combobox
          await press(Keys.Escape)

          // Verify the input is still focused
          assertActiveElement(getComboboxInput())

          // The external event handler should've been called twice
          // Once in the capture phase and once in the bubble phase
          expect(spy).toHaveBeenCalledTimes(2)
        })
      )

      it(
        'should sync the input field correctly and reset it when pressing Escape',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="option-b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="option-a">Option A</Combobox.Option>
                <Combobox.Option value="option-b">Option B</Combobox.Option>
                <Combobox.Option value="option-c">Option C</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )

          // Open combobox
          await click(getComboboxButton())

          // Verify the input has the selected value
          expect(getComboboxInput()?.value).toBe('option-b')

          // Override the input by typing something
          await type(word('test'), getComboboxInput())
          expect(getComboboxInput()?.value).toBe('test')

          // Close combobox
          await press(Keys.Escape)

          // Verify the input is reset correctly
          expect(getComboboxInput()?.value).toBe('option-b')
        })
      )
    })

    describe('`ArrowDown` key', () => {
      it(
        'should be possible to open the combobox with ArrowDown',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowDown)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))

          // Verify that the first combobox option is active
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should not be possible to open the combobox with ArrowDown when the button is disabled',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log} disabled>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Try to open the combobox
          await press(Keys.ArrowDown)

          // Verify it is still closed
          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        })
      )

      it(
        'should be possible to open the combobox with ArrowDown, and focus the selected option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowDown)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options />
            </Combobox>
          )

          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowDown)
          assertComboboxList({ state: ComboboxState.Visible })
          assertActiveElement(getComboboxInput())

          assertNoActiveComboboxOption()
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the combobox options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
          assertActiveComboboxOption(options[0])

          // We should be able to go down once
          await press(Keys.ArrowDown)
          assertActiveComboboxOption(options[1])

          // We should be able to go down again
          await press(Keys.ArrowDown)
          assertActiveComboboxOption(options[2])

          // We should NOT be able to go down again (because last option).
          // Current implementation won't go around.
          await press(Keys.ArrowDown)
          assertActiveComboboxOption(options[2])
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the combobox options and skip the first disabled one',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
          assertActiveComboboxOption(options[2])

          // Open combobox
          await press(Keys.ArrowDown)
          assertActiveComboboxOption(options[2])
        })
      )

      it(
        'should be possible to go to the next item if no value is set',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={null} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          let options = getComboboxOptions()

          // Verify that we are on the first option
          assertActiveComboboxOption(options[0])

          // Go down once
          await press(Keys.ArrowDown)

          // We should be on the next item
          assertActiveComboboxOption(options[1])
        })
      )
    })

    describe('`ArrowUp` key', () => {
      it(
        'should be possible to open the combobox with ArrowUp and the last option should be active',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))

          // ! ALERT: The LAST option should now be active
          assertActiveComboboxOption(options[2])
        })
      )

      it(
        'should not be possible to open the combobox with ArrowUp and the last option should be active when the button is disabled',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log} disabled>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Try to open the combobox
          await press(Keys.ArrowUp)

          // Verify it is still closed
          assertComboboxButton({
            state: ComboboxState.InvisibleUnmounted,
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
        })
      )

      it(
        'should be possible to open the combobox with ArrowUp, and focus the selected option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="b" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options />
            </Combobox>
          )

          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowUp)
          assertComboboxList({ state: ComboboxState.Visible })
          assertActiveElement(getComboboxInput())

          assertNoActiveComboboxOption()
        })
      )

      it(
        'should be possible to use ArrowUp to navigate the combobox options and jump to the first non-disabled one',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should not be possible to navigate up or down if there is only a single non-disabled option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            attributes: { id: 'headlessui-combobox-button-2' },
          })
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Open combobox
          await click(getComboboxButton())

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
          assertActiveComboboxOption(options[2])

          // Going up or down should select the single available option
          await press(Keys.ArrowUp)

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
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
          assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

          // Focus the input
          await focus(getComboboxInput())

          // Open combobox
          await press(Keys.ArrowUp)

          // Verify it is visible
          assertComboboxButton({ state: ComboboxState.Visible })
          assertComboboxList({
            state: ComboboxState.Visible,
            attributes: { id: 'headlessui-combobox-options-3' },
          })
          assertActiveElement(getComboboxInput())
          assertComboboxButtonLinkedWithCombobox()

          // Verify we have combobox options
          let options = getComboboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option) => assertComboboxOption(option))
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

    describe('`End` key', () => {
      it(
        'should be possible to use the End key to go to the last combobox option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We should be on the first non-disabled option
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          // Open combobox
          await click(getComboboxButton())

          let options = getComboboxOptions()

          // We should be on the first non-disabled option
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We should be on the first non-disabled option
          assertActiveComboboxOption(options[0])

          // We should not be able to go to the end (no-op)
          await press(Keys.End)

          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should have no active combobox option upon End key press, when there are no non-disabled combobox options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          // Open combobox
          await click(getComboboxButton())

          // Open combobox
          await press(Keys.Space)

          let options = getComboboxOptions()

          // We should be on the first non-disabled option
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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We should be on the first non-disabled option
          assertActiveComboboxOption(options[0])

          // We should not be able to go to the end
          await press(Keys.PageDown)

          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should have no active combobox option upon PageDown key press, when there are no non-disabled combobox options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="a">Option A</Combobox.Option>
                <Combobox.Option value="b">Option B</Combobox.Option>
                <Combobox.Option value="c">Option C</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )

          // Focus the input
          await focus(getComboboxInput())

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
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We should be on the first non-disabled option
          assertActiveComboboxOption(options[2])

          // We should not be able to go to the end
          await press(Keys.Home)

          // We should be on the first non-disabled option
          assertActiveComboboxOption(options[2])
        })
      )

      it(
        'should be possible to use the Home key to go to the last combobox option if that is the only non-disabled combobox option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We should be on the last option
          assertActiveComboboxOption(options[3])

          // We should not be able to go to the end
          await press(Keys.Home)

          assertActiveComboboxOption(options[3])
        })
      )

      it(
        'should have no active combobox option upon Home key press, when there are no non-disabled combobox options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
            <Combobox value={undefined} onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="a">Option A</Combobox.Option>
                <Combobox.Option value="b">Option B</Combobox.Option>
                <Combobox.Option value="c">Option C</Combobox.Option>
              </Combobox.Options>
            </Combobox>
          )

          // Focus the input
          await focus(getComboboxInput())

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
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We opened via click, we default to the first non-disabled option
          assertActiveComboboxOption(options[2])

          // We should not be able to go to the end (no-op — already there)
          await press(Keys.PageUp)

          assertActiveComboboxOption(options[2])
        })
      )

      it(
        'should be possible to use the PageUp key to go to the last combobox option if that is the only non-disabled combobox option',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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

          let options = getComboboxOptions()

          // We opened via click, we default to the first non-disabled option
          assertActiveComboboxOption(options[3])

          // We should not be able to go to the end (no-op — already there)
          await press(Keys.PageUp)

          assertActiveComboboxOption(options[3])
        })
      )

      it(
        'should have no active combobox option upon PageUp key press, when there are no non-disabled combobox options',
        suppressConsoleLogs(async () => {
          render(
            <Combobox value="test" onChange={console.log}>
              <Combobox.Input onChange={NOOP} />
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
      function Example(props: { people: { value: string; name: string; disabled: boolean }[] }) {
        let [value, setValue] = useState<string | undefined>(undefined)
        let [query, setQuery] = useState<string>('')
        let filteredPeople =
          query === ''
            ? props.people
            : props.people.filter((person) =>
                person.name.toLowerCase().includes(query.toLowerCase())
              )

        return (
          <Combobox value={value} onChange={setValue}>
            <Combobox.Input onChange={(event) => setQuery(event.target.value)} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              {filteredPeople.map((person) => (
                <Combobox.Option key={person.value} value={person.value} disabled={person.disabled}>
                  {person.name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        )
      }

      it(
        'should be possible to type a full word that has a perfect match',
        suppressConsoleLogs(async () => {
          render(
            <Example
              people={[
                { value: 'alice', name: 'alice', disabled: false },
                { value: 'bob', name: 'bob', disabled: false },
                { value: 'charlie', name: 'charlie', disabled: false },
              ]}
            />
          )

          // Open combobox
          await click(getComboboxButton())

          // Verify we moved focus to the input field
          assertActiveElement(getComboboxInput())
          let options: ReturnType<typeof getComboboxOptions>

          // We should be able to go to the second option
          await type(word('bob'))
          await press(Keys.Home)

          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('bob')
          assertActiveComboboxOption(options[0])

          // We should be able to go to the first option
          await type(word('alice'))
          await press(Keys.Home)

          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('alice')
          assertActiveComboboxOption(options[0])

          // We should be able to go to the last option
          await type(word('charlie'))
          await press(Keys.Home)

          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('charlie')
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should be possible to type a partial of a word',
        suppressConsoleLogs(async () => {
          render(
            <Example
              people={[
                { value: 'alice', name: 'alice', disabled: false },
                { value: 'bob', name: 'bob', disabled: false },
                { value: 'charlie', name: 'charlie', disabled: false },
              ]}
            />
          )

          // Open combobox
          await click(getComboboxButton())

          let options: ReturnType<typeof getComboboxOptions>

          // We should be able to go to the second option
          await type(word('bo'))
          await press(Keys.Home)
          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('bob')
          assertActiveComboboxOption(options[0])

          // We should be able to go to the first option
          await type(word('ali'))
          await press(Keys.Home)
          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('alice')
          assertActiveComboboxOption(options[0])

          // We should be able to go to the last option
          await type(word('char'))
          await press(Keys.Home)
          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('charlie')
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should be possible to type words with spaces',
        suppressConsoleLogs(async () => {
          render(
            <Example
              people={[
                { value: 'alice', name: 'alice jones', disabled: false },
                { value: 'bob', name: 'bob the builder', disabled: false },
                { value: 'charlie', name: 'charlie bit me', disabled: false },
              ]}
            />
          )

          // Open combobox
          await click(getComboboxButton())

          let options: ReturnType<typeof getComboboxOptions>

          // We should be able to go to the second option
          await type(word('bob t'))
          await press(Keys.Home)
          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('bob the builder')
          assertActiveComboboxOption(options[0])

          // We should be able to go to the first option
          await type(word('alice j'))
          await press(Keys.Home)
          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('alice jones')
          assertActiveComboboxOption(options[0])

          // We should be able to go to the last option
          await type(word('charlie b'))
          await press(Keys.Home)
          options = getComboboxOptions()
          expect(options).toHaveLength(1)
          expect(options[0]).toHaveTextContent('charlie bit me')
          assertActiveComboboxOption(options[0])
        })
      )

      it(
        'should not be possible to search and activate a disabled option',
        suppressConsoleLogs(async () => {
          render(
            <Example
              people={[
                { value: 'alice', name: 'alice', disabled: false },
                { value: 'bob', name: 'bob', disabled: true },
                { value: 'charlie', name: 'charlie', disabled: false },
              ]}
            />
          )

          // Open combobox
          await click(getComboboxButton())

          // We should not be able to go to the disabled option
          await type(word('bo'))
          await press(Keys.Home)

          assertNoActiveComboboxOption()
          assertNoSelectedComboboxOption()
        })
      )

      it(
        'should maintain activeIndex and activeOption when filtering',
        suppressConsoleLogs(async () => {
          render(
            <Example
              people={[
                { value: 'a', name: 'person a', disabled: false },
                { value: 'b', name: 'person b', disabled: false },
                { value: 'c', name: 'person c', disabled: false },
              ]}
            />
          )

          // Open combobox
          await click(getComboboxButton())

          let options: ReturnType<typeof getComboboxOptions>

          await press(Keys.ArrowDown)

          // Person B should be active
          options = getComboboxOptions()
          expect(options[1]).toHaveTextContent('person b')
          assertActiveComboboxOption(options[1])

          // Filter more, remove `person a`
          await type(word('person b'))
          options = getComboboxOptions()
          expect(options[0]).toHaveTextContent('person b')
          assertActiveComboboxOption(options[0])

          // Filter less, insert `person a` before `person b`
          await type(word('person'))
          options = getComboboxOptions()
          expect(options[1]).toHaveTextContent('person b')
          assertActiveComboboxOption(options[1])
        })
      )
    })
  })
})

describe('Mouse interactions', () => {
  it(
    'should focus the Combobox.Input when we click the Combobox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Label>Label</Combobox.Label>
          <Combobox.Input onChange={NOOP} />
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
      assertActiveElement(getComboboxInput())
    })
  )

  it(
    'should not focus the Combobox.Input when we right click the Combobox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Label>Label</Combobox.Label>
          <Combobox.Input onChange={NOOP} />
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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Open combobox
      await click(getComboboxButton())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })
      assertComboboxList({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-options-3' },
      })
      assertActiveElement(getComboboxInput())
      assertComboboxButtonLinkedWithCombobox()

      // Verify we have combobox options
      let options = getComboboxOptions()
      expect(options).toHaveLength(3)
      options.forEach((option) => assertComboboxOption(option))
    })
  )

  it(
    'should not be possible to open the combobox on right click',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

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
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Try to open the combobox
      await click(getComboboxButton())

      // Verify it is still closed
      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to open the combobox on click, and focus the selected option',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="b" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Open combobox
      await click(getComboboxButton())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })
      assertComboboxList({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-options-3' },
      })
      assertActiveElement(getComboboxInput())
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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be a no-op when we click outside of a closed combobox',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

      // Verify that the window is closed
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Click something that is not related to the combobox
      await click(document.body)

      // Should still be closed
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  // TODO: JSDOM doesn't quite work here
  // Clicking outside on the body should fire a mousedown (which it does) and then change the active element (which it doesn't)
  xit(
    'should be possible to click outside of the combobox which should close the combobox',
    suppressConsoleLogs(async () => {
      render(
        <>
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>
          <div tabIndex={-1} data-test-focusable>
            after
          </div>
        </>
      )

      // Open combobox
      await click(getComboboxButton())
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      // Click something that is not related to the combobox
      await click(getByText('after'))

      // Should be closed now
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('after'))
    })
  )

  it(
    'should be possible to click outside of the combobox on another combobox button which should close the current combobox and open the new combobox',
    suppressConsoleLogs(async () => {
      render(
        <div>
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Options>
              <Combobox.Option value="alice">alice</Combobox.Option>
              <Combobox.Option value="bob">bob</Combobox.Option>
              <Combobox.Option value="charlie">charlie</Combobox.Option>
            </Combobox.Options>
          </Combobox>

          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} />
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

      // Verify that the first input is focused
      assertActiveElement(getComboboxInputs()[0])

      // Click the second combobox button
      await click(button2)

      expect(getComboboxes()).toHaveLength(1) // Only 1 combobox should be visible

      // Verify that the first input is focused
      assertActiveElement(getComboboxInputs()[1])
    })
  )

  it(
    'should be possible to click outside of the combobox which should close the combobox (even if we press the combobox button)',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      // Click the combobox button again
      await click(getComboboxButton())

      // Should be closed now
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Verify the input is focused again
      assertActiveElement(getComboboxInput())
    })
  )

  it(
    'should be possible to click outside of the combobox, on an element which is within a focusable element, which closes the combobox',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(
        <div>
          <Combobox value="test" onChange={console.log}>
            <Combobox.Input onChange={NOOP} onFocus={focusFn} />
            <Combobox.Button>Trigger</Combobox.Button>
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
      assertComboboxList({ state: ComboboxState.Visible })

      // Click the span inside the button
      await click(getByText('Next'))

      // Ensure the combobox is closed
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
    'should be possible to hover an option and make it active when using `static`',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options static>
            <Combobox.Option value="alice">alice</Combobox.Option>
            <Combobox.Option value="bob">bob</Combobox.Option>
            <Combobox.Option value="charlie">charlie</Combobox.Option>
          </Combobox.Options>
        </Combobox>
      )

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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertNotActiveComboboxOption(options[1])
    })
  )

  it(
    'should not be possible to hover an option that is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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

      // We should not have option 1 as the active option now
      assertNotActiveComboboxOption(options[1])
    })
  )

  it(
    'should be possible to mouse leave an option and make it inactive',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="bob" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertNotActiveComboboxOption(options[1])

      await mouseLeave(options[1])
      assertNotActiveComboboxOption(options[1])
    })
  )

  it(
    'should be possible to click a combobox option, which closes the combobox',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      function Example() {
        let [value, setValue] = useState<string | undefined>(undefined)

        return (
          <Combobox
            value={value}
            onChange={(value) => {
              setValue(value)
              handleChange(value)
            }}
          >
            <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      let options = getComboboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('bob')

      // Verify the input is focused again
      assertActiveElement(getComboboxInput())

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
        let [value, setValue] = useState<string | undefined>(undefined)

        return (
          <Combobox
            value={value}
            onChange={(value) => {
              setValue(value)
              handleChange(value)
            }}
          >
            <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      let options = getComboboxOptions()

      // We should not be able to click the disabled option
      await click(options[1])
      assertComboboxList({ state: ComboboxState.Visible })
      assertNotActiveComboboxOption(options[1])
      assertActiveElement(getComboboxInput())
      expect(handleChange).toHaveBeenCalledTimes(0)

      // Close the combobox
      await click(getComboboxButton())

      // Open combobox again
      await click(getComboboxButton())

      options = getComboboxOptions()

      // Verify the active option is not the disabled one
      assertNotActiveComboboxOption(options[1])
    })
  )

  it(
    'should be possible focus a combobox option, so that it becomes active',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string | undefined>(undefined)

        return (
          <Combobox value={value} onChange={setValue}>
            <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      let options = getComboboxOptions()

      // Verify that the first item is active
      assertActiveComboboxOption(options[0])

      // We should be able to focus the second option
      await focus(options[1])
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should not be possible to focus a combobox option which is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
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
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      let options = getComboboxOptions()

      // We should not be able to focus the first option
      await focus(options[1])
      assertNotActiveComboboxOption(options[1])
    })
  )

  it(
    'should be possible to hold the last active option',
    suppressConsoleLogs(async () => {
      render(
        <Combobox value="test" onChange={console.log}>
          <Combobox.Input onChange={NOOP} />
          <Combobox.Button>Trigger</Combobox.Button>
          <Combobox.Options hold>
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
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      await click(getComboboxButton())

      assertComboboxButton({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.Visible })

      let options = getComboboxOptions()

      // Hover the first item
      await mouseMove(options[0])

      // Verify that the first combobox option is active
      assertActiveComboboxOption(options[0])

      // Focus the second item
      await mouseMove(options[1])

      // Verify that the second combobox option is active
      assertActiveComboboxOption(options[1])

      // Move the mouse off of the second combobox option
      await mouseLeave(options[1])
      await mouseMove(document.body)

      // Verify that the second combobox option is still active
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should sync the input field correctly and reset it when resetting the value from outside',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string | null>('bob')

        return (
          <>
            <Combobox value={value} onChange={setValue}>
              <Combobox.Input onChange={NOOP} />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                <Combobox.Option value="alice">alice</Combobox.Option>
                <Combobox.Option value="bob">bob</Combobox.Option>
                <Combobox.Option value="charlie">charlie</Combobox.Option>
              </Combobox.Options>
            </Combobox>
            <button onClick={() => setValue(null)}>reset</button>
          </>
        )
      }

      render(<Example />)

      // Open combobox
      await click(getComboboxButton())

      // Verify the input has the selected value
      expect(getComboboxInput()?.value).toBe('bob')

      // Override the input by typing something
      await type(word('test'), getComboboxInput())
      expect(getComboboxInput()?.value).toBe('test')

      // Reset from outside
      await click(getByText('reset'))

      // Verify the input is reset correctly
      expect(getComboboxInput()?.value).toBe('')
    })
  )

  it(
    'should sync the input field correctly and reset it when resetting the value from outside (when using displayValue)',
    suppressConsoleLogs(async () => {
      let people = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]

      function Example() {
        let [value, setValue] = useState<typeof people[number] | null>(people[1])

        return (
          <>
            <Combobox value={value} onChange={setValue}>
              <Combobox.Input
                onChange={NOOP}
                displayValue={(person: typeof people[number]) => person?.name}
              />
              <Combobox.Button>Trigger</Combobox.Button>
              <Combobox.Options>
                {people.map((person) => (
                  <Combobox.Option key={person.id} value={person}>
                    {person.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox>
            <button onClick={() => setValue(null)}>reset</button>
          </>
        )
      }

      render(<Example />)

      // Open combobox
      await click(getComboboxButton())

      // Verify the input has the selected value
      expect(getComboboxInput()?.value).toBe('Bob')

      // Override the input by typing something
      await type(word('test'), getComboboxInput())
      expect(getComboboxInput()?.value).toBe('test')

      // Reset from outside
      await click(getByText('reset'))

      // Verify the input is reset correctly
      expect(getComboboxInput()?.value).toBe('')
    })
  )
})

describe('Multi-select', () => {
  it(
    'should be possible to pass multiple values to the Combobox component',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Combobox value={value} onChange={setValue} multiple>
            <Combobox.Input onChange={() => {}} />
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

      // Verify that we have an open combobox with multiple mode
      assertCombobox({ state: ComboboxState.Visible, mode: ComboboxMode.Multiple })

      // Verify that we have multiple selected combobox options
      let options = getComboboxOptions()

      assertComboboxOption(options[0], { selected: false })
      assertComboboxOption(options[1], { selected: true })
      assertComboboxOption(options[2], { selected: true })
    })
  )

  it(
    'should make the first selected option the active item',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Combobox value={value} onChange={setValue} multiple>
            <Combobox.Input onChange={() => {}} />
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

      // Verify that bob is the active option
      assertActiveComboboxOption(getComboboxOptions()[1])
    })
  )

  it(
    'should keep the combobox open when selecting an item via the keyboard',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Combobox value={value} onChange={setValue} multiple>
            <Combobox.Input onChange={() => {}} />
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

      // Verify that bob is the active option
      await click(getComboboxOptions()[0])

      // Verify that the combobox is still open
      assertCombobox({ state: ComboboxState.Visible })
    })
  )

  it(
    'should toggle the selected state of an option when clicking on it',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Combobox value={value} onChange={setValue} multiple>
            <Combobox.Input onChange={() => {}} />
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

      let options = getComboboxOptions()

      assertComboboxOption(options[0], { selected: false })
      assertComboboxOption(options[1], { selected: true })
      assertComboboxOption(options[2], { selected: true })

      // Click on bob
      await click(getComboboxOptions()[1])

      assertComboboxOption(options[0], { selected: false })
      assertComboboxOption(options[1], { selected: false })
      assertComboboxOption(options[2], { selected: true })

      // Click on bob again
      await click(getComboboxOptions()[1])

      assertComboboxOption(options[0], { selected: false })
      assertComboboxOption(options[1], { selected: true })
      assertComboboxOption(options[2], { selected: true })
    })
  )
})

describe('Form compatibility', () => {
  it('should be possible to submit a form with a value', async () => {
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
          <Combobox value={value} onChange={setValue} name="delivery">
            <Combobox.Input onChange={console.log} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Label>Pizza Delivery</Combobox.Label>
            <Combobox.Options>
              <Combobox.Option value="pickup">Pickup</Combobox.Option>
              <Combobox.Option value="home-delivery">Home delivery</Combobox.Option>
              <Combobox.Option value="dine-in">Dine in</Combobox.Option>
            </Combobox.Options>
          </Combobox>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Open combobox
    await click(getComboboxButton())

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([]) // no data

    // Open combobox again
    await click(getComboboxButton())

    // Choose home delivery
    await click(getByText('Home delivery'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['delivery', 'home-delivery']])

    // Open combobox again
    await click(getComboboxButton())

    // Choose pickup
    await click(getByText('Pickup'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['delivery', 'pickup']])
  })

  it('should be possible to submit a form with a complex value object', async () => {
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
          <Combobox value={value} onChange={setValue} name="delivery">
            <Combobox.Input onChange={console.log} />
            <Combobox.Button>Trigger</Combobox.Button>
            <Combobox.Label>Pizza Delivery</Combobox.Label>
            <Combobox.Options>
              {options.map((option) => (
                <Combobox.Option key={option.id} value={option}>
                  {option.label}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Open combobox
    await click(getComboboxButton())

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([
      ['delivery[id]', '1'],
      ['delivery[value]', 'pickup'],
      ['delivery[label]', 'Pickup'],
      ['delivery[extra][info]', 'Some extra info'],
    ])

    // Open combobox
    await click(getComboboxButton())

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

    // Open combobox
    await click(getComboboxButton())

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
})
