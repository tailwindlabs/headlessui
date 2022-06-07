import { type Page, type ElementHandle, type JSHandle } from '@playwright/test'

type AnimationState = 'created' | 'started' | 'ended' | 'cancelled'

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

export interface AnimationRecord {
  id: number
  state: AnimationState
  target: string | null
  properties: string[]
  elapsedTime: number
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

    await this.page.evaluate(() => {
      const map = new WeakMap<EventTarget, Record<string, number>>()
      const endedIds = new Set<number>()

      let latestAnimationId = 0

      let allocate = () => latestAnimationId++

      function getAnimationId(event: TransitionEvent) {
        let records = map.get(event.target) ?? {}
        map.set(event.target, records)

        let key = `${event.propertyName}::${event.pseudoElement}`
        records[key] ??= allocate()

        let hasEnded = event.type === 'transitionend' || event.type === 'transitioncancel'

        if (endedIds.has(records[key])) {
          records[key] = allocate()
        } else if (hasEnded) {
          endedIds.add(records[key])
        }

        return records[key]
      }

      function update(event: TransitionEvent, state: Animation['state']) {
        window.__update__({
          id: getAnimationId(event),
          state,
          target: (event.target as HTMLElement)?.dataset.testId ?? null,
          properties: [event.propertyName],
          elapsedTime: event.elapsedTime * 1000,
        })
      }

      document.addEventListener('transitionrun', (e) => update(e, 'created'), { capture: true })
      document.addEventListener('transitionstart', (e) => update(e, 'started'), { capture: true })
      document.addEventListener('transitioncancel', (e) => update(e, 'cancelled'), {
        capture: true,
      })
      document.addEventListener('transitionend', (e) => update(e, 'ended'), { capture: true })
    })
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

declare global {
  interface Window {
    __update__: (payload: AnimationRecord) => void
  }
}
