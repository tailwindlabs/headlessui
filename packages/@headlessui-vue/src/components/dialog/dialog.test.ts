import { defineComponent, ref, nextTick } from 'vue'
import { render } from '../../test-utils/vue-testing-library'

import { Dialog, DialogOverlay, DialogTitle, DialogDescription } from './dialog'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  DialogState,
  assertDialog,
  assertDialogDescription,
  assertDialogOverlay,
  assertDialogTitle,
  getDialog,
  getDialogOverlay,
  getByText,
  assertActiveElement,
} from '../../test-utils/accessibility-assertions'
import { click, press, Keys } from '../../test-utils/interactions'
import { html } from '../../test-utils/html'

// @ts-expect-error
global.IntersectionObserver = class FakeIntersectionObserver {
  observe() {}
  disconnect() {}
}

afterAll(() => jest.restoreAllMocks())

let TabSentinel = defineComponent({
  name: 'TabSentinel',
  template: html`
    <div :tabindex="0"></div>
  `,
})

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = { Dialog, DialogOverlay, DialogTitle, DialogDescription, TabSentinel }

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
    ['DialogOverlay', DialogOverlay],
    ['DialogTitle', DialogTitle],
  ])(
    'should error when we are using a <%s /> without a parent <Dialog />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Dialog /> component.`
      )
      expect.hasAssertions()
    })
  )

  it(
    'should be possible to render a Dialog without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate(
        `
          <Dialog :open="false" @close="() => {}">
            <button>Trigger</button>
            <DialogOverlay />
            <DialogTitle />
            <p>Contents</p>
            <DialogDescription />
          </Dialog>
        `
      )

      assertDialog({
        state: DialogState.InvisibleUnmounted,
        attributes: { id: 'headlessui-dialog-1' },
      })
    })
  )
})

