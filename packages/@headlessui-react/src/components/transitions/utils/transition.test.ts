import { reportChanges } from '../../../test-utils/report-dom-node-changes'
import { disposables } from '../../../utils/disposables'
import { transition } from './transition'

beforeEach(() => {
  document.body.innerHTML = ''
})

it('should be possible to transition', async () => {
  let d = disposables()

  let snapshots: { content: string; recordedAt: bigint }[] = []
  let element = document.createElement('div')
  document.body.appendChild(element)

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      (content) => {
        snapshots.push({
          content,
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  await new Promise<void>((resolve) => {
    transition(
      element,
      {
        base: [],
        enter: ['enter'],
        enterFrom: ['enterFrom'],
        enterTo: ['enterTo'],
        leave: [],
        leaveFrom: [],
        leaveTo: [],
        entered: ['entered'],
      },
      true, // Show
      resolve
    )
  })

  await new Promise((resolve) => d.nextFrame(resolve))

  // Initial render:
  expect(snapshots[0].content).toEqual('<div></div>')

  // Start of transition
  expect(snapshots[1].content).toEqual('<div class="enter enterFrom"></div>')

  // NOTE: There is no `enter enterTo`, because we didn't define a duration. Therefore it is not
  // necessary to put the classes on the element and immediately remove them.

  // Cleanup phase
  expect(snapshots[2].content).toEqual('<div class="enterTo entered"></div>')

  d.dispose()
})

it('should wait the correct amount of time to finish a transition', async () => {
  let d = disposables()

  let snapshots: { content: string; recordedAt: bigint }[] = []
  let element = document.createElement('div')
  document.body.appendChild(element)

  let duration = 20

  element.style.transitionDuration = `${duration}ms`

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      (content) => {
        snapshots.push({
          content,
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  await new Promise<void>((resolve) => {
    transition(
      element,
      {
        base: [],
        enter: ['enter'],
        enterFrom: ['enterFrom'],
        enterTo: ['enterTo'],
        leave: [],
        leaveFrom: [],
        leaveTo: [],
        entered: ['entered'],
      },
      true, // Show
      resolve
    )
  })

  await new Promise((resolve) => d.nextFrame(resolve))

  // Initial render:
  expect(snapshots[0].content).toEqual(`<div style="transition-duration: ${duration}ms;"></div>`)

  // Start of transition
  expect(snapshots[1].content).toEqual(
    `<div style="transition-duration: ${duration}ms;" class="enter enterFrom"></div>`
  )

  expect(snapshots[2].content).toEqual(
    `<div style="transition-duration: ${duration}ms;" class="enter enterTo"></div>`
  )

  let estimatedDuration = Number(
    (snapshots[snapshots.length - 1].recordedAt - snapshots[snapshots.length - 2].recordedAt) /
      BigInt(1e6)
  )

  expect(estimatedDuration).toBeWithinRenderFrame(duration)

  // Cleanup phase
  expect(snapshots[3].content).toEqual(
    `<div style="transition-duration: ${duration}ms;" class="enterTo entered"></div>`
  )
})

it('should keep the delay time into account', async () => {
  let d = disposables()

  let snapshots: { content: string; recordedAt: bigint }[] = []
  let element = document.createElement('div')
  document.body.appendChild(element)

  let duration = 20
  let delayDuration = 100

  element.style.transitionDuration = `${duration}ms`
  element.style.transitionDelay = `${delayDuration}ms`

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      (content) => {
        snapshots.push({
          content,
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  await new Promise<void>((resolve) => {
    transition(
      element,
      {
        base: [],
        enter: ['enter'],
        enterFrom: ['enterFrom'],
        enterTo: ['enterTo'],
        leave: [],
        leaveFrom: [],
        leaveTo: [],
        entered: ['entered'],
      },
      true, // Show
      resolve
    )
  })

  await new Promise((resolve) => d.nextFrame(resolve))

  let estimatedDuration = Number(
    (snapshots[snapshots.length - 1].recordedAt - snapshots[snapshots.length - 2].recordedAt) /
      BigInt(1e6)
  )

  expect(estimatedDuration).toBeWithinRenderFrame(duration + delayDuration)
})
