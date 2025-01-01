export type Disposables = ReturnType<typeof disposables>;
/**
 * Disposables are a way to manage event handlers and functions like
 * `setTimeout` and `requestAnimationFrame` that need to be cleaned up when they
 * are no longer needed.
 *
 *
 * When you register a disposable function, it is added to a collection of
 * disposables. Each disposable in the collection provides a `dispose` clean up
 * function that can be called when it's no longer needed. There is also a
 * `dispose` function on the collection itself that can be used to clean up all
 * pending disposables in that collection.
 */
export declare function disposables(): {
    addEventListener<TEventName extends keyof WindowEventMap>(element: HTMLElement | Window | Document, name: TEventName, listener: (event: WindowEventMap[TEventName]) => any, options?: boolean | AddEventListenerOptions): () => void;
    requestAnimationFrame(callback: FrameRequestCallback): () => void;
    nextFrame(callback: FrameRequestCallback): () => void;
    setTimeout(callback: (...args: any[]) => void, ms?: number | undefined, ...args: any[]): () => void;
    microTask(cb: () => void): () => void;
    style(node: HTMLElement, property: string, value: string): () => void;
    group(cb: (d: {
        addEventListener<TEventName extends keyof WindowEventMap>(element: HTMLElement | Window | Document, name: TEventName, listener: (event: WindowEventMap[TEventName]) => any, options?: boolean | AddEventListenerOptions): () => void;
        requestAnimationFrame(callback: FrameRequestCallback): () => void;
        nextFrame(callback: FrameRequestCallback): () => void;
        setTimeout(callback: (...args: any[]) => void, ms?: number | undefined, ...args: any[]): () => void;
        microTask(cb: () => void): () => void;
        style(node: HTMLElement, property: string, value: string): () => void;
        group(cb: (d: /*elided*/ any) => void): () => void;
        add(cb: () => void): () => void;
        dispose(): void;
    }) => void): () => void;
    add(cb: () => void): () => void;
    dispose(): void;
};
