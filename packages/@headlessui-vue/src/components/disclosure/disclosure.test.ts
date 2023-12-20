import { defineComponent, h, nextTick, ref, watch } from 'vue'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import {
  DisclosureState,
  assertActiveElement,
  assertDisclosureButton,
  assertDisclosurePanel,
  getByText,
  getDisclosureButton,
  getDisclosurePanel,
} from '../../test-utils/accessibility-assertions'
import { html } from '../../test-utils/html'
import { Keys, MouseButton, click, press } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { createRenderTemplate, render } from '../../test-utils/vue-testing-library'
import { Disclosure, DisclosureButton, DisclosurePanel } from './disclosure'

jest.mock('../../hooks/use-id')

afterAll(() => jest.restoreAllMocks())

const renderTemplate = createRenderTemplate({
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
})

describe('Safe guards', () => {
  it.each([
    ['DisclosureButton', DisclosureButton],
    ['DisclosurePanel', DisclosurePanel],
  ])(
    'should error when we are using a <%s /> without a parent <Disclosure />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Disclosure /> component.`
      )
    })
  )

  it(
    'should be possible to render a Disclosure without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Disclosure', () => {
    it(
      'should be possible to render a Disclosure using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure v-slot="{ open }">
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Panel is: {{open ? 'open' : 'closed'}}</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })
      })
    )

    it('should be possible to render a Disclosure in an open state by default', async () => {
      renderTemplate(html`
        <Disclosure v-slot="{ open }" defaultOpen>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Panel is: {{open ? 'open' : 'closed'}}</DisclosurePanel>
        </Disclosure>
      `)

      await new Promise<void>(nextTick)

      assertDisclosureButton({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })

      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
    })

    it(
      'should expose a close function that closes the disclosure',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure v-slot="{ close }">
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>
              <button @click="close()">Close me</button>
            </DisclosurePanel>
          </Disclosure>
        `)

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the Disclosure.Button got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the disclosure and restores to a specific element',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button id="test">restoreable</button>
            <Disclosure v-slot="{ close }">
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>
                <button @click="close(document.getElementById('test'))">Close me</button>
              </DisclosurePanel>
            </Disclosure>
          `,
          setup: () => ({ document }),
        })

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )

    it(
      'should expose a close function that closes the disclosure and restores to a ref',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button ref="elementRef">restoreable</button>
            <Disclosure v-slot="{ close }">
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>
                <button @click="close(elementRef)">Close me</button>}
              </DisclosurePanel>
            </Disclosure>
          `,
          setup: () => ({ elementRef: ref() }),
        })

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })

  describe('DisclosureButton', () => {
    it(
      'should be possible to render a DisclosureButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton v-slot="slot">{{JSON.stringify(slot)}}</DisclosureButton>
            <DisclosurePanel></DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    it(
      'should be possible to render a DisclosureButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton as="div" role="button" v-slot="slot">
              {{JSON.stringify(slot)}}
            </DisclosureButton>
            <DisclosurePanel />
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton> Trigger </DisclosureButton>
          </Disclosure>
        `)

        expect(getDisclosureButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton type="submit"> Trigger </DisclosureButton>
          </Disclosure>
        `)

        expect(getDisclosureButton()).toHaveAttribute('type', 'submit')
      })

      it(
        'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Disclosure>
                <DisclosureButton :as="CustomButton"> Trigger </DisclosureButton>
              </Disclosure>
            `,
            setup: () => ({
              CustomButton: defineComponent({
                setup: (props) => () => h('button', { ...props }),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getDisclosureButton()).toHaveAttribute('type', 'button')
        })
      )

      it('should not set the type if the "as" prop is not a "button"', async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton as="div"> Trigger </DisclosureButton>
          </Disclosure>
        `)

        expect(getDisclosureButton()).not.toHaveAttribute('type')
      })

      it(
        'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Disclosure>
                <DisclosureButton :as="CustomButton"> Trigger </DisclosureButton>
              </Disclosure>
            `,
            setup: () => ({
              CustomButton: defineComponent({
                setup: (props) => () => h('div', props),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getDisclosureButton()).not.toHaveAttribute('type')
        })
      )
    })
  })

  describe('DisclosurePanel', () => {
    it(
      'should be possible to render DisclosurePanel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel v-slot="slot">{{JSON.stringify(slot)}}</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )

    it('should be possible to always render the DisclosurePanel if we provide it a `static` prop', () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel static>Contents</DisclosurePanel>
        </Disclosure>
      `)

      // Let's verify that the Disclosure is already there
      expect(getDisclosurePanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the DisclosurePanel', async () => {
      renderTemplate(
        `
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel :unmount="false">Contents</DisclosurePanel>
          </Disclosure>
        `
      )

      // TODO: Figure out a way so that we _don't_ require this.
      await new Promise<void>(nextTick)

      assertDisclosureButton({ state: DisclosureState.InvisibleHidden })
      assertDisclosurePanel({ state: DisclosureState.InvisibleHidden })

      // Let's open the Disclosure, to see if it is not hidden anymore
      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.Visible })
      assertDisclosurePanel({ state: DisclosureState.Visible })

      // Let's re-click the Disclosure, to see if it is hidden again
      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.InvisibleHidden })
      assertDisclosurePanel({ state: DisclosureState.InvisibleHidden })
    })

    it(
      'should expose a close function that closes the disclosure',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel v-slot="{ close }">
              <button @click="close()">Close me</button>
            </DisclosurePanel>
          </Disclosure>
        `)

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the Disclosure.Button got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the disclosure and restores to a specific element',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button id="test">restoreable</button>
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel v-slot="{ close }">
                <button @click="close(document.getElementById('test'))">Close me</button>
              </DisclosurePanel>
            </Disclosure>
          `,
          setup: () => ({ document }),
        })

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )

    it(
      'should expose a close function that closes the disclosure and restores to a ref',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button ref="elementRef">restoreable</button>
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel v-slot="{ close }">
                <button @click="close(elementRef)">Close me</button>}
              </DisclosurePanel>
            </Disclosure>
          `,
          setup: () => ({ elementRef: ref() }),
        })

        // Focus the button
        getDisclosureButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getDisclosureButton())

        // Open the disclosure
        await click(getDisclosureButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the disclosure is closed
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })
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
    'should always open the DisclosurePanel because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: `
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <OpenClosedWrite :open="true">
              <DisclosurePanel v-slot="data">
                {{JSON.stringify(data)}}
              </DisclosurePanel>
            </OpenClosedWrite>
          </Disclosure>
        `,
      })

      // Verify the Disclosure is visible
      assertDisclosurePanel({ state: DisclosureState.Visible })

      // Let's try and open the Disclosure
      await click(getDisclosureButton())

      // Verify the Disclosure is still visible
      assertDisclosurePanel({ state: DisclosureState.Visible })
    })
  )

  it(
    'should always close the DisclosurePanel because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: `
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <OpenClosedWrite :open="false">
              <DisclosurePanel v-slot="data">
                {{JSON.stringify(data)}}
              </DisclosurePanel>
            </OpenClosedWrite>
          </Disclosure>
        `,
      })

      // Verify the Disclosure is hidden
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Let's try and open the Disclosure
      await click(getDisclosureButton())

      // Verify the Disclosure is still hidden
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to read the OpenClosed state',
    suppressConsoleLogs(async () => {
      let readFn = jest.fn()
      renderTemplate({
        components: { OpenClosedRead },
        template: `
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <OpenClosedRead @read="readFn">
              <DisclosurePanel></DisclosurePanel>
            </OpenClosedRead>
          </Disclosure>
        `,
        setup() {
          return { readFn }
        },
      })

      await new Promise<void>(nextTick)

      // Verify the Disclosure is hidden
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Let's toggle the Disclosure 3 times
      await click(getDisclosureButton())
      await click(getDisclosureButton())
      await click(getDisclosureButton())

      // Verify the Disclosure is visible
      assertDisclosurePanel({ state: DisclosureState.Visible })

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
      'should be possible to open the Disclosure with Enter',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Enter)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Enter)
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to open the disclosure with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton disabled>Trigger</DisclosureButton>
            <DisclosurePanel>Content</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Try to open the disclosure
        await press(Keys.Enter)

        // Verify it is still closed
        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the disclosure with Enter when the disclosure is open',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Enter)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Enter)

        // Verify it is closed again
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the disclosure with Space',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Space)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })
      })
    )

    it(
      'should not be possible to open the disclosure with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton disabled>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Try to open the disclosure
        await press(Keys.Space)

        // Verify it is still closed
        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the disclosure with Space when the disclosure is open',
      suppressConsoleLogs(async () => {
        renderTemplate(html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `)

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        getDisclosureButton()?.focus()

        // Open disclosure
        await press(Keys.Space)

        // Verify it is open
        assertDisclosureButton({ state: DisclosureState.Visible })
        assertDisclosurePanel({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-panel-2' },
        })

        // Close disclosure
        await press(Keys.Space)

        // Verify it is closed again
        assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a disclosure on click',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open disclosure
      await click(getDisclosureButton())

      // Verify it is open
      assertDisclosureButton({ state: DisclosureState.Visible })
      assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })
    })
  )

  it(
    'should not be possible to open a disclosure on right click',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open disclosure
      await click(getDisclosureButton(), MouseButton.Right)

      // Verify it is still closed
      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open a disclosure on click when the button is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton disabled>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Try to open the disclosure
      await click(getDisclosureButton())

      // Verify it is still closed
      assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a disclosure on click',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton>Trigger</DisclosureButton>
          <DisclosurePanel>Contents</DisclosurePanel>
        </Disclosure>
      `)

      // Open disclosure
      await click(getDisclosureButton())

      // Verify it is open
      assertDisclosureButton({ state: DisclosureState.Visible })

      // Click to close
      await click(getDisclosureButton())

      // Verify it is closed
      assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the Disclosure by clicking on a DisclosureButton inside a DisclosurePanel',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Disclosure>
          <DisclosureButton>Open</DisclosureButton>
          <DisclosurePanel>
            <DisclosureButton>Close</DisclosureButton>
          </DisclosurePanel>
        </Disclosure>
      `)

      // Open the disclosure
      await click(getDisclosureButton())

      let closeBtn = getByText('Close')

      expect(closeBtn).not.toHaveAttribute('id')
      expect(closeBtn).not.toHaveAttribute('aria-controls')
      expect(closeBtn).not.toHaveAttribute('aria-expanded')

      // The close button should close the disclosure
      await click(closeBtn)

      // Verify it is closed
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Verify we restored the Open button
      assertActiveElement(getDisclosureButton())
    })
  )
})
