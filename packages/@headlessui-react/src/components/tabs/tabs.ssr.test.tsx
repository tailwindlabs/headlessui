import { RenderResult } from '@testing-library/react'
import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { Tab } from './tabs'
import { env } from '../../utils/env'

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
      let { contents } = await serverRender(<Example />)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      let { contents } = await serverRender(<Example defaultIndex={1} />)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })

  // The hydration tests don't work in React 18 due to some bug in Testing Library maybe?
  // Skipping for now
  xdescribe('Hydration', () => {
    it('should be possible to server side render the first Tab and Panel', async () => {
      const { contents } = await hydrateRender(<Example />)

      expect(contents).toContain(`Content 1`)
      expect(contents).not.toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })

    it('should be possible to server side render the defaultIndex Tab and Panel', async () => {
      const { contents } = await hydrateRender(<Example defaultIndex={1} />)

      expect(contents).not.toContain(`Content 1`)
      expect(contents).toContain(`Content 2`)
      expect(contents).not.toContain(`Content 3`)
    })
  })
})

type ServerRenderOptions = Omit<RenderOptions, 'queries'> & {
  strict?: boolean
}

interface ServerRenderResult {
  type: 'ssr' | 'hydrate'
  contents: string
  result: RenderResult
  hydrate: () => Promise<ServerRenderResult>
}

async function serverRender(
  ui: ReactElement,
  options: ServerRenderOptions = {}
): Promise<ServerRenderResult> {
  let container = document.createElement('div')
  document.body.appendChild(container)
  options = { ...options, container }

  if (options.strict) {
    options = {
      ...options,
      wrapper({ children }) {
        return <React.StrictMode>{children}</React.StrictMode>
      },
    }
  }

  env.set('server')
  let contents = renderToString(ui)
  let result = render(<div dangerouslySetInnerHTML={{ __html: contents }} />, options)

  async function hydrate(): Promise<ServerRenderResult> {
    // This hack-ish way of unmounting the server rendered content is necessary
    // otherwise we won't actually end up testing the hydration code path properly.
    // Probably because React hangs on to internal references on the DOM nodes
    result.unmount()
    container.innerHTML = contents

    env.set('client')
    let newResult = render(ui, {
      ...options,
      hydrate: true,
    })

    return {
      type: 'hydrate',
      contents: container.innerHTML,
      result: newResult,
      hydrate,
    }
  }

  return {
    type: 'ssr',
    contents,
    result,
    hydrate,
  }
}

async function hydrateRender(el: ReactElement, options: ServerRenderOptions = {}) {
  return serverRender(el, options).then((r) => r.hydrate())
}
