import { computed, defineComponent, h, nextTick, reactive, ref, watch, type PropType } from 'vue'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import {
  ComboboxMode,
  ComboboxState,
  assertActiveComboboxOption,
  assertActiveElement,
  assertCombobox,
  assertComboboxButton,
  assertComboboxButtonLinkedWithCombobox,
  assertComboboxButtonLinkedWithComboboxLabel,
  assertComboboxInput,
  assertComboboxLabel,
  assertComboboxLabelLinkedWithCombobox,
  assertComboboxList,
  assertComboboxOption,
  assertNoActiveComboboxOption,
  assertNoSelectedComboboxOption,
  assertNotActiveComboboxOption,
  getByText,
  getComboboxButton,
  getComboboxButtons,
  getComboboxInput,
  getComboboxInputs,
  getComboboxLabel,
  getComboboxOptions,
  getComboboxes,
} from '../../test-utils/accessibility-assertions'
import { html } from '../../test-utils/html'
import {
  Keys,
  MouseButton,
  blur,
  click,
  focus,
  mouseLeave,
  mouseMove,
  press,
  shift,
  type,
  word,
} from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { createRenderTemplate, render } from '../../test-utils/vue-testing-library'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from './combobox'

global.ResizeObserver = class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function getDefaultComponents() {
  return {
    Combobox,
    ComboboxInput,
    ComboboxLabel,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
  }
}

const renderTemplate = createRenderTemplate(getDefaultComponents())

