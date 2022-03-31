import { fireEvent } from '@testing-library/dom'
import { disposables } from '../utils/disposables'

let d = disposables()

function nextFrame(cb: Function): void {
  setImmediate(() =>
    setImmediate(() => {
      cb()
    })
  )
}

export let Keys: Record<string, Partial<KeyboardEvent>> = {
  Space: { key: ' ', keyCode: 32, charCode: 32 },
  Enter: { key: 'Enter', keyCode: 13, charCode: 13 },
  Escape: { key: 'Escape', keyCode: 27, charCode: 27 },
  Backspace: { key: 'Backspace', keyCode: 8 },

  ArrowLeft: { key: 'ArrowLeft', keyCode: 37 },
  ArrowUp: { key: 'ArrowUp', keyCode: 38 },
  ArrowRight: { key: 'ArrowRight', keyCode: 39 },
  ArrowDown: { key: 'ArrowDown', keyCode: 40 },

  Home: { key: 'Home', keyCode: 36 },
  End: { key: 'End', keyCode: 35 },

  PageUp: { key: 'PageUp', keyCode: 33 },
  PageDown: { key: 'PageDown', keyCode: 34 },

  Tab: { key: 'Tab', keyCode: 9, charCode: 9 },
}

export function shift(event: Partial<KeyboardEvent>) {
  return { ...event, shiftKey: true }
}

export function word(input: string): Partial<KeyboardEvent>[] {
  let result = input.split('').map((key) => ({ key }))

  d.enqueue(() => {
    let element = document.activeElement

    if (element instanceof HTMLInputElement) {
      fireEvent.change(element, {
        target: Object.assign({}, element, { value: input }),
      })
    }
  })

  return result
}

let Default = Symbol()
let Ignore = Symbol()

let cancellations: Record<string | typeof Default, Record<string, Set<string>>> = {
  [Default]: {
    keydown: new Set(['keypress']),
    keypress: new Set([]),
    keyup: new Set([]),
  },
  [Keys.Enter.key!]: {
    keydown: new Set(['keypress', 'click']),
    keypress: new Set(['click']),
    keyup: new Set([]),
  },
  [Keys.Space.key!]: {
    keydown: new Set(['keypress', 'click']),
    keypress: new Set([]),
    keyup: new Set(['click']),
  },
  [Keys.Tab.key!]: {
    keydown: new Set(['keypress', 'blur', 'focus']),
    keypress: new Set([]),
    keyup: new Set([]),
  },
}

let order: Record<
  string | typeof Default,
  ((
    element: Element,
    event: Partial<KeyboardEvent | MouseEvent>
  ) => boolean | typeof Ignore | Element)[]
> = {
  [Default]: [
    function keydown(element, event) {
      return fireEvent.keyDown(element, event)
    },
    function keypress(element, event) {
      return fireEvent.keyPress(element, event)
    },
    function input(element, event) {
      // TODO: This should only fire when the element's value changes
      return fireEvent.input(element, event)
    },
    function keyup(element, event) {
      return fireEvent.keyUp(element, event)
    },
  ],
  [Keys.Enter.key!]: [
    function keydown(element, event) {
      return fireEvent.keyDown(element, event)
    },
    function keypress(element, event) {
      return fireEvent.keyPress(element, event)
    },
    function click(element, event) {
      if (element instanceof HTMLButtonElement) return fireEvent.click(element, event)
      return Ignore
    },
    function keyup(element, event) {
      return fireEvent.keyUp(element, event)
    },
  ],
  [Keys.Space.key!]: [
    function keydown(element, event) {
      return fireEvent.keyDown(element, event)
    },
    function keypress(element, event) {
      return fireEvent.keyPress(element, event)
    },
    function keyup(element, event) {
      return fireEvent.keyUp(element, event)
    },
    function click(element, event) {
      if (element instanceof HTMLButtonElement) return fireEvent.click(element, event)
      return Ignore
    },
  ],
  [Keys.Tab.key!]: [
    function keydown(element, event) {
      return fireEvent.keyDown(element, event)
    },
    function blurAndfocus(_element, event) {
      return focusNext(event)
    },
    function keyup(element, event) {
      return fireEvent.keyUp(element, event)
    },
  ],
  [Keys.Escape.key!]: [
    function keydown(element, event) {
      return fireEvent.keyDown(element, event)
    },
    function keypress(element, event) {
      return fireEvent.keyPress(element, event)
    },
    function keyup(element, event) {
      return fireEvent.keyUp(element, event)
    },
  ],
  [Keys.Backspace.key!]: [
    function keydown(element, event) {
      if (element instanceof HTMLInputElement) {
        let ev = Object.assign({}, event, {
          target: Object.assign({}, event.target, {
            value: element.value.slice(0, -1),
          }),
        })
        return fireEvent.keyDown(element, ev)
      }

      return fireEvent.keyDown(element, event)
    },
    function keyup(element, event) {
      return fireEvent.keyUp(element, event)
    },
  ],
}

