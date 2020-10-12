import React from 'react'
import { render } from '@testing-library/react'
import { listbox } from '@headlessui/tests/suits'
import { suppressConsoleLogs } from '@headlessui/tests/utils'
import {
  assertActiveElement,
  assertActiveListboxOption,
  assertListbox,
  assertListboxButton,
  assertListboxButtonLinkedWithListboxLabel,
  assertListboxOption,
  assertListboxLabel,
  assertListboxLabelLinkedWithListbox,
  assertNoActiveListboxOption,
  getListbox,
  getListboxButton,
  getListboxOptions,
  ListboxState,
} from '@headlessui/tests/accessibility-assertions'
import { click, press, Keys } from '@headlessui/tests/interactions'

import { Listbox } from './listbox'
import { PropsOf } from '../../types'

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

listbox.run({
  [listbox.scenarios.Default]({
    listbox,
    label,
    button,
    options,
  }: {
    listbox: PropsOf<typeof Listbox>
    label?: PropsOf<typeof Listbox.Label>
    button: PropsOf<typeof Listbox.Button>
    options: PropsOf<typeof Listbox.Option>[]
  }) {
    return render(
      <Listbox {...listbox}>
        {label && <Listbox.Label {...label} />}
        <Listbox.Button {...button} />
        <Listbox.Options>
          {options.map((option, i) => (
            <Listbox.Option key={i} {...option} />
          ))}
        </Listbox.Options>
      </Listbox>
    )
  },
  [listbox.scenarios.MultipleListboxes](
    listboxes: {
      listbox: PropsOf<typeof Listbox>
      label?: PropsOf<typeof Listbox.Label>
      button: PropsOf<typeof Listbox.Button>
      options: PropsOf<typeof Listbox.Option>[]
    }[]
  ) {
    return render(
      <div>
        {listboxes.map(({ listbox, label, button, options }, i) => (
          <Listbox key={i} {...listbox}>
            {label && <Listbox.Label {...label} />}
            <Listbox.Button {...button} />
            <Listbox.Options>
              {options.map((option, i) => (
                <Listbox.Option key={i} {...option} />
              ))}
            </Listbox.Options>
          </Listbox>
        ))}
      </div>
    )
  },
  [listbox.scenarios.WithState]({
    handleChange,
    label,
    button,
    options,
  }: {
    handleChange: (value: string | undefined) => void
    label?: PropsOf<typeof Listbox.Label>
    button: PropsOf<typeof Listbox.Button>
    options: PropsOf<typeof Listbox.Option>[]
  }) {
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
          {label && <Listbox.Label {...label} />}
          <Listbox.Button {...button} />
          <Listbox.Options>
            {options.map((option, i) => (
              <Listbox.Option key={i} {...option} />
            ))}
          </Listbox.Options>
        </Listbox>
      )
    }

    return render(<Example />)
  },
})
