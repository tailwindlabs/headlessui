import { createApp, createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from './tabs'
import { html } from '../../test-utils/html'
import { render } from '../../test-utils/vue-testing-library'
import { env } from '../../utils/env'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

let Example = defineComponent({
  components: { TabGroup, TabList, Tab, TabPanels, TabPanel },
  template: html`
    <TabGroup>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
        <TabPanel>Content 3</TabPanel>
      </TabPanels>
    </TabGroup>
  `,
})

describe('Rendering', () => {
  describe('SSR', () => {
    it('should be possible to server side render the first Tab and Panel', async () => {
      let { contents } = await serverRender(Example)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await serverRender(Example, { defaultIndex: 1 })

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })

  describe('Hydration', () => {
    it('should be possible to server side render the first Tab and Panel', async () => {
      let { contents } = await hydrateRender(Example)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await hydrateRender(Example, { defaultIndex: 1 })

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })
})

async function serverRender(component: any, rootProps: any = {}) {
  let container = document.createElement('div')
  document.body.appendChild(container)

  // Render on the server
  env.set('server')
  let app = createSSRApp(component, rootProps)
  let contents = await renderToString(app)
  container.innerHTML = contents

  return {
    contents,
    hydrate() {
      let app = createApp(component, rootProps)
      app.mount(container)

      return {
        contents: container.innerHTML,
      }
    },
  }
}

async function hydrateRender(component: any, rootProps: any = {}) {
  return serverRender(component, rootProps).then(({ hydrate }) => hydrate())
}
