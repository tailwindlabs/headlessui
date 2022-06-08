import { createTest, pick, expect } from '../util/plugin'

import ExampleVue from './ExampleVue'
import ExampleReact from './ExampleReact'

const test = createTest(
  (props?: { enterDuration?: number; leaveDuration?: number; withChildren?: boolean }) => {
    return pick({
      vue: () => <ExampleVue {...props} />,
      react: () => <ExampleReact {...props} />,
    })
  }
)

test('root: should transition in and out completely', async ({ render, page, animations }) => {
  const showButton = page.locator('#show')
  const hideButton = page.locator('#hide')

  await render({
    enterDuration: 50,
    leaveDuration: 50,
  })

  await animations.startRecording()

  await showButton.click()
  await animations.wait()

  await hideButton.click()
  await animations.wait()

  expect(animations.length).toEqual(2)

  expect(animations[0].target).toEqual('root')
  expect(animations[0].state).toEqual('ended')
  expect(animations[0].elapsedTime).toEqual(50)
  expect(animations[0].properties).toEqual(['opacity'])

  expect(animations[1].target).toEqual('root')
  expect(animations[1].state).toEqual('ended')
  expect(animations[1].elapsedTime).toEqual(50)
  expect(animations[1].properties).toEqual(['opacity'])
})

test('root: should cancel transitions', async ({ render, page, animations }) => {
  const showButton = page.locator('#show')
  const hideButton = page.locator('#hide')

  await render({
    enterDuration: 50,
    leaveDuration: 50,
  })

  await animations.startRecording()

  await showButton.click()
  await new Promise((resolve) => setTimeout(resolve, 20))
  await hideButton.click()

  await animations.wait()

  expect(animations.length).toEqual(2)

  expect(animations[0].target).toEqual('root')
  expect(animations[0].state).toEqual('cancelled')
  expect(animations[0].elapsedTime).toBeLessThan(50)
  expect(animations[0].properties).toEqual(['opacity'])

  expect(animations[1].target).toEqual('root')
  expect(animations[1].state).toEqual('ended')
  expect(animations[1].elapsedTime).toBeLessThan(50)
  expect(animations[1].properties).toEqual(['opacity'])
})

test.only('children: should transition in and out completely', async ({
  render,
  page,
  animations,
}) => {
  const showButton = page.locator('#show')
  const hideButton = page.locator('#hide')

  await render({
    enterDuration: 50,
    leaveDuration: 50,
    withChildren: true,
  })

  await animations.startRecording()

  await showButton.click()
  await animations.wait()

  await hideButton.click()
  await animations.wait()

  console.log(animations.timeline)

  expect(animations.length).toEqual(6)

  expect(animations[0].target).toEqual('child-1')
  expect(animations[0].state).toEqual('ended')
  expect(animations[0].elapsedTime).toEqual(50)
  expect(animations[0].properties).toEqual(['opacity'])

  expect(animations[1].target).toEqual('child-2')
  expect(animations[1].state).toEqual('ended')
  expect(animations[1].elapsedTime).toEqual(50)
  expect(animations[1].properties).toEqual(['opacity'])

  expect(animations[2].target).toEqual('root')
  expect(animations[2].state).toEqual('ended')
  expect(animations[2].elapsedTime).toEqual(50)
  expect(animations[2].properties).toEqual(['opacity'])

  expect(animations[3].target).toEqual('child-1')
  expect(animations[3].state).toEqual('ended')
  expect(animations[3].elapsedTime).toEqual(50)
  expect(animations[3].properties).toEqual(['opacity'])

  expect(animations[4].target).toEqual('child-2')
  expect(animations[4].state).toEqual('ended')
  expect(animations[4].elapsedTime).toEqual(50)
  expect(animations[4].properties).toEqual(['opacity'])

  expect(animations[5].target).toEqual('root')
  expect(animations[5].state).toEqual('ended')
  expect(animations[5].elapsedTime).toEqual(50)
  expect(animations[5].properties).toEqual(['opacity'])
})

test('children: should cancel transitions', async ({ render, page, animations }) => {
  const showButton = page.locator('#show')
  const hideButton = page.locator('#hide')

  await render({
    enterDuration: 50,
    leaveDuration: 50,
    withChildren: true,
  })

  await animations.startRecording()

  await showButton.click()
  await new Promise((resolve) => setTimeout(resolve, 20))
  await hideButton.click()

  await animations.wait()

  expect(animations.length).toEqual(6)

  // child-1 [opacity]: created (1) -> started (4) -> ended (7)
  // child-2 [opacity]: created (2) -> started (5) -> ended (8)
  //    root [opacity]: created (3) -> started (6) -> ended (9)

  // created [opacity]: child-1, child-2, root
  // started [opacity]: child-1, child-2, root
  //   ended [opacity]: child-1, child-2, root

  expect(animations[0].target).toEqual('child-1')
  expect(animations[0].state).toEqual('cancelled')
  expect(animations[0].elapsedTime).toBeLessThan(50)
  expect(animations[0].properties).toEqual(['opacity'])

  expect(animations[1].target).toEqual('child-2')
  expect(animations[1].state).toEqual('cancelled')
  expect(animations[1].elapsedTime).toBeLessThan(50)
  expect(animations[1].properties).toEqual(['opacity'])

  expect(animations[2].target).toEqual('root')
  expect(animations[2].state).toEqual('cancelled')
  expect(animations[2].elapsedTime).toBeLessThan(50)
  expect(animations[2].properties).toEqual(['opacity'])

  expect(animations[3].target).toEqual('child-1')
  expect(animations[3].state).toEqual('ended')
  expect(animations[3].elapsedTime).toBeLessThan(50)
  expect(animations[3].properties).toEqual(['opacity'])

  expect(animations[4].target).toEqual('child-2')
  expect(animations[4].state).toEqual('ended')
  expect(animations[4].elapsedTime).toBeLessThan(50)
  expect(animations[4].properties).toEqual(['opacity'])

  expect(animations[5].target).toEqual('root')
  expect(animations[5].state).toEqual('ended')
  expect(animations[5].elapsedTime).toBeLessThan(50)
  expect(animations[5].properties).toEqual(['opacity'])
})
