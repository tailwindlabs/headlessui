import { isFocusableElement, FocusableMode } from '../utils/focus-management'

let expect = globalThis.expect ?? require('../../../browser-tests/tests/util/plugin').expect

function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

// ---

export function getMenuButton(): HTMLElement | null {
  return document.querySelector('button,[role="button"],[id^="headlessui-menu-button-"]')
}

export function getMenuButtons(): HTMLElement[] {
  return Array.from(document.querySelectorAll('button,[role="button"]'))
}

export function getMenu(): HTMLElement | null {
  return document.querySelector('[role="menu"]')
}

export function getMenus(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="menu"]'))
}

export function getMenuItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="menuitem"]'))
}

// ---

export enum MenuState {
  /** The menu is visible to the user. */
  Visible,

  /** The menu is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The menu is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

export async function assertMenuButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: MenuState
  },
  button = getMenuButton()
) {
  try {
    await expect(button).toBePresent()

    // Ensure menu button have these properties
    await expect(button).toHaveAttribute('id')
    await expect(button).toHaveAttribute('aria-haspopup')

    switch (options.state) {
      case MenuState.Visible:
        await expect(button).toHaveAttribute('aria-controls')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case MenuState.InvisibleHidden:
        await expect(button).toHaveAttribute('aria-controls')
        if (await button.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case MenuState.InvisibleUnmounted:
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

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuButton)
    throw err
  }
}

export async function assertMenuButtonLinkedWithMenu(button = getMenuButton(), menu = getMenu()) {
  try {
    await expect(button).toBePresent()
    await expect(menu).toBePresent()

    // Ensure link between button & menu is correct
    await expect(button).toHaveAttribute('aria-controls', menu.getAttribute('id'))
    await expect(menu).toHaveAttribute('aria-labelledby', button.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuButtonLinkedWithMenu)
    throw err
  }
}

export async function assertMenuLinkedWithMenuItem(item: HTMLElement | null, menu = getMenu()) {
  try {
    await expect(menu).toBePresent()
    await expect(item).toBePresent()

    // Ensure link between menu & menu item is correct
    await expect(menu).toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuLinkedWithMenuItem)
    throw err
  }
}

export async function assertNoActiveMenuItem(menu = getMenu()) {
  try {
    await expect(menu).toBePresent()

    // Ensure we don't have an active menu
    await expect(menu).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoActiveMenuItem)
    throw err
  }
}

export async function assertMenu(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: MenuState
  },
  menu = getMenu()
) {
  try {
    switch (options.state) {
      case MenuState.InvisibleHidden:
        await expect(menu).toBePresent()

        await assertHidden(menu)

        await expect(menu).toHaveAttribute('aria-labelledby')
        await expect(menu).toHaveAttribute('role', 'menu')

        if (options.textContent) await expect(menu).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(menu).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case MenuState.Visible:
        await expect(menu).toBePresent()

        await assertVisible(menu)

        await expect(menu).toHaveAttribute('aria-labelledby')
        await expect(menu).toHaveAttribute('role', 'menu')

        if (options.textContent) await expect(menu).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(menu).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case MenuState.InvisibleUnmounted:
        await expect(menu).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenu)
    throw err
  }
}

export async function assertMenuItem(
  item: HTMLElement | null,
  options?: { tag?: string; attributes?: Record<string, string | null> }
) {
  try {
    await expect(item).toBePresent()

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    await expect(item).toHaveAttribute('id')

    // Check that we have the correct values for certain attributes
    await expect(item).toHaveAttribute('role', 'menuitem')
    if (!item.getAttribute('aria-disabled')) await expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure menu button has the following attributes
    if (options) {
      for (let attributeName in options.attributes) {
        await expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
      }

      if (options.tag) {
        await expect(item.tagName.toLowerCase()).toBe(options.tag)
      }
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuItem)
    throw err
  }
}

// ---

export function getComboboxLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-combobox-label"]')
}

export function getComboboxButton(): HTMLElement | null {
  return document.querySelector('button,[role="button"],[id^="headlessui-combobox-button-"]')
}

export function getComboboxButtons(): HTMLElement[] {
  return Array.from(document.querySelectorAll('button,[role="button"]'))
}

export function getComboboxInput(): HTMLInputElement | null {
  return document.querySelector('[role="combobox"]')
}

export function getCombobox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]')
}

export function getComboboxInputs(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="combobox"]'))
}

export function getComboboxes(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="listbox"]'))
}

export function getComboboxOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="option"]'))
}

// ---

export enum ComboboxState {
  /** The combobox is visible to the user. */
  Visible,

