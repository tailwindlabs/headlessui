import React from 'react'
import { Tab } from './tabs'
import { renderSSR, renderHydrate } from '../../test-utils/ssr'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

function Example({ defaultIndex = 0 }) {
  return (
    <Tab.Group defaultIndex={defaultIndex}>
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
  })

  // The hydration tests don't work in React 18 due to some bug in Testing Library maybe?
  // Skipping for now
  xdescribe('Hydration', () => {
    it('should be possible to server side render the first Tab and Panel', async () => {
      const { contents } = await renderHydrate(<Example />)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      const { contents } = await renderHydrate(<Example defaultIndex={1} />)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })
})
