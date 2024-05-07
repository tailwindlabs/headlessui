import { useDisposables } from './use-disposables'

/**
 * Schedule some task in the next frame.
 *
 * - If you call the returned function multiple times, only the last task will
 *   be executed.
 * - If the component is unmounted, the task will be cancelled.
 */
export function useFrameDebounce() {
  let d = useDisposables()

  return (cb: () => void) => {
    d.dispose()
    d.nextFrame(cb)
  }
}