  /** The combobox is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The combobox is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

export enum ComboboxMode {
  /** The combobox is in the `single` mode. */
  Single,

  /** The combobox is in the `multiple` mode. */
  Multiple,
}

export async function assertCombobox(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ComboboxState
    mode?: ComboboxMode
  },
  combobox = getComboboxInput()
) {
  try {
    switch (options.state) {
      case ComboboxState.InvisibleHidden:
        await expect(combobox).toBePresent()

        await assertHidden(combobox)

        await expect(combobox).toHaveAttribute('role', 'combobox')

        if (options.textContent) await expect(combobox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(combobox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.Visible:
        await expect(combobox).toBePresent()

        await assertVisible(combobox)

        await expect(combobox).toHaveAttribute('role', 'combobox')

        if (options.mode && options.mode === ComboboxMode.Multiple) {
          await expect(combobox).toHaveAttribute('aria-multiselectable', 'true')
        }

        if (options.textContent) await expect(combobox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(combobox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.InvisibleUnmounted:
        await expect(combobox).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertCombobox)
    throw err
  }
}

export function assertComboboxInput(
  options: {
    attributes?: Record<string, string | null>
    state: ComboboxState
  },
  input = getComboboxInput()
) {
  try {
    if (input === null) return expect(input).not.toBe(null)

    // Ensure combobox input has these properties
    expect(input).toHaveAttribute('id')

    switch (options.state) {
      case ComboboxState.Visible:
        expect(input).toHaveAttribute('aria-controls')
        expect(input).toHaveAttribute('aria-expanded', 'true')
        break

      case ComboboxState.InvisibleHidden:
        expect(input).toHaveAttribute('aria-controls')
        if (input.hasAttribute('disabled')) {
          expect(input).not.toHaveAttribute('aria-expanded')
        } else {
          expect(input).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case ComboboxState.InvisibleUnmounted:
        expect(input).not.toHaveAttribute('aria-controls')
        if (input.hasAttribute('disabled')) {
          expect(input).not.toHaveAttribute('aria-expanded')
        } else {
          expect(input).toHaveAttribute('aria-expanded', 'false')
        }
        break

      default:
        assertNever(options.state)
    }

    // Ensure combobox input has the following attributes
    for (let attributeName in options.attributes) {
      expect(input).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxInput)
    throw err
  }
}

export async function assertComboboxList(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ComboboxState
  },
  listbox = getCombobox()
) {
  try {
    switch (options.state) {
      case ComboboxState.InvisibleHidden:
        await expect(listbox).toBePresent()

        await assertHidden(listbox)

        await expect(listbox).toHaveAttribute('aria-labelledby')
        await expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) await expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.Visible:
        await expect(listbox).toBePresent()

        await assertVisible(listbox)

        await expect(listbox).toHaveAttribute('aria-labelledby')
        await expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) await expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.InvisibleUnmounted:
        await expect(listbox).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertCombobox)
    throw err
  }
}

export async function assertComboboxButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ComboboxState
  },
  button = getComboboxButton()
) {
  try {
    await expect(button).toBePresent()

    // Ensure menu button have these properties
    await expect(button).toHaveAttribute('id')
    await expect(button).toHaveAttribute('aria-haspopup')

    switch (options.state) {
      case ComboboxState.Visible:
        await expect(button).toHaveAttribute('aria-controls')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case ComboboxState.InvisibleHidden:
        await expect(button).toHaveAttribute('aria-controls')
        if (await button.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case ComboboxState.InvisibleUnmounted:
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

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxButton)
    throw err
  }
}

export async function assertComboboxLabel(
  options: {
    attributes?: Record<string, string | null>
    tag?: string
    textContent?: string
  },
  label = getComboboxLabel()
) {
  try {
    await expect(label).toBePresent()

    // Ensure menu button have these properties
    await expect(label).toHaveAttribute('id')

    if (options.textContent) {
      await expect(label).toHaveTextContent(options.textContent)
    }

    if (options.tag) {
      await expect(label.tagName.toLowerCase()).toBe(options.tag)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(label).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxLabel)
    throw err
  }
}

export async function assertComboboxButtonLinkedWithCombobox(
  button = getComboboxButton(),
  combobox = getCombobox()
) {
  try {
    await expect(button).toBePresent()
    await expect(combobox).toBePresent()

    // Ensure link between button & combobox is correct
    await expect(button).toHaveAttribute('aria-controls', combobox.getAttribute('id'))
    await expect(combobox).toHaveAttribute('aria-labelledby', button.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxButtonLinkedWithCombobox)
    throw err
  }
}

export async function assertComboboxLabelLinkedWithCombobox(
  label = getComboboxLabel(),
  combobox = getComboboxInput()
) {
  try {
    await expect(label).toBePresent()
    await expect(combobox).toBePresent()

    await expect(combobox).toHaveAttribute('aria-labelledby', label.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxLabelLinkedWithCombobox)
    throw err
  }
}

export async function assertComboboxButtonLinkedWithComboboxLabel(
  button = getComboboxButton(),
  label = getComboboxLabel()
) {
  try {
    await expect(button).toBePresent()
    await expect(label).toBePresent()

    // Ensure link between button & label is correct
    await expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${button.id}`)
  } catch (err) {
    if (err instanceof Error)
      Error.captureStackTrace(err, assertComboboxButtonLinkedWithComboboxLabel)
    throw err
  }
}

export async function assertActiveComboboxOption(
  item: HTMLElement | null,
  combobox = getComboboxInput()
) {
  try {
    await expect(combobox).toBePresent()
    await expect(item).toBePresent()

    // Ensure link between combobox & combobox item is correct
    await expect(combobox).toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertActiveComboboxOption)
    throw err
  }
}

export async function assertNotActiveComboboxOption(
  item: HTMLElement | null,
  combobox = getComboboxInput()
) {
  try {
    await expect(combobox).toBePresent()
    await expect(item).toBePresent()

    // Ensure link between combobox & combobox item does not exist
    await expect(combobox).not.toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNotActiveComboboxOption)
    throw err
  }
}

export async function assertNoActiveComboboxOption(combobox = getComboboxInput()) {
  try {
    await expect(combobox).toBePresent()

    // Ensure we don't have an active combobox
    await expect(combobox).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoActiveComboboxOption)
    throw err
  }
}

export async function assertNoSelectedComboboxOption(items = getComboboxOptions()) {
  try {
    for (let item of items) await expect(item).not.toHaveAttribute('aria-selected')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoSelectedComboboxOption)
    throw err
  }
}

export async function assertComboboxOption(
  item: HTMLElement | null,
  options?: {
    tag?: string
    attributes?: Record<string, string | null>
    selected?: boolean
  }
) {
  try {
    await expect(item).toBePresent()

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    await expect(item).toHaveAttribute('id')

    // Check that we have the correct values for certain attributes
    await expect(item).toHaveAttribute('role', 'option')
    if (!item.getAttribute('aria-disabled')) await expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure combobox button has the following attributes
    if (!options) return

    for (let attributeName in options.attributes) {
      await expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
    }

    if (options.tag) {
      await expect(item.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.selected != null) {
      switch (options.selected) {
        case true:
          return await expect(item).toHaveAttribute('aria-selected', 'true')

        case false:
          return await expect(item).not.toHaveAttribute('aria-selected')

        default:
          assertNever(options.selected)
      }
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxOption)
    throw err
  }
}

// ---

export function getListboxLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-listbox-label"]')
}

export function getListboxButton(): HTMLElement | null {
  return document.querySelector('button,[role="button"],[id^="headlessui-listbox-button-"]')
}

export function getListboxButtons(): HTMLElement[] {
  return Array.from(document.querySelectorAll('button,[role="button"]'))
}

export function getListbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]')
}

export function getListboxes(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="listbox"]'))
}

export function getListboxOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="option"]'))
}

// ---

export enum ListboxState {
  /** The listbox is visible to the user. */
  Visible,

  /** The listbox is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The listbox is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

export enum ListboxMode {
  /** The listbox is in the `single` mode. */
  Single,

  /** The listbox is in the `multiple` mode. */
  Multiple,
}

export async function assertListbox(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ListboxState
    mode?: ListboxMode
    orientation?: 'horizontal' | 'vertical'
  },
  listbox = getListbox()
) {
  let { orientation = 'vertical' } = options

  try {
    switch (options.state) {
      case ListboxState.InvisibleHidden:
        await expect(listbox).toBePresent()

        await assertHidden(listbox)

        await expect(listbox).toHaveAttribute('aria-labelledby')
        await expect(listbox).toHaveAttribute('aria-orientation', orientation)
        await expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) await expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ListboxState.Visible:
        await expect(listbox).toBePresent()

        await assertVisible(listbox)

        await expect(listbox).toHaveAttribute('aria-labelledby')
        await expect(listbox).toHaveAttribute('aria-orientation', orientation)
        await expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.mode && options.mode === ListboxMode.Multiple) {
          await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
        }

        if (options.textContent) await expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ListboxState.InvisibleUnmounted:
        await expect(listbox).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListbox)
    throw err
  }
}

export async function assertListboxButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ListboxState
  },
  button = getListboxButton()
) {
  try {
    await expect(button).toBePresent()

    // Ensure menu button have these properties
    await expect(button).toHaveAttribute('id')
    await expect(button).toHaveAttribute('aria-haspopup')

    switch (options.state) {
      case ListboxState.Visible:
        await expect(button).toHaveAttribute('aria-controls')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case ListboxState.InvisibleHidden:
        await expect(button).toHaveAttribute('aria-controls')
        if (await button.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case ListboxState.InvisibleUnmounted:
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

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxButton)
    throw err
  }
}

export async function assertListboxLabel(
  options: {
    attributes?: Record<string, string | null>
    tag?: string
    textContent?: string
  },
  label = getListboxLabel()
) {
  try {
    await expect(label).toBePresent()

    // Ensure menu button have these properties
    await expect(label).toHaveAttribute('id')

    if (options.textContent) {
      await expect(label).toHaveTextContent(options.textContent)
    }

    if (options.tag) {
      await expect(label.tagName.toLowerCase()).toBe(options.tag)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(label).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxLabel)
    throw err
  }
}

export async function assertListboxButtonLinkedWithListbox(
  button = getListboxButton(),
  listbox = getListbox()
) {
  try {
    await expect(button).toBePresent()
    await expect(listbox).toBePresent()

    // Ensure link between button & listbox is correct
    await expect(button).toHaveAttribute('aria-controls', listbox.getAttribute('id'))
    await expect(listbox).toHaveAttribute('aria-labelledby', button.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxButtonLinkedWithListbox)
    throw err
  }
}

export async function assertListboxLabelLinkedWithListbox(
  label = getListboxLabel(),
  listbox = getListbox()
) {
  try {
    await expect(label).toBePresent()
    await expect(listbox).toBePresent()

    await expect(listbox).toHaveAttribute('aria-labelledby', label.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxLabelLinkedWithListbox)
    throw err
  }
}

export async function assertListboxButtonLinkedWithListboxLabel(
  button = getListboxButton(),
  label = getListboxLabel()
) {
  try {
    await expect(button).toBePresent()
    await expect(label).toBePresent()

    // Ensure link between button & label is correct
    await expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${button.id}`)
  } catch (err) {
    if (err instanceof Error)
      Error.captureStackTrace(err, assertListboxButtonLinkedWithListboxLabel)
    throw err
  }
}

