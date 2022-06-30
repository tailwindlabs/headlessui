import { PlaywrightTestConfig, devices, expect } from './tests/util/plugin'
import { Locator } from '@playwright/test'

expect.extend({
  async toHaveAttribute(locator: Locator, name, expected) {
    const val = await locator.getAttribute(name, { timeout: 0 })
    const pass = expected === undefined ? val !== null : val === expected

    if (expected === undefined) {
      return {
        message: () =>
          this.isNot ? `The attribute ${name} is missing` : `The attribute ${name} is present`,
        pass,
      }
    }

    return {
      message: () =>
        `The attribute ${name} should ${this.isNot ? 'not have' : 'have'} value ${expected}`,
      pass,
    }
  },

  async toHaveTextContent(locator: Locator, content) {
    const val = await locator.textContent({ timeout: 0 })
    const pass = val === content

    return {
      message: () => `Element should have text content ${content}`,
      pass,
    }
  },

  async toBePresent(locator: Locator) {
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
  },

  async toHaveStyle(locator: Locator, css: Record<string, string | RegExp>) {
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
  },
})

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './',
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: './__snapshots__',
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Port to use for Playwright component endpoint. */
    ctPort: 3100,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
}

export default config
