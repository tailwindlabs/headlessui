import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'

export function render(container: HTMLElement, component: () => ReactElement) {
  let el = React.createElement(component)

  if (import.meta.env.SSR) {
    return {
      render: () => ReactDOM.hydrate(el, container),
      destroy: () => ReactDOM.hydrate(null, container),
    }
  } else {
    return {
      render: () => ReactDOM.render(el, container),
      destroy: () => ReactDOM.render(null, container),
    }
  }
}
