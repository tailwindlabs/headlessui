import { type Page } from '@playwright/test'
import * as scripts from './scripts'

export async function addGlobalScripts(page: Page) {
  let script = ''

  for (const [fn, impl] of Object.entries(scripts)) {
    script += `window['${fn}'] = ${impl};\n`
  }

  await page.evaluate(script)
}
