import { onMounted, ref } from 'vue'
import { assertActiveElement, getByText } from '../../test-utils/accessibility-assertions'
import { html } from '../../test-utils/html'
import { Keys, click, press, shift } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { createRenderTemplate } from '../../test-utils/vue-testing-library'
import { FocusTrap } from './focus-trap'

jest.mock('../../hooks/use-id')

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

const renderTemplate = createRenderTemplate({
  FocusTrap,
})

it('should focus the first focusable element inside the FocusTrap', async () => {
  renderTemplate(html`
    <FocusTrap>
      <button>Trigger</button>
    </FocusTrap>
  `)

  await nextFrame()

  assertActiveElement(getByText('Trigger'))
})

it('should focus the autoFocus element inside the FocusTrap if that exists', async () => {
  renderTemplate({
    template: html`
      <FocusTrap>
        <input id="a" type="text" />
        <input id="b" type="text" ref="autofocus" />
        <input id="c" type="text" />
      </FocusTrap>
    `,
    setup() {
      let autofocus = ref<HTMLElement | null>(null)
      onMounted(() => {
        autofocus.value?.focus?.()
      })
      return { autofocus }
    },
  })

  await nextFrame()

  assertActiveElement(document.getElementById('b'))
})

it('should focus the initialFocus element inside the FocusTrap if that exists', async () => {
  renderTemplate({
    template: html`
      <FocusTrap :initialFocus="initialFocusRef">
        <input id="a" type="text" />
        <input id="b" type="text" />
        <input id="c" type="text" ref="initialFocusRef" />
      </FocusTrap>
    `,
    setup() {
      let initialFocusRef = ref(null)
      return { initialFocusRef }
    },
  })

  await nextFrame()

  assertActiveElement(document.getElementById('c'))
})

it('should focus the initialFocus element inside the FocusTrap even if another element has autoFocus', async () => {
  renderTemplate({
    template: html`
      <FocusTrap :initialFocus="initialFocusRef">
        <input id="a" type="text" />
        <input id="b" type="text" autofocus />
        <input id="c" type="text" ref="initialFocusRef" />
      </FocusTrap>
    `,
    setup() {
      let initialFocusRef = ref(null)
      return { initialFocusRef }
    },
  })

  await nextFrame()

  assertActiveElement(document.getElementById('c'))
})

it('should warn when there is no focusable element inside the FocusTrap', async () => {
  expect.assertions(1)
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())

  renderTemplate(html`
    <FocusTrap>
      <span>Nothing to see here...</span>
    </FocusTrap>
  `)

  await nextFrame()

  expect(spy.mock.calls[0][0]).toBe('There are no focusable elements inside the <FocusTrap />')
  spy.mockReset()
})

it(
  'should not be possible to programmatically escape the focus trap',
  suppressConsoleLogs(async () => {
    renderTemplate({
      template: html`
        <div>
          <input id="a" autofocus />

          <FocusTrap>
            <input id="b" />
            <input id="c" />
            <input id="d" />
          </FocusTrap>
        </div>
      `,
    })

    await nextFrame()

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
  renderTemplate({
    template: html`
      <div>
        <input id="item-1" ref="autoFocusRef" />
        <button id="item-2" @click="visible = true">Open modal</button>

        <FocusTrap v-if="visible">
          <button id="item-3" @click="visible = false">Close</button>
        </FocusTrap>
      </div>
    `,
    setup() {
      let visible = ref(false)
      let autoFocusRef = ref<HTMLElement | null>(null)
      onMounted(() => {
        autoFocusRef.value?.focus()
      })
      return { visible, autoFocusRef }
    },
  })

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
  renderTemplate({
    template: html`
      <div>
        <button>Before</button>
        <FocusTrap>
          <button id="item-a">Item A</button>
        </FocusTrap>
        <button>After</button>
      </div>
    `,
  })

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
  renderTemplate({
    template: html`
      <div>
        <button>Before</button>
        <FocusTrap>
          <button id="item-a">Item A</button>
        </FocusTrap>
        <button>After</button>
      </div>
    `,
  })

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

it('should be possible to tab to the next focusable element within the focus trap', async () => {
  renderTemplate(html`
    <div>
      <button>Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c">Item C</button>
      </FocusTrap>
      <button>After</button>
    </div>
  `)

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

it('should be possible to shift+tab to the previous focusable element within the focus trap', async () => {
  renderTemplate(html`
    <div>
      <button>Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c">Item C</button>
      </FocusTrap>
      <button>After</button>
    </div>
  `)

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
  renderTemplate(html`
    <div>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a" style="display:none">Item A</button>
        <button id="item-b" style="display:none">Item B</button>
        <button id="item-c">Item C</button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </div>
  `)

  await nextFrame()

  // Item C should be focused because the FocusTrap had to skip the first 2
  assertActiveElement(document.getElementById('item-c'))
})

it('should be possible skip "hidden" elements within the focus trap', async () => {
  renderTemplate(html`
    <div>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c" style="display:none">Item C</button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </div>
  `)

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
  renderTemplate(html`
    <div>
      <button id="before">Before</button>
      <FocusTrap>
        <button id="item-a">Item A</button>
        <button id="item-b">Item B</button>
        <button id="item-c" disabled>Item C</button>
        <button id="item-d">Item D</button>
      </FocusTrap>
      <button>After</button>
    </div>
  `)

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

it(
  'should not be possible to escape the FocusTrap due to strange tabIndex usage',
  suppressConsoleLogs(async () => {
    renderTemplate(html`
      <div>
        <div :tabindex="-1">
          <input :tabindex="2" id="a" />
          <input :tabindex="1" id="b" />
        </div>

        <FocusTrap>
          <input :tabindex="1" id="c" />
          <input id="d" />
        </FocusTrap>
      </div>
    `)

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
