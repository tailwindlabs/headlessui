import {
  defineComponent,
  ref,
  nextTick,
  h,
  ComponentOptionsWithoutProps,
  ConcreteComponent,
} from 'vue'
import { render } from '../../test-utils/vue-testing-library'

import {
  Dialog,
  DialogOverlay,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from './dialog'
import { TransitionRoot } from '../transitions/transition'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  DialogState,
  assertDialog,
  assertDialogDescription,
  assertDialogOverlay,
  assertDialogTitle,
  getDialog,
  getDialogOverlay,
  getDialogBackdrop,
  getByText,
  assertActiveElement,
  getDialogs,
  getDialogOverlays,
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
  template: html` <div :tabindex="0"></div> `,
})

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = {
    Dialog,
    DialogOverlay,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    TabSentinel,
  }

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
    ['DialogBackdrop', DialogBackdrop],
    ['DialogPanel', DialogPanel],
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

  describe('DialogBackdrop', () => {
    it(
      'should throw an error if a DialogBackdrop is used without a DialogPanel',
      suppressConsoleLogs(async () => {
        expect.hasAssertions()

        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                <DialogBackdrop />
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
          errorCaptured(err) {
            expect(err as Error).toEqual(
              new Error(
                'A <DialogBackdrop /> component is being used, but a <DialogPanel /> component is missing.'
              )
            )

            return false
          },
        })

        await click(document.getElementById('trigger'))
      })
    )

    it(
      'should not throw an error if a DialogBackdrop is used with a DialogPanel',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                <DialogBackdrop />
                <DialogPanel>
                  <TabSentinel />
                </DialogPanel>
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

        await click(document.getElementById('trigger'))
      })
    )

    it(
      'should portal the DialogBackdrop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                <DialogBackdrop />
                <DialogPanel>
                  <TabSentinel />
                <DialogPanel>
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

        await click(document.getElementById('trigger'))

        let dialog = getDialog()
        let backdrop = getDialogBackdrop()

        expect(dialog).not.toBe(null)
        dialog = dialog as HTMLElement

        expect(backdrop).not.toBe(null)
        backdrop = backdrop as HTMLElement

        // It should not be nested
        let position = dialog.compareDocumentPosition(backdrop)
        expect(position & Node.DOCUMENT_POSITION_CONTAINED_BY).not.toBe(
          Node.DOCUMENT_POSITION_CONTAINED_BY
        )

        // It should be a sibling
        expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
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

describe('Composition', () => {
  it(
    'should be possible to open the Dialog via a Transition component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { TransitionRoot },
        template: `
          <TransitionRoot show>
            <Dialog @close="() => {}">
              <DialogDescription v-slot="data">{{JSON.stringify(data)}}</DialogDescription>
              <TabSentinel />
            </Dialog>
          </Transition>
        `,
      })

      await new Promise<void>(nextTick)

      assertDialog({ state: DialogState.Visible })
      assertDialogDescription({
        state: DialogState.Visible,
        textContent: JSON.stringify({ open: true }),
      })
    })
  )

  it(
    'should be possible to close the Dialog via a Transition component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { TransitionRoot },
        template: `
          <TransitionRoot :show="false">
            <Dialog @close="() => {}">
              <DialogDescription v-slot="data">{{JSON.stringify(data)}}</DialogDescription>
              <TabSentinel />
            </Dialog>
          </Transition>
        `,
      })

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )
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

    it(
      'should be possible to close the dialog with Escape, when a field is focused',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                Contents
                <input id="name" />
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

    it(
      'should not be possible to close the dialog with Escape, when a field is focused but cancels the event',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen">
                Contents
                <input
                  id="name"
                  @keydown="cancel"
                />
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
              cancel(event: KeyboardEvent) {
                event.preventDefault()
                event.stopPropagation()
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

        // Try to close the dialog
        await press(Keys.Escape)

        // Verify it is still open
        assertDialog({ state: DialogState.Visible })
      })
    )
  })

  describe('`Tab` key', () => {
    it(
      'should be possible to tab around when using the initialFocus ref',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen" :initialFocus="initialFocusRef">
                Contents
                <TabSentinel id="a" />
                <input type="text" id="b" ref="initialFocusRef" />
              </Dialog>
            </div>
          `,
          setup() {
            let isOpen = ref(false)
            let initialFocusRef = ref(null)
            return {
              isOpen,
              initialFocusRef,
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

        // Verify that the input field is focused
        assertActiveElement(document.getElementById('b'))

        // Verify that we can tab around
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))

        // Verify that we can tab around
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('b'))

        // Verify that we can tab around
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))
      })
    )

    it(
      'should be possible to tab around when using the initialFocus ref on a component',
      suppressConsoleLogs(async () => {
        let CustomComponent = defineComponent({
          name: 'CustomComponent',
          setup() {
            return () => h('input')
          },
        })

        renderTemplate({
          components: {
            CustomComponent,
          },
          template: `
            <div>
              <button id="trigger" @click="toggleOpen">
                Trigger
              </button>
              <Dialog :open="isOpen" @close="setIsOpen" :initialFocus="initialFocusRef">
                Contents
                <TabSentinel id="a" />
                <CustomComponent type="text" id="b" ref="initialFocusRef" />
              </Dialog>
            </div>
          `,
          setup() {
            let isOpen = ref(false)
            let initialFocusRef = ref(null)
            return {
              isOpen,
              initialFocusRef,
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

        // Verify that the input field is focused
        assertActiveElement(document.getElementById('b'))

        // Verify that we can tab around
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))

        // Verify that we can tab around
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('b'))

        // Verify that we can tab around
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))
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
    'should not close the Dialog when clicking on contents of the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <div>
            <button id="trigger" @click="toggleOpen">
              Trigger
            </button>
            <Dialog :open="isOpen" @close="setIsOpen">
              <DialogOverlay>
                <button>hi</button>
              </DialogOverlay>
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

      // Click on an element inside the overlay
      await click(getByText('hi'))

      // Verify it is still open
      assertDialog({ state: DialogState.Visible })
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

  it(
    'should stop propagating click events when clicking on the Dialog.Overlay',
    suppressConsoleLogs(async () => {
      let wrapperFn = jest.fn()
      renderTemplate({
        template: `
          <div @click="wrapperFn">
            <Dialog v-if="true" :open="isOpen" @close="setIsOpen">
              Contents
              <DialogOverlay />
              <TabSentinel />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(true)
          return {
            isOpen,
            wrapperFn,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the Dialog.Overlay to close the Dialog
      await click(getDialogOverlay())

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)
    })
  )

  it(
    'should be possible to submit a form inside a Dialog',
    suppressConsoleLogs(async () => {
      let submitFn = jest.fn()
      renderTemplate({
        template: `
          <Dialog v-if="true" :open="isOpen" @close="setIsOpen">
            <form @submit.prevent="submitFn">
              <input type="hidden" value="abc" />
              <button type="submit">Submit</button>
            </form>
            <TabSentinel />
          </Dialog>
        `,
        setup() {
          let isOpen = ref(true)
          return {
            isOpen,
            submitFn,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Submit the form
      await click(getByText('Submit'))

      // Verify that the submitFn function has been called
      expect(submitFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should stop propagating click events when clicking on an element inside the Dialog',
    suppressConsoleLogs(async () => {
      let wrapperFn = jest.fn()
      renderTemplate({
        template: `
          <div @click="wrapperFn">
            <Dialog v-if="true" :open="isOpen" @close="setIsOpen">
              Contents
              <button @click="setIsOpen(false)">Inside</button>
              <TabSentinel />
            </Dialog>
          </div>
        `,
        setup() {
          let isOpen = ref(true)
          return {
            isOpen,
            wrapperFn,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the button inside the the Dialog
      await click(getByText('Inside'))

      // Verify it is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)
    })
  )

  it(
    'should should be possible to click on removed elements without closing the Dialog',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <Dialog :open="isOpen" @close="setIsOpen">
            <div ref="wrapper">
              Contents
              <!-- Remove this button before the Dialog's mousedown listener fires: -->
              <button @mousedown="wrapper.remove()">Inside</button>
              <TabSentinel />
            </div>
          </Dialog>
        `,
        setup() {
          let isOpen = ref(true)
          let wrapper = ref<HTMLDivElement | null>(null)
          return {
            isOpen,
            wrapper,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button inside the the Dialog
      await click(getByText('Inside'))

      // Verify it is still open
      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should be possible to click on elements created by third party libraries',
    suppressConsoleLogs(async () => {
      let fn = jest.fn()

      let ThirdPartyLibrary = defineComponent({
        template: html`
          <teleport to="body">
            <button data-lib @click="fn">3rd party button</button>
          </teleport>
        `,
        setup: () => ({ fn }),
      })

      renderTemplate({
        components: { ThirdPartyLibrary },
        template: `
          <div>
            <span>Main app</span>
            <Dialog :open="isOpen" @close="setIsOpen">
              <div>
                Contents
                <TabSentinel />
              </div>
            </Dialog>
            <ThirdPartyLibrary />
          </div>
        `,
        setup() {
          let isOpen = ref(true)
          return {
            isOpen,
            setIsOpen(value: boolean) {
              isOpen.value = value
            },
          }
        },
      })

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button inside the 3rd party library
      await click(document.querySelector('[data-lib]'))

      // Verify we clicked on the 3rd party button
      expect(fn).toHaveBeenCalledTimes(1)

      // Verify the dialog is still open
      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should close the Dialog if we click outside the DialogPanel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <div>
            <button id="trigger" @click="toggleOpen">
              Trigger
            </button>
            <Dialog :open="isOpen" @close="setIsOpen">
              <DialogBackdrop />
              <DialogPanel>
                <TabSentinel />
              </DialogPanel>
              <button id="outside">Outside, technically</button>
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

      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      await click(document.getElementById('outside'))

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should not close the Dialog if we click inside the DialogPanel',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <div>
            <button id="trigger" @click="toggleOpen">
              Trigger
            </button>
            <Dialog :open="isOpen" @close="setIsOpen">
              <DialogBackdrop />
              <DialogPanel>
                <button id="inside">Inside</button>
                <TabSentinel />
              </DialogPanel>
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

      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      await click(document.getElementById('inside'))

      assertDialog({ state: DialogState.Visible })
    })
  )
})

describe('Nesting', () => {
  let Nested: ConcreteComponent = defineComponent({
    components: { Dialog, DialogOverlay },
    emits: ['close'],
    props: ['level'],
    setup(props, { emit }) {
      let showChild = ref(false)
      function onClose() {
        emit('close', false)
      }

      return () => {
        let level = props.level ?? 1
        return h(Dialog, { open: true, onClose }, () => [
          h(DialogOverlay),
          h('div', [
            h('p', `Level: ${level}`),
            h('button', { onClick: () => (showChild.value = true) }, `Open ${level + 1} a`),
            h('button', { onClick: () => (showChild.value = true) }, `Open ${level + 1} b`),
            h('button', { onClick: () => (showChild.value = true) }, `Open ${level + 1} c`),
          ]),
          showChild.value &&
            h(Nested, {
              onClose: () => (showChild.value = false),
              level: level + 1,
            }),
        ])
      }
    },
  })

  it.each`
    strategy                            | action
    ${'with `Escape`'}                  | ${() => press(Keys.Escape)}
    ${'with `Outside Click`'}           | ${() => click(document.body)}
    ${'with `Click on Dialog.Overlay`'} | ${() => click(getDialogOverlays().pop()!)}
  `(
    'should be possible to open nested Dialog components and close them $strategy',
    async ({ action }) => {
      renderTemplate({
        components: { Nested },
        template: `
          <button @click="isOpen = true">Open 1</button>
          <Nested v-if="isOpen" @close="isOpen = false" />
        `,
        setup() {
          let isOpen = ref(false)
          return { isOpen }
        },
      })

      // Verify we have no open dialogs
      expect(getDialogs()).toHaveLength(0)

      // Open Dialog 1
      await click(getByText('Open 1'))

      // Verify that we have 1 open dialog
      expect(getDialogs()).toHaveLength(1)

      // Verify that the `Open 2 a` has focus
      assertActiveElement(getByText('Open 2 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 a'))

      // Open Dialog 2 via the second button
      await click(getByText('Open 2 b'))

      // Verify that we have 2 open dialogs
      expect(getDialogs()).toHaveLength(2)

      // Verify that the `Open 3 a` has focus
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 a'))

      // Close the top most Dialog
      await action()

      // Verify that we have 1 open dialog
      expect(getDialogs()).toHaveLength(1)

      // Verify that the `Open 2 b` button got focused again
      assertActiveElement(getByText('Open 2 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 b'))

      // Open Dialog 2 via button b
      await click(getByText('Open 2 b'))

      // Verify that the `Open 3 a` has focus
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we have 2 open dialogs
      expect(getDialogs()).toHaveLength(2)

      // Open Dialog 3 via button c
      await click(getByText('Open 3 c'))

      // Verify that the `Open 4 a` has focus
      assertActiveElement(getByText('Open 4 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 4 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 4 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 4 a'))

      // Verify that we have 3 open dialogs
      expect(getDialogs()).toHaveLength(3)

      // Close the top most Dialog
      await action()

      // Verify that the `Open 3 c` button got focused again
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 3 c'))

      // Verify that we have 2 open dialogs
      expect(getDialogs()).toHaveLength(2)

      // Close the top most Dialog
      await action()

      // Verify that we have 1 open dialog
      expect(getDialogs()).toHaveLength(1)

      // Verify that the `Open 2 b` button got focused again
      assertActiveElement(getByText('Open 2 b'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 c'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 a'))

      // Verify that we can tab around
      await press(Keys.Tab)
      assertActiveElement(getByText('Open 2 b'))

      // Close the top most Dialog
      await action()

      // Verify that we have 0 open dialogs
      expect(getDialogs()).toHaveLength(0)

      // Verify that the `Open 1` button got focused again
      assertActiveElement(getByText('Open 1'))
    }
  )
})
