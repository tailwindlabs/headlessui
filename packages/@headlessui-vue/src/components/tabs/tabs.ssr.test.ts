import { defineComponent } from 'vue'
import { html } from '../../test-utils/html'
import { renderHydrate, renderSSR } from '../../test-utils/ssr'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from './tabs'

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
      let { contents } = await renderSSR(Example)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await renderSSR(Example, { defaultIndex: 1 })

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })

  describe('Hydration', () => {
    it('should be possible to server side render the first Tab and Panel', async () => {
      let { contents } = await renderHydrate(Example)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await renderHydrate(Example, { defaultIndex: 1 })

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })
})
