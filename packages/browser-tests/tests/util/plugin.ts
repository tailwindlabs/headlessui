import type * as vue from '@playwright/experimental-ct-vue'
import type * as react from '@playwright/experimental-ct-react'
import type * as pt from '@playwright/test'
import { pick } from './helpers'
import { Snapshot } from './snapshots'
import { Animations } from './animations'
import { addGlobalScripts } from './scripts'

type RawPlugin = typeof vue & typeof react
type Plugin = RawPlugin & { vitePlugins: any[] }

const plugin: Plugin = pick({
  vue: () =>
    Object.assign(require('@playwright/experimental-ct-vue'), {
      vitePlugins: [
        require('@vitejs/plugin-vue')({
          //
        }),

        require('@vitejs/plugin-vue-jsx')({
          //
        }),
      ],
    }),

  react: () =>
    Object.assign(require('@playwright/experimental-ct-react'), {
      vitePlugins: [
        require('@vitejs/plugin-react')({
          //
        }),
      ],
    }),
})

export let test = plugin.test
export let expect = plugin.expect
export let devices = plugin.devices
export let vitePlugins = plugin.vitePlugins
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
  animations: Animations
  messages: () => string[]
}

function wrapLocator(locator: pt.Locator, helpers: Partial<Helpers> = {}): Locator {
  let ogLocator = locator.locator.bind(locator)

  return Object.assign(
    locator,
    {
      rerender: () => Promise.resolve(),
      hasAttribute: async (name: string) => (await locator.getAttribute(name)) !== null,
      locator: (selector: string, options?: Parameters<pt.Locator['locator']>[1]) => {
        return wrapLocator(ogLocator(selector, options))
      },
    },
    helpers
  )
}

export function createTest<PropsType>(createComponent: (props?: PropsType) => void) {
  const console = new WeakMap<pt.Page, string[]>

  const test = plugin.test.extend<Fixtures<PropsType>>({
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
        await Snapshot.log(page.locator('html'))
      })
    },

    async animations({ page }, use) {
      await use(new Animations(page))
    },

    async messages({ page }, use) {
      await use(() => console.get(page)!)
    },
  })

  test.beforeEach(async ({ page }) => {
    console.set(page, [])

    await page.on('console', (message) => {
      if (message.type() === 'log') {
        console.get(page)!.push(message.text())
      }
    })

    await addGlobalScripts(page)
  })

  test.afterEach(async ({ debug }, info) => {
    if (info.status === 'failed') {
      await debug()
    }
  })

  return test
}

export function currentComponent(): Locator {
  return globalThis.component
}

export function currentPage(): pt.Page {
  return currentComponent().page()
}