describe('safeguards', () => {
  it.each([
    ['ComboboxButton', ComboboxButton],
    ['ComboboxLabel', ComboboxLabel],
    ['ComboboxOptions', ComboboxOptions],
    ['ComboboxOption', ComboboxOption],
  ])(
    'should error when we are using a <%s /> without a parent <Combobox />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Combobox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Combobox without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="a">Option A</ComboboxOption>
              <ComboboxOption value="b">Option B</ComboboxOption>
              <ComboboxOption value="c">Option C</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
        renderTemplate({
          template: html`
            <Combobox v-model="value" v-slot="{ open }">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions v-show="open">
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: html`
            <Combobox v-model="value" disabled>
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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

        // The input should also be disabled
        assertComboboxInput({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-input-1', disabled: '' },
        })

        // And even if we try to focus it, it should not open the combobox
        await focus(getComboboxInput())
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      })
    )

    it(
      'should not crash in multiple mode',
      suppressConsoleLogs(async () => {
        let options = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Charlie' },
        ]

        renderTemplate({
          template: html`
            <Combobox multiple name="abc">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption
                  v-for="option in options"
                  :key="option.id"
                  :value="option"
                  v-slot="data"
                  >{{ JSON.stringify(data) }}</ComboboxOption
                >
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => {
            let value = ref(options[1])
            return { options, value }
          },
        })

        await click(getComboboxButton())
        let [alice, bob, charlie] = getComboboxOptions()

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
          renderTemplate({
            template: html`
              <Combobox v-model="value">
                <ComboboxButton>Trigger</ComboboxButton>
                <ComboboxOptions>
                  <ComboboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ComboboxOption
                  >
                </ComboboxOptions>
              </Combobox>
            `,
            setup: () => {
              let value = ref(options[1])
              return { options, value }
            },
          })

          await click(getComboboxButton())

          let bob = getComboboxOptions()[1]
          expect(bob).toHaveTextContent(
            JSON.stringify({ active: true, selected: true, disabled: false })
          )
        })
      )

      it(
        'should be possible to compare null values by a field',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value" by="id">
                <ComboboxButton>Trigger</ComboboxButton>
                <ComboboxOptions>
                  <ComboboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ComboboxOption
                  >
                </ComboboxOptions>
              </Combobox>
            `,
            setup: () => {
              let value = ref(null)
              return { options, value }
            },
          })

          await click(getComboboxButton())

          let [alice, bob, charlie] = getComboboxOptions()
          expect(alice).toHaveTextContent(
            JSON.stringify({ active: true, selected: false, disabled: false })
          )
          expect(bob).toHaveTextContent(
            JSON.stringify({ active: false, selected: false, disabled: false })
          )
          expect(charlie).toHaveTextContent(
            JSON.stringify({ active: false, selected: false, disabled: false })
          )
        })
      )

      it(
        'should be possible to compare objects by a field',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value" by="id">
                <ComboboxButton>Trigger</ComboboxButton>
                <ComboboxOptions>
                  <ComboboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ComboboxOption
                  >
                </ComboboxOptions>
              </Combobox>
            `,
            setup: () => {
              let value = ref({ id: 2, name: 'Bob' })
              return { options, value }
            },
          })

          await click(getComboboxButton())

          let bob = getComboboxOptions()[1]
          expect(bob).toHaveTextContent(
            JSON.stringify({ active: true, selected: true, disabled: false })
          )
        })
      )

      it(
        'should be possible to compare objects by a comparator function',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value" :by="compare">
                <ComboboxButton>Trigger</ComboboxButton>
                <ComboboxOptions>
                  <ComboboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ComboboxOption
                  >
                </ComboboxOptions>
              </Combobox>
            `,
            setup: () => {
              let value = ref({ id: 2, name: 'Bob' })
              return { options, value, compare: (a: any, z: any) => a.id === z.id }
            },
          })

          await click(getComboboxButton())

          let bob = getComboboxOptions()[1]
          expect(bob).toHaveTextContent(
            JSON.stringify({ active: true, selected: true, disabled: false })
          )
        })
      )

      it(
        'should be possible to use completely new objects while rendering (single mode)',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value" by="id">
                <ComboboxButton>Trigger</ComboboxButton>
                <ComboboxOptions>
                  <ComboboxOption :value="{ id: 1, name: 'alice' }">alice</ComboboxOption>
                  <ComboboxOption :value="{ id: 2, name: 'bob' }">bob</ComboboxOption>
                  <ComboboxOption :value="{ id: 3, name: 'charlie' }">charlie</ComboboxOption>
                </ComboboxOptions>
              </Combobox>
            `,
            setup: () => {
              let value = ref({ id: 2, name: 'Bob' })
              return { options, value }
            },
          })

          await click(getComboboxButton())
          let [alice, bob, charlie] = getComboboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')

          await click(getComboboxOptions()[2])
          await click(getComboboxButton())
          ;[alice, bob, charlie] = getComboboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'false')
          expect(charlie).toHaveAttribute('aria-selected', 'true')

          await click(getComboboxOptions()[1])
          await click(getComboboxButton())
          ;[alice, bob, charlie] = getComboboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')
        })
      )

      it(
        'should be possible to use completely new objects while rendering (multiple mode)',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value" by="id" multiple>
                <ComboboxButton>Trigger</ComboboxButton>
                <ComboboxOptions>
                  <ComboboxOption :value="{ id: 1, name: 'alice' }">alice</ComboboxOption>
                  <ComboboxOption :value="{ id: 2, name: 'bob' }">bob</ComboboxOption>
                  <ComboboxOption :value="{ id: 3, name: 'charlie' }">charlie</ComboboxOption>
                </ComboboxOptions>
              </Combobox>
            `,
            setup: () => {
              let value = ref([{ id: 2, name: 'Bob' }])
              return { options, value }
            },
          })

          await click(getComboboxButton())

          await click(getComboboxOptions()[2])
          let [alice, bob, charlie] = getComboboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'true')

          await click(getComboboxOptions()[2])
          ;[alice, bob, charlie] = getComboboxOptions()
          expect(alice).toHaveAttribute('aria-selected', 'false')
          expect(bob).toHaveAttribute('aria-selected', 'true')
          expect(charlie).toHaveAttribute('aria-selected', 'false')
        })
      )
    })

    it(
      'should not crash when a defaultValue is not given',
      suppressConsoleLogs(async () => {
        let data = [
          { id: 1, name: 'alice', label: 'Alice' },
          { id: 2, name: 'bob', label: 'Bob' },
          { id: 3, name: 'charlie', label: 'Charlie' },
        ]

        renderTemplate({
          template: html`
            <Combobox name="assignee" by="id">
              <ComboboxInput :displayValue="(value) => value.name" />
              <ComboboxOptions>
                <ComboboxOption v-for="person in data" :key="person.id" :value="person">
                  {{ person.label }}
                </ComboboxOption>
              <ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ data }),
        })
      })
    )

    it(
      'should close the Combobox when the input is blurred',
      suppressConsoleLogs(async () => {
        let data = [
          { id: 1, name: 'alice', label: 'Alice' },
          { id: 2, name: 'bob', label: 'Bob' },
          { id: 3, name: 'charlie', label: 'Charlie' },
        ]

        renderTemplate({
          template: html`
            <Combobox name="assignee" by="id">
              <ComboboxInput />
              <ComboboxButton />
              <ComboboxOptions>
                <ComboboxOption v-for="person in data" :key="person.id" :value="person">
                  {{ person.label }}
                </ComboboxOption>
              <ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ data }),
        })

        // Open the combobox
        await click(getComboboxButton())

        // Verify it is open
        assertComboboxList({ state: ComboboxState.Visible })

        // Close the combobox
        await blur(getComboboxInput())

        // Verify it is closed
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      })
    )
  })

  describe('ComboboxInput', () => {
    it(
      'selecting an option puts the value into Combobox.Input when displayValue is not provided',
      suppressConsoleLogs(async () => {
        let Example = defineComponent({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // TODO: Rendering Example directly reveals a vue bug — I think it's been fixed for a while but I can't find the commit
        renderTemplate(Example)

        assertComboboxInput({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxInput({ state: ComboboxState.Visible })
        assertComboboxList({ state: ComboboxState.Visible })

        await click(getComboboxOptions()[1])

        expect(getComboboxInput()).toHaveValue('b')
      })
    )

    it(
      'selecting an option puts the display value into Combobox.Input when displayValue is provided',
      suppressConsoleLogs(async () => {
        let Example = defineComponent({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput :displayValue="(str) => str?.toUpperCase() ?? ''" />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        renderTemplate(Example)

        await click(getComboboxButton())

        assertComboboxList({ state: ComboboxState.Visible })

        await click(getComboboxOptions()[1])

        expect(getComboboxInput()).toHaveValue('B')
      })
    )

    // This really is a bug in Vue but we have a workaround for it
    it(
      'selecting an option puts the display value into Combobox.Input when displayValue is provided (when v-model is undefined)',
      suppressConsoleLogs(async () => {
        let Example = defineComponent({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput :displayValue="(str) => str?.toUpperCase() ?? ''" />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(undefined) }),
        })

        renderTemplate(Example)

        // Focus the input
        await focus(getComboboxInput())

        // Type in it
        await type(word('A'), getComboboxInput())

        // Stop typing (and clear the input)
        await press(Keys.Escape, getComboboxInput())

        // Focus the body (so the input loses focus)
        await focus(document.body)

        expect(getComboboxInput()).toHaveValue('')
      })
    )

    it('conditionally rendering the input should allow changing the display value', async () => {
      let Example = defineComponent({
        template: html`
          <Combobox v-model="value" v-slot="{ open }" nullable>
            <ComboboxInput
              :displayValue="(str) => (str?.toUpperCase() ?? '') + (suffix ? ' with suffix' : ' no suffix')"
            />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="a">Option A</ComboboxOption>
              <ComboboxOption value="b">Option B</ComboboxOption>
              <ComboboxOption value="c">Option C</ComboboxOption>
            </ComboboxOptions>
            <button @click="suffix = !suffix">Toggle suffix</button>
          </Combobox>
        `,
        setup: () => ({ value: ref(null), suffix: ref(false) }),
      })

      renderTemplate(Example)

      await nextFrame()

      expect(getComboboxInput()).toHaveValue(' no suffix')

      await click(getComboboxButton())

      expect(getComboboxInput()).toHaveValue(' no suffix')

      await click(getComboboxOptions()[1])

      expect(getComboboxInput()).toHaveValue('B no suffix')

      await click(getByText('Toggle suffix'))

      expect(getComboboxInput()).toHaveValue('B with suffix')

      await click(getComboboxButton())

      expect(getComboboxInput()).toHaveValue('B with suffix')

      await click(getComboboxOptions()[0])

      expect(getComboboxInput()).toHaveValue('A with suffix')
    })

    it(
      'should be possible to override the `type` on the input',
      suppressConsoleLogs(async () => {
        let Example = defineComponent({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput type="search" />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        renderTemplate(Example)

        expect(getComboboxInput()).toHaveAttribute('type', 'search')
      })
    )

    xit(
      'should reflect the value in the input when the value changes and when you are typing',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" v-slot="{ open }">
              <ComboboxInput :displayValue="person => displayValue(person, open)" />

              <ComboboxButton />

              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({
            value: ref('bob'),
            displayValue(person: string, open: boolean) {
              return `${person ?? ''} - ${open ? 'open' : 'closed'}`
            },
          }),
        })

        await nextFrame()

        // Check for proper state sync
        expect(getComboboxInput()).toHaveValue('bob - closed')
        await click(getComboboxButton())
        expect(getComboboxInput()).toHaveValue('bob - open')
        await click(getComboboxButton())
        expect(getComboboxInput()).toHaveValue('bob - closed')

        // Check if we can still edit the input
        for (let _ of Array(' - closed'.length)) {
          await press(Keys.Backspace, getComboboxInput())
        }
        getComboboxInput()?.select()
        await type(word('alice'), getComboboxInput())
        expect(getComboboxInput()).toHaveValue('alice')

        // Open the combobox and choose an option
        await click(getComboboxOptions()[2])
        expect(getComboboxInput()).toHaveValue('charlie - closed')
      })
    )

    it(
      'should move the caret to the end of the input when syncing the value',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox>
              <ComboboxInput />
              <ComboboxButton />

              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
        })

        await nextFrame()

        // Open the combobox
        await click(getComboboxButton())

        // Choose charlie
        await click(getComboboxOptions()[2])
        expect(getComboboxInput()).toHaveValue('charlie')

        // Ensure the selection is in the correct position
        expect(getComboboxInput()?.selectionStart).toBe('charlie'.length)
        expect(getComboboxInput()?.selectionEnd).toBe('charlie'.length)
      })
    )

    // Skipped because JSDOM doesn't implement this properly: https://github.com/jsdom/jsdom/issues/3524
    xit(
      'should not move the caret to the end of the input when syncing the value if a custom selection is made',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox>
              <ComboboxInput />
              <ComboboxButton />

              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
        })

        await nextFrame()

        // Open the combobox
        await click(getComboboxButton())

        // Choose charlie
        await click(getComboboxOptions()[2])
        expect(getComboboxInput()).toHaveValue('charlie')

        // Ensure the selection is in the correct position
        expect(getComboboxInput()?.selectionStart).toBe(0)
        expect(getComboboxInput()?.selectionEnd).toBe('charlie'.length)
      })
    )
  })

  describe('ComboboxLabel', () => {
    it(
      'should be possible to render a ComboboxLabel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxLabel v-slot="data">{{JSON.stringify(data)}}</ComboboxLabel>
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
      'should be possible to link Input/Button and Label if Label is rendered last',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton />
              <ComboboxLabel>Label</ComboboxLabel>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        await new Promise<void>(nextTick)

        assertComboboxLabelLinkedWithCombobox()
        assertComboboxButtonLinkedWithComboboxLabel()
      })
    )

    it(
      'should be possible to render a ComboboxLabel using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxLabel as="p" v-slot="data">{{JSON.stringify(data)}}</ComboboxLabel>
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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

  describe('ComboboxButton', () => {
    it(
      'should be possible to render a ComboboxButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton v-slot="data">{{JSON.stringify(data)}}</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: false, disabled: false, value: null }),
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: true, disabled: false, value: null }),
        })
        assertComboboxList({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to render a ComboboxButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton as="div" role="button" v-slot="data"
                >{{JSON.stringify(data)}}</ComboboxButton
              >
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: false, disabled: false, value: null }),
        })
        assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

        await click(getComboboxButton())

        assertComboboxButton({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-button-2' },
          textContent: JSON.stringify({ open: true, disabled: false, value: null }),
        })
        assertComboboxList({ state: ComboboxState.Visible })
      })
    )

    it(
      'should be possible to render a ComboboxButton and a ComboboxLabel and see them linked together',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxLabel>Label</ComboboxLabel>
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        await new Promise(requestAnimationFrame)

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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getComboboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton type="submit"> Trigger </ComboboxButton>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getComboboxButton()).toHaveAttribute('type', 'submit')
      })

      it(
        'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
        suppressConsoleLogs(async () => {
          let CustomButton = defineComponent({
            setup: (props) => () => h('button', { ...props }),
          })

          renderTemplate({
            template: html`
              <Combobox v-model="value">
                <ComboboxInput />
                <ComboboxButton :as="CustomButton"> Trigger </ComboboxButton>
              </Combobox>
            `,
            setup: () => ({
              value: ref(null),
              CustomButton,
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getComboboxButton()).toHaveAttribute('type', 'button')
        })
      )

      it('should not set the type if the "as" prop is not a "button"', async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton as="div"> Trigger </ComboboxButton>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getComboboxButton()).not.toHaveAttribute('type')
      })

      it(
        'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
        suppressConsoleLogs(async () => {
          let CustomButton = defineComponent({
            setup: (props) => () => h('div', props),
          })

          renderTemplate({
            template: html`
              <Combobox v-model="value">
                <ComboboxInput />
                <ComboboxButton :as="CustomButton"> Trigger </ComboboxButton>
              </Combobox>
            `,
            setup: () => ({
              value: ref(null),
              CustomButton,
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getComboboxButton()).not.toHaveAttribute('type')
        })
      )
    })
  })

  describe('ComboboxOptions', () => {
    it(
      'should be possible to render ComboboxOptions using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions v-slot="data">
                <ComboboxOption value="a">{{JSON.stringify(data)}}</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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

    it('should be possible to always render the ComboboxOptions if we provide it a `static` prop', () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions static>
              <ComboboxOption value="a">Option A</ComboboxOption>
              <ComboboxOption value="b">Option B</ComboboxOption>
              <ComboboxOption value="c">Option C</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Let's verify that the combobox is already there
      expect(getComboboxInput()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the ComboboxOptions', async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions :unmount="false">
              <ComboboxOption value="a">Option A</ComboboxOption>
              <ComboboxOption value="b">Option B</ComboboxOption>
              <ComboboxOption value="c">Option C</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      await new Promise<void>(nextTick)

      assertComboboxList({ state: ComboboxState.InvisibleHidden })

      // Let's open the combobox, to see if it is not hidden anymore
      await click(getComboboxButton())

      assertComboboxList({ state: ComboboxState.Visible })
    })
  })

  describe('ComboboxOption', () => {
    it(
      'should be possible to render a ComboboxOption using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a" v-slot="data">{{JSON.stringify(data)}}</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
    let props = reactive({ hide: false })

    renderTemplate({
      template: html`
        <Combobox v-model="value">
          <ComboboxInput />
          <ComboboxButton>Trigger</ComboboxButton>
          <ComboboxOptions>
            <ComboboxOption value="a">Option 1</ComboboxOption>
            <ComboboxOption v-if="!hide" value="b">Option 2</ComboboxOption>
            <ComboboxOption value="c">Option 3</ComboboxOption>
          </ComboboxOptions>
        </Combobox>
      `,
      setup() {
        return {
          value: ref(null),
          get hide() {
            return props.hide
          },
        }
      },
    })

    // Open the combobox
    await click(getByText('Trigger'))

    props.hide = true
    await nextFrame()

    props.hide = false
    await nextFrame()

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

  it('should guarantee the order of options based on `order` when performing actions', async () => {
    let props = reactive({ hide: false })

    renderTemplate({
      template: html`
        <Combobox v-model="value">
          <ComboboxInput />
          <ComboboxButton>Trigger</ComboboxButton>
          <ComboboxOptions>
            <ComboboxOption value="a" :order="1">Option 1</ComboboxOption>
            <ComboboxOption v-if="!hide" value="b" :order="2">Option 2</ComboboxOption>
            <ComboboxOption value="c" :order="3">Option 3</ComboboxOption>
          </ComboboxOptions>
        </Combobox>
      `,
      setup() {
        return {
          value: ref(null),
          get hide() {
            return props.hide
          },
        }
      },
    })

    // Open the combobox
    await click(getByText('Trigger'))

    props.hide = true
    await nextFrame()

    props.hide = false
    await nextFrame()

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

  describe('Uncontrolled', () => {
    it('should be possible to use in an uncontrolled way', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Combobox name="assignee">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">Alice</ComboboxOption>
                <ComboboxOption value="bob">Bob</ComboboxOption>
                <ComboboxOption value="charlie">Charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
            <button id="submit">submit</button>
          </form>
        `,
        setup: () => ({
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Open combobox
      await click(getComboboxButton())

      // Choose alice
      await click(getComboboxOptions()[0])

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

      // Open combobox
      await click(getComboboxButton())

      // Choose charlie
      await click(getComboboxOptions()[2])

      // Submit
      await click(document.getElementById('submit'))

      // Charlie should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'charlie' })
    })

    it('should expose the value via the render prop', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Combobox name="assignee" v-slot="{ value }">
              <div data-testid="value">{{value}}</div>
              <ComboboxInput />
              <ComboboxButton v-slot="{ value }">
                Trigger
                <div data-testid="value-2">{{value}}</div>
              </ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">Alice</ComboboxOption>
                <ComboboxOption value="bob">Bob</ComboboxOption>
                <ComboboxOption value="charlie">Charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
            <button id="submit">submit</button>
          </form>
        `,
        setup: () => ({
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Open combobox
      await click(getComboboxButton())

      // Choose alice
      await click(getComboboxOptions()[0])
      expect(document.querySelector('[data-testid="value"]')).toHaveTextContent('alice')
      expect(document.querySelector('[data-testid="value-2"]')).toHaveTextContent('alice')

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

      // Open combobox
      await click(getComboboxButton())

      // Choose charlie
      await click(getComboboxOptions()[2])
      expect(document.querySelector('[data-testid="value"]')).toHaveTextContent('charlie')
      expect(document.querySelector('[data-testid="value-2"]')).toHaveTextContent('charlie')

      // Submit
      await click(document.getElementById('submit'))

      // Charlie should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'charlie' })
    })

    it('should be possible to provide a default value', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Combobox name="assignee" defaultValue="bob">
              <ComboboxInput />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">Alice</ComboboxOption>
                <ComboboxOption value="bob">Bob</ComboboxOption>
                <ComboboxOption value="charlie">Charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
            <button id="submit">submit</button>
          </form>
        `,
        setup: () => ({
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      await click(document.getElementById('submit'))

      // Bob is the defaultValue
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

      // Open combobox
      await click(getComboboxButton())

      // Choose alice
      await click(getComboboxOptions()[0])

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })
    })

    it(
      'should be possible to reset to the default value if the form is reset',
      suppressConsoleLogs(async () => {
        let handleSubmission = jest.fn()

        renderTemplate({
          template: html`
            <form @submit="handleSubmit">
              <Combobox name="assignee" defaultValue="bob">
                <ComboboxButton v-slot="{ value }">{{ value ?? 'Trigger' }}</ComboboxButton>
                <ComboboxInput :displayValue="(value) => value" />
                <ComboboxOptions>
                  <ComboboxOption value="alice">Alice</ComboboxOption>
                  <ComboboxOption value="bob">Bob</ComboboxOption>
                  <ComboboxOption value="charlie">Charlie</ComboboxOption>
                </ComboboxOptions>
              </Combobox>
              <button id="submit">submit</button>
              <button type="reset" id="reset">reset</button>
            </form>
          `,
          setup: () => ({
            handleSubmit(e: SubmitEvent) {
              e.preventDefault()
              handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
            },
          }),
        })

        await click(document.getElementById('submit'))

        // Bob is the defaultValue
        expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

        // Open combobox
        await click(getComboboxButton())

        // Choose alice
        await click(getComboboxOptions()[0])
        expect(getComboboxButton()).toHaveTextContent('alice')
        expect(getComboboxInput()).toHaveValue('alice')

        // Reset
        await click(document.getElementById('reset'))

        // The combobox should be reset to bob
        expect(getComboboxButton()).toHaveTextContent('bob')
        expect(getComboboxInput()).toHaveValue('bob')

        // Open combobox
        await click(getComboboxButton())
        assertActiveComboboxOption(getComboboxOptions()[1])
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

        renderTemplate({
          template: html`
            <form @submit="handleSubmit">
              <Combobox name="assignee" :defaultValue="{ id: 2, name: 'bob', label: 'Bob' }" by="id">
                <ComboboxButton v-slot="{ value }">{{ value ?? 'Trigger' }}</ComboboxButton>
                <ComboboxInput :displayValue="(value) => value.name" />
                <ComboboxOptions>
                  <ComboboxOption v-for="person in data" :key="person.id" :value="person">
                    {{ person.label }}
                  </ComboboxOption>
                <ComboboxOptions>
              </Combobox>
              <button id="submit">submit</button>
              <button type="reset" id="reset">reset</button>
            </form>
          `,
          setup: () => ({
            data,
            handleSubmit(e: SubmitEvent) {
              e.preventDefault()
              handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
            },
          }),
        })

        await click(document.getElementById('submit'))

        // Bob is the defaultValue
        expect(handleSubmission).toHaveBeenLastCalledWith({
          'assignee[id]': '2',
          'assignee[name]': 'bob',
          'assignee[label]': 'Bob',
        })

        // Open combobox
        await click(getComboboxButton())

        // Choose alice
        await click(getComboboxOptions()[0])
        expect(getComboboxButton()).toHaveTextContent('alice')
        expect(getComboboxInput()).toHaveValue('alice')

        // Reset
        await click(document.getElementById('reset'))

        // The combobox should be reset to bob
        expect(getComboboxButton()).toHaveTextContent('bob')
        expect(getComboboxInput()).toHaveValue('bob')

        // Open combobox
        await click(getComboboxButton())
        assertActiveComboboxOption(getComboboxOptions()[1])
      })
    )

    it('should be possible to reset to the default value in multiple mode', async () => {
      let data = ['alice', 'bob', 'charlie']
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Combobox name="assignee" :defaultValue="['bob']" multiple>
              <ComboboxButton v-slot="{ value }"
                >{{ value.join(', ') || 'Trigger' }}</ComboboxButton
              >
              <ComboboxOptions>
                <ComboboxOption v-for="person in data" :key="person" :value="person">
                  {{ person }}
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
            <button id="submit">submit</button>
            <button type="reset" id="reset">reset</button>
          </form>
        `,
        setup: () => ({
          data,
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

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

      renderTemplate({
        template: html`
          <Combobox name="assignee" @update:modelValue="handleChange">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">Alice</ComboboxOption>
              <ComboboxOption value="bob">Bob</ComboboxOption>
              <ComboboxOption value="charlie">Charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({
          handleChange,
        }),
      })

      // Open combobox
      await click(getComboboxButton())

      // Choose alice
      await click(getComboboxOptions()[0])

      // Open combobox
      await click(getComboboxButton())

      // Choose bob
      await click(getComboboxOptions()[1])

      // Change handler should have been called twice
      expect(handleChange).toHaveBeenNthCalledWith(1, 'alice')
      expect(handleChange).toHaveBeenNthCalledWith(2, 'bob')
    })
  })

  it(
    'should be possible to use a custom component using the `as` prop without crashing',
    suppressConsoleLogs(async () => {
      let CustomComponent = defineComponent({
        template: html`<button><slot /></button>`,
      })

      renderTemplate({
        template: html`
          <Combobox name="assignee">
            <ComboboxInput />
            <ComboboxButton />
            <ComboboxOptions>
              <ComboboxOption :as="CustomComponent" value="alice">Alice</RadioGroupOption>
              <ComboboxOption :as="CustomComponent" value="bob">Bob</RadioGroupOption>
              <ComboboxOption :as="CustomComponent" value="charlie">Charlie</RadioGroupOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ CustomComponent }),
      })

      // Open combobox
      await click(getComboboxButton())
    })
  )
})

describe('Rendering composition', () => {
  it(
    'should be possible to swap the Combobox option with a button for example',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption as="button" value="a"> Option A </ComboboxOption>
              <ComboboxOption as="button" value="b"> Option B </ComboboxOption>
              <ComboboxOption as="button" value="c"> Option C </ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Open combobox
      await click(getComboboxButton())

      // Verify options are buttons now
      getComboboxOptions().forEach((option) => assertComboboxOption(option, { tag: 'button' }))
    })
  )

  it(
    'should mark all the elements between Combobox.Options and Combobox.Option with role none',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton />
            <div class="outer">
              <ComboboxOptions>
                <div class="inner py-1">
                  <ComboboxOption value="a">Option A</ComboboxOption>
                  <ComboboxOption value="b">Option B</ComboboxOption>
                </div>
                <div class="inner py-1">
                  <ComboboxOption value="c">Option C</ComboboxOption>
                  <ComboboxOption value="d">
                    <div>
                      <div class="outer">Option D</div>
                    </div>
                  </ComboboxOption>
                </div>
                <div class="inner py-1">
                  <form class="inner">
                    <ComboboxOption value="e">Option E</ComboboxOption>
                  </form>
                </div>
              </ComboboxOptions>
            </div>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
  let OpenClosedWrite = defineComponent({
    props: { open: { type: Boolean } },
    setup(props, { slots }) {
      useOpenClosedProvider(ref(props.open ? State.Open : State.Closed))
      return () => slots.default?.()
    },
  })

  let OpenClosedRead = defineComponent({
    emits: ['read'],
    setup(_, { slots, emit }) {
      let state = useOpenClosed()
      watch([state], ([value]) => emit('read', value))
      return () => slots.default?.()
    },
  })

  it(
    'should always open the ComboboxOptions because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Combobox>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <OpenClosedWrite :open="true">
              <ComboboxOptions v-slot="data"> {{JSON.stringify(data)}} </ComboboxOptions>
            </OpenClosedWrite>
          </Combobox>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the combobox is visible
      assertComboboxList({ state: ComboboxState.Visible })

      // Let's try and open the combobox
      await click(getComboboxButton())

      // Verify the combobox is still visible
      assertComboboxList({ state: ComboboxState.Visible })
    })
  )

  it(
    'should always close the ComboboxOptions because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Combobox>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <OpenClosedWrite :open="false">
              <ComboboxOptions v-slot="data"> {{JSON.stringify(data)}} </ComboboxOptions>
            </OpenClosedWrite>
          </Combobox>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the combobox is hidden
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Let's try and open the combobox
      await click(getComboboxButton())

      // Verify the combobox is still hidden
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to read the OpenClosed state',
    suppressConsoleLogs(async () => {
      let readFn = jest.fn()
      renderTemplate({
        components: { OpenClosedRead },
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <OpenClosedRead @read="readFn">
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
              </ComboboxOptions>
            </OpenClosedRead>
          </Combobox>
        `,
        setup() {
          return { value: ref(null), readFn }
        },
      })

      await new Promise<void>(nextTick)

      // Verify the combobox is hidden
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Let's toggle the combobox 3 times
      await click(getComboboxButton())
      await click(getComboboxButton())
      await click(getComboboxButton())

      // Verify the combobox is visible
      assertComboboxList({ state: ComboboxState.Visible })

      expect(readFn).toHaveBeenCalledTimes(3)
      expect(readFn).toHaveBeenNthCalledWith(1, State.Open)
      expect(readFn).toHaveBeenNthCalledWith(2, State.Closed)
      expect(readFn).toHaveBeenNthCalledWith(3, State.Open)
    })
  )
})

describe.each([{ virtual: true }, { virtual: false }])(
  'Keyboard interactions %s',
  ({ virtual }) => {
    let data = ['Option A', 'Option B', 'Option C']
    let MyCombobox = defineComponent({
      components: getDefaultComponents(),
      template: html`
        <Combobox v-if="virtual !== null" :virtual="virtual" v-model="value" v-bind="comboboxProps">
          <ComboboxInput v-bind="inputProps" />
          <ComboboxButton v-bind="buttonProps">Trigger</ComboboxButton>
          <ComboboxOptions v-if="useComboboxOptions" v-slot="{ option }">
            <ComboboxOption v-bind="optionProps" :value="option">
              {{ option?.children ?? option }}
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>

        <Combobox v-if="virtual === null" v-model="value" v-bind="comboboxProps">
          <ComboboxInput v-bind="inputProps" />
          <ComboboxButton v-bind="buttonProps">Trigger</ComboboxButton>
          <ComboboxOptions v-if="useComboboxOptions">
            <ComboboxOption
              v-for="(option, idx) in options"
              :key="idx"
              :disabled="isDisabled(option)"
              v-bind="optionProps"
              :value="option"
            >
              {{ option?.children ?? option }}
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
      `,

      props: {
        options: { default: data.slice() },
        useComboboxOptions: { default: true },
        comboboxProps: {},
        inputProps: { default: {} },
        buttonProps: { default: {} },
        optionProps: { default: {} },
      },

      setup(props) {
        // @ts-expect-error
        let { value = 'test', update, ...comboboxProps } = props.comboboxProps ?? {}
        function isDisabled(option: any) {
          return typeof option === 'string'
            ? false
            : typeof option === 'object' && option !== null && 'disabled' in option
              ? option?.disabled ?? false
              : false
        }

        let model = ref(value)
        watch([model], () => update?.(model.value))

        return {
          value: model,
          comboboxProps,
          isDisabled,
          virtual: computed(() => {
            return virtual ? { options: props.options, disabled: isDisabled } : null
          }),
        }
      },
    })

    describe('Button', () => {
      describe('`Enter` key', () => {
        it(
          'should be possible to open the Combobox with Enter',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ disabled: true }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Try to focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            if (virtual) return // Incompatible with virtual rendering

            renderTemplate({
              template: html`
                <Combobox v-model="value">
                  <ComboboxInput />
                  <ComboboxButton>Trigger</ComboboxButton>
                  <ComboboxOptions :unmount="false">
                    <ComboboxOption value="a">Option A</ComboboxOption>
                    <ComboboxOption value="b">Option B</ComboboxOption>
                    <ComboboxOption value="c">Option C</ComboboxOption>
                  </ComboboxOptions>
                </Combobox>
              `,
              setup: () => ({ value: ref('b'), virtual }),
            })

            await new Promise<void>(nextTick)

            assertComboboxButton({
              state: ComboboxState.InvisibleHidden,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleHidden })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="[]" />`,
            })

            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null, disabled: true }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({
              state: ComboboxState.InvisibleUnmounted,
            })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="[]" />`,
            })

            assertComboboxList({
              state: ComboboxState.InvisibleUnmounted,
            })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'alice', children: 'alice', disabled: true },
                  { value: 'bob', children: 'bob', disabled: true },
                  { value: 'charlie', children: 'charlie', disabled: true },
                ],
              }),
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({
              state: ComboboxState.InvisibleUnmounted,
            })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

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
            getComboboxButton()?.focus()
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

        it(
          'should not propagate the Escape event when the combobox is open',
          suppressConsoleLogs(async () => {
            let handleKeyDown = jest.fn()
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

            window.addEventListener('keydown', handleKeyDown)

            // Open combobox
            await click(getComboboxButton())

            // Close combobox
            await press(Keys.Escape)

            // We should never see the Escape event
            expect(handleKeyDown).toHaveBeenCalledTimes(0)

            window.removeEventListener('keydown', handleKeyDown)
          })
        )

        it(
          'should propagate the Escape event when the combobox is closed',
          suppressConsoleLogs(async () => {
            let handleKeyDown = jest.fn()
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

            window.addEventListener('keydown', handleKeyDown)

            // Focus the input field
            await focus(getComboboxInput())

            // Close combobox
            await press(Keys.Escape)

            // We should never see the Escape event
            expect(handleKeyDown).toHaveBeenCalledTimes(1)

            window.removeEventListener('keydown', handleKeyDown)
          })
        )
      })

      describe('`ArrowDown` key', () => {
        it(
          'should be possible to open the combobox with ArrowDown',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{disabled:true}" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="[]" />`,
            })

            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ disabled: true }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="[]" />`,
            })

            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'alice', children: 'alice', disabled: false },
                  { value: 'bob', children: 'bob', disabled: true },
                  { value: 'charlie', children: 'charlie', disabled: true },
                ],
              }),
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the button
            getComboboxButton()?.focus()

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

    describe('Input', () => {
      describe('`Enter` key', () => {
        it(
          'should be possible to close the combobox with Enter and choose the active combobox option',
          suppressConsoleLogs(async () => {
            let handleChange = jest.fn()
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value, update }" />`,
              setup: () => {
                let model = ref(null)
                return {
                  value: model,
                  update: (value: any) => {
                    model.value = value
                    handleChange(value)
                  },
                }
              },
            })

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
            expect(handleChange).toHaveBeenCalledWith('Option A')

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

            renderTemplate({
              components: { MyCombobox },
              template: html`
                <form @submit="handleSubmit" @keyup="handleKeyUp">
                  <MyCombobox :comboboxProps="{ value, update, name: 'option' }" />
                  <button>Submit</button>
                </form>
              `,
              setup() {
                let value = ref('b')
                return {
                  value,
                  update(newValue: any) {
                    value.value = newValue
                  },
                  handleKeyUp(event: KeyboardEvent) {
                    // JSDom doesn't automatically submit the form but if we can
                    // catch an `Enter` event, we can assume it was a submit.
                    if (event.key === 'Enter') (event.currentTarget as HTMLFormElement).submit()
                  },
                  handleSubmit(event: SubmitEvent) {
                    event.preventDefault()
                    submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
                  },
                  virtual,
                }
              },
            })

            // Focus the input field
            getComboboxInput()?.focus()
            assertActiveElement(getComboboxInput())

            // Press enter (which should submit the form)
            await press(Keys.Enter)

            // Verify the form was submitted
            expect(submits).toHaveBeenCalledTimes(1)
            expect(submits).toHaveBeenCalledWith([['option', 'b']])
          })
        )

        it(
          'should submit the form on `Enter` (when no submit button was found)',
          suppressConsoleLogs(async () => {
            let submits = jest.fn()

            renderTemplate({
              components: { MyCombobox },
              template: html`
                <form @submit="handleSubmit" @keyup="handleKeyUp">
                  <MyCombobox :comboboxProps="{ value, update, name: 'option' }" />
                </form>
              `,
              setup() {
                let value = ref('b')
                return {
                  value,
                  update(newValue: any) {
                    value.value = newValue
                  },
                  handleKeyUp(event: KeyboardEvent) {
                    // JSDom doesn't automatically submit the form but if we can
                    // catch an `Enter` event, we can assume it was a submit.
                    if (event.key === 'Enter') (event.currentTarget as HTMLFormElement).submit()
                  },
                  handleSubmit(event: SubmitEvent) {
                    event.preventDefault()
                    submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
                  },
                  virtual,
                }
              },
            })

            // Focus the input field
            getComboboxInput()?.focus()
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
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <input id="before-combobox" />
                <MyCombobox :comboboxProps="{ value, update }" />
                <input id="after-combobox" />
              `,
              setup: () => {
                let value = ref(null)
                return {
                  value,
                  update(newValue: any) {
                    value.value = newValue
                  },
                }
              },
            })

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
            expect(getComboboxInput()?.value).toBe('Option B')

            // And focus has moved to the next element
            assertActiveElement(document.querySelector('#after-combobox'))
          })
        )

        it(
          'pressing Shift+Tab should select the active item and move to the previous DOM node',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <input id="before-combobox" />
                <MyCombobox :comboboxProps="{ value, update }" />
                <input id="after-combobox" />
              `,
              setup: () => {
                let value = ref(null)
                return {
                  value,
                  update(newValue: any) {
                    value.value = newValue
                  },
                }
              },
            })

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
            expect(getComboboxInput()?.value).toBe('Option B')

            // And focus has moved to the next element
            assertActiveElement(document.querySelector('#before-combobox'))
          })
        )
      })

      describe('`Escape` key', () => {
        it(
          'should be possible to close an open combobox with Escape',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

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
            if (virtual) return // Incompatible with virtual rendering

            renderTemplate({
              template: html`
                <Combobox v-model="value">
                  <ComboboxInput />
                  <ComboboxButton>Trigger</ComboboxButton>
                  <ComboboxOptions static>
                    <ComboboxOption value="a">Option A</ComboboxOption>
                    <ComboboxOption value="b">Option B</ComboboxOption>
                    <ComboboxOption value="c">Option C</ComboboxOption>
                  </ComboboxOptions>
                </Combobox>
              `,
              setup: () => ({ value: ref(null), virtual }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :useComboboxOptions="false" />`,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            // Open combobox
            await click(getComboboxButton())

            // Verify the input has the selected value
            expect(getComboboxInput()?.value).toBe('Option B')

            // Override the input by typing something
            await type(word('test'), getComboboxInput())
            expect(getComboboxInput()?.value).toBe('test')

            // Close combobox
            await press(Keys.Escape)

            // Verify the input is reset correctly
            expect(getComboboxInput()?.value).toBe('Option B')
          })
        )
      })

      describe('`ArrowDown` key', () => {
        it(
          'should be possible to open the combobox with ArrowDown',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null, disabled: true }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="[]" />`,
            })

            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: false },
                  { value: 'c', children: 'Option C', disabled: false },
                ],
              }),
            })

            render

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: false },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ disabled: true }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="[]" />`,
            })

            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: false },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                ],
              }),
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: false },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
            })

            assertComboboxButton({
              state: ComboboxState.InvisibleUnmounted,
              attributes: { id: 'headlessui-combobox-button-2' },
            })
            assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: false },
                  { value: 'b', children: 'Option B', disabled: false },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: false },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox />`,
            })

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
          'should be possible to use the PageDown key to go to the last non disabled Combobox option',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: false },
                  { value: 'b', children: 'Option B', disabled: false },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: false },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
            })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: false },
                  { value: 'd', children: 'Option D', disabled: false },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: false },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
            })

            // Focus the input
            getComboboxInput()?.focus()

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: false },
                  { value: 'd', children: 'Option D', disabled: false },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: false },
                ],
              }),
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`<MyCombobox :options="options" />`,
              setup: () => ({
                options: [
                  { value: 'a', children: 'Option A', disabled: true },
                  { value: 'b', children: 'Option B', disabled: true },
                  { value: 'c', children: 'Option C', disabled: true },
                  { value: 'd', children: 'Option D', disabled: true },
                ],
              }),
            })

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

      describe('`Backspace` key', () => {
        it(
          'should reset the value when the last character is removed, when in `nullable` mode',
          suppressConsoleLogs(async () => {
            let handleChange = jest.fn()
            renderTemplate({
              template: html`
                <Combobox v-model="value" nullable>
                  <ComboboxInput />
                  <ComboboxButton>Trigger</ComboboxButton>
                  <ComboboxOptions>
                    <ComboboxOption :order="virtual ? 1 : undefined" value="alice"
                      >Alice</ComboboxOption
                    >
                    <ComboboxOption :order="virtual ? 1 : undefined" value="bob"
                      >Bob</ComboboxOption
                    >
                    <ComboboxOption :order="virtual ? 1 : undefined" value="charlie"
                      >Charlie</ComboboxOption
                    >
                  </ComboboxOptions>
                </Combobox>
              `,
              setup: () => {
                let value = ref('bob')
                watch([value], () => handleChange(value.value))
                return { value, virtual }
              },
            })

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

            // Verify that we don't have an selected option anymore since we are in `nullable` mode
            assertNotActiveComboboxOption(options[1])
            assertNoSelectedComboboxOption()

            // Verify that we saw the `null` change coming in
            expect(handleChange).toHaveBeenCalledTimes(1)
            expect(handleChange).toHaveBeenCalledWith(null)
          })
        )
      })

      describe('`Any` key aka search', () => {
        let MyCombobox = defineComponent({
          components: getDefaultComponents(),

          template: html`
            <Combobox v-if="!virtual" v-model="value" by="value">
              <ComboboxInput @change="setQuery" />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption
                  v-for="(person, idx) in filteredPeople"
                  :key="person.value"
                  v-bind="person"
                  :value="person"
                >
                  {{ person.name }}
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
            <Combobox v-if="virtual" :virtual="virtual" v-model="value" by="value">
              <ComboboxInput @change="setQuery" />
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions v-slot="{ option: person }">
                <ComboboxOption v-bind="person" :value="person">{{ person.name }}</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,

          props: {
            people: {
              type: Array as PropType<{ value: string; name: string; disabled: boolean }[]>,
              required: true,
            },
          },

          setup(props) {
            let value = ref<string | null>(null)
            let query = ref('')
            let filteredPeople = computed(() => {
              return query.value === ''
                ? props.people
                : props.people.filter((person) =>
                    person.name.toLowerCase().includes(query.value.toLowerCase())
                  )
            })

            return {
              value,
              query,
              filteredPeople,
              setQuery: (event: Event & { target: HTMLInputElement }) => {
                query.value = event.target.value
              },
              virtual: computed(() => {
                return virtual
                  ? {
                      options: filteredPeople.value,
                      disabled: (person: { value: string; name: string; disabled: boolean }) =>
                        person?.disabled ?? false,
                    }
                  : null
              }),
            }
          },
        })

        it(
          'should be possible to type a full word that has a perfect match',
          suppressConsoleLogs(async () => {
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <MyCombobox
                  :people="[
                    { value: 'alice', name: 'alice', disabled: false },
                    { value: 'bob', name: 'bob', disabled: false },
                    { value: 'charlie', name: 'charlie', disabled: false },
                  ]"
                />
              `,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <MyCombobox
                  :people="[
                    { value: 'alice', name: 'alice', disabled: false },
                    { value: 'bob', name: 'bob', disabled: false },
                    { value: 'charlie', name: 'charlie', disabled: false },
                  ]"
                />
              `,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <MyCombobox
                  :people="[
                    { value: 'alice', name: 'alice jones', disabled: false },
                    { value: 'bob', name: 'bob the builder', disabled: false },
                    { value: 'charlie', name: 'charlie bit me', disabled: false },
                  ]"
                />
              `,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <MyCombobox
                  :people="[
                    { value: 'alice', name: 'alice', disabled: false },
                    { value: 'bob', name: 'bob', disabled: true },
                    { value: 'charlie', name: 'charlie', disabled: false },
                  ]"
                />
              `,
            })

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
            renderTemplate({
              components: { MyCombobox },
              template: html`
                <MyCombobox
                  :people="[
                    { value: 'a', name: 'person a', disabled: false },
                    { value: 'b', name: 'person b', disabled: false },
                    { value: 'c', name: 'person c', disabled: false },
                  ]"
                />
              `,
            })

            // Open combobox
            await click(getComboboxButton())

            let options: ReturnType<typeof getComboboxOptions>

            options = getComboboxOptions()
            expect(options[0]).toHaveTextContent('person a')
            assertActiveComboboxOption(options[0])

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

    it(
      'should sync the active index properly',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" v-slot="{ activeIndex }">
              <ComboboxInput @input="filter" />
              <ComboboxButton>Trigger</ComboboxButton>
              <span data-test="idx">{{ activeIndex }}</span>
              <ComboboxOptions>
                <ComboboxOption v-for="(option, idx) in options" :value="option" :key="option"
                  >{{ option }}</ComboboxOption
                >
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => {
            let value = ref(null)
            let options = ref(['Option A', 'Option B', 'Option C', 'Option D'])

            let query = ref('')
            let filteredOptions = computed(() => {
              return query.value === ''
                ? options.value
                : options.value.filter((option) => option.includes(query.value))
            })

            function filter(event: Event & { target: HTMLInputElement }) {
              query.value = event.target.value
            }

            return { value, options: filteredOptions, filter, virtual }
          },
        })

        // Open combobox
        await click(getComboboxButton())

        let activeIndexEl = document.querySelector('[data-test="idx"]')
        function activeIndex() {
          return Number(activeIndexEl?.innerHTML)
        }

        expect(activeIndex()).toEqual(0)

        let options: ReturnType<typeof getComboboxOptions>

        await focus(getComboboxInput())
        await type(word('Option B'))

        // Option B should be active
        options = getComboboxOptions()
        expect(options[activeIndex()]).toHaveTextContent('Option B')
        assertActiveComboboxOption(options[activeIndex()])
        await press(Keys.Enter)

        // Reveal all options again
        await type(word('Option'))

        // Option B should still be active
        options = getComboboxOptions()
        expect(options[activeIndex()]).toHaveTextContent('Option B')
        assertActiveComboboxOption(options[activeIndex()])
      })
    )
  }
)

describe.each([{ virtual: true }, { virtual: false }])('Mouse interactions %s', ({ virtual }) => {
  let data = ['Option A', 'Option B', 'Option C']
  let MyCombobox = defineComponent({
    components: getDefaultComponents(),
    template: html`
      <Combobox
        :nullable
        v-if="virtual !== null"
        :virtual="virtual"
        v-model="value"
        v-bind="comboboxProps"
      >
        <ComboboxLabel v-if="label">Label</ComboboxLabel>
        <ComboboxInput v-bind="inputProps" />
        <ComboboxButton v-bind="buttonProps">Trigger</ComboboxButton>
        <ComboboxOptions v-if="useComboboxOptions" v-bind="optionsProps" v-slot="{ option }">
          <ComboboxOption v-bind="optionProps" :value="option">
            {{ option?.children ?? option }}
          </ComboboxOption>
        </ComboboxOptions>
      </Combobox>

      <Combobox v-if="virtual === null" v-model="value" v-bind="comboboxProps">
        <ComboboxLabel v-if="label">Label</ComboboxLabel>
        <ComboboxInput v-bind="inputProps" />
        <ComboboxButton v-bind="buttonProps">Trigger</ComboboxButton>
        <ComboboxOptions v-if="useComboboxOptions" v-bind="optionsProps">
          <ComboboxOption
            v-for="(option, idx) in options"
            :key="idx"
            :disabled="isDisabled(option)"
            v-bind="optionProps"
            :value="option"
          >
            {{ option?.children ?? option }}
          </ComboboxOption>
        </ComboboxOptions>
      </Combobox>
    `,

    props: {
      options: { default: data.slice() },
      label: { default: true },
      useComboboxOptions: { default: true },
      comboboxProps: {},
      inputProps: { default: {} },
      buttonProps: { default: {} },
      optionProps: { default: {} },
      optionsProps: { default: {} },
    },

    setup(props) {
      // @ts-expect-error
      let { value = 'test', update, ...comboboxProps } = props.comboboxProps ?? {}
      function isDisabled(option: any) {
        return typeof option === 'string'
          ? false
          : typeof option === 'object' && option !== null && 'disabled' in option
            ? option?.disabled ?? false
            : false
      }

      let model = ref(value)
      watch([model], () => update?.(model.value))

      return {
        value: model,
        comboboxProps,
        isDisabled,
        virtual: computed(() => {
          return virtual ? { options: props.options, disabled: isDisabled } : null
        }),
      }
    },
  })

  it(
    'should focus the ComboboxButton when we click the ComboboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
      })

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getComboboxLabel())

      // Ensure that the actual button is focused instead
      assertActiveElement(getComboboxInput())
    })
  )

  it(
    'should not focus the ComboboxInput when we right click the ComboboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ value: null }" />`,
      })

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getComboboxLabel(), MouseButton.Right)

      // Ensure that the body is still active
      assertActiveElement(document.body)
    })
  )

  it(
    'should be possible to open the combobox by focusing the input with immediate mode enabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :label="false" :comboboxProps="{ immediate: true }" />`,
      })

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-2' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Focus the input
      await focus(getComboboxInput())

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
    'should not be possible to open the combobox by focusing the input with immediate mode disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-3' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Focus the input
      await focus(getComboboxInput())

      // Verify it is invisible
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
      assertComboboxList({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-options-3' },
      })
    })
  )

  it(
    'should not be possible to open the combobox by focusing the input with immediate mode enabled when button is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ immediate: true, disabled: true }" />`,
      })

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-3' },
      })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Focus the input
      await focus(getComboboxInput())

      // Verify it is invisible
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
      assertComboboxList({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-options-3' },
      })
    })
  )

  it(
    'should be possible to close a combobox on click with immediate mode enabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ immediate: true }" />`,
      })

      // Open combobox
      await click(getComboboxButton())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })

      // Click to close
      await click(getComboboxButton())

      // Verify it is closed
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      assertActiveElement(getComboboxInput())
    })
  )

  it(
    'should be possible to close a focused combobox on click with immediate mode enabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ immediate: true }" />`,
      })
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })

      // Open combobox by focusing input
      await focus(getComboboxInput())
      assertActiveElement(getComboboxInput())

      // Verify it is visible
      assertComboboxButton({ state: ComboboxState.Visible })

      // Click to close
      await click(getComboboxButton())

      // Verify it is closed
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      assertActiveElement(getComboboxInput())
    })
  )

  it(
    'should be possible to open the combobox on click',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :label="false" />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :label="false" />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox
          :comboboxProps="{ value: null, disabled: true }"
          :label="false"
        />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ value: 'Option B' }" :label="false" />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`
          <MyCombobox />
          <div tabindex="-1" data-test-focusable>after</div>
        `,
      })

      // Open combobox
      await click(getComboboxButton())
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      // Click something that is not related to the combobox
      await click(getByText('after'))

      // Should be closed now
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })

      // Verify the input is focused again
      assertActiveElement(getByText('after'))
    })
  )

  it(
    'should be possible to click outside of the combobox on another combobox button which should close the current combobox and open the new combobox',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`
          <div>
            <MyCombobox />
            <MyCombobox />
          </div>
        `,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`
          <div>
            <MyCombobox :inputProps="{ onFocus }" />
            <button id="btn">
              <span>Next</span>
            </button>
          </div>
        `,
        setup: () => ({
          onFocus: focusFn,
        }),
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      if (virtual) return // Incompatible with virtual rendering

      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions static>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null), virtual }),
      })

      await nextTick()

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :options="options" />`,
        setup: () => ({
          options: [
            { value: 'alice', children: 'alice', disabled: false },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie', disabled: false },
          ],
        }),
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :options="options" />`,
        setup: () => ({
          options: [
            { value: 'alice', children: 'alice', disabled: false },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie', disabled: false },
          ],
        }),
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox />`,
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :options="options" />`,
        setup: () => ({
          options: [
            { value: 'alice', children: 'alice', disabled: false },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie', disabled: false },
          ],
        }),
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ value, update }" />`,
        setup: () => {
          let value = ref(null)
          return {
            value,
            update(newValue: any) {
              value.value = newValue
              handleChange(newValue)
            },
          }
        },
      })

      // Open combobox
      await click(getComboboxButton())
      assertComboboxList({ state: ComboboxState.Visible })
      assertActiveElement(getComboboxInput())

      let options = getComboboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('Option B')

      // Verify the input is focused again
      assertActiveElement(getComboboxInput())

      // Open combobox again
      await click(getComboboxButton())

      // Verify the active option is the previously selected one
      assertActiveComboboxOption(getComboboxOptions()[1])
    })
  )

  it(
    'should be possible to click a combobox option, which closes the combobox with immediate mode enabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ immediate: true }" />`,
      })

      // Open combobox by focusing input
      await focus(getComboboxInput())
      assertActiveElement(getComboboxInput())

      assertComboboxList({ state: ComboboxState.Visible })

      let options = getComboboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertComboboxList({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click a disabled combobox option, which is a no-op',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :options="options" :comboboxProps="{ value, update }" />`,
        setup: () => {
          let value = ref(null)
          return {
            value,
            options: [
              { value: 'alice', children: 'Alice', disabled: false },
              { value: 'bob', children: 'Bob', disabled: true },
              { value: 'charile', children: 'Charlie', disabled: false },
            ],
            update(newValue: any) {
              value.value = newValue
              handleChange(newValue)
            },
          }
        },
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :comboboxProps="{ value, update }" />`,
        setup: () => {
          let value = ref(null)
          return {
            value,
            update(newValue: any) {
              value.value = newValue
            },
          }
        },
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :options="options" />`,
        setup: () => ({
          options: [
            { value: 'alice', disabled: false, children: 'alice' },
            { value: 'bob', disabled: true, children: 'bob' },
            { value: 'charlie', disabled: false, children: 'charlie' },
          ],
        }),
      })

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
      renderTemplate({
        components: { MyCombobox },
        template: html`<MyCombobox :optionsProps="{ hold: true }" :label="false" />`,
      })

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
    'should sync the input field correctly and reset it when resetting the value from outside (to null)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-if="!virtual" v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
          <Combobox v-if="virtual" :virtual="virtual" v-model="value">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions v-slot="{ option }">
              <ComboboxOption :value="option">{{ option }}</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
          <button @click="value = null">reset</button>
        `,
        setup: () => ({
          value: ref('bob'),
          virtual: computed(() => (virtual ? { options: ['alice', 'bob', 'charlie'] } : null)),
        }),
      })

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
    'should sync the input field correctly and reset it when resetting the value from outside (to undefined)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-if="virtual" :virtual="virtual" v-model="value">
            <ComboboxInput :displayValue="person => person?.name" />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions v-slot="{ option: person }">
              <ComboboxOption :value="person">{{ person.name }}</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
          <Combobox v-if="!virtual" v-model="value">
            <ComboboxInput :displayValue="person => person?.name" />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption v-for="(person, idx) in people" :key="person.id" :value="person"
                >{{ person.name }}</ComboboxOption
              >
            </ComboboxOptions>
          </Combobox>
          <button @click="value = null">reset</button>
        `,
        setup: () => {
          let people = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
          ]

          return {
            people,
            value: ref(people[1]),
            virtual: computed(() => (virtual ? { options: people } : null)),
          }
        },
      })
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

  it(
    'should sync the input field correctly and reset it when resetting the value from outside (when using displayValue)',
    suppressConsoleLogs(async () => {
      let people = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]
      renderTemplate({
        components: { MyCombobox },
        template: html`
          <MyCombobox
            :options="people"
            :comboboxProps="{ value, update }"
            :inputProps="{displayValue: (person) => person?.name}"
          />
          <button @click="value = null">reset</button>
        `,
        setup: () => {
          let value = ref(people[1])
          return {
            value,
            update(newValue: any) {
              value.value = newValue
            },
          }
        },
      })

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
      renderTemplate({
        template: html`
          <Combobox v-model="value" multiple>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

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
      renderTemplate({
        template: html`
          <Combobox v-model="value" multiple>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

      // Open combobox
      await click(getComboboxButton())

      // Verify that bob is the active option
      assertActiveComboboxOption(getComboboxOptions()[1])
    })
  )

  it(
    'should keep the combobox open when selecting an item via the keyboard',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value" multiple>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

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
      renderTemplate({
        template: html`
          <Combobox v-model="value" multiple>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

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

  it(
    'should toggle the selected state of an option when clicking on it (using objects instead of primitives)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value" multiple>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption v-for="person in people" :value="person"
                >{{ person.name }}</ComboboxOption
              >
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => {
          let people = [
            { id: 1, name: 'alice' },
            { id: 2, name: 'bob' },
            { id: 3, name: 'charlie' },
          ]

          let value = ref([people[1], people[2]])
          return { people, value }
        },
      })

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

  it(
    'should reset the active option, if the active option gets unmounted',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value" multiple>
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption
                v-for="user in users.filter(p => !value.includes(p))"
                :key="user"
                :value="user"
                >{{ user }}</ComboboxOption
              >
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => {
          let users = ['alice', 'bob', 'charlie']

          let value = ref([])
          return { users, value }
        },
      })

      // Open combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })

      let options = getComboboxOptions()

      // Go to the next option
      await press(Keys.ArrowDown)
      assertActiveComboboxOption(options[1])

      // Select the option
      await press(Keys.Enter)

      // The active option is reset to the very first one
      assertActiveComboboxOption(options[0])
    })
  )
})

describe('Form compatibility', () => {
  it('should be possible to set the `form`, which is forwarded to the hidden inputs', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <div>
          <Combobox form="my-form" v-model="value" name="delivery">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="pickup">Pickup</ComboboxOption>
              <ComboboxOption value="home-delivery">Home delivery</ComboboxOption>
              <ComboboxOption value="dine-in">Dine in</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
          <form id="my-form" @submit="handleSubmit">
            <button>Submit</button>
          </form>
        </div>
      `,
      setup: () => {
        let value = ref(null)
        return {
          value,
          handleSubmit(event: SubmitEvent) {
            event.preventDefault()
            submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
          },
        }
      },
    })

    // Open combobox
    await click(getComboboxButton())

    // Choose pickup
    await click(getByText('Pickup'))

    // Submit the form
    await click(getByText('Submit'))

    expect(submits).lastCalledWith([['delivery', 'pickup']])
  })

  it('should be possible to submit a form with a value', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <form @submit="handleSubmit">
          <Combobox v-model="value" name="delivery">
            <ComboboxInput />
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="pickup">Pickup</ComboboxOption>
              <ComboboxOption value="home-delivery">Home delivery</ComboboxOption>
              <ComboboxOption value="dine-in">Dine in</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
          <button>Submit</button>
        </form>
      `,
      setup: () => {
        let value = ref(null)
        return {
          value,
          handleSubmit(event: SubmitEvent) {
            event.preventDefault()
            submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
          },
        }
      },
    })

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

    renderTemplate({
      template: html`
        <form @submit="handleSubmit">
          <Combobox v-model="value" name="delivery">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxInput />
            <ComboboxOptions>
              <ComboboxOption v-for="option in options" :key="option.id" :value="option"
                >{{option.label}}</ComboboxOption
              >
            </ComboboxOptions>
          </Combobox>
          <button>Submit</button>
        </form>
      `,
      setup: () => {
        let options = ref([
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
        ])
        let value = ref(options.value[0])

        return {
          value,
          options,
          handleSubmit(event: SubmitEvent) {
            event.preventDefault()
            submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
          },
        }
      },
    })

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
