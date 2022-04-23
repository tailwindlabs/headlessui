import { defineComponent, nextTick, ref, watch, h, ComponentOptionsWithoutProps } from 'vue'
import { render } from '../../test-utils/vue-testing-library'

import { Popover, PopoverGroup, PopoverButton, PopoverPanel, PopoverOverlay } from './popover'
import { Portal } from '../portal/portal'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  PopoverState,
  assertPopoverPanel,
  assertPopoverButton,
  getPopoverButton,
  getPopoverPanel,
  getByText,
  assertActiveElement,
  assertContainsActiveElement,
  getPopoverOverlay,
} from '../../test-utils/accessibility-assertions'
import { click, press, Keys, MouseButton, shift } from '../../test-utils/interactions'
import { html } from '../../test-utils/html'
import { useOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = {
    Popover,
    PopoverGroup,
    PopoverButton,
    PopoverPanel,
    PopoverOverlay,
    Portal,
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

describe('Safe guards', () => {
  it.each([
    ['PopoverButton', PopoverButton],
    ['PopoverPanel', PopoverPanel],
    ['PopoverOverlay', PopoverOverlay],
  ])(
    'should error when we are using a <%s /> without a parent <Popover />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Popover /> component.`
      )
    })
  )

  it(
    'should be possible to render a Popover without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
          </Popover>
        `
      )

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('PopoverGroup', () => {
    it(
      'should be possible to render a PopoverGroup with multiple Popover components',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>Panel 1</PopoverPanel>
              </Popover>
              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>Panel 2</PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 2'))

        await click(getByText('Trigger 1'))

        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.Visible }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 2'))

        await click(getByText('Trigger 2'))

        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.Visible }, getByText('Panel 2'))
      })
    )
  })

  describe('Popover', () => {
    it(
      'should be possible to render a Popover using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover v-slot="{ open }">
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Panel is: {{open ? 'open' : 'closed'}}</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.Visible, textContent: 'Panel is: open' })
      })
    )

    it(
      'should expose a close function that closes the popover',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover v-slot="{ close }">
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>
                <button @click="close()">Close me</button>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the Popover.Button got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the popover and restores to a specific element',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button id="test">restoreable</button>
            <Popover v-slot="{ close }">
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>
                <button @click="close(document.getElementById('test'))">Close me</button>
              </PopoverPanel>
            </Popover>
          `,
          setup: () => ({ document }),
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )

    it(
      'should expose a close function that closes the popover and restores to a ref',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button ref="elementRef">restoreable</button>
            <Popover v-slot="{ close }">
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel> <button @click="close(elementRef)">Close me</button>} </PopoverPanel>
            </Popover>
          `,
          setup: () => ({ elementRef: ref() }),
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )
  })

  describe('PopoverButton', () => {
    it(
      'should be possible to render a PopoverButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton v-slot="slot">{{JSON.stringify(slot)}}</PopoverButton>
              <PopoverPanel></PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertPopoverPanel({ state: PopoverState.Visible })
      })
    )

    it(
      'should be possible to render a PopoverButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton as="div" role="button" v-slot="slot">
                {{JSON.stringify(slot)}}
              </PopoverButton>
              <PopoverPanel />
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertPopoverPanel({ state: PopoverState.Visible })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
            </Popover>
          `
        )

        expect(getPopoverButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton type="submit"> Trigger </PopoverButton>
            </Popover>
          `
        )

        expect(getPopoverButton()).toHaveAttribute('type', 'submit')
      })

      it(
        'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Popover>
                <PopoverButton :as="CustomButton"> Trigger </PopoverButton>
              </Popover>
            `,
            setup: () => ({
              CustomButton: defineComponent({
                setup: (props) => () => h('button', { ...props }),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getPopoverButton()).toHaveAttribute('type', 'button')
        })
      )

      it('should not set the type if the "as" prop is not a "button"', async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton as="div"> Trigger </PopoverButton>
            </Popover>
          `
        )

        expect(getPopoverButton()).not.toHaveAttribute('type')
      })

      it(
        'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: html`
              <Popover>
                <PopoverButton :as="CustomButton"> Trigger </PopoverButton>
              </Popover>
            `,
            setup: () => ({
              CustomButton: defineComponent({
                setup: (props) => () => h('div', props),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getPopoverButton()).not.toHaveAttribute('type')
        })
      )
    })
  })

  describe('PopoverPanel', () => {
    it(
      'should be possible to render PopoverPanel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel v-slot="slot">{{JSON.stringify(slot)}}</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        await click(getPopoverButton())

        assertPopoverButton({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({
          state: PopoverState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )

    it('should be possible to always render the PopoverPanel if we provide it a `static` prop', () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel static>Contents</PopoverPanel>
          </Popover>
        `
      )

      // Let's verify that the Popover is already there
      expect(getPopoverPanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the PopoverPanel', async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel :unmount="false">Contents</PopoverPanel>
          </Popover>
        `
      )

      getPopoverButton()?.focus()

      // TODO: Can we improve this?
      await new Promise<void>(nextTick)

      assertPopoverButton({ state: PopoverState.InvisibleHidden })
      assertPopoverPanel({ state: PopoverState.InvisibleHidden })

      // Let's open the Popover, to see if it is not hidden anymore
      await click(getPopoverButton())

      assertPopoverButton({ state: PopoverState.Visible })
      assertPopoverPanel({ state: PopoverState.Visible })

      // Let's re-click the Popover, to see if it is hidden again
      await click(getPopoverButton())

      assertPopoverButton({ state: PopoverState.InvisibleHidden })
      assertPopoverPanel({ state: PopoverState.InvisibleHidden })
    })

    it(
      'should be possible to move the focus inside the panel to the first focusable element (very first link)',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel focus>
                <a href="/">Link 1</a>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))
      })
    )

    it(
      'should close the Popover, when PopoverPanel has the focus prop and you focus the open button',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel focus>
                <a href="/">Link 1</a>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))

        // Focus the button again
        getPopoverButton()?.focus()
        await new Promise<void>(nextTick)

        // Ensure the Popover is closed again
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to move the focus inside the panel to the first focusable element (skip hidden link)',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel focus>
                <a href="/" style="display:none"> Link 1 </a>
                <a href="/">Link 2</a>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 2'))
      })
    )

    it(
      'should be possible to move the focus inside the panel to the first focusable element (very first link) when the hidden render strategy is used',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel focus :unmount="false">
                <a href="/">Link 1</a>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))
      })
    )

    it(
      'should expose a close function that closes the popover',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel v-slot="{ close }">
                <button @click="close()">Close me</button>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the Popover.Button got the restored focus
        assertActiveElement(getByText('Trigger'))
      })
    )

    it(
      'should expose a close function that closes the popover and restores to a specific element',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button id="test">restoreable</button>
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel v-slot="{ close }">
                <button @click="close(document.getElementById('test'))">Close me</button>
              </PopoverPanel>
            </Popover>
          `,
          setup: () => ({ document }),
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Ensure the restoreable button got the restored focus
        assertActiveElement(getByText('restoreable'))
      })
    )

    it(
      'should expose a close function that closes the popover and restores to a ref',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <button ref="elementRef">restoreable</button>
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel v-slot="{ close }">
                <button @click="close(elementRef)">Close me</button>}
              </PopoverPanel>
            </Popover>
          `,
          setup: () => ({ elementRef: ref() }),
        })

        // Focus the button
        getPopoverButton()?.focus()

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure we can click the close button
        await click(getByText('Close me'))

        // Ensure the popover is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

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
    'should always open the PopoverPanel because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <OpenClosedWrite :open="true">
              <PopoverPanel v-slot="data"> {{JSON.stringify(data)}} </PopoverPanel>
            </OpenClosedWrite>
          </Popover>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Popover is visible
      assertPopoverPanel({ state: PopoverState.Visible })

      // Let's try and open the Popover
      await click(getPopoverButton())

      // Verify the Popover is still visible
      assertPopoverPanel({ state: PopoverState.Visible })
    })
  )

  it(
    'should always close the PopoverPanel because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <OpenClosedWrite :open="false">
              <PopoverPanel v-slot="data"> {{JSON.stringify(data)}} </PopoverPanel>
            </OpenClosedWrite>
          </Popover>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Popover is hidden
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Let's try and open the Popover
      await click(getPopoverButton())

      // Verify the Popover is still hidden
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to read the OpenClosed state',
    suppressConsoleLogs(async () => {
      let readFn = jest.fn()
      renderTemplate({
        components: { OpenClosedRead },
        template: html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <OpenClosedRead @read="readFn">
              <PopoverPanel></PopoverPanel>
            </OpenClosedRead>
          </Popover>
        `,
        setup() {
          return { readFn }
        },
      })

      await new Promise<void>(nextTick)

      // Verify the Popover is hidden
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Let's toggle the Popover 3 times
      await click(getPopoverButton())
      await click(getPopoverButton())
      await click(getPopoverButton())

      // Verify the Popover is visible
      assertPopoverPanel({ state: PopoverState.Visible })

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
      'should be possible to open the Popover with Enter',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Enter)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })

        // Close popover
        await press(Keys.Enter)
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to open the popover with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton disabled>Trigger</PopoverButton>
              <PopoverPanel>Content</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Try to open the popover
        await press(Keys.Enter)

        // Verify it is still closed
        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the popover with Enter when the popover is open',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Enter)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })

        // Close popover
        await press(Keys.Enter)

        // Verify it is closed again
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close other popover menus when we open a new one',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>Panel 1</PopoverPanel>
              </Popover>
              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>Panel 2</PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Open the first Popover
        await click(getByText('Trigger 1'))

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Focus trigger 2
        getByText('Trigger 2')?.focus()

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Open the second popover
        await press(Keys.Enter)

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))
      })
    )

    it(
      'should close the Popover by pressing `Enter` on a PopoverButton inside a PopoverPanel',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Open</PopoverButton>
              <PopoverPanel>
                <PopoverButton>Close</PopoverButton>
              </PopoverPanel>
            </Popover>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        let closeBtn = getByText('Close')

        expect(closeBtn).not.toHaveAttribute('id')
        expect(closeBtn).not.toHaveAttribute('aria-controls')
        expect(closeBtn).not.toHaveAttribute('aria-expanded')

        // The close button should close the popover
        await press(Keys.Enter, closeBtn)

        // Verify it is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Verify we restored the Open button
        assertActiveElement(getPopoverButton())
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should close the Popover menu, when pressing escape on the PopoverButton',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Open popover
        await click(getPopoverButton())

        // Verify popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Close popover
        await press(Keys.Escape)

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Verify button is (still) focused
        assertActiveElement(getPopoverButton())
      })
    )

    it(
      'should close the Popover menu, when pressing escape on the PopoverPanel',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>
                <a href="/">Link</a>
              </PopoverPanel>
            </Popover>
          `
        )

        // Focus the button
        getPopoverButton()?.focus()

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Open popover
        await click(getPopoverButton())

        // Verify popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Tab to next focusable item
        await press(Keys.Tab)

        // Verify the active element is inside the panel
        assertContainsActiveElement(getPopoverPanel())

        // Close popover
        await press(Keys.Escape)

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

        // Verify button is focused again
        assertActiveElement(getPopoverButton())
      })
    )

    it(
      'should be possible to close a sibling Popover when pressing escape on a sibling PopoverButton',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>Panel 1</PopoverPanel>
              </Popover>

              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>Panel 2</PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Verify popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify popover is open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        assertPopoverPanel({ state: PopoverState.Visible }, getByText('Panel 1'))
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted }, getByText('Panel 2'))

        // Focus the button of the second popover menu
        getByText('Trigger 2')?.focus()

        // Close popover
        await press(Keys.Escape)

        // Verify both popovers are closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Verify the button of the second popover is still focused
        assertActiveElement(getByText('Trigger 2'))
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should be possible to Tab through the panel contents onto the next PopoverButton',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>

              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>Panel 2</PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab again
        await press(Keys.Tab)

        // Verify that the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Verify that the second button is focused
        assertActiveElement(getByText('Trigger 2'))
      })
    )

    it(
      'should be possible to place a focusable item in the PopoverGroup, and keep the Popover open when we focus the focusable element',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>

              <a href="/">Link in between</a>

              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>Panel 2</PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab to the in between link
        await press(Keys.Tab)

        // Verify that the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Verify that the in between link is focused
        assertActiveElement(getByText('Link in between'))
      })
    )

    it(
      'should close the Popover menu once we Tab out of the PopoverGroup',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <PopoverGroup>
                <Popover>
                  <PopoverButton>Trigger 1</PopoverButton>
                  <PopoverPanel>
                    <a href="/">Link 1</a>
                    <a href="/">Link 2</a>
                  </PopoverPanel>
                </Popover>

                <Popover>
                  <PopoverButton>Trigger 2</PopoverButton>
                  <PopoverPanel>
                    <a href="/">Link 3</a>
                    <a href="/">Link 4</a>
                  </PopoverPanel>
                </Popover>
              </PopoverGroup>

              <a href="/">Next</a>
            </div>
          `
        )

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab again
        await press(Keys.Tab)

        // Verify that the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Verify that the second button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Let's Tab out of the PopoverGroup
        await press(Keys.Tab)

        // Verify the next link is now focused
        assertActiveElement(getByText('Next'))
        await new Promise<void>(nextTick)

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover menu once we Tab out of the Popover',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>

              <a href="/">Next</a>
            </div>
          `
        )

        // Focus the button of the first Popover
        getByText('Trigger 1')?.focus()

        // Open popover
        await click(getByText('Trigger 1'))

        // Verify we are focused on the first link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 1'))

        // Verify we are focused on the second link
        await press(Keys.Tab)
        assertActiveElement(getByText('Link 2'))

        // Let's Tab out of the Popover
        await press(Keys.Tab)

        // Verify the next link is now focused
        assertActiveElement(getByText('Next'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover when the PopoverPanel has a focus prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <a href="/">Previous</a>
              <Popover>
                <PopoverButton>Trigger</PopoverButton>
                <PopoverPanel focus>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>
              <a href="/">Next</a>
            </div>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        // Focus should be within the panel
        assertContainsActiveElement(getPopoverPanel())

        // Tab out of the component
        await press(Keys.Tab) // Tab to link 1
        await press(Keys.Tab) // Tab out

        // The popover should be closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // The active element should be the Next link outside of the popover
        assertActiveElement(getByText('Next'))
      })
    )

    it(
      'should close the Popover when the PopoverPanel has a focus prop (PopoverPanel uses a Portal)',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <a href="/">Previous</a>
              <Popover>
                <PopoverButton>Trigger</PopoverButton>
                <Portal>
                  <PopoverPanel focus>
                    <a href="/">Link 1</a>
                    <a href="/">Link 2</a>
                  </PopoverPanel>
                </Portal>
              </Popover>
              <a href="/">Next</a>
            </div>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        // Focus should be within the panel
        assertContainsActiveElement(getPopoverPanel())

        // The focus should be on the first link
        assertActiveElement(getByText('Link 1'))

        // Tab to the next link
        await press(Keys.Tab)

        // The focus should be on the second link
        assertActiveElement(getByText('Link 2'))

        // Tab out of the component
        await press(Keys.Tab)

        // The popover should be closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // The active element should be the Next link outside of the popover
        assertActiveElement(getByText('Next'))
      })
    )

    it(
      'should close the Popover when the PopoverPanel has a focus prop (PopoverPanel uses a Portal), and focus the next focusable item in line',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <a href="/">Previous</a>
              <Popover>
                <PopoverButton>Trigger</PopoverButton>
                <Portal>
                  <PopoverPanel focus>
                    <a href="/">Link 1</a>
                    <a href="/">Link 2</a>
                  </PopoverPanel>
                </Portal>
              </Popover>
            </div>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        // Focus should be within the panel
        assertContainsActiveElement(getPopoverPanel())

        // The focus should be on the first link
        assertActiveElement(getByText('Link 1'))

        // Tab to the next link
        await press(Keys.Tab)

        // The focus should be on the second link
        assertActiveElement(getByText('Link 2'))

        // Tab out of the component
        await press(Keys.Tab)

        // The popover should be closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // The active element should be the Previous link outside of the popover, this is the next one in line
        assertActiveElement(getByText('Previous'))
      })
    )
  })

  describe('`Shift+Tab` key', () => {
    it(
      'should close the Popover menu once we Tab out of the PopoverGroup',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <a href="/">Previous</a>

              <PopoverGroup>
                <Popover>
                  <PopoverButton>Trigger 1</PopoverButton>
                  <PopoverPanel>
                    <a href="/">Link 1</a>
                    <a href="/">Link 2</a>
                  </PopoverPanel>
                </Popover>

                <Popover>
                  <PopoverButton>Trigger 2</PopoverButton>
                  <PopoverPanel>
                    <a href="/">Link 3</a>
                    <a href="/">Link 4</a>
                  </PopoverPanel>
                </Popover>
              </PopoverGroup>
            </div>
          `
        )

        // Focus the button of the second Popover
        getByText('Trigger 2')?.focus()

        // Open popover
        await click(getByText('Trigger 2'))

        // Verify we can tab to Trigger 1
        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Trigger 1'))

        // Let's Tab out of the PopoverGroup
        await press(shift(Keys.Tab))

        // Verify the previous link is now focused
        assertActiveElement(getByText('Previous'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover menu once we Tab out of the Popover',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <div>
              <a href="/">Previous</a>

              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>
            </div>
          `
        )

        // Focus the button of the Popover
        getPopoverButton()?.focus()

        // Open popover
        await click(getPopoverButton())

        // Let's Tab out of the Popover
        await press(shift(Keys.Tab))

        // Verify the previous link is now focused
        assertActiveElement(getByText('Previous'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should focus the previous PopoverButton when Shift+Tab on the second PopoverButton',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>

              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 3</a>
                  <a href="/">Link 4</a>
                </PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Open the second popover
        await click(getByText('Trigger 2'))

        // Ensure the second popover is open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))

        // Close the popover
        await press(Keys.Escape)

        // Ensure the popover is now closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Ensure the second PopoverButton is focused
        assertActiveElement(getByText('Trigger 2'))

        // Tab backwards
        await press(shift(Keys.Tab))

        // Ensure the first PopoverButton is open
        assertActiveElement(getByText('Trigger 1'))
      })
    )

    it(
      'should focus the PopoverButton when pressing Shift+Tab when we focus inside the PopoverPanel',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger 1</PopoverButton>
              <PopoverPanel focus>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </PopoverPanel>
            </Popover>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Ensure the Link 1 is focused
        assertActiveElement(getByText('Link 1'))

        // Tab out of the Panel
        await press(shift(Keys.Tab))

        // Ensure the PopoverButton is focused again
        assertActiveElement(getPopoverButton())

        // Ensure the Popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should focus the PopoverButton when pressing Shift+Tab when we focus inside the PopoverPanel (inside a Portal)',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger 1</PopoverButton>
              <Portal>
                <PopoverPanel focus>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Portal>
            </Popover>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Ensure the Link 1 is focused
        assertActiveElement(getByText('Link 1'))

        // Tab out of the Panel
        await press(shift(Keys.Tab))

        // Ensure the PopoverButton is focused again
        assertActiveElement(getPopoverButton())

        // Ensure the Popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to focus the last item in the PopoverPanel when pressing Shift+Tab on the next PopoverButton',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </PopoverPanel>
              </Popover>

              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>
                  <a href="/">Link 3</a>
                  <a href="/">Link 4</a>
                </PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Open the popover
        await click(getByText('Trigger 1'))

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Focus the second button
        getByText('Trigger 2')?.focus()

        // Verify the second button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Ensure the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Press shift+tab, to move focus to the last item in the PopoverPanel
        await press(shift(Keys.Tab), getByText('Trigger 2'))

        // Verify we are focusing the last link of the first Popover
        assertActiveElement(getByText('Link 2'))
      })
    )

    it(
      "should be possible to focus the last item in the PopoverPanel when pressing Shift+Tab on the next PopoverButton (using Portal's)",
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <Portal>
                  <PopoverPanel>
                    <a href="/">Link 1</a>
                    <a href="/">Link 2</a>
                  </PopoverPanel>
                </Portal>
              </Popover>

              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <Portal>
                  <PopoverPanel>
                    <a href="/">Link 3</a>
                    <a href="/">Link 4</a>
                  </PopoverPanel>
                </Portal>
              </Popover>
            </PopoverGroup>
          `
        )

        // Open the popover
        await click(getByText('Trigger 1'))

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Focus the second button
        getByText('Trigger 2')?.focus()

        // Verify the second button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Ensure the first Popover is still open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({ state: PopoverState.Visible })

        // Press shift+tab, to move focus to the last item in the PopoverPanel
        await press(shift(Keys.Tab), getByText('Trigger 2'))

        // Verify we are focusing the last link of the first Popover
        assertActiveElement(getByText('Link 2'))
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the popover with Space',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Space)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })
      })
    )

    it(
      'should not be possible to open the popover with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton disabled>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Try to open the popover
        await press(Keys.Space)

        // Verify it is still closed
        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the popover with Space when the popover is open',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>
          `
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        getPopoverButton()?.focus()

        // Open popover
        await press(Keys.Space)

        // Verify it is open
        assertPopoverButton({ state: PopoverState.Visible })
        assertPopoverPanel({
          state: PopoverState.Visible,
          attributes: { id: 'headlessui-popover-panel-2' },
        })

        // Close popover
        await press(Keys.Space)

        // Verify it is closed again
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close other popover menus when we open a new one',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <PopoverGroup>
              <Popover>
                <PopoverButton>Trigger 1</PopoverButton>
                <PopoverPanel>Panel 1</PopoverPanel>
              </Popover>
              <Popover>
                <PopoverButton>Trigger 2</PopoverButton>
                <PopoverPanel>Panel 2</PopoverPanel>
              </Popover>
            </PopoverGroup>
          `
        )

        // Open the first Popover
        await click(getByText('Trigger 1'))

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Focus trigger 2
        getByText('Trigger 2')?.focus()

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Open the second popover
        await press(Keys.Space)

        // Verify the correct popovers are open
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 1'))
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))
      })
    )

    it(
      'should close the Popover by pressing `Space` on a PopoverButton inside a PopoverPanel',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Open</PopoverButton>
              <PopoverPanel>
                <PopoverButton>Close</PopoverButton>
              </PopoverPanel>
            </Popover>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        let closeBtn = getByText('Close')

        expect(closeBtn).not.toHaveAttribute('id')
        expect(closeBtn).not.toHaveAttribute('aria-controls')
        expect(closeBtn).not.toHaveAttribute('aria-expanded')

        // The close button should close the popover
        await press(Keys.Space, closeBtn)

        // Verify it is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Verify we restored the Open button
        assertActiveElement(getPopoverButton())
      })
    )

    xit(
      'should close the Popover by pressing `Enter` on a PopoverButton and go to the href of the `a` inside a PopoverPanel',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Popover>
              <PopoverButton>Open</PopoverButton>
              <PopoverPanel>
                <PopoverButton as="template">
                  <a href="#closed">Close</a>
                </PopoverButton>
              </PopoverPanel>
            </Popover>
          `
        )

        // Open the popover
        await click(getPopoverButton())

        let closeLink = getByText('Close')

        expect(closeLink).not.toHaveAttribute('id')
        expect(closeLink).not.toHaveAttribute('aria-controls')
        expect(closeLink).not.toHaveAttribute('aria-expanded')

        // The close button should close the popover
        await press(Keys.Enter, closeLink)

        // Verify it is closed
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Verify we restored the Open button
        assertActiveElement(getPopoverButton())

        // Verify that we got redirected to the href
        expect(document.location.hash).toEqual('#closed')
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a popover on click',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
          </Popover>
        `
      )

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })
      assertPopoverPanel({
        state: PopoverState.Visible,
        attributes: { id: 'headlessui-popover-panel-2' },
      })
    })
  )

  it(
    'should not be possible to open a popover on right click',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
          </Popover>
        `
      )

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Open popover
      await click(getPopoverButton(), MouseButton.Right)

      // Verify it is still closed
      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should not be possible to open a popover on click when the button is disabled',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton disabled>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
          </Popover>
        `
      )

      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Try to open the popover
      await click(getPopoverButton())

      // Verify it is still closed
      assertPopoverButton({
        state: PopoverState.InvisibleUnmounted,
        attributes: { id: 'headlessui-popover-button-1' },
      })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a popover on click',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
          </Popover>
        `
      )

      getPopoverButton()?.focus()

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click to close
      await click(getPopoverButton())

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a Popover using a click on the PopoverOverlay',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
            <PopoverOverlay />
          </Popover>
        `
      )

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the overlay to close
      await click(getPopoverOverlay())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the popover, and re-focus the button when we click outside on the body element',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Trigger</PopoverButton>
            <PopoverPanel>Contents</PopoverPanel>
          </Popover>
        `
      )

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the body to close
      await click(document.body)

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should be possible to close the popover, and re-focus the button when we click outside on a non-focusable element',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <div>
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>

            <span>I am just text</span>
          </div>
        `
      )

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the span to close
      await click(getByText('I am just text'))

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should be possible to close the popover, by clicking outside the popover on another focusable element',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <div>
            <Popover>
              <PopoverButton>Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>

            <button>Different button</button>
          </div>
        `
      )

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the extra button to close
      await click(getByText('Different button'))

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the other button is focused
      assertActiveElement(getByText('Different button'))
    })
  )

  it(
    'should be possible to close the popover, by clicking outside the popover on another element inside a focusable element',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      renderTemplate({
        template: html`
          <div>
            <Popover>
              <PopoverButton :onFocus="focusFn">Trigger</PopoverButton>
              <PopoverPanel>Contents</PopoverPanel>
            </Popover>

            <button id="btn">
              <span>Different button</span>
            </button>
          </div>
        `,
        setup() {
          return { focusFn }
        },
      })

      // Open popover
      await click(getPopoverButton())

      // Verify it is open
      assertPopoverButton({ state: PopoverState.Visible })

      // Click the span inside the extra button to close
      await click(getByText('Different button'))

      // Verify it is closed
      assertPopoverButton({ state: PopoverState.InvisibleUnmounted })

      // Verify the other button is focused
      assertActiveElement(document.getElementById('btn'))

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to close the Popover by clicking on a PopoverButton inside a PopoverPanel',
    suppressConsoleLogs(async () => {
      renderTemplate(
        html`
          <Popover>
            <PopoverButton>Open</PopoverButton>
            <PopoverPanel>
              <PopoverButton>Close</PopoverButton>
            </PopoverPanel>
          </Popover>
        `
      )

      // Open the popover
      await click(getPopoverButton())

      let closeBtn = getByText('Close')

      expect(closeBtn).not.toHaveAttribute('id')
      expect(closeBtn).not.toHaveAttribute('aria-controls')
      expect(closeBtn).not.toHaveAttribute('aria-expanded')

      // The close button should close the popover
      await click(closeBtn)

      // Verify it is closed
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

      // Verify we restored the Open button
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should not close the Popover when clicking on a focusable element inside a static PopoverPanel',
    suppressConsoleLogs(async () => {
      let clickFn = jest.fn()

      renderTemplate({
        template: html`
          <Popover>
            <PopoverButton>Open</PopoverButton>
            <PopoverPanel static>
              <button @click="clickFn">btn</button>
            </PopoverPanel>
          </Popover>
        `,
        setup: () => ({ clickFn }),
      })

      // Open the popover
      await click(getPopoverButton())

      // The button should not close the popover
      await click(getByText('btn'))

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.Visible })

      // Verify we actually clicked the button
      expect(clickFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should not close the Popover when clicking on a non-focusable element inside a static PopoverPanel',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Popover>
          <PopoverButton>Open</PopoverButton>
          <PopoverPanel static>
            <span>element</span>
          </PopoverPanel>
        </Popover>
      `)

      // Open the popover
      await click(getPopoverButton())

      // The element should not close the popover
      await click(getByText('element'))

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.Visible })
    })
  )

  it(
    'should close the Popover when clicking outside of a static PopoverPanel',
    suppressConsoleLogs(async () => {
      renderTemplate(html`
        <Popover>
          <PopoverButton>Open</PopoverButton>
          <PopoverPanel static>
            <span>element</span>
          </PopoverPanel>
        </Popover>
      `)

      // Open the popover
      await click(getPopoverButton())

      // The element should close the popover
      await click(document.body)

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.InvisibleHidden })
    })
  )
})
