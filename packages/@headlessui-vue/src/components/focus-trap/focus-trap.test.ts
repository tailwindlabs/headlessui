import { defineComponent, ref, nextTick, onMounted, ComponentOptionsWithoutProps } from 'vue'

import { FocusTrap } from './focus-trap'
import { assertActiveElement, getByText } from '../../test-utils/accessibility-assertions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { render } from '../../test-utils/vue-testing-library'
import { click, press, shift, Keys } from '../../test-utils/interactions'
import { html } from '../../test-utils/html'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = { FocusTrap }

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

it('should focus the first focusable element inside the FocusTrap', async () => {
  renderTemplate(
    html`
      <FocusTrap>
        <button>Trigger</button>
      </FocusTrap>
    `
  )

  await new Promise<void>(nextTick)

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

  await new Promise<void>(nextTick)

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

  await new Promise<void>(nextTick)

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

  await new Promise<void>(nextTick)

  assertActiveElement(document.getElementById('c'))
})

it('should warn when there is no focusable element inside the FocusTrap', async () => {
  expect.assertions(1)
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())

  renderTemplate(
    html`
      <FocusTrap>
        <span>Nothing to see here...</span>
      </FocusTrap>
    `
  )

  await new Promise<void>(nextTick)

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

    await new Promise<void>(nextTick)

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

  await new Promise<void>(nextTick)

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

it('should be possible to tab to the next focusable element within the focus trap', async () => {
  renderTemplate(
    html`
      <div>
        <button>Before</button>
        <FocusTrap>
          <button id="item-a">Item A</button>
          <button id="item-b">Item B</button>
          <button id="item-c">Item C</button>
        </FocusTrap>
        <button>After</button>
      </div>
    `
  )

  await new Promise<void>(nextTick)

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
  renderTemplate(
    html`
      <div>
        <button>Before</button>
        <FocusTrap>
          <button id="item-a">Item A</button>
          <button id="item-b">Item B</button>
          <button id="item-c">Item C</button>
        </FocusTrap>
        <button>After</button>
      </div>
    `
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
  renderTemplate(
    html`
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
    `
  )

  // Item C should be focused because the FocusTrap had to skip the first 2
  assertActiveElement(document.getElementById('item-c'))
})

it('should be possible skip "hidden" elements within the focus trap', async () => {
  renderTemplate(
    html`
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
    `
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
  renderTemplate(
    html`
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
    `
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

it('should try to focus all focusable items in order (and fail)', async () => {
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
  let focusHandler = jest.fn()

  renderTemplate({
    template: html`
      <div>
        <button id="before">Before</button>
        <FocusTrap>
          <button id="item-a" @focus="handleFocus">Item A</button>
          <button id="item-b" @focus="handleFocus">Item B</button>
          <button id="item-c" @focus="handleFocus">Item C</button>
          <button id="item-d" @focus="handleFocus">Item D</button>
        </FocusTrap>
        <button>After</button>
      </div>
    `,
    setup() {
      return {
        handleFocus(e: Event) {
          let target = e.target as HTMLElement
          focusHandler(target.id)
          getByText('After')?.focus()
        },
      }
    },
  })

  expect(focusHandler.mock.calls).toEqual([['item-a'], ['item-b'], ['item-c'], ['item-d']])
  expect(spy).toHaveBeenCalledWith('There are no focusable elements inside the <FocusTrap />')
  spy.mockReset()
})

it('should end up at the last focusable element', async () => {
  let spy = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
  let focusHandler = jest.fn()

  renderTemplate({
    template: html`
      <div>
        <button id="before">Before</button>
        <FocusTrap>
          <button id="item-a" @focus="handleFocus">Item A</button>
          <button id="item-b" @focus="handleFocus">Item B</button>
          <button id="item-c" @focus="handleFocus">Item C</button>
          <button id="item-d">Item D</button>
        </FocusTrap>
        <button>After</button>
      </div>
    `,
    setup() {
      return {
        handleFocus(e: Event) {
          let target = e.target as HTMLElement
          focusHandler(target.id)
          getByText('After')?.focus()
        },
      }
    },
  })

  expect(focusHandler.mock.calls).toEqual([['item-a'], ['item-b'], ['item-c']])
  assertActiveElement(getByText('Item D'))
  expect(spy).not.toHaveBeenCalled()
  spy.mockReset()
})
