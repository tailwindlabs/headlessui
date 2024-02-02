import { defineComponent } from 'vue'
import { provideUseId } from '../../hooks/use-id'
import { html } from '../../test-utils/html'
import { renderHydrate, renderSSR } from '../../test-utils/ssr'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from './tabs'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

let uniqueId = 0

beforeEach(() => {
  uniqueId = 0
})

let Example = defineComponent({
  components: {
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  },

  setup: () => provideUseId(() => `custom-${++uniqueId}`),

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

      // Make sure our custom IDs are being used
      let tabs = Array.from(document.body.querySelectorAll('[role=tab]'))
      let panels = Array.from(document.body.querySelectorAll('[role=tabpanel]'))

      expect(tabs[0]).toHaveAttribute('id', 'headlessui-tabs-tab-custom-1')
      expect(tabs[1]).toHaveAttribute('id', 'headlessui-tabs-tab-custom-2')
      expect(tabs[2]).toHaveAttribute('id', 'headlessui-tabs-tab-custom-3')

      expect(panels[0]).toHaveAttribute('id', 'headlessui-tabs-panel-custom-4')
      expect(panels[1]).toHaveAttribute('id', 'headlessui-tabs-panel-custom-5')
      expect(panels[2]).toHaveAttribute('id', 'headlessui-tabs-panel-custom-6')
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

      // Make sure our custom IDs are being used even after hydration
      let tabs = Array.from(document.body.querySelectorAll('[role=tab]'))
      let panels = Array.from(document.body.querySelectorAll('[role=tabpanel]'))

      expect(tabs[0]).toHaveAttribute('id', 'headlessui-tabs-tab-custom-1')
      expect(tabs[1]).toHaveAttribute('id', 'headlessui-tabs-tab-custom-2')
      expect(tabs[2]).toHaveAttribute('id', 'headlessui-tabs-tab-custom-3')

      expect(panels[0]).toHaveAttribute('id', 'headlessui-tabs-panel-custom-4')
      expect(panels[1]).toHaveAttribute('id', 'headlessui-tabs-panel-custom-5')
      expect(panels[2]).toHaveAttribute('id', 'headlessui-tabs-panel-custom-6')
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await renderHydrate(Example, { defaultIndex: 1 })

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })
})
