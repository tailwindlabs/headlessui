import { render } from '@testing-library/react'
import React, { Fragment, createElement, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DialogState,
  PopoverState,
  assertActiveElement,
  assertDialog,
  assertDialogDescription,
  assertDialogTitle,
  assertPopoverPanel,
  getByText,
  getDialog,
  getDialogs,
  getPopoverButton,
} from '../../test-utils/accessibility-assertions'
import { Keys, click, focus, mouseDrag, press, shift } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import type { PropsOf } from '../../types'
import { Popover } from '../popover/popover'
import { Transition } from '../transition/transition'
import { Dialog } from './dialog'

afterAll(() => jest.restoreAllMocks())

function nextFrame() {
  return frames(1)
}

async function frames(count: number) {
  for (let n = 0; n <= count; n++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
}

function TabSentinel(props: PropsOf<'button'>) {
  return <button {...props} />
}

describe('Safe guards', () => {
  it.each([
    ['Dialog.Title', Dialog.Title],
    ['Dialog.Panel', Dialog.Panel],
  ])(
    'should error when we are using a <%s /> without a parent <Dialog />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrow(
        `<${name} /> is missing a parent <Dialog /> component.`
      )
      expect.hasAssertions()
    })
  )

  it(
    'should be possible to render a Dialog without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Dialog autoFocus={false} open={false} onClose={console.log}>
          <button>Trigger</button>
          <Dialog.Title />
          <p>Contents</p>
          <Dialog.Description />
        </Dialog>
      )

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Dialog', () => {
    it(
      'should complain when the `open` and `onClose` prop are missing',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog autoFocus={false} as="div" />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You have to provide an \`open\` and an \`onClose\` prop to the \`Dialog\` component."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should be able to explicitly choose role=dialog',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(true)}>
                Trigger
              </button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen} role="dialog">
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        await click(document.getElementById('trigger'))

        await nextFrame()

        assertDialog({ state: DialogState.Visible, attributes: { role: 'dialog' } })
      })
    )

    it(
      'should be able to explicitly choose role=alertdialog',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(true)}>
                Trigger
              </button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen} role="alertdialog">
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        await click(document.getElementById('trigger'))

        await nextFrame()

        assertDialog({ state: DialogState.Visible, attributes: { role: 'alertdialog' } })
      })
    )

    it(
      'should fall back to role=dialog for an invalid role',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(true)}>
                Trigger
              </button>
              <Dialog
                open={isOpen}
                onClose={setIsOpen}
                // @ts-expect-error: We explicitly type role to only accept valid options — but we still want to verify runtime behavior
                role="foobar"
              >
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        await click(document.getElementById('trigger'))

        await nextFrame()

        assertDialog({ state: DialogState.Visible, attributes: { role: 'dialog' } })
      }, 'warn')
    )

    it(
      'should complain when an `open` prop is provided without an `onClose` prop',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog autoFocus={false} as="div" open={false} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`open\` prop to the \`Dialog\`, but forgot an \`onClose\` prop."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `onClose` prop is provided without an `open` prop',
      suppressConsoleLogs(async () => {
        expect(() =>
          render(<Dialog autoFocus={false} as="div" onClose={() => {}} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`onClose\` prop to the \`Dialog\`, but forgot an \`open\` prop."`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `open` prop is not a boolean',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog autoFocus={false} as="div" open={null} onClose={console.log} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: null"`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should complain when an `onClose` prop is not a function',
      suppressConsoleLogs(async () => {
        expect(() =>
          // @ts-expect-error
          render(<Dialog autoFocus={false} as="div" open={false} onClose={null} />)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: null"`
        )
        expect.hasAssertions()
      })
    )

    it(
      'should be possible to render a Dialog using a render prop',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen(true)}>
                Trigger
              </button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                {(data) => (
                  <>
                    <pre>{JSON.stringify(data)}</pre>
                    <TabSentinel />
                  </>
                )}
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        await click(document.getElementById('trigger'))

        assertDialog({ state: DialogState.Visible, textContent: JSON.stringify({ open: true }) })
      })
    )

    it('should be possible to always render the Dialog if we provide it a `static` prop (and enable focus trapping based on `open`)', async () => {
      let focusCounter = jest.fn()
      render(
        <>
          <button>Trigger</button>
          <Dialog autoFocus={false} open={true} onClose={console.log} static>
            <p>Contents</p>
            <TabSentinel onFocus={focusCounter} />
          </Dialog>
        </>
      )

      await nextFrame()

      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(1)
    })

    it('should be possible to always render the Dialog if we provide it a `static` prop (and disable focus trapping based on `open`)', () => {
      let focusCounter = jest.fn()
      render(
        <>
          <button>Trigger</button>
          <Dialog autoFocus={false} open={false} onClose={console.log} static>
            <p>Contents</p>
            <TabSentinel onFocus={focusCounter} />
          </Dialog>
        </>
      )

      // Let's verify that the Dialog is already there
      expect(getDialog()).not.toBe(null)
      expect(focusCounter).toHaveBeenCalledTimes(0)
    })

    it('should be possible to use a different render strategy for the Dialog', async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)

        return (
          <>
            <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
              Trigger
            </button>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen} unmount={false}>
              <input />
            </Dialog>
          </>
        )
      }

      render(<Example />)

      await nextFrame()

      assertDialog({ state: DialogState.InvisibleHidden })

      // Let's open the Dialog, to see if it is not hidden anymore
      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      // Let's close the Dialog
      await press(Keys.Escape)

      assertDialog({ state: DialogState.InvisibleHidden })
    })

    it(
      'should add a scroll lock to the html tag',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>

              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                <input id="a" type="text" />
                <input id="b" type="text" />
                <input id="c" type="text" />
              </Dialog>
            </>
          )
        }

        render(<Example />)

        // No overflow yet
        expect(document.documentElement.style.overflow).toBe('')

        let btn = document.getElementById('trigger')

        // Open the dialog
        await click(btn)

        // Expect overflow
        expect(document.documentElement.style.overflow).toBe('hidden')
      })
    )

    it(
      'should wait to add a scroll lock to the html tag when unmount is false in a Transition',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)

          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>

              <Transition as={Fragment} show={isOpen} unmount={false}>
                <Dialog autoFocus={false} onClose={() => setIsOpen(false)} unmount={false}>
                  <input id="a" type="text" />
                  <input id="b" type="text" />
                  <input id="c" type="text" />
                </Dialog>
              </Transition>
            </>
          )
        }

        render(<Example />)

        // No overflow yet
        expect(document.documentElement.style.overflow).toBe('')

        let btn = document.getElementById('trigger')

        // Open the dialog
        await click(btn)

        // Expect overflow
        expect(document.documentElement.style.overflow).toBe('hidden')
      })
    )

    it(
      'scroll locking should work when transitioning between dialogs',
      suppressConsoleLogs(async () => {
        // While we don't support multiple dialogs
        // We at least want to work towards supporting it at some point
        // The first step is just making sure that scroll locking works
        // when there are multiple dialogs open at the same time

        function Example() {
          let [dialogs, setDialogs] = useState<string[]>([])
          let toggle = useCallback(
            (id: string, state: 'open' | 'close') => {
              if (state === 'open' && !dialogs.includes(id)) {
                setDialogs([id])
              } else if (state === 'close' && dialogs.includes(id)) {
                setDialogs(dialogs.filter((x) => x !== id))
              }
            },
            [dialogs]
          )

          return (
            <>
              <DialogWrapper id="d1" dialogs={dialogs} toggle={toggle} />
              <DialogWrapper id="d2" dialogs={dialogs} toggle={toggle} />
              <DialogWrapper id="d3" dialogs={dialogs} toggle={toggle} />
            </>
          )
        }

        function DialogWrapper({
          id,
          dialogs,
          toggle,
        }: {
          id: string
          dialogs: string[]
          toggle: (id: string, state: 'open' | 'close') => void
        }) {
          return (
            <>
              <button id={`open_${id}`} onClick={() => toggle(id, 'open')}>
                Open {id}
              </button>
              <Transition as={Fragment} show={dialogs.includes(id)}>
                <Dialog autoFocus={false} onClose={() => toggle(id, 'close')}>
                  <button id={`close_${id}`} onClick={() => toggle(id, 'close')}>
                    Close {id}
                  </button>
                </Dialog>
              </Transition>
            </>
          )
        }

        render(<Example />)

        // No overflow yet
        expect(document.documentElement.style.overflow).toBe('')

        let open1 = () => document.getElementById('open_d1')
        let open2 = () => document.getElementById('open_d2')
        let open3 = () => document.getElementById('open_d3')
        let close3 = () => document.getElementById('close_d3')

        // Open the dialog & expect overflow
        await click(open1())
        await frames(2)
        expect(document.documentElement.style.overflow).toBe('hidden')

        // Open the dialog & expect overflow
        await click(open2())
        await frames(2)
        expect(document.documentElement.style.overflow).toBe('hidden')

        // Open the dialog & expect overflow
        await click(open3())
        await frames(2)
        expect(document.documentElement.style.overflow).toBe('hidden')

        // At this point only the last dialog should be open
        // Close the dialog & dont expect overflow
        await click(close3())
        await frames(2)
        expect(document.documentElement.style.overflow).toBe('')
      })
    )

    it(
      'should remove the scroll lock when the open closed state is `Closing`',
      suppressConsoleLogs(async () => {
        function Example({ open = true }) {
          return (
            <Dialog transition autoFocus={false} open={open} onClose={() => {}}>
              <input id="a" type="text" />
              <input id="b" type="text" />
              <input id="c" type="text" />
            </Dialog>
          )
        }

        let { rerender } = render(<Example open={true} />)

        // The overflow should be there
        expect(document.documentElement.style.overflow).toBe('hidden')

        // Re-render but with an exit transition
        rerender(<Example open={false} />)

        // The moment the dialog is closing, the overflow should be gone
        expect(document.documentElement.style.overflow).toBe('')
      })
    )

    it(
      'should remove the scroll lock when the open closed state is `Closing` (using Transition wrapper)',
      suppressConsoleLogs(async () => {
        function Example({ open = true }) {
          return (
            <Transition show={open}>
              <Dialog autoFocus={false} onClose={() => {}}>
                <input id="a" type="text" />
                <input id="b" type="text" />
                <input id="c" type="text" />
              </Dialog>
            </Transition>
          )
        }

        let { rerender } = render(<Example open={true} />)

        // The overflow should be there
        expect(document.documentElement.style.overflow).toBe('hidden')

        // Re-render but with an exit transition
        rerender(<Example open={false} />)

        // The moment the dialog is closing, the overflow should be gone
        expect(document.documentElement.style.overflow).toBe('')
      })
    )

    it(
      'should not have a scroll lock when the transition marked as not shown',
      suppressConsoleLogs(async () => {
        function Example() {
          return (
            <Transition as={Fragment} show={false} unmount={false}>
              <Dialog autoFocus={false} as="div" onClose={() => {}}>
                <input type="text" />
              </Dialog>
            </Transition>
          )
        }

        render(<Example />)

        await nextFrame()

        // The overflow should NOT be there
        expect(document.documentElement.style.overflow).toBe('')
      })
    )
  })

  describe('Dialog.Title', () => {
    it(
      'should be possible to render Dialog.Title using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog autoFocus={false} open={true} onClose={console.log}>
            <Dialog.Title>{(slot) => <>{JSON.stringify(slot)}</>}</Dialog.Title>
            <TabSentinel />
          </Dialog>
        )

        await nextFrame()

        assertDialog({ state: DialogState.Visible })
        assertDialogTitle({
          state: DialogState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )
  })

  describe('Dialog.Description', () => {
    it(
      'should be possible to render Dialog.Description using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Dialog autoFocus={false} open={true} onClose={console.log}>
            <Dialog.Description>{(slot) => <>{JSON.stringify(slot)}</>}</Dialog.Description>
            <TabSentinel />
          </Dialog>
        )

        await nextFrame()

        assertDialog({ state: DialogState.Visible })
        assertDialogDescription({
          state: DialogState.Visible,
          textContent: JSON.stringify({ open: true, disabled: false }),
        })
      })
    )
  })
})

