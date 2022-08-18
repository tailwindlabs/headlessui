import type * as vue from '@playwright/experimental-ct-vue'
import type * as react from '@playwright/experimental-ct-react'
import type * as pt from '@playwright/test'
import { pick } from './helpers'
import jsdom from 'jsdom'
import { prettyDOM } from '@testing-library/dom'
import { prettyPrint } from './printing'

const plugin: typeof vue & typeof react = pick({
  vue: () => require('@playwright/experimental-ct-vue'),
  react: () => require('@playwright/experimental-ct-react'),
})

export let test = plugin.test
export let expect = plugin.expect
export let devices = plugin.devices
export type PlaywrightTestConfig = vue.PlaywrightTestConfig & react.PlaywrightTestConfig
export * from './helpers'

interface Helpers {
  rerender: (props: any) => Promise<void>
  hasAttribute: (name: string) => Promise<boolean>
  locator(selector: string, options?: Parameters<pt.Locator['locator']>[1]): Locator
}

export type Locator = import('@playwright/test').Locator & Helpers

type Fixtures<PropsType> = {
  render: (props?: PropsType) => Promise<Locator>
  debug: () => Promise<void>
}

function wrapLocator(locator: pt.Locator, helpers: Partial<Helpers> = {}): Locator {
  let ogLocator = locator.locator.bind(locator)

  return Object.assign(
    locator,
    {
      rerender: () => Promise.resolve(),
      hasAttribute: async (name: string) => (await locator.getAttribute(name)) === name,
      locator: (selector: string, options?: Parameters<pt.Locator['locator']>[1]) => {
        return wrapLocator(ogLocator(selector, options))
      },
    },
    helpers
  )
}

export function createTest<PropsType>(createComponent: (props?: PropsType) => void) {
  return plugin.test.extend<Fixtures<PropsType>>({
    async render({ mount, page }, use) {
      await use(async (props) => {
        const rerender = (props) => mount(createComponent(props))

        const component = wrapLocator(await rerender(props), {
          rerender: async (props) => (await rerender(props), void 0),
        })

        globalThis.component = component

        // @ts-ignore
        globalThis.document = {
          querySelector(selector) {
            return globalThis.component.locator(selector)
          },

          get activeElement() {
            return globalThis.component
          },
        }

        return component
      })
    },

    async debug({ page }, use) {
      await use(async () => {
        await prettyPrint(page.locator('html'))
      })
    },
  })
}
