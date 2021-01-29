import React, { createElement } from 'react'
import { render } from '@testing-library/react'

import { Dialog } from './dialog'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  assertDialogButton,
  DialogState,
  assertDialogPanel,
  getDialogButton,
  getDialogPanel,
  assertDialogOverlay,
  getDialogOverlay,
} from '../../test-utils/accessibility-assertions'
import { click, press, Keys } from '../../test-utils/interactions'
import { Props } from '../../types'

jest.mock('../../hooks/use-id')

afterAll(() => jest.restoreAllMocks())

function TabSentinel(props: Props<'div'>) {
  return <div tabIndex={0} {...props} />
}

describe('Safe guards', () => {
  it.each([
    ['Dialog.Button', Dialog.Button],
    ['Dialog.Panel', Dialog.Panel],
    ['Dialog.Overlay', Dialog.Overlay],
  ])(
    'should error when we are using a <%s /> without a parent <Dialog />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Dialog /> component.`
      )
      expect.hasAssertions()
    })
  )

  it(
    'should be possible to render a Dialog without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Overlay />
          <Dialog.Panel>Contents</Dialog.Panel>
        </Dialog>
      )

      assertDialogButton({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-button-1' },
      })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Dialog', () => {
    it(
      'should be possible to render a Dialog using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            {({ open }) => (
              <>
                <Dialog.Button>Trigger</Dialog.Button>
                <Dialog.Panel>
                  Panel is: {open ? 'open' : 'closed'}
                  <TabSentinel />
                </Dialog.Panel>
              </>
            )}
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        await click(getDialogButton())

        assertDialogButton({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.Visible, textContent: 'Panel is: open' })
      })
    )
  })

  describe('Dialog.Button', () => {
    it(
      'should be possible to render a Dialog.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button>{JSON.stringify}</Dialog.Button>
            <Dialog.Panel>
              <TabSentinel />
            </Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        await click(getDialogButton())

        assertDialogButton({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDialogPanel({ state: DialogState.Visible })
      })
    )

    it(
      'should be possible to render a Dialog.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button as="div" role="button">
              {JSON.stringify}
            </Dialog.Button>
            <Dialog.Panel>
              <TabSentinel />
            </Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        await click(getDialogButton())

        assertDialogButton({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertDialogPanel({ state: DialogState.Visible })
      })
    )
  })

  describe('Dialog.Panel', () => {
    it(
      'should be possible to render Dialog.Panel using a render prop',
      suppressConsoleLogs(async () => {
        let panel = jest.fn().mockReturnValue(<TabSentinel />)
        render(
          <Dialog>
            <Dialog.Button>Trigger</Dialog.Button>
            <Dialog.Panel>{panel}</Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-panel-2' },
        })

        await click(getDialogButton())

        assertDialogButton({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-panel-2' },
        })
        expect(panel).toHaveBeenCalledWith({ open: true, close: expect.any(Function) })
      })
    )

    it('should be possible to always render the Dialog.Panel if we provide it a `static` prop', () => {
      let focusCounter = jest.fn()
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Panel static>
            Contents
            <TabSentinel onFocus={focusCounter} />
          </Dialog.Panel>
        </Dialog>
      )

      // Let's verify that the Dialog is already there
      expect(getDialogPanel()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(1)
    })

    it('should be possible to use a different render strategy for the Dialog.Panel', async () => {
      let focusCounter = jest.fn()
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Panel unmount={false}>
            <input onFocus={focusCounter} />
          </Dialog.Panel>
        </Dialog>
      )

      assertDialogButton({ state: DialogState.InvisibleHidden })
      assertDialogPanel({ state: DialogState.InvisibleHidden })
      expect(focusCounter).toHaveBeenCalledTimes(0)

      // Let's open the Dialog, to see if it is not hidden anymore
      await click(getDialogButton())
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialogButton({ state: DialogState.Visible })
      assertDialogPanel({ state: DialogState.Visible })

      // Let's re-click the Dialog, to see if it is hidden again
      await click(getDialogButton())
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialogButton({ state: DialogState.InvisibleHidden })
      assertDialogPanel({ state: DialogState.InvisibleHidden })
    })
  })

  describe('Dialog.Overlay', () => {
    it(
      'should be possible to render Dialog.Overlay using a render prop',
      suppressConsoleLogs(async () => {
        let panel = jest.fn().mockReturnValue(null)
        render(
          <Dialog>
            <Dialog.Button>Trigger</Dialog.Button>
            <Dialog.Overlay>{panel}</Dialog.Overlay>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogOverlay({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-overlay-2' },
        })

        await click(getDialogButton())

        assertDialogButton({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogOverlay({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-overlay-2' },
        })
        expect(panel).toHaveBeenCalledWith({ open: true, close: expect.any(Function) })
      })
    )

    it('should be possible to always render the Dialog.Overlay if we provide it a `static` prop', () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Overlay static />
        </Dialog>
      )

      // Let's verify that the Dialog is already there
      expect(getDialogOverlay()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Dialog.Overlay', async () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Overlay unmount={false} />
        </Dialog>
      )

      assertDialogButton({ state: DialogState.InvisibleHidden })
      assertDialogOverlay({ state: DialogState.InvisibleHidden })

      // Let's open the Dialog, to see if it is not hidden anymore
      await click(getDialogButton())

      assertDialogButton({ state: DialogState.Visible })
      assertDialogOverlay({ state: DialogState.Visible })

      // Let's re-click the Dialog, to see if it is hidden again
      await click(getDialogButton())

      assertDialogButton({ state: DialogState.InvisibleHidden })
      assertDialogOverlay({ state: DialogState.InvisibleHidden })
    })
  })
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the Dialog with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button>Trigger</Dialog.Button>
            <Dialog.Panel>
              Contents
              <TabSentinel />
            </Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        // Focus the button
        getDialogButton()?.focus()

        // Open dialog
        await press(Keys.Enter)

        // Verify it is open
        assertDialogButton({ state: DialogState.Visible })
        assertDialogPanel({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-panel-2' },
        })

        // Close dialog
        await press(Keys.Enter)
        assertDialogButton({ state: DialogState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to open the dialog with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button disabled>Trigger</Dialog.Button>
            <Dialog.Panel>Content</Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        // Try to open the dialog
        await press(Keys.Enter, getDialogButton())

        // Verify it is still closed
        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })
      })
    )
  })

  describe('`Space` key', () => {
    it(
      'should be possible to open the dialog with Space',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button>Trigger</Dialog.Button>
            <Dialog.Panel>
              Contents
              <TabSentinel />
            </Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        // Focus the button
        getDialogButton()?.focus()

        // Open dialog
        await press(Keys.Space)

        // Verify it is open
        assertDialogButton({ state: DialogState.Visible })
        assertDialogPanel({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-panel-2' },
        })
      })
    )

    it(
      'should not be possible to open the dialog with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button disabled>Trigger</Dialog.Button>
            <Dialog.Panel>Contents</Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        // Try to open the dialog
        await press(Keys.Space, getDialogButton())

        // Verify it is still closed
        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })
      })
    )
  })

  describe('`Escape` key', () => {
    it(
      'should be possible to close the dialog with Escape',
      suppressConsoleLogs(async () => {
        render(
          <Dialog>
            <Dialog.Button>Trigger</Dialog.Button>
            <Dialog.Panel>
              Contents
              <TabSentinel />
            </Dialog.Panel>
          </Dialog>
        )

        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(getDialogButton())

        // Verify it is open
        assertDialogButton({ state: DialogState.Visible })
        assertDialogPanel({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-panel-2' },
        })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialogButton({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-button-1' },
        })
        assertDialogPanel({ state: DialogState.InvisibleUnmounted })
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to open a dialog on click',
    suppressConsoleLogs(async () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Panel>
            Contents
            <TabSentinel />
          </Dialog.Panel>
        </Dialog>
      )

      assertDialogButton({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-button-1' },
      })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })

      // Open dialog
      await click(getDialogButton())

      // Verify it is open
      assertDialogButton({ state: DialogState.Visible })
      assertDialogPanel({
        state: DialogState.Visible,
        attributes: { id: 'headlessui-dialog-panel-2' },
      })
    })
  )

  it(
    'should not be possible to open a dialog on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Dialog>
          <Dialog.Button disabled>Trigger</Dialog.Button>
          <Dialog.Panel>Contents</Dialog.Panel>
        </Dialog>
      )

      assertDialogButton({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-button-1' },
      })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })

      // Try to open the dialog
      await click(getDialogButton())

      // Verify it is still closed
      assertDialogButton({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-button-1' },
      })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a dialog on click',
    suppressConsoleLogs(async () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Panel>
            Contents
            <TabSentinel />
          </Dialog.Panel>
        </Dialog>
      )

      // Open dialog
      await click(getDialogButton())

      // Verify it is open
      assertDialogButton({ state: DialogState.Visible })

      // Click to close
      await click(getDialogButton())

      // Verify it is closed
      assertDialogButton({ state: DialogState.InvisibleUnmounted })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close a Dialog using a click on the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Overlay />
          <Dialog.Panel>
            Contents
            <TabSentinel />
          </Dialog.Panel>
        </Dialog>
      )

      // Open dialog
      await click(getDialogButton())

      // Verify it is open
      assertDialogButton({ state: DialogState.Visible })

      // Click to close
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialogButton({ state: DialogState.InvisibleUnmounted })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the Dialog from within the Dialog.Panel using the expose close function',
    suppressConsoleLogs(async () => {
      render(
        <Dialog>
          <Dialog.Button>Trigger</Dialog.Button>
          <Dialog.Panel>
            {({ close }) => (
              <div>
                <button id="cancel-btn" onClick={close}>
                  Cancel
                </button>
              </div>
            )}
          </Dialog.Panel>
        </Dialog>
      )

      // Open dialog
      await click(getDialogButton())

      // Verify it is open
      assertDialogButton({ state: DialogState.Visible })

      // Click to close
      await click(document.getElementById('cancel-btn'))

      // Verify it is closed
      assertDialogButton({ state: DialogState.InvisibleUnmounted })
      assertDialogPanel({ state: DialogState.InvisibleUnmounted })
    })
  )
})
