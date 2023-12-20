import { render, screen } from '@testing-library/react'
import React, { useRef, useState } from 'react'
import { assertActiveElement } from '../../test-utils/accessibility-assertions'
import { Keys, click, focus, press, shift } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { FocusTrap } from './focus-trap'

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

it('should focus the first focusable element inside the FocusTrap', async () => {
  render(
    <FocusTrap>
      <button>Trigger</button>
    </FocusTrap>
  )

  await nextFrame()

  assertActiveElement(screen.getByText('Trigger'))
})

it('should focus the autoFocus element inside the FocusTrap if that exists', async () => {
  render(
    <FocusTrap>
      <input id="a" type="text" />
      <input id="b" type="text" autoFocus />
      <input id="c" type="text" />
    </FocusTrap>
  )

  await nextFrame()

  assertActiveElement(document.getElementById('b'))
})

it('should focus the initialFocus element inside the FocusTrap if that exists', async () => {
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

  await nextFrame()

  assertActiveElement(document.getElementById('c'))
})

it('should focus the initialFocus element inside the FocusTrap even if another element has autoFocus', async () => {
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

  await nextFrame()

  assertActiveElement(document.getElementById('c'))
})

it('should warn when there is no focusable element inside the FocusTrap', async () => {
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())

  function Example() {
    return (
      <FocusTrap>
        <span>Nothing to see here...</span>
      </FocusTrap>
    )
  }

  render(<Example />)

  await nextFrame()

  expect(spy.mock.calls[0][0]).toBe('There are no focusable elements inside the <FocusTrap />')
  spy.mockReset()
})

// TODO: Figure out once 2.0 alpha is released
it.skip(
  'should not be possible to programmatically escape the focus trap (if there is only 1 focusable element)',
  suppressConsoleLogs(async () => {
    function Example() {
      return (
        <>
          <input id="a" autoFocus />

          <FocusTrap>
            <input id="b" />
          </FocusTrap>
        </>
      )
    }

    render(<Example />)

    await nextFrame()

    let [a, b] = Array.from(document.querySelectorAll('input'))

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-b is still the active element
    assertActiveElement(b)

    // Try to move focus
    await focus(a)

    // Ensure that input-b is still the active element
    assertActiveElement(b)

    // Click on an element within the FocusTrap
    await click(b)

    // Ensure that input-b is the active element
    assertActiveElement(b)
  })
)

// TODO: Figure out once 2.0 alpha is released
it.skip(
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

    await nextFrame()

    let [a, b, c, d] = Array.from(document.querySelectorAll('input'))

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-c is the active element
    assertActiveElement(c)

    // Try to move focus
    await focus(a)

    // Ensure that input-c is still the active element
    assertActiveElement(c)

    // Click on an element within the FocusTrap
    await click(b)

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Try to move focus again
    await focus(a)

    // Ensure that input-b is still the active element
    assertActiveElement(b)

    // Focus on an element within the FocusTrap
    await focus(d)

    // Ensure that input-d is the active element
    assertActiveElement(d)

    // Try to move focus again
    await focus(a)

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

  await nextFrame()

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

it('should stay in the FocusTrap when using `tab`, if there is only 1 focusable element', async () => {
  render(
    <>
      <button>Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  await nextFrame()

  // Item A should be focused because the FocusTrap will focus the first item
  assertActiveElement(document.getElementById('item-a'))

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-a'))

  // Next
  await press(Keys.Tab)
  assertActiveElement(document.getElementById('item-a'))
})

it('should stay in the FocusTrap when using `shift+tab`, if there is only 1 focusable element', async () => {
  render(
    <>
      <button>Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
      </FocusTrap>
      <button>After</button>
    </>
  )

  await nextFrame()

  // Item A should be focused because the FocusTrap will focus the first item
  assertActiveElement(document.getElementById('item-a'))

  // Previous (loop around!)
  await press(shift(Keys.Tab))
  assertActiveElement(document.getElementById('item-a'))

  // Previous
  await press(shift(Keys.Tab))
  assertActiveElement(document.getElementById('item-a'))
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

  await nextFrame()

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

  await nextFrame()

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

  await nextFrame()

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

  await nextFrame()

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

  await nextFrame()

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

// TODO: Figure out once 2.0 alpha is released
it.skip(
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

    await nextFrame()

    let [a, b, c, d] = Array.from(document.querySelectorAll('input'))

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-c is the active element
    assertActiveElement(c)

    // Try to move focus
    await focus(a)

    // Ensure that input-c is still the active element
    assertActiveElement(c)

    // Click on an element within the FocusTrap
    await click(b)

    // Ensure that input-b is the active element
    assertActiveElement(b)

    // Try to move focus again
    await focus(a)

    // Ensure that input-b is still the active element
    assertActiveElement(b)

    // Focus on an element within the FocusTrap
    await focus(d)

    // Ensure that input-d is the active element
    assertActiveElement(d)

    // Try to move focus again
    await focus(a)

    // Ensure that input-d is still the active element
    assertActiveElement(d)
  })
)

it(
  'should not be possible to escape the FocusTrap due to strange tabIndex usage',
  suppressConsoleLogs(async () => {
    function Example() {
      return (
        <>
          <div tabIndex={-1}>
            <input tabIndex={2} id="a" />
            <input tabIndex={1} id="b" />
          </div>

          <FocusTrap>
            <input tabIndex={1} id="c" />
            <input id="d" />
          </FocusTrap>
        </>
      )
    }

    render(<Example />)

    await nextFrame()

    let [_a, _b, c, d] = Array.from(document.querySelectorAll('input'))

    // First item in the FocusTrap should be the active one
    assertActiveElement(c)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-d is the active element
    assertActiveElement(d)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-c is the active element
    assertActiveElement(c)

    // Tab to the next item
    await press(Keys.Tab)

    // Ensure that input-d is the active element
    assertActiveElement(d)

    // Let's go the other way

    // Tab to the previous item
    await press(shift(Keys.Tab))

    // Ensure that input-c is the active element
    assertActiveElement(c)

    // Tab to the previous item
    await press(shift(Keys.Tab))

    // Ensure that input-d is the active element
    assertActiveElement(d)

    // Tab to the previous item
    await press(shift(Keys.Tab))

    // Ensure that input-c is the active element
    assertActiveElement(c)
  })
)
