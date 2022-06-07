import { createTest, pick, expect } from '../util/plugin'

// import ExampleVue from './ExampleVue'
import ExampleReact from './ExampleReact'

const test = createTest((props?: { enterDuration?: number; leaveDuration?: number }) => {
  return pick({
    // vue: () => <ExampleVue {...props} />,
    react: () => <ExampleReact {...props} />,
  })
})

test('should transition in completely (duration defined in milliseconds)', async ({
  render,
  page,
  animations,
}) => {
  const showButton = page.locator('#show')
  const hideButton = page.locator('#hide')
  const toggleButton = page.locator('#toggle')

  await render({
    enterDuration: 100,
    leaveDuration: 200,
  })

  await animations.startRecording()

  await showButton.click()
  await animations.wait()

  await hideButton.click()
  await animations.wait()

  expect(animations.length).toEqual(2)
  expect(animations.at(0).state).toEqual('ended')
  expect(animations.at(0).elapsedTime).toEqual(0.1)
  expect(animations.at(0).properties).toEqual(['opacity'])

  expect(animations.at(1).state).toEqual('ended')
  expect(animations.at(1).elapsedTime).toEqual(0.1)
  expect(animations.at(1).properties).toEqual(['opacity'])
})
