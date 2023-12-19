export class FakePointer {
  private x: number = 0
  private y: number = 0

  constructor(
    private width: number,
    private height: number
  ) {
    this.width = width
    this.height = height
  }

  get options() {
    return {
      screenX: this.x,
      screenY: this.y,
    }
  }

  randomize() {
    this.x = Math.floor(Math.random() * this.width)
    this.y = Math.floor(Math.random() * this.height)
  }

  advance(amount: number = 1) {
    this.x += amount

    if (this.x >= this.width) {
      this.x %= this.width
      this.y++
    }

    if (this.y >= this.height) {
      this.y %= this.height
    }
  }

  /**
   * JSDOM does not support pointer events.
   * Because of this when we try to set the pointer position it returns undefined so our checks fail.
   *
   * This runs the callback with the TEST_IGNORE_TRACKED_POINTER environment variable set to 1 so we bypass the checks.
   */
  bypassingTrackingChecks(callback: () => void) {
    let original = process.env.TEST_BYPASS_TRACKED_POINTER
    process.env.TEST_BYPASS_TRACKED_POINTER = '1'
    callback()
    process.env.TEST_BYPASS_TRACKED_POINTER = original
  }
}

/**
 * A global pointer for use in pointer and mouse event checks
 */
export let pointer = new FakePointer(1920, 1080)