describe('Composition', () => {
  it(
    'should be possible to open a dialog from inside a Popover (and then close it)',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isDialogOpen, setIsDialogOpen] = useState(false)

        return (
          <div>
            <Popover>
              <Popover.Button>Open Popover</Popover.Button>
              <Popover.Panel>
                <button id="openDialog" onClick={() => setIsDialogOpen(true)}>
                  Open dialog
                </button>
              </Popover.Panel>
            </Popover>

            <Dialog autoFocus={false} open={isDialogOpen} onClose={console.log}>
              <Dialog.Panel>
                <button id="closeDialog" onClick={() => setIsDialogOpen(false)}>
                  Close Dialog
                </button>
              </Dialog.Panel>
            </Dialog>
          </div>
        )
      }

      render(<Example />)

      await nextFrame()

      // Nothing is open initially
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      assertDialog({ state: DialogState.InvisibleUnmounted })
      assertActiveElement(document.body)

      // Open the popover
      await click(getPopoverButton())

      // The popover should be open but the dialog should not
      assertPopoverPanel({ state: PopoverState.Visible })
      assertDialog({ state: DialogState.InvisibleUnmounted })
      assertActiveElement(getPopoverButton())

      // Open the dialog from inside the popover
      await click(document.getElementById('openDialog'))

      // The dialog should be open but the popover should not
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      assertDialog({ state: DialogState.Visible })
      assertActiveElement(document.getElementById('closeDialog'))

      // Close the dialog from inside itself
      await click(document.getElementById('closeDialog'))

      // Nothing should be open
      assertPopoverPanel({ state: PopoverState.InvisibleUnmounted })
      assertDialog({ state: DialogState.InvisibleUnmounted })
      assertActiveElement(getPopoverButton())
    })
  )

  it(
    'should be possible to open the Dialog via a Transition component',
    suppressConsoleLogs(async () => {
      render(
        <Transition show={true}>
          <Dialog autoFocus={false} onClose={console.log}>
            <Dialog.Description>{(slot) => <>{JSON.stringify(slot)}</>}</Dialog.Description>
            <TabSentinel />
          </Dialog>
        </Transition>
      )

      await nextFrame()

      assertDialog({ state: DialogState.Visible })
      assertDialogDescription({
        state: DialogState.Visible,
        textContent: JSON.stringify({ open: true, disabled: false }),
      })
    })
  )

  it(
    'should be possible to close the Dialog via a Transition component',
    suppressConsoleLogs(async () => {
      render(
        <Transition show={false}>
          <Dialog autoFocus={false} onClose={console.log}>
            <Dialog.Description>{(slot) => <>{JSON.stringify(slot)}</>}</Dialog.Description>
            <TabSentinel />
          </Dialog>
        </Transition>
      )

      await nextFrame()

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Escape` key', () => {
    it(
      'should be possible to close the dialog with Escape',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                Contents
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({ state: DialogState.Visible })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialog({ state: DialogState.InvisibleUnmounted })
      })
    )

    it(
      'should be possible to close the dialog with Escape, when a field is focused',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                Contents
                <input id="name" />
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({ state: DialogState.Visible })

        // Close dialog
        await press(Keys.Escape)

        // Verify it is close
        assertDialog({ state: DialogState.InvisibleUnmounted })
      })
    )

    it(
      'should not be possible to close the dialog with Escape, when a field is focused but cancels the event',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                Contents
                <input
                  id="name"
                  onKeyDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                />
                <TabSentinel />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({ state: DialogState.Visible })

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
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          let initialFocusRef = useRef(null)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>
              <Dialog
                autoFocus={false}
                open={isOpen}
                onClose={setIsOpen}
                initialFocus={initialFocusRef}
              >
                Contents
                <TabSentinel id="a" />
                <input type="text" id="b" ref={initialFocusRef} />
              </Dialog>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({ state: DialogState.Visible })

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
      'should not escape the FocusTrap when there is only 1 focusable element (going forwards)',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>
              <button>Before</button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                <Dialog.Panel>
                  <input type="text" id="a" />
                </Dialog.Panel>
              </Dialog>
              <button>After</button>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({ state: DialogState.Visible })

        // Verify that the input field is focused
        assertActiveElement(document.getElementById('a'))

        // Verify that we stay within the Dialog
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))

        // Verify that we stay within the Dialog
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))

        // Verify that we stay within the Dialog
        await press(Keys.Tab)
        assertActiveElement(document.getElementById('a'))
      })
    )

    it(
      'should not escape the FocusTrap when there is only 1 focusable element (going backwards)',
      suppressConsoleLogs(async () => {
        function Example() {
          let [isOpen, setIsOpen] = useState(false)
          return (
            <>
              <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
                Trigger
              </button>
              <button>Before</button>
              <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
                <Dialog.Panel>
                  <input type="text" id="a" />
                </Dialog.Panel>
              </Dialog>
              <button>After</button>
            </>
          )
        }
        render(<Example />)

        assertDialog({ state: DialogState.InvisibleUnmounted })

        // Open dialog
        await click(document.getElementById('trigger'))

        // Verify it is open
        assertDialog({ state: DialogState.Visible })

        // Verify that the input field is focused
        assertActiveElement(document.getElementById('a'))

        // Verify that we stay within the Dialog
        await press(shift(Keys.Tab))
        assertActiveElement(document.getElementById('a'))

        // Verify that we stay within the Dialog
        await press(shift(Keys.Tab))
        assertActiveElement(document.getElementById('a'))

        // Verify that we stay within the Dialog
        await press(shift(Keys.Tab))
        assertActiveElement(document.getElementById('a'))
      })
    )
  })
})

describe('Mouse interactions', () => {
  it(
    'should be possible to close the dialog, and re-focus the button when we click outside on the body element',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button onClick={() => setIsOpen((v) => !v)}>Trigger</button>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              Contents
              <TabSentinel />
            </Dialog>
          </>
        )
      }
      render(<Example />)

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
    'should be possible to submit a form inside a Dialog',
    suppressConsoleLogs(async () => {
      let submitFn = jest.fn()
      function Example() {
        let [isOpen, setIsOpen] = useState(true)
        return (
          <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
            <form onSubmit={submitFn}>
              <input type="hidden" value="abc" />
              <button type="submit">Submit</button>
            </form>
            <TabSentinel />
          </Dialog>
        )
      }

      render(<Example />)

      await nextFrame()

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
      function Example() {
        let [isOpen, setIsOpen] = useState(true)
        return (
          <div onClick={wrapperFn}>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <Dialog.Panel>
                Contents
                <button onClick={() => setIsOpen(false)}>Inside</button>
                <TabSentinel />
              </Dialog.Panel>
            </Dialog>
          </div>
        )
      }

      render(<Example />)

      await nextFrame()

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Verify that the wrapper function has not been called yet
      expect(wrapperFn).toHaveBeenCalledTimes(0)

      // Click the button inside the Dialog
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
      function Example() {
        let [isOpen, setIsOpen] = useState(true)
        let wrapper = useRef<HTMLDivElement | null>(null)

        return (
          <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
            <div ref={wrapper}>
              Contents
              <button
                onMouseDown={() => {
                  // Remove this button before the Dialog's mousedown listener fires:
                  wrapper.current?.remove()
                }}
              >
                Inside
              </button>
              <TabSentinel />
            </div>
          </Dialog>
        )
      }

      render(<Example />)

      await nextFrame()

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button inside the Dialog
      await click(getByText('Inside'))

      // Verify it is still open
      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should be possible to click on elements created by third party libraries',
    suppressConsoleLogs(async () => {
      let fn = jest.fn()
      function ThirdPartyLibrary() {
        return createPortal(
          <>
            <button data-lib onClick={fn}>
              3rd party button
            </button>
          </>,
          document.body
        )
      }

      function Example() {
        let [isOpen, setIsOpen] = useState(true)

        return (
          <div>
            <span>Main app</span>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <div>
                Contents
                <TabSentinel />
              </div>
            </Dialog>
            <ThirdPartyLibrary />
          </div>
        )
      }

      render(<Example />)

      await nextFrame()

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
    'should be possible to focus elements created by third party libraries',
    suppressConsoleLogs(async () => {
      let fn = jest.fn()
      let handleFocus = jest.fn()

      function ThirdPartyLibrary() {
        return createPortal(
          <>
            <button data-lib onClick={fn}>
              3rd party button
            </button>
          </>,
          document.body
        )
      }

      function Example() {
        let [isOpen, setIsOpen] = useState(true)

        return (
          <div>
            <span>Main app</span>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <div>
                Contents
                <TabSentinel onFocus={handleFocus} />
              </div>
            </Dialog>
            <ThirdPartyLibrary />
          </div>
        )
      }

      render(<Example />)

      await nextFrame()

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button inside the 3rd party library
      await focus(document.querySelector('[data-lib]'))

      // Verify that the focus is on the 3rd party button, and that we are not redirecting focus to
      // the dialog again.
      assertActiveElement(document.querySelector('[data-lib]'))

      // This should only have been called once (when opening the Dialog)
      expect(handleFocus).toHaveBeenCalledTimes(1)

      // Verify the dialog is still open
      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should be possible to click elements inside the dialog when they reside inside a shadow boundary',
    suppressConsoleLogs(async () => {
      let fn = jest.fn()
      function ShadowChildren({ id, buttonId }: { id: string; buttonId: string }) {
        let container = useRef<HTMLDivElement | null>(null)

        useEffect(() => {
          if (!container.current || container.current.shadowRoot) {
            return
          }

          let shadowRoot = container.current.attachShadow({ mode: 'open' })
          let button = document.createElement('button')
          button.id = buttonId
          button.textContent = 'Inside shadow root'
          button.addEventListener('click', fn)
          shadowRoot.appendChild(button)
        }, [])

        return <div id={id} ref={container}></div>
      }

      function Example() {
        let [isOpen, setIsOpen] = useState(true)

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>open</button>
            <Dialog autoFocus={false} open={isOpen} onClose={() => setIsOpen(false)}>
              <div>
                <button id="btn_outside_light" onClick={fn}>
                  Button
                </button>
                <ShadowChildren id="outside_shadow" buttonId="btn_outside_shadow" />
              </div>
              <Dialog.Panel>
                <button id="btn_inside_light" onClick={fn}>
                  Button
                </button>
                <ShadowChildren id="inside_shadow" buttonId="btn_inside_shadow" />
              </Dialog.Panel>
            </Dialog>
          </div>
        )
      }

      render(<Example />)

      await nextFrame()

      // Verify it is open
      assertDialog({ state: DialogState.Visible })

      // Click the button inside the dialog (light DOM)
      await click(document.querySelector('#btn_inside_light'))

      // Verify the button was clicked
      expect(fn).toHaveBeenCalledTimes(1)

      // Verify the dialog is still open
      assertDialog({ state: DialogState.Visible })

      // Click the button inside the dialog (shadow DOM)
      await click(
        document.querySelector('#inside_shadow')?.shadowRoot?.querySelector('#btn_inside_shadow') ??
          null
      )

      // Verify the button was clicked
      expect(fn).toHaveBeenCalledTimes(2)

      // Verify the dialog is still open
      assertDialog({ state: DialogState.Visible })

      // Click the button outside the dialog (shadow DOM)
      await click(
        document
          .querySelector('#outside_shadow')
          ?.shadowRoot?.querySelector('#btn_outside_shadow') ?? null
      )

      // Verify the button was clicked
      expect(fn).toHaveBeenCalledTimes(3)

      // Verify the dialog is closed
      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )

  // NOTE: This test doesn't actually fail in JSDOM when it's supposed to
  // We're keeping it around for documentation purposes
  it(
    'should not close the Dialog if it starts open and we click inside the Dialog when it has only a panel',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(true)
        return (
          <>
            <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
              Trigger
            </button>
            <Dialog autoFocus={false} open={isOpen} onClose={() => setIsOpen(false)}>
              <Dialog.Panel>
                <p id="inside">My content</p>
                <button>close</button>
              </Dialog.Panel>
            </Dialog>
          </>
        )
      }

      render(<Example />)

      // Open the dialog
      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      // Click the p tag inside the dialog
      await click(document.getElementById('inside'))

      // It should not have closed
      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should close the Dialog if we click outside the Dialog.Panel',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
              Trigger
            </button>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <Dialog.Panel>
                <TabSentinel />
              </Dialog.Panel>
              <button id="outside">Outside, technically</button>
            </Dialog>
          </>
        )
      }

      render(<Example />)

      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      await click(document.getElementById('outside'))

      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )

  it(
    'should not close the Dialog if we click inside the Dialog.Panel',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
              Trigger
            </button>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <Dialog.Panel>
                <button id="inside">Inside</button>
                <TabSentinel />
              </Dialog.Panel>
            </Dialog>
          </>
        )
      }

      render(<Example />)

      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      await click(document.getElementById('inside'))

      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should not close the dialog if opened during mouse up',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button id="trigger" onMouseUpCapture={() => setIsOpen((v) => !v)}>
              Trigger
            </button>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <Dialog.Panel>
                <button id="inside">Inside</button>
                <TabSentinel />
              </Dialog.Panel>
            </Dialog>
          </>
        )
      }

      render(<Example />)

      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      await click(document.getElementById('inside'))

      assertDialog({ state: DialogState.Visible })
    })
  )

  it(
    'should not close the dialog if click starts inside the dialog but ends outside',
    suppressConsoleLogs(async () => {
      function Example() {
        let [isOpen, setIsOpen] = useState(false)
        return (
          <>
            <button id="trigger" onClick={() => setIsOpen((v) => !v)}>
              Trigger
            </button>
            <div id="i-am-outside">this thing</div>
            <Dialog autoFocus={false} open={isOpen} onClose={setIsOpen}>
              <Dialog.Panel>
                <button id="inside">Inside</button>
                <TabSentinel />
              </Dialog.Panel>
            </Dialog>
          </>
        )
      }

      render(<Example />)

      // Open the dialog
      await click(document.getElementById('trigger'))

      assertDialog({ state: DialogState.Visible })

      // Start a click inside the dialog and end it outside
      await mouseDrag(document.getElementById('inside'), document.getElementById('i-am-outside'))

      // It should not have hidden
      assertDialog({ state: DialogState.Visible })

      await click(document.getElementById('i-am-outside'))

      // It's gone
      assertDialog({ state: DialogState.InvisibleUnmounted })
    })
  )
})

describe('Nesting', () => {
  type RenderStrategy = 'mounted' | 'always'

  function Nested({
    onClose,
    open = true,
    level = 1,
    renderWhen = 'mounted',
  }: {
    onClose: (value: boolean) => void
    open?: boolean
    level?: number
    renderWhen?: RenderStrategy
  }) {
    let [showChild, setShowChild] = useState(false)

    return (
      <Dialog autoFocus={false} open={open} onClose={onClose}>
        <div>
          <p>Level: {level}</p>
          <button onClick={() => setShowChild(true)}>Open {level + 1} a</button>
          <button onClick={() => setShowChild(true)}>Open {level + 1} b</button>
          <button onClick={() => setShowChild(true)}>Open {level + 1} c</button>
        </div>
        {renderWhen === 'always' ? (
          <Nested
            open={showChild}
            onClose={setShowChild}
            level={level + 1}
            renderWhen={renderWhen}
          />
        ) : (
          showChild && <Nested open={true} onClose={setShowChild} level={level + 1} />
        )}
      </Dialog>
    )
  }

  function Example({ renderWhen = 'mounted' }: { renderWhen: RenderStrategy }) {
    let [open, setOpen] = useState(false)

    return (
      <>
        <button onClick={() => setOpen(true)}>Open 1</button>
        {open && <Nested open={true} onClose={setOpen} renderWhen={renderWhen} />}
      </>
    )
  }

  it.each`
    strategy                  | when         | action
    ${'with `Escape`'}        | ${'mounted'} | ${() => press(Keys.Escape)}
    ${'with `Outside Click`'} | ${'mounted'} | ${() => click(document.body)}
    ${'with `Escape`'}        | ${'always'}  | ${() => press(Keys.Escape)}
    ${'with `Outside Click`'} | ${'always'}  | ${() => click(document.body)}
  `(
    'should be possible to open nested Dialog components (visible when $when) and close them $strategy',
    async ({ when, action }) => {
      render(<Example renderWhen={when} />)

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
