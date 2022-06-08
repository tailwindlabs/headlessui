import { AnimationEvent } from './animations'

interface TimelineFrame {
  headers: string[]
  body?: string

  events: AnimationEvent[]
}

export function renderTimeline(events: AnimationEvent[]) {
  let frames: TimelineFrame[] = []

  for (const [idx, event] of events.entries()) {
    let newEventFrame = eventToFrame(event, events[idx - 1], idx)

    if (newEventFrame.body === undefined) {
      let eventFrame = frames[frames.length - 1]
      eventFrame.headers.push(newEventFrame.headers[0])
      eventFrame.events.push(event)
    } else {
      frames.push(newEventFrame)
    }
  }

  return frames.map((frame) => `${frame.headers.join('\n')}\n${frame.body}`).join('\n\n')
}

function eventToFrame(
  event: AnimationEvent,
  prevEvent: AnimationEvent | undefined,
  idx: number
): TimelineFrame {
  let elapsed = prevEvent && prevEvent.state !== 'ended' ? event.time - prevEvent.time : 0n
  let elapsedMs = Number(elapsed / BigInt(1e6))
  let elapsedStr = elapsedMs === 0 ? '' : `+${elapsedMs}ms`

  return {
    headers: [`Event ${idx + 1} (${event.target} / ${event.state}): ${elapsedStr}`],
    body: event.snapshotDiff !== '' ? event.snapshotDiff : undefined,
    events: [event],
  }
}
