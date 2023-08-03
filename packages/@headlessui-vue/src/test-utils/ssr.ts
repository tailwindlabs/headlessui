import { createApp, createSSRApp, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { env } from '../utils/env'

export async function renderSSR(component: any, rootProps: any = {}) {
  let container = document.createElement('div')
  document.body.appendChild(container)

  // Render on the server
  env.set('server')
  let app = createSSRApp(component, rootProps)
  let contents = await renderToString(app)
  container.innerHTML = contents

  return {
    contents,
    async hydrate() {
      let app = createApp(component, rootProps)
      app.mount(container)

      await nextTick()

      return {
        contents: container.innerHTML,
      }
    },
  }
}

export async function renderHydrate(component: any, rootProps: any = {}) {
  return renderSSR(component, rootProps).then(({ hydrate }) => hydrate())
}
