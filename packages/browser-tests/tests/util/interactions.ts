import { expect, Locator } from './plugin'

function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

// ---

export enum DisclosureState {
  /** The disclosure is visible to the user. */
  Visible,

  /** The disclosure is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The disclosure is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

// ---

export function getDisclosureButton(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-disclosure-button-"]')
}

export function getDisclosurePanel(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-disclosure-panel-"]')
}

// ---

export async function assertDisclosureButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DisclosureState
  },
  button = getDisclosureButton()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)

    // Ensure disclosure button have these properties
    await expect(button).toHaveAttribute('id')

    switch (options.state) {
      case DisclosureState.Visible:
        await expect(button).toHaveAttribute('aria-controls')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case DisclosureState.InvisibleHidden:
        await expect(button).toHaveAttribute('aria-controls')
        if (await button.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case DisclosureState.InvisibleUnmounted:
        await expect(button).not.toHaveAttribute('aria-controls')
        if (await button.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      default:
        assertNever(options.state)
    }

    if (options.textContent) {
      await expect(button).toHaveTextContent(options.textContent)
    }

    // Ensure disclosure button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDisclosureButton)
    throw err
  }
}
