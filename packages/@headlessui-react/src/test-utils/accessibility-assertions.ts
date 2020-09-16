export enum MenuButtonState {
  Open,
  Closed,
}

export enum MenuState {
  Open,
  Closed,
}

type MenuButtonOptions = { attributes?: Record<string, string | null>; textContent?: string } & (
  | { state: MenuButtonState.Closed }
  | { state: MenuButtonState.Open }
)
export function assertMenuButton(button: HTMLElement | null, options: MenuButtonOptions) {
  try {
    if (button === null) return expect(button).not.toBe(null)

    // Ensure menu button have these properties
    expect(button.hasAttribute('id')).toBe(true)
    expect(button.hasAttribute('aria-haspopup')).toBe(true)

    if (options.state === MenuButtonState.Open) {
      expect(button.hasAttribute('aria-controls')).toBe(true)
      expect(button.getAttribute('aria-expanded')).toBe('true')
    }

    if (options.state === MenuButtonState.Closed) {
      expect(button.getAttribute('aria-controls')).toBeNull()
      expect(button.getAttribute('aria-expanded')).toBeNull()
    }

    if (options.textContent) {
      expect(button.textContent?.trim()).toBe(options.textContent.trim())
    }

    // Ensure menu button has the following attributes
    for (let attributeName in options.attributes) {
      expect(button.getAttribute(attributeName)).toEqual(options.attributes[attributeName])
    }
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertMenuButton)
    }
    throw err
  }
}

export function assertMenuButtonLinkedWithMenu(
  button: HTMLElement | null,
  menu: HTMLElement | null
) {
  try {
    if (button === null) return expect(button).not.toBe(null)
    if (menu === null) return expect(menu).not.toBe(null)

    // Ensure link between button & menu is correct
    expect(button.getAttribute('aria-controls')).toBe(menu.getAttribute('id'))
    expect(menu.getAttribute('aria-labelledby')).toBe(button.getAttribute('id'))
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertMenuButtonLinkedWithMenu)
    }
    throw err
  }
}

export function assertMenuLinkedWithMenuItem(menu: HTMLElement | null, item: HTMLElement | null) {
  try {
    if (menu === null) return expect(menu).not.toBe(null)
    if (item === null) return expect(item).not.toBe(null)

    // Ensure link between menu & menu item is correct
    expect(menu.getAttribute('aria-activedescendant')).toBe(item.getAttribute('id'))
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertMenuLinkedWithMenuItem)
    }
    throw err
  }
}

export function assertNoActiveMenuItem(menu: HTMLElement | null) {
  try {
    if (menu === null) return expect(menu).not.toBe(null)

    // Ensure we don't have an active menu
    expect(menu.hasAttribute('aria-activedescendant')).toBe(false)
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertNoActiveMenuItem)
    }
    throw err
  }
}

type MenuOptions = { attributes?: Record<string, string | null>; textContent?: string } & (
  | { state: MenuState.Closed }
  | { state: MenuState.Open }
)
export function assertMenu(menu: HTMLElement | null, options: MenuOptions) {
  try {
    if (options.state === MenuState.Open) {
      if (menu === null) return expect(menu).not.toBe(null)

      // Check that some attributes exists, doesn't really matter what the values are at this point in
      // time, we just require them.
      expect(menu.hasAttribute('aria-labelledby')).toBe(true)

      // Check that we have the correct values for certain attributes
      expect(menu.getAttribute('role')).toBe('menu')

      // Check that the menu is focused
      expect(document.activeElement).toBe(menu)

      if (options.textContent) {
        expect(menu.textContent?.trim()).toBe(options.textContent.trim())
      }

      // Ensure menu button has the following attributes
      for (let attributeName in options.attributes) {
        expect(menu.getAttribute(attributeName)).toEqual(options.attributes[attributeName])
      }
    }

    if (options.state === MenuState.Closed) {
      expect(menu).toBeNull()
    }
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertMenu)
    }
    throw err
  }
}

type MenuItemOptions = { tag?: string; attributes?: Record<string, string | null> }
export function assertMenuItem(item: HTMLElement | null, options?: MenuItemOptions) {
  try {
    if (item === null) return expect(item).not.toBe(null)

    // Check that some attributes exists, doesn't really matter what the values are at this point in
    // time, we just require them.
    expect(item.hasAttribute('id')).toBe(true)

    // Check that we have the correct values for certain attributes
    expect(item.getAttribute('role')).toBe('menuitem')
    expect(item.getAttribute('tabindex')).toBe('-1')

    // Ensure menu button has the following attributes
    if (options) {
      for (let attributeName in options.attributes) {
        expect(item.getAttribute(attributeName)).toEqual(options.attributes[attributeName])
      }

      if (options.tag) {
        expect(item.tagName.toLowerCase()).toBe(options.tag)
      }
    }
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertMenuItem)
    }
    throw err
  }
}

export function assertActiveElement(element: HTMLElement | null) {
  try {
    if (element === null) return expect(element).not.toBe(null)
    expect(document.activeElement).toBe(element)
  } catch (err) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, assertActiveElement)
    }
    throw err
  }
}
