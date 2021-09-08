export declare let Keys: Record<string, Partial<KeyboardEvent>>;
export declare function shift(event: Partial<KeyboardEvent>): {
    shiftKey: boolean;
    altKey?: boolean | undefined;
    char?: string | undefined;
    charCode?: number | undefined;
    code?: string | undefined;
    ctrlKey?: boolean | undefined;
    isComposing?: boolean | undefined;
    key?: string | undefined;
    keyCode?: number | undefined;
    location?: number | undefined;
    metaKey?: boolean | undefined;
    repeat?: boolean | undefined;
    getModifierState?: ((keyArg: string) => boolean) | undefined;
    DOM_KEY_LOCATION_LEFT?: number | undefined;
    DOM_KEY_LOCATION_NUMPAD?: number | undefined;
    DOM_KEY_LOCATION_RIGHT?: number | undefined;
    DOM_KEY_LOCATION_STANDARD?: number | undefined;
    detail?: number | undefined;
    view?: Window | null | undefined;
    which?: number | undefined;
    bubbles?: boolean | undefined;
    cancelBubble?: boolean | undefined;
    cancelable?: boolean | undefined;
    composed?: boolean | undefined;
    currentTarget?: EventTarget | null | undefined;
    defaultPrevented?: boolean | undefined;
    eventPhase?: number | undefined;
    isTrusted?: boolean | undefined;
    returnValue?: boolean | undefined;
    srcElement?: EventTarget | null | undefined;
    target?: EventTarget | null | undefined;
    timeStamp?: number | undefined;
    type?: string | undefined;
    composedPath?: (() => EventTarget[]) | undefined;
    initEvent?: ((type: string, bubbles?: boolean | undefined, cancelable?: boolean | undefined) => void) | undefined;
    preventDefault?: (() => void) | undefined;
    stopImmediatePropagation?: (() => void) | undefined;
    stopPropagation?: (() => void) | undefined;
    AT_TARGET?: number | undefined;
    BUBBLING_PHASE?: number | undefined;
    CAPTURING_PHASE?: number | undefined;
    NONE?: number | undefined;
};
export declare function word(input: string): Partial<KeyboardEvent>[];
export declare function type(events: Partial<KeyboardEvent>[], element?: Element | null): Promise<void>;
export declare function press(event: Partial<KeyboardEvent>, element?: Element | null): Promise<void>;
export declare enum MouseButton {
    Left = 0,
    Right = 2
}
export declare function click(element: Document | Element | Window | null, button?: MouseButton): Promise<void>;
export declare function focus(element: Document | Element | Window | null): Promise<void>;
export declare function mouseEnter(element: Document | Element | Window | null): Promise<void>;
export declare function mouseMove(element: Document | Element | Window | null): Promise<void>;
export declare function mouseLeave(element: Document | Element | Window | null): Promise<void>;
