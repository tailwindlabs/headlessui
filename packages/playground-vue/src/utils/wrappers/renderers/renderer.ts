import { render as renderReactLegacy } from './react-legacy'
import { render as renderReactModern } from './react-modern'
import { render as renderVue } from './vue'

export interface Renderer {
  render: () => void
  destroy: () => void
}

export function createRenderer(
  type: string,
  container: HTMLElement,
  component: () => any
): Renderer {
  // let isLegacyReact = import.meta.env.REACT_VERSION === 16 || import.meta.env.REACT_VERSION === 17
  let isLegacyReact = true

  if (type === 'react' && isLegacyReact) {
    return renderReactLegacy(container, component)
  } else if (type === 'react' && !isLegacyReact) {
    return renderReactModern(container, component)
  } else if (type === 'vue') {
    return renderVue(container, component)
  } else {
    throw new Error(`Unknown type: ${type}`)
  }
}
