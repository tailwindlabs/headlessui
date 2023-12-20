import { FocusableMode, isFocusableElement } from '../utils/focus-management'

function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

// ---

export function getLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-label-"]')
}

export function getLabels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('label,[id^="headlessui-label-"]'))
}

export function getDescription(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-description-"]')
}

export function getDescriptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[id^="headlessui-description-"]'))
}

export function getControl(): HTMLElement | null {
  return document.querySelector('[id^="headlessui-control-"]')
}

export function getInput(): HTMLElement | null {
  return document.querySelector('input')
}

export function getSelect(): HTMLElement | null {
  return document.querySelector('select')
}

export function getTextarea(): HTMLElement | null {
  return document.querySelector('textarea')
}

export function getCheckbox(): HTMLElement | null {
  return document.querySelector('input[type="checkbox"],[role="checkbox"]')
}

export enum CheckboxState {
  /** The checkbox is checked. */
  Checked,

  /** The checkbox is unchecked. */
  Unchecked,

  /** The checkbox is indeterminate. */
  Indeterminate,
}

export function assertCheckbox(
  options: {
    attributes?: Record<string, string | null>
    state: CheckboxState
  },
  checkbox = getCheckbox()
) {
  try {
    switch (options.state) {
      case CheckboxState.Checked:
        if (checkbox === null) return expect(checkbox).not.toBe(null)

        expect(checkbox).toHaveAttribute('aria-checked', 'true')
        expect(checkbox).toHaveAttribute('role', 'checkbox')
        expect(checkbox).toHaveAttribute('tabindex', '0')
        expect(checkbox).toHaveAttribute('data-checked')

        for (let attributeName in options.attributes) {
          expect(checkbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case CheckboxState.Unchecked:
        if (checkbox === null) return expect(checkbox).not.toBe(null)

        expect(checkbox).toHaveAttribute('aria-checked', 'false')
        expect(checkbox).toHaveAttribute('role', 'checkbox')
        expect(checkbox).toHaveAttribute('tabindex', '0')

        for (let attributeName in options.attributes) {
          expect(checkbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case CheckboxState.Indeterminate:
        if (checkbox === null) return expect(checkbox).not.toBe(null)

        expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
        expect(checkbox).toHaveAttribute('indeterminate', 'true')
        expect(checkbox).toHaveAttribute('role', 'checkbox')
        expect(checkbox).toHaveAttribute('tabindex', '0')
        expect(checkbox).toHaveAttribute('data-indeterminate')

        for (let attributeName in options.attributes) {
          expect(checkbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertCheckbox)
    throw err
  }
}

export function assertLinkedWithLabel(
  element: HTMLElement | null,
  label: HTMLElement | HTMLElement[]
) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    let labels = Array.isArray(label) ? label : [label]

    expect(element).toHaveAttribute('aria-labelledby')

    let labelledBy = new Set(element.getAttribute('aria-labelledby')?.split(' ') ?? [])
    for (let label of labels) {
      expect(labelledBy).toContain(label.id)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertLinkedWithLabel)
    throw err
  }
}

export function assertNotLinkedWithLabel(
  element: HTMLElement | null,
  label: HTMLElement | HTMLElement[]
) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    let labels = Array.isArray(label) ? label : [label]

    let labelledBy = new Set(element.getAttribute('aria-labelledby')?.split(' ') ?? [])
    for (let label of labels) {
      expect(labelledBy).not.toContain(label.id)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNotLinkedWithLabel)
    throw err
  }
}

export function assertLinkedWithDescription(
  element: HTMLElement | null,
  description: HTMLElement | HTMLElement[]
) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    let descriptions = Array.isArray(description) ? description : [description]

    expect(element).toHaveAttribute('aria-describedby')

    let descriptionledBy = new Set(element.getAttribute('aria-describedby')?.split(' ') ?? [])
    for (let description of descriptions) {
      expect(descriptionledBy).toContain(description.id)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertLinkedWithDescription)
    throw err
  }
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

export function assertMenuButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: MenuState
  },
  button = getMenuButton()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)

    // Ensure menu button have these properties
    expect(button).toHaveAttribute('id')
    expect(button).toHaveAttribute('aria-haspopup')

    switch (options.state) {
      case MenuState.Visible:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case MenuState.InvisibleHidden:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      case MenuState.InvisibleUnmounted:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      default:
        assertNever(options.state)
    }

    if (options.textContent) {
      expect(button).toHaveTextContent(options.textContent)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuButton)
    throw err
  }
}

