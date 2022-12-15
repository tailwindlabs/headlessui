type RenderEnv = 'client' | 'server'
type HandoffState = 'pending' | 'complete'

class Env {
  current: RenderEnv = this.detect()
  handoffState: HandoffState = 'pending'
  currentId = 0

  set(env: RenderEnv): void {
    if (this.current === env) return

    this.handoffState = 'pending'
    this.currentId = 0
    this.current = env
  }

  reset(): void {
    this.set(this.detect())
  }

  nextId() {
    return ++this.currentId
  }

  get isServer(): boolean {
    return this.current === 'server'
  }

  get isClient(): boolean {
    return this.current === 'client'
  }

  private detect(): RenderEnv {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 'server'
    }

    return 'client'
  }

  handoff(): void {
    if (this.handoffState === 'pending') {
      this.handoffState = 'complete'
    }
  }

  get isHandoffComplete(): boolean {
    return this.handoffState === 'complete'
  }
}

export let env = new Env()
