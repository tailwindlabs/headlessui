import { nextTick, ref } from 'vue'
import {
  assertActiveElement,
  assertTabs,
  getByText,
  getTabs,
} from '../../test-utils/accessibility-assertions'
import { html } from '../../test-utils/html'
import { Keys, click, press, shift } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { createRenderTemplate, render } from '../../test-utils/vue-testing-library'
import { Dialog } from '../dialog/dialog'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from './tabs'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

const renderTemplate = createRenderTemplate({ TabGroup, TabList, Tab, TabPanels, TabPanel, Dialog })

describe('safeguards', () => {
  it.each([
    ['TabList', TabList],
    ['Tab', Tab],
    ['TabPanels', TabPanels],
    ['TabPanel', TabPanel],
  ])(
    'should error when we are using a <%s /> without a parent <TabGroup /> component',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <TabGroup /> component.`
      )
    })
  )

  it('should be possible to render TabGroup without crashing', async () => {
    renderTemplate(html`
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
    `)

    await new Promise<void>(nextTick)

    assertTabs({ active: 0 })
  })
})

describe('Rendering', () => {
  it('should be possible to render the TabPanels first, then the TabList', async () => {
    renderTemplate(html`
      <TabGroup>
        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
          <TabPanel>Content 3</TabPanel>
        </TabPanels>

        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>
      </TabGroup>
    `)

    await new Promise<void>(nextTick)

    assertTabs({ active: 0 })
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    renderTemplate({
      template: html`
        <button @click="toggle()">toggle</button>
        <TabGroup>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab v-if="!hide">Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel v-if="!hide">Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>
      `,
      setup() {
        let hide = ref(false)

        return {
          hide,
          toggle() {
            hide.value = !hide.value
          },
        }
      },
    })

    await new Promise<void>(nextTick)

    await click(getByText('toggle')) // Remove Tab 2
    await click(getByText('toggle')) // Re-add Tab 2

    await press(Keys.Tab)
    assertTabs({ active: 0 })

    await press(Keys.ArrowRight)
    assertTabs({ active: 1 })

    await press(Keys.ArrowRight)
    assertTabs({ active: 2 })
  })

  it(
    'should guarantee the order when injecting new tabs dynamically',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <TabGroup>
            <TabList>
              <Tab v-for="(t, i) in tabs" :key="t">Tab {{ i + 1 }}</Tab>
              <Tab>Insert new</Tab>
            </TabList>
            <TabPanels>
              <TabPanel v-for="t in tabs" :key="t">{{ t }}</TabPanel>
              <TabPanel>
                <button @click="add">Insert</button>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        `,
        setup() {
          let tabs = ref<string[]>([])

          return {
            tabs,
            add() {
              tabs.value.push(`Panel ${tabs.value.length + 1}`)
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      assertTabs({ active: 0, tabContents: 'Insert new', panelContents: 'Insert' })

      // Add some new tabs
      await click(getByText('Insert'))

      // We should still be on the tab we were on
      assertTabs({ active: 1, tabContents: 'Insert new', panelContents: 'Insert' })
    })
  )

  it(
    'should guarantee the order of DOM nodes when reversing the tabs and panels themselves, then performing actions (controlled component)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <button @click="reverse">reverse</button>
          <TabGroup :selectedIndex="selectedIndex" @change="handleChange">
            <TabList>
              <Tab v-for="tab in tabs" :key="tab">Tab {{ tab }}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel v-for="tab in tabs" :key="tab">Content {{ tab }}</TabPanel>
            </TabPanels>
          </TabGroup>
          <p id="selectedIndex">{{ selectedIndex }}</p>
        `,
        setup() {
          let selectedIndex = ref(1)
          let tabs = ref([0, 1, 2])

          return {
            tabs,
            selectedIndex,
            reverse() {
              tabs.value = tabs.value.slice().reverse()
            },
            handleChange(value: number) {
              selectedIndex.value = value
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      let selectedIndexElement = document.getElementById('selectedIndex')

      assertTabs({ active: 1 })

      await click(getByText('Tab 0'))
      assertTabs({ active: 0 })
      expect(selectedIndexElement).toHaveTextContent('0')

      await click(getByText('Tab 1'))
      assertTabs({ active: 1 })
      expect(selectedIndexElement).toHaveTextContent('1')

      await click(getByText('Tab 2'))
      assertTabs({ active: 2 })
      expect(selectedIndexElement).toHaveTextContent('2')

      await click(getByText('reverse'))

      // Note: the indices are reversed now
      await click(getByText('Tab 0'))
      assertTabs({ active: 2 })
      expect(selectedIndexElement).toHaveTextContent('2')

      await click(getByText('Tab 1'))
      assertTabs({ active: 1 })
      expect(selectedIndexElement).toHaveTextContent('1')

      await click(getByText('Tab 2'))
      assertTabs({ active: 0 })
      expect(selectedIndexElement).toHaveTextContent('0')

      await click(getByText('reverse'))

      // Note: the indices are reversed again now (back to normal)
      await click(getByText('Tab 0'))
      assertTabs({ active: 0 })
      expect(selectedIndexElement).toHaveTextContent('0')

      await click(getByText('Tab 1'))
      assertTabs({ active: 1 })
      expect(selectedIndexElement).toHaveTextContent('1')

      await click(getByText('Tab 2'))
      assertTabs({ active: 2 })
      expect(selectedIndexElement).toHaveTextContent('2')
    })
  )

  it(
    'should guarantee the order of DOM nodes when reversing the tabs and panels themselves, then performing actions (uncontrolled component)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <button @click="reverse">reverse</button>
          <TabGroup
            :selectedIndex="selectedIndex"
            @change="handleChange"
            v-slot="{ selectedIndex }"
          >
            <TabList>
              <Tab v-for="tab in tabs" :key="tab">Tab {{ tab }}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel v-for="tab in tabs" :key="tab">Content {{ tab }}</TabPanel>
            </TabPanels>
            <p id="selectedIndex">{{ selectedIndex }}</p>
          </TabGroup>
        `,
        setup() {
          let selectedIndex = ref(1)
          let tabs = ref([0, 1, 2])

          return {
            tabs,
            selectedIndex,
            reverse() {
              tabs.value = tabs.value.slice().reverse()
            },
            handleChange(value: number) {
              selectedIndex.value = value
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      let selectedIndexElement = document.getElementById('selectedIndex')

      await click(getByText('Tab 0'))
      assertTabs({ active: 0 })
      expect(selectedIndexElement).toHaveTextContent('0')

      await click(getByText('Tab 1'))
      assertTabs({ active: 1 })
      expect(selectedIndexElement).toHaveTextContent('1')

      await click(getByText('Tab 2'))
      assertTabs({ active: 2 })
      expect(selectedIndexElement).toHaveTextContent('2')

      await click(getByText('reverse'))

      // Note: the indices are reversed now
      await click(getByText('Tab 0'))
      assertTabs({ active: 2 })
      expect(selectedIndexElement).toHaveTextContent('2')

      await click(getByText('Tab 1'))
      assertTabs({ active: 1 })
      expect(selectedIndexElement).toHaveTextContent('1')

      await click(getByText('Tab 2'))
      assertTabs({ active: 0 })
      expect(selectedIndexElement).toHaveTextContent('0')

      await click(getByText('reverse'))

      // Note: the indices are reversed again now (back to normal)
      await click(getByText('Tab 0'))
      assertTabs({ active: 0 })
      expect(selectedIndexElement).toHaveTextContent('0')

      await click(getByText('Tab 1'))
      assertTabs({ active: 1 })
      expect(selectedIndexElement).toHaveTextContent('1')

      await click(getByText('Tab 2'))
      assertTabs({ active: 2 })
      expect(selectedIndexElement).toHaveTextContent('2')
    })
  )

  describe('`renderProps`', () => {
    it('should expose the `selectedIndex` on the `Tabs` component', async () => {
      renderTemplate(html`
        <TabGroup v-slot="data">
          <pre id="exposed">{{JSON.stringify(data)}}</pre>

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
      `)

      await new Promise<void>(nextTick)

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `TabList` component', async () => {
      renderTemplate(html`
        <TabGroup>
          <TabList v-slot="data">
            <pre id="exposed">{{JSON.stringify(data)}}</pre>
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
      `)

      await new Promise<void>(nextTick)

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `TabPanels` component', async () => {
      renderTemplate(html`
        <TabGroup>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels v-slot="data">
            <pre id="exposed">{{JSON.stringify(data)}}</pre>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      await new Promise<void>(nextTick)

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selected` state on the `Tab` components', async () => {
      renderTemplate(html`
        <TabGroup>
          <TabList>
            <Tab v-slot="data">
              <pre data-tab="0">{{JSON.stringify(data)}}</pre>
              <span>Tab 1</span>
            </Tab>
            <Tab v-slot="data">
              <pre data-tab="1">{{JSON.stringify(data)}}</pre>
              <span>Tab 2</span>
            </Tab>
            <Tab v-slot="data">
              <pre data-tab="2">{{JSON.stringify(data)}}</pre>
              <span>Tab 3</span>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      await new Promise<void>(nextTick)

      expect(document.querySelector('[data-tab="0"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-tab="1"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-tab="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )

      await click(getTabs()[1])

      expect(document.querySelector('[data-tab="0"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-tab="1"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-tab="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
    })

    it('should expose the `selected` state on the `TabPanel` components', async () => {
      renderTemplate(html`
        <TabGroup>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel :unmount="false" v-slot="data">
              <pre data-panel="0">{{JSON.stringify(data)}}</pre>
              <span>Content 1</span>
            </TabPanel>
            <TabPanel :unmount="false" v-slot="data">
              <pre data-panel="1">{{JSON.stringify(data)}}</pre>
              <span>Content 2</span>
            </TabPanel>
            <TabPanel :unmount="false" v-slot="data">
              <pre data-panel="2">{{JSON.stringify(data)}}</pre>
              <span>Content 3</span>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      `)

      await new Promise<void>(nextTick)

      expect(document.querySelector('[data-panel="0"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-panel="1"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-panel="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )

      await click(getByText('Tab 2'))

      expect(document.querySelector('[data-panel="0"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
      expect(document.querySelector('[data-panel="1"]')).toHaveTextContent(
        JSON.stringify({ selected: true })
      )
      expect(document.querySelector('[data-panel="2"]')).toHaveTextContent(
        JSON.stringify({ selected: false })
      )
    })
  })

  describe('`defaultIndex`', () => {
    it('should jump to the nearest tab when the defaultIndex is out of bounds (-2)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="-2">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })

    it('should jump to the nearest tab when the defaultIndex is out of bounds (+5)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="5">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 2 })
      assertActiveElement(getByText('Tab 3'))
    })

    it('should jump to the next available tab when the defaultIndex is a disabled tab', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="0">
          <TabList>
            <Tab disabled>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 1 })
      assertActiveElement(getByText('Tab 2'))
    })

    it('should jump to the next available tab when the defaultIndex is a disabled tab and wrap around', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2">
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab disabled>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>Content 1</TabPanel>
            <TabPanel>Content 2</TabPanel>
            <TabPanel>Content 3</TabPanel>
          </TabPanels>
        </TabGroup>

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })

    it('should not change the Tab if the defaultIndex changes', async () => {
      renderTemplate({
        template: html`
          <TabGroup :defaultIndex="defaultIndex">
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

          <button>after</button>
          <button @click="defaultIndex = 0">change</button>
        `,
        setup() {
          let defaultIndex = ref(1)
          return { defaultIndex }
        },
      })

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 1 })
      assertActiveElement(getByText('Tab 2'))

      await click(getByText('Tab 3'))

      assertTabs({ active: 2 })
      assertActiveElement(getByText('Tab 3'))

      // Change default index
      await click(getByText('change'))

      // Nothing should change...
      assertTabs({ active: 2 })
    })

    it(
      'should select first tab if no tabs were provided originally',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <TabGroup :defaultIndex="0">
              <TabList>
                <Tab v-for="tab in tabs">{{ tab }}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel v-for="tab in tabs">content for: {{ tab }}</TabPanel>
              </TabPanels>
            </TabGroup>

            <button>after</button>
            <button @click="tabs.value = ['tab 1', 'tab 2', 'tab 3']">change</button>
          `,
          setup() {
            let tabs = ref<string[]>([])
            return {
              tabs,
            }
          },
        })

        assertActiveElement(document.body)

        // There are no tab initially
        assertTabs({ active: -1 })

        // There are not tabs so this should not change anything
        await press(Keys.Tab)
        assertTabs({ active: -1 })

        // Add some tabs
        await click(getByText('change'))

        // When going from no tabs to some tabs, the tab based on defaultIndex should be selected
        assertTabs({ active: 0 })
      })
    )

    it(
      'should select first tab if no tabs were provided originally (with a defaultIndex of 1)',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <TabGroup :defaultIndex="1">
              <TabList>
                <Tab v-for="tab in tabs">{{ tab }}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel v-for="tab in tabs">content for: {{ tab }}</TabPanel>
              </TabPanels>
            </TabGroup>

            <button>after</button>
            <button @click="tabs.value = ['tab 1', 'tab 2', 'tab 3']">change</button>
          `,
          setup() {
            let tabs = ref<string[]>([])
            return {
              tabs,
            }
          },
        })

        assertActiveElement(document.body)

        // There are no tab initially
        assertTabs({ active: -1 })

        // There are not tabs so this should not change anything
        await press(Keys.Tab)
        assertTabs({ active: -1 })

        // Add some tabs
        await click(getByText('change'))

        // When going from no tabs to some tabs, the tab based on defaultIndex should be selected
        assertTabs({ active: 1 })
      })
    )

    it(
      'should select first tab if no tabs were provided originally (with a defaultIndex of 1)',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html`
            <TabGroup :defaultIndex="1">
              <TabList>
                <Tab v-for="tab in tabs">{{ tab }}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel v-for="tab in tabs">content for: {{ tab }}</TabPanel>
              </TabPanels>
            </TabGroup>

            <button>after</button>
            <button @click="tabs.value = ['tab 1', 'tab 2', 'tab 3']">change 1</button>
            <button @click="tabs.value = []">change 2</button>
            <button @click="tabs.value = ['tab 1', 'tab 2', 'tab 3']">change 3</button>
          `,
          setup() {
            let tabs = ref<string[]>([])
            return {
              tabs,
            }
          },
        })

        assertActiveElement(document.body)

        // There are no tab initially
        assertTabs({ active: -1 })

        // There are not tabs so this should not change anything
        await press(Keys.Tab)
        assertTabs({ active: -1 })

        // Add some tabs
        await click(getByText('change 1'))

        // Add some tabs
        await click(getByText('change 2'))

        // Add some tabs
        await click(getByText('change 3'))

        // When going from no tabs to some tabs, the tab based on defaultIndex should be selected
        assertTabs({ active: 1 })
      })
    )
  })
})

describe('`selectedIndex`', () => {
  it(
    'should not change the tab in a controlled component if you do not respond to the @change',
    suppressConsoleLogs(async () => {
      let handleChange = jest.fn()

      renderTemplate({
        template: html`
          <TabGroup @change="handleChange" :selectedIndex="selectedIndex">
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
          <button>after</button>
          <button @click="next">setSelectedIndex</button>
        `,
        setup() {
          let selectedIndex = ref(0)

          return {
            selectedIndex,
            handleChange(value: number) {
              handleChange(value)
            },
            next() {
              selectedIndex.value += 1
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      // test controlled behaviour
      await click(getByText('setSelectedIndex'))
      assertTabs({ active: 1 })
      await click(getByText('setSelectedIndex'))
      assertTabs({ active: 2 })

      // test uncontrolled behaviour again
      await click(getByText('Tab 1'))
      assertTabs({ active: 2 }) // Should still be Tab 3 because `selectedIndex` didn't update
      await click(getByText('Tab 2'))
      assertTabs({ active: 2 }) // Should still be Tab 3 because `selectedIndex` didn't update
      await click(getByText('Tab 3'))
      assertTabs({ active: 2 }) // Should still be Tab 3 because `selectedIndex` didn't update
      await click(getByText('Tab 1'))
      expect(handleChange).toHaveBeenCalledTimes(3) // We did see the '@change' calls, but only 3 because clicking Tab 3 is already the active one which means that this doesn't trigger the @change
      assertTabs({ active: 2 }) // Should still be Tab 3 because `selectedIndex` didn't update
    })
  )

  it('should be possible to change active tab controlled and uncontrolled', async () => {
    let handleChange = jest.fn()

    renderTemplate({
      template: html`
        <TabGroup @change="handleChange" :selectedIndex="selectedIndex">
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
        <button>after</button>
        <button @click="next">setSelectedIndex</button>
      `,
      setup() {
        let selectedIndex = ref(0)

        return {
          selectedIndex,
          handleChange(value: number) {
            selectedIndex.value = value
            handleChange(value)
          },
          next() {
            selectedIndex.value += 1
          },
        }
      },
    })

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)

    // test uncontrolled behaviour
    await click(getByText('Tab 2'))
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenNthCalledWith(1, 1)
    assertTabs({ active: 1 })

    // test controlled behaviour
    await click(getByText('setSelectedIndex'))
    assertTabs({ active: 2 })

    // test uncontrolled behaviour again
    await click(getByText('Tab 2'))
    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(handleChange).toHaveBeenNthCalledWith(2, 1)
    assertTabs({ active: 1 })
  })

  it('should jump to the nearest tab when the selectedIndex is out of bounds (-2)', async () => {
    renderTemplate(html`
      <TabGroup :selectedIndex="-2">
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

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)

    await press(Keys.Tab)

    assertTabs({ active: 0 })
    assertActiveElement(getByText('Tab 1'))
  })

  it('should jump to the nearest tab when the selectedIndex is out of bounds (+5)', async () => {
    renderTemplate(html`
      <TabGroup :selectedIndex="5">
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

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)

    await press(Keys.Tab)

    assertTabs({ active: 2 })
    assertActiveElement(getByText('Tab 3'))
  })

  it('should jump to the next available tab when the selectedIndex is a disabled tab', async () => {
    renderTemplate(html`
      <TabGroup :selectedIndex="0">
        <TabList>
          <Tab disabled>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
          <TabPanel>Content 3</TabPanel>
        </TabPanels>
      </TabGroup>

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)

    await press(Keys.Tab)

    assertTabs({ active: 1 })
    assertActiveElement(getByText('Tab 2'))
  })

  it('should jump to the next available tab when the selectedIndex is a disabled tab and wrap around', async () => {
    renderTemplate(html`
      <TabGroup :selectedIndex="2">
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab disabled>Tab 3</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
          <TabPanel>Content 3</TabPanel>
        </TabPanels>
      </TabGroup>

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)

    await press(Keys.Tab)

    assertTabs({ active: 0 })
    assertActiveElement(getByText('Tab 1'))
  })

  it('should prefer selectedIndex over defaultIndex', async () => {
    renderTemplate(html`
      <TabGroup :selectedIndex="0" :defaultIndex="2">
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

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)

    await press(Keys.Tab)

    assertTabs({ active: 0 })
    assertActiveElement(getByText('Tab 1'))
  })

  it(
    'should wrap around when overflowing the index when using a controlled component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <TabGroup :selectedIndex="value" @change="set" v-slot="{ selectedIndex }">
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

            <button @click="set(selectedIndex + 1)">Next</button>
          </TabGroup>
        `,
        setup() {
          let value = ref(0)
          return {
            value,
            set(v: number) {
              value.value = v
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await click(getByText('Next'))
      assertTabs({ active: 1 })

      await click(getByText('Next'))
      assertTabs({ active: 2 })

      await click(getByText('Next'))
      assertTabs({ active: 0 })

      await click(getByText('Next'))
      assertTabs({ active: 1 })
    })
  )

  it(
    'should wrap around when underflowing the index when using a controlled component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <TabGroup :selectedIndex="value" @change="set" v-slot="{ selectedIndex }">
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

            <button @click="set(selectedIndex - 1)">Previous</button>
          </TabGroup>
        `,
        setup() {
          let value = ref(0)
          return {
            value,
            set(v: number) {
              value.value = v
            },
          }
        },
      })

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await click(getByText('Previous'))
      assertTabs({ active: 2 })

      await click(getByText('Previous'))
      assertTabs({ active: 1 })

      await click(getByText('Previous'))
      assertTabs({ active: 0 })

      await click(getByText('Previous'))
      assertTabs({ active: 2 })
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the default initial first tab', async () => {
      renderTemplate(html`
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Content 1'))

      await press(Keys.Tab)
      assertActiveElement(getByText('after'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Content 1'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Tab 1'))
    })

    it('should be possible to tab to the default index tab', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 1 })
      assertActiveElement(getByText('Tab 2'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Content 2'))

      await press(Keys.Tab)
      assertActiveElement(getByText('after'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Content 2'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Tab 2'))
    })
  })

  describe('`ArrowRight` key', () => {
    it('should be possible to go to the next item (activation = `auto`)', async () => {
      renderTemplate(html`
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the next item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })

    it('should wrap around at the end (activation = `auto`)', async () => {
      renderTemplate(html`
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })
    })

    it('should wrap around at the end (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })
    })

    it('should not be possible to go right when in vertical mode (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup vertical>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowRight)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should not be possible to go right when in vertical mode (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup vertical manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowRight)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })
  })

  describe('`ArrowLeft` key', () => {
    it('should be possible to go to the previous item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the previous item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2" manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })
    })

    it('should wrap around at the beginning (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })
    })

    it('should wrap around at the beginning (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2" manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 2 })
      await press(Keys.Enter)
      assertTabs({ active: 1 })
    })

    it('should not be possible to go left when in vertical mode (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup vertical>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowLeft)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should not be possible to go left when in vertical mode (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup vertical manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)

      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })
  })

  describe('`ArrowDown` key', () => {
    it('should be possible to go to the next item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup vertical>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })
    })

    it('should be possible to go to the next item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup vertical manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 2, orientation: 'vertical' })
    })

    it('should wrap around at the end (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup vertical>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should wrap around at the end (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup vertical manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should not be possible to go down when in horizontal mode (activation = `auto`)', async () => {
      renderTemplate(html`
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowDown)
      // no-op
      assertTabs({ active: 0 })
    })

    it('should not be possible to go down when in horizontal mode (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowDown)
      assertTabs({ active: 0 })
      await press(Keys.Enter)

      // no-op
      assertTabs({ active: 0 })
    })
  })

  describe('`ArrowUp` key', () => {
    it('should be possible to go to the previous item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2" vertical>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should be possible to go to the previous item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2" vertical manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should wrap around at the beginning (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2" vertical>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should wrap around at the beginning (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="2" vertical manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 2, orientation: 'vertical' })
      await press(Keys.Enter)
      assertTabs({ active: 1, orientation: 'vertical' })
    })

    it('should not be possible to go left when in vertical mode (activation = `auto`)', async () => {
      renderTemplate(html`
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowUp)
      // no-op
      assertTabs({ active: 0 })
    })

    it('should not be possible to go left when in vertical mode (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0 })
      await press(Keys.Enter)

      // no-op
      assertTabs({ active: 0 })
    })
  })

  describe('`Home` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.Home)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1" manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.Home)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })
    })
  })

  describe('`PageUp` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageUp)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1" manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageUp)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 0 })
    })
  })

  describe('`End` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.End)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1" manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.End)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })
  })

  describe('`PageDown` key', () => {
    it('should be possible to go to the first focusable item (activation = `auto`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1">
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageDown)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      renderTemplate(html`
        <TabGroup :defaultIndex="1" manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageDown)
      assertTabs({ active: 1 })
      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })
  })

  describe('`Enter` key', () => {
    it('should be possible to activate the focused tab', async () => {
      renderTemplate(html`
        <TabGroup manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      getByText('Tab 3')?.focus()

      assertActiveElement(getByText('Tab 3'))
      assertTabs({ active: 0 })

      await press(Keys.Enter)
      assertTabs({ active: 2 })
    })
  })

  describe('`Space` key', () => {
    it('should be possible to activate the focused tab', async () => {
      renderTemplate(html`
        <TabGroup manual>
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

        <button>after</button>
      `)

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      getByText('Tab 3')?.focus()

      assertActiveElement(getByText('Tab 3'))
      assertTabs({ active: 0 })

      await press(Keys.Space)
      assertTabs({ active: 2 })
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to click on a tab to focus it', async () => {
    renderTemplate(html`
      <TabGroup :defaultIndex="1">
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

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)
    await press(Keys.Tab)
    assertTabs({ active: 1 })

    await click(getByText('Tab 1'))
    assertTabs({ active: 0 })

    await click(getByText('Tab 3'))
    assertTabs({ active: 2 })

    await click(getByText('Tab 2'))
    assertTabs({ active: 1 })
  })

  it('should be a no-op when clicking on a disabled tab', async () => {
    renderTemplate(html`
      <TabGroup :defaultIndex="1">
        <TabList>
          <Tab disabled>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
          <TabPanel>Content 3</TabPanel>
        </TabPanels>
      </TabGroup>

      <button>after</button>
    `)

    await new Promise<void>(nextTick)

    assertActiveElement(document.body)
    await press(Keys.Tab)
    assertTabs({ active: 1 })

    await click(getByText('Tab 1'))
    // No-op, Tab 2 is still active
    assertTabs({ active: 1 })
  })
})