export function assertMenuButtonLinkedWithMenu(button = getMenuButton(), menu = getMenu()) {
  try {
    if (button === null) return expect(button).not.toBe(null)
    if (menu === null) return expect(menu).not.toBe(null)

    // Ensure link between button & menu is correct
    expect(button).toHaveAttribute('aria-controls', menu.getAttribute('id'))
    expect(menu).toHaveAttribute('aria-labelledby', button.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuButtonLinkedWithMenu)
    throw err
  }
}

export function assertMenuLinkedWithMenuItem(item: HTMLElement | null, menu = getMenu()) {
  try {
    if (menu === null) return expect(menu).not.toBe(null)
    if (item === null) return expect(item).not.toBe(null)

    // Ensure link between menu & menu item is correct
    expect(menu).toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuLinkedWithMenuItem)
    throw err
  }
}

export function assertNoActiveMenuItem(menu = getMenu()) {
  try {
    if (menu === null) return expect(menu).not.toBe(null)

    // Ensure we don't have an active menu
    expect(menu).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoActiveMenuItem)
    throw err
  }
}

export function assertMenu(
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
        if (menu === null) return expect(menu).not.toBe(null)

        assertHidden(menu)

        expect(menu).toHaveAttribute('aria-labelledby')
        expect(menu).toHaveAttribute('role', 'menu')

        if (options.textContent) expect(menu).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(menu).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case MenuState.Visible:
        if (menu === null) return expect(menu).not.toBe(null)

        assertVisible(menu)

        expect(menu).toHaveAttribute('aria-labelledby')
        expect(menu).toHaveAttribute('role', 'menu')

        if (options.textContent) expect(menu).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(menu).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case MenuState.InvisibleUnmounted:
        expect(menu).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenu)
    throw err
  }
}

export function assertMenuItem(
  item: HTMLElement | null,
  options?: { tag?: string; attributes?: Record<string, string | null> }
) {
  try {
    if (item === null) return expect(item).not.toBe(null)

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    expect(item).toHaveAttribute('id')

    // Check that we have the correct values for certain attributes
    expect(item).toHaveAttribute('role', 'menuitem')
    if (!item.getAttribute('aria-disabled')) expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure menu button has the following attributes
    if (options) {
      for (let attributeName in options.attributes) {
        expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
      }

      if (options.tag) {
        expect(item.tagName.toLowerCase()).toBe(options.tag)
      }
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertMenuItem)
    throw err
  }
}

// ---

export function getComboboxLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-combobox-label"],[id^="headlessui-label"]')
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

export function assertCombobox(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ComboboxState
    mode?: ComboboxMode
  },
  combobox = getComboboxInput(),
  listbox = getListbox()
) {
  try {
    switch (options.state) {
      case ComboboxState.InvisibleHidden:
        if (combobox === null) return expect(combobox).not.toBe(null)

        assertHidden(combobox)

        expect(combobox).toHaveAttribute('role', 'combobox')

        if (options.textContent) expect(combobox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(combobox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.Visible:
        if (combobox === null) return expect(combobox).not.toBe(null)

        assertVisible(combobox)

        expect(combobox).toHaveAttribute('role', 'combobox')

        if (options.mode && options.mode === ComboboxMode.Multiple) {
          expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
        }

        if (options.textContent) expect(combobox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(combobox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.InvisibleUnmounted:
        expect(combobox).toBe(null)
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
        expect(input).toHaveAttribute('aria-expanded', 'false')
        break

      case ComboboxState.InvisibleUnmounted:
        expect(input).not.toHaveAttribute('aria-controls')
        expect(input).toHaveAttribute('aria-expanded', 'false')
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

export function assertComboboxList(
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
        if (listbox === null) return expect(listbox).not.toBe(null)

        assertHidden(listbox)

        expect(listbox).toHaveAttribute('aria-labelledby')
        expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.Visible:
        if (listbox === null) return expect(listbox).not.toBe(null)

        assertVisible(listbox)

        expect(listbox).toHaveAttribute('aria-labelledby')
        expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ComboboxState.InvisibleUnmounted:
        expect(listbox).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertCombobox)
    throw err
  }
}

export function assertComboboxButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ComboboxState
  },
  button = getComboboxButton()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)

    // Ensure menu button have these properties
    expect(button).toHaveAttribute('id')
    expect(button).toHaveAttribute('aria-haspopup')

    switch (options.state) {
      case ComboboxState.Visible:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case ComboboxState.InvisibleHidden:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      case ComboboxState.InvisibleUnmounted:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      default:
        assertNever(options.state)
    }

    if (options.textContent) {
      expect(button).toHaveTextContent(options.textContent)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxButton)
    throw err
  }
}

export function assertComboboxLabel(
  options: {
    attributes?: Record<string, string | null>
    tag?: string
    textContent?: string
  },
  label = getComboboxLabel()
) {
  try {
    if (label === null) return expect(label).not.toBe(null)

    // Ensure menu button have these properties
    expect(label).toHaveAttribute('id')

    if (options.textContent) {
      expect(label).toHaveTextContent(options.textContent)
    }

    if (options.tag) {
      expect(label.tagName.toLowerCase()).toBe(options.tag)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      expect(label).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxLabel)
    throw err
  }
}

export function assertComboboxButtonLinkedWithCombobox(
  button = getComboboxButton(),
  combobox = getCombobox()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)
    if (combobox === null) return expect(combobox).not.toBe(null)

    // Ensure link between button & combobox is correct
    expect(button).toHaveAttribute('aria-controls', combobox.getAttribute('id'))
    expect(combobox).toHaveAttribute('aria-labelledby', button.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxButtonLinkedWithCombobox)
    throw err
  }
}

