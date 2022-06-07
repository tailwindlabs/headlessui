import { type Page, type ElementHandle, type JSHandle } from '@playwright/test'

export interface Animation {
  id: number
  state: 'created' | 'started' | 'ended' | 'cancelled'
  target: ElementHandle
  properties: string[]
  elapsedTime: number
}

export interface WaitOptions {
  delayInMs?: number
}

export class Animations extends Array<Animation> {
  constructor(private page: Page) {
    super()
  }

  async startRecording() {
    await this.page.exposeBinding(
      '__update__',
      async (_, handle: JSHandle<Animation>) => {
        let payload = await handle.jsonValue()
        payload.target = (await handle.getProperty('target')).asElement()
        await handle.dispose()

        let animation = (this[payload.id] ??= {
          id: payload.id,
          state: 'created',
          target: null,
          properties: [],
          elapsedTime: 0,
        })

        animation.state = payload.state
        animation.target = payload.target
        animation.elapsedTime = payload.elapsedTime
        animation.properties = payload.properties
      },
      { handle: true }
    )

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
          target: event.target as any,
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
    __update__: (payload: Partial<Animation>) => void
  }
}
