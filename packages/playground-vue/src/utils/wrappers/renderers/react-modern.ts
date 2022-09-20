import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'

export function render(container: HTMLElement, component: () => ReactElement) {
  let el = React.createElement(component)
  let root

  if (import.meta.env.SSR) {
    return {
      render: () => {
        root = ReactDOM.createRoot(container)
        root.render(el)
      },
      destroy: () => root.unmount(),
    }
  } else {
    return {
      render: () => {
        root = ReactDOM.createRoot(container)
        root.render(el)
      },
      destroy: () => root.unmount(),
    }
  }
}