export function assertComboboxLabelLinkedWithCombobox(
  label = getComboboxLabel(),
  combobox = getComboboxInput()
) {
  try {
    if (label === null) return expect(label).not.toBe(null)
    if (combobox === null) return expect(combobox).not.toBe(null)

    expect(combobox).toHaveAttribute('aria-labelledby', label.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxLabelLinkedWithCombobox)
    throw err
  }
}

export function assertComboboxButtonLinkedWithComboboxLabel(
  button = getComboboxButton(),
  label = getComboboxLabel()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)
    if (label === null) return expect(label).not.toBe(null)

    // Ensure link between button & label is correct
    expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${button.id}`)
  } catch (err) {
    if (err instanceof Error)
      Error.captureStackTrace(err, assertComboboxButtonLinkedWithComboboxLabel)
    throw err
  }
}

export function assertActiveComboboxOption(
  item: HTMLElement | null,
  combobox = getComboboxInput()
) {
  try {
    if (combobox === null) return expect(combobox).not.toBe(null)
    if (item === null) return expect(item).not.toBe(null)

    // Ensure link between combobox & combobox item is correct
    expect(combobox).toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertActiveComboboxOption)
    throw err
  }
}

export function assertNotActiveComboboxOption(
  item: HTMLElement | null,
  combobox = getComboboxInput()
) {
  try {
    if (combobox === null) return expect(combobox).not.toBe(null)
    if (item === null) return expect(item).not.toBe(null)

    // Ensure link between combobox & combobox item does not exist
    expect(combobox).not.toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNotActiveComboboxOption)
    throw err
  }
}

export function assertNoActiveComboboxOption(combobox = getComboboxInput()) {
  try {
    if (combobox === null) return expect(combobox).not.toBe(null)

    // Ensure we don't have an active combobox
    expect(combobox).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoActiveComboboxOption)
    throw err
  }
}

export function assertNoSelectedComboboxOption(items = getComboboxOptions()) {
  try {
    for (let item of items) expect(item).toHaveAttribute('aria-selected', 'false')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoSelectedComboboxOption)
    throw err
  }
}

export function assertComboboxOption(
  item: HTMLElement | null,
  options?: {
    tag?: string
    attributes?: Record<string, string | null>
    selected?: boolean
  }
) {
  try {
    if (item === null) return expect(item).not.toBe(null)

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    expect(item).toHaveAttribute('id')

    // Check that we have the correct values for certain attributes
    expect(item).toHaveAttribute('role', 'option')
    if (!item.getAttribute('aria-disabled')) expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure combobox button has the following attributes
    if (!options) return

    for (let attributeName in options.attributes) {
      expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
    }

    if (options.tag) {
      expect(item.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.selected != null) {
      return expect(item).toHaveAttribute('aria-selected', options.selected ? 'true' : 'false')
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertComboboxOption)
    throw err
  }
}

// ---

export function getListboxLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-listbox-label"],[id^="headlessui-label"]')
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

export function assertListbox(
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
        if (listbox === null) return expect(listbox).not.toBe(null)

        assertHidden(listbox)

        expect(listbox).toHaveAttribute('aria-labelledby')
        expect(listbox).toHaveAttribute('aria-orientation', orientation)
        expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ListboxState.Visible:
        if (listbox === null) return expect(listbox).not.toBe(null)

        assertVisible(listbox)

        expect(listbox).toHaveAttribute('aria-labelledby')
        expect(listbox).toHaveAttribute('aria-orientation', orientation)
        expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.mode && options.mode === ListboxMode.Multiple) {
          expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
        }

        if (options.textContent) expect(listbox).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ListboxState.InvisibleUnmounted:
        expect(listbox).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListbox)
    throw err
  }
}

export function assertListboxButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ListboxState
  },
  button = getListboxButton()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)

    // Ensure menu button have these properties
    expect(button).toHaveAttribute('id')
    expect(button).toHaveAttribute('aria-haspopup')

    switch (options.state) {
      case ListboxState.Visible:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case ListboxState.InvisibleHidden:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      case ListboxState.InvisibleUnmounted:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      default:
        assertNever(options.state)
    }

    if (options.textContent) {
      expect(button).toHaveTextContent(options.textContent)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxButton)
    throw err
  }
}

export function assertListboxLabel(
  options: {
    attributes?: Record<string, string | null>
    tag?: string
    textContent?: string
  },
  label = getListboxLabel()
) {
  try {
    if (label === null) return expect(label).not.toBe(null)

    // Ensure menu button have these properties
    expect(label).toHaveAttribute('id')

    if (options.textContent) {
      expect(label).toHaveTextContent(options.textContent)
    }

    if (options.tag) {
      expect(label.tagName.toLowerCase()).toBe(options.tag)
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      expect(label).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxLabel)
    throw err
  }
}

export function assertListboxButtonLinkedWithListbox(
  button = getListboxButton(),
  listbox = getListbox()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)
    if (listbox === null) return expect(listbox).not.toBe(null)

    // Ensure link between button & listbox is correct
    expect(button).toHaveAttribute('aria-controls', listbox.getAttribute('id'))
    expect(listbox).toHaveAttribute('aria-labelledby', button.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxButtonLinkedWithListbox)
    throw err
  }
}

export function assertListboxLabelLinkedWithListbox(
  label = getListboxLabel(),
  listbox = getListbox()
) {
  try {
    if (label === null) return expect(label).not.toBe(null)
    if (listbox === null) return expect(listbox).not.toBe(null)

    expect(listbox).toHaveAttribute('aria-labelledby', label.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertListboxLabelLinkedWithListbox)
    throw err
  }
}

export function assertListboxButtonLinkedWithListboxLabel(
  button = getListboxButton(),
  label = getListboxLabel()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)
    if (label === null) return expect(label).not.toBe(null)

    // Ensure link between button & label is correct
    expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${button.id}`)
  } catch (err) {
    if (err instanceof Error)
      Error.captureStackTrace(err, assertListboxButtonLinkedWithListboxLabel)
    throw err
  }
}

