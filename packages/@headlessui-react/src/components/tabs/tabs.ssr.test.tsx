import React from 'react'
import { renderHydrate, renderSSR } from '../../test-utils/ssr'
import { Tab } from './tabs'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

let spy: jest.SpyInstance<void, Parameters<typeof console.error>>
beforeEach(() => (spy = jest.spyOn(console, 'error').mockImplementation(() => {})))
afterEach(() => spy.mockRestore())

function Example(props: { defaultIndex?: number; selectedIndex?: number }) {
  return (
    <Tab.Group {...props}>
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
}

describe('Rendering', () => {
  describe('SSR', () => {
    it('should be possible to server side render the first Tab and Panel', async () => {
      let { contents } = await renderSSR(<Example />)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await renderSSR(<Example defaultIndex={1} />)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the selectedIndex=0 Tab and Panel', async () => {
      let { contents } = await renderSSR(<Example selectedIndex={0} />)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the selectedIndex=1 Tab and Panel', async () => {
      let { contents } = await renderSSR(<Example selectedIndex={1} />)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })

  // The hydration tests don't work in React 18 due to some bug in Testing Library maybe?
  // Skipping for now
  // TODO: Figure out once 2.0 alpha is released
  describe.skip.each([{ strict: true }, { strict: false }])('Hydration: %p', (opts) => {
    it('should be possible to server side render the first Tab and Panel by default', async () => {
      const { contents } = await renderHydrate(<Example />, opts)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should be possible to server side render the first Tab and Panel', async () => {
      const { contents } = await renderHydrate(<Example defaultIndex={0} />, opts)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      const { contents } = await renderHydrate(<Example defaultIndex={1} />, opts)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should be possible to server side render the selectedIndex=0 Tab and Panel', async () => {
      let { contents } = await renderHydrate(<Example selectedIndex={0} />, opts)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should be possible to server side render the selectedIndex=1 Tab and Panel', async () => {
      let { contents } = await renderHydrate(<Example selectedIndex={1} />, opts)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
