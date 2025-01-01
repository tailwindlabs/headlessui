/**
 * Schedule some task in the next frame.
 *
 * - If you call the returned function multiple times, only the last task will
 *   be executed.
 * - If the component is unmounted, the task will be cancelled.
 */
export declare function useFrameDebounce(): (cb: () => void) => void;