export function assertActiveListboxOption(item: HTMLElement | null, listbox = getListbox()) {
  try {
    if (listbox === null) return expect(listbox).not.toBe(null)
    if (item === null) return expect(item).not.toBe(null)

    // Ensure link between listbox & listbox item is correct
    expect(listbox).toHaveAttribute('aria-activedescendant', item.getAttribute('id'))
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertActiveListboxOption)
    throw err
  }
}

export function assertNoActiveListboxOption(listbox = getListbox()) {
  try {
    if (listbox === null) return expect(listbox).not.toBe(null)

    // Ensure we don't have an active listbox
    expect(listbox).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoActiveListboxOption)
    throw err
  }
}

export function assertNoSelectedListboxOption(items = getListboxOptions()) {
  try {
    for (let item of items) expect(item).toHaveAttribute('aria-selected', 'false')
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNoSelectedListboxOption)
    throw err
  }
}

export function assertListboxOption(
  item: HTMLElement | null,
  options?: {
    tag?: string
    attributes?: Record<string, string | null>
    selected?: boolean
  }
) {
  try {
    if (item === null) return expect(item).not.toBe(null)

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    expect(item).toHaveAttribute('id')

    // Check that we have the correct values for certain attributes
    expect(item).toHaveAttribute('role', 'option')
    if (!item.getAttribute('aria-disabled')) expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure listbox button has the following attributes
    if (!options) return

    for (let attributeName in options.attributes) {
      expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
    }

    if (options.tag) {
      expect(item.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.selected != null) {
      return expect(item).toHaveAttribute('aria-selected', options.selected ? 'true' : 'false')
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
  return document.querySelector('label,[id^="headlessui-switch-label"],[id^="headlessui-label"]')
}

// ---

export enum SwitchState {
  On,
  Off,
}

export function assertSwitch(
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
    if (switchElement === null) return expect(switchElement).not.toBe(null)

    expect(switchElement).toHaveAttribute('role', 'switch')
    expect(switchElement).toHaveAttribute('tabindex', '0')

    if (options.textContent) {
      expect(switchElement).toHaveTextContent(options.textContent)
    }

    if (options.tag) {
      expect(switchElement.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.label) {
      assertLabelValue(switchElement, options.label)
    }

    if (options.description) {
      assertDescriptionValue(switchElement, options.description)
    }

    switch (options.state) {
      case SwitchState.On:
        expect(switchElement).toHaveAttribute('aria-checked', 'true')
        break

      case SwitchState.Off:
        expect(switchElement).toHaveAttribute('aria-checked', 'false')
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

export function assertDisclosureButton(
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
    expect(button).toHaveAttribute('id')

    switch (options.state) {
      case DisclosureState.Visible:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case DisclosureState.InvisibleHidden:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      case DisclosureState.InvisibleUnmounted:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      default:
        assertNever(options.state)
    }

    if (options.textContent) {
      expect(button).toHaveTextContent(options.textContent)
    }

    // Ensure disclosure button has the following attributes
    for (let attributeName in options.attributes) {
      expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDisclosureButton)
    throw err
  }
}

export function assertDisclosurePanel(
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
        if (panel === null) return expect(panel).not.toBe(null)

        assertHidden(panel)

        if (options.textContent) expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DisclosureState.Visible:
        if (panel === null) return expect(panel).not.toBe(null)

        assertVisible(panel)

        if (options.textContent) expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DisclosureState.InvisibleUnmounted:
        expect(panel).toBe(null)
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

export function assertPopoverButton(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: PopoverState
  },
  button = getPopoverButton()
) {
  try {
    if (button === null) return expect(button).not.toBe(null)

    // Ensure popover button have these properties
    expect(button).toHaveAttribute('id')

    switch (options.state) {
      case PopoverState.Visible:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case PopoverState.InvisibleHidden:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      case PopoverState.InvisibleUnmounted:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'false')
        break

      default:
        assertNever(options.state)
    }

    if (options.textContent) {
      expect(button).toHaveTextContent(options.textContent)
    }

    // Ensure popover button has the following attributes
    for (let attributeName in options.attributes) {
      expect(button).toHaveAttribute(attributeName, options.attributes[attributeName])
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertPopoverButton)
    throw err
  }
}

export function assertPopoverPanel(
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
        if (panel === null) return expect(panel).not.toBe(null)

        assertHidden(panel)

        if (options.textContent) expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case PopoverState.Visible:
        if (panel === null) return expect(panel).not.toBe(null)

        assertVisible(panel)

        if (options.textContent) expect(panel).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(panel).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case PopoverState.InvisibleUnmounted:
        expect(panel).toBe(null)
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

export function assertLabelValue(element: HTMLElement | null, value: string) {
  if (element === null) return expect(element).not.toBe(null)

  if (element.hasAttribute('aria-labelledby')) {
    let ids = element.getAttribute('aria-labelledby')!.split(' ')
    expect(ids.map((id) => document.getElementById(id)?.textContent).join(' ')).toEqual(value)
    return
  }

  if (element.hasAttribute('aria-label')) {
    expect(element).toHaveAttribute('aria-label', value)
    return
  }

  if (element.hasAttribute('id') && document.querySelectorAll(`[for="${element.id}"]`).length > 0) {
    expect(document.querySelector(`[for="${element.id}"]`)).toHaveTextContent(value)
    return
  }

  expect(element).toHaveTextContent(value)
}

// ---

export function assertDescriptionValue(element: HTMLElement | null, value: string) {
  if (element === null) return expect(element).not.toBe(null)

  let id = element.getAttribute('aria-describedby')!
  expect(document.getElementById(id)?.textContent).toEqual(value)
}

// ---

export function getDialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"],[role="alertdialog"]')
}

export function getDialogs(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="dialog"],[role="alertdialog"]'))
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

export function assertDialog(
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
        if (dialog === null) return expect(dialog).not.toBe(null)

        assertHidden(dialog)

        expect(dialog).toHaveAttribute('role', options.attributes?.['role'] ?? 'dialog')
        expect(dialog).not.toHaveAttribute('aria-modal', 'true')

        if (options.textContent) expect(dialog).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(dialog).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        if (dialog === null) return expect(dialog).not.toBe(null)

        assertVisible(dialog)

        expect(dialog).toHaveAttribute('role', options.attributes?.['role'] ?? 'dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')

        if (options.textContent) expect(dialog).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(dialog).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        expect(dialog).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialog)
    throw err
  }
}

export function assertDialogTitle(
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
        if (title === null) return expect(title).not.toBe(null)
        if (dialog === null) return expect(dialog).not.toBe(null)

        assertHidden(title)

        expect(title).toHaveAttribute('id')
        expect(dialog).toHaveAttribute('aria-labelledby', title.id)

        if (options.textContent) expect(title).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(title).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        if (title === null) return expect(title).not.toBe(null)
        if (dialog === null) return expect(dialog).not.toBe(null)

        assertVisible(title)

        expect(title).toHaveAttribute('id')
        expect(dialog).toHaveAttribute('aria-labelledby', title.id)

        if (options.textContent) expect(title).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(title).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        expect(title).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialogTitle)
    throw err
  }
}