export async function assertActiveListboxOption(item: HTMLElement | null, listbox = getListbox()) {
  try {
    await expect(listbox).toBePresent()
    await expect(item).toBePresent()

    // Ensure link between listbox & listbox item is correct
    await expect(listbox).toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertActiveListboxOption)
    throw err
  }
}

export async function assertNoActiveListboxOption(listbox = getListbox()) {
  try {
    await expect(listbox).toBePresent()

    // Ensure we don't have an active listbox
    await expect(listbox).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoActiveListboxOption)
    throw err
  }
}

export async function assertNoSelectedListboxOption(items = getListboxOptions()) {
  try {
    for (let item of items) await expect(item).not.toHaveAttribute('aria-selected')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoSelectedListboxOption)
    throw err
  }
}

export async function assertListboxOption(
  item: HTMLElement | null,
  options?: {
    tag?: string
    attributes?: Record<string, string | null>
    selected?: boolean
  }
) {
  try {
    await expect(item).toBePresent()

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    await expect(item).toHaveAttribute('id')

    // Check that we have the correct values for certain attributes
    await expect(item).toHaveAttribute('role', 'option')
    if (!item.getAttribute('aria-disabled')) await expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure listbox button has the following attributes
    if (!options) return

    for (let attributeName in options.attributes) {
      await expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
    }

    if (options.tag) {
      await expect(item.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.selected != null) {
      switch (options.selected) {
        case true:
          return await expect(item).toHaveAttribute('aria-selected', 'true')

        case false:
          return await expect(item).not.toHaveAttribute('aria-selected')

        default:
          assertNever(options.selected)
      }
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxOption)
    throw err
  }
}

// ---

export function getSwitch(): HTMLElement | null {
  return document.querySelector('[role="switch"]')
}

export function getSwitchLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-switch-label"]')
}

