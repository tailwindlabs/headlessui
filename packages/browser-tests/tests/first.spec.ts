import { createServer } from 'vite'
import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  let server = await createServer({
    configFile: false,
    root: __dirname,
  })

  await server.listen()
  server.open()
  page.on('close', () => server.close())

  expect(1).toBe(2)

  // await page.goto('http://localhost:1337/')
  //
  // const title = page.locator('.navbar__inner .navbar__title')
  // await expect(title).toHaveText('Playwright')
})
