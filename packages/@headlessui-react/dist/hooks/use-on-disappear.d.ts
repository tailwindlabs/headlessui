import { type MutableRefObject } from 'react';
/**
 * A hook to ensure that a callback is called when the element has disappeared
 * from the screen.
 *
 * This can happen if you use Tailwind classes like: `hidden md:block`, once the
 * viewport is smaller than `md` the element will disappear.
 */
export declare function useOnDisappear(enabled: boolean, ref: MutableRefObject<HTMLElement | null> | HTMLElement | null, cb: () => void): void;
