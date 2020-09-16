import snapshotDiff from 'snapshot-diff'
import { render } from '@testing-library/react'

import { disposables } from '../utils/disposables'
import { reportChanges } from './report-dom-node-changes'

export async function executeTimeline(
  element: JSX.Element,
  steps: ((tools: ReturnType<typeof render>) => (null | number)[])[]
) {
  const d = disposables()
  const snapshots: { content: DocumentFragment; recordedAt: bigint }[] = []

  //
  const tools = render(element)

  // Start listening for changes
  d.add(
    reportChanges(
      () => document.body.innerHTML,
      () => {
        // This will ensure that any DOM change to the body has been recorded.
        snapshots.push({
          content: tools.asFragment(),
          recordedAt: process.hrtime.bigint(),
        })
      }
    )
  )

  // We start with a `null` value because we will start with a snapshot even _before_ things start
  // happening.
  const timestamps: (null | number)[] = [null]

  //
  await steps.reduce(async (chain, step) => {
    await chain

    const durations = step(tools)

    // Note: The following calls are just in place to ensure that **we** waited long enough for the
    // transitions to take place. This has no impact on the actual transitions. Above where the
    // `reportDOMNodeChanges` is used we will actually record all the changes, no matter what
    // happens here.

    timestamps.push(...durations)

    const totalDuration = durations
      .filter((duration): duration is number => duration !== null)
      .reduce((total, current) => total + current, 0)

    // Changes happen in the next frame
    await new Promise(resolve => d.nextFrame(resolve))

    // We wait for the amount of the duration
    await new Promise(resolve => d.setTimeout(resolve, totalDuration))

    // We wait an additional next frame so that we know that we are done
    await new Promise(resolve => d.nextFrame(resolve))
  }, Promise.resolve())

  if (snapshots.length <= 0) {
    throw new Error('We could not record any changes')
  }

  const uniqueSnapshots = snapshots
    // Only keep the snapshots that are unique. Multiple snapshots of the same
    // content are a bit useless for us.
    .filter((snapshot, i) => {
      if (i === 0) return true
      return snapshot.content !== snapshots[i - 1].content
    })

    // Add a relative time compaired to the previous snapshot. We recorded everything in
    // process.hrtime.bigint() which is in nanoseconds, we want it in milliseconds.
    .map((snapshot, i, all) => ({
      ...snapshot,
      relativeToPreviousSnapshot:
        i === 0 ? 0 : Number((snapshot.recordedAt - all[i - 1].recordedAt) / BigInt(1e6)),
    }))

  const diffed = uniqueSnapshots
    .map((call, i) => {
      // Skip initial render, because there is nothing to compare with
      if (i === 0) return false

      // The next bit of code is a bit ugly, but mos of the code is just cleaning up some "noise"
      // that we don't need in our test output.
      return `Render ${i}:${
        // `This took: ${call.relativeTime}ms`
        timestamps[i] === null
          ? ''
          : ` Transition took at least ${timestamps[i]}ms (${
              isWithinFrame(call.relativeToPreviousSnapshot, timestamps[i]!)
                ? 'yes'
                : `no, it took ${call.relativeToPreviousSnapshot}ms`
            })`
      }\n${snapshotDiff(uniqueSnapshots[i - 1].content, call.content, {
        aAnnotation: '__REMOVE_ME__',
        bAnnotation: '__REMOVE_ME__',
        contextLines: 0,
      })
        // Just to do some cleanup
        .replace(/\n\n@@([^@@]*)@@/g, '') // Top level @@ signs
        .replace(/@@([^@@]*)@@/g, '---') // In between @@ signs
        .replace(/[-+] __REMOVE_ME__\n/g, '')
        .replace(/Snapshot Diff:\n/g, '')
        .split('\n')
        .map(line => `    ${line}`)
        .join('\n')}`
    })
    .filter(Boolean)
    .join('\n\n')

  await d.dispose()

  return diffed
}

executeTimeline.fullTransition = (duration: number) => {
  return [
    /** Stage 1: Immediately add `base` and `from` classes */
    null,

    /** Stage 2: Immediately remove `from` classes and add `to` classes */
    null,

    /** Stage 3: After duration remove `to` and `base` classes */
    duration,
  ]
}

// Assuming that we run at 60 frames per second
const frame = 1000 / 60

function isWithinFrame(actual: number, expected: number, frames = 2) {
  const buffer = frame * frames

  const min = expected - buffer
  const max = expected + buffer

  return actual >= min && actual <= max
}
