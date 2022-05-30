import { createTest, pick, expect } from '../util/plugin'

// import ExampleVue from './Example.vue'
import ExampleReact from './Example.tsx'
import {
  assertDisclosurePanel,
  assertDisclosureButton,
  getDisclosureButton,
  getDisclosurePanel,
  DisclosureState,
} from '../../../@headlessui-react/src/test-utils/accessibility-assertions'
import { click, press, focus, Keys, MouseButton } from '../util/interactions'
import { getByText, assertActiveElement } from '../util/accessibility'
import { debug } from 'console'

const test = createTest((props?: any) => {
  return pick({
    // vue: () => <ExampleVue {...props} />,
    react: () => <ExampleReact {...props} />,
  })
})

test.afterEach(async ({ debug }, info) => {
  if (info.status === 'failed') {
    await debug()
  }
})

test.describe('Keyboard interactions', () => {
  test.describe('`Enter` key', () => {
    test('should be possible to open the Disclosure with Enter', async ({ render, debug }) => {
      await render()

      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Focus the button
      await focus(getDisclosureButton())

      // Open disclosure
      await press(Keys.Enter)

      // Verify it is open
      await assertDisclosureButton({ state: DisclosureState.Visible })
      await assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })

      // Close disclosure
      await press(Keys.Enter)
      await assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
    })

    test('should not be possible to open the disclosure with Enter when the button is disabled', async ({
      render,
    }) => {
      await render({ buttonDisabled: true })

      await debug()

      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Focus the button
      await focus(getDisclosureButton())

      // Try to open the disclosure
      await press(Keys.Enter)

      // Verify it is still closed
      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })

    test('should be possible to close the disclosure with Enter when the disclosure is open', async ({
      render,
    }) => {
      await render()

      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Focus the button
      await focus(getDisclosureButton())

      // Open disclosure
      await press(Keys.Enter)

      // Verify it is open
      await assertDisclosureButton({ state: DisclosureState.Visible })
      await assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })

      // Close disclosure
      await press(Keys.Enter)

      // Verify it is closed again
      await assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  })

  test.describe('`Space` key', () => {
    test('should be possible to open the disclosure with Space', async ({ render }) => {
      await render()

      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Focus the button
      await focus(getDisclosureButton())

      // Open disclosure
      await press(Keys.Space)

      // Verify it is open
      await assertDisclosureButton({ state: DisclosureState.Visible })
      await assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })
    })

    test('should not be possible to open the disclosure with Space when the button is disabled', async ({
      render,
    }) => {
      await render({ buttonDisabled: true })

      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Focus the button
      await focus(getDisclosureButton())

      // Try to open the disclosure
      await press(Keys.Space)

      // Verify it is still closed
      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })

    test('should be possible to close the disclosure with Space when the disclosure is open', async ({
      render,
    }) => {
      await render()

      await assertDisclosureButton({
        state: DisclosureState.InvisibleUnmounted,
        attributes: { id: 'headlessui-disclosure-button-1' },
      })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Focus the button
      await focus(getDisclosureButton())

      // Open disclosure
      await press(Keys.Space)

      // Verify it is open
      await assertDisclosureButton({ state: DisclosureState.Visible })
      await assertDisclosurePanel({
        state: DisclosureState.Visible,
        attributes: { id: 'headlessui-disclosure-panel-2' },
      })

      // Close disclosure
      await press(Keys.Space)

      // Verify it is closed again
      await assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
      await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
    })
  })
})

test.describe('Mouse interactions', () => {
  test('should be possible to open a disclosure on click', async ({ render }) => {
    await render()

    await assertDisclosureButton({
      state: DisclosureState.InvisibleUnmounted,
      attributes: { id: 'headlessui-disclosure-button-1' },
    })
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    // Open disclosure
    await click(getDisclosureButton())

    // Verify it is open
    await assertDisclosureButton({ state: DisclosureState.Visible })
    await assertDisclosurePanel({
      state: DisclosureState.Visible,
      attributes: { id: 'headlessui-disclosure-panel-2' },
    })
  })

  test('should not be possible to open a disclosure on right click', async ({ render }) => {
    await render()

    await assertDisclosureButton({
      state: DisclosureState.InvisibleUnmounted,
      attributes: { id: 'headlessui-disclosure-button-1' },
    })
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    // Open disclosure
    await click(getDisclosureButton(), MouseButton.Right)

    // Verify it is still closed
    await assertDisclosureButton({
      state: DisclosureState.InvisibleUnmounted,
      attributes: { id: 'headlessui-disclosure-button-1' },
    })
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
  })

  test('should not be possible to open a disclosure on click when the button is disabled', async ({
    render,
  }) => {
    await render({ buttonDisabled: true })

    await assertDisclosureButton({
      state: DisclosureState.InvisibleUnmounted,
      attributes: { id: 'headlessui-disclosure-button-1' },
    })
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    // Try to open the disclosure
    await click(getDisclosureButton())

    // Verify it is still closed
    await assertDisclosureButton({
      state: DisclosureState.InvisibleUnmounted,
      attributes: { id: 'headlessui-disclosure-button-1' },
    })
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
  })

  test('should be possible to close a disclosure on click', async ({ render }) => {
    await render()

    // Open disclosure
    await click(getDisclosureButton())

    // Verify it is open
    await assertDisclosureButton({ state: DisclosureState.Visible })

    // Click to close
    await click(getDisclosureButton())

    // Verify it is closed
    await assertDisclosureButton({ state: DisclosureState.InvisibleUnmounted })
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })
  })

  test('should be possible to close the Disclosure by clicking on a Disclosure.Button inside a Disclosure.Panel', async ({
    render,
  }) => {
    await render({ buttonInside: true })

    // Open the disclosure
    await click(getDisclosureButton())

    let closeBtn = getByText('Close')

    expect(closeBtn).not.toHaveAttribute('id')
    expect(closeBtn).not.toHaveAttribute('aria-controls')
    expect(closeBtn).not.toHaveAttribute('aria-expanded')

    // The close button should close the disclosure
    await click(closeBtn)

    // Verify it is closed
    await assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

    // Verify we restored the Open button
    await assertActiveElement(getDisclosureButton())
  })
})
