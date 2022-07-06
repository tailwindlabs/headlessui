import { createTest, pick, expect } from '../util/plugin'
import { ElementHandle } from '@playwright/test'

import ExampleVue from './ExampleVue'
import ExampleReact from './ExampleReact'
import { resolve } from 'path'

const test = createTest(
  (props?: { enterDuration?: number; leaveDuration?: number; withChildren?: boolean }) => {
    return pick({
      vue: () => <ExampleVue {...props} />,
      react: () => <ExampleReact {...props} />,
    })
  }
)

// test.only('test: weird', async ({ render, page, animations }) => {
//   const toggle = page.locator('#toggle')

//   await render({
//     enterDuration: 50,
//     leaveDuration: 50,
//   })

//   await new Promise((resolve) => setTimeout(resolve, 10_000))

//   await animations.startRecording()

//   await toggle.click()
//   await animations.wait()

// })

test('root: should transition in and out completely', async ({
  render,
  page,
  animations,
  messages,
}) => {
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

  expect(messages()).toEqual([
    'root beforeEnter',
    'root afterEnter',
    'root beforeLeave',
    'root afterLeave',
  ])

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

test.only('root: should cancel transitions', async ({ render, page, animations, messages }) => {
  let options = {
    enterDuration: 1000,
    leaveDuration: 1000,
  }

  await new Promise((resolve) => setTimeout(resolve, 5000))

  await render(options)

  await animations.startRecording()

  await page.evaluate(async () => {
    let showButton = document.querySelector('#show') as HTMLButtonElement
    let hideButton = document.querySelector('#hide') as HTMLButtonElement

    showButton.click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    hideButton.click()
  })

  await animations.wait()

  await new Promise((resolve) => setTimeout(resolve, 45 * 1000))

  expect(messages()).toEqual(['root beforeEnter', 'root beforeLeave', 'root afterLeave'])

  expect(animations.length).toEqual(2)

  expect(animations[0].target).toEqual('root')
  expect(animations[0].state).toEqual('cancelled')
  expect(animations[0].elapsedTime).toBeLessThan(options.enterDuration)
  expect(animations[0].properties).toEqual(['opacity'])

  expect(animations[1].target).toEqual('root')
  expect(animations[1].state).toEqual('ended')
  expect(animations[1].elapsedTime).toBeLessThan(options.leaveDuration)
  expect(animations[1].properties).toEqual(['opacity'])
})

test('children: should transition in and out completely', async ({
  render,
  page,
  animations,
  messages,
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

  expect(messages()).toEqual([
    'child-1 beforeEnter',
    'child-2 beforeEnter',
    'root beforeEnter',
    'child-1 afterEnter',
    'child-2 afterEnter',
    'root afterEnter',

    'child-1 beforeLeave',
    'child-2 beforeLeave',
    'root beforeLeave',
    'child-1 afterLeave',
    'child-2 afterLeave',
    'root afterLeave',
  ])

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
  let options = {
    enterDuration: 100,
    leaveDuration: 100,
    withChildren: true,
  }

  await render(options)

  await animations.startRecording()

  await page.evaluate(async () => {
    let showButton = document.querySelector('#show') as HTMLButtonElement
    let hideButton = document.querySelector('#hide') as HTMLButtonElement

    showButton.click()
    await new Promise((resolve) => setTimeout(resolve, 50))
    hideButton.click()
  })

  await animations.wait()

  expect(animations.length).toEqual(6)

  expect(animations[0].target).toEqual('child-1')
  expect(animations[0].state).toEqual('cancelled')
  expect(animations[0].elapsedTime).toBeLessThan(options.enterDuration)
  expect(animations[0].properties).toEqual(['opacity'])

  expect(animations[1].target).toEqual('child-2')
  expect(animations[1].state).toEqual('cancelled')
  expect(animations[1].elapsedTime).toBeLessThan(options.enterDuration)
  expect(animations[1].properties).toEqual(['opacity'])

  expect(animations[2].target).toEqual('root')
  expect(animations[2].state).toEqual('cancelled')
  expect(animations[2].elapsedTime).toBeLessThan(options.enterDuration)
  expect(animations[2].properties).toEqual(['opacity'])

  expect(animations[3].target).toEqual('child-1')
  expect(animations[3].state).toEqual('ended')
  expect(animations[3].elapsedTime).toBeLessThan(options.leaveDuration)
  expect(animations[3].properties).toEqual(['opacity'])

  expect(animations[4].target).toEqual('child-2')
  expect(animations[4].state).toEqual('ended')
  expect(animations[4].elapsedTime).toBeLessThan(options.leaveDuration)
  expect(animations[4].properties).toEqual(['opacity'])

  expect(animations[5].target).toEqual('root')
  expect(animations[5].state).toEqual('ended')
  expect(animations[5].elapsedTime).toBeLessThan(options.leaveDuration)
  expect(animations[5].properties).toEqual(['opacity'])
})