// ---

export enum SwitchState {
  On,
  Off,
}

export async function assertSwitch(
  options: {
    state: SwitchState
    tag?: string
    textContent?: string
    label?: string
    description?: string
  },
  switchElement = getSwitch()
) {
  try {
    await expect(switchElement).toBePresent()

    await expect(switchElement).toHaveAttribute('role', 'switch')
    await expect(switchElement).toHaveAttribute('tabindex', '0')

    if (options.textContent) {
      await expect(switchElement).toHaveTextContent(options.textContent)
    }

    if (options.tag) {
      await expect(switchElement.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.label) {
      await assertLabelValue(switchElement, options.label)
    }

    if (options.description) {
      await assertDescriptionValue(switchElement, options.description)
    }

    switch (options.state) {
      case SwitchState.On:
        await expect(switchElement).toHaveAttribute('aria-checked', 'true')
        break

      case SwitchState.Off:
        await expect(switchElement).toHaveAttribute('aria-checked', 'false')
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertSwitch)
    throw err
  }
}

// ---

export function getDisclosureButton(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-disclosure-button-"]')
}

export function getDisclosurePanel(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-disclosure-panel-"]')
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

export async function assertDisclosureButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DisclosureState
  },
  button = getDisclosureButton()
) {
  try {
    await expect(button).toBePresent()

    // Ensure disclosure button have these properties
    await expect(button).toHaveAttribute('id')

    switch (options.state) {
      case DisclosureState.Visible:
        await expect(button).toHaveAttribute('aria-controls')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case DisclosureState.InvisibleHidden:
        await expect(button).toHaveAttribute('aria-controls')
        if (await button?.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case DisclosureState.InvisibleUnmounted:
        await expect(button).not.toHaveAttribute('aria-controls')
        if (await button?.hasAttribute('disabled')) {
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

export async function assertDisclosurePanel(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DisclosureState
  },
  panel = getDisclosurePanel()
) {
  try {
    switch (options.state) {
      case DisclosureState.InvisibleHidden:
        await expect(panel).toBePresent()

        await assertHidden(panel)

        if (options.textContent) await expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DisclosureState.Visible:
        await expect(panel).toBePresent()

        await assertVisible(panel)

        if (options.textContent) await expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DisclosureState.InvisibleUnmounted:
        await expect(panel).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDisclosurePanel)
    throw err
  }
}

// ---

export function getPopoverButton(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-popover-button-"]')
}

export function getPopoverPanel(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-popover-panel-"]')
}

export function getPopoverOverlay(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-popover-overlay-"]')
}

// ---

export enum PopoverState {
  /** The popover is visible to the user. */
  Visible,

  /** The popover is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The popover is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

// ---

export async function assertPopoverButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: PopoverState
  },
  button = getPopoverButton()
) {
  try {
    await expect(button).toBePresent()

    // Ensure popover button have these properties
    await expect(button).toHaveAttribute('id')

    switch (options.state) {
      case PopoverState.Visible:
        await expect(button).toHaveAttribute('aria-controls')
        await expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case PopoverState.InvisibleHidden:
        await expect(button).toHaveAttribute('aria-controls')
        if (await button.hasAttribute('disabled')) {
          await expect(button).not.toHaveAttribute('aria-expanded')
        } else {
          await expect(button).toHaveAttribute('aria-expanded', 'false')
        }
        break

      case PopoverState.InvisibleUnmounted:
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

    // Ensure popover button has the following attributes
    for (let attributeName in options.attributes) {
      await expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertPopoverButton)
    throw err
  }
}

export async function assertPopoverPanel(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: PopoverState
  },
  panel = getPopoverPanel()
) {
  try {
    switch (options.state) {
      case PopoverState.InvisibleHidden:
        await expect(panel).toBePresent()

        await assertHidden(panel)

        if (options.textContent) await expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case PopoverState.Visible:
        await expect(panel).toBePresent()

        await assertVisible(panel)

        if (options.textContent) await expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case PopoverState.InvisibleUnmounted:
        await expect(panel).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertPopoverPanel)
    throw err
  }
}

// ---

export async function assertLabelValue(
  element: HTMLElement | null | Promise<HTMLElement | null>,
  value: string
) {
  await expect(await element).toBePresent()

  if (await element.hasAttribute('aria-labelledby')) {
    let ids = element.getAttribute('aria-labelledby')!.split(' ')
    await expect(ids.map((id) => document.getElementById(id)?.textContent).join(' ')).toEqual(value)
    return
  }

  if (await element.hasAttribute('aria-label')) {
    await expect(await element).toHaveAttribute('aria-label', value)
    return
  }

  if (
    (await element.hasAttribute('id')) &&
    document.querySelectorAll(`[for="${element.id}"]`).length > 0
  ) {
    await expect(document.querySelector(`[for="${element.id}"]`)).toHaveTextContent(value)
    return
  }

  await expect(await element).toHaveTextContent(value)
}

// ---

export async function assertDescriptionValue(
  element: HTMLElement | null | Promise<HTMLElement | null>,
  value: string
) {
  await expect(await element).toBePresent()

  let id = element.getAttribute('aria-describedby')!
  await expect(document.getElementById(id)?.textContent).toEqual(value)
}

// ---

export function getDialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"]')
}

export function getDialogs(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="dialog"]'))
}

export function getDialogTitle(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-dialog-title-"]')
}

export function getDialogDescription(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-description-"]')
}

export function getDialogOverlay(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-dialog-overlay-"]')
}

export function getDialogBackdrop(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-dialog-backdrop-"]')
}

export function getDialogOverlays(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[id^="headlessui-dialog-overlay-"]'))
}

// ---

export enum DialogState {
  /** The dialog is visible to the user. */
  Visible,

  /** The dialog is **not** visible to the user. It's still in the DOM, but it is hidden. */
  InvisibleHidden,

  /** The dialog is **not** visible to the user. It's not in the DOM, it is unmounted. */
  InvisibleUnmounted,
}

// ---

export async function assertDialog(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DialogState
  },
  dialog = getDialog()
) {
  try {
    switch (options.state) {
      case DialogState.InvisibleHidden:
        await expect(dialog).toBePresent()

        await assertHidden(dialog)

        await expect(dialog).toHaveAttribute('role', 'dialog')
        await expect(dialog).not.toHaveAttribute('aria-modal', 'true')

        if (options.textContent) await expect(dialog).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(dialog).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        await expect(dialog).toBePresent()

        await assertVisible(dialog)

        await expect(dialog).toHaveAttribute('role', 'dialog')
        await expect(dialog).toHaveAttribute('aria-modal', 'true')

        if (options.textContent) await expect(dialog).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(dialog).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        await expect(dialog).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialog)
    throw err
  }
}

export async function assertDialogTitle(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DialogState
  },
  title = getDialogTitle(),
  dialog = getDialog()
) {
  try {
    switch (options.state) {
      case DialogState.InvisibleHidden:
        await expect(title).toBePresent()
        await expect(dialog).toBePresent()

        await assertHidden(title)

        await expect(title).toHaveAttribute('id')
        await expect(dialog).toHaveAttribute('aria-labelledby', title.id)

        if (options.textContent) await expect(title).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(title).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        await expect(title).toBePresent()
        await expect(dialog).toBePresent()

        await assertVisible(title)

        await expect(title).toHaveAttribute('id')
        await expect(dialog).toHaveAttribute('aria-labelledby', title.id)

        if (options.textContent) await expect(title).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(title).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        await expect(title).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialogTitle)
    throw err
  }
}

export async function assertDialogDescription(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DialogState
  },
  description = getDialogDescription(),
  dialog = getDialog()
) {
  try {
    switch (options.state) {
      case DialogState.InvisibleHidden:
        await expect(description).toBePresent()
        await expect(dialog).toBePresent()

        await assertHidden(description)

        await expect(description).toHaveAttribute('id')
        await expect(dialog).toHaveAttribute('aria-describedby', description.id)

        if (options.textContent) await expect(description).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(description).toHaveAttribute(
            attributeName,
            options.attributes[attributeName]
          )
        }
        break

      case DialogState.Visible:
        await expect(description).toBePresent()
        await expect(dialog).toBePresent()

        await assertVisible(description)

        await expect(description).toHaveAttribute('id')
        await expect(dialog).toHaveAttribute('aria-describedby', description.id)

        if (options.textContent) await expect(description).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(description).toHaveAttribute(
            attributeName,
            options.attributes[attributeName]
          )
        }
        break

      case DialogState.InvisibleUnmounted:
        await expect(description).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialogDescription)
    throw err
  }
}

