import { Reason, transition } from './transition'

import { reportChanges } from '../../../test-utils/report-dom-node-changes'
import { disposables } from '../../../utils/disposables'

beforeEach(() => {
  document.body.innerHTML = ''
})

it('should be possible to transition', async () => {
  const d = disposables()

  const snapshots: { content: string; recordedAt: bigint }[] = []
  const element = document.createElement('div')
  document.body.appendChild(element)

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      content => {
        snapshots.push({
          content,
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  await new Promise(resolve => {
    transition(element, ['enter'], ['enterFrom'], ['enterTo'], resolve)
  })

  await new Promise(resolve => d.nextFrame(resolve))

  // Initial render:
  expect(snapshots[0].content).toEqual('<div></div>')

  // Start of transition
  expect(snapshots[1].content).toEqual('<div class="enter enterFrom"></div>')

  // NOTE: There is no `enter enterTo`, because we didn't define a duration. Therefore it is not
  // necessary to put the classes on the element and immediatley remove them.

  // Cleanup phase
  expect(snapshots[2].content).toEqual('<div class=""></div>')

  await d.dispose()
})

it('should wait the correct amount of time to finish a transition', async () => {
  const d = disposables()

  const snapshots: { content: string; recordedAt: bigint }[] = []
  const element = document.createElement('div')
  document.body.appendChild(element)

  const duration = 20

  element.style.transitionDuration = `${duration}ms`

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      content => {
        snapshots.push({
          content,
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  const reason = await new Promise(resolve => {
    transition(element, ['enter'], ['enterFrom'], ['enterTo'], resolve)
  })

  await new Promise(resolve => d.nextFrame(resolve))
  expect(reason).toBe(Reason.Finished)

  // Initial render:
  expect(snapshots[0].content).toEqual(`<div style="transition-duration: ${duration}ms;"></div>`)

  // Start of transition
  expect(snapshots[1].content).toEqual(
    `<div style="transition-duration: ${duration}ms;" class="enter enterFrom"></div>`
  )

  expect(snapshots[2].content).toEqual(
    `<div style="transition-duration: ${duration}ms;" class="enter enterTo"></div>`
  )

  const estimatedDuration = Number(
    (snapshots[snapshots.length - 1].recordedAt - snapshots[snapshots.length - 2].recordedAt) /
      BigInt(1e6)
  )

  expect(estimatedDuration).toBeWithinRenderFrame(duration)

  // Cleanup phase
  expect(snapshots[3].content).toEqual(
    `<div style="transition-duration: ${duration}ms;" class=""></div>`
  )
})

it('should keep the delay time into account', async () => {
  const d = disposables()

  const snapshots: { content: string; recordedAt: bigint }[] = []
  const element = document.createElement('div')
  document.body.appendChild(element)

  const duration = 20
  const delayDuration = 100

  element.style.transitionDuration = `${duration}ms`
  element.style.transitionDelay = `${delayDuration}ms`

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      content => {
        snapshots.push({
          content,
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  const reason = await new Promise(resolve => {
    transition(element, ['enter'], ['enterFrom'], ['enterTo'], resolve)
  })

  await new Promise(resolve => d.nextFrame(resolve))
  expect(reason).toBe(Reason.Finished)

  const estimatedDuration = Number(
    (snapshots[snapshots.length - 1].recordedAt - snapshots[snapshots.length - 2].recordedAt) /
      BigInt(1e6)
  )

  expect(estimatedDuration).toBeWithinRenderFrame(duration + delayDuration)
})

it('should be possible to cancel a transition at any time', async () => {
  const d = disposables()

  const snapshots: {
    content: string
    recordedAt: bigint
    relativeTime: number
  }[] = []
  const element = document.createElement('div')
  document.body.appendChild(element)

  // This duration is so overkill, however it will demonstrate that we can cancel transitions.
  const duration = 5000

  element.style.transitionDuration = `${duration}ms`

  d.add(
    reportChanges(
      () => document.body.innerHTML,
      content => {
        const recordedAt = process.hrtime.bigint()
        const total = snapshots.length

        snapshots.push({
          content,
          recordedAt,
          relativeTime:
            total === 0 ? 0 : Number((recordedAt - snapshots[total - 1].recordedAt) / BigInt(1e6)),
        })
      }
    )
  )

  expect.assertions(2)

  // Setup the transition
  const cancel = transition(element, ['enter'], ['enterFrom'], ['enterTo'], reason => {
    expect(reason).toBe(Reason.Cancelled)
  })

  // Wait for a bit
  await new Promise(resolve => setTimeout(resolve, 20))

  // Cancel the transition
  cancel()
  await new Promise(resolve => d.nextFrame(resolve))

  expect(snapshots.map(snapshot => snapshot.content).join('\n')).not.toContain('enterTo')
})
