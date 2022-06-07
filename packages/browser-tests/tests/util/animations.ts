import { type Page } from '@playwright/test'
import { recordAnimations, AnimationState, AnimationRecord } from './scripts/recordAnimations'

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
}

export interface WaitOptions {
  delayInMs?: number
}

export class Animations extends Array<Animation> {
  page: Page
  events: AnimationEvent[]

  constructor(page: Page) {
    super()

    this.events = []

    // Just so it doesn't show in console.log
    Object.defineProperty(this, 'page', { value: page, enumerable: false })
  }

  async startRecording() {
    await this.page.exposeBinding('__update__', (_, record: AnimationRecord) => {
      let animation = (this[record.id] ??= {
        state: 'created',
        target: null,
        properties: [],
        elapsedTime: 0,

        events: [],
      })

      const event: AnimationEvent = {
        time: process.hrtime.bigint(),
        state: record.state,
        target: record.target,
      }

      this.events.push(event)
      animation.events.push(event)

      animation.state = record.state
      animation.target = animation.target ?? record.target
      animation.properties = record.properties
      animation.elapsedTime = record.elapsedTime
    })

    await this.page.evaluate(recordAnimations)
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