export async function assertDialogOverlay(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: DialogState
  },
  overlay = getDialogOverlay()
) {
  try {
    switch (options.state) {
      case DialogState.InvisibleHidden:
        await expect(overlay).toBePresent()

        await assertHidden(overlay)

        if (options.textContent) await expect(overlay).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(overlay).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        await expect(overlay).toBePresent()

        await assertVisible(overlay)

        if (options.textContent) await expect(overlay).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          await expect(overlay).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        await expect(overlay).not.toBePresent()
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialogOverlay)
    throw err
  }
}

// ---

export function getRadioGroup(): HTMLElement | null {
  return document.querySelector('[role="radiogroup"]')
}

export function getRadioGroupLabel(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-label-"]')
}

export function getRadioGroupOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[id^="headlessui-radiogroup-option-"]'))
}

// ---

export async function assertRadioGroupLabel(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
  },
  label = getRadioGroupLabel(),
  radioGroup = getRadioGroup()
) {
  try {
    await expect(label).toBePresent()
    await expect(radioGroup).toBePresent()

    await expect(label).toHaveAttribute('id')
    await expect(radioGroup).toHaveAttribute('aria-labelledby', label.id)

    if (options.textContent) await expect(label).toHaveTextContent(options.textContent)

    for (let attributeName in options.attributes) {
      await expect(label).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertRadioGroupLabel)
    throw err
  }
}

