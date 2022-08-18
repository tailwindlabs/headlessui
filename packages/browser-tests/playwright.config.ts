import { PlaywrightTestConfig, devices, expect } from './tests/util/plugin'
import { Locator } from '@playwright/test'

expect.extend({
  async toHaveAttribute(locator: Locator, name, expected, options) {
    const val = await locator.getAttribute(name, options)
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

  async toHaveTextContent(locator: Locator, content, options) {
    const val = await locator.textContent(options)
    const pass = val === content

    return {
      message: () => `Element should have text content ${content}`,
      pass,
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
