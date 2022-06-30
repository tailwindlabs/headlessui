import { currentPage, expect, type Locator } from './plugin'

export function getByText(text: string) {
  return currentPage().locator(`text="${text}"`)
}

export async function assertActiveElement(locator: Locator) {
  const node = await currentPage().accessibility.snapshot({
    root: await locator.elementHandle({ timeout: 0 }) ?? undefined,
  })

  expect(node?.focused).toBe(true)
}
