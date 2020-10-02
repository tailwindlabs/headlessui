function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

// ---

export function getMenuButton(): HTMLElement | null {
  return document.querySelector('button,[role="button"]')
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
  Open,
  Closed,
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
      case MenuState.Open:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case MenuState.Closed:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).not.toHaveAttribute('aria-expanded')
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
    Error.captureStackTrace(err, assertMenuButton)
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
    Error.captureStackTrace(err, assertMenuButtonLinkedWithMenu)
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
    Error.captureStackTrace(err, assertMenuLinkedWithMenuItem)
    throw err
  }
}

export function assertNoActiveMenuItem(menu = getMenu()) {
  try {
    if (menu === null) return expect(menu).not.toBe(null)

    // Ensure we don't have an active menu
    expect(menu).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    Error.captureStackTrace(err, assertNoActiveMenuItem)
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
      case MenuState.Open:
        if (menu === null) return expect(menu).not.toBe(null)

        // Check that some attributes exists, doesn't really matter what the values are at this point in
        // time, we just require them.
        expect(menu).toHaveAttribute('aria-labelledby')

        // Check that we have the correct values for certain attributes
        expect(menu).toHaveAttribute('role', 'menu')

        if (options.textContent) {
          expect(menu).toHaveTextContent(options.textContent)
        }

        // Ensure menu button has the following attributes
        for (let attributeName in options.attributes) {
          expect(menu).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case MenuState.Closed:
        expect(menu).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    Error.captureStackTrace(err, assertMenu)
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
    expect(item).toHaveAttribute('tabindex', '-1')

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
    Error.captureStackTrace(err, assertMenuItem)
    throw err
  }
}

// ---

export function getListboxLabel(): HTMLElement | null {
  return document.querySelector('label,[id^="headlessui-listbox-label"]')
}

export function getListboxButton(): HTMLElement | null {
  return document.querySelector('button,[role="button"]')
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
  Open,
  Closed,
}

export function assertListbox(
  options: {
    attributes?: Record<string, string | null>
    textContent?: string
    state: ListboxState
  },
  listbox = getListbox()
) {
  try {
    switch (options.state) {
      case ListboxState.Open:
        if (listbox === null) return expect(listbox).not.toBe(null)

        // Check that some attributes exists, doesn't really matter what the values are at this point in
        // time, we just require them.
        expect(listbox).toHaveAttribute('aria-labelledby')

        // Check that we have the correct values for certain attributes
        expect(listbox).toHaveAttribute('role', 'listbox')

        if (options.textContent) {
          expect(listbox).toHaveTextContent(options.textContent)
        }

        // Ensure listbox button has the following attributes
        for (let attributeName in options.attributes) {
          expect(listbox).toHaveAttribute(attributeName, options.attributes[attributeName])
        }
        break

      case ListboxState.Closed:
        expect(listbox).toBe(null)
        break

      default:
        assertNever(options.state)
    }
  } catch (err) {
    Error.captureStackTrace(err, assertListbox)
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
      case ListboxState.Open:
        expect(button).toHaveAttribute('aria-controls')
        expect(button).toHaveAttribute('aria-expanded', 'true')
        break

      case ListboxState.Closed:
        expect(button).not.toHaveAttribute('aria-controls')
        expect(button).not.toHaveAttribute('aria-expanded')
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
    Error.captureStackTrace(err, assertListboxButton)
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
    Error.captureStackTrace(err, assertListboxLabel)
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
    Error.captureStackTrace(err, assertListboxButtonLinkedWithListbox)
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
    Error.captureStackTrace(err, assertListboxLabelLinkedWithListbox)
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
    Error.captureStackTrace(err, assertActiveListboxOption)
    throw err
  }
}

export function assertNoActiveListboxOption(listbox = getListbox()) {
  try {
    if (listbox === null) return expect(listbox).not.toBe(null)

    // Ensure we don't have an active listbox
    expect(listbox).not.toHaveAttribute('aria-activedescendant')
  } catch (err) {
    Error.captureStackTrace(err, assertNoActiveListboxOption)
    throw err
  }
}

export function assertNoSelectedListboxOption(items = getListboxOptions()) {
  try {
    for (let item of items) expect(item).not.toHaveAttribute('aria-selected')
  } catch (err) {
    Error.captureStackTrace(err, assertNoSelectedListboxOption)
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
    expect(item).toHaveAttribute('tabindex', '-1')

    // Ensure listbox button has the following attributes
    if (!options) return

    for (let attributeName in options.attributes) {
      expect(item).toHaveAttribute(attributeName, options.attributes[attributeName])
    }

    if (options.tag) {
      expect(item.tagName.toLowerCase()).toBe(options.tag)
    }

    if (options.selected != null) {
      switch (options.selected) {
        case true:
          return expect(item).toHaveAttribute('aria-selected', 'true')

        case false:
          return expect(item).not.toHaveAttribute('aria-selected')

        default:
          assertNever(options.selected)
      }
    }
  } catch (err) {
    Error.captureStackTrace(err, assertListboxOption)
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

export function assertSwitch(
  options: {
    state: SwitchState
    tag?: string
    textContent?: string
    label?: string
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
    Error.captureStackTrace(err, assertSwitch)
    throw err
  }
}

// ---

export function assertLabelValue(element: HTMLElement | null, value: string) {
  if (element === null) return expect(element).not.toBe(null)

  if (element.hasAttribute('aria-labelledby')) {
    const ids = element.getAttribute('aria-labelledby')!.split(' ')
    expect(ids.map(id => document.getElementById(id)?.textContent).join(' ')).toEqual(value)
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

export function assertActiveElement(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)
    expect(document.activeElement).toBe(element)
  } catch (err) {
    Error.captureStackTrace(err, assertActiveElement)
    throw err
  }
}
