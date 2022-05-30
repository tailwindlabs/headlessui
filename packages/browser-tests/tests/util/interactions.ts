// import {
//   click,
//   press,
//   focus,
//   Keys,
//   MouseButton,
// } from '../../../@headlessui-react/src/test-utils/interactions'

import { match } from '../../../@headlessui-react/src/utils/match'
import { Locator } from './plugin'

export function activeComponent(): Locator {
  return globalThis.component
}

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export async function click(element: Locator | null, button = MouseButton.Left) {
  await element.click({
    button: match(button, {
      [MouseButton.Left]: 'left',
      [MouseButton.Middle]: 'middle',
      [MouseButton.Right]: 'right',
    }),

    // TODO: In some tests we click disabled buttons which are disabled by default in Playwright (because you can't actually click them)
    // Does that mean we should remove this and rewrite the test? Or is this the appropriate behavior?
    force: true,
  })
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

export async function press(event: Partial<KeyboardEvent>) {
  return await activeComponent().press(event.key)
}

export async function focus(locator: Locator) {
  return await locator.focus()
}
