import { render } from '@testing-library/react'
import React, { createElement, useEffect, useState } from 'react'
import {
  ListboxMode,
  ListboxState,
  assertActiveElement,
  assertActiveListboxOption,
  assertListbox,
  assertListboxButton,
  assertListboxButtonLinkedWithListbox,
  assertListboxButtonLinkedWithListboxLabel,
  assertListboxLabel,
  assertListboxOption,
  assertNoActiveListboxOption,
  assertNoSelectedListboxOption,
  getByText,
  getListbox,
  getListboxButton,
  getListboxButtons,
  getListboxLabel,
  getListboxOptions,
  getListboxes,
} from '../../test-utils/accessibility-assertions'
import {
  Keys,
  MouseButton,
  click,
  focus,
  mouseLeave,
  mouseMove,
  press,
  rawClick,
  shift,
  type,
  word,
} from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { Transition } from '../transition/transition'
import { Listbox } from './listbox'

jest.mock('../../hooks/use-id')

// @ts-expect-error
global.ResizeObserver = class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

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
      if (name === 'Listbox.Label') {
        // @ts-expect-error This is fine
        expect(() => render(createElement(Component))).toThrow(
          'You used a <Label /> component, but it is not inside a relevant parent.'
        )
      } else {
        // @ts-expect-error This is fine
        expect(() => render(createElement(Component))).toThrow(
          `<${name} /> is missing a parent <Listbox /> component.`
        )
      }
    })
  )

  it(
    'should be possible to render a Listbox without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Listbox', () => {
    it(
      'should be possible to render a Listbox using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to disable a Listbox',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} disabled>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await press(Keys.Enter, getListboxButton())

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should not crash in multiple mode',
      suppressConsoleLogs(async () => {
        render(
          <Listbox multiple name="abc">
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value={{ id: 1, name: 'alice' }}>alice</Listbox.Option>
              <Listbox.Option value={{ id: 2, name: 'bob' }}>bob</Listbox.Option>
              <Listbox.Option value={{ id: 3, name: 'charlie' }}>charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        await click(getListboxButton())
        let [alice, bob, charlie] = getListboxOptions()

        await click(alice)
        await click(bob)
        await click(charlie)
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
            <Listbox value={options[1]} onChange={(x) => console.log(x)}>
              <Listbox.Button>Trigger</Listbox.Button>
              <Listbox.Options>
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={(info) => JSON.stringify(info)}
                  >
                    {option.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          )

          await click(getListboxButton())

          let bob = getListboxOptions()[1]
          expect(bob).toHaveAttribute(
            'class',
            JSON.stringify({
              active: true,
              focus: true,
              selected: true,
              disabled: false,
              selectedOption: false,
            })
          )
        })
      )

      it(
        'should be possible to compare objects by a field',
        suppressConsoleLogs(async () => {
          render(
            <Listbox value={{ id: 2, name: 'Bob' }} onChange={(x) => console.log(x)} by="id">
              <Listbox.Button>Trigger</Listbox.Button>
              <Listbox.Options>
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={(info) => JSON.stringify(info)}
                  >
                    {option.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          )

          await click(getListboxButton())

          let bob = getListboxOptions()[1]
          expect(bob).toHaveAttribute(
            'class',
            JSON.stringify({
              active: true,
              focus: true,
              selected: true,
              disabled: false,
              selectedOption: false,
            })
          )
        })
      )

      it(
        'should be possible to compare objects by a comparator function',
        suppressConsoleLogs(async () => {
          render(
            <Listbox
              value={{ id: 2, name: 'Bob' }}
              onChange={(x) => console.log(x)}
              by={(a, z) => a.id === z.id}
            >
              <Listbox.Button>Trigger</Listbox.Button>
              <Listbox.Options>
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={(info) => JSON.stringify(info)}
                  >
                    {option.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          )

          await click(getListboxButton())

          let bob = getListboxOptions()[1]
          expect(bob).toHaveAttribute(
            'class',
            JSON.stringify({
              active: true,
              focus: true,
              selected: true,
              disabled: false,
              selectedOption: false,
            })
          )
        })
      )

      it(
        'should be possible to use the by prop (as a string) with a null initial value',
        suppressConsoleLogs(async () => {
          function Example() {
            let [value, setValue] = useState(null)

            return (
              <Listbox value={value} onChange={setValue} by="id">
                <Listbox.Button>Trigger</Listbox.Button>
                <Listbox.Options>
                  <Listbox.Option value={{ id: 1, name: 'alice' }}>alice</Listbox.Option>
                  <Listbox.Option value={{ id: 2, name: 'bob' }}>bob</Listbox.Option>
                  <Listbox.Option value={{ id: 3, name: 'charlie' }}>charlie</Listbox.Option>
                </Listbox.Options>
              </Listbox>
            )
          }

          render(<Example />)

          await click(getListboxButton())
          let [alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'false')
          expect(charlie).toHaveAttribute('aria-selected', 'false')

          await click(getListboxOptions()[2])
          await click(getListboxButton())
          ;[alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'false')
          expect(charlie).toHaveAttribute('aria-selected', 'true')

          await click(getListboxOptions()[1])
          await click(getListboxButton())
          ;[alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')
        })
      )

      // TODO: Does this test prove anything useful?
      it(
        'should be possible to use the by prop (as a string) with a null listbox option',
        suppressConsoleLogs(async () => {
          function Example() {
            let [value, setValue] = useState(null)

            return (
              <Listbox value={value} onChange={setValue} by="id">
                <Listbox.Button>Trigger</Listbox.Button>
                <Listbox.Options>
                  <Listbox.Option value={null} disabled>
                    Please select an option
                  </Listbox.Option>
                  <Listbox.Option value={{ id: 1, name: 'alice' }}>alice</Listbox.Option>
                  <Listbox.Option value={{ id: 2, name: 'bob' }}>bob</Listbox.Option>
                  <Listbox.Option value={{ id: 3, name: 'charlie' }}>charlie</Listbox.Option>
                </Listbox.Options>
              </Listbox>
            )
          }

          render(<Example />)

          await click(getListboxButton())
          let [disabled, alice, bob, charlie] = getListboxOptions()
          expect(disabled).toHaveAttribute('aria-selected', 'true')
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'false')
          expect(charlie).toHaveAttribute('aria-selected', 'false')

          await click(getListboxOptions()[3])
          await click(getListboxButton())
          ;[disabled, alice, bob, charlie] = getListboxOptions()
          expect(disabled).toHaveAttribute('aria-selected', 'false')
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'false')
          expect(charlie).toHaveAttribute('aria-selected', 'true')

          await click(getListboxOptions()[2])
          await click(getListboxButton())
          ;[disabled, alice, bob, charlie] = getListboxOptions()
          expect(disabled).toHaveAttribute('aria-selected', 'false')
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')
        })
      )

      it(
        'should be possible to use completely new objects while rendering (single mode)',
        suppressConsoleLogs(async () => {
          function Example() {
            let [value, setValue] = useState({ id: 2, name: 'Bob' })

            return (
              <Listbox value={value} onChange={setValue} by="id">
                <Listbox.Button>Trigger</Listbox.Button>
                <Listbox.Options>
                  <Listbox.Option value={{ id: 1, name: 'alice' }}>alice</Listbox.Option>
                  <Listbox.Option value={{ id: 2, name: 'bob' }}>bob</Listbox.Option>
                  <Listbox.Option value={{ id: 3, name: 'charlie' }}>charlie</Listbox.Option>
                </Listbox.Options>
              </Listbox>
            )
          }

          render(<Example />)

          await click(getListboxButton())
          let [alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')

          await click(getListboxOptions()[2])
          await click(getListboxButton())
          ;[alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'false')
          expect(charlie).toHaveAttribute('aria-selected', 'true')

          await click(getListboxOptions()[1])
          await click(getListboxButton())
          ;[alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')
        })
      )

      it(
        'should be possible to use completely new objects while rendering (multiple mode)',
        suppressConsoleLogs(async () => {
          function Example() {
            let [value, setValue] = useState([{ id: 2, name: 'Bob' }])

            return (
              <Listbox value={value} onChange={setValue} by="id" multiple>
                <Listbox.Button>Trigger</Listbox.Button>
                <Listbox.Options>
                  <Listbox.Option value={{ id: 1, name: 'alice' }}>alice</Listbox.Option>
                  <Listbox.Option value={{ id: 2, name: 'bob' }}>bob</Listbox.Option>
                  <Listbox.Option value={{ id: 3, name: 'charlie' }}>charlie</Listbox.Option>
                </Listbox.Options>
              </Listbox>
            )
          }

          render(<Example />)

          await click(getListboxButton())

          await click(getListboxOptions()[2])
          let [alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'true')

          await click(getListboxOptions()[2])
          ;[alice, bob, charlie] = getListboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')
        })
      )
    })

    it(
      'null should be a valid value for the Listbox',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={null} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({ state: ListboxState.Visible })
      })
    )
  })

  describe('Listbox.Label', () => {
    it(
      'should be possible to render a Listbox.Label using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Label>{(slot) => <>{JSON.stringify(slot)}</>}</Listbox.Label>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListboxLabel({
          attributes: { id: 'headlessui-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxLabel({
          attributes: { id: 'headlessui-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertListbox({ state: ListboxState.Visible })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    it(
      'should be possible to render a Listbox.Label using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Label as="p">{(slot) => <>{JSON.stringify(slot)}</>}</Listbox.Label>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxLabel({
          attributes: { id: 'headlessui-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())
        assertListboxLabel({
          attributes: { id: 'headlessui-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )
  })

  describe('Listbox.Button', () => {
    it(
      'should be possible to render a Listbox.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>{(slot) => <>{JSON.stringify(slot)}</>}</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({
            open: false,
            active: false,
            disabled: false,
            invalid: false,
            hover: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({
            open: true,
            active: true,
            disabled: false,
            invalid: false,
            hover: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to render a Listbox.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button as="div" role="button">
              {(slot) => <>{JSON.stringify(slot)}</>}
            </Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({
            open: false,
            active: false,
            disabled: false,
            invalid: false,
            hover: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({
            open: true,
            active: true,
            disabled: false,
            invalid: false,
            hover: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to render a Listbox.Button and a Listbox.Label and see them linked together',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          <Listbox value={null} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
          </Listbox>
        )

        expect(getListboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Listbox value={null} onChange={(x) => console.log(x)}>
            <Listbox.Button type="submit">Trigger</Listbox.Button>
          </Listbox>
        )

        expect(getListboxButton()).toHaveAttribute('type', 'submit')
      })

      it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
        let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
          <button ref={ref} {...props} />
        ))

        render(
          <Listbox value={null} onChange={(x) => console.log(x)}>
            <Listbox.Button as={CustomButton}>Trigger</Listbox.Button>
          </Listbox>
        )

        expect(getListboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Listbox value={null} onChange={(x) => console.log(x)}>
            <Listbox.Button as="div">Trigger</Listbox.Button>
          </Listbox>
        )

        expect(getListboxButton()).not.toHaveAttribute('type')
      })

      it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
        let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
          <div ref={ref} {...props} />
        ))

        render(
          <Listbox value={null} onChange={(x) => console.log(x)}>
            <Listbox.Button as={CustomButton}>Trigger</Listbox.Button>
          </Listbox>
        )

        expect(getListboxButton()).not.toHaveAttribute('type')
      })
    })
  })

  describe('Listbox.Options', () => {
    it(
      'should be possible to render Listbox.Options using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              {(data) => (
                <>
                  <Listbox.Option value="a">{JSON.stringify(data)}</Listbox.Option>
                </>
              )}
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
        assertActiveElement(getListbox())
      })
    )

    it('should be possible to always render the Listbox.Options if we provide it a `static` prop', () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

    it('should be possible to use a different render strategy for the Listbox.Options', async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options unmount={false}>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListbox({ state: ListboxState.InvisibleHidden })

      // Let's open the Listbox, to see if it is not hidden anymore
      await click(getListboxButton())

      assertListbox({ state: ListboxState.Visible })
    })
  })

  describe('Listbox.Option', () => {
    it(
      'should be possible to render a Listbox.Option using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">{(slot) => <>{JSON.stringify(slot)}</>}</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Visible,
          textContent: JSON.stringify({
            active: false,
            focus: false,
            selected: false,
            disabled: false,
            selectedOption: false,
          }),
        })
      })
    )
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    function Example({ hide = false }) {
      return (
        <>
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option 1</Listbox.Option>
              {!hide && <Listbox.Option value="b">Option 2</Listbox.Option>}
              <Listbox.Option value="c">Option 3</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        </>
      )
    }

    let { rerender } = render(<Example />)

    // Open the Listbox
    await click(getByText('Trigger'))

    rerender(<Example hide={true} />) // Remove Listbox.Option 2
    rerender(<Example hide={false} />) // Re-add Listbox.Option 2

    assertListbox({ state: ListboxState.Visible })

    let options = getListboxOptions()

    // Focus the first item
    await press(Keys.ArrowDown)

    // Verify that the first menu item is active
    assertActiveListboxOption(options[0])

    await press(Keys.ArrowDown)
    // Verify that the second menu item is active
    assertActiveListboxOption(options[1])

    await press(Keys.ArrowDown)
    // Verify that the third menu item is active
    assertActiveListboxOption(options[2])
  })

  describe('Uncontrolled', () => {
    it('should be possible to use in an uncontrolled way', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Listbox name="assignee">
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">Alice</Listbox.Option>
              <Listbox.Option value="bob">Bob</Listbox.Option>
              <Listbox.Option value="charlie">Charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
          <button id="submit">submit</button>
        </form>
      )

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

      // Open listbox
      await click(getListboxButton())

      // Choose charlie
      await click(getListboxOptions()[2])

      // Submit
      await click(document.getElementById('submit'))

      // Charlie should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'charlie' })
    })

    it('should expose the value via the render prop', async () => {
      let handleSubmission = jest.fn()

      let { getByTestId } = render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Listbox name="assignee">
            {({ value }) => (
              <>
                <div data-testid="value">{value}</div>
                <Listbox.Button>
                  {({ value }) => (
                    <>
                      Trigger
                      <div data-testid="value-2">{value}</div>
                    </>
                  )}
                </Listbox.Button>
                <Listbox.Options>
                  <Listbox.Option value="alice">Alice</Listbox.Option>
                  <Listbox.Option value="bob">Bob</Listbox.Option>
                  <Listbox.Option value="charlie">Charlie</Listbox.Option>
                </Listbox.Options>
              </>
            )}
          </Listbox>
          <button id="submit">submit</button>
        </form>
      )

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])
      expect(getByTestId('value')).toHaveTextContent('alice')
      expect(getByTestId('value-2')).toHaveTextContent('alice')

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

      // Open listbox
      await click(getListboxButton())

      // Choose charlie
      await click(getListboxOptions()[2])
      expect(getByTestId('value')).toHaveTextContent('charlie')
      expect(getByTestId('value-2')).toHaveTextContent('charlie')

      // Submit
      await click(document.getElementById('submit'))

      // Charlie should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'charlie' })
    })

    it('should be possible to provide a default value', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Listbox name="assignee" defaultValue="bob">
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">Alice</Listbox.Option>
              <Listbox.Option value="bob">Bob</Listbox.Option>
              <Listbox.Option value="charlie">Charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
          <button id="submit">submit</button>
        </form>
      )

      await click(document.getElementById('submit'))

      // Bob is the defaultValue
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })
    })

    it('should be possible to reset to the default value if the form is reset', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Listbox name="assignee" defaultValue="bob">
            <Listbox.Button>{({ value }) => value ?? 'Trigger'}</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">Alice</Listbox.Option>
              <Listbox.Option value="bob">Bob</Listbox.Option>
              <Listbox.Option value="charlie">Charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
          <button id="submit">submit</button>
          <button type="reset" id="reset">
            reset
          </button>
        </form>
      )

      await click(document.getElementById('submit'))

      // Bob is the defaultValue
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])

      // Reset
      await click(document.getElementById('reset'))

      // The listbox should be reset to bob
      expect(getListboxButton()).toHaveTextContent('bob')

      // Open listbox
      await click(getListboxButton())
      assertActiveListboxOption(getListboxOptions()[1])
    })

    it('should be possible to reset to the default value if the form is reset (using objects)', async () => {
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
          <Listbox name="assignee" defaultValue={{ id: 2, name: 'bob', label: 'Bob' }} by="id">
            <Listbox.Button>{({ value }) => value?.name ?? 'Trigger'}</Listbox.Button>
            <Listbox.Options>
              {data.map((person) => (
                <Listbox.Option key={person.id} value={person}>
                  {person.label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
          <button id="submit">submit</button>
          <button type="reset" id="reset">
            reset
          </button>
        </form>
      )

      await click(document.getElementById('submit'))

      // Bob is the defaultValue
      expect(handleSubmission).toHaveBeenLastCalledWith({
        'assignee[id]': '2',
        'assignee[name]': 'bob',
        'assignee[label]': 'Bob',
      })

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])

      // Reset
      await click(document.getElementById('reset'))

      // The listbox should be reset to bob
      expect(getListboxButton()).toHaveTextContent('bob')

      // Open listbox
      await click(getListboxButton())
      assertActiveListboxOption(getListboxOptions()[1])
    })

    it('should be possible to reset to the default value in multiple mode', async () => {
      let handleSubmission = jest.fn()
      let data = ['alice', 'bob', 'charlie']

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Listbox name="assignee" defaultValue={['bob'] as string[]} multiple>
            <Listbox.Button>{({ value }) => value.join(', ') || 'Trigger'}</Listbox.Button>
            <Listbox.Options>
              {data.map((person) => (
                <Listbox.Option key={person} value={person}>
                  {person}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
          <button id="submit">submit</button>
          <button type="reset" id="reset">
            reset
          </button>
        </form>
      )

      await click(document.getElementById('submit'))

      // Bob is the defaultValue
      expect(handleSubmission).toHaveBeenLastCalledWith({
        'assignee[0]': 'bob',
      })

      await click(document.getElementById('reset'))
      await click(document.getElementById('submit'))

      // Bob is still the defaultValue
      expect(handleSubmission).toHaveBeenLastCalledWith({
        'assignee[0]': 'bob',
      })
    })

    it('should still call the onChange listeners when choosing new values', async () => {
      let handleChange = jest.fn()

      render(
        <Listbox name="assignee" onChange={handleChange}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">Alice</Listbox.Option>
            <Listbox.Option value="bob">Bob</Listbox.Option>
            <Listbox.Option value="charlie">Charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])

      // Open listbox
      await click(getListboxButton())

      // Choose bob
      await click(getListboxOptions()[1])

      // Change handler should have been called twice
      expect(handleChange).toHaveBeenNthCalledWith(1, 'alice')
      expect(handleChange).toHaveBeenNthCalledWith(2, 'bob')
    })
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka className can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a" className={(bag) => JSON.stringify(bag)}>
              Option A
            </Listbox.Option>
            <Listbox.Option value="b" disabled className={(bag) => JSON.stringify(bag)}>
              Option B
            </Listbox.Option>
            <Listbox.Option value="c" className="no-special-treatment">
              Option C
            </Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open Listbox
      await click(getListboxButton())

      let options = getListboxOptions()

      // Verify correct classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({
          active: false,
          focus: false,
          selected: false,
          disabled: false,
          selectedOption: false,
        })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({
          active: false,
          focus: false,
          selected: false,
          disabled: true,
          selectedOption: false,
        })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that nothing is active
      assertNoActiveListboxOption(getListbox())

      // Make the first option active
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({
          active: true,
          focus: true,
          selected: false,
          disabled: false,
          selectedOption: false,
        })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({
          active: false,
          focus: false,
          selected: false,
          disabled: true,
          selectedOption: false,
        })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the first option is the active one
      assertActiveListboxOption(options[0])

      // Let's go down, this should go to the third option since the second option is disabled!
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({
          active: false,
          focus: false,
          selected: false,
          disabled: false,
          selectedOption: false,
        })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({
          active: false,
          focus: false,
          selected: false,
          disabled: true,
          selectedOption: false,
        })
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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open Listbox
      await click(getListboxButton())

      // Verify options are buttons now
      getListboxOptions().forEach((option) => assertListboxOption(option, { tag: 'button' }))
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
    'should be possible to wrap the Listbox.Options with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Debug name="Listbox" fn={orderFn} />
          <Transition>
            <Debug name="Transition" fn={orderFn} />
            <Listbox.Options>
              <Listbox.Option value="a">
                {(data) => (
                  <>
                    {JSON.stringify(data)}
                    <Debug name="Listbox.Option" fn={orderFn} />
                  </>
                )}
              </Listbox.Option>
            </Listbox.Options>
          </Transition>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      await rawClick(getListboxButton())

      assertListboxButton({
        state: ListboxState.Visible,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({
        state: ListboxState.Visible,
        textContent: JSON.stringify({
          active: false,
          focus: false,
          selected: false,
          disabled: false,
          selectedOption: false,
        }),
      })

      await rawClick(getListboxButton())

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Listbox'],
        ['Mounting - Transition'],
        ['Mounting - Listbox.Option'],
        ['Unmounting - Transition'],
        ['Unmounting - Listbox.Option'],
      ])
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the listbox with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option, { selected: false }))

        // Verify that the first listbox option is active
        assertActiveListboxOption(options[0])
        assertNoSelectedListboxOption()
      })
    )

    it(
      'should not be possible to open the listbox with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} disabled>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Try to open the listbox
        await press(Keys.Enter)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option (when using the `hidden` render strategy)',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options unmount={false}>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleHidden,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleHidden })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        let options = getListboxOptions()

        // Hover over Option A
        await mouseMove(options[0])

        // Verify that Option A is active
        assertActiveListboxOption(options[0])

        // Verify that Option B is still selected
        assertListboxOption(options[1], { selected: true })

        // Close/Hide the listbox
        await press(Keys.Escape)

        // Re-open the listbox
        await click(getListboxButton())

        // Verify we have listbox options
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to open the listbox with Enter, and focus the selected option (with a list of objects)',
      suppressConsoleLogs(async () => {
        let myOptions = [
          { id: 'a', name: 'Option A' },
          { id: 'b', name: 'Option B' },
          { id: 'c', name: 'Option C' },
        ]
        let selectedOption = myOptions[1]
        render(
          <Listbox value={selectedOption} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              {myOptions.map((myOption) => (
                <Listbox.Option key={myOption.id} value={myOption}>
                  {myOption.name}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should have no active listbox option upon Enter key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to close the listbox with Enter when there is no active listboxoption',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })

        // Close listbox
        await press(Keys.Enter)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getListboxButton())
      })
    )

    it(
      'should be possible to close the listbox with Enter and choose the active listbox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()

        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <Listbox
              value={value}
              onChange={(value) => {
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })

        // Activate the first listbox option
        let options = getListboxOptions()
        await mouseMove(options[0])

        // Choose option, and close listbox
        await press(Keys.Enter)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getListboxButton())

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the listbox with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} disabled>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Try to open the listbox
        await press(Keys.Space)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with Space, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Space',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled listbox option when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)

        let options = getListboxOptions()

        // Verify that the first non-disabled listbox option is active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should have no active listbox option upon Space key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to close the listbox with Space and choose the active listbox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()

        function Example() {
          let [value, setValue] = useState(undefined)

          return (
            <Listbox
              value={value}
              onChange={(value) => {
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })

        // Activate the first listbox option
        let options = getListboxOptions()
        await mouseMove(options[0])

        // Choose option, and close listbox
        await press(Keys.Space)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getListboxButton())

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Space)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Close listbox
        await press(Keys.Escape)

        // Verify it is closed
        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getListboxButton())
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should focus trap when we use Tab',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // Try to tab
        await press(Keys.Tab)

        // Verify it is still open
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())
      })
    )

    it(
      'should focus trap when we use Shift+Tab',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // Try to Shift+Tab
        await press(shift(Keys.Tab))

        // Verify it is still open
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should be possible to open the listbox with ArrowDown',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))

        // Verify that the first listbox option is active
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the listbox with ArrowDown when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} disabled>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Try to open the listbox
        await press(Keys.ArrowDown)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with ArrowDown, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowDown)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[2])
      })
    )
  })

  describe('`ArrowRight` key', () => {
    it(
      'should be possible to use ArrowRight to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} horizontal>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[0])

        // We should be able to go right once
        await press(Keys.ArrowRight)
        assertActiveListboxOption(options[1])

        // We should be able to go right again
        await press(Keys.ArrowRight)
        assertActiveListboxOption(options[2])

        // We should NOT be able to go right again (because last option). Current implementation won't go around.
        await press(Keys.ArrowRight)
        assertActiveListboxOption(options[2])
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should be possible to open the listbox with ArrowUp and the last option should be active',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))

        // ! ALERT: The LAST option should now be active
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should not be possible to open the listbox with ArrowUp and the last option should be active when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} disabled>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Try to open the listbox
        await press(Keys.ArrowUp)

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to open the listbox with ArrowUp, and focus the selected option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value="b" onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options />
          </Listbox>
        )

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)
        assertListbox({ state: ListboxState.Visible })
        assertActiveElement(getListbox())

        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the listbox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
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

  describe('`ArrowLeft` key', () => {
    it(
      'should be possible to use ArrowLeft to navigate the listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)} horizontal>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is visible
        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-options-2' },
          orientation: 'horizontal',
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        let options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option) => assertListboxOption(option))
        assertActiveListboxOption(options[2])

        // We should be able to go left once
        await press(Keys.ArrowLeft)
        assertActiveListboxOption(options[1])

        // We should be able to go left again
        await press(Keys.ArrowLeft)
        assertActiveListboxOption(options[0])

        // We should NOT be able to go left again (because first option). Current implementation won't go around.
        await press(Keys.ArrowLeft)
        assertActiveListboxOption(options[0])
      })
    )
  })

  describe('`End` key', () => {
    it(
      'should be possible to use the End key to go to the last listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon End key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.Enter)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon PageDown key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the Home key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon Home key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">Option A</Listbox.Option>
              <Listbox.Option value="b">Option B</Listbox.Option>
              <Listbox.Option value="c">Option C</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon PageUp key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">value a</Listbox.Option>
              <Listbox.Option value="b">value b</Listbox.Option>
              <Listbox.Option value="c">value c</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

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
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // We should not be able to go to the disabled option
        await type(word('bo'))

        // We should still be on the last option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to search for a word (case insensitive)',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Focus the button
        await focus(getListboxButton())

        // Open listbox
        await press(Keys.ArrowUp)

        let options = getListboxOptions()

        // We should be on the last option
        assertActiveListboxOption(options[2])

        // Search for bob in a different casing
        await type(word('BO'))

        // We should be on `bob`
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to search for the next occurence',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">alice</Listbox.Option>
              <Listbox.Option value="b">bob</Listbox.Option>
              <Listbox.Option value="c">charlie</Listbox.Option>
              <Listbox.Option value="d">bob</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        let options = getListboxOptions()

        // Search for bob
        await type(word('b'))

        // We should be on the first `bob`
        assertActiveListboxOption(options[1])

        // Search for bob again
        await type(word('b'))

        // We should be on the second `bob`
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should stay on the same item while keystrokes still match',
      suppressConsoleLogs(async () => {
        render(
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="a">alice</Listbox.Option>
              <Listbox.Option value="b">bob</Listbox.Option>
              <Listbox.Option value="c">charlie</Listbox.Option>
              <Listbox.Option value="d">bob</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        )

        // Open listbox
        await click(getListboxButton())

        let options = getListboxOptions()

        // ---

        // Reset: Go to first option
        await press(Keys.Home)

        // Search for "b" in "bob"
        await type(word('b'))

        // We should be on the first `bob`
        assertActiveListboxOption(options[1])

        // Search for "b" in "bob" again
        await type(word('b'))

        // We should be on the next `bob`
        assertActiveListboxOption(options[3])

        // ---

        // Reset: Go to first option
        await press(Keys.Home)

        // Search for "bo" in "bob"
        await type(word('bo'))

        // We should be on the first `bob`
        assertActiveListboxOption(options[1])

        // Search for "bo" in "bob" again
        await type(word('bo'))

        // We should be on the next `bob`
        assertActiveListboxOption(options[3])

        // ---

        // Reset: Go to first option
        await press(Keys.Home)

        // Search for "bob" in "bob"
        await type(word('bob'))

        // We should be on the first `bob`
        assertActiveListboxOption(options[1])

        // Search for "bob" in "bob" again
        await type(word('bob'))

        // We should be on the next `bob`
        assertActiveListboxOption(options[3])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should focus the Listbox.Button when we click the Listbox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
    'should not focus the Listbox.Button when we right click the Listbox.Label',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
      await click(getListboxLabel(), MouseButton.Right)

      // Ensure that the body is still active
      assertActiveElement(document.body)
    })
  )

  it(
    'should be possible to open the listbox on click',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open listbox
      await click(getListboxButton())

      // Verify it is visible
      assertListboxButton({ state: ListboxState.Visible })
      assertListbox({
        state: ListboxState.Visible,
        attributes: { id: 'headlessui-listbox-options-2' },
      })
      assertActiveElement(getListbox())
      assertListboxButtonLinkedWithListbox()

      // Verify we have listbox options
      let options = getListboxOptions()
      expect(options).toHaveLength(3)
      options.forEach((option) => assertListboxOption(option))
    })
  )

  it(
    'should not be possible to open the listbox on right click',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Item A</Listbox.Option>
            <Listbox.Option value="b">Item B</Listbox.Option>
            <Listbox.Option value="c">Item C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Try to open the listbox
      await click(getListboxButton(), MouseButton.Right)

      // Verify it is still closed
      assertListboxButton({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open the listbox on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)} disabled>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Try to open the listbox
      await click(getListboxButton())

      // Verify it is still closed
      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to open the listbox on click, and focus the selected option',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value="b" onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="a">Option A</Listbox.Option>
            <Listbox.Option value="b">Option B</Listbox.Option>
            <Listbox.Option value="c">Option C</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      assertListboxButton({
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open listbox
      await click(getListboxButton())

      // Verify it is visible
      assertListboxButton({ state: ListboxState.Visible })
      assertListbox({
        state: ListboxState.Visible,
        attributes: { id: 'headlessui-listbox-options-2' },
      })
      assertActiveElement(getListbox())
      assertListboxButtonLinkedWithListbox()

      // Verify we have listbox options
      let options = getListboxOptions()
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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      // Verify it is visible
      assertListboxButton({ state: ListboxState.Visible })

      // Click to close
      await click(getListboxButton())

      // Verify it is closed
      assertListboxButton({ state: ListboxState.InvisibleUnmounted })
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be a no-op when we click outside of a closed listbox',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
          <Listbox.Button>Trigger</Listbox.Button>
          <Listbox.Options>
            <Listbox.Option value="alice">alice</Listbox.Option>
            <Listbox.Option value="bob">bob</Listbox.Option>
            <Listbox.Option value="charlie">charlie</Listbox.Option>
          </Listbox.Options>
        </Listbox>
      )

      // Verify that the window is closed
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Click something that is not related to the listbox
      await click(document.body)

      // Should still be closed
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click outside of the listbox which should close the listbox',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      // Click something that is not related to the listbox
      await click(document.body)

      // Should be closed now
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getListboxButton())
    })
  )

  it(
    'should be possible to click outside of the listbox on another listbox button which should close the current listbox and open the new listbox',
    suppressConsoleLogs(async () => {
      render(
        <div>
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>

          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>
        </div>
      )

      let [button1, button2] = getListboxButtons()

      // Click the first listbox button
      await click(button1)
      expect(getListboxes()).toHaveLength(1) // Only 1 listbox should be visible

      // Ensure the open listbox is linked to the first button
      assertListboxButtonLinkedWithListbox(button1, getListbox())

      // Click the second listbox button
      await click(button2)

      expect(getListboxes()).toHaveLength(1) // Only 1 listbox should be visible

      // Ensure the open listbox is linked to the second button
      assertListboxButtonLinkedWithListbox(button2, getListbox())
    })
  )

  it(
    'should be possible to click outside of the listbox which should close the listbox (even if we press the listbox button)',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      // Click the listbox button again
      await click(getListboxButton())

      // Should be closed now
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getListboxButton())
    })
  )

  it(
    'should be possible to click outside of the listbox, on an element which is within a focusable element, which closes the listbox',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(
        <div>
          <Listbox value={undefined} onChange={(x) => console.log(x)}>
            <Listbox.Button onFocus={focusFn}>Trigger</Listbox.Button>
            <Listbox.Options>
              <Listbox.Option value="alice">alice</Listbox.Option>
              <Listbox.Option value="bob">bob</Listbox.Option>
              <Listbox.Option value="charlie">charlie</Listbox.Option>
            </Listbox.Options>
          </Listbox>

          <button id="btn">
            <span>Next</span>
          </button>
        </div>
      )

      // Click the listbox button
      await click(getListboxButton())

      // Ensure the listbox is open
      assertListbox({ state: ListboxState.Visible })

      // Click the span inside the button
      await click(getByText('Next'))

      // Ensure the listbox is closed
      assertListbox({ state: ListboxState.InvisibleUnmounted })

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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()
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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the listbox option is already active',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()

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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()

      await mouseMove(options[1])
      assertNoActiveListboxOption()
    })
  )

  it(
    'should not be possible to hover an option that is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()

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
        <Listbox value="bob" onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()

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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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

      let options = getListboxOptions()

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
      let handleChange = jest.fn()
      function Example() {
        let [value, setValue] = useState(undefined)

        return (
          <Listbox
            value={value}
            onChange={(value) => {
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
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertListbox({ state: ListboxState.InvisibleUnmounted })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('bob')

      // Verify the button is focused again
      assertActiveElement(getListboxButton())

      // Open listbox again
      await click(getListboxButton())

      // Verify the active option is the previously selected one
      assertActiveListboxOption(getListboxOptions()[1])
    })
  )

  it(
    'should be possible to click a disabled listbox option, which is a no-op',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      function Example() {
        let [value, setValue] = useState(undefined)

        return (
          <Listbox
            value={value}
            onChange={(value) => {
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
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertListbox({ state: ListboxState.Visible })
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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

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
        <Listbox value={undefined} onChange={(x) => console.log(x)}>
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
      assertListbox({ state: ListboxState.Visible })
      assertActiveElement(getListbox())

      let options = getListboxOptions()

      // We should not be able to focus the first option
      await focus(options[1])
      assertNoActiveListboxOption()
    })
  )
})

describe('Multi-select', () => {
  it(
    'should be possible to pass multiple values to the Listbox component',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Listbox value={value} onChange={setValue} multiple>
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

      // Verify that we have an open listbox with multiple mode
      assertListbox({ state: ListboxState.Visible, mode: ListboxMode.Multiple })

      // Verify that we have multiple selected listbox options
      let options = getListboxOptions()

      assertListboxOption(options[0], { selected: false })
      assertListboxOption(options[1], { selected: true })
      assertListboxOption(options[2], { selected: true })
    })
  )

  it(
    'should make the first selected option the active item',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Listbox value={value} onChange={setValue} multiple>
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

      // Verify that bob is the active option
      assertActiveListboxOption(getListboxOptions()[1])
    })
  )

  it(
    'should keep the listbox open when selecting an item via the keyboard',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Listbox value={value} onChange={setValue} multiple>
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
      assertListbox({ state: ListboxState.Visible })

      // Verify that bob is the active option
      await click(getListboxOptions()[0])

      // Verify that the listbox is still open
      assertListbox({ state: ListboxState.Visible })
    })
  )

  it(
    'should toggle the selected state of an option when clicking on it',
    suppressConsoleLogs(async () => {
      function Example() {
        let [value, setValue] = useState<string[]>(['bob', 'charlie'])

        return (
          <Listbox value={value} onChange={setValue} multiple>
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
      assertListbox({ state: ListboxState.Visible })

      let options = getListboxOptions()

      assertListboxOption(options[0], { selected: false })
      assertListboxOption(options[1], { selected: true })
      assertListboxOption(options[2], { selected: true })

      // Click on bob
      await click(getListboxOptions()[1])

      assertListboxOption(options[0], { selected: false })
      assertListboxOption(options[1], { selected: false })
      assertListboxOption(options[2], { selected: true })

      // Click on bob again
      await click(getListboxOptions()[1])

      assertListboxOption(options[0], { selected: false })
      assertListboxOption(options[1], { selected: true })
      assertListboxOption(options[2], { selected: true })
    })
  )
})

