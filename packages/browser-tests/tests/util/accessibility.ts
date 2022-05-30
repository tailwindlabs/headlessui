import { currentComponent, expect, type Locator } from './plugin'

export function getByText(text: string) {
  return currentComponent().locator(`text="${text}"`)
}

export async function assertActiveElement(locator: Locator) {
  await expect(locator).toBePresent()

  const node = await currentComponent()
    .page()
    .accessibility.snapshot({
      root: await locator.elementHandle(),
    })

  expect(node.focused).toBe(true)
}