export function assertDialogDescription(
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
        if (description === null) return expect(description).not.toBe(null)
        if (dialog === null) return expect(dialog).not.toBe(null)

        assertHidden(description)

        expect(description).toHaveAttribute('id')
        expect(dialog).toHaveAttribute('aria-describedby', description.id)

        if (options.textContent) expect(description).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(description).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        if (description === null) return expect(description).not.toBe(null)
        if (dialog === null) return expect(dialog).not.toBe(null)

        assertVisible(description)

        expect(description).toHaveAttribute('id')
        expect(dialog).toHaveAttribute('aria-describedby', description.id)

        if (options.textContent) expect(description).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(description).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        expect(description).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDialogDescription)
    throw err
  }
}

export function assertDialogOverlay(
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
        if (overlay === null) return expect(overlay).not.toBe(null)

        assertHidden(overlay)

        if (options.textContent) expect(overlay).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(overlay).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.Visible:
        if (overlay === null) return expect(overlay).not.toBe(null)

        assertVisible(overlay)

        if (options.textContent) expect(overlay).toHaveTextContent(options.textContent)

        for (let attributeName in options.attributes) {
          expect(overlay).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case DialogState.InvisibleUnmounted:
        expect(overlay).toBe(null)
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
  return document.querySelector('label,[id^="headlessui-label-"]')
}

export function getRadioGroupOptions(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[id^="headlessui-radiogroup-option-"]'))
}

// ---

export function assertRadioGroupLabel(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
  },
  label = getRadioGroupLabel(),
  radioGroup = getRadioGroup()
) {
  try {
    if (label === null) return expect(label).not.toBe(null)
    if (radioGroup === null) return expect(radioGroup).not.toBe(null)

    expect(label).toHaveAttribute('id')
    expect(radioGroup).toHaveAttribute('aria-labelledby', label.id)

    if (options.textContent) expect(label).toHaveTextContent(options.textContent)

    for (let attributeName in options.attributes) {
      expect(label).toHaveAttribute(attributeName, options.attributes[attributeName])
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

export function assertTabs(
  {
    active,
    orientation = 'horizontal',
    tabContents = null,
    panelContents = null,
  }: {
    active: number
    orientation?: 'vertical' | 'horizontal'
    tabContents?: string | null
    panelContents?: string | null
  },
  list = getTabList(),
  tabs = getTabs(),
  panels = getPanels()
) {
  try {
    if (list === null) return expect(list).not.toBe(null)

    expect(list).toHaveAttribute('role', 'tablist')
    expect(list).toHaveAttribute('aria-orientation', orientation)

    let activeTab = Array.from(list.querySelectorAll('[id^="headlessui-tabs-tab-"]'))[active]
    let activePanel = panels.find((panel) => panel.id === activeTab.getAttribute('aria-controls'))

    for (let tab of tabs) {
      expect(tab).toHaveAttribute('id')
      expect(tab).toHaveAttribute('role', 'tab')
      expect(tab).toHaveAttribute('type', 'button')

      if (tab === activeTab) {
        expect(tab).toHaveAttribute('aria-selected', 'true')
        expect(tab).toHaveAttribute('tabindex', '0')
        if (tabContents !== null) {
          expect(tab.textContent).toBe(tabContents)
        }
      } else {
        expect(tab).toHaveAttribute('aria-selected', 'false')
        expect(tab).toHaveAttribute('tabindex', '-1')
      }

      if (tab.hasAttribute('aria-controls')) {
        let controlsId = tab.getAttribute('aria-controls')!
        let panel = document.getElementById(controlsId)

        expect(panel).not.toBe(null)
        expect(panels).toContain(panel)
        expect(panel).toHaveAttribute('aria-labelledby', tab.id)
      }
    }

    for (let panel of panels) {
      expect(panel).toHaveAttribute('id')
      expect(panel).toHaveAttribute('role', 'tabpanel')

      let controlledById = panel.getAttribute('aria-labelledby')!
      let tab = document.getElementById(controlledById)

      expect(tabs).toContain(tab)
      expect(tab).toHaveAttribute('aria-controls', panel.id)

      if (panel === activePanel) {
        expect(panel).toHaveAttribute('tabindex', '0')
        if (tabContents !== null) {
          expect(panel.textContent).toBe(panelContents)
        }
      } else {
        expect(panel).toHaveAttribute('tabindex', '-1')
      }
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertTabs)
    throw err
  }
}

// ---

export function assertActiveElement(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)
    try {
      // Jest has a weird bug:
      //   "Cannot assign to read only property 'Symbol(impl)' of object '[object DOMImplementation]'"
      // when this assertion fails.
      // Therefore we will catch it when something goes wrong, and just look at the outerHTML string.
      expect(document.activeElement).toBe(element)
    } catch (err) {
      expect(document.activeElement?.outerHTML).toBe(element.outerHTML)
    }
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertActiveElement)
    throw err
  }
}