describe('Form compatibility', () => {
  it('should be possible to set the `form`, which is forwarded to the hidden inputs', async () => {
    let submits = jest.fn()

    function Example() {
      let [value, setValue] = useState(null)
      return (
        <div>
          <Listbox form="my-form" value={value} onChange={setValue} name="delivery">
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Label>Pizza Delivery</Listbox.Label>
            <Listbox.Options>
              <Listbox.Option value="pickup">Pickup</Listbox.Option>
              <Listbox.Option value="home-delivery">Home delivery</Listbox.Option>
              <Listbox.Option value="dine-in">Dine in</Listbox.Option>
            </Listbox.Options>
          </Listbox>

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

    // Open listbox
    await click(getListboxButton())

    // Choose pickup
    await click(getByText('Pickup'))

    // Submit the form
    await click(getByText('Submit'))

    expect(submits).toHaveBeenLastCalledWith([['delivery', 'pickup']])
  })

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
          <Listbox value={value} onChange={setValue} name="delivery">
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Label>Pizza Delivery</Listbox.Label>
            <Listbox.Options>
              <Listbox.Option value="pickup">Pickup</Listbox.Option>
              <Listbox.Option value="home-delivery">Home delivery</Listbox.Option>
              <Listbox.Option value="dine-in">Dine in</Listbox.Option>
            </Listbox.Options>
          </Listbox>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Open listbox
    await click(getListboxButton())

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([]) // no data

    // Open listbox again
    await click(getListboxButton())

    // Choose home delivery
    await click(getByText('Home delivery'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([['delivery', 'home-delivery']])

    // Open listbox again
    await click(getListboxButton())

    // Choose pickup
    await click(getByText('Pickup'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([['delivery', 'pickup']])
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
          <Listbox value={value} onChange={setValue} name="delivery">
            <Listbox.Button>Trigger</Listbox.Button>
            <Listbox.Label>Pizza Delivery</Listbox.Label>
            <Listbox.Options>
              {options.map((option) => (
                <Listbox.Option key={option.id} value={option}>
                  {option.label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Open listbox
    await click(getListboxButton())

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([
      ['delivery[id]', '1'],
      ['delivery[value]', 'pickup'],
      ['delivery[label]', 'Pickup'],
      ['delivery[extra][info]', 'Some extra info'],
    ])

    // Open listbox
    await click(getListboxButton())

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

    // Open listbox
    await click(getListboxButton())

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
})
