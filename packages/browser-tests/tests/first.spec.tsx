import { test, expect } from '@playwright/test'
import http from 'http'

import ReactDOM from 'react-dom'
import React from 'react'

let html = String.raw

async function createServer({ page }: Partial<Parameters<Parameters<typeof test>[1]>[0]>) {
  let state = {
    x: '<html><div id="app"></div></html>',
  }

  let server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(200)
    res.end(state.x)
  })

  page.on('close', () => server.close())

  let address = server.listen().address()
  let port: number = address?.port ?? parseInt(address.split(':')[1])

  return async function render(x) {
    state.x = html`
      <html>
        <div id="app"></div>
        <script>
          document.getElementById('#app').innerHTML = 'Hello there!'
        </script>
      </html>
    `
    await page.goto(`http://localhost:${port}`)
    return await page.evaluate('document.body.innerHTML')
  }
}

test('basic test', async ({ page }) => {
  let render = await createServer({ page })
  let x = await render(<div className="bg-red-500">Hello</div>)
  console.log({ x })
  expect(1).toBe(2)
})
