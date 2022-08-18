import { createTest, pick } from '../util/plugin'

import ExampleVue from './Example.vue'
import ExampleReact from './Example'
import { assertDisclosureButton, DisclosureState } from '../util/interactions'

const test = createTest((props?: any) => {
  return pick({
    vue: () => <ExampleVue {...props} />,
    react: () => <ExampleReact {...props} />,
  })
})

test('should work', async ({ render, debug }) => {
  const component = await render()

  await debug()

  await assertDisclosureButton({
    state: DisclosureState.InvisibleUnmounted,
    attributes: { id: 'headlessui-disclosure-button-1' },
  })

  const button = component.locator('[id^="headlessui-disclosure-button-"]')
  await button.click()

  await assertDisclosureButton({
    state: DisclosureState.Visible,
    attributes: { id: 'headlessui-disclosure-button-1' },
  })
})
