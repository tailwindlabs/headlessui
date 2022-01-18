import { defineComponent, nextTick, ref, watch, h, reactive } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import {
  Combobox,
  ComboboxLabel,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from './combobox'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
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
import { html } from '../../test-utils/html'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = {
    Combobox,
    ComboboxLabel,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
  }

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
        renderTemplate({
          template: html`
            <Combobox v-model="value" v-slot="{ open }">
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
        renderTemplate({
          template: html`
            <Combobox v-model="value" disabled>
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

  describe('ComboboxLabel', () => {
    it(
      'should be possible to render a ComboboxLabel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxLabel v-slot="data">{{JSON.stringify(data)}}</ComboboxLabel>
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
      'should be possible to render a ComboboxLabel using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxLabel as="p" v-slot="data">{{JSON.stringify(data)}}</ComboboxLabel>
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

  describe('ComboboxButton', () => {
    it(
      'should be possible to render a ComboboxButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
      'should be possible to render a ComboboxButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
      'should be possible to render a ComboboxButton and a ComboboxLabel and see them linked together',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxLabel>Label</ComboboxLabel>
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
          attributes: { id: 'headlessui-combobox-button-2' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })
        assertComboboxButtonLinkedWithComboboxLabel()
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
              <ComboboxButton type="submit">
                Trigger
              </ComboboxButton>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getComboboxButton()).toHaveAttribute('type', 'submit')
      })

      it(
        'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value">
                <ComboboxButton :as="CustomButton">
                  Trigger
                </ComboboxButton>
              </Combobox>
            `,
            setup: () => ({
              value: ref(null),
              CustomButton: defineComponent({
                setup: props => () => h('button', { ...props }),
              }),
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
              <ComboboxButton as="div">
                Trigger
              </ComboboxButton>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        expect(getComboboxButton()).not.toHaveAttribute('type')
      })

      it(
        'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Combobox v-model="value">
                <ComboboxButton :as="CustomButton">
                  Trigger
                </ComboboxButton>
              </Combobox>
            `,
            setup: () => ({
              value: ref(null),
              CustomButton: defineComponent({
                setup: props => () => h('div', props),
              }),
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

    it('should be possible to always render the ComboboxOptions if we provide it a `static` prop', () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
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

      // Let's verify that the Combobox is already there
      expect(getCombobox()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the ComboboxOptions', async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
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

      assertCombobox({ state: ComboboxState.InvisibleHidden })

      // Let's open the Combobox, to see if it is not hidden anymore
      await click(getComboboxButton())

      assertCombobox({ state: ComboboxState.Visible })
    })
  })

  describe('ComboboxOption', () => {
    it(
      'should be possible to render a ComboboxOption using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
    let props = reactive({ hide: false })

    renderTemplate({
      template: html`
        <Combobox v-model="value">
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

    // Open the Combobox
    await click(getByText('Trigger'))

    props.hide = true
    await nextFrame()

    props.hide = false
    await nextFrame()

    assertCombobox({ state: ComboboxState.Visible })

    let options = getComboboxOptions()

    // Focus the first option
    await press(Keys.ArrowDown)

    // Verify that the first Combobox option is active
    assertActiveComboboxOption(options[0])

    await press(Keys.ArrowDown)

    // Verify that the second Combobox option is active
    assertActiveComboboxOption(options[1])

    await press(Keys.ArrowDown)

    // Verify that the third Combobox option is active
    assertActiveComboboxOption(options[2])
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to swap the Combobox option with a button for example',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption as="button" value="a">
                Option A
              </ComboboxOption>
              <ComboboxOption as="button" value="b">
                Option B
              </ComboboxOption>
              <ComboboxOption as="button" value="c">
                Option C
              </ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

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
            <ComboboxButton>Trigger</ComboboxButton>
            <OpenClosedWrite :open="true">
              <ComboboxOptions v-slot="data">
                {{JSON.stringify(data)}}
              </ComboboxOptions>
            </OpenClosedWrite>
          </Combobox>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Combobox is visible
      assertCombobox({ state: ComboboxState.Visible })

      // Let's try and open the Combobox
      await click(getComboboxButton())

      // Verify the Combobox is still visible
      assertCombobox({ state: ComboboxState.Visible })
    })
  )

  it(
    'should always close the ComboboxOptions because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Combobox>
            <ComboboxButton>Trigger</ComboboxButton>
            <OpenClosedWrite :open="false">
              <ComboboxOptions v-slot="data">
                {{JSON.stringify(data)}}
              </ComboboxOptions>
            </OpenClosedWrite>
          </Combobox>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Combobox is hidden
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Let's try and open the Combobox
      await click(getComboboxButton())

      // Verify the Combobox is still hidden
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
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

      // Verify the Combobox is hidden
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Let's toggle the Combobox 3 times
      await click(getComboboxButton())
      await click(getComboboxButton())
      await click(getComboboxButton())

      // Verify the Combobox is visible
      assertCombobox({ state: ComboboxState.Visible })

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
      'should be possible to open the Combobox with Enter',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option, { selected: false }))

        // Verify that the first Combobox option is active
        assertActiveComboboxOption(options[0])
        assertNoSelectedComboboxOption()
      })
    )

    it(
      'should not be possible to open the Combobox with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" disabled>
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the Combobox
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
      'should be possible to open the Combobox with Enter, and focus the selected option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref('b') }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second Combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should be possible to open the Combobox with Enter, and focus the selected option (when using the `hidden` render strategy)',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions :unmount="false">
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref('b') }),
        })

        await new Promise<void>(nextTick)

        assertComboboxButton({
          state: ComboboxState.InvisibleHidden,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleHidden })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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

        // Close/Hide the Combobox
        await press(Keys.Escape)

        // Re-open the Combobox
        await click(getComboboxButton())

        // Verify we have Combobox options
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second Combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should be possible to open the Combobox with Enter, and focus the selected option (with a list of objects)',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption v-for="option in options" key="option.id" :value="option"
                  >{{ option.name }}</ComboboxOption
                >
              </ComboboxOptions>
            </Combobox>
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

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second Combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active Combobox option when there are no Combobox options at all',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions />
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should focus the first non disabled Combobox option when opening with Enter',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // Verify that the first non-disabled Combobox option is active
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled Combobox option when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        let options = getComboboxOptions()

        // Verify that the first non-disabled Combobox option is active
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should have no active Combobox option upon Enter key press, when there are no non-disabled Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to close the Combobox with Enter when there is no active Comboboxoption',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Open Combobox
        await click(getComboboxButton())

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })

        // Close Combobox
        await press(Keys.Enter)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())
      })
    )

    it(
      'should be possible to close the Combobox with Enter and choose the active Combobox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup() {
            let value = ref(null)
            watch([value], () => handleChange(value.value))
            return { value }
          },
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Open Combobox
        await click(getComboboxButton())

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })

        // Activate the first Combobox option
        let options = getComboboxOptions()
        await mouseMove(options[0])

        // Choose option, and close Combobox
        await press(Keys.Enter)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())

        // Open Combobox again
        await click(getComboboxButton())

        // Verify the active option is the previously selected one
        assertActiveComboboxOption(getComboboxOptions()[0])
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the Combobox with Space',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the Combobox with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" disabled>
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the Combobox
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
      'should be possible to open the Combobox with Space, and focus the selected option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref('b') }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second Combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active Combobox option when there are no Combobox options at all',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions />
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should focus the first non disabled Combobox option when opening with Space',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)

        let options = getComboboxOptions()

        // Verify that the first non-disabled Combobox option is active
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should focus the first non disabled Combobox option when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)

        let options = getComboboxOptions()

        // Verify that the first non-disabled Combobox option is active
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should have no active Combobox option upon Space key press, when there are no non-disabled Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to close the Combobox with Space and choose the active Combobox option',
      suppressConsoleLogs(async () => {
        let handleChange = jest.fn()
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup() {
            let value = ref(null)
            watch([value], () => handleChange(value.value))
            return { value }
          },
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Open Combobox
        await click(getComboboxButton())

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })

        // Activate the first Combobox option
        let options = getComboboxOptions()
        await mouseMove(options[0])

        // Choose option, and close Combobox
        await press(Keys.Space)

        // Verify it is closed
        assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Verify we got the change event
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('a')

        // Verify the button is focused again
        assertActiveElement(getComboboxButton())

        // Open Combobox again
        await click(getComboboxButton())

        // Verify the active option is the previously selected one
        assertActiveComboboxOption(getComboboxOptions()[0])
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should be possible to close an open Combobox with Escape',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Space)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Close Combobox
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
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
      'should be possible to open the Combobox with ArrowDown',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowDown)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))

        // Verify that the first Combobox option is active
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should not be possible to open the Combobox with ArrowDown when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" disabled>
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the Combobox
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
      'should be possible to open the Combobox with ArrowDown, and focus the selected option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref('b') }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowDown)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second Combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active Combobox option when there are no Combobox options at all',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions />
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowDown)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify we have Combobox options
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
      'should be possible to use ArrowDown to navigate the Combobox options and skip the first disabled one',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify we have Combobox options
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
      'should be possible to use ArrowDown to navigate the Combobox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[2])
      })
    )
  })

  describe('`ArrowRight` key', () => {
    it(
      'should be possible to use ArrowRight to navigate the Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" horizontal>
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify we have Combobox options
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
      'should be possible to open the Combobox with ArrowUp and the last option should be active',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowUp)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))

        // ! ALERT: The LAST option should now be active
        assertActiveComboboxOption(options[2])
      })
    )

    it(
      'should not be possible to open the Combobox with ArrowUp and the last option should be active when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" disabled>
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Try to open the Combobox
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
      'should be possible to open the Combobox with ArrowUp, and focus the selected option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref('b') }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowUp)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

        // Verify that the second Combobox option is active (because it is already selected)
        assertActiveComboboxOption(options[1])
      })
    )

    it(
      'should have no active Combobox option when there are no Combobox options at all',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions />
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowUp)
        assertCombobox({ state: ComboboxState.Visible })
        assertActiveElement(getCombobox())

        assertNoActiveComboboxOption()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the Combobox options and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowUp)

        // Verify we have Combobox options
        let options = getComboboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertComboboxOption(option))
        assertActiveComboboxOption(options[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertComboboxButton({
          state: ComboboxState.InvisibleUnmounted,
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.Enter)

        // Verify we have Combobox options
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
      'should be possible to use ArrowUp to navigate the Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
        await press(Keys.ArrowUp)

        // Verify it is open
        assertComboboxButton({ state: ComboboxState.Visible })
        assertCombobox({
          state: ComboboxState.Visible,
          attributes: { id: 'headlessui-combobox-options-2' },
        })
        assertActiveElement(getCombobox())
        assertComboboxButtonLinkedWithCombobox()

        // Verify we have Combobox options
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
      'should be possible to use ArrowLeft to navigate the Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value" horizontal>
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
          attributes: { id: 'headlessui-combobox-button-1' },
        })
        assertCombobox({ state: ComboboxState.InvisibleUnmounted })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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

        // Verify we have Combobox options
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
      'should be possible to use the End key to go to the last Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
      'should be possible to use the End key to go to the last non disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
      'should be possible to use the End key to go to the first Combobox option if that is the only non-disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should have no active Combobox option upon End key press, when there are no non-disabled Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should be possible to use the PageDown key to go to the last Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
      'should be possible to use the PageDown key to go to the last non disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption value="b">Option B</ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
      'should be possible to use the PageDown key to go to the first Combobox option if that is the only non-disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">Option A</ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should have no active Combobox option upon PageDown key press, when there are no non-disabled Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should be possible to use the Home key to go to the first Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
      'should be possible to use the Home key to go to the first non disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
                <ComboboxOption value="d">Option D</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should be possible to use the Home key to go to the last Combobox option if that is the only non-disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption value="d">Option D</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should have no active Combobox option upon Home key press, when there are no non-disabled Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should be possible to use the PageUp key to go to the first Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
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

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
      'should be possible to use the PageUp key to go to the first non disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption value="c">Option C</ComboboxOption>
                <ComboboxOption value="d">Option D</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should be possible to use the PageUp key to go to the last Combobox option if that is the only non-disabled Combobox option',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption value="d">Option D</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
      'should have no active Combobox option upon PageUp key press, when there are no non-disabled Combobox options',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption disabled value="a">
                  Option A
                </ComboboxOption>
                <ComboboxOption disabled value="b">
                  Option B
                </ComboboxOption>
                <ComboboxOption disabled value="c">
                  Option C
                </ComboboxOption>
                <ComboboxOption disabled value="d">
                  Option D
                </ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Open Combobox
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="a">value a</ComboboxOption>
                <ComboboxOption value="b">value b</ComboboxOption>
                <ComboboxOption value="c">value c</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption disabled value="bob">
                  bob
                </ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
        renderTemplate({
          template: html`
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        // Focus the button
        getComboboxButton()?.focus()

        // Open Combobox
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
    'should focus the ComboboxButton when we click the ComboboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxLabel>Label</ComboboxLabel>
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

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getComboboxLabel())

      // Ensure that the actual button is focused instead
      assertActiveElement(getComboboxButton())
    })
  )

  it(
    'should not focus the ComboboxButton when we right click the ComboboxLabel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxLabel>Label</ComboboxLabel>
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

      // Ensure the button is not focused yet
      assertActiveElement(document.body)

      // Focus the label
      await click(getComboboxLabel(), MouseButton.Right)

      // Ensure that the body is still active
      assertActiveElement(document.body)
    })
  )

  it(
    'should be possible to open the Combobox on click',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
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
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Open Combobox
      await click(getComboboxButton())

      // Verify it is open
      assertComboboxButton({ state: ComboboxState.Visible })
      assertCombobox({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-options-2' },
      })
      assertActiveElement(getCombobox())
      assertComboboxButtonLinkedWithCombobox()

      // Verify we have Combobox options
      let options = getComboboxOptions()
      expect(options).toHaveLength(3)
      options.forEach(option => assertComboboxOption(option))
    })
  )

  it(
    'should not be possible to open the Combobox on right click',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
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
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Try to open the menu
      await click(getComboboxButton(), MouseButton.Right)

      // Verify it is still closed
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open the Combobox on click when the button is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value" disabled>
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
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Try to open the Combobox
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
    'should be possible to open the Combobox on click, and focus the selected option',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="a">Option A</ComboboxOption>
              <ComboboxOption value="b">Option B</ComboboxOption>
              <ComboboxOption value="c">Option C</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref('b') }),
      })

      assertComboboxButton({
        state: ComboboxState.InvisibleUnmounted,
        attributes: { id: 'headlessui-combobox-button-1' },
      })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Open Combobox
      await click(getComboboxButton())

      // Verify it is open
      assertComboboxButton({ state: ComboboxState.Visible })
      assertCombobox({
        state: ComboboxState.Visible,
        attributes: { id: 'headlessui-combobox-options-2' },
      })
      assertActiveElement(getCombobox())
      assertComboboxButtonLinkedWithCombobox()

      // Verify we have Combobox options
      let options = getComboboxOptions()
      expect(options).toHaveLength(3)
      options.forEach((option, i) => assertComboboxOption(option, { selected: i === 1 }))

      // Verify that the second Combobox option is active (because it is already selected)
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should be possible to close a Combobox on click',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
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

      // Open Combobox
      await click(getComboboxButton())

      // Verify it is open
      assertComboboxButton({ state: ComboboxState.Visible })

      // Click to close
      await click(getComboboxButton())

      // Verify it is closed
      assertComboboxButton({ state: ComboboxState.InvisibleUnmounted })
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be a no-op when we click outside of a closed Combobox',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Verify that the window is closed
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Click something that is not related to the Combobox
      await click(document.body)

      // Should still be closed
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click outside of the Combobox which should close the Combobox',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      // Click something that is not related to the Combobox
      await click(document.body)

      // Should be closed now
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getComboboxButton())
    })
  )

  it(
    'should be possible to click outside of the Combobox on another Combobox button which should close the current Combobox and open the new Combobox',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <div>
            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>

            <Combobox v-model="value">
              <ComboboxButton>Trigger</ComboboxButton>
              <ComboboxOptions>
                <ComboboxOption value="alice">alice</ComboboxOption>
                <ComboboxOption value="bob">bob</ComboboxOption>
                <ComboboxOption value="charlie">charlie</ComboboxOption>
              </ComboboxOptions>
            </Combobox>
          </div>
        `,
        setup: () => ({ value: ref(null) }),
      })

      let [button1, button2] = getComboboxButtons()

      // Click the first menu button
      await click(button1)
      expect(getComboboxes()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the first button
      assertComboboxButtonLinkedWithCombobox(button1, getCombobox())

      // Click the second menu button
      await click(button2)

      expect(getComboboxes()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the second button
      assertComboboxButtonLinkedWithCombobox(button2, getCombobox())
    })
  )

  it(
    'should be possible to click outside of the Combobox which should close the Combobox (even if we press the Combobox button)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      // Click the Combobox button again
      await click(getComboboxButton())

      // Should be closed now
      assertCombobox({ state: ComboboxState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getComboboxButton())
    })
  )

  it(
    'should be possible to hover an option and make it active',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
    'should make a Combobox option active when you move the mouse over it',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()
      // We should be able to go to the second option
      await mouseMove(options[1])
      assertActiveComboboxOption(options[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the Combobox option is already active',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
    'should be a no-op when we move the mouse and the Combobox option is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption disabled value="bob">
                bob
              </ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
      await click(getComboboxButton())

      let options = getComboboxOptions()

      await mouseMove(options[1])
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should not be possible to hover an option that is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption disabled value="bob">
                bob
              </ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption disabled value="bob">
                bob
              </ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
    'should be possible to click a Combobox option, which closes the Combobox',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup() {
          let value = ref(null)
          watch([value], () => handleChange(value.value))
          return { value }
        },
      })

      // Open Combobox
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

      // Open Combobox again
      await click(getComboboxButton())

      // Verify the active option is the previously selected one
      assertActiveComboboxOption(getComboboxOptions()[1])
    })
  )

  it(
    'should be possible to click a disabled Combobox option, which is a no-op',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption disabled value="bob">
                bob
              </ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup() {
          let value = ref(null)
          watch([value], () => handleChange(value.value))
          return { value }
        },
      })

      // Open Combobox
      await click(getComboboxButton())
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())

      let options = getComboboxOptions()

      // We should be able to click the first option
      await click(options[1])
      assertCombobox({ state: ComboboxState.Visible })
      assertActiveElement(getCombobox())
      expect(handleChange).toHaveBeenCalledTimes(0)

      // Close the Combobox
      await click(getComboboxButton())

      // Open Combobox again
      await click(getComboboxButton())

      // Verify the active option is non existing
      assertNoActiveComboboxOption()
    })
  )

  it(
    'should be possible focus a Combobox option, so that it becomes active',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption value="bob">bob</ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
    'should not be possible to focus a Combobox option which is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <Combobox v-model="value">
            <ComboboxButton>Trigger</ComboboxButton>
            <ComboboxOptions>
              <ComboboxOption value="alice">alice</ComboboxOption>
              <ComboboxOption disabled value="bob">
                bob
              </ComboboxOption>
              <ComboboxOption value="charlie">charlie</ComboboxOption>
            </ComboboxOptions>
          </Combobox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Open Combobox
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