// ---

export function getTabList(): HTMLElement | null {
  return document.querySelector('[role="tablist"]')
}

export function getTabs(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[id^="headlessui-tabs-tab-"]'))
}

export function getPanels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[id^="headlessui-tabs-panel-"]'))
}

// ---

export async function assertTabs(
  {
    active,
    orientation = 'horizontal',
  }: {
    active: number
    orientation?: 'vertical' | 'horizontal'
  },
  list = getTabList(),
  tabs = getTabs(),
  panels = getPanels()
) {
  try {
    await expect(list).toBePresent()

    await expect(list).toHaveAttribute('role', 'tablist')
    await expect(list).toHaveAttribute('aria-orientation', orientation)

    let activeTab = Array.from(list.querySelectorAll('[id^="headlessui-tabs-tab-"]'))[active]
    let activePanel = panels.find((panel) => panel.id === activeTab.getAttribute('aria-controls'))

    for (let tab of tabs) {
      await expect(tab).toHaveAttribute('id')
      await expect(tab).toHaveAttribute('role', 'tab')
      await expect(tab).toHaveAttribute('type', 'button')

      if (tab === activeTab) {
        await expect(tab).toHaveAttribute('aria-selected', 'true')
        await expect(tab).toHaveAttribute('tabindex', '0')
      } else {
        await expect(tab).toHaveAttribute('aria-selected', 'false')
        await expect(tab).toHaveAttribute('tabindex', '-1')
      }

      if (await tab.hasAttribute('aria-controls')) {
        let controlsId = tab.getAttribute('aria-controls')!
        let panel = document.getElementById(controlsId)

        await expect(panel).toBePresent()
        await expect(panels).toContain(panel)
        await expect(panel).toHaveAttribute('aria-labelledby', tab.id)
      }
    }

    for (let panel of panels) {
      await expect(panel).toHaveAttribute('id')
      await expect(panel).toHaveAttribute('role', 'tabpanel')

      let controlledById = panel.getAttribute('aria-labelledby')!
      let tab = document.getElementById(controlledById)

      await expect(tabs).toContain(tab)
      await expect(tab).toHaveAttribute('aria-controls', panel.id)

      if (panel === activePanel) {
        await expect(panel).toHaveAttribute('tabindex', '0')
      } else {
        await expect(panel).toHaveAttribute('tabindex', '-1')
      }
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertTabs)
    throw err
  }
}

