import { Animations, AnimationEvent } from './animations'

interface TimelineFrame {
  header: string
  body?: string

  events: AnimationEvent[]
}

interface TimelineEntry {
  target: string
  events: AnimationEvent[]
}

// : root\tchild-1\tchild-2
// - CS
// -    \tCS
// -               CS
// - E
// -      E
// -               E

export class Timeline {
  constructor(private animations: Animations) {
    //
  }

  *eventRows(): Iterable<string[]> {
    const events = this.animations.events

    const headers = Array.from(new Set(this.animations.map((a) => a.target)))
    const headerToCols = Object.fromEntries(Object.entries(headers).map((e) => e.reverse()))
    const maxColSize = Math.max(6, ...headers.map((h) => h.length))

    // Spit out headers early
    yield ['ANIM', ...headers.map((h) => h.padEnd(maxColSize)), 'Met Threshold?']

    // Spit out events
    const rowTemplate = Array.from({ length: headers.length }, () => '')

    const charForEvent = (event: AnimationEvent) => {
      switch (event.state) {
        case 'created':
          return 'C'
        case 'started':
          return 'S'
        case 'ended':
          return 'E'
        case 'cancelled':
          return 'X'
        default:
          return '?'
      }
    }

    let currentRow
    let outputRow = () => currentRow.map((h) => h.padEnd(maxColSize))

    for (const [idx, event] of events.entries()) {
      const lastEvent = events[idx - 1]
      const colIdx = parseInt(headerToCols[event.target]) + 1
      const sharedWithLastEvent = lastEvent && event.target === lastEvent.target
      const lastEventWasTerminating =
        lastEvent && (lastEvent.state === 'ended' || lastEvent.state === 'cancelled')

      if ((!sharedWithLastEvent && idx !== 0) || lastEventWasTerminating) {
        yield outputRow()
      }

      if (!sharedWithLastEvent || lastEventWasTerminating) {
        currentRow = [`${event.animation.id}`, ...rowTemplate, '']
      }

      currentRow[colIdx] ??= ''
      currentRow[colIdx] += charForEvent(event)

      if (event.state === 'ended' || event.state === 'cancelled') {
        currentRow[currentRow.length - 1] = `${event.elapsedTime}ms`
      }
    }

    yield outputRow()
  }

  get eventStream(): string {
    return Array.from(this.eventRows())
      .map((row) => row.join('\t'))
      .join('\n')
  }

  private get snapshots() {
    let header = `=============`

    let frames: TimelineFrame[] = []

    for (const event of this.animations.events) {
      let currentFrame = event.snapshotDiff === '' ? frames[frames.length - 1] : undefined

      if (currentFrame === undefined) {
        currentFrame = {
          header,
          body: event.snapshotDiff,
          events: [],
        }

        frames.push(currentFrame)
      }

      currentFrame.events.push(event)
    }

    return frames
      .map(
        (frame) =>
          `${frame.header} (${this.toRanges(frame.events.map((e) => e.id))})\n\n${frame.body}`
      )
      .join('\n\n')
  }

  /**
   * The animation timeline is represented by a few key blocks of information:
   * - The event stream: A list of which events ocurred in the animation and in which order
   * - The snapshots: A representation of the DOM at the end of each "frame" of animation and which events it applies to
   *
   * @returns
   */
  toString() {
    return `Event Timeline:\n${this.eventStream}\n\nSnapshots:\n${this.snapshots}`
  }

  private toRanges(nums: Iterable<number>): string {
    let ranges: number[][] = []
    let current: number[] = []

    for (const num of nums) {
      if (current[1] === undefined) {
        ranges.push((current = [num, num]))
        continue
      }

      if (Math.abs(current[1] - num) === 1) {
        current[1] = num
        continue
      } else {
        ranges.push((current = [num, num]))
      }
    }

    return ranges.map((range) => (range[0] !== range[1] ? range.join('-') : range[0])).join(', ')
  }
}
