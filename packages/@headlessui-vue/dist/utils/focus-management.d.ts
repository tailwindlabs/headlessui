export declare enum Focus {
    /** Focus the first non-disabled element */
    First = 1,
    /** Focus the previous non-disabled element */
    Previous = 2,
    /** Focus the next non-disabled element */
    Next = 4,
    /** Focus the last non-disabled element */
    Last = 8,
    /** Wrap tab around */
    WrapAround = 16,
    /** Prevent scrolling the focusable elements into view */
    NoScroll = 32
}
export declare enum FocusResult {
    Error = 0,
    Overflow = 1,
    Success = 2,
    Underflow = 3
}
export declare function getFocusableElements(container?: HTMLElement | null): HTMLElement[];
export declare enum FocusableMode {
    /** The element itself must be focusable. */
    Strict = 0,
    /** The element should be inside of a focusable element. */
    Loose = 1
}
export declare function isFocusableElement(element: HTMLElement, mode?: FocusableMode): boolean;
export declare function focusElement(element: HTMLElement | null): void;
export declare function focusIn(container: HTMLElement | HTMLElement[], focus: Focus): FocusResult;
