export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRenderFrame(actual: number): R
    }
  }
}
