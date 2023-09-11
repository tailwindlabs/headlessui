import {
  cleanup,
  render,
  screen,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react'
import React, { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { env } from '../utils/env'

type ServerRenderOptions = Omit<RenderOptions, 'queries'> & {
  strict?: boolean
}

interface ServerRenderResult {
  type: 'ssr' | 'hydrate'
  contents: string
  result: RenderResult
  hydrate: () => Promise<ServerRenderResult>
}

export async function renderSSR(
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
    cleanup()

    container.remove()

    container = document.createElement('div')
    container.innerHTML = contents
    document.body.appendChild(container)

    env.set('client')

    let newResult = render(ui, {
      ...options,
      container,
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

export async function renderHydrate(el: ReactElement, options: ServerRenderOptions = {}) {
  return renderSSR(el, options).then((r) => r.hydrate())
}

export { screen }
