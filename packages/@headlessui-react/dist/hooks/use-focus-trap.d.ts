import { MutableRefObject } from 'react';
export declare enum Features {
    /** No features enabled for the `useFocusTrap` hook. */
    None = 1,
    /** Ensure that we move focus initially into the container. */
    InitialFocus = 2,
    /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
    TabLock = 4,
    /** Ensure that programmatically moving focus outside of the container is disallowed. */
    FocusLock = 8,
    /** Ensure that we restore the focus when unmounting the component that uses this `useFocusTrap` hook. */
    RestoreFocus = 16,
    /** Enable all features. */
    All = 30
}
export declare function useFocusTrap(container: MutableRefObject<HTMLElement | null>, features?: Features, { initialFocus, containers, }?: {
    initialFocus?: MutableRefObject<HTMLElement | null>;
    containers?: MutableRefObject<Set<MutableRefObject<HTMLElement | null>>>;
}): void;
