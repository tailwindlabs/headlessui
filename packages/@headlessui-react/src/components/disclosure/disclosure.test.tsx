import { render } from '@testing-library/react'
import React, { createElement, Suspense, useEffect, useRef } from 'react'
import {
  assertActiveElement,
  assertDisclosureButton,
  assertDisclosurePanel,
  DisclosureState,
  getByText,
  getDisclosureButton,
  getDisclosurePanel,
} from '../../test-utils/accessibility-assertions'
import { click, focus, Keys, MouseButton, press } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { Transition } from '../transition/transition'
import { Disclosure } from './disclosure'

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
    ['Disclosure.Button', Disclosure.Button],
    ['Disclosure.Panel', Disclosure.Panel],
  ])(
    'should error when we are using a <%s /> without a parent <Disclosure />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component as any))).toThrow(
        `<${name} /> is missing a parent <Disclosure /> component.`
      )
    })
  )

  it(
    'should be possible to render a Disclosure without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
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
        render(
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button>Trigger</Disclosure.Button>
                <Disclosure.Panel>Panel is: {open ? 'open' : 'closed'}</Disclosure.Panel>
              </>
            )}
          </Disclosure>
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
      render(
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button>Trigger</Disclosure.Button>
              <Disclosure.Panel>Panel is: {open ? 'open' : 'closed'}</Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )

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
        render(
          <Disclosure>
            {({ close }) => (
              <>
                <Disclosure.Button>Trigger</Disclosure.Button>
                <Disclosure.Panel>
                  <button onClick={() => close()}>Close me</button>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        )

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <>
            <button id="test">restoreable</button>
            <Disclosure>
              {({ close }) => (
                <>
                  <Disclosure.Button>Trigger</Disclosure.Button>
                  <Disclosure.Panel>
                    <button onClick={() => close(document.getElementById('test')!)}>
                      Close me
                    </button>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </>
        )

        // Focus the button
        await focus(getDisclosureButton())

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
        function Example() {
          let elementRef = useRef(null)
          return (
            <>
              <button ref={elementRef}>restoreable</button>
              <Disclosure>
                {({ close }) => (
                  <>
                    <Disclosure.Button>Trigger</Disclosure.Button>
                    <Disclosure.Panel>
                      <button onClick={() => close(elementRef)}>Close me</button>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </>
          )
        }

        render(<Example />)

        // Focus the button
        await focus(getDisclosureButton())

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

    it('should not crash when using Suspense boundaries', async () => {
      render(
        <Disclosure defaultOpen={true}>
          <Disclosure.Button>Click me!</Disclosure.Button>
          <Disclosure.Panel>
            <Suspense fallback={null}>
              <p>Hi there</p>
            </Suspense>
          </Disclosure.Panel>
        </Disclosure>
      )
    })
  })

  describe('Disclosure.Button', () => {
    it(
      'should be possible to render a Disclosure.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>{(slot) => <>{JSON.stringify(slot)}</>}</Disclosure.Button>
            <Disclosure.Panel></Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({
            open: false,
            hover: false,
            active: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({
            open: true,
            hover: false,
            active: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    it(
      'should be possible to render a Disclosure.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button as="div" role="button">
              {(slot) => <>{JSON.stringify(slot)}</>}
            </Disclosure.Button>
            <Disclosure.Panel />
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({
            open: false,
            hover: false,
            active: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        await click(getDisclosureButton())

        assertDisclosureButton({
          state: DisclosureState.Visible,
          attributes: { id: 'headlessui-disclosure-button-1' },
          textContent: JSON.stringify({
            open: true,
            hover: false,
            active: false,
            focus: false,
            autofocus: false,
          }),
        })
        assertDisclosurePanel({ state: DisclosureState.Visible })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
          </Disclosure>
        )

        expect(getDisclosureButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Disclosure>
            <Disclosure.Button type="submit">Trigger</Disclosure.Button>
          </Disclosure>
        )

        expect(getDisclosureButton()).toHaveAttribute('type', 'submit')
      })

      it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
        let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
          <button ref={ref} {...props} />
        ))

        render(
          <Disclosure>
            <Disclosure.Button as={CustomButton}>Trigger</Disclosure.Button>
          </Disclosure>
        )

        expect(getDisclosureButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Disclosure>
            <Disclosure.Button as="div">Trigger</Disclosure.Button>
          </Disclosure>
        )

        expect(getDisclosureButton()).not.toHaveAttribute('type')
      })

      it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
        let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
          <div ref={ref} {...props} />
        ))

        render(
          <Disclosure>
            <Disclosure.Button as={CustomButton}>Trigger</Disclosure.Button>
          </Disclosure>
        )

        expect(getDisclosureButton()).not.toHaveAttribute('type')
      })
    })
  })

  describe('Disclosure.Panel', () => {
    it(
      'should be possible to render Disclosure.Panel using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>{(slot) => <>{JSON.stringify(slot)}</>}</Disclosure.Panel>
          </Disclosure>
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

    it('should be possible to always render the Disclosure.Panel if we provide it a `static` prop', () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel static>Contents</Disclosure.Panel>
        </Disclosure>
      )

      // Let's verify that the Disclosure is already there
      expect(getDisclosurePanel()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Disclosure.Panel', async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel unmount={false}>Contents</Disclosure.Panel>
        </Disclosure>
      )

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
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>
              {({ close }) => <button onClick={() => close()}>Close me</button>}
            </Disclosure.Panel>
          </Disclosure>
        )

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <>
            <button id="test">restoreable</button>
            <Disclosure>
              <Disclosure.Button>Trigger</Disclosure.Button>
              <Disclosure.Panel>
                {({ close }) => (
                  <button onClick={() => close(document.getElementById('test')!)}>Close me</button>
                )}
              </Disclosure.Panel>
            </Disclosure>
          </>
        )

        // Focus the button
        await focus(getDisclosureButton())

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
        function Example() {
          let elementRef = useRef(null)
          return (
            <>
              <button ref={elementRef}>restoreable</button>
              <Disclosure>
                <Disclosure.Button>Trigger</Disclosure.Button>
                <Disclosure.Panel>
                  {({ close }) => <button onClick={() => close(elementRef)}>Close me</button>}
                </Disclosure.Panel>
              </Disclosure>
            </>
          )
        }

        render(<Example />)

        // Focus the button
        await focus(getDisclosureButton())

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
    'should be possible to control the Disclosure.Panel by wrapping it in a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Debug name="Disclosure" fn={orderFn} />
          <Transition>
            <Debug name="Transition" fn={orderFn} />
            <Disclosure.Panel>
              <Transition.Child>
                <Debug name="Transition.Child" fn={orderFn} />
              </Transition.Child>
            </Disclosure.Panel>
          </Transition>
        </Disclosure>
      )

      // Verify the Disclosure is hidden
      assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

      // Open the Disclosure component
      await click(getDisclosureButton())

      // Verify the Disclosure is visible
      assertDisclosurePanel({ state: DisclosureState.Visible })

      // Unmount the full tree
      await click(getDisclosureButton())

      // Wait for all transitions to finish
      await nextFrame()
      await nextFrame()

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Disclosure'],
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
      'should be possible to open the Disclosure with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <Disclosure>
            <Disclosure.Button disabled>Trigger</Disclosure.Button>
            <Disclosure.Panel>Content</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <Disclosure>
            <Disclosure.Button disabled>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        await focus(getDisclosureButton())

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
        render(
          <Disclosure>
            <Disclosure.Button>Trigger</Disclosure.Button>
            <Disclosure.Panel>Contents</Disclosure.Panel>
          </Disclosure>
        )

        assertDisclosureButton({
          state: DisclosureState.InvisibleUnmounted,
          attributes: { id: 'headlessui-disclosure-button-1' },
        })
        assertDisclosurePanel({ state: DisclosureState.InvisibleUnmounted })

        // Focus the button
        await focus(getDisclosureButton())

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
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
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
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
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
      render(
        <Disclosure>
          <Disclosure.Button disabled>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
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
      render(
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>
          <Disclosure.Panel>Contents</Disclosure.Panel>
        </Disclosure>
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

  it(
    'should be possible to close the Disclosure by clicking on a Disclosure.Button inside a Disclosure.Panel',
    suppressConsoleLogs(async () => {
      render(
        <Disclosure>
          <Disclosure.Button>Open</Disclosure.Button>
          <Disclosure.Panel>
            <Disclosure.Button>Close</Disclosure.Button>
          </Disclosure.Panel>
        </Disclosure>
      )

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
