/**
 * The `useRefocusableInput` hook exposes a function to re-focus the input element.
 *
 * This hook will also keep the cursor position into account to make sure the
 * cursor is placed at the correct position as-if we didn't loose focus at all.
 */
export declare function useRefocusableInput(input: HTMLInputElement | null): () => void;
