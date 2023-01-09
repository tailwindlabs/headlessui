import { RenderResult } from '@testing-library/react'
import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement } from 'react'
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

export async function renderHydrate(el: ReactElement, options: ServerRenderOptions = {}) {
  return renderSSR(el, options).then((r) => r.hydrate())
}
