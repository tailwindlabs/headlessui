import { expect } from './tests/util/plugin'
import { Locator } from '@playwright/test'

export async function toHaveAttribute(locator: Locator, name, expected) {
  const val = await locator.getAttribute(name, { timeout: 0 })
  const pass = expected === undefined ? val !== null : val === expected

  if (expected === undefined) {
    return {
      message: () =>
        this.isNot ? `The attribute ${name} is present` : `The attribute ${name} is missing`,
      pass,
    }
  }

  return {
    message: () =>
      `The attribute ${name} should ${this.isNot ? 'not have' : 'have'} value ${expected}`,
    pass,
  }
}

export async function toHaveTextContent(locator: Locator, content) {
  const val = await locator.textContent({ timeout: 0 })
  const pass = val === content

  return {
    message: () => `Element should have text content ${content}`,
    pass,
  }
}

export async function toBePresent(locator: Locator) {
  let exists = this.isNot

  try {
    await locator.waitFor({ state: this.isNot ? 'detached' : 'attached', timeout: 0 })
    exists = !exists
  } catch {
    //
  }

  return {
    message: () => (this.isNot ? `Element should exist` : `Element should not exist`),
    pass: exists,
  }
}

export async function toHaveStyle(locator: Locator, css: Record<string, string | RegExp>) {
  try {
    for (const [prop, value] of Object.entries(css)) {
      if (this.isNot) {
        await expect(locator).not.toHaveCSS(prop, value, { timeout: 0 })
      } else {
        await expect(locator).toHaveCSS(prop, value, { timeout: 0 })
      }
    }

    return {
      message: () => (this.isNot ? `Element styles do not match` : `Element styles match`),
      pass: !this.isNot,
    }
  } catch {
    return {
      message: () => (this.isNot ? `Element styles do not match` : `Element styles match`),
      pass: !this.isNot,
    }
  }
}
