import React, { useState } from 'react'
import { render } from '@testing-library/react'

import { FocusTrap } from './focus-trap'
import { assertActiveElement } from '../../test-utils/accessibility-assertions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { click, press, shift, Keys } from '../../test-utils/interactions'

it('should focus the first focusable element inside the FocusTrap', () => {
  let { getByText } = render(
    <FocusTrap>
      <button>Trigger</button>
    </FocusTrap>
  )

  assertActiveElement(getByText('Trigger'))
})

it(
  'should error when there is no focusable element inside the FocusTrap',
  suppressConsoleLogs(() => {
    expect(() => {
      render(
        <FocusTrap>
          <span>Nothing to see here...</span>
        </FocusTrap>
      )
    }).toThrowErrorMatchingInlineSnapshot(
      `"There are no focusable elements inside the <FocusTrap />"`
    )
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
  await click(document.getElementById('item-2'))

  // Ensure that the first item inside the focus trap is focused
  assertActiveElement(document.getElementById('item-3'))

  // Close the modal
  await click(document.getElementById('item-3'))

  // Ensure that we restored focus correctly
  assertActiveElement(document.getElementById('item-1'))
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
