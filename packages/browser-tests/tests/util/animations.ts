import { type Page } from '@playwright/test'
import { AnimationState, AnimationRecord } from './scripts/recordAnimations'
import { Snapshot } from './snapshots'

export interface Animation {
  state: AnimationState
  target: string | null
  properties: string[]
  elapsedTime: number

  events: AnimationEvent[]
}

export interface AnimationEvent {
  time: bigint
  state: AnimationState
  target: string | null
  snapshot: Snapshot
  snapshotDiff: string
}

export interface WaitOptions {
  delayInMs?: number
}

export class Animations extends Array<Animation> {
  page: Page
  events: AnimationEvent[]
  lastSnapshot: Snapshot | undefined

  constructor(page: Page) {
    super()

    this.events = []

    // Just so these don't show in console.log
    Object.defineProperty(this, 'page', { value: page, enumerable: false })
    Object.defineProperty(this, 'lastSnapshot', { value: undefined, enumerable: false })
  }

  async startRecording() {
    this.lastSnapshot = await Snapshot.take(this.page.locator('html'), 'mutation')

    await this.page.exposeBinding(
      '__record_animation_record__',
      async ({ page }, record: AnimationRecord) => {
        let animation = (this[record.id] ??= {
          state: 'created',
          target: null,
          properties: [],
          elapsedTime: 0,

          events: [],
        })

        const snapshot = Snapshot.fromTree(record.tree, 'animation')

        const event: AnimationEvent = {
          time: process.hrtime.bigint(),
          state: record.state,
          target: record.target,
          snapshot: snapshot,
          snapshotDiff: snapshot.diffWithPrevious(this.lastSnapshot),
        }

        this.lastSnapshot = snapshot

        this.events.push(event)
        animation.events.push(event)

        animation.state = record.state
        animation.target = animation.target ?? record.target
        animation.properties = record.properties
        animation.elapsedTime = record.elapsedTime
      }
    )

    await this.page.evaluate(() => window.__record_animations__())
  }

  public async wait({ delayInMs = 10 }: WaitOptions = {}): Promise<void> {
    await this.waitForStart({ delayInMs })
    await this.waitForFinish({ delayInMs })
  }

  public async waitForStart({ delayInMs = 10 }: WaitOptions = {}): Promise<void> {
    let previousCount = this.length

    while (this.length === previousCount) {
      await new Promise((resolve) => setTimeout(resolve, delayInMs))
    }
  }

  public async waitForFinish({ delayInMs = 10 }: WaitOptions = {}): Promise<void> {
    let animations = this.runningAnimations

    let areRunning = () => this.areRunning(animations)

    while (areRunning()) {
      await new Promise((resolve) => setTimeout(resolve, delayInMs))
    }
  }

  get timeline(): string {
    return this.events
      .filter((event) => event.snapshotDiff !== '')
      .map((event, idx, events) => this.renderTimelineEvent(event, events[idx - 1], idx))
      .join('\n\n')
  }

  private renderTimelineEvent(
    event: AnimationEvent,
    prevEvent: AnimationEvent | undefined,
    idx: number
  ): string {
    let elapsed = prevEvent && prevEvent.state !== 'ended' ? event.time - prevEvent.time : 0n
    let elapsedMs = Number(elapsed / BigInt(1e6))
    let elapsedStr = elapsedMs === 0 ? '' : `+${elapsedMs}ms`

    return `Event ${idx + 1} (${event.target} / ${event.state}): ${elapsedStr}\n${
      event.snapshotDiff
    }`
  }

  private areRunning(animations: Animation[]) {
    return animations.some((animation) => this.isRunning(animation))
  }

  private isRunning(animation: Animation) {
    return animation.state === 'created' || animation.state === 'started'
  }

  get runningAnimations() {
    return this.filter((animation) => this.isRunning(animation))
  }

  get anyRunning() {
    return this.runningAnimations.length > 0
  }
}
