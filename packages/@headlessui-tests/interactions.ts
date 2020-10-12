import { fireEvent } from '@testing-library/dom'
import { disposables } from './utils/disposables'

const d = disposables()

export const Keys: Record<string, Partial<KeyboardEvent>> = {
  Space: { key: ' ', keyCode: 32 },
  Enter: { key: 'Enter', keyCode: 13 },
  Escape: { key: 'Escape', keyCode: 27 },
  Backspace: { key: 'Backspace', keyCode: 8 },

  ArrowUp: { key: 'ArrowUp', keyCode: 38 },
  ArrowDown: { key: 'ArrowDown', keyCode: 40 },

  Home: { key: 'Home', keyCode: 36 },
  End: { key: 'End', keyCode: 35 },

  PageUp: { key: 'PageUp', keyCode: 33 },
  PageDown: { key: 'PageDown', keyCode: 34 },

  Tab: { key: 'Tab', keyCode: 9 },
}

export function shift(event: Partial<KeyboardEvent>) {
  return { ...event, shiftKey: true }
}

export function word(input: string): Partial<KeyboardEvent>[] {
  return input.split('').map(key => ({ key }))
}

export async function type(events: Partial<KeyboardEvent>[]) {
  jest.useFakeTimers()

  try {
    if (document.activeElement === null) return expect(document.activeElement).not.toBe(null)

    let element = document.activeElement

    events.forEach(event => {
      const cancelled1 = !fireEvent.keyDown(element, event)

      // Special treatment for `Tab` on an element
      if (!cancelled1 && event.key === Keys.Tab.key) {
        element = focusNext(event)
      }

      const cancelled2 = !fireEvent.keyPress(element, event)
      // Special treatment for `Enter` on a button element
      if (!cancelled2 && event.key === Keys.Enter.key && element instanceof HTMLButtonElement) {
        fireEvent.click(element)
      }

      fireEvent.keyUp(element, event)
    })

    // We don't want to actually wait in our tests, so let's advance
    jest.runAllTimers()

    await new Promise(d.nextFrame)
  } catch (err) {
    Error.captureStackTrace(err, type)
    throw err
  } finally {
    jest.useRealTimers()
  }
}

export async function press(event: Partial<KeyboardEvent>) {
  return type([event])
}

export async function click(element: Document | Element | Window | Node | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerDown(element)
    fireEvent.mouseDown(element)
    fireEvent.pointerUp(element)
    fireEvent.mouseUp(element)
    fireEvent.click(element)

    await new Promise(d.nextFrame)
  } catch (err) {
    Error.captureStackTrace(err, click)
    throw err
  }
}

export async function focus(element: Document | Element | Window | Node | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.focus(element)

    await new Promise(d.nextFrame)
  } catch (err) {
    Error.captureStackTrace(err, focus)
    throw err
  }
}
export async function mouseEnter(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerOver(element)
    fireEvent.pointerEnter(element)
    fireEvent.mouseOver(element)

    await new Promise(d.nextFrame)
  } catch (err) {
    Error.captureStackTrace(err, mouseEnter)
    throw err
  }
}

export async function mouseMove(element: Document | Element | Window | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    fireEvent.pointerMove(element)
    fireEvent.mouseMove(element)

    await new Promise(d.nextFrame)
  } catch (err) {
    Error.captureStackTrace(err, mouseMove)
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

    await new Promise(d.nextFrame)
  } catch (err) {
    Error.captureStackTrace(err, mouseLeave)
    throw err
  }
}

// ---

function focusNext(event: Partial<KeyboardEvent>) {
  const direction = event.shiftKey ? -1 : +1
  const focusableElements = getFocusableElements()
  const total = focusableElements.length

  function innerFocusNext(offset = 0): Element {
    const currentIdx = focusableElements.indexOf(document.activeElement as HTMLElement)
    const next = focusableElements[(currentIdx + total + direction + offset) % total] as HTMLElement

    if (next) next?.focus({ preventScroll: true })

    if (next !== document.activeElement) return innerFocusNext(offset + direction)
    return next
  }

  return innerFocusNext()
}

// Credit:
//  - https://stackoverflow.com/a/30753870
const focusableSelector = [
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
  .map(selector => `${selector}:not([tabindex='-1'])`)
  .join(',')

function getFocusableElements(container = document.body) {
  if (!container) return []
  return Array.from(container.querySelectorAll(focusableSelector))
}
