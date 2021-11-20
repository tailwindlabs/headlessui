import React, { createElement } from 'react'
import { render } from '@testing-library/react'

import { Tab } from './tabs'
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
    ['Tab.List', Tab.List],
    ['Tab', Tab],
    ['Tab.Panels', Tab.Panels],
    ['Tab.Panel', Tab.Panel],
  ])(
    'should error when we are using a <%s /> without a parent <Tab.Group /> component',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Tab.Group /> component.`
      )
    })
  )

  it('should be possible to render Tab.Group without crashing', async () => {
    render(
      <Tab.Group>
        <Tab.List>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    )

    assertTabs({ active: 0 })
  })
})

describe('Rendering', () => {
  it('should be possible to render the Tab.Panels first, then the Tab.List', async () => {
    render(
      <Tab.Group>
        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </Tab.Panels>

        <Tab.List>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </Tab.List>
      </Tab.Group>
    )

    assertTabs({ active: 0 })
  })

  describe('`renderProps`', () => {
    it('should expose the `selectedIndex` on the `Tab.Group` component', async () => {
      render(
        <Tab.Group>
          {data => (
            <>
              <pre id="exposed">{JSON.stringify(data)}</pre>

              <Tab.List>
                <Tab>Tab 1</Tab>
                <Tab>Tab 2</Tab>
                <Tab>Tab 3</Tab>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>Content 1</Tab.Panel>
                <Tab.Panel>Content 2</Tab.Panel>
                <Tab.Panel>Content 3</Tab.Panel>
              </Tab.Panels>
            </>
          )}
        </Tab.Group>
      )

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `Tab.List` component', async () => {
      render(
        <Tab.Group>
          <Tab.List>
            {data => (
              <>
                <pre id="exposed">{JSON.stringify(data)}</pre>
                <Tab>Tab 1</Tab>
                <Tab>Tab 2</Tab>
                <Tab>Tab 3</Tab>
              </>
            )}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>Content 1</Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selectedIndex` on the `Tab.Panels` component', async () => {
      render(
        <Tab.Group>
          <Tab.List>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </Tab.List>

          <Tab.Panels>
            {data => (
              <>
                <pre id="exposed">{JSON.stringify(data)}</pre>
                <Tab.Panel>Content 1</Tab.Panel>
                <Tab.Panel>Content 2</Tab.Panel>
                <Tab.Panel>Content 3</Tab.Panel>
              </>
            )}
          </Tab.Panels>
        </Tab.Group>
      )

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 0 })
      )

      await click(getByText('Tab 2'))

      expect(document.getElementById('exposed')).toHaveTextContent(
        JSON.stringify({ selectedIndex: 1 })
      )
    })

    it('should expose the `selected` state on the `Tab` components', async () => {
      render(
        <Tab.Group>
          <Tab.List>
            <Tab>
              {data => (
                <>
                  <pre data-tab={0}>{JSON.stringify(data)}</pre>
                  <span>Tab 1</span>
                </>
              )}
            </Tab>
            <Tab>
              {data => (
                <>
                  <pre data-tab={1}>{JSON.stringify(data)}</pre>
                  <span>Tab 2</span>
                </>
              )}
            </Tab>
            <Tab>
              {data => (
                <>
                  <pre data-tab={2}>{JSON.stringify(data)}</pre>
                  <span>Tab 3</span>
                </>
              )}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>Content 1</Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
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

    it('should expose the `selected` state on the `Tab.Panel` components', async () => {
      render(
        <Tab.Group>
          <Tab.List>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel unmount={false}>
              {data => (
                <>
                  <pre data-panel={0}>{JSON.stringify(data)}</pre>
                  <span>Content 1</span>
                </>
              )}
            </Tab.Panel>
            <Tab.Panel unmount={false}>
              {data => (
                <>
                  <pre data-panel={1}>{JSON.stringify(data)}</pre>
                  <span>Content 2</span>
                </>
              )}
            </Tab.Panel>
            <Tab.Panel unmount={false}>
              {data => (
                <>
                  <pre data-panel={2}>{JSON.stringify(data)}</pre>
                  <span>Content 3</span>
                </>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
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
          <Tab.Group defaultIndex={-2}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={5}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={0}>
            <Tab.List>
              <Tab disabled>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab disabled>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <button>after</button>
        </>
      )

      assertActiveElement(document.body)

      await press(Keys.Tab)

      assertTabs({ active: 0 })
      assertActiveElement(getByText('Tab 1'))
    })
  })

  describe(`'Tab'`, () => {
    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          <Tab.Group>
            <Tab.List>
              <Tab>Trigger</Tab>
            </Tab.List>
          </Tab.Group>
        )

        expect(getTabs()[0]).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Tab.Group>
            <Tab.List>
              <Tab type="submit">Trigger</Tab>
            </Tab.List>
          </Tab.Group>
        )

        expect(getTabs()[0]).toHaveAttribute('type', 'submit')
      })

      it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
        let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
          <button ref={ref} {...props} />
        ))

        render(
          <Tab.Group>
            <Tab.List>
              <Tab as={CustomButton}>Trigger</Tab>
            </Tab.List>
          </Tab.Group>
        )

        expect(getTabs()[0]).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Tab.Group>
            <Tab.List>
              <Tab as="div">Trigger</Tab>
            </Tab.List>
          </Tab.Group>
        )

        expect(getTabs()[0]).not.toHaveAttribute('type')
      })

      it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
        let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
          <div ref={ref} {...props} />
        ))

        render(
          <Tab.Group>
            <Tab.List>
              <Tab as={CustomButton}>Trigger</Tab>
            </Tab.List>
          </Tab.Group>
        )

        expect(getTabs()[0]).not.toHaveAttribute('type')
      })
    })
  })
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the default initial first tab', async () => {
      render(
        <>
          <Tab.Group>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2} manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2} manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group vertical manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2} vertical>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2} vertical manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2} vertical>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={2} vertical manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1} manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1} manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1} manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1}>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group defaultIndex={1} manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
          <Tab.Group manual>
            <Tab.List>
              <Tab>Tab 1</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
              <Tab.Panel>Content 3</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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
        <Tab.Group defaultIndex={1}>
          <Tab.List>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>Content 1</Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

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
        <Tab.Group defaultIndex={1}>
          <Tab.List>
            <Tab disabled>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>Content 1</Tab.Panel>
            <Tab.Panel>Content 2</Tab.Panel>
            <Tab.Panel>Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

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
      <Tab.Group onChange={changes}>
        <Tab.List>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

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
