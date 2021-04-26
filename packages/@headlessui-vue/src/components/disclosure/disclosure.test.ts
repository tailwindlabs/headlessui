import { defineComponent, nextTick } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { Disclosure, DisclosureButton, DisclosurePanel } from './disclosure'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  DisclosureState,
  assertDisclosurePanel,
  assertDisclosureButton,
  getDisclosureButton,
  getDisclosurePanel,
} from '../../test-utils/accessibility-assertions'
import { click, press, Keys, MouseButton } from '../../test-utils/interactions'
import { html } from '../../test-utils/html'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = { Disclosure, DisclosureButton, DisclosurePanel }

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
      renderTemplate(
        html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `
      )

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
        renderTemplate(
          html`
            <Disclosure v-slot="{ open }">
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>Panel is: {{open ? 'open' : 'closed'}}</DisclosurePanel>
            </Disclosure>
          `
        )

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
      renderTemplate(
        html`
          <Disclosure v-slot="{ open }" defaultOpen>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Panel is: {{open ? 'open' : 'closed'}}</DisclosurePanel>
          </Disclosure>
        `
      )

      await new Promise<void>(nextTick)

      assertDisclosureButton({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      assertDisclosurePanel({ state: DisclosureState.Visible, textContent: 'Panel is: open' })

      await click(getDisclosureButton())

      assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
    })
  })

  describe('DisclosureButton', () => {
    it(
      'should be possible to render a DisclosureButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton v-slot="slot">{{JSON.stringify(slot)}}</DisclosureButton>
              <DisclosurePanel></DisclosurePanel>
            </Disclosure>
          `
        )

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
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton as="div" role="button" v-slot="slot">
                {{JSON.stringify(slot)}}
              </DisclosureButton>
              <DisclosurePanel />
            </Disclosure>
          `
        )

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
  })

  describe('DisclosurePanel', () => {
    it(
      'should be possible to render DisclosurePanel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel v-slot="slot">{{JSON.stringify(slot)}}</DisclosurePanel>
            </Disclosure>
          `
        )

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
      renderTemplate(
        html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel static>Contents</DisclosurePanel>
          </Disclosure>
        `
      )

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
  })
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the Disclosure with Enter',
      suppressConsoleLogs(async () => {
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>Contents</DisclosurePanel>
            </Disclosure>
          `
        )

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
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton disabled>Trigger</DisclosureButton>
              <DisclosurePanel>Content</DisclosurePanel>
            </Disclosure>
          `
        )

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
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>Contents</DisclosurePanel>
            </Disclosure>
          `
        )

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
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>Contents</DisclosurePanel>
            </Disclosure>
          `
        )

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
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton disabled>Trigger</DisclosureButton>
              <DisclosurePanel>Contents</DisclosurePanel>
            </Disclosure>
          `
        )

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
        renderTemplate(
          html`
            <Disclosure>
              <DisclosureButton>Trigger</DisclosureButton>
              <DisclosurePanel>Contents</DisclosurePanel>
            </Disclosure>
          `
        )

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
      renderTemplate(
        html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `
      )

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
      renderTemplate(
        html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `
      )

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
      renderTemplate(
        html`
          <Disclosure>
            <DisclosureButton disabled>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `
      )

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
      renderTemplate(
        html`
          <Disclosure>
            <DisclosureButton>Trigger</DisclosureButton>
            <DisclosurePanel>Contents</DisclosurePanel>
          </Disclosure>
        `
      )

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
})