export async function type(events: Partial<KeyboardEvent>[], element = document.activeElement) {
  jest.useFakeTimers()

  try {
    if (element === null) return expect(element).not.toBe(null)

    for (let event of events) {
      let skip = new Set()
      let actions = order[event.key!] ?? order[Default as any]
      for (let action of actions) {
        let checks = action.name.split('And')
        if (checks.some((check) => skip.has(check))) continue

        let result = action(element, {
          type: action.name,
          charCode: event.key?.length === 1 ? event.key?.charCodeAt(0) : undefined,
          ...event,
        })
        if (result === Ignore) continue
        if (result instanceof Element) {
          element = result
        }

        let cancelled = !result
        if (cancelled) {
          let skippablesForKey = cancellations[event.key!] ?? cancellations[Default as any]
          let skippables = skippablesForKey?.[action.name] ?? new Set()

          for (let skippable of skippables) skip.add(skippable)
        }
      }
    }

    // We don't want to actually wait in our tests, so let's advance
    jest.runAllTimers()

    await d.workQueue()

    await new Promise(nextFrame)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, type)
    throw err
  } finally {
    jest.useRealTimers()
  }
}

export async function press(event: Partial<KeyboardEvent>, element = document.activeElement) {
  return type([event], element)
}

export enum MouseButton {
  Left = 0,
  Right = 2,
}

export async function click(
  element: Document | Element | Window | Node | null,
  button = MouseButton.Left
) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    let options = { button }

    if (button === MouseButton.Left) {
      // Cancel in pointerDown cancels mouseDown, mouseUp
      let cancelled = !fireEvent.pointerDown(element, options)
      if (!cancelled) {
        fireEvent.mouseDown(element, options)
      }

      // Ensure to trigger a `focus` event if the element is focusable, or within a focusable element
      let next: HTMLElement | null = element as HTMLElement | null
      while (next !== null) {
        if (next.matches(focusableSelector)) {
          next.focus()
          break
        }
        next = next.parentElement
      }

      fireEvent.pointerUp(element, options)
      if (!cancelled) {
        fireEvent.mouseUp(element, options)
      }
      fireEvent.click(element, options)
    } else if (button === MouseButton.Right) {
      // Cancel in pointerDown cancels mouseDown, mouseUp
      let cancelled = !fireEvent.pointerDown(element, options)
      if (!cancelled) {
        fireEvent.mouseDown(element, options)
      }

      // Only in Firefox:
      fireEvent.pointerUp(element, options)
      if (!cancelled) {
        fireEvent.mouseUp(element, options)
      }
    }

    await new Promise(nextFrame)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, click)
    throw err
  }
}

export async function focus(element: Document | Element | Window | Node | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.focus(element)

    await new Promise(nextFrame)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, focus)
    throw err
  }
}
export async function mouseEnter(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerOver(element)
    fireEvent.pointerEnter(element)
    fireEvent.mouseOver(element)

    await new Promise(nextFrame)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, mouseEnter)
    throw err
  }
}

export async function mouseMove(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerMove(element)
    fireEvent.mouseMove(element)

    await new Promise(nextFrame)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, mouseMove)
    throw err
  }
}

export async function mouseLeave(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerOut(element)
    fireEvent.pointerLeave(element)
    fireEvent.mouseOut(element)
    fireEvent.mouseLeave(element)

    await new Promise(nextFrame)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, mouseLeave)
    throw err
  }
}

// ---

function focusNext(event: Partial<KeyboardEvent>) {
  let direction = event.shiftKey ? -1 : +1
  let focusableElements = getFocusableElements()
  let total = focusableElements.length

  function innerFocusNext(offset = 0): Element {
    let currentIdx = focusableElements.indexOf(document.activeElement as HTMLElement)
    let next = focusableElements[(currentIdx + total + direction + offset) % total] as HTMLElement

    if (next) next?.focus({ preventScroll: true })

    if (next !== document.activeElement) return innerFocusNext(offset + direction)
    return next
  }

  return innerFocusNext()
}

// Credit:
//  - https://stackoverflow.com/a/30753870
let focusableSelector = [
  '[contentEditable=true]',
  '[tabindex]',
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
]
  .map(
    process.env.NODE_ENV === 'test'
      ? // TODO: Remove this once JSDOM fixes the issue where an element that is
        // "hidden" can be the document.activeElement, because this is not possible
        // in real browsers.
        (selector) => `${selector}:not([tabindex='-1']):not([style*='display: none'])`
      : (selector) => `${selector}:not([tabindex='-1'])`
  )
  .join(',')

function getFocusableElements(container = document.body) {
  if (!container) return []
  return Array.from(container.querySelectorAll(focusableSelector))
}
