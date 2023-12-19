import { defineComponent, h, nextTick, reactive, ref, watch } from 'vue'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
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
import { html } from '../../test-utils/html'
import {
  Keys,
  MouseButton,
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
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from './listbox'

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

const renderTemplate = createRenderTemplate({
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
})

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
        template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value" v-slot="{ open }">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions v-show="open">
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: html`
            <Listbox v-model="value" disabled>
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
        let options = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Charlie' },
        ]

        renderTemplate({
          template: html`
            <Listbox multiple name="abc">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption
                  v-for="option in options"
                  :key="option.id"
                  :value="option"
                  v-slot="data"
                  >{{ JSON.stringify(data) }}</ListboxOption
                >
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => {
            let value = ref(options[1])
            return { options, value }
          },
        })

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
          renderTemplate({
            template: html`
              <Listbox v-model="value">
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ListboxOption
                  >
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref(options[1])
              return { options, value }
            },
          })

          await click(getListboxButton())

          let bob = getListboxOptions()[1]
          expect(bob).toHaveTextContent(
            JSON.stringify({ active: true, selected: true, disabled: false })
          )
        })
      )

      it(
        'should be possible to compare objects by a field',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Listbox v-model="value" by="id">
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ListboxOption
                  >
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref({ id: 2, name: 'Bob' })
              return { options, value }
            },
          })

          await click(getListboxButton())

          let bob = getListboxOptions()[1]
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
              <Listbox v-model="value" :by="compare">
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption
                    v-for="option in options"
                    :key="option.id"
                    :value="option"
                    v-slot="data"
                    >{{ JSON.stringify(data) }}</ListboxOption
                  >
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref({ id: 2, name: 'Bob' })
              return { options, value, compare: (a: any, z: any) => a.id === z.id }
            },
          })

          await click(getListboxButton())

          let bob = getListboxOptions()[1]
          expect(bob).toHaveTextContent(
            JSON.stringify({ active: true, selected: true, disabled: false })
          )
        })
      )

      it(
        'should be possible to use the by prop (as a string) with a null initial value',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Listbox v-model="value" by="id">
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption :value="{ id: 1, name: 'alice' }">alice</ListboxOption>
                  <ListboxOption :value="{ id: 2, name: 'bob' }">bob</ListboxOption>
                  <ListboxOption :value="{ id: 3, name: 'charlie' }">charlie</ListboxOption>
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref(null)
              return { options, value }
            },
          })

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
          renderTemplate({
            template: html`
              <Listbox v-model="value" by="id">
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption :value="null" disabled>Please select an option</ListboxOption>
                  <ListboxOption :value="{ id: 1, name: 'alice' }">alice</ListboxOption>
                  <ListboxOption :value="{ id: 2, name: 'bob' }">bob</ListboxOption>
                  <ListboxOption :value="{ id: 3, name: 'charlie' }">charlie</ListboxOption>
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref(null)
              return { options, value }
            },
          })

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
          renderTemplate({
            template: html`
              <Listbox v-model="value" by="id">
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption :value="{ id: 1, name: 'alice' }">alice</ListboxOption>
                  <ListboxOption :value="{ id: 2, name: 'bob' }">bob</ListboxOption>
                  <ListboxOption :value="{ id: 3, name: 'charlie' }">charlie</ListboxOption>
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref({ id: 2, name: 'Bob' })
              return { options, value }
            },
          })

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
          renderTemplate({
            template: html`
              <Listbox v-model="value" by="id" multiple>
                <ListboxButton>Trigger</ListboxButton>
                <ListboxOptions>
                  <ListboxOption :value="{ id: 1, name: 'alice' }">alice</ListboxOption>
                  <ListboxOption :value="{ id: 2, name: 'bob' }">bob</ListboxOption>
                  <ListboxOption :value="{ id: 3, name: 'charlie' }">charlie</ListboxOption>
                </ListboxOptions>
              </Listbox>
            `,
            setup: () => {
              let value = ref([{ id: 2, name: 'Bob' }])
              return { options, value }
            },
          })

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
        renderTemplate({
          template: html`
            <Listbox v-model="value" by="id">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption :value="{ id: 1, name: 'alice' }">alice</ListboxOption>
                <ListboxOption :value="{ id: 2, name: 'bob' }">bob</ListboxOption>
                <ListboxOption :value="{ id: 3, name: 'charlie' }">charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: null }),
        })

        assertListboxButton({ state: ListboxState.InvisibleUnmounted })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({ state: ListboxState.Visible })
        assertListbox({ state: ListboxState.Visible })
      })
    )
  })

  describe('ListboxLabel', () => {
    it(
      'should be possible to render a ListboxLabel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false, disabled: false }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
        assertListbox({ state: ListboxState.Visible })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    it(
      'should be possible to render a ListboxLabel using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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
          textContent: JSON.stringify({ open: false, disabled: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true, disabled: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )
  })

  describe('ListboxButton', () => {
    it(
      'should be possible to render a ListboxButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, disabled: false, value: null }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, disabled: false, value: null }),
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to render a ListboxButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton as="div" role="button" v-slot="data"
                >{{JSON.stringify(data)}}</ListboxButton
              >
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, disabled: false, value: null }),
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Visible,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, disabled: false, value: null }),
        })
        assertListbox({ state: ListboxState.Visible })
      })
    )

    it(
      'should be possible to render a ListboxButton and a ListboxLabel and see them linked together',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getListboxButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton type="submit"> Trigger </ListboxButton>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getListboxButton()).toHaveAttribute('type', 'submit')
      })

      it(
        'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Listbox v-model="value">
                <ListboxButton :as="CustomButton"> Trigger </ListboxButton>
              </Listbox>
            `,
            setup: () => ({
              value: ref(null),
              CustomButton: defineComponent({
                setup: (props) => () => h('button', { ...props }),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getListboxButton()).toHaveAttribute('type', 'button')
        })
      )

      it('should not set the type if the "as" prop is not a "button"', async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton as="div"> Trigger </ListboxButton>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getListboxButton()).not.toHaveAttribute('type')
      })

      it(
        'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Listbox v-model="value">
                <ListboxButton :as="CustomButton"> Trigger </ListboxButton>
              </Listbox>
            `,
            setup: () => ({
              value: ref(null),
              CustomButton: defineComponent({
                setup: (props) => () => h('div', props),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getListboxButton()).not.toHaveAttribute('type')
        })
      )
    })
  })

  describe('ListboxOptions', () => {
    it(
      'should be possible to render ListboxOptions using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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

    it('should be possible to always render the ListboxOptions if we provide it a `static` prop', () => {
      renderTemplate({
        template: html`
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

    it('should be possible to use a different render strategy for the ListboxOptions', async () => {
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions :unmount="false">
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      await new Promise<void>(nextTick)

      assertListbox({ state: ListboxState.InvisibleHidden })

      // Let's open the Listbox, to see if it is not hidden anymore
      await click(getListboxButton())

      assertListbox({ state: ListboxState.Visible })
    })
  })

  describe('ListboxOption', () => {
    it(
      'should be possible to render a ListboxOption using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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
          textContent: JSON.stringify({ active: false, selected: false, disabled: false }),
        })
      })
    )
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    let props = reactive({ hide: false })

    renderTemplate({
      template: html`
        <Listbox v-model="value">
          <ListboxButton>Trigger</ListboxButton>
          <ListboxOptions>
            <ListboxOption value="a">Option 1</ListboxOption>
            <ListboxOption v-if="!hide" value="b">Option 2</ListboxOption>
            <ListboxOption value="c">Option 3</ListboxOption>
          </ListboxOptions>
        </Listbox>
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

    // Open the Listbox
    await click(getByText('Trigger'))

    props.hide = true
    await nextFrame()

    props.hide = false
    await nextFrame()

    assertListbox({ state: ListboxState.Visible })

    let options = getListboxOptions()

    // Focus the first option
    await press(Keys.ArrowDown)

    // Verify that the first listbox option is active
    assertActiveListboxOption(options[0])

    await press(Keys.ArrowDown)

    // Verify that the second listbox option is active
    assertActiveListboxOption(options[1])

    await press(Keys.ArrowDown)

    // Verify that the third listbox option is active
    assertActiveListboxOption(options[2])
  })

  describe('Uncontrolled', () => {
    it('should be possible to use in an uncontrolled way', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Listbox name="assignee">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">Alice</ListboxOption>
                <ListboxOption value="bob">Bob</ListboxOption>
                <ListboxOption value="charlie">Charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
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

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Listbox name="assignee" v-slot="{ value }">
              <div data-testid="value">{{value}}</div>
              <ListboxButton v-slot="{ value }">
                Trigger
                <div data-testid="value-2">{{value}}</div>
              </ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">Alice</ListboxOption>
                <ListboxOption value="bob">Bob</ListboxOption>
                <ListboxOption value="charlie">Charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
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

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])
      expect(document.querySelector('[data-testid="value"]')).toHaveTextContent('alice')
      expect(document.querySelector('[data-testid="value-2"]')).toHaveTextContent('alice')

      // Submit
      await click(document.getElementById('submit'))

      // Alice should be submitted
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'alice' })

      // Open listbox
      await click(getListboxButton())

      // Choose charlie
      await click(getListboxOptions()[2])
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
            <Listbox name="assignee" defaultValue="bob">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">Alice</ListboxOption>
                <ListboxOption value="bob">Bob</ListboxOption>
                <ListboxOption value="charlie">Charlie</ListboxOption>
              </ListboxOptions>
            </Listbox>
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

      // Open listbox
      await click(getListboxButton())

      // Choose alice
      await click(getListboxOptions()[0])

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
              <Listbox name="assignee" defaultValue="bob">
                <ListboxButton v-slot="{ value }">{{ value ?? 'Trigger' }}</ListboxButton>
                <ListboxOptions>
                  <ListboxOption value="alice">Alice</ListboxOption>
                  <ListboxOption value="bob">Bob</ListboxOption>
                  <ListboxOption value="charlie">Charlie</ListboxOption>
                </ListboxOptions>
              </Listbox>
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
              <Listbox name="assignee" :defaultValue="{ id: 2, name: 'bob', label: 'Bob' }" by="id">
                <ListboxButton v-slot="{ value }">{{ value ?? 'Trigger' }}</ListboxButton>
                <ListboxOptions>
                  <ListboxOption v-for="person in data" :key="person.id" :value="person">
                    {{ person.label }}
                  </ListboxOption>
                <ListboxOptions>
              </Listbox>
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
    )

    it('should be possible to reset to the default value in multiple mode', async () => {
      let data = ['alice', 'bob', 'charlie']
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Listbox name="assignee" :defaultValue="['bob']" multiple>
              <ListboxButton v-slot="{ value }">{{ value.join(', ') || 'Trigger' }}</ListboxButton>
              <ListboxOptions>
                <ListboxOption v-for="person in data" :key="person" :value="person">
                  {{ person }}
                </ListboxOption>
              </ListboxOptions>
            </Listbox>
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
          <Listbox name="assignee" @update:modelValue="handleChange">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">Alice</ListboxOption>
              <ListboxOption value="bob">Bob</ListboxOption>
              <ListboxOption value="charlie">Charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ handleChange }),
      })

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

  it(
    'should be possible to use a custom component using the `as` prop without crashing',
    suppressConsoleLogs(async () => {
      let CustomComponent = defineComponent({
        template: html`<button><slot /></button>`,
      })

      renderTemplate({
        template: html`
          <Listbox name="assignee">
            <ListboxButton />
            <ListboxOptions>
              <ListboxOption :as="CustomComponent" value="alice">Alice</RadioGroupOption>
              <ListboxOption :as="CustomComponent" value="bob">Bob</RadioGroupOption>
              <ListboxOption :as="CustomComponent" value="charlie">Charlie</RadioGroupOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ CustomComponent }),
      })

      // Open listbox
      await click(getListboxButton())
    })
  )
})

describe('Rendering composition', () => {
  it(
    'should be possible to swap the Listbox option with a button for example',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption as="button" value="a"> Option A </ListboxOption>
              <ListboxOption as="button" value="b"> Option B </ListboxOption>
              <ListboxOption as="button" value="c"> Option C </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
    'should always open the ListboxOptions because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Listbox>
            <ListboxButton>Trigger</ListboxButton>
            <OpenClosedWrite :open="true">
              <ListboxOptions v-slot="data"> {{JSON.stringify(data)}} </ListboxOptions>
            </OpenClosedWrite>
          </Listbox>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Listbox is visible
      assertListbox({ state: ListboxState.Visible })

      // Let's try and open the Listbox
      await click(getListboxButton())

      // Verify the Listbox is still visible
      assertListbox({ state: ListboxState.Visible })
    })
  )

  it(
    'should always close the ListboxOptions because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Listbox>
            <ListboxButton>Trigger</ListboxButton>
            <OpenClosedWrite :open="false">
              <ListboxOptions v-slot="data"> {{JSON.stringify(data)}} </ListboxOptions>
            </OpenClosedWrite>
          </Listbox>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Listbox is hidden
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Let's try and open the Listbox
      await click(getListboxButton())

      // Verify the Listbox is still hidden
      assertListbox({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to read the OpenClosed state',
    suppressConsoleLogs(async () => {
      let readFn = jest.fn()
      renderTemplate({
        components: { OpenClosedRead },
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <OpenClosedRead @read="readFn">
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
              </ListboxOptions>
            </OpenClosedRead>
          </Listbox>
        `,
        setup() {
          return { value: ref(null), readFn }
        },
      })

      await new Promise<void>(nextTick)

      // Verify the Listbox is hidden
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Let's toggle the Listbox 3 times
      await click(getListboxButton())
      await click(getListboxButton())
      await click(getListboxButton())

      // Verify the Listbox is visible
      assertListbox({ state: ListboxState.Visible })

      expect(readFn).toHaveBeenCalledTimes(3)
      expect(readFn).toHaveBeenNthCalledWith(1, State.Open)
      expect(readFn).toHaveBeenNthCalledWith(2, State.Closed)
      expect(readFn).toHaveBeenNthCalledWith(3, State.Open)
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the listbox with Enter',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value" disabled>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions :unmount="false">
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref('b') }),
        })

        await new Promise<void>(nextTick)

        assertListboxButton({
          state: ListboxState.InvisibleHidden,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleHidden })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption v-for="option in options" key="option.id" :value="option"
                  >{{ option.name }}</ListboxOption
                >
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => {
            let options = [
              { id: 'a', name: 'Option A' },
              { id: 'b', name: 'Option B' },
              { id: 'c', name: 'Option C' },
            ]
            let value = ref(options[1])

            return { value, options }
          },
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

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
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
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
        renderTemplate({
          template: html`
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
            let value = ref(null)
            watch([value], () => handleChange(value.value))
            return { value }
          },
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value" disabled>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Space)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

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
        let handleChange = jest.fn()
        renderTemplate({
          template: html`
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
            let value = ref(null)
            watch([value], () => handleChange(value.value))
            return { value }
          },
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
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
        renderTemplate({
          template: html`
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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.Enter)

        // Verify it is open
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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value" disabled>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowDown)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value" horizontal>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value" disabled>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions />
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

        // Open listbox
        await press(Keys.ArrowUp)

        // Verify it is open
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
        renderTemplate({
          template: html`
            <Listbox v-model="value" horizontal>
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
          state: ListboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.InvisibleUnmounted })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon End key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
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
          template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getListboxButton()?.focus()

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[0])
      })
    )

    it(
      'should have no active listbox option upon PageDown key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
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
          template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
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

        let options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the Home key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon Home key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
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
          template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
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

        let options = getListboxOptions()

        // We should be on the first non-disabled option
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should be possible to use the PageUp key to go to the last listbox option if that is the only non-disabled listbox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
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

        let options = getListboxOptions()
        assertActiveListboxOption(options[3])
      })
    )

    it(
      'should have no active listbox option upon PageUp key press, when there are no non-disabled listbox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption disabled value="a"> Option A </ListboxOption>
                <ListboxOption disabled value="b"> Option B </ListboxOption>
                <ListboxOption disabled value="c"> Option C </ListboxOption>
                <ListboxOption disabled value="d"> Option D </ListboxOption>
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
          template: html`
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
        renderTemplate({
          template: html`
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
        renderTemplate({
          template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="alice">alice</ListboxOption>
                <ListboxOption disabled value="bob"> bob </ListboxOption>
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
        renderTemplate({
          template: html`
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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">alice</ListboxOption>
                <ListboxOption value="b">bob</ListboxOption>
                <ListboxOption value="c">charlie</ListboxOption>
                <ListboxOption value="b">bob</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
        renderTemplate({
          template: html`
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">alice</ListboxOption>
                <ListboxOption value="b">bob</ListboxOption>
                <ListboxOption value="c">charlie</ListboxOption>
                <ListboxOption value="b">bob</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

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
    'should focus the ListboxButton when we click the ListboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
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
    'should not focus the ListboxButton when we right click the ListboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
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
      await click(getListboxLabel(), MouseButton.Right)

      // Ensure that the body is still active
      assertActiveElement(document.body)
    })
  )

  it(
    'should be possible to open the listbox on click',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
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
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open listbox
      await click(getListboxButton())

      // Verify it is open
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
      renderTemplate({
        template: html`
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
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Try to open the menu
      await click(getListboxButton(), MouseButton.Right)

      // Verify it is still closed
      assertListboxButton({ state: ListboxState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open the listbox on click when the button is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Listbox v-model="value" disabled>
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
      renderTemplate({
        template: html`
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
        state: ListboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.InvisibleUnmounted })

      // Open listbox
      await click(getListboxButton())

      // Verify it is open
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
      renderTemplate({
        template: html`
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
      renderTemplate({
        template: html`
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
      renderTemplate({
        template: html`
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
      renderTemplate({
        template: html`
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

      let [button1, button2] = getListboxButtons()

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
        template: html`
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
    'should be possible to hover an option and make it active',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
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
      renderTemplate({
        template: html`
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

      let options = getListboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveListboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the listbox option is already active',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
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
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob"> bob </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob"> bob </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref('bob') }),
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob"> bob </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: html`
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
          let value = ref(null)
          watch([value], () => handleChange(value.value))
          return { value }
        },
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob"> bob </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup() {
          let value = ref(null)
          watch([value], () => handleChange(value.value))
          return { value }
        },
      })

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
      renderTemplate({
        template: html`
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
      renderTemplate({
        template: html`
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption disabled value="bob"> bob </ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value" multiple>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value" multiple>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

      // Open listbox
      await click(getListboxButton())

      // Verify that bob is the active option
      assertActiveListboxOption(getListboxOptions()[1])
    })
  )

  it(
    'should keep the listbox open when selecting an item via the keyboard',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Listbox v-model="value" multiple>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

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
      renderTemplate({
        template: html`
          <Listbox v-model="value" multiple>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="alice">alice</ListboxOption>
              <ListboxOption value="bob">bob</ListboxOption>
              <ListboxOption value="charlie">charlie</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(['bob', 'charlie']) }),
      })

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

  it(
    'should toggle the selected state of an option when clicking on it (using objects instead of primitives)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Listbox v-model="value" multiple>
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption v-for="person in people" :value="person"
                >{{ person.name }}</ListboxOption
              >
            </ListboxOptions>
          </Listbox>
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

    renderTemplate({
      template: html`
        <div>
          <Listbox form="my-form" v-model="value" name="delivery">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="pickup">Pickup</ListboxOption>
              <ListboxOption value="home-delivery">Home delivery</ListboxOption>
              <ListboxOption value="dine-in">Dine in</ListboxOption>
            </ListboxOptions>
          </Listbox>
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

    // Open listbox
    await click(getListboxButton())

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
          <Listbox v-model="value" name="delivery">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="pickup">Pickup</ListboxOption>
              <ListboxOption value="home-delivery">Home delivery</ListboxOption>
              <ListboxOption value="dine-in">Dine in</ListboxOption>
            </ListboxOptions>
          </Listbox>
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

    // Open listbox
    await click(getListboxButton())

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([]) // no data

    // Open listbox again
    await click(getListboxButton())

    // Choose home delivery
    await click(getByText('Home delivery'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['delivery', 'home-delivery']])

    // Open listbox again
    await click(getListboxButton())

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
          <Listbox v-model="value" name="delivery">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption v-for="option in options" :key="option.id" :value="option"
                >{{option.label}}</ListboxOption
              >
            </ListboxOptions>
          </Listbox>
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

    // Open listbox
    await click(getListboxButton())

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([
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
    expect(submits).lastCalledWith([
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
    expect(submits).lastCalledWith([
      ['delivery[id]', '1'],
      ['delivery[value]', 'pickup'],
      ['delivery[label]', 'Pickup'],
      ['delivery[extra][info]', 'Some extra info'],
    ])
  })
})
