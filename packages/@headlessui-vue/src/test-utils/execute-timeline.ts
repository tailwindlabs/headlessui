import snapshotDiff from 'snapshot-diff'
import { defineComponent } from 'vue'
import { disposables } from '../utils/disposables'
import { reportChanges } from './report-dom-node-changes'
import { render } from './vue-testing-library'

function redentSnapshot(input: string) {
  let minSpaces = Infinity
  let lines = input.split('\n')
  for (let line of lines) {
    if (line.trim() === '---') continue
    let spacesInLine = (line.match(/^[+-](\s+)/g) || []).pop()!.length - 1
    minSpaces = Math.min(minSpaces, spacesInLine)
  }

  let replacer = new RegExp(`^([+-])\\s{${minSpaces}}(.*)`, 'g')

  return input
    .split('\n')
    .map((line) =>
      line.trim() === '---' ? line : line.replace(replacer, (_, sign, rest) => `${sign}  ${rest}`)
    )
    .join('\n')
}

export async function executeTimeline(
  element: ReturnType<typeof defineComponent>,
  steps: ((tools: ReturnType<typeof render>) => (null | number)[])[]
) {
  let d = disposables()
  let snapshots: { content: Node; recordedAt: bigint }[] = []

  //
  let tools = render(element)

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
  let timestamps: (null | number)[] = [null]

  //
  await steps.reduce(async (chain, step) => {
    await chain

    let durations = await step(tools)

    // Note: The following calls are just in place to ensure that **we** waited long enough for the
    // transitions to take place. This has no impact on the actual transitions. Above where the
    // `reportDOMNodeChanges` is used we will actually record all the changes, no matter what
    // happens here.

    timestamps.push(...durations)

    let totalDuration = durations
      .filter((duration): duration is number => duration !== null)
      .reduce((total, current) => total + current, 0)

    // Changes happen in the next frame
    await new Promise((resolve) => d.nextFrame(resolve))

    // We wait for the amount of the duration
    await new Promise((resolve) => d.setTimeout(resolve, totalDuration))

    // We wait an additional next frame so that we know that we are done
    await new Promise((resolve) => d.nextFrame(resolve))
  }, Promise.resolve())

  if (snapshots.length <= 0) {
    throw new Error('We could not record any changes')
  }

  let uniqueSnapshots = snapshots
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

  let diffed = uniqueSnapshots
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
      }\n${redentSnapshot(
        snapshotDiff(uniqueSnapshots[i - 1].content, call.content, {
          aAnnotation: '__REMOVE_ME__',
          bAnnotation: '__REMOVE_ME__',
          contextLines: 0,
        })
          // Just to do some cleanup
          .replace(/\n\n@@([^@@]*)@@/g, '') // Top level @@ signs
          .replace(/@@([^@@]*)@@/g, '---') // In between @@ signs
          .replace(/[-+] __REMOVE_ME__\n/g, '')
          .replace(/Snapshot Diff:\n/g, '')
      )
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')}`
    })
    .filter(Boolean)
    .join('\n\n')

  d.dispose()

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

let state: {
  before: number
  fps: number
  handle: ReturnType<typeof requestAnimationFrame> | null
} = {
  before: Date.now(),
  fps: 0,
  handle: null,
}

state.handle = requestAnimationFrame(function loop() {
  let now = Date.now()
  state.fps = Math.round(1000 / (now - state.before))
  state.before = now
  state.handle = requestAnimationFrame(loop)
})

afterAll(() => {
  if (state.handle) cancelAnimationFrame(state.handle)
})

function isWithinFrame(actual: number, expected: number) {
  let buffer = state.fps

  let min = expected - buffer
  let max = expected + buffer

  return actual >= min && actual <= max
}
