import { type Page, type ElementHandle, type JSHandle } from '@playwright/test'

export interface Animation {
  id: string
  state: 'created' | 'started' | 'ended' | 'cancelled'
  target: ElementHandle
  properties: string[]
  elapsedTime: number
}

export interface WaitOptions {
  delayInMs?: number
}

export class Animations {
  private animations = new Map<string, Animation>()

  constructor(private page: Page) {}

  async startRecording() {
    await this.page.exposeBinding(
      '__update__',
      async (_, handle: JSHandle<Partial<Animation>>) => {
        let payload = await handle.jsonValue()
        payload.target = (await handle.getProperty('target')).asElement()
        await handle.dispose()

        let id = payload.id

        let animation = this.animations.get(id) ?? {
          id,
          state: 'created',
          target: null,
          properties: [],
          elapsedTime: 0,
        }

        this.animations.set(id, animation)

        animation.state = payload.state ?? animation.state
        animation.target = payload.target ?? animation.target
        animation.properties = payload.properties ?? animation.properties
        animation.elapsedTime = payload.elapsedTime ?? animation.elapsedTime
      },
      { handle: true }
    )

    await this.page.evaluate(() => {
      const map = new WeakMap<EventTarget, Record<string, string>>()
      const endedIds = new Set<string>()

      let latestAnimationId = 0

      function getAnimationId(event: TransitionEvent) {
        let records = map.get(event.target) ?? {}
        map.set(event.target, records)

        let hasEnded = event.type === 'transitionend' || event.type === 'transitioncancel'

        let key = `${event.propertyName}::${event.pseudoElement}`
        records[key] ??= `${++latestAnimationId}`

        if (endedIds.has(records[key])) {
          records[key] = `${++latestAnimationId}`
        } else if (hasEnded) {
          endedIds.add(records[key])
        }

        return records[key]
      }

      function update(event: TransitionEvent, state: Animation['state']) {
        window.__update__({
          id: getAnimationId(event),
          state,
          target: event.target as any,
          properties: [event.propertyName],
          elapsedTime: event.elapsedTime,
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

  [Symbol.iterator]() {
    return this.animations.values()
  }

  public at(index: number) {
    return Array.from(this.animations.values())[index]
  }

  private areRunning(animations: Animation[]) {
    return animations.some((animation) => this.isRunning(animation))
  }

  private isRunning(animation: Animation) {
    return animation.state === 'created' || animation.state === 'started'
  }

  get runningAnimations() {
    return Array.from(this.animations.values()).filter((animation) => this.isRunning(animation))
  }

  get anyRunning() {
    return this.runningAnimations.length > 0
  }

  get length() {
    return Array.from(this.animations.values()).length
  }
}

declare global {
  interface Window {
    __update__: (payload: Partial<Animation>) => void
  }
}