export function assertContainsActiveElement(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)
    expect(element.contains(document.activeElement)).toBe(true)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertContainsActiveElement)
    throw err
  }
}

// ---

export function assertHidden(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    expect(element).toHaveAttribute('hidden')
    expect(element).toHaveStyle({ display: 'none' })
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertHidden)
    throw err
  }
}

export function assertVisible(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    expect(element).not.toHaveAttribute('hidden')
    expect(element).not.toHaveStyle({ display: 'none' })
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertVisible)
    throw err
  }
}

// ---

export function assertFocusable(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    expect(isFocusableElement(element, FocusableMode.Strict)).toBe(true)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertFocusable)
    throw err
  }
}

export function assertNotFocusable(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    expect(isFocusableElement(element, FocusableMode.Strict)).toBe(false)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNotFocusable)
    throw err
  }
}

export function assertInert(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    expect(element).toHaveAttribute('aria-hidden', 'true')
    expect(element).toHaveProperty('inert', true)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertInert)
    throw err
  }
}

export function assertNotInert(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    // NOTE: We can't test that the element doesn't have `aria-hidden`, because this can still be
    // the case even if they are not inert.
    expect(element.inert).toBeUndefined()
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertNotInert)
    throw err
  }
}

// ---

export function assertDisabledish(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)

    let actuallyDisabled = element.getAttribute('disabled')
    if (actuallyDisabled === 'true' || actuallyDisabled === '') {
      return
    }

    let ariaDisabled = element.getAttribute('aria-disabled')
    if (ariaDisabled === 'true' || ariaDisabled === '') {
      return
    }

    throw new Error(`Expected element to be disabledish, but it wasn't.`)
  } catch (err) {
    if (err instanceof Error) Error.captureStackTrace(err, assertDisabledish)
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
