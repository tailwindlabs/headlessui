import { Component, createApp, createSSRApp } from 'vue'

export function render(container: HTMLElement, component: () => Component) {
  let app: ReturnType<typeof createApp> | ReturnType<typeof createSSRApp>

  if (import.meta.env.SSR) {
    return {
      render: () => {
        app = createSSRApp(component())
        app.mount(container)
      },
      destroy: () => {
        app.unmount()
      },
    }
  } else {
    return {
      render: () => {
        app = createApp(component())
        app.mount(container)
      },
      destroy: () => {
        app.unmount()
      },
    }
  }
}
