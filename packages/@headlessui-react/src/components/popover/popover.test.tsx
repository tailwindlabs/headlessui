import React, { createElement, useEffect, useRef } from 'react'
import { render } from '@testing-library/react'

import { Popover } from './popover'
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
import { click, press, focus, Keys, MouseButton, shift } from '../../test-utils/interactions'
import { Portal } from '../portal/portal'
import { Transition } from '../transitions/transition'

jest.mock('../../hooks/use-id')

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

describe('Safe guards', () => {
  it.each([
    ['Popover.Button', Popover.Button],
    ['Popover.Panel', Popover.Panel],
    ['Popover.Overlay', Popover.Overlay],
  ])(
    'should error when we are using a <%s /> without a parent <Popover />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Popover /> component.`
      )
    })
  )

  it(
    'should be possible to render a Popover without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
        </Popover>
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
  describe('Popover.Group', () => {
    it(
      'should be possible to render a Popover.Group with multiple Popover components',
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>Panel 1</Popover.Panel>
            </Popover>
            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>Panel 2</Popover.Panel>
            </Popover>
          </Popover.Group>
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
        render(
          <Popover>
            {({ open }) => (
              <>
                <Popover.Button>Trigger</Popover.Button>
                <Popover.Panel>Panel is: {open ? 'open' : 'closed'}</Popover.Panel>
              </>
            )}
          </Popover>
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
        render(
          <Popover>
            {({ close }) => (
              <>
                <Popover.Button>Trigger</Popover.Button>
                <Popover.Panel>
                  <button onClick={() => close()}>Close me</button>
                </Popover.Panel>
              </>
            )}
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <>
            <button id="test">restoreable</button>
            <Popover>
              {({ close }) => (
                <>
                  <Popover.Button>Trigger</Popover.Button>
                  <Popover.Panel>
                    <button onClick={() => close(document.getElementById('test')!)}>
                      Close me
                    </button>
                  </Popover.Panel>
                </>
              )}
            </Popover>
          </>
        )

        // Focus the button
        await focus(getPopoverButton())

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
        function Example() {
          let elementRef = useRef(null)
          return (
            <>
              <button ref={elementRef}>restoreable</button>
              <Popover>
                {({ close }) => (
                  <>
                    <Popover.Button>Trigger</Popover.Button>
                    <Popover.Panel>
                      <button onClick={() => close(elementRef)}>Close me</button>
                    </Popover.Panel>
                  </>
                )}
              </Popover>
            </>
          )
        }

        render(<Example />)

        // Focus the button
        await focus(getPopoverButton())

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

  describe('Popover.Button', () => {
    it(
      'should be possible to render a Popover.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>{JSON.stringify}</Popover.Button>
            <Popover.Panel></Popover.Panel>
          </Popover>
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
      'should be possible to render a Popover.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button as="div" role="button">
              {JSON.stringify}
            </Popover.Button>
            <Popover.Panel />
          </Popover>
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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
          </Popover>
        )

        expect(getPopoverButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Popover>
            <Popover.Button type="submit">Trigger</Popover.Button>
          </Popover>
        )

        expect(getPopoverButton()).toHaveAttribute('type', 'submit')
      })

      it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
        let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
          <button ref={ref} {...props} />
        ))

        render(
          <Popover>
            <Popover.Button as={CustomButton}>Trigger</Popover.Button>
          </Popover>
        )

        expect(getPopoverButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Popover>
            <Popover.Button as="div">Trigger</Popover.Button>
          </Popover>
        )

        expect(getPopoverButton()).not.toHaveAttribute('type')
      })

      it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
        let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
          <div ref={ref} {...props} />
        ))

        render(
          <Popover>
            <Popover.Button as={CustomButton}>Trigger</Popover.Button>
          </Popover>
        )

        expect(getPopoverButton()).not.toHaveAttribute('type')
      })
    })
  })

  describe('Popover.Panel', () => {
    it(
      'should be possible to render Popover.Panel using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>{JSON.stringify}</Popover.Panel>
          </Popover>
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

    it('should be possible to always render the Popover.Panel if we provide it a `static` prop', () => {
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel static>Contents</Popover.Panel>
        </Popover>
      )

      // Let's verify that the Popover is already there
      expect(getPopoverPanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Popover.Panel', async () => {
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel unmount={false}>Contents</Popover.Panel>
        </Popover>
      )

      await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel focus>
              <a href="/">Link 1</a>
            </Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
      'should close the Popover, when Popover.Panel has the focus prop and you focus the open button',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel focus>
              <a href="/">Link 1</a>
            </Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

        // Ensure the button is focused
        assertActiveElement(getPopoverButton())

        // Open the popover
        await click(getPopoverButton())

        // Ensure the active element is within the Panel
        assertContainsActiveElement(getPopoverPanel())
        assertActiveElement(getByText('Link 1'))

        // Focus the button again
        await focus(getPopoverButton())

        // Ensure the Popover is closed again
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to move the focus inside the panel to the first focusable element (skip hidden link)',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel focus>
              <a href="/" style={{ display: 'none' }}>
                Link 1
              </a>
              <a href="/">Link 2</a>
            </Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel focus unmount={false}>
              <a href="/">Link 1</a>
            </Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>
              {({ close }) => <button onClick={() => close()}>Close me</button>}
            </Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <>
            <button id="test">restoreable</button>
            <Popover>
              <Popover.Button>Trigger</Popover.Button>
              <Popover.Panel>
                {({ close }) => (
                  <button onClick={() => close(document.getElementById('test')!)}>Close me</button>
                )}
              </Popover.Panel>
            </Popover>
          </>
        )

        // Focus the button
        await focus(getPopoverButton())

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
        function Example() {
          let elementRef = useRef(null)
          return (
            <>
              <button ref={elementRef}>restoreable</button>
              <Popover>
                <Popover.Button>Trigger</Popover.Button>
                <Popover.Panel>
                  {({ close }) => <button onClick={() => close(elementRef)}>Close me</button>}
                </Popover.Panel>
              </Popover>
            </>
          )
        }

        render(<Example />)

        // Focus the button
        await focus(getPopoverButton())

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
  function Debug({ fn, name }: { fn: (text: string) => void; name: string }) {
    useEffect(() => {
      fn(`Mounting - ${name}`)
      return () => {
        fn(`Unmounting - ${name}`)
      }
    }, [fn, name])
    return null
  }

  it(
    'should be possible to wrap the Popover.Panel with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Debug name="Popover" fn={orderFn} />
          <Transition>
            <Debug name="Transition" fn={orderFn} />
            <Popover.Panel>
              <Transition.Child>
                <Debug name="Transition.Child" fn={orderFn} />
              </Transition.Child>
            </Popover.Panel>
          </Transition>
        </Popover>
      )

      // Open the popover
      await click(getPopoverButton())

      // Close the popover
      await click(getPopoverButton())

      // Wait for all transitions to finish
      await nextFrame()
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Popover'],
        ['Mounting - Transition'],
        ['Mounting - Transition.Child'],
        ['Unmounting - Transition'],
        ['Unmounting - Transition.Child'],
      ])
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the Popover with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button disabled>Trigger</Popover.Button>
            <Popover.Panel>Content</Popover.Panel>
          </Popover>
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>Panel 1</Popover.Panel>
            </Popover>
            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>Panel 2</Popover.Panel>
            </Popover>
          </Popover.Group>
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
      'should close the Popover by pressing `Enter` on a Popover.Button inside a Popover.Panel',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Open</Popover.Button>
            <Popover.Panel>
              <Popover.Button>Close</Popover.Button>
            </Popover.Panel>
          </Popover>
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
      'should close the Popover menu, when pressing escape on the Popover.Button',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
      'should close the Popover menu, when pressing escape on the Popover.Panel',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>
              <a href="/">Link</a>
            </Popover.Panel>
          </Popover>
        )

        // Focus the button
        await focus(getPopoverButton())

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
      'should be possible to close a sibling Popover when pressing escape on a sibling Popover.Button',
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>Panel 1</Popover.Panel>
            </Popover>

            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>Panel 2</Popover.Panel>
            </Popover>
          </Popover.Group>
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
      'should be possible to Tab through the panel contents onto the next Popover.Button',
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>

            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>Panel 2</Popover.Panel>
            </Popover>
          </Popover.Group>
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
      'should be possible to place a focusable item in the Popover.Group, and keep the Popover open when we focus the focusable element',
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>

            <a href="/">Link in between</a>

            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>Panel 2</Popover.Panel>
            </Popover>
          </Popover.Group>
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
      'should close the Popover menu once we Tab out of the Popover.Group',
      suppressConsoleLogs(async () => {
        render(
          <>
            <Popover.Group>
              <Popover>
                <Popover.Button>Trigger 1</Popover.Button>
                <Popover.Panel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </Popover.Panel>
              </Popover>

              <Popover>
                <Popover.Button>Trigger 2</Popover.Button>
                <Popover.Panel>
                  <a href="/">Link 3</a>
                  <a href="/">Link 4</a>
                </Popover.Panel>
              </Popover>
            </Popover.Group>

            <a href="/">Next</a>
          </>
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

        // Let's Tab out of the Popover.Group
        await press(Keys.Tab)

        // Verify the next link is now focused
        assertActiveElement(getByText('Next'))

        // Verify the popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should close the Popover menu once we Tab out of the Popover',
      suppressConsoleLogs(async () => {
        render(
          <>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>

            <a href="/">Next</a>
          </>
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
      'should close the Popover when the Popover.Panel has a focus prop',
      suppressConsoleLogs(async () => {
        render(
          <>
            <a href="/">Previous</a>
            <Popover>
              <Popover.Button>Trigger</Popover.Button>
              <Popover.Panel focus>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>
            <a href="/">Next</a>
          </>
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
      'should close the Popover when the Popover.Panel has a focus prop (Popover.Panel uses a Portal)',
      suppressConsoleLogs(async () => {
        render(
          <>
            <a href="/">Previous</a>
            <Popover>
              <Popover.Button>Trigger</Popover.Button>
              <Portal>
                <Popover.Panel focus>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </Popover.Panel>
              </Portal>
            </Popover>
            <a href="/">Next</a>
          </>
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
      'should close the Popover when the Popover.Panel has a focus prop (Popover.Panel uses a Portal), and focus the next focusable item in line',
      suppressConsoleLogs(async () => {
        render(
          <>
            <a href="/">Previous</a>
            <Popover>
              <Popover.Button>Trigger</Popover.Button>
              <Portal>
                <Popover.Panel focus>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </Popover.Panel>
              </Portal>
            </Popover>
          </>
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
      'should close the Popover menu once we Tab out of the Popover.Group',
      suppressConsoleLogs(async () => {
        render(
          <>
            <a href="/">Previous</a>

            <Popover.Group>
              <Popover>
                <Popover.Button>Trigger 1</Popover.Button>
                <Popover.Panel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </Popover.Panel>
              </Popover>

              <Popover>
                <Popover.Button>Trigger 2</Popover.Button>
                <Popover.Panel>
                  <a href="/">Link 3</a>
                  <a href="/">Link 4</a>
                </Popover.Panel>
              </Popover>
            </Popover.Group>
          </>
        )

        // Focus the button of the second Popover
        getByText('Trigger 2')?.focus()

        // Open popover
        await click(getByText('Trigger 2'))

        // Verify we can tab to Trigger 1
        await press(shift(Keys.Tab))
        assertActiveElement(getByText('Trigger 1'))

        // Let's Tab out of the Popover.Group
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
        render(
          <>
            <a href="/">Previous</a>

            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>
          </>
        )

        // Focus the button of the Popover
        await focus(getPopoverButton())

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
      'should focus the previous Popover.Button when Shift+Tab on the second Popover.Button',
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>

            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 3</a>
                <a href="/">Link 4</a>
              </Popover.Panel>
            </Popover>
          </Popover.Group>
        )

        // Open the second popover
        await click(getByText('Trigger 2'))

        // Ensure the second popover is open
        assertPopoverButton({ state: PopoverState.Visible }, getByText('Trigger 2'))

        // Close the popover
        await press(Keys.Escape)

        // Ensure the popover is now closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted }, getByText('Trigger 2'))

        // Ensure the second Popover.Button is focused
        assertActiveElement(getByText('Trigger 2'))

        // Tab backwards
        await press(shift(Keys.Tab))

        // Ensure the first Popover.Button is open
        assertActiveElement(getByText('Trigger 1'))
      })
    )

    it(
      'should focus the Popover.Button when pressing Shift+Tab when we focus inside the Popover.Panel',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger 1</Popover.Button>
            <Popover.Panel focus>
              <a href="/">Link 1</a>
              <a href="/">Link 2</a>
            </Popover.Panel>
          </Popover>
        )

        // Open the popover
        await click(getPopoverButton())

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Ensure the Link 1 is focused
        assertActiveElement(getByText('Link 1'))

        // Tab out of the Panel
        await press(shift(Keys.Tab))

        // Ensure the Popover.Button is focused again
        assertActiveElement(getPopoverButton())

        // Ensure the Popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should focus the Popover.Button when pressing Shift+Tab when we focus inside the Popover.Panel (inside a Portal)',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Trigger 1</Popover.Button>
            <Portal>
              <Popover.Panel focus>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Portal>
          </Popover>
        )

        // Open the popover
        await click(getPopoverButton())

        // Ensure the popover is open
        assertPopoverButton({ state: PopoverState.Visible })

        // Ensure the Link 1 is focused
        assertActiveElement(getByText('Link 1'))

        // Tab out of the Panel
        await press(shift(Keys.Tab))

        // Ensure the Popover.Button is focused again
        assertActiveElement(getPopoverButton())

        // Ensure the Popover is closed
        assertPopoverButton({ state: PopoverState.InvisibleUnmounted })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to focus the last item in the Popover.Panel when pressing Shift+Tab on the next Popover.Button',
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 1</a>
                <a href="/">Link 2</a>
              </Popover.Panel>
            </Popover>

            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>
                <a href="/">Link 3</a>
                <a href="/">Link 4</a>
              </Popover.Panel>
            </Popover>
          </Popover.Group>
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

        // Press shift+tab, to move focus to the last item in the Popover.Panel
        await press(shift(Keys.Tab), getByText('Trigger 2'))

        // Verify we are focusing the last link of the first Popover
        assertActiveElement(getByText('Link 2'))
      })
    )

    it(
      "should be possible to focus the last item in the Popover.Panel when pressing Shift+Tab on the next Popover.Button (using Portal's)",
      suppressConsoleLogs(async () => {
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Portal>
                <Popover.Panel>
                  <a href="/">Link 1</a>
                  <a href="/">Link 2</a>
                </Popover.Panel>
              </Portal>
            </Popover>

            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Portal>
                <Popover.Panel>
                  <a href="/">Link 3</a>
                  <a href="/">Link 4</a>
                </Popover.Panel>
              </Portal>
            </Popover>
          </Popover.Group>
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

        // Press shift+tab, to move focus to the last item in the Popover.Panel
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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button disabled>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>
        )

        assertPopoverButton({
          state: PopoverState.InvisibleUnmounted,
          attributes: { id: 'headlessui-popover-button-1' },
        })
        assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })

        // Focus the button
        await focus(getPopoverButton())

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
        render(
          <Popover.Group>
            <Popover>
              <Popover.Button>Trigger 1</Popover.Button>
              <Popover.Panel>Panel 1</Popover.Panel>
            </Popover>
            <Popover>
              <Popover.Button>Trigger 2</Popover.Button>
              <Popover.Panel>Panel 2</Popover.Panel>
            </Popover>
          </Popover.Group>
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
      'should close the Popover by pressing `Space` on a Popover.Button inside a Popover.Panel',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Open</Popover.Button>
            <Popover.Panel>
              <Popover.Button>Close</Popover.Button>
            </Popover.Panel>
          </Popover>
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
      'should close the Popover by pressing `Enter` on a Popover.Button and go to the href of the `a` inside a Popover.Panel',
      suppressConsoleLogs(async () => {
        render(
          <Popover>
            <Popover.Button>Open</Popover.Button>
            <Popover.Panel>
              <Popover.Button as={React.Fragment}>
                <a href="#closed">Close</a>
              </Popover.Button>
            </Popover.Panel>
          </Popover>
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
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
        </Popover>
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
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
        </Popover>
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
      render(
        <Popover>
          <Popover.Button disabled>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
        </Popover>
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
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
        </Popover>
      )

      await focus(getPopoverButton())

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
    'should be possible to close a Popover using a click on the Popover.Overlay',
    suppressConsoleLogs(async () => {
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
          <Popover.Overlay />
        </Popover>
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
      render(
        <Popover>
          <Popover.Button>Trigger</Popover.Button>
          <Popover.Panel>Contents</Popover.Panel>
        </Popover>
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
      render(
        <>
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>

          <span>I am just text</span>
        </>
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
      render(
        <>
          <Popover>
            <Popover.Button>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>

          <button>Different button</button>
        </>
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
      render(
        <>
          <Popover>
            <Popover.Button onFocus={focusFn}>Trigger</Popover.Button>
            <Popover.Panel>Contents</Popover.Panel>
          </Popover>

          <button id="btn">
            <span>Different button</span>
          </button>
        </>
      )

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
    'should be possible to close the Popover by clicking on a Popover.Button inside a Popover.Panel',
    suppressConsoleLogs(async () => {
      render(
        <Popover>
          <Popover.Button>Open</Popover.Button>
          <Popover.Panel>
            <Popover.Button>Close</Popover.Button>
          </Popover.Panel>
        </Popover>
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
    'should not close the Popover when clicking on a focusable element inside a static Popover.Panel',
    suppressConsoleLogs(async () => {
      let clickFn = jest.fn()

      render(
        <Popover>
          <Popover.Button>Open</Popover.Button>
          <Popover.Panel static>
            <button onClick={clickFn}>btn</button>
          </Popover.Panel>
        </Popover>
      )

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
    'should not close the Popover when clicking on a non-focusable element inside a static Popover.Panel',
    suppressConsoleLogs(async () => {
      render(
        <Popover>
          <Popover.Button>Open</Popover.Button>
          <Popover.Panel static>
            <span>element</span>
          </Popover.Panel>
        </Popover>
      )

      // Open the popover
      await click(getPopoverButton())

      // The element should not close the popover
      await click(getByText('element'))

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.Visible })
    })
  )

  it(
    'should close the Popover when clicking outside of a static Popover.Panel',
    suppressConsoleLogs(async () => {
      render(
        <Popover>
          <Popover.Button>Open</Popover.Button>
          <Popover.Panel static>
            <span>element</span>
          </Popover.Panel>
        </Popover>
      )

      // Open the popover
      await click(getPopoverButton())

      // The element should close the popover
      await click(document.body)

      // Verify it is still open
      assertPopoverButton({ state: PopoverState.InvisibleHidden })
    })
  )
})
