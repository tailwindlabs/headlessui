/**
 * The `useDisposables` hook returns a `disposables` object that is disposed
 * when the component is unmounted.
 */
export declare function useDisposables(): {
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
