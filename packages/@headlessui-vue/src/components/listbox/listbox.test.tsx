import { defineComponent, ref, watchEffect } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from './listbox'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
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

jest.mock('../../hooks/use-id')

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  const defaultComponents = { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption }

  if (typeof input === 'string') {
    return render(defineComponent({ template: input, components: defaultComponents }))
  }

  return render(
    defineComponent(
      Object.assign({}, input, {
        components: { ...defaultComponents, ...input.components },
      }) as Parameters<typeof defineComponent>[0]
    )
  )
}

describe('safeguards', () => {
  it.each([
    ['ListboxButton', ListboxButton],
    ['ListboxLabel', ListboxLabel],
    ['ListboxOptions', ListboxOptions],
    ['ListboxOption', ListboxOption],
  ])(
    'should error when we are using a <%s /> without a parent <Listbox />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Listbox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Listbox without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              {({ open }) => (
                <>
                  <ListboxButton>Trigger</ListboxButton>
                  {open && (
                    <ListboxOptions>
                      <ListboxOption value="a">Option A</ListboxOption>
                      <ListboxOption value="b">Option B</ListboxOption>
                      <ListboxOption value="c">Option C</ListboxOption>
                    </ListboxOptions>
                  )}
                </>
              )}
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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

  describe('ListboxLabel', () => {
    it(
      'should be possible to render a ListboxLabel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxLabel v-slot="data">{{JSON.stringify(data)}}</ListboxLabel>
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
      'should be possible to render a ListboxLabel using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxLabel as="p" v-slot="data">{{JSON.stringify(data)}}</ListboxLabel>
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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

  describe('ListboxButton', () => {
    it(
      'should be possible to render a ListboxButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton v-slot="data">{{JSON.stringify(data)}}</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
      'should be possible to render a ListboxButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton as="div" role="button" v-slot="data">{{JSON.stringify(data)}}</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
      'should be possible to render a ListboxButton and a ListboxLabel and see them linked together',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxLabel>Label</ListboxLabel>
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        await new Promise(requestAnimationFrame)

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListbox({ state: ListboxState.Closed })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )
  })

  describe('ListboxOptions', () => {
    it(
      'should be possible to render ListboxOptions using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions v-slot="data">
                <ListboxOption value="a">{{JSON.stringify(data)}}</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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

    it('should be possible to always render the ListboxOptions if we provide it a `static` prop', () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions static>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Let's verify that the Listbox is already there
      expect(getListbox()).not.toBe(null)
    })
  })

  describe('ListboxOption', () => {
    it(
      'should be possible to render a ListboxOption using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a" v-slot="data">{{JSON.stringify(data)}}</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" :className="JSON.stringify">
                Option A
              </ListboxOption>
              <ListboxOption value="b" disabled :className="JSON.stringify">
                Option B
              </ListboxOption>
              <ListboxOption value="c" className="no-special-treatment">
                Option C
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption as="button" value="a">
                Option A
              </ListboxOption>
              <ListboxOption as="button" value="b">
                Option B
              </ListboxOption>
              <ListboxOption as="button" value="c">
                Option C
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref('b') }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup() {
            const value = ref(null)
            watchEffect(() => {
              if (value.value !== null) handleChange(value.value)
            })
            return { value }
          },
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref('b') }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup() {
            const value = ref(null)
            watchEffect(() => {
              if (value.value !== null) handleChange(value.value)
            })
            return { value }
          },
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref('b') }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref('b') }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
                <ListboxOption value="d">Option D</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption value="d">Option D</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
                <ListboxOption value="d">Option D</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption value="d">Option D</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a">
                  Option A
                </ListboxOption>
                <ListboxOption disabled value="b">
                  Option B
                </ListboxOption>
                <ListboxOption disabled value="c">
                  Option C
                </ListboxOption>
                <ListboxOption disabled value="d">
                  Option D
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">alice</ListboxOption>
                <ListboxOption value="bob">bob</ListboxOption>
                <ListboxOption value="charlie">charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">alice</ListboxOption>
                <ListboxOption value="bob">bob</ListboxOption>
                <ListboxOption value="charlie">charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">value a</ListboxOption>
                <ListboxOption value="b">value b</ListboxOption>
                <ListboxOption value="c">value c</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">alice</ListboxOption>
                <ListboxOption disabled value="bob">
                  bob
                </ListboxOption>
                <ListboxOption value="charlie">charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
    'should focus the ListboxButton when we click the ListboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxLabel>Label</ListboxLabel>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref('b') }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
    renderTemplate({
      template: `
        <Listbox v-model="value">
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option A</ListboxOption>
            <ListboxOption value="b">Option B</ListboxOption>
            <ListboxOption value="c">Option C</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `,
      setup: () => ({ value: ref(null) }),
    })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <div>
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">alice</ListboxOption>
                <ListboxOption value="bob">bob</ListboxOption>
                <ListboxOption value="charlie">charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>

            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">alice</ListboxOption>
                <ListboxOption value="bob">bob</ListboxOption>
                <ListboxOption value="charlie">charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
          </div>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob">
                bob
              </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob">
                bob
              </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob">
                bob
              </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup() {
          const value = ref(null)
          watchEffect(() => {
            if (value.value !== null) handleChange(value.value)
          })
          return { value }
        },
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob">
                bob
              </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup() {
          const value = ref(null)
          watchEffect(() => {
            if (value.value !== null) handleChange(value.value)
          })
          return { value }
        },
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob">
                bob
              </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
