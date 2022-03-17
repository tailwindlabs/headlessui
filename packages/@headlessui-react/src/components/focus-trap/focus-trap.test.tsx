import React, { useState, useRef, FocusEvent } from 'react'
import { render, screen } from '@testing-library/react'

import { FocusTrap } from './focus-trap'
import { assertActiveElement } from '../../test-utils/accessibility-assertions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { click, press, shift, Keys } from '../../test-utils/interactions'

it('should focus the first focusable element inside the FocusTrap', () => {
  render(
    <FocusTrap>
      <button>Trigger</button>
    </FocusTrap>
  )

  assertActiveElement(screen.getByText('Trigger'))
})

it('should focus the autoFocus element inside the FocusTrap if that exists', () => {
  render(
    <FocusTrap>
      <input id="a" type="text" />
      <input id="b" type="text" autoFocus />
      <input id="c" type="text" />
    </FocusTrap>
  )

  assertActiveElement(document.getElementById('b'))
})

it('should focus the initialFocus element inside the FocusTrap if that exists', () => {
  function Example() {
    let initialFocusRef = useRef<HTMLInputElement | null>(null)

    return (
      <FocusTrap initialFocus={initialFocusRef}>
        <input id="a" type="text" />
        <input id="b" type="text" />
        <input id="c" type="text" ref={initialFocusRef} />
      </FocusTrap>
    )
  }
  render(<Example />)

  assertActiveElement(document.getElementById('c'))
})

it('should focus the initialFocus element inside the FocusTrap even if another element has autoFocus', () => {
  function Example() {
    let initialFocusRef = useRef<HTMLInputElement | null>(null)

    return (
      <FocusTrap initialFocus={initialFocusRef}>
        <input id="a" type="text" />
        <input id="b" type="text" autoFocus />
        <input id="c" type="text" ref={initialFocusRef} />
      </FocusTrap>
    )
  }
  render(<Example />)

  assertActiveElement(document.getElementById('c'))
})

it('should warn when there is no focusable element inside the FocusTrap', () => {
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())

  function Example() {
    return (
      <FocusTrap>
        <span>Nothing to see here...</span>
      </FocusTrap>
    )
  }
  render(<Example />)
  expect(spy.mock.calls[0][0]).toBe('There are no focusable elements inside the <FocusTrap />')
  spy.mockReset()
})

it(
  'should not be possible to programmatically escape the focus trap',
  suppressConsoleLogs(async () => {
    function Example() {
      return (
        <>
          <input id="a" autoFocus />

          <FocusTrap>
            <input id="b" />
            <input id="c" />
            <input id="d" />
          </FocusTrap>
        </>
      )
    }

    render(<Example />)

    let [a, b, c, d] = Array.from(document.querySelectorAll('input'))

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-c is the active element
    assertActiveElement(c)

    // Try to move focus
    a?.focus()

    // Ensure that input-c is still the active element
    assertActiveElement(c)

    // Click on an element within the FocusTrap
    await click(b)

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Try to move focus again
    a?.focus()

    // Ensure that input-b is still the active element
    assertActiveElement(b)

    // Focus on an element within the FocusTrap
    d?.focus()

    // Ensure that input-d is the active element
    assertActiveElement(d)

    // Try to move focus again
    a?.focus()

    // Ensure that input-d is still the active element
    assertActiveElement(d)
  })
)

it('should restore the previously focused element, before entering the FocusTrap, after the FocusTrap unmounts', async () => {
  function Example() {
    let [visible, setVisible] = useState(false)

    return (
      <>
        <input id="item-1" autoFocus />
        <button id="item-2" onClick={() => setVisible(true)}>
          Open modal
        </button>

        {visible && (
          <FocusTrap>
            <button id="item-3" onClick={() => setVisible(false)}>
              Close
            </button>
          </FocusTrap>
        )}
      </>
    )
  }

  render(<Example />)

  // The input should have focus by default because of the autoFocus prop
  assertActiveElement(document.getElementById('item-1'))

  // Open the modal
  await click(document.getElementById('item-2')) // This will also focus this button

  // Ensure that the first item inside the focus trap is focused
  assertActiveElement(document.getElementById('item-3'))

  // Close the modal
  await click(document.getElementById('item-3'))

  // Ensure that we restored focus correctly
  assertActiveElement(document.getElementById('item-2'))
})

