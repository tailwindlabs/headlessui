import React, { createElement } from 'react'
import { render } from '@testing-library/react'

import { Tabs } from './tabs'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  assertTabs,
  assertActiveElement,
  getByText,
  getTabs,
} from '../../test-utils/accessibility-assertions'
import { press, Keys, shift, click } from '../../test-utils/interactions'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

describe('safeguards', () => {
  it.each([
    ['Tabs.List', Tabs.List],
    ['Tabs.Tab', Tabs.Tab],
    ['Tabs.Panels', Tabs.Panels],
    ['Tabs.Panel', Tabs.Panel],
  ])(
    'should error when we are using a <%s /> without a parent <Tabs /> component',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Tabs /> component.`
      )
    })
  )

  it('should be possible to render Tabs without crashing', async () => {
    render(
      <Tabs>
        <Tabs.List>
          <Tabs.Tab>Tab 1</Tabs.Tab>
          <Tabs.Tab>Tab 2</Tabs.Tab>
          <Tabs.Tab>Tab 3</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panels>
          <Tabs.Panel>Content 1</Tabs.Panel>
          <Tabs.Panel>Content 2</Tabs.Panel>
          <Tabs.Panel>Content 3</Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    )

    assertTabs({ active: 0 })
  })
})

describe('Rendering', () => {
  it('should be possible to render the Tabs.Panels first, then the Tabs.List', async () => {
    render(
      <Tabs>
        <Tabs.Panels>
          <Tabs.Panel>Content 1</Tabs.Panel>
          <Tabs.Panel>Content 2</Tabs.Panel>
          <Tabs.Panel>Content 3</Tabs.Panel>
        </Tabs.Panels>

        <Tabs.List>
          <Tabs.Tab>Tab 1</Tabs.Tab>
          <Tabs.Tab>Tab 2</Tabs.Tab>
          <Tabs.Tab>Tab 3</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    )

    assertTabs({ active: 0 })
  })

  describe('`renderProps`', () => {
    it('should expose the `selectedIndex` on the `Tabs` component', async () => {
      render(
        <Tabs>
          {data => (
            <>
              <pre id="exposed">{JSON.stringify(data)}</pre>

              <Tabs.List>
                <Tabs.Tab>Tab 1</Tabs.Tab>
                <Tabs.Tab>Tab 2</Tabs.Tab>
                <Tabs.Tab>Tab 3</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panels>
                <Tabs.Panel>Content 1</Tabs.Panel>
                <Tabs.Panel>Content 2</Tabs.Panel>
                <Tabs.Panel>Content 3</Tabs.Panel>
              </Tabs.Panels>
            </>
          )}
        </Tabs>
      )

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `Tabs.List` component', async () => {
      render(
        <Tabs>
          <Tabs.List>
            {data => (
              <>
                <pre id="exposed">{JSON.stringify(data)}</pre>
                <Tabs.Tab>Tab 1</Tabs.Tab>
                <Tabs.Tab>Tab 2</Tabs.Tab>
                <Tabs.Tab>Tab 3</Tabs.Tab>
              </>
            )}
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel>Content 1</Tabs.Panel>
            <Tabs.Panel>Content 2</Tabs.Panel>
            <Tabs.Panel>Content 3</Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      )

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `Tabs.Panels` component', async () => {
      render(
        <Tabs>
          <Tabs.List>
            <Tabs.Tab>Tab 1</Tabs.Tab>
            <Tabs.Tab>Tab 2</Tabs.Tab>
            <Tabs.Tab>Tab 3</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panels>
            {data => (
              <>
                <pre id="exposed">{JSON.stringify(data)}</pre>
                <Tabs.Panel>Content 1</Tabs.Panel>
                <Tabs.Panel>Content 2</Tabs.Panel>
                <Tabs.Panel>Content 3</Tabs.Panel>
              </>
            )}
          </Tabs.Panels>
        </Tabs>
      )

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selected` state on the `Tabs.Tab` components', async () => {
      render(
        <Tabs>
          <Tabs.List>
            <Tabs.Tab>
              {data => (
                <>
                  <pre data-tab={0}>{JSON.stringify(data)}</pre>
                  <span>Tab 1</span>
                </>
              )}
            </Tabs.Tab>
            <Tabs.Tab>
              {data => (
                <>
                  <pre data-tab={1}>{JSON.stringify(data)}</pre>
                  <span>Tab 2</span>
                </>
              )}
            </Tabs.Tab>
            <Tabs.Tab>
              {data => (
                <>
                  <pre data-tab={2}>{JSON.stringify(data)}</pre>
                  <span>Tab 3</span>
                </>
              )}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel>Content 1</Tabs.Panel>
            <Tabs.Panel>Content 2</Tabs.Panel>
            <Tabs.Panel>Content 3</Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      )

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

    it('should expose the `selected` state on the `Tabs.Panel` components', async () => {
      render(
        <Tabs>
          <Tabs.List>
            <Tabs.Tab>Tab 1</Tabs.Tab>
            <Tabs.Tab>Tab 2</Tabs.Tab>
            <Tabs.Tab>Tab 3</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel unmount={false}>
              {data => (
                <>
                  <pre data-panel={0}>{JSON.stringify(data)}</pre>
                  <span>Content 1</span>
                </>
              )}
            </Tabs.Panel>
            <Tabs.Panel unmount={false}>
              {data => (
                <>
                  <pre data-panel={1}>{JSON.stringify(data)}</pre>
                  <span>Content 2</span>
                </>
              )}
            </Tabs.Panel>
            <Tabs.Panel unmount={false}>
              {data => (
                <>
                  <pre data-panel={2}>{JSON.stringify(data)}</pre>
                  <span>Content 3</span>
                </>
              )}
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      )

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
      render(
        <>
          <Tabs defaultIndex={-2}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })

    it('should jump to the nearest tab when the defaultIndex is out of bounds (+5)', async () => {
      render(
        <>
          <Tabs defaultIndex={5}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 2 })
      assertActiveElement(getByText('Tab 3'))
    })

    it('should jump to the next available tab when the defaultIndex is a disabled tab', async () => {
      render(
        <>
          <Tabs defaultIndex={0}>
            <Tabs.List>
              <Tabs.Tab disabled>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 1 })
      assertActiveElement(getByText('Tab 2'))
    })

    it('should jump to the next available tab when the defaultIndex is a disabled tab and wrap around', async () => {
      render(
        <>
          <Tabs defaultIndex={2}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab disabled>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })
  })
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the default initial first tab', async () => {
      render(
        <>
          <Tabs>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={1}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 1 })

      await press(Keys.ArrowRight)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the next item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs vertical>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowRight)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should not be possible to go right when in vertical mode (activation = `manual`)', async () => {
      render(
        <>
          <Tabs vertical manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={2}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 1 })

      await press(Keys.ArrowLeft)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the previous item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs defaultIndex={2} manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={2}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={2} manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs vertical>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowLeft)
      // no-op
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should not be possible to go left when in vertical mode (activation = `manual`)', async () => {
      render(
        <>
          <Tabs vertical manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs vertical>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowDown)
      assertTabs({ active: 2, orientation: 'vertical' })
    })

    it('should be possible to go to the next item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs vertical manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs vertical>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs vertical manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowDown)
      // no-op
      assertTabs({ active: 0 })
    })

    it('should not be possible to go down when in horizontal mode (activation = `manual`)', async () => {
      render(
        <>
          <Tabs manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={2} vertical>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 2, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 1, orientation: 'vertical' })

      await press(Keys.ArrowUp)
      assertTabs({ active: 0, orientation: 'vertical' })
    })

    it('should be possible to go to the previous item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs defaultIndex={2} vertical manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={2} vertical>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={2} vertical manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 0 })

      await press(Keys.ArrowUp)
      // no-op
      assertTabs({ active: 0 })
    })

    it('should not be possible to go left when in vertical mode (activation = `manual`)', async () => {
      render(
        <>
          <Tabs manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={1}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.Home)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs defaultIndex={1} manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={1}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageUp)
      assertTabs({ active: 0 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs defaultIndex={1} manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={1}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.End)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs defaultIndex={1} manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs defaultIndex={1}>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)
      assertTabs({ active: 1 })

      await press(Keys.PageDown)
      assertTabs({ active: 2 })
    })

    it('should be possible to go to the first focusable item (activation = `manual`)', async () => {
      render(
        <>
          <Tabs defaultIndex={1} manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
      render(
        <>
          <Tabs manual>
            <Tabs.List>
              <Tabs.Tab>Tab 1</Tabs.Tab>
              <Tabs.Tab>Tab 2</Tabs.Tab>
              <Tabs.Tab>Tab 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panels>
              <Tabs.Panel>Content 1</Tabs.Panel>
              <Tabs.Panel>Content 2</Tabs.Panel>
              <Tabs.Panel>Content 3</Tabs.Panel>
            </Tabs.Panels>
          </Tabs>

          <button>after</button>
        </>
      )

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
    render(
      <>
        <Tabs defaultIndex={1}>
          <Tabs.List>
            <Tabs.Tab>Tab 1</Tabs.Tab>
            <Tabs.Tab>Tab 2</Tabs.Tab>
            <Tabs.Tab>Tab 3</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel>Content 1</Tabs.Panel>
            <Tabs.Panel>Content 2</Tabs.Panel>
            <Tabs.Panel>Content 3</Tabs.Panel>
          </Tabs.Panels>
        </Tabs>

        <button>after</button>
      </>
    )

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
    render(
      <>
        <Tabs defaultIndex={1}>
          <Tabs.List>
            <Tabs.Tab disabled>Tab 1</Tabs.Tab>
            <Tabs.Tab>Tab 2</Tabs.Tab>
            <Tabs.Tab>Tab 3</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel>Content 1</Tabs.Panel>
            <Tabs.Panel>Content 2</Tabs.Panel>
            <Tabs.Panel>Content 3</Tabs.Panel>
          </Tabs.Panels>
        </Tabs>

        <button>after</button>
      </>
    )

    assertActiveElement(document.body)
    await press(Keys.Tab)
    assertTabs({ active: 1 })

    await click(getByText('Tab 1'))
    // No-op, Tab 2 is still active
    assertTabs({ active: 1 })
  })
})

it('should trigger the `onChange` when the tab changes', async () => {
  let changes = jest.fn()

  render(
    <>
      <Tabs onChange={changes}>
        <Tabs.List>
          <Tabs.Tab>Tab 1</Tabs.Tab>
          <Tabs.Tab>Tab 2</Tabs.Tab>
          <Tabs.Tab>Tab 3</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panels>
          <Tabs.Panel>Content 1</Tabs.Panel>
          <Tabs.Panel>Content 2</Tabs.Panel>
          <Tabs.Panel>Content 3</Tabs.Panel>
        </Tabs.Panels>
      </Tabs>

      <button>after</button>
    </>
  )

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