it('should trigger the `change` when the tab changes', async () => {
  let changes = jest.fn()

  renderTemplate({
    template: html`
      <TabGroup @change="changes">
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

      <button>after</button>
    `,
    setup: () => ({ changes }),
  })

  await new Promise<void>(nextTick)

  await click(getByText('Tab 2'))
  await click(getByText('Tab 3'))
  await click(getByText('Tab 2'))
  await click(getByText('Tab 1'))

  expect(changes).toHaveBeenCalledTimes(4)

  expect(changes).toHaveBeenNthCalledWith(1, 1)
  expect(changes).toHaveBeenNthCalledWith(2, 2)
  expect(changes).toHaveBeenNthCalledWith(3, 1)
  expect(changes).toHaveBeenNthCalledWith(4, 0)
})

describe('Composition', () => {
  it(
    'should be possible to go to the next item containing a Dialog component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <TabGroup>
            <TabList>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </TabList>

            <TabPanels>
              <TabPanel data-panel="0">Content 1</TabPanel>
              <TabPanel data-panel="1">
                <button>open</button>
                <Dialog :open="false" @close="noop" />
              </TabPanel>
              <TabPanel data-panel="2">Content 3</TabPanel>
            </TabPanels>
          </TabGroup>
        `,
        setup: () => ({
          noop: console.log,
        }),
      })

      await new Promise<void>(nextTick)

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      // Navigate to Dialog tab
      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })

      // Focus on to the Dialog panel
      await press(Keys.Tab)
      assertActiveElement(document.querySelector('[data-panel="1"]'))

      // Focus on to the Dialog trigger button
      await press(Keys.Tab)
      assertActiveElement(getByText('open'))

      // Focus back to the panel
      await press(shift(Keys.Tab))
      assertActiveElement(document.querySelector('[data-panel="1"]'))

      // Focus back to tabs
      await press(shift(Keys.Tab))
      assertTabs({ active: 1 })

      // Navigate to the next tab
      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })

      // Focus on to the content panel
      await press(Keys.Tab)
      assertActiveElement(document.querySelector('[data-panel="2"]'))
    })
  )
})