it('should be possible tab to the next focusable element within the focus trap', async () => {
  render(
    <>
      <button>Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c">Item C</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  // Item A should be focused because the FocusTrap will focus the first item
  assertActiveElement(document.getElementById('item-a'))

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-b'))

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-c'))

  // Loop around!
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-a'))
})

it('should be possible shift+tab to the previous focusable element within the focus trap', async () => {
  render(
    <>
      <button>Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c">Item C</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  // Item A should be focused because the FocusTrap will focus the first item
  assertActiveElement(document.getElementById('item-a'))

  // Previous (loop around!)
  await press(shift(Keys.Tab))
  assertActiveElement(document.getElementById('item-c'))

  // Previous
  await press(shift(Keys.Tab))
  assertActiveElement(document.getElementById('item-b'))

  // Previous
  await press(shift(Keys.Tab))
  assertActiveElement(document.getElementById('item-a'))
})

it('should skip the initial "hidden" elements within the focus trap', async () => {
  render(
    <>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a" style={{ display: 'none' }}>
          Item A
        </button>
        <button id="item-b" style={{ display: 'none' }}>
          Item B
        </button>
        <button id="item-c">Item C</button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  // Item C should be focused because the FocusTrap had to skip the first 2
  assertActiveElement(document.getElementById('item-c'))
})

it('should be possible skip "hidden" elements within the focus trap', async () => {
  render(
    <>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c" style={{ display: 'none' }}>
          Item C
        </button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  // Item A should be focused because the FocusTrap will focus the first item
  assertActiveElement(document.getElementById('item-a'))

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-b'))

  // Notice that we skipped item-c

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-d'))

  // Loop around!
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-a'))
})

it('should be possible skip disabled elements within the focus trap', async () => {
  render(
    <>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c" disabled>
          Item C
        </button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  // Item A should be focused because the FocusTrap will focus the first item
  assertActiveElement(document.getElementById('item-a'))

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-b'))

  // Notice that we skipped item-c

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-d'))

  // Loop around!
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-a'))
})

it('should try to focus all focusable items (and fail)', async () => {
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
  let focusHandler = jest.fn()
  function handleFocus(e: FocusEvent) {
    let target = e.target as HTMLElement
    focusHandler(target.id)
    screen.getByText('After')?.focus()
  }

  render(
    <>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a" onFocus={handleFocus}>
          Item A
        </button>
        <button id="item-b" onFocus={handleFocus}>
          Item B
        </button>
        <button id="item-c" onFocus={handleFocus}>
          Item C
        </button>
        <button id="item-d" onFocus={handleFocus}>
          Item D
        </button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  expect(focusHandler.mock.calls).toEqual([['item-a'], ['item-b'], ['item-c'], ['item-d']])
  expect(spy).toHaveBeenCalledWith('There are no focusable elements inside the <FocusTrap />')
  spy.mockReset()
})

it('should end up at the last focusable element', async () => {
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())

  let focusHandler = jest.fn()
  function handleFocus(e: FocusEvent) {
    let target = e.target as HTMLElement
    focusHandler(target.id)
    screen.getByText('After')?.focus()
  }

  render(
    <>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a" onFocus={handleFocus}>
          Item A
        </button>
        <button id="item-b" onFocus={handleFocus}>
          Item B
        </button>
        <button id="item-c" onFocus={handleFocus}>
          Item C
        </button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  expect(focusHandler.mock.calls).toEqual([['item-a'], ['item-b'], ['item-c']])
  assertActiveElement(screen.getByText('Item D'))
  expect(spy).not.toHaveBeenCalled()
  spy.mockReset()
})