describe('Rendering', () => {
  describe('Dialog', () => {
    it(
      'should complain when an `open` prop is missing',
      suppressConsoleLogs(async () => {
        expect(() =>
          renderTemplate(
            `
              <Dialog as="div" @close="() => {}" />
            `
          )
        ).toThrowErrorMatchingInlineSnapshot(
          `"You forgot to provide an \`open\` prop to the \`Dialog\`."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `open` prop is not a boolean',
      suppressConsoleLogs(async () => {
        expect(() =>
          renderTemplate(
            `
              <Dialog as="div" :open="null" @close="() => {}" />
            `
          )
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: null"`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should be possible to render a Dialog using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="setIsOpen(true)">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen" v-slot="data">
                <pre>{{JSON.stringify(data)}}</pre>
                <TabSentinel />
              </Dialog>
            </div>
          `,
          setup() {
            let isOpen = ref(false)
            return {
              isOpen,
              setIsOpen(value: boolean) {
                isOpen.value = value
              },
            }
          },
        })

        assertDialog({ state: DialogState.InvisibleUnmounted })

        await click(document.getElementById('trigger'))

        assertDialog({ state: DialogState.Visible, textContent: JSON.stringify({ open: true }) })
      })
    )

    it('should be possible to pass props to the Dialog itself', async () => {
      renderTemplate({
        template: `
          <div>
            <button id="trigger" @click="setIsOpen(true)">
              Trigger
            </button>
            <Dialog :open="isOpen" @close="setIsOpen" class="relative bg-blue-500">
              <TabSentinel />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(false)
          return {
            isOpen,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      assertDialog({ state: DialogState.InvisibleUnmounted })

      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible, attributes: { class: 'relative bg-blue-500' } })
    })

    it('should be possible to always render the Dialog if we provide it a `static` prop (and enable focus trapping based on `open`)', async () => {
      let focusCounter = jest.fn()
      renderTemplate({
        template: `
          <div>
            <button>Trigger</button>
            <Dialog :open="true" @close="() => {}" static>
              <p>Contents</p>
              <TabSentinel @focus="focusCounter" />
            </Dialog>
          </div>
        `,
        setup() {
          return { focusCounter }
        },
      })

      await new Promise<void>(nextTick)

      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(1)
    })

    it('should be possible to always render the Dialog if we provide it a `static` prop (and disable focus trapping based on `open`)', async () => {
      let focusCounter = jest.fn()
      renderTemplate({
        template: `
          <div>
            <button>Trigger</button>
            <Dialog :open="false" @close="() => {}" static>
              <p>Contents</p>
              <TabSentinel @focus="focusCounter" />
            </Dialog>
          </div>
        `,
        setup() {
          return { focusCounter }
        },
      })

      await new Promise<void>(nextTick)

      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(0)
    })

    it('should be possible to use a different render strategy for the Dialog', async () => {
      let focusCounter = jest.fn()
      renderTemplate({
        template: `
          <div>
            <button id="trigger" @click="isOpen = !isOpen">Trigger</button>
            <Dialog :open="isOpen" @close="setIsOpen" :unmount="false">
              <TabSentinel @focus="focusCounter" />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(false)
          return {
            focusCounter,
            isOpen,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      assertDialog({ state: DialogState.InvisibleHidden })
      expect(focusCounter).toHaveBeenCalledTimes(0)

      // Let's open the Dialog, to see if it is not hidden anymore
      await click(document.getElementById('trigger'))
      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialog({ state: DialogState.Visible })

      // Let's close the Dialog
      await press(Keys.Escape)

      expect(focusCounter).toHaveBeenCalledTimes(1)

      assertDialog({ state: DialogState.InvisibleHidden })
    })

    it(
      'should add a scroll lock to the html tag',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>

              <Dialog :open="isOpen" @close="setIsOpen">
                <input id="a" type="text" />
                <input id="b" type="text" />
                <input id="c" type="text" />
              </Dialog>
            </div>
          `,
          setup() {
            let isOpen = ref(false)
            return {
              isOpen,
              setIsOpen(value: boolean) {
                isOpen.value = value
              },
              toggleOpen() {
                isOpen.value = !isOpen.value
              },
            }
          },
        })

        // No overflow yet
        expect(document.documentElement.style.overflow).toBe('')

        let btn = document.getElementById('trigger')

        // Open the dialog
        await click(btn)

        // Expect overflow
        expect(document.documentElement.style.overflow).toBe('hidden')
      })
    )
  })

  describe('DialogOverlay', () => {
    it(
      'should be possible to render DialogOverlay using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                <DialogOverlay v-slot="data">{{JSON.stringify(data)}}</DialogOverlay>
                <TabSentinel />
              </Dialog>
            </div>
          `,
          setup() {
            let isOpen = ref(false)
            return {
              isOpen,
              setIsOpen(value: boolean) {
                isOpen.value = value
              },
              toggleOpen() {
                isOpen.value = !isOpen.value
              },
            }
          },
        })

        assertDialogOverlay({
          state: DialogState.InvisibleUnmounted,
          attributes: { id: 'headlessui-dialog-overlay-2' },
        })

        await click(document.getElementById('trigger'))

        assertDialogOverlay({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-overlay-2' },
          textContent: JSON.stringify({ open: true }),
        })
      })
    )
  })

  describe('DialogTitle', () => {
    it(
      'should be possible to render DialogTitle using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          `
            <Dialog :open="true" @close="() => {}">
              <DialogTitle v-slot="data">{{JSON.stringify(data)}}</DialogTitle>
              <TabSentinel />
            </Dialog>
          `
        )

        await new Promise<void>(nextTick)

        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })
        assertDialogTitle({
          state: DialogState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )
  })

  describe('DialogDescription', () => {
    it(
      'should be possible to render DialogDescription using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate(
          `
            <Dialog :open="true" @close="() => {}">
              <DialogDescription v-slot="data">{{JSON.stringify(data)}}</DialogDescription>
              <TabSentinel />
            </Dialog>
          `
        )

        await new Promise<void>(nextTick)

        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })
        assertDialogDescription({
          state: DialogState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )
  })
})

describe('Keyboard interactions', () => {
  describe('`Escape` key', () => {
    it(
      'should be possible to close the dialog with Escape',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                Contents
                <TabSentinel />
              </Dialog>
            </div>
          `,
          setup() {
            let isOpen = ref(false)
            return {
              isOpen,
              setIsOpen(value: boolean) {
                isOpen.value = value
              },
              toggleOpen() {
                isOpen.value = !isOpen.value
              },
            }
          },
        })

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({
          state: DialogState.Visible,
          attributes: { id: 'headlessui-dialog-1' },
        })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialog({ state: DialogState.InvisibleUnmounted })
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to close a Dialog using a click on the DialogOverlay',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <div>
            <button id="trigger" @click="toggleOpen">
              Trigger
            </button>
            <Dialog :open="isOpen" @close="setIsOpen">
              <DialogOverlay />
              Contents
              <TabSentinel />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(false)
          return {
            isOpen,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
            toggleOpen() {
              isOpen.value = !isOpen.value
            },
          }
        },
      })

      // Open dialog
      await click(document.getElementById('trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click to close
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to close the dialog, and re-focus the button when we click outside on the body element',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <div>
            <button @click="isOpen = !isOpen">Trigger</button>
            <Dialog :open="isOpen" @close="setIsOpen">
              Contents
              <TabSentinel />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(false)
          return {
            isOpen,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Open dialog
      await click(getByText('Trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the body to close
      await click(document.body)

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('Trigger'))
    })
  )

  it(
    'should be possible to close the dialog, and keep focus on the focusable element',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <div>
            <button>Hello</button>
            <button @click="isOpen = !isOpen">Trigger</button>
            <Dialog v-if="true" :open="isOpen" @close="setIsOpen">
              Contents
              <TabSentinel />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(false)
          return {
            isOpen,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Open dialog
      await click(getByText('Trigger'))

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button to close (outside click)
      await click(getByText('Hello'))

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify the button is focused
      assertActiveElement(getByText('Hello'))
    })
  )
})