// ---

export async function assertActiveElement(
  element: HTMLElement | null | Promise<HTMLElement | null>
) {
  try {
    await expect(await element).toBePresent()
    try {
      // Jest has a weird bug:
      //   "Cannot assign to read only property 'Symbol(impl)' of object '[object DOMImplementation]'"
      // when this assertion fails.
      // Therefore we will catch it when something goes wrong, and just look at the outerHTML string.
      await expect(document.activeElement).toBe(element)
    } catch (err) {
      await expect(document.activeElement?.outerHTML).toBe(element.outerHTML)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertActiveElement)
    throw err
  }
}

export async function assertContainsActiveElement(
  element: HTMLElement | null | Promise<HTMLElement | null>
) {
  try {
    await expect(await element).toBePresent()
    await expect(element.contains(document.activeElement)).toBe(true)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertContainsActiveElement)
    throw err
  }
}

// ---

export async function assertHidden(element: HTMLElement | null | Promise<HTMLElement | null>) {
  try {
    await expect(await element).toBePresent()

    await expect(await element).toHaveAttribute('hidden')
    await expect(await element).toHaveStyle({ display: 'none' }, { timeout: 0 })
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertHidden)
    throw err
  }
}

export async function assertVisible(element: HTMLElement | null | Promise<HTMLElement | null>) {
  try {
    await expect(await element).toBePresent()
    await expect(await element).not.toHaveAttribute('hidden')
    await expect(await element).not.toHaveStyle({ display: 'none' })
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertVisible)
    throw err
  }
}

// ---

export async function assertFocusable(element: HTMLElement | null | Promise<HTMLElement | null>) {
  try {
    await expect(await element).toBePresent()

    await expect(isFocusableElement(element, FocusableMode.Strict)).toBe(true)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertFocusable)
    throw err
  }
}

export async function assertNotFocusable(
  element: HTMLElement | null | Promise<HTMLElement | null>
) {
  try {
    await expect(await element).toBePresent()

    await expect(isFocusableElement(element, FocusableMode.Strict)).toBe(false)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNotFocusable)
    throw err
  }
}

// ---

export function getByText(text: string): HTMLElement | null {
  let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node: HTMLElement) {
      if (node.children.length > 0) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
  })

  while (walker.nextNode()) {
    if (walker.currentNode.textContent === text) return walker.currentNode as HTMLElement
  }

  return null
}
